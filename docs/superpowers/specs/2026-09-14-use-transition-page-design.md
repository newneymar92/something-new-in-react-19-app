# Trang `/use-transition` — thiết kế

**Ngày:** 2026-09-14
**Trạng thái:** đã chốt với người dùng, chờ review file spec

## Bối cảnh

Ở trang React Compiler (ví dụ 2, `AutoUseMemoDemo`), gõ vào ô **từ khoá** làm cả hai bên cùng
khựng: `query` là đầu vào thật của phép lọc nên compiler không được phép bỏ qua. Khán giả dễ
hiểu nhầm là compiler "hỏng". Trang mới trả lời câu hỏi tiếp theo: *phép tính bắt buộc phải
chạy thì làm sao giữ UI mượt?* → `useTransition`.

`useTransition` có từ React 18; trang nói rõ điều đó và dành một ví dụ cho phần React 19 bổ
sung (transition nhận hàm async). **Không** đề cập `useDeferredValue` (người dùng đã loại).

## Ràng buộc kỹ thuật chi phối thiết kế

React chỉ ngắt được một lần render transition **giữa các component**, không ngắt được giữa
chừng một hàm đang chạy. Vì vậy phần "nặng" của mọi demo phải là **nhiều component nhỏ, mỗi
cái hơi chậm** (`SlowList` → nhiều `SlowItem`), không dùng `expensiveSearch` (một cục ~85ms).

Component nặng phải được bỏ qua trong lần render *gấp*. App bật React Compiler nên phần tử
`<SlowList query={query} />` được cache tự động theo `query` — không bọc `memo` thủ công, và
phải kiểm chứng bằng output compiler thật.

## Cấu trúc file

| File | Vai trò |
| --- | --- |
| `src/pages/transition/UseTransitionPage.tsx` | Trang, bố cục giống `UseOptimisticPage` |
| `src/pages/transition/snippets.ts` | `SIGNATURE`, `REACT18_WAY`, `GOTCHAS` |
| `src/pages/transition/demos/SlowList.tsx` | Danh sách nặng dùng chung |
| `src/pages/transition/demos/SearchDemo.tsx` | Ví dụ 1 |
| `src/pages/transition/demos/TabsDemo.tsx` | Ví dụ 2 |
| `src/pages/transition/demos/AsyncActionDemo.tsx` | Ví dụ 3 |
| `src/pages/transition/demos/LatencyInput.tsx` | Ô nhập kèm đồng hồ đo độ trễ phím gõ |

Mọi file demo dùng marker `// #region demo` … `// #endregion` để trang hiển thị đúng code đang
chạy (`extractRegion`).

## Các thành phần

### `SlowList({ query, limit })`
- Lọc `PRODUCTS` (từ `src/lib/expensive.ts`) theo tên chứa `query` (không phân biệt hoa thường),
  lấy tối đa `limit` sản phẩm, render mỗi sản phẩm bằng một `SlowItem`.
- `SlowItem` tô đậm đoạn khớp từ khoá trong tên; hàm `highlightMatch(name, query)` chứa vòng lặp
  bận tốn khoảng **0,5ms** mỗi item (`LOOPS_PER_ITEM = 700_000`, đo bằng Node trên máy dev).
  Vì kết quả phụ thuộc cả `name` lẫn `query`, đổi từ khoá thì Compiler không bỏ qua được — độ
  chậm là thật ở mỗi lần render.
- Bản thân việc lọc phải rẻ — toàn bộ độ chậm nằm trong các `SlowItem`.

### `LatencyInput({ value, onChange, placeholder })`
- Bọc `Input` của antd; `suffix` luôn có mặt (antd remount ô nhập nếu suffix bật/tắt) và chứa
  `<span ref>` hiển thị số ms.
- Trong `onChange`: ghi `e.timeStamp` vào ref nếu chưa có mốc đang chờ (giữ mốc phím **sớm
  nhất** chưa được hiển thị) rồi gọi `onChange(e.target.value)`. `e.timeStamp` tính cả thời
  gian sự kiện bị xếp hàng khi main thread bận.
- `useLayoutEffect` không deps: nếu có mốc đang chờ thì ghi `performance.now() - mốc` thẳng vào
  `span.textContent` rồi xoá mốc. Không `setState` → không gây render thêm.

### Ví dụ 1 — `SearchDemo`: ô tìm kiếm không còn khựng
- Hai cột, **mỗi cột có ô nhập và state riêng** (gõ bên nào thì chỉ bên đó render).
- ❌ Trái: một state `query` vừa điều khiển ô nhập vừa truyền vào `<SlowList>`.
- ✅ Phải: hai state — `setText(value)` (gấp) và `startTransition(() => setQuery(value))`
  (không gấp); `<SlowList query={query}>`; khi `isPending` thì danh sách giảm opacity.
- Mỗi cột dùng `LatencyInput` nên hiển thị độ trễ phím gần nhất ngay trong ô nhập.
- Ô nhập khởi đầu rỗng, `limit = 200` → mỗi phím bên trái tốn ~100ms render khi số sản phẩm
  khớp ≥ 200 (ô rỗng, hoặc gõ tên một hãng như "Dell" — 222 sản phẩm). Từ khoá càng hẹp thì
  càng nhanh; câu hướng dẫn trong demo gợi ý gõ tên hãng.

