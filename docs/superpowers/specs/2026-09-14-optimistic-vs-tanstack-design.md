# Ví dụ 4 trang `/use-optimistic`: `useOptimistic` vs TanStack Query — thiết kế

**Ngày:** 2026-09-14
**Trạng thái:** đã chốt với người dùng, chờ review file spec

## Bối cảnh

Người xem hay hỏi: "TanStack Query có `onMutate` cũng set UI trước và rollback được, vậy
`useOptimistic` khác gì?". Ví dụ 4 trả lời bằng demo chạy thật, đặt hai cách cạnh nhau, kèm một
kịch bản gửi dồn dập cho thấy khác biệt khi nhiều request chạy song song.

## Hành vi đã kiểm chứng (chạy thật trong jsdom, React 19.2.8 + @tanstack/react-query 5.102.8)

Kịch bản gửi 3 tin cùng lúc: T1 lỗi sau 800ms, T2 thành công sau 1600ms, T3 thành công sau
2400ms; query `list` mất 300ms. (`?` = đang chờ, `✓` = đã xác nhận)

| Thời điểm | `useOptimistic` | TanStack cơ bản | TanStack chuẩn hơn |
| --- | --- | --- | --- |
| 0 | T1? T2? T3? | T1? T2? T3? | T1? T2? T3? |
| 800ms | giữ nguyên T1? T2? T3? (toast lỗi) | **∅ — mất cả 3** | T2? T3? |
| 1600ms | vẫn T1? T2? T3? — **T2 đã xong vẫn "đang gửi"** | ∅ | T2✓ T3? |
| ~1900ms | | T2✓ (sau refetch) | |
| 2400ms | T2✓ T3✓ | | T2✓ T3✓ |
| ~2700ms | | T2✓ T3✓ | |

Kết luận đưa vào lời giải thích:
- **TanStack cơ bản** (snapshot + khôi phục + invalidate mỗi lần): tin lỗi khôi phục snapshot cũ
  → xoá luôn các tin khác đang chờ; invalidate giữa chừng refetch về danh sách chưa có chúng →
  UI nhấp nháy.
- **TanStack chuẩn hơn** (chỉ gỡ đúng tin lỗi, thay tin tạm bằng tin thật khi thành công, chỉ
  invalidate khi không còn mutation nào): chính xác nhất theo từng tin.
- **`useOptimistic`**: không nhấp nháy, không viết rollback; nhưng React gộp các action đang chạy,
  nên giá trị lạc quan (kể cả tin đã lỗi) giữ nguyên và tin đã xác nhận chưa hiện ✓ cho tới khi
  **cả loạt** kết thúc.

## Phạm vi thay đổi

### Phụ thuộc
- Thêm `@tanstack/react-query@^5.102.8` vào `dependencies` (peer: `react ^18 || ^19`).
- Không cài devtools.

### `src/lib/fakeServer.ts`
- `fakeRequest(data, opts?)`: `opts` thêm `fail?: boolean`. Nếu có `fail` thì dùng nó thay cho
  `shouldFail()`; không truyền thì hành vi như cũ.

