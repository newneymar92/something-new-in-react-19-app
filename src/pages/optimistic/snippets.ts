export const SIGNATURE = `const [optimisticState, addOptimistic] = useOptimistic(
  state,          // giá trị THẬT (nguồn chân lý)
  updateFn,       // (giá trị hiện tại, payload) => giá trị hiển thị tạm
)

// optimisticState = state   khi không có action nào đang chạy
// optimisticState = updateFn(state, payload)   trong lúc action chạy
//
// Khi action kết thúc (dù thành công hay ném lỗi), React VỨT BỎ
// giá trị lạc quan và hiển thị lại đúng \`state\`.
// => Không cần viết code rollback. Đó là toàn bộ tinh thần của hook này.`

export const ACTIONS = `// Action = hàm (thường là async) mà React chạy BÊN TRONG một transition
// → React biết lúc nào nó bắt đầu và lúc nào kết thúc, kể cả qua await
// (không liên quan gì tới action của Redux)

// 1. <form action>: React tự bọc hàm trong transition          → Ví dụ 1
<form action={sendAction}>...</form>

// 2. startTransition                                             → Ví dụ 2, 4
startTransition(async () => {
  addOptimistic(payload)
  await api.save(payload)
})

// 3. useActionState, dùng làm form action                        → Ví dụ 3
const [error, addAction, isPending] = useActionState(saveFn, null)
<form action={addAction}>...</form>`

export const CHAT_WITH_USESTATE = `// A. useState + onSubmit — event handler bình thường, chạy được mọi phiên bản React
function Chat() {
  const [messages, setMessages] = useState(INITIAL)

  async function handleSubmit(e) {
    e.preventDefault()
    const text = new FormData(e.currentTarget).get('text')
    const tempId = crypto.randomUUID()

    setMessages((prev) => [...prev, { id: tempId, text, pending: true }])     // ① chèn tin tạm
    try {
      const saved = await api.send(text)
      setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)))   // ② thay tạm → thật
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))              // ③ tự gỡ tin tạm
      toast.error('Gửi thất bại')
    }
  }

  return <form onSubmit={handleSubmit}>…<MessageList messages={messages} /></form>
}

// Muốn giữ tin lỗi kèm nút "Gửi lại" (kiểu Messenger / Zalo)? Ở ③ chỉ cần đánh dấu:
//   setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, pending: false, failed: true } : m)))`

export const CHAT_WITH_USEOPTIMISTIC = `// B. useOptimistic + form action — React 19
function Chat() {
  const [messages, setMessages] = useState(INITIAL)   // chỉ chứa tin server đã xác nhận
  const [optimisticMessages, addOptimistic] = useOptimistic(
    messages,
    (current, draft) => [...current, draft],
  )

  async function sendAction(formData) {
    const text = formData.get('text')
    addOptimistic({ id: crypto.randomUUID(), text, pending: true })   // ① hiện tin tạm
    try {
      const saved = await api.send(text)
      setMessages((prev) => [...prev, saved])                         // ② thêm tin thật
    } catch {
      toast.error('Gửi thất bại')    // không có ③ — hết action là tin tạm tự biến mất
    }
  }

  return <form action={sendAction}>…<MessageList messages={optimisticMessages} /></form>
}

// ⚠️ Thay addOptimistic bằng setMessages(tin tạm) ngay trong sendAction?
//    Không hiện ngay được: mọi cập nhật trong action bị giữ lại tới khi action kết thúc.`

export const OLD_WAY = `// ❌ CÁCH CŨ: tự quản lý danh sách "đang gửi"
function Chat() {
  const [messages, setMessages] = useState(INITIAL)
  const [pendingIds, setPendingIds] = useState([])   // state phụ #1
  const [error, setError] = useState(null)           // state phụ #2

  async function send(text) {
    const tempId = crypto.randomUUID()
    const tempMessage = { id: tempId, text, pending: true }

    // 1. tự chèn tin nhắn tạm
    setMessages((prev) => [...prev, tempMessage])
    setPendingIds((prev) => [...prev, tempId])

    try {
      const saved = await api.send(text)
      // 2. tự thay tin nhắn tạm bằng tin nhắn thật
      setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)))
    } catch (e) {
      // 3. TỰ ROLLBACK — chỗ này rất dễ sai
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      setError(e)
    } finally {
      setPendingIds((prev) => prev.filter((id) => id !== tempId))
    }
  }
}

// Vấn đề:
// 1. "Đang gửi" nằm ở 2 chỗ (pending trong messages + pendingIds), thêm error
//    → 3 state phải cập nhật khớp nhau. Ngay ở đây đã sót: gửi lại thành công
//    không có setError(null) → thông báo lỗi cũ treo mãi.
// 2. Rollback viết tay: phải gỡ đúng theo tempId bằng functional update —
//    lỡ khôi phục snapshot cũ là xoá luôn các tin khác đang chờ.
// 3. Tin chưa xác nhận nằm lẫn trong state thật → chỗ nào dùng messages
//    (đếm, lưu, gửi đi) cũng phải nhớ lọc pending.`

export const NEW_WAY = `// ✅ CÁCH MỚI: React lo phần rollback
function Chat() {
  const [messages, setMessages] = useState(INITIAL)

  const [optimisticMessages, addOptimistic] = useOptimistic(
    messages,
    (current, draft) => [...current, draft],
  )

  async function send(formData) {
    const text = formData.get('text')
    addOptimistic({ id: crypto.randomUUID(), text, pending: true })
    try {
      const saved = await api.send(text)   // phải await: React chờ Promise của send
      setMessages((prev) => [...prev, saved])
    } catch {
      toast.error('Gửi thất bại')          // chỉ báo lỗi — không có dòng rollback nào
    }
  }

  return <form action={send}>...</form>
}

// Lỗi → send kết thúc → action kết thúc → tin tạm tự biến mất.
// ⚠️ Bỏ try/catch thì lỗi bị React ném tiếp lên Error Boundary gần nhất
//    (app không có Error Boundary → trắng cả trang).`

export const GOTCHAS = `// 1️⃣ Phải gọi trong action / transition
startTransition(async () => {
  addOptimistic(payload)      // ✅
  await api.save(payload)
})

addOptimistic(payload)        // ❌ React cảnh báo + huỷ giá trị ngay lập tức


// 2️⃣ Nhớ cập nhật state THẬT sau khi server trả về,
//    nếu không UI sẽ "nhảy" về giá trị cũ khi action kết thúc.
const saved = await api.save(payload)
setState(saved)               // ✅ đừng quên dòng này


// 3️⃣ Đừng dùng cho dữ liệu không được phép sai
//    (số dư ví, kết quả thanh toán, tồn kho lúc đặt hàng...).
//    useOptimistic hợp với like, comment, thêm việc, đổi tên —
//    những thao tác gần như chắc chắn thành công.


// 4️⃣ id tạm phải khác id thật, và nhớ đặt key ổn định khi render list.`
