# React 19 — App demo

App trình diễn 4 tính năng đáng chú ý nhất của React 19, mỗi tính năng một route riêng,
mỗi ví dụ có **code bên trái** và **kết quả chạy thật bên phải**.

| Route             | Nội dung                                                    |
| ----------------- | ----------------------------------------------------------- |
| `/`               | Tổng quan + mạch trình bày gợi ý                            |
| `/react-compiler` | React Compiler — tự động memo hoá (4 ví dụ)                 |
| `/use-optimistic` | `useOptimistic` — UI phản hồi tức thì, so với `useState` thường (2 ví dụ + checklist) |
| `/use-transition` | `useTransition` — UI không khựng khi render nặng (3 ví dụ)  |

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
```

## Vài điểm về cách app này được dựng

**Code hiển thị chính là code đang chạy.** Mọi đoạn code trên màn hình đều được đọc trực tiếp
từ file nguồn bằng `import src from './Demo.tsx?raw'` rồi cắt theo marker
`// #region demo` … `// #endregion` (xem `src/lib/source.ts`). Sửa file demo là slide tự đổi
theo, không bao giờ lệch.

**So sánh "có / không có compiler" trong cùng một app.** Compiler được bật thật trong
`vite.config.ts`. Phía "không có compiler" chỉ đơn giản là thêm directive `"use no memo"` vào
đầu component — hai bên chạy y hệt nhau, khác đúng một dòng.

**App cố tình không bọc `<StrictMode>`.** StrictMode ở dev render mỗi component 2 lần, làm bộ
đếm số lần render nhảy 2, 4, 6… gây hiểu nhầm cho người xem. Dự án thật thì vẫn nên bật.

## Mẹo khi present

1. Mở bằng `npm run dev`, phóng to trình duyệt, ẩn thanh bookmark.
2. Trang **React Compiler**: ở ví dụ 2, gõ liên tục vào ô "ghi chú" hai bên — bên trái giật,
   bên phải mượt, bộ đếm "số lần lọc" đứng yên. Đó là khoảnh khắc gây bất ngờ nhất.
3. Trang **useOptimistic**: kéo latency lên 2–3 giây trước, sau đó bật "Luôn lỗi" để show rollback —
   số like tự quay về mà trong code không có lấy một dòng hoàn tác nào.
4. Trang **useTransition**: gõ nhanh "Dell" ở ô bên trái trước rồi mới tới bên phải, chỉ vào đồng hồ
   độ trễ trong ô nhập. Ở ví dụ 2, bấm "Sản phẩm" rồi bấm ngay "Liên hệ".

## Công nghệ

React 19 · Vite 8 (rolldown) · TypeScript · babel-plugin-react-compiler ·
Ant Design 6 · react-router 7 · prism-react-renderer
