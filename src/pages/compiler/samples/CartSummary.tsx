import { useState } from 'react'

export type CartItem = { id: number; name: string; price: number; qty: number }

/**
 * Một component "đời thường" — không có useMemo, useCallback hay React.memo nào cả.
 * File này được script `npm run gen:compiled` đưa qua React Compiler để lấy
 * output thật, phục vụ demo "compiler đã viết lại code của bạn như thế nào".
 */
export default function CartSummary({ items, vat }: { items: CartItem[]; vat: number }) {
  const [expanded, setExpanded] = useState(false)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const total = Math.round(subtotal * (1 + vat))

  const toggle = () => setExpanded((value) => !value)

  return (
    <div className="cart">
      <button onClick={toggle}>
        {items.length} sản phẩm · {total.toLocaleString('vi-VN')}₫
      </button>

      {expanded && (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.name} × {item.qty}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
