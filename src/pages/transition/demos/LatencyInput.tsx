import { useLayoutEffect, useRef } from 'react'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

type LatencyInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * Ô nhập kèm đồng hồ "độ trễ phím": từ lúc trình duyệt tạo sự kiện gõ phím (`e.timeStamp` —
 * tính cả thời gian sự kiện phải xếp hàng khi main thread bận) tới lúc React commit giá trị mới
 * vào ô nhập. Con số được ghi thẳng vào DOM nên việc đo không gây thêm lần render nào.
 */
export default function LatencyInput({ value, onChange, placeholder }: LatencyInputProps) {
  /** Mốc thời gian của phím SỚM NHẤT chưa được hiển thị lên ô nhập */
  const pendingSince = useRef<number | null>(null)
  const outputRef = useRef<HTMLSpanElement>(null)

  // Không truyền deps: chạy sau mọi lần commit của ô nhập
  useLayoutEffect(() => {
    const since = pendingSince.current
    if (since === null || !outputRef.current) return
    outputRef.current.textContent = `${Math.round(performance.now() - since)} ms`
    pendingSince.current = null
  })

  return (
    <Input
      prefix={<SearchOutlined />}
      value={value}
      placeholder={placeholder}
      onChange={(e) => {
        if (pendingSince.current === null) pendingSince.current = e.timeStamp
        onChange(e.target.value)
      }}
      // suffix luôn có mặt: antd remount ô nhập (mất focus) nếu suffix bật/tắt
      suffix={
        <span ref={outputRef} className="mono dim" style={{ fontSize: 12 }}>
          — ms
        </span>
      }
    />
  )
}
