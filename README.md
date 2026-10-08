# React 19 — App demo

App trình diễn 4 tính năng đáng chú ý nhất của React 19, mỗi tính năng một route riêng,
mỗi ví dụ có **code bên trái** và **kết quả chạy thật bên phải**.

| Route             | Nội dung                                                    |
| ----------------- | ----------------------------------------------------------- |
| `/`               | Tổng quan + mạch trình bày gợi ý                            |
| `/react-compiler` | React Compiler — tự động memo hoá (5 ví dụ)                 |
| `/use-optimistic` | `useOptimistic` — UI phản hồi tức thì, so với `useState` và TanStack Query (4 ví dụ + checklist) |
| `/ref-as-prop`    | `ref` là prop bình thường + ref cleanup (4 ví dụ)           |
| `/use-transition` | `useTransition` — UI không khựng khi render nặng (3 ví dụ + checklist) |

## Chạy

```bash
npm install
npm run dev          # http://localhost:5173
```

Các lệnh khác:

```bash
npm run build        # tsc -b && vite build
npm run lint         # eslint
npm run smoke        # render mọi route bằng react-dom/server để bắt lỗi runtime
npm run gen:compiled # sinh lại output thật của React Compiler
```

## Vài điểm về cách app này được dựng

**Code hiển thị chính là code đang chạy.** Mọi đoạn code trên màn hình đều được đọc trực tiếp
từ file nguồn bằng `import src from './Demo.tsx?raw'` rồi cắt theo marker
`// #region demo` … `// #endregion` (xem `src/lib/source.ts`). Sửa file demo là slide tự đổi
theo, không bao giờ lệch.

**So sánh "có / không có compiler" trong cùng một app.** Compiler được bật thật trong
`vite.config.ts`. Phía "không có compiler" chỉ đơn giản là thêm directive `"use no memo"` vào
đầu component — hai bên chạy y hệt nhau, khác đúng một dòng.

**Huy hiệu "đã compile" là kiểm tra thật.** `src/lib/compilerCheck.ts` gọi
`Component.toString()` ngay trong trình duyệt và tìm dấu vết `_c(...)` mà compiler chèn vào.
Bấm vào huy hiệu sẽ mở modal xem source runtime. Cách này chính xác ở chế độ `dev`;
sau khi minify (`npm run build`) tên biến bị đổi nên kết quả không còn đáng tin — **hãy demo
bằng `npm run dev`**.

**Output compiler là output thật.** `npm run gen:compiled` chạy `babel-plugin-react-compiler`
lên file `src/pages/compiler/samples/CartSummary.tsx` và ghi kết quả vào
`src/generated/compilerOutput.ts`.

**App cố tình không bọc `<StrictMode>`.** StrictMode ở dev render mỗi component 2 lần, làm bộ
đếm số lần render nhảy 2, 4, 6… gây hiểu nhầm cho người xem. Dự án thật thì vẫn nên bật.

## Mẹo khi present

1. Mở bằng `npm run dev`, phóng to trình duyệt, ẩn thanh bookmark.
2. Trang **React Compiler**: bấm nút vài lần cho khán giả thấy bộ đếm hai bên tách nhau, rồi
   mở modal "đã compile" — đó là khoảnh khắc gây bất ngờ nhất.
3. Trang **useOptimistic**: kéo latency lên 2–3 giây trước, sau đó bật "Luôn lỗi" để show rollback.
   Ở ví dụ 4, bấm "Gửi 3 tin cùng lúc" ở chế độ "Cơ bản" rồi "Chuẩn hơn" để so với TanStack Query.
4. Trang **ref**: phần ref cleanup (ví dụ 4) là thứ ít người biết nhất — tắt/bật công tắc vài lần
   cho mọi người nhìn log gắn/gỡ.
5. Trang **useTransition**: gõ nhanh "Dell" ở ô bên trái trước rồi mới tới bên phải, chỉ vào đồng hồ
   độ trễ trong ô nhập. Ở ví dụ 2, bấm "Sản phẩm" rồi bấm ngay "Liên hệ".
5. Mở sẵn Console: demo "gọi setOptimistic ngoài transition" có in cảnh báo của React.

## Công nghệ

React 19 · Vite 8 (rolldown) · TypeScript · babel-plugin-react-compiler ·
Ant Design 6 · react-router 7 · prism-react-renderer
