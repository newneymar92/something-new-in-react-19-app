# Trang `/use-transition` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm route `/use-transition` với 3 ví dụ chạy thật (ô tìm kiếm, chuyển tab nặng, transition async của React 19), checklist và phần chốt lại, nối từ trang React Compiler sang.

**Architecture:** Trang theo đúng khuôn `UseOptimisticPage`: `PageHeader` → hàng mở đầu → các `DemoCard` (code bên trái đọc từ file thật qua `?raw` + `extractRegion`, kết quả chạy thật bên phải) → checklist `codeOnly` → "Chốt lại". Độ nặng nằm trong `SlowList` gồm nhiều `SlowItem` nhỏ (~0,5ms/item) để React ngắt được giữa các component. Độ trễ phím đo bằng `LatencyInput` ghi thẳng vào DOM.

**Tech Stack:** React 19.2 + React Compiler (babel-plugin-react-compiler, bật toàn app), antd 6, react-router-dom 7, Vite 8, TypeScript 6. Không có test runner — kiểm chứng bằng `tsc -b`, `eslint`, `npm run smoke` (renderToString mọi route) và output thật của React Compiler.

**Spec:** `docs/superpowers/specs/2026-09-14-use-transition-page-design.md`

## Global Constraints

- Toàn bộ nội dung hiển thị viết bằng tiếng Việt, giọng văn như các trang hiện có.
- File mới trong `src/pages/transition/` dùng dấu nháy đơn, không dấu chấm phẩy (giống `src/pages/optimistic/`). `src/pages/HomePage.tsx` giữ dấu nháy kép + dấu chấm phẩy như file đang dùng.
- Code hiển thị trên trang phải là code đang chạy: bọc bằng `// #region demo` … `// #endregion`, đọc qua `import raw from './X.tsx?raw'` + `extractRegion(raw, 'demo')` hoặc `stripImports(raw)` (`src/lib/source.ts`).
- Không dùng `useDeferredValue` ở bất kỳ đâu.
- Không bọc `memo` thủ công — dựa vào React Compiler đang bật trong `vite.config.ts`.
- App không bọc `<StrictMode>` (cố ý, xem `src/main.tsx`) — không thêm vào.
- Không chạy `git add` / `git commit`.

## Lệnh kiểm chứng dùng chung

Các task dưới đây dùng lại những lệnh này (chạy từ thư mục gốc repo):

```bash
# Typecheck toàn project
npx tsc -b

# Lint một hoặc nhiều file
npx eslint <file> [<file> ...]

# Xem output thật của React Compiler cho một file (panicThreshold all_errors: compiler
# bỏ qua component nào là báo lỗi ngay)
node -e "
const babel = require('@babel/core');
const fs = require('fs');
const file = process.argv[1];
const { code } = babel.transformSync(fs.readFileSync(file, 'utf8'), {
  filename: file, babelrc: false, configFile: false,
  parserOpts: { plugins: ['jsx', 'typescript'] },
  plugins: [['babel-plugin-react-compiler', { target: '19', panicThreshold: 'all_errors' }]],
});
console.log(code);
" <file>
```

---

### Task 1: Khối dùng chung `SlowList` + `LatencyInput`

**Files:**
- Create: `src/pages/transition/demos/SlowList.tsx`
- Create: `src/pages/transition/demos/LatencyInput.tsx`

**Interfaces:**
- Consumes: `PRODUCTS: Product[]`, `formatVnd(value: number): string` từ `src/lib/expensive.ts`.
- Produces:
  - `export default function SlowList(props: { query: string; limit: number }): JSX.Element`
  - `export default function LatencyInput(props: { value: string; onChange: (value: string) => void; placeholder?: string }): JSX.Element`

- [ ] **Step 1: Kiểm tra hằng số độ nặng bằng benchmark**

Run:
```bash
node -e "
function work(name, query) { let s = 0; for (let i = 0; i < 700000; i++) s += Math.sqrt((i * name.length + query.length) % 97); return s; }
for (let w = 0; w < 3; w++) for (let id = 0; id < 200; id++) work('Dell Laptop ' + id, 'de');
const xs = [];
for (let r = 0; r < 5; r++) { const t = performance.now(); for (let id = 0; id < 200; id++) work('Dell Laptop ' + id, 'de'); xs.push(performance.now() - t); }
xs.sort((a, b) => a - b);
console.log('200 item:', xs[2].toFixed(0), 'ms');
"
```
Expected: khoảng 80–130 ms. Nếu nằm ngoài khoảng này, chỉnh `700000` theo tỉ lệ (vd ra 50ms → dùng 1_400_000) và dùng số đó cho `LOOPS_PER_ITEM` ở Step 2.

- [ ] **Step 2: Tạo `SlowList.tsx`**

