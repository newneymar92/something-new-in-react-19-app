import { useEffect, useRef } from 'react'

/**
 * Đếm số lần một component thực sự render.
 *
 * Cố tình ghi vào ref ngay trong lúc render — đây là việc mà Rules of React
 * không cho phép, nên hook này được đánh dấu "use no memo" để React Compiler
 * bỏ qua, giữ cho bộ đếm luôn chính xác.
 * Chỉ dùng cho mục đích demo/đo đạc, đừng bê vào code production.
 */
export function useRenderCount(): number {
  'use no memo'

  const count = useRef(0)
  // eslint-disable-next-line react-hooks/refs -- cố ý vi phạm: đây chính là thứ đang được đem ra demo
  count.current += 1
  // eslint-disable-next-line react-hooks/refs -- xem chú thích phía trên
  return count.current
}

/**
 * Trả về ref để gắn vào một phần tử — mỗi lần component render lại,
 * phần tử đó sẽ nháy viền một cái để người xem thấy bằng mắt.
 */
export function useRenderFlash<T extends HTMLElement>(color = 'var(--danger)') {
  const ref = useRef<T>(null)

  // Không truyền deps: chạy sau MỌI lần render của component.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--flash-color', color)
    el.classList.remove('flash-on-render')
    // đọc offsetWidth để ép trình duyệt reflow -> animation chạy lại từ đầu
    void el.offsetWidth
    el.classList.add('flash-on-render')
  })

  return ref
}
