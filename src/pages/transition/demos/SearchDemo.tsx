import { useState, useTransition } from 'react'
import { Alert } from 'antd'

import LatencyInput from './LatencyInput'
import SlowList from './SlowList'

// #region demo
/** ❌ Một state lo cả hai việc: mỗi phím phải chờ 200 sản phẩm render xong mới hiện chữ */
function SearchBlocking() {
  const [query, setQuery] = useState('')

  return (
    <>
      <LatencyInput value={query} onChange={setQuery} placeholder="Gõ tên hãng, vd: Dell" />
      <SlowList query={query} limit={200} />
    </>
  )
}

/** ✅ Tách làm hai state: ô nhập cập nhật gấp, danh sách cập nhật "không gấp" */
function SearchWithTransition() {
  const [text, setText] = useState('')
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleChange(value: string) {
    setText(value) // gấp: ô nhập hiện chữ ngay
    startTransition(() => setQuery(value)) // không gấp: React được hoãn và ngắt giữa chừng
  }

  return (
    <>
      <LatencyInput value={text} onChange={handleChange} placeholder="Gõ tên hãng, vd: Dell" />
      <div style={{ opacity: isPending ? 0.5 : 1, transition: 'opacity 0.15s' }}>
        <SlowList query={query} limit={200} />
      </div>
    </>
  )
}
// #endregion

export default function SearchDemo() {
  return (
    <div>
      <div
        style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}
      >
        <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
          <b style={{ color: 'var(--danger)' }}>❌ Không transition</b>
          <SearchBlocking />
        </div>
        <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
          <b style={{ color: 'var(--success)' }}>✅ Có useTransition</b>
          <SearchWithTransition />
        </div>
      </div>

      <Alert
        style={{ marginTop: 16 }}
        type="info"
        showIcon
        title="Cách diễn cho khán giả"
        description={
          <span className="dim">
            Gõ nhanh tên một hãng (vd &quot;Dell&quot;, &quot;Asus&quot;) vào ô bên trái: chữ hiện
            ra bị khựng, đồng hồ trong ô nhập nhảy lên cỡ 100ms trở lên. Làm y hệt ở ô bên phải: chữ
            hiện ngay, độ trễ chỉ vài ms — danh sách mờ đi một nhịp rồi mới cập nhật.
          </span>
        }
      />
    </div>
  )
}