```tsx
import { PRODUCTS, formatVnd } from '../../../lib/expensive'

/**
 * Số vòng lặp "vô nghĩa" cho MỖI sản phẩm: 700_000 ≈ 0,5ms trên máy dev
 * → 200 item ≈ 100ms, 1000 item ≈ 500ms. Trình diễn trên máy khác thì chỉnh số này.
 */
const LOOPS_PER_ITEM = 700_000

/**
 * Tách tên sản phẩm quanh đoạn khớp từ khoá, kèm vòng lặp giả lập một thuật toán so khớp tốn
 * CPU. Kết quả phụ thuộc cả `name` lẫn `query` → đổi từ khoá là mọi item phải tính lại,
 * React Compiler không bỏ qua được.
 */
function highlightMatch(name: string, query: string) {
  let noise = 0
  for (let i = 0; i < LOOPS_PER_ITEM; i++) {
    noise += Math.sqrt((i * name.length + query.length) % 97)
  }

  const q = query.trim().toLowerCase()
  const at = noise > 0 && q ? name.toLowerCase().indexOf(q) : -1
  if (at === -1) return { before: name, match: '', after: '' }
  return {
    before: name.slice(0, at),
    match: name.slice(at, at + q.length),
    after: name.slice(at + q.length),
  }
}

function SlowItem({ name, price, query }: { name: string; price: number; query: string }) {
  const { before, match, after } = highlightMatch(name, query)

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13 }}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {before}
        <mark
          style={{
            background: 'color-mix(in srgb, var(--warning) 35%, transparent)',
            color: 'inherit',
            padding: 0,
          }}
        >
          {match}
        </mark>
        {after}
      </span>
      <span className="mono dim" style={{ flex: 'none' }}>
        {formatVnd(price)}
      </span>
    </div>
  )
}

/**
 * Danh sách "nặng" dùng chung cho các demo useTransition.
 * Độ chậm nằm rải trong NHIỀU component nhỏ (mỗi SlowItem ~0,5ms) — nhờ vậy React có chỗ để
 * tạm dừng giữa các item khi render trong transition. Dồn cả vào một hàm chạy 100ms thì React
 * không ngắt được.
 */
export default function SlowList({ query, limit }: { query: string; limit: number }) {
  const q = query.trim().toLowerCase()
  const matches = PRODUCTS.filter((p) => p.name.toLowerCase().includes(q))
  const items = matches.slice(0, limit)

  return (
    <div className="panel-box" style={{ padding: 12 }}>
      <div className="dim" style={{ fontSize: 12.5, marginBottom: 8 }}>
        {matches.length} sản phẩm khớp — hiển thị {items.length}
      </div>
      <div style={{ display: 'grid', gap: 4, maxHeight: 260, overflowY: 'auto' }}>
        {items.length === 0 && <i className="dim">Không có sản phẩm nào khớp</i>}
        {items.map((p) => (
          <SlowItem key={p.id} name={p.name} price={p.price} query={query} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Tạo `LatencyInput.tsx`**

```tsx
import { useLayoutEffect, useRef } from 'react'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

type LatencyInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * Ô nhập kèm đồng hồ "độ trễ phím": từ lúc trình duyệt tạo sự kiện gõ phím (`e.timeStamp` —
 * tính cả thời gian sự kiện phải xếp hàng khi main thread bận) tới lúc React commit giá trị mới
 * vào ô nhập. Con số được ghi thẳng vào DOM nên việc đo không gây thêm lần render nào.
 */