### Ví dụ 2 — `TabsDemo`: chuyển tab nặng
- Hai cột, mỗi cột có state tab riêng, ba tab: "Giới thiệu" (nhẹ), "Sản phẩm"
  (`SlowList` với `limit` lớn, khoảng 500ms), "Liên hệ" (nhẹ).
- ❌ Trái: bấm tab gọi `setTab` trực tiếp → trang đứng hình, không bấm được tab khác.
- ✅ Phải: `startTransition(() => setTab(next))`; nút tab đang chờ hiển thị trạng thái pending;
  bấm tab khác giữa chừng thì React bỏ lần render dở.

### Ví dụ 3 — `AsyncActionDemo`: phần mới của React 19
- Demo chạy thật chỉ dùng cách React 19: form đổi tên hiển thị, nút "Lưu" gọi
  `startTransition(async () => { const saved = await fakeRequest(...); startTransition(() => setSavedName(saved)) })`.
- `isPending` hiển thị loading suốt thời gian `await`; lỗi (theo cấu hình `fakeServer`) bắt bằng
  `try/catch` và báo qua `App.useApp().message`.
- Tab code: "✅ React 19 (code đang chạy)" / "❌ React 18" (`REACT18_WAY`: tự quản lý
  `isSaving` + `try/finally`).

## Trang `UseTransitionPage`
1. `PageHeader`: eyebrow "Tính năng 04", title "useTransition", lede ngắn, tags
   `['React 18+', 'React 19', 'Concurrent rendering', 'Actions']`.
2. Hàng mở đầu: `SIGNATURE` (bên trái) + panel "Cập nhật gấp và không gấp" kèm `Alert` có link
   về `/react-compiler` (compiler bỏ qua phép tính thừa; transition giữ UI mượt khi phép tính là
   bắt buộc).
3. `SectionTitle` 1 — Ví dụ 1 (`SearchDemo`, code tabs: đang chạy + `SlowList`).
4. `SectionTitle` 2 — Ví dụ 2 (`TabsDemo`).
5. `SectionTitle` 3 — Ví dụ 3 (`AsyncActionDemo`).
6. `SectionTitle` 4 — Checklist (`GOTCHAS`, `codeOnly`), 5 mục:
   1. Không bọc `setState` của ô nhập controlled trong transition — tách hai state.
   2. Phần nặng dồn vào một hàm (như `expensiveSearch`) thì React không ngắt được.
   3. Component nặng phải được memo (hoặc Compiler), nếu không lần render gấp cũng chạy lại nó.
   4. Sau `await` trong transition phải bọc `startTransition` lần nữa khi `setState`.
   5. Transition không phải debounce — không giảm số request mạng.
7. `SectionTitle` 5 — "Chốt lại": ba panel "khi nào dùng gì": Compiler/`useMemo` (bỏ qua phép
   tính thừa), `useTransition` (render nặng nhưng bắt buộc), debounce / Web Worker (gọi API,
   tính toán một cục lớn).

## Thay đổi ở chỗ khác
- `src/App.tsx`: thêm `<Route path="/use-transition" …>`.
- `src/components/AppLayout.tsx`: thêm mục menu cuối danh sách, nhãn "useTransition".
- `src/pages/HomePage.tsx`: thêm thẻ chủ đề thứ 4; đổi `Col` để 4 thẻ xếp gọn
  (`xs={24} md={12} xl={6}`); giữ style dấu nháy kép + dấu chấm phẩy đang dùng trong file.
- `src/pages/compiler/demos/AutoUseMemoDemo.tsx`: bổ sung vào `Alert` "Cách diễn cho khán giả"
  một câu: ô từ khoá khựng ở cả hai bên vì compiler chỉ bỏ qua phép tính thừa, không làm phép
  tính nhanh hơn — kèm `Link` sang `/use-transition`.
- `scripts/smoke.tsx`: thêm `/use-transition` vào `ROUTES`, sửa comment số route.
- `README.md`: thêm dòng vào bảng route, sửa số tính năng / số route.

## Kiểm chứng
- `npx tsc -b`, `npx eslint` trên các file mới/sửa, `npm run smoke` — đều phải qua.
- Chạy `babel-plugin-react-compiler` trên `SearchDemo.tsx` và `TabsDemo.tsx`: xác nhận phần tử
  `<SlowList>` ở cột phải được cache theo `query` / `tab` (không phụ thuộc `text`).
- Benchmark vòng lặp `SlowItem` bằng Node để hiệu chỉnh ~0,5ms/item.
- Người dùng tự gõ thử trên `npm run dev` để xác nhận cảm giác khựng / mượt (không tự động hoá
  được trong môi trường này).

## Ngoài phạm vi
- `useDeferredValue`, debounce demo, Web Worker demo.
- Thay đổi `expensiveSearch` hay các demo khác của trang Compiler (ngoài câu bổ sung trong Alert).
