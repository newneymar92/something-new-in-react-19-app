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