export default function LatencyInput({ value, onChange, placeholder }: LatencyInputProps) {
  /** Mốc thời gian của phím SỚM NHẤT chưa được hiển thị lên ô nhập */
  const pendingSince = useRef<number | null>(null)
  const outputRef = useRef<HTMLSpanElement>(null)

  // Không truyền deps: chạy sau mọi lần commit của ô nhập
  useLayoutEffect(() => {
    const since = pendingSince.current
    if (since === null || !outputRef.current) return
    outputRef.current.textContent = `${Math.round(performance.now() - since)} ms`
    pendingSince.current = null
  })

  return (
    <Input
      prefix={<SearchOutlined />}
      value={value}
      placeholder={placeholder}
      onChange={(e) => {
        if (pendingSince.current === null) pendingSince.current = e.timeStamp
        onChange(e.target.value)
      }}
      // suffix luôn có mặt: antd remount ô nhập (mất focus) nếu suffix bật/tắt
      suffix={
        <span ref={outputRef} className="mono dim" style={{ fontSize: 12 }}>
          — ms
        </span>
      }
    />
  )
}
```

- [ ] **Step 4: Lint + typecheck**

Run: `npx eslint src/pages/transition/demos/SlowList.tsx src/pages/transition/demos/LatencyInput.tsx && npx tsc -b`
Expected: không có output lỗi, exit 0.

- [ ] **Step 5: Xác nhận output compiler**

Run lệnh "Xem output thật của React Compiler" với `src/pages/transition/demos/SlowList.tsx`, lọc: `| grep -n "highlightMatch(name, query)" -B1`
Expected: không có lỗi compiler; dòng ngay trước lời gọi là `if ($[0] !== name || $[1] !== query) {` (phần tính nặng phụ thuộc cả `query`).

Leave the changes uncommitted. Do not run `git add` or `git commit`.

---

### Task 2: Ví dụ 1 — `SearchDemo`

**Files:**
- Create: `src/pages/transition/demos/SearchDemo.tsx`

**Interfaces:**
- Consumes: `SlowList({ query, limit })`, `LatencyInput({ value, onChange, placeholder })` từ Task 1.
- Produces: `export default function SearchDemo(): JSX.Element`; region `demo` chứa `SearchBlocking` và `SearchWithTransition`.

- [ ] **Step 1: Tạo `SearchDemo.tsx`**

```tsx
import { useState, useTransition } from 'react'
import { Alert } from 'antd'

import LatencyInput from './LatencyInput'
import SlowList from './SlowList'

// #region demo
/** ❌ Một state lo cả hai việc: mỗi phím phải chờ 200 sản phẩm render xong mới hiện chữ */
function SearchBlocking() {
  const [query, setQuery] = useState('')

  return (
    <>
      <LatencyInput value={query} onChange={setQuery} placeholder="Gõ tên hãng, vd: Dell" />
      <SlowList query={query} limit={200} />
    </>
  )
}

/** ✅ Tách làm hai state: ô nhập cập nhật gấp, danh sách cập nhật "không gấp" */
function SearchWithTransition() {
  const [text, setText] = useState('')
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleChange(value: string) {
    setText(value) // gấp: ô nhập hiện chữ ngay
    startTransition(() => setQuery(value)) // không gấp: React được hoãn và ngắt giữa chừng
  }

  return (
    <>
      <LatencyInput value={text} onChange={handleChange} placeholder="Gõ tên hãng, vd: Dell" />
      <div style={{ opacity: isPending ? 0.5 : 1, transition: 'opacity 0.15s' }}>
        <SlowList query={query} limit={200} />
      </div>
    </>
  )
}
// #endregion

export default function SearchDemo() {
  return (
    <div>
      <div
        style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}
      >
        <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
          <b style={{ color: 'var(--danger)' }}>❌ Không transition</b>
          <SearchBlocking />
        </div>
        <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
          <b style={{ color: 'var(--success)' }}>✅ Có useTransition</b>
          <SearchWithTransition />
        </div>
      </div>

      <Alert
        style={{ marginTop: 16 }}
        type="info"
        showIcon
        title="Cách diễn cho khán giả"
        description={
          <span className="dim">
            Gõ nhanh tên một hãng (vd &quot;Dell&quot;, &quot;Asus&quot;) vào ô bên trái: chữ hiện
            ra bị khựng, đồng hồ trong ô nhập nhảy lên cỡ 100ms trở lên. Làm y hệt ở ô bên phải: chữ
            hiện ngay, độ trễ chỉ vài ms — danh sách mờ đi một nhịp rồi mới cập nhật.
          </span>
        }
      />
    </div>
  )
}
```

- [ ] **Step 2: Lint + typecheck**

Run: `npx eslint src/pages/transition/demos/SearchDemo.tsx && npx tsc -b`
Expected: exit 0, không lỗi.

- [ ] **Step 3: Xác nhận `<SlowList>` bên phải được cache theo `query`**

Run lệnh "Xem output thật của React Compiler" với `src/pages/transition/demos/SearchDemo.tsx`, lọc: `| grep -n "<SlowList query={query}" -B1`
Expected: có 2 kết quả; kết quả thuộc `SearchWithTransition` có dòng trước là `if ($[N] !== query) {` (không phụ thuộc `text` → lần render gấp bỏ qua SlowList). Không có lỗi compiler.

Leave the changes uncommitted. Do not run `git add` or `git commit`.

---

### Task 3: Ví dụ 2 — `TabsDemo`

**Files:**
- Create: `src/pages/transition/demos/TabsDemo.tsx`

**Interfaces:**
- Consumes: `SlowList({ query, limit })` từ Task 1.
- Produces: `export default function TabsDemo(): JSX.Element`; region `demo` chứa `TabsBlocking` và `TabsWithTransition`.

- [ ] **Step 1: Tạo `TabsDemo.tsx`**

```tsx
import { useState, useTransition } from 'react'
import { Alert, Segmented, Space, Tag } from 'antd'

import SlowList from './SlowList'

type TabKey = 'about' | 'products' | 'contact'

const TAB_OPTIONS: { label: string; value: TabKey }[] = [
  { label: 'Giới thiệu', value: 'about' },
  { label: 'Sản phẩm (nặng)', value: 'products' },
  { label: 'Liên hệ', value: 'contact' },
]

function TabPanel({ tab }: { tab: TabKey }) {
  if (tab === 'products') return <SlowList query="" limit={1000} />

  return (
    <div className="panel-box dim" style={{ padding: 12, fontSize: 13.5, lineHeight: 1.7 }}>
      {tab === 'about'
        ? 'Cửa hàng linh kiện máy tính — tab nhẹ, render tức thì.'
        : 'Hotline 1900 1234 · Mở cửa 8:00–21:00 — tab nhẹ, render tức thì.'}
    </div>
  )
}

// #region demo
/** ❌ Đổi tab ngay: bấm "Sản phẩm" là cả trang đứng hình tới khi 1000 item render xong */
function TabsBlocking() {
  const [tab, setTab] = useState<TabKey>('about')

  return (
    <>
      <Segmented value={tab} options={TAB_OPTIONS} onChange={setTab} />
      <TabPanel tab={tab} />
    </>
  )
}

/** ✅ Đổi tab trong transition: lúc "Sản phẩm" đang render vẫn bấm được tab khác */
function TabsWithTransition() {
  const [tab, setTab] = useState<TabKey>('about')
  const [isPending, startTransition] = useTransition()

  function selectTab(next: TabKey) {
    startTransition(() => setTab(next))
  }

  return (
    <>
      <Space size={8} wrap>
        <Segmented value={tab} options={TAB_OPTIONS} onChange={selectTab} />
        {isPending && <Tag color="orange">đang chuyển tab…</Tag>}
      </Space>
      <div style={{ opacity: isPending ? 0.5 : 1 }}>
        <TabPanel tab={tab} />
      </div>
    </>
  )
}
// #endregion

export default function TabsDemo() {
  return (
    <div>
      <div
        style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}
      >
        <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
          <b style={{ color: 'var(--danger)' }}>❌ Không transition</b>
          <TabsBlocking />
        </div>
        <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
          <b style={{ color: 'var(--success)' }}>✅ Có useTransition</b>
          <TabsWithTransition />
        </div>
      </div>

      <Alert
        style={{ marginTop: 16 }}
        type="info"
        showIcon
        title="Cách diễn cho khán giả"
        description={
          <span className="dim">
            Bấm &quot;Sản phẩm (nặng)&quot; rồi bấm ngay &quot;Liên hệ&quot;. Bên trái: cả trang đứng
            khoảng nửa giây, cú bấm thứ hai chỉ có tác dụng sau đó. Bên phải: hiện &quot;đang chuyển
            tab…&quot;, cú bấm thứ hai được nhận ngay và React bỏ dở lần render danh sách.
          </span>
        }
      />
    </div>
  )
}
```

- [ ] **Step 2: Lint + typecheck**

Run: `npx eslint src/pages/transition/demos/TabsDemo.tsx && npx tsc -b`
Expected: exit 0. Nếu `tsc` báo `onChange={setTab}` / `onChange={selectTab}` không khớp kiểu của `Segmented`, đổi thành `onChange={(next) => setTab(next as TabKey)}` và `onChange={(next) => selectTab(next as TabKey)}` rồi chạy lại.

- [ ] **Step 3: Xác nhận `<TabPanel>` bên phải được cache theo `tab`**

Run lệnh "Xem output thật của React Compiler" với `src/pages/transition/demos/TabsDemo.tsx`, lọc: `| grep -n "<TabPanel tab={tab}" -B1`
Expected: kết quả thuộc `TabsWithTransition` có dòng trước là `if ($[N] !== tab) {`. Không có lỗi compiler.

Leave the changes uncommitted. Do not run `git add` or `git commit`.

---

### Task 4: Ví dụ 3 — `AsyncActionDemo` + snippets

**Files:**
- Create: `src/pages/transition/demos/AsyncActionDemo.tsx`
- Create: `src/pages/transition/snippets.ts`

**Interfaces:**
- Consumes: `fakeRequest<T>(data: T, opts?: { latency?: number }): Promise<T>` từ `src/lib/fakeServer.ts` (độ trễ + chế độ lỗi lấy từ cấu hình chung, chỉnh bằng `ServerPanel`).
- Produces:
  - `export default function AsyncActionDemo(): JSX.Element`; region `demo` chứa `DisplayNameForm`.
  - `snippets.ts`: `export const SIGNATURE: string`, `export const REACT18_WAY: string`, `export const GOTCHAS: string`.

- [ ] **Step 1: Tạo `AsyncActionDemo.tsx`**

```tsx
import { useState, useTransition } from 'react'
import { App, Button, Input, Tag } from 'antd'
import { SaveOutlined } from '@ant-design/icons'

import { fakeRequest } from '../../../lib/fakeServer'

// #region demo
function DisplayNameForm() {
  const { message: toast } = App.useApp()
  const [savedName, setSavedName] = useState('Ngọc Anh') // giá trị server đã lưu
  const [draft, setDraft] = useState('Ngọc Anh')
  const [isPending, startTransition] = useTransition()

  function save() {
    // React 19: startTransition nhận thẳng hàm async.
    // isPending = true từ lúc bấm tới khi hàm async chạy xong — không cần state isSaving.
    startTransition(async () => {
      try {
        const name = await fakeRequest(draft.trim())
        // Sau `await`, setState phải được bọc startTransition lần nữa
        startTransition(() => setSavedName(name))
        toast.success(`Đã lưu tên "${name}"`)
      } catch {
        toast.error('Server từ chối — tên cũ vẫn được giữ nguyên')
      }
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} disabled={isPending} />
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={isPending}
          disabled={!draft.trim() || draft.trim() === savedName}
          onClick={save}
        >
          Lưu
        </Button>
      </div>

      <div style={{ marginTop: 12 }}>
        <Tag color={isPending ? 'orange' : 'default'} className="mono">
          {isPending ? 'isPending = true · đang chờ server…' : 'isPending = false'}
        </Tag>
      </div>

      <p className="dim" style={{ marginTop: 12, marginBottom: 0 }}>
        Tên đang lưu trên server: <b style={{ color: 'var(--text)' }}>{savedName}</b>
      </p>
    </div>
  )
}
// #endregion

export default function AsyncActionDemo() {
  return <DisplayNameForm />
}
```

- [ ] **Step 2: Tạo `snippets.ts`**

```ts
export const SIGNATURE = `const [isPending, startTransition] = useTransition()

// Cập nhật GẤP — mặc định của mọi setState: render một mạch tới khi xong
setText(value)

// Cập nhật KHÔNG GẤP — React được phép hoãn, tạm dừng giữa các component
// để xử lý phím gõ / cú click mới, và bỏ dở nếu có giá trị mới hơn
startTransition(() => {
  setQuery(value)
})

// isPending = true trong lúc cập nhật không gấp chưa hiển thị xong

// React 19: truyền được hàm async — isPending giữ true suốt thời gian await
startTransition(async () => {
  const saved = await api.save(data)
  startTransition(() => setSaved(saved))
})`

export const REACT18_WAY = `// ❌ React 18: startTransition chỉ nhận hàm đồng bộ → tự quản lý trạng thái chờ
function DisplayNameForm() {
  const [savedName, setSavedName] = useState('Ngọc Anh')
  const [draft, setDraft] = useState('Ngọc Anh')
  const [isSaving, setIsSaving] = useState(false)   // state phụ phải tự quản lý

  async function save() {
    setIsSaving(true)
    try {
      const name = await api.saveName(draft.trim())
      setSavedName(name)
      toast.success(\`Đã lưu tên "\${name}"\`)
    } catch {
      toast.error('Server từ chối — tên cũ vẫn được giữ nguyên')
    } finally {
      setIsSaving(false)                              // quên dòng này là nút quay mãi
    }
  }

  return (
    <>
      <Input value={draft} onChange={(e) => setDraft(e.target.value)} disabled={isSaving} />
      <Button loading={isSaving} onClick={save}>Lưu</Button>
    </>
  )
}

// Mỗi thao tác async lại lặp lại bộ ba setIsSaving(true) / try / finally.`

export const GOTCHAS = `// 1️⃣ Đừng bọc setState của ô nhập controlled trong transition
<input
  value={text}
  onChange={(e) => startTransition(() => setText(e.target.value))}   // ❌ gõ bị nhảy chữ
/>
// → tách hai state: setText gấp, setQuery trong transition (ví dụ 1)


// 2️⃣ Phần nặng dồn vào MỘT hàm thì React không ngắt được
function Results({ query }) {
  const items = expensiveSearch(query)   // ❌ một cục 100ms: vẫn chặn main thread
  return <List items={items} />
}
// → React chỉ tạm dừng được GIỮA các component: chia nhỏ thành nhiều component,
//   hoặc đưa phép tính sang Web Worker


// 3️⃣ Component nặng phải được bỏ qua ở lần render gấp
function Search() {
  const [text, setText] = useState('')
  const [query, setQuery] = useState('')
  // ...
  return <SlowList query={query} />   // ❌ nếu không memo: gõ phím (đổi text) cũng render lại SlowList
}
// → React Compiler tự cache phần tử <SlowList query={query} /> (app này đang bật);
//   không có compiler thì bọc SlowList bằng React.memo


// 4️⃣ Sau await, setState phải bọc startTransition lần nữa
startTransition(async () => {
  const saved = await api.save(data)
  setSaved(saved)                          // ❌ không còn là transition
  startTransition(() => setSaved(saved))   // ✅
})


// 5️⃣ Transition không phải debounce
// Mỗi phím vẫn gọi setQuery → nếu gọi API theo query thì vẫn gửi đủ N request.
// Muốn giảm số request → debounce, hoặc huỷ request cũ bằng AbortController.`
```

- [ ] **Step 3: Lint + typecheck**

Run: `npx eslint src/pages/transition/demos/AsyncActionDemo.tsx src/pages/transition/snippets.ts && npx tsc -b`
Expected: exit 0, không lỗi.

- [ ] **Step 4: Xác nhận compiler không bỏ qua `DisplayNameForm`**

Run lệnh "Xem output thật của React Compiler" với `src/pages/transition/demos/AsyncActionDemo.tsx`, lọc: `| grep -c "_c("`
Expected: `2` (DisplayNameForm và AsyncActionDemo), không có lỗi compiler.

Leave the changes uncommitted. Do not run `git add` or `git commit`.

---

### Task 5: Trang `UseTransitionPage` + route + menu + smoke test

**Files:**
- Create: `src/pages/transition/UseTransitionPage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/AppLayout.tsx`
- Modify: `scripts/smoke.tsx`

**Interfaces:**
- Consumes: `SearchDemo`, `TabsDemo`, `AsyncActionDemo` (default exports, Task 2–4); `SIGNATURE`, `REACT18_WAY`, `GOTCHAS` (Task 4); `CodeBlock`, `DemoCard`, `ServerPanel`, `PageHeader`, `SectionTitle` (có sẵn); `extractRegion(source, region)`, `stripImports(source)` từ `src/lib/source.ts`.
- Produces: `export default function UseTransitionPage(): JSX.Element`, route `/use-transition`.

- [ ] **Step 1: Thêm route vào smoke test trước (để thấy nó chưa đúng)**

Trong `scripts/smoke.tsx`, sửa comment dòng 2 và mảng `ROUTES` (dòng 15):

```tsx
 * Smoke test: render toàn bộ các route bằng react-dom/server để chắc chắn
```

```tsx
const ROUTES = ['/', '/react-compiler', '/use-optimistic', '/ref-as-prop', '/use-transition']
```

- [ ] **Step 2: Chạy smoke test, xác nhận route mới chưa tồn tại**

Run: `npm run smoke; rm -rf dist-smoke`
Expected: `/use-transition` in "render OK" nhưng số ký tự HTML **nhỏ hơn hẳn** các route khác — route `*` render `<Navigate>`, mà `Navigate` chỉ điều hướng trong effect nên khi render server chỉ còn khung layout. Tức trang chưa có.

- [ ] **Step 3: Tạo `UseTransitionPage.tsx`**

```tsx
import { Alert, Col, Row } from 'antd'
import { Link } from 'react-router-dom'

import CodeBlock from '../../components/CodeBlock'
import DemoCard from '../../components/DemoCard'
import ServerPanel from '../../components/ServerPanel'
import { PageHeader, SectionTitle } from '../../components/PageHeader'
import { extractRegion, stripImports } from '../../lib/source'

import AsyncActionDemo from './demos/AsyncActionDemo'
import SearchDemo from './demos/SearchDemo'
import TabsDemo from './demos/TabsDemo'
import { GOTCHAS, REACT18_WAY, SIGNATURE } from './snippets'

import asyncActionRaw from './demos/AsyncActionDemo.tsx?raw'
import searchRaw from './demos/SearchDemo.tsx?raw'
import slowListRaw from './demos/SlowList.tsx?raw'
import tabsRaw from './demos/TabsDemo.tsx?raw'

export default function UseTransitionPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tính năng 04"
        title="useTransition"
        lede={
          <>
            Đánh dấu một cập nhật là <b>không gấp</b> để React được phép hoãn, tạm dừng giữa chừng
            và bỏ dở khi có thao tác mới. Phép tính nặng vẫn chạy đủ — nhưng ô nhập và cú click{' '}
            <b>không còn phải xếp hàng chờ nó</b>.
          </>
        }
        tags={['React 18+', 'React 19', 'Concurrent rendering', 'Actions']}
      />

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={13}>
          <div className="demo-card" style={{ marginBottom: 0, height: '100%' }}>
            <div className="demo-pane__label">
              <span>Chữ ký &amp; cách hoạt động</span>
            </div>
            <CodeBlock code={SIGNATURE} language="tsx" showLineNumbers={false} />
          </div>
        </Col>
        <Col xs={24} lg={11}>
          <div className="panel-box" style={{ height: '100%' }}>
            <h4 style={{ marginTop: 0 }}>Gấp và không gấp</h4>
            <ul className="dim" style={{ paddingLeft: 18, lineHeight: 1.95, marginBottom: 0 }}>
              <li>
                <b style={{ color: 'var(--text)' }}>Cập nhật gấp</b> — gõ phím, click, kéo thả. Người
                dùng chờ phản hồi ngay; React render một mạch, không dừng.
              </li>
              <li>
                <b style={{ color: 'var(--primary)' }}>Cập nhật không gấp</b> — lọc danh sách, chuyển
                tab, chuyển trang. Chậm một nhịp không sao; React render từng đoạn nhỏ và nhường lượt
                cho cập nhật gấp.
              </li>
              <li>
                <b style={{ color: 'var(--warning)' }}>isPending</b> — cờ báo cập nhật không gấp chưa
                hiển thị xong, dùng để làm mờ hoặc hiện loading.
              </li>
            </ul>
            <Alert
              style={{ marginTop: 14 }}
              type="info"
              showIcon
              title="Khác gì React Compiler?"
              description={
                <span className="dim">
                  Compiler <b>bỏ qua</b> phép tính khi đầu vào không đổi (xem{' '}
                  <Link to="/react-compiler">ví dụ lọc 2000 sản phẩm</Link>). Khi đầu vào đổi thật và
                  phép tính bắt buộc phải chạy, compiler không giúp được — lúc đó cần{' '}
                  <code>useTransition</code> để UI không bị khựng.
                </span>
              }
            />
          </div>
        </Col>
      </Row>

      <SectionTitle num="1">Ví dụ 1 — Ô tìm kiếm không còn khựng</SectionTitle>

      <DemoCard
        title="Tách một state thành hai: gấp cho ô nhập, không gấp cho danh sách"
        description={
          <>
            Mỗi bên có ô nhập riêng và cùng render một danh sách 200 sản phẩm, mỗi sản phẩm tốn khoảng
            0,5ms. Đồng hồ trong ô nhập đo thật từ lúc gõ phím tới lúc chữ hiện ra.
          </>
        }
        code={[
          {
            key: 'now',
            label: 'Code đang chạy',
            code: extractRegion(searchRaw, 'demo'),
            language: 'tsx',
            maxHeight: 560,
          },
          {
            key: 'slow',
            label: 'SlowList',
            code: stripImports(slowListRaw),
            language: 'tsx',
            maxHeight: 560,
          },
        ]}
      >
        <SearchDemo />
      </DemoCard>

      <SectionTitle num="2">Ví dụ 2 — Chuyển tab nặng</SectionTitle>

      <DemoCard
        title="Bấm tab khác được ngay cả khi tab trước chưa render xong"
        description={
          <>
            Tab <b>Sản phẩm</b> render 1000 sản phẩm (khoảng nửa giây). Không có transition, cú click
            đó khoá cả trang; có transition, React vẫn nhận cú click tiếp theo và bỏ dở lần render cũ.
          </>
        }
        code={{
          code: extractRegion(tabsRaw, 'demo'),
          language: 'tsx',
          maxHeight: 520,
        }}
      >
        <TabsDemo />
      </DemoCard>

      <SectionTitle num="3">Ví dụ 3 — Mới ở React 19: transition nhận hàm async</SectionTitle>
      <ServerPanel />

      <DemoCard
        title="isPending tự kéo dài suốt thời gian await"
        description={
          <>
            React 18 chỉ cho truyền hàm đồng bộ vào <code>startTransition</code>, nên trạng thái
            &quot;đang lưu&quot; phải tự quản lý. React 19 gọi hàm async trong transition là{' '}
            <b>Action</b>: <code>isPending</code> bật từ lúc bấm tới khi hàm chạy xong. Kéo độ trễ
            server lên rồi bấm Lưu, sau đó thử chế độ <b>Luôn lỗi</b>.
          </>
        }
        code={[
          {
            key: 'new',
            label: '✅ React 19 (code đang chạy)',
            code: extractRegion(asyncActionRaw, 'demo'),
            language: 'tsx',
            maxHeight: 520,
          },
          { key: 'old', label: '❌ React 18', code: REACT18_WAY, language: 'tsx', maxHeight: 520 },
        ]}
      >
        <AsyncActionDemo />
      </DemoCard>

      <SectionTitle num="4">Năm điều dễ vấp</SectionTitle>

      <DemoCard
        title="Checklist trước khi rắc startTransition khắp nơi"
        description="Năm lỗi hay gặp nhất khi mới dùng useTransition."
        code={{ code: GOTCHAS, language: 'tsx', showLineNumbers: false }}
        codeOnly
      />

      <SectionTitle num="5">Chốt lại — khi nào dùng gì</SectionTitle>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <div className="panel-box" style={{ height: '100%' }}>
            <h4 style={{ marginTop: 0, color: 'var(--success)' }}>React Compiler / useMemo</h4>
            <p className="dim" style={{ marginTop: 0 }}>
              Phép tính <b>thừa</b>: đầu vào không đổi mà vẫn tính lại.
            </p>
            <ul className="dim" style={{ paddingLeft: 18, lineHeight: 1.9, marginBottom: 0 }}>
              <li>Gõ ô không liên quan mà danh sách vẫn lọc lại</li>
              <li>Con render lại dù props không đổi</li>
              <li>→ Bỏ qua hẳn phép tính</li>
            </ul>
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div className="panel-box" style={{ height: '100%' }}>
            <h4 style={{ marginTop: 0, color: 'var(--primary)' }}>useTransition</h4>
            <p className="dim" style={{ marginTop: 0 }}>
              Render <b>nặng nhưng bắt buộc</b>.
            </p>
            <ul className="dim" style={{ paddingLeft: 18, lineHeight: 1.9, marginBottom: 0 }}>
              <li>Lọc / tìm kiếm trên danh sách lớn</li>
              <li>Chuyển tab, chuyển trang</li>
              <li>Gửi form async (React 19)</li>
              <li>→ Vẫn tính đủ, nhưng UI không bị khoá</li>
            </ul>
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div className="panel-box" style={{ height: '100%' }}>
            <h4 style={{ marginTop: 0, color: 'var(--warning)' }}>Debounce / Web Worker</h4>
            <p className="dim" style={{ marginTop: 0 }}>
              Vấn đề <b>không nằm ở render</b>.
            </p>
            <ul className="dim" style={{ paddingLeft: 18, lineHeight: 1.9, marginBottom: 0 }}>
              <li>Gọi API theo từng phím → debounce</li>
              <li>Một phép tính lớn không chia nhỏ được → Web Worker</li>
            </ul>
          </div>
        </Col>
      </Row>
    </>
  )
}
```

- [ ] **Step 4: Đăng ký route trong `src/App.tsx`**

Thêm import sau dòng `import RefAsPropPage …`:

```tsx
import UseTransitionPage from './pages/transition/UseTransitionPage'
```

Thêm route sau dòng `<Route path="/ref-as-prop" … />`:

```tsx
        <Route path="/use-transition" element={<UseTransitionPage />} />