### File mới trong `src/pages/optimistic/demos/compare/`
| File | Vai trò |
| --- | --- |
| `chatBackend.ts` | `type ChatMessage`, `type SendOptions = { latency?: number; fail?: boolean }`, `createChatBackend()` → `{ list(): Promise<ChatMessage[]>, send(text, opts?): Promise<ChatMessage> }`. Lưu tin trong bộ nhớ; `list` chờ 300ms, không bao giờ lỗi; `send` gọi `fakeRequest` (dùng cấu hình `ServerPanel` trừ khi `opts` ghi đè). |
| `useOptimisticChat.ts` | Region `demo`: hook `useOptimisticChat(backend)` → `{ messages, send(text, opts?) }` dùng `useOptimistic` + `startTransition(async)`; lỗi báo qua `App.useApp().message`. |
| `useTanstackChat.ts` | Region `basic` và `better`: hai hook `useTanstackChatBasic(backend)` và `useTanstackChatBetter(backend)`, cùng trả `{ messages, send(text, opts?) }`. `queryKey: ['chat']`, `mutationKey: ['chat', 'send']`. |
| `MessageList.tsx` | Khung hiển thị tin (dùng lại class CSS `chat-window`, `bubble…` của `ChatDemo`), tag "đang chờ: N". Không `scrollIntoView` (tránh cuộn cả trang khi hai cột cùng cập nhật) — tự cuộn khung chat bằng `scrollTop`. |
| `CompareDemo.tsx` | Component default. Tạo `QueryClient` riêng (`useState(() => new QueryClient(...))`, `retry: false`, `refetchOnWindowFocus: false`), bọc `QueryClientProvider`. Bên trong: 2 backend riêng (tạo một lần bằng `useState`), 2 cột, công tắc Cơ bản/Chuẩn hơn, nút "Gửi 3 tin cùng lúc", `InboxBadge` (component thứ hai đọc chung `['chat']` bằng `useQuery` + `useIsMutating`). Đổi chế độ = remount cột phải bằng `key={mode}` (hook khác nhau không gọi có điều kiện được); backend và cache giữ nguyên; công tắc bị khoá khi còn mutation đang chạy. |
| `snippets.ts` | `VIA_VARIABLES`: cách "qua `variables`" + `useMutationState` (chỉ snippet, không chạy). |

Kịch bản dồn dập là hằng số `BURST` trong `CompareDemo.tsx`:
`[{ text: 'Tin 1 (sẽ lỗi)', latency: 800, fail: true }, { text: 'Tin 2', latency: 1600 }, { text: 'Tin 3', latency: 2400 }]`.

### `src/pages/optimistic/UseOptimisticPage.tsx`
- Thêm `SectionTitle num="5"` "Ví dụ 4 — So với TanStack Query" + `DemoCard`:
  - Mô tả ngắn + hướng dẫn: bấm "Gửi 3 tin cùng lúc" ở chế độ Cơ bản, rồi chuyển Chuẩn hơn và bấm lại.
  - Tab code: `useOptimistic` (region `demo`), `TanStack — cơ bản` (region `basic`),
    `TanStack — chuẩn hơn` (region `better`), `TanStack — qua variables` (`VIA_VARIABLES`).
  - `wideCode`.
  - `footer`: bảng so sánh (Rollback · Giá trị lạc quan lưu ở đâu · Nhiều request song song ·
    Phạm vi · Hợp với) và câu chốt "đã dùng TanStack thì cứ dùng pattern của nó".
- Checklist "Bốn điều dễ vấp" chuyển sang `SectionTitle num="6"`.
- Tags của `PageHeader` thêm `'TanStack Query'`.

### Chỗ khác
- `src/pages/HomePage.tsx`: thẻ useOptimistic thêm point "So với TanStack Query" (giữ style nháy
  kép + chấm phẩy).
- `README.md`: dòng `/use-optimistic` đổi "3 ví dụ + checklist" → "4 ví dụ + checklist"; mẹo
  present số 3 thêm câu về nút "Gửi 3 tin cùng lúc".

## Kiểm chứng
- `npx tsc -b`, `npx eslint .`, `npm run smoke`.
- Output React Compiler (`panicThreshold: 'all_errors'`) cho các file trong `compare/`: không có
  component/hook nào bị bỏ qua.
- Script jsdom chạy **chính các hook trong `compare/`** theo kịch bản `BURST`: entry nằm trong
  scratchpad, bundle bằng `vite build --ssr` (giống `npm run smoke`) ra thư mục tạm trong repo để
  dùng chung `node_modules` của dự án (một bản React duy nhất), import `jsdom` bằng đường dẫn tuyệt
  đối tới scratchpad; xoá thư mục tạm sau khi chạy. Nếu kết quả khác bảng ở trên thì sửa lời giải
  thích theo kết quả thật.
- Người dùng tự xem trên `npm run dev`.

## Ngoài phạm vi
- Devtools của TanStack, cài TanStack cho các ví dụ khác, đổi `ChatDemo`/`TodoDemo` hiện có.
