import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import { Button, Space, Tag } from 'antd'
import { PauseOutlined, PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons'

// #region demo
/** API mà component cha được phép gọi — cứ như một ref "có phương thức" */
export type StopwatchHandle = {
  start: () => void
  pause: () => void
  reset: () => void
  /** Có thể trả về giá trị, không nhất thiết chỉ là hành động */
  getElapsed: () => number
}

type StopwatchProps = {
  /** ref nằm chung với các prop khác, không còn là tham số thứ hai */
  ref?: Ref<StopwatchHandle>
  label?: string
}

/**
 * ✅ React 19: nhận `ref` qua props rồi đưa thẳng cho useImperativeHandle.
 * So với trước: không còn forwardRef<StopwatchHandle, Props>(...) bọc bên ngoài.
 */
function Stopwatch({ ref, label }: StopwatchProps) {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)

  useImperativeHandle(
    ref,
    () => ({
      start: () => setRunning(true),
      pause: () => setRunning(false),
      reset: () => {
        setRunning(false)
        setElapsed(0)
      },
      getElapsed: () => elapsed,
    }),
    [elapsed],
  )

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setElapsed((ms) => ms + 100), 100)
    return () => window.clearInterval(id)
  }, [running])

  return (
    <div style={{ textAlign: 'center' }}>
      {label && (
        <div className="dim" style={{ fontSize: 13 }}>
          {label}
        </div>
      )}
      <div className="mono" style={{ fontSize: 40, fontWeight: 600 }}>
        {(elapsed / 1000).toFixed(1)}
        <span className="dim" style={{ fontSize: 18 }}>
          s
        </span>
      </div>
    </div>
  )
}
// #endregion

export default function ImperativeHandleDemo() {
  // Chú ý kiểu: ref trỏ tới StopwatchHandle chứ không phải một phần tử DOM
  const watchRef = useRef<StopwatchHandle>(null)
  const [reading, setReading] = useState<number | null>(null)

  return (
    <div>
      <div className="panel-box" style={{ padding: '18px 16px' }}>
        <Stopwatch ref={watchRef} label="Đồng hồ bấm giờ" />
      </div>

      <Space wrap style={{ marginTop: 14 }}>
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={() => watchRef.current?.start()}
        >
          start()
        </Button>
        <Button icon={<PauseOutlined />} onClick={() => watchRef.current?.pause()}>
          pause()
        </Button>
        <Button icon={<ReloadOutlined />} onClick={() => watchRef.current?.reset()}>
          reset()
        </Button>
        <Button onClick={() => setReading(watchRef.current?.getElapsed() ?? 0)}>getElapsed()</Button>
      </Space>

      {reading !== null && (
        <div style={{ marginTop: 12 }}>
          <Tag color="blue" className="mono">
            getElapsed() trả về {reading} ms
          </Tag>
        </div>
      )}

      <p className="dim" style={{ fontSize: 13, marginTop: 14, marginBottom: 0, lineHeight: 1.75 }}>
        Bốn nút này không truyền prop nào xuống <code>Stopwatch</code> — chúng gọi thẳng các phương
        thức mà component con công bố qua <code>useImperativeHandle</code>. Rất hợp cho những thứ mang
        tính mệnh lệnh: mở modal, focus, play/pause video, cuộn tới vị trí, chạy lại animation.
      </p>
    </div>
  )
}