```

- [ ] **Step 5: Thêm mục menu trong `src/components/AppLayout.tsx`**

Thêm `FieldTimeOutlined` vào import từ `@ant-design/icons`:

```tsx
import {
  GithubOutlined,
  HomeOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  AimOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons'
```

Thêm phần tử cuối vào `NAV_ITEMS`:

```tsx
  { key: '/use-transition', icon: <FieldTimeOutlined />, label: 'useTransition' },
```

- [ ] **Step 6: Lint + typecheck**

Run: `npx eslint src/pages/transition src/App.tsx src/components/AppLayout.tsx scripts/smoke.tsx && npx tsc -b`
Expected: exit 0, không lỗi.

- [ ] **Step 7: Chạy smoke test, xác nhận trang mới render**

Run: `npm run smoke; rm -rf dist-smoke`
Expected: cả 5 route "render OK", `/use-transition` có số ký tự HTML **khác và lớn hơn nhiều** so với `/`; dòng cuối `✔ Tất cả route render được`.

Leave the changes uncommitted. Do not run `git add` or `git commit`.

---

### Task 6: Nối từ trang chủ, trang Compiler và README

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/pages/compiler/demos/AutoUseMemoDemo.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: route `/use-transition` (Task 5).
- Produces: không có interface mới.

- [ ] **Step 1: Thêm thẻ chủ đề ở `src/pages/HomePage.tsx`** (giữ dấu nháy kép + chấm phẩy)

Thêm `FieldTimeOutlined` vào import icons:

```tsx
import {
  AimOutlined,
  ArrowRightOutlined,
  FieldTimeOutlined,
  RocketOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
```

Thêm phần tử cuối vào mảng `TOPICS` (sau object `/ref-as-prop`):

```tsx
  {
    to: "/use-transition",
    icon: <FieldTimeOutlined />,
    title: "useTransition",
    tag: "UI không bị khựng",
    desc: "Đánh dấu cập nhật nặng là không gấp để ô nhập và cú click luôn phản hồi ngay. React 19 cho truyền thẳng hàm async vào transition.",
    points: [
      "Ô tìm kiếm không khựng",
      "Chuyển tab nặng",
      "Transition nhận hàm async",
    ],
  },
```

Đổi `Col` để 4 thẻ xếp gọn — thay:

```tsx
          <Col key={topic.to} xs={24} lg={8}>
```

bằng:

```tsx
          <Col key={topic.to} xs={24} md={12} xl={6}>
```

- [ ] **Step 2: Bổ sung giải thích + link trong `AutoUseMemoDemo.tsx`**

Thêm import (sau dòng import từ `@ant-design/icons`):

```tsx
import { Link } from 'react-router-dom'
```

Thay nội dung `<span className="dim">` trong `Alert` "Cách diễn cho khán giả":

```tsx
          <span className="dim">
            Gõ liên tục vào ô ghi chú bên trái: chữ hiện ra bị khựng vì mỗi ký tự lại phải lọc lại
            2000 sản phẩm, &quot;số lần lọc&quot; tăng theo từng phím. Làm y hệt ở ô ghi chú bên
            phải: gõ mượt, &quot;số lần lọc&quot; đứng yên. Sau đó đổi từ khoá ở ô trên cùng — lúc
            này cả hai đều tính lại, đúng như mong đợi.
          </span>
```

bằng:

```tsx
          <span className="dim">
            Gõ liên tục vào ô ghi chú bên trái: chữ hiện ra bị khựng vì mỗi ký tự lại phải lọc lại
            2000 sản phẩm, &quot;số lần lọc&quot; tăng theo từng phím. Làm y hệt ở ô ghi chú bên
            phải: gõ mượt, &quot;số lần lọc&quot; đứng yên. Sau đó đổi từ khoá ở ô trên cùng — lúc
            này cả hai đều tính lại và ô từ khoá khựng ở cả hai bên: compiler chỉ bỏ qua phép tính
            thừa, không làm phép tính nhanh hơn. Muốn gõ vẫn mượt khi phép tính bắt buộc phải chạy,
            xem <Link to="/use-transition">useTransition</Link>.
          </span>
```

- [ ] **Step 3: Cập nhật `README.md`**

Thay dòng mở đầu:

```md
App trình diễn 3 tính năng đáng chú ý nhất của React 19, mỗi tính năng một route riêng,
```

bằng:

```md
App trình diễn 4 tính năng đáng chú ý nhất của React 19, mỗi tính năng một route riêng,
```

Thêm dòng cuối vào bảng route (sau dòng `/ref-as-prop`):

```md
| `/use-transition` | `useTransition` — UI không khựng khi render nặng (3 ví dụ + checklist) |
```

Thay:

```md
npm run smoke        # render cả 4 route bằng react-dom/server để bắt lỗi runtime
```

bằng:

```md
npm run smoke        # render mọi route bằng react-dom/server để bắt lỗi runtime
```

Thêm mục 5 vào cuối "Mẹo khi present":

```md
5. Trang **useTransition**: gõ nhanh "Dell" ở ô bên trái trước rồi mới tới bên phải, chỉ vào đồng hồ
   độ trễ trong ô nhập. Ở ví dụ 2, bấm "Sản phẩm" rồi bấm ngay "Liên hệ".
```

- [ ] **Step 4: Lint + typecheck + smoke**

Run: `npx eslint src/pages/HomePage.tsx src/pages/compiler/demos/AutoUseMemoDemo.tsx && npx tsc -b && npm run smoke; rm -rf dist-smoke`
Expected: eslint + tsc không lỗi; smoke in đủ 5 route "render OK" và `✔ Tất cả route render được`.

- [ ] **Step 5: Kiểm tra toàn bộ lần cuối**

Run: `npm run lint && npx tsc -b`
Expected: exit 0. (Nếu `npm run lint` báo lỗi ở file **không** nằm trong plan này, ghi lại và báo cho người dùng thay vì sửa.)

- [ ] **Step 6: Nhờ người dùng kiểm tra bằng tay**

Không tự động hoá được cảm giác khựng/mượt trong môi trường này. Báo người dùng chạy `npm run dev`, mở `/use-transition` và thử theo 2 khung "Cách diễn cho khán giả"; nếu độ trễ bên trái dưới ~80ms thì tăng `LOOPS_PER_ITEM` trong `SlowList.tsx`.

Leave the changes uncommitted. Do not run `git add` or `git commit`.
