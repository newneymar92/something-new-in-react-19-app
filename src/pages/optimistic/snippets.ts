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

// Vấn đề: 3 state phải đồng bộ với nhau, rollback viết tay,
// gửi nhiều tin cùng lúc là bắt đầu rối, và nếu component unmount
// giữa chừng thì setState trên component đã chết.`

export const NEW_WAY = `// ✅ CÁCH MỚI: React lo phần rollback
function Chat() {
  const [messages, setMessages] = useState(INITIAL)

  const [optimisticMessages, addOptimistic] = useOptimistic(
    messages,
    (current, text) => [...current, { id: 'tmp', text, pending: true }],
  )

  async function send(formData) {
    addOptimistic(formData.get('text'))
    const saved = await api.send(formData.get('text'))
    setMessages((prev) => [...prev, saved])
  }

  return <form action={send}>...</form>
}

// Ném lỗi ở giữa? Tin nhắn tạm tự biến mất. Không cần dòng rollback nào.`

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
