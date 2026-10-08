import { useRef, useState } from 'react'
import { Alert, Button, Space } from 'antd'

import CompiledBadge from '../../../components/CompiledBadge'
import RenderBadge from '../../../components/RenderBadge'
import { useRenderCount } from '../../../hooks/useRenderCount'

/** Component con không nhận prop nào — chỉ để đếm xem nó bị kéo theo render bao nhiêu lần */
function Child() {
  const renders = useRenderCount()
  return <RenderBadge label="con render" value={renders} tone={renders > 1 ? 'hot' : 'cool'} />
}

// #region demo
/** ✅ Component "sạch": tuân thủ Rules of React -> compiler xử lý bình thường */
function GoodComponent({ n }: { n: number }) {
  const [on, setOn] = useState(false)
  const label = `${n} lượt · ${on ? 'đang mở' : 'đang đóng'}`

  return (
    <>
      <button onClick={() => setOn((v) => !v)}>{label}</button>
      <Child /> {/* compiler cache sẵn phần tử này → con không render lại */}
    </>
  )
}

/**
 * ❌ Đọc/ghi ref.current NGAY TRONG lúc render là vi phạm Rules of React.
 * Compiler phát hiện được nên nó bỏ qua component này (bail-out) để khỏi
 * làm sai hành vi — huy hiệu bên cạnh chứng minh điều đó.
 */
function BrokenComponent({ n }: { n: number }) {
  const previous = useRef(n)
  // eslint-disable-next-line react-hooks/refs -- CỐ Ý vi phạm, đây là nội dung của demo
  const delta = n - previous.current // <- đọc ref trong render
  // eslint-disable-next-line react-hooks/refs -- CỐ Ý vi phạm, đây là nội dung của demo
  previous.current = n // <- ghi ref trong render

  return (
    <>
      <span>
        n = {n}, thay đổi {delta >= 0 ? `+${delta}` : delta}
      </span>
      <Child /> {/* bị bỏ qua → mất luôn cache → con render lại theo */}
    </>
  )
}

/** ✅ Cùng chức năng với BrokenComponent, nhưng nhớ giá trị cũ bằng STATE thay vì ref */
function FixedComponent({ n }: { n: number }) {
  const [prev, setPrev] = useState(n)
  const [delta, setDelta] = useState(0)
  if (n !== prev) {
    // n vừa đổi → cập nhật ngay trong lúc render (React cho phép với state của chính component)
    setPrev(n)
    setDelta(n - prev)
  }

  return (
    <>
      <span>
        n = {n}, thay đổi {delta >= 0 ? `+${delta}` : delta}
      </span>
      <Child />
    </>
  )
}

/** ❌ Chủ động tắt compiler cho riêng component này bằng directive */
function OptedOutComponent({ n }: { n: number }) {
  'use no memo'

  return (
    <>
      <span>Component này tự nguyện đứng ngoài: n = {n}</span>
      <Child />
    </>
  )
}
// #endregion

const ROW_STYLE = { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } as const

export default function BailoutDemo() {
  const [n, setN] = useState(1)
  const renders = useRenderCount()

  return (
    <div>
      <Space wrap style={{ marginBottom: 14 }}>
        <Button type="primary" onClick={() => setN((v) => v + 1)}>
          Tăng n
        </Button>
        <RenderBadge label="demo render" value={renders} />
      </Space>

      <div style={{ display: 'grid', gap: 12 }}>
        <div className="panel-box" style={{ padding: 12 }}>
          <Space wrap size={8} style={{ marginBottom: 8 }}>
            <b className="mono">GoodComponent</b>
            <CompiledBadge fn={GoodComponent} name="GoodComponent" />
          </Space>
          <div style={ROW_STYLE}>
            <GoodComponent n={n} />
          </div>
        </div>

        <div className="panel-box" style={{ padding: 12 }}>
          <Space wrap size={8} style={{ marginBottom: 8 }}>
            <b className="mono">BrokenComponent</b>
            <CompiledBadge fn={BrokenComponent} name="BrokenComponent" />
          </Space>
          <div style={ROW_STYLE}>
            <BrokenComponent n={n} />
          </div>
          <div className="dim" style={{ fontSize: 12.5, marginTop: 6 }}>
            Đụng vào <code>ref.current</code> trong lúc render → compiler tự động tránh xa, và component
            mất luôn phần tối ưu mà <b>không có cảnh báo nào</b>.
          </div>
        </div>

        <div className="panel-box" style={{ padding: 12 }}>
          <Space wrap size={8} style={{ marginBottom: 8 }}>
            <b className="mono">FixedComponent</b>
            <CompiledBadge fn={FixedComponent} name="FixedComponent" />
          </Space>
          <div style={ROW_STYLE}>
            <FixedComponent n={n} />
          </div>
          <div className="dim" style={{ fontSize: 12.5, marginTop: 6 }}>
            Cùng chức năng với <code>BrokenComponent</code>, chỉ đổi ref thành state → compiler nhận xử
            lý trở lại.
          </div>
        </div>

        <div className="panel-box" style={{ padding: 12 }}>
          <Space wrap size={8} style={{ marginBottom: 8 }}>
            <b className="mono">OptedOutComponent</b>
            <CompiledBadge fn={OptedOutComponent} name="OptedOutComponent" />
          </Space>
          <div style={ROW_STYLE}>
            <OptedOutComponent n={n} />
          </div>
        </div>
      </div>

      <Alert
        style={{ marginTop: 14 }}
        type="success"
        showIcon
        title="Bấm vào huy hiệu để xem source runtime"
        description={
          <span className="dim">
            Bấm &quot;Tăng n&quot; vài lần: &quot;con render&quot; chỉ đứng yên ở 1 trong những
            component được compile. Huy hiệu không phải viết cứng: nó gọi{' '}
            <code>Component.toString()</code> ngay trong trình duyệt và tìm dấu vết{' '}
            <code>_c(...)</code> mà compiler chèn vào. Mở modal ra là thấy code thật đang chạy.
          </span>
        }
      />
    </div>
  )
}
