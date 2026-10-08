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
