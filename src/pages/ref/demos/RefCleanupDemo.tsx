import { useCallback, useState } from 'react'
import { Button, Space, Switch, Tag } from 'antd'
import { ClearOutlined } from '@ant-design/icons'

type LogLine = { id: number; time: string; text: string; kind: 'attach' | 'detach' | 'resize' }

let logSeed = 0

export default function RefCleanupDemo() {
  const [mounted, setMounted] = useState(true)
  const [logs, setLogs] = useState<LogLine[]>([])
  const [size, setSize] = useState({ w: 0, h: 0 })

  // #region demo
  const boxRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: Math.round(width), h: Math.round(height) })
      pushLog(setLogs, 'resize', `kích thước ${Math.round(width)}×${Math.round(height)}`)
    })
    observer.observe(node)
    pushLog(setLogs, 'attach', 'ResizeObserver đã được gắn vào node')

    // ✨ ĐIỂM MỚI CỦA REACT 19:
    // ref callback được phép TRẢ VỀ một hàm dọn dẹp, y hệt useEffect.
    return () => {
      observer.disconnect()
      pushLog(setLogs, 'detach', 'ResizeObserver đã được ngắt (cleanup chạy)')
    }
  }, [])
  // #endregion

  return (
    <div>
      <Space wrap size={16} style={{ marginBottom: 14 }}>
        <Space size={8}>
          <Switch checked={mounted} onChange={setMounted} />
          <span>Hiển thị ô theo dõi</span>
        </Space>
        <Tag className="mono" color="blue">
          {size.w} × {size.h} px
        </Tag>
        <Button size="small" icon={<ClearOutlined />} onClick={() => setLogs([])}>
          Xoá log
        </Button>
      </Space>

      {mounted ? (
        <div ref={boxRef} className="resize-box" style={{ width: 220, height: 110 }}>
          Kéo góc dưới-phải để resize
        </div>
      ) : (
        <div className="dim" style={{ height: 110, display: 'grid', placeItems: 'center' }}>
          Ô đã bị gỡ khỏi cây DOM
        </div>
      )}

      <div className="log-view" style={{ marginTop: 14 }}>
        {logs.length === 0 && <span className="dim">Chưa có sự kiện nào…</span>}
        {logs.map((line) => (
          <div key={line.id} className="log-view__line">
            <span className="log-view__t">{line.time}</span>
            <span
              style={{
                color:
                  line.kind === 'attach'
                    ? 'var(--success)'
                    : line.kind === 'detach'
                      ? 'var(--danger)'
                      : 'var(--text-dim)',
              }}
            >
              {line.kind === 'attach' ? '▲' : line.kind === 'detach' ? '▼' : '·'} {line.text}
            </span>
          </div>
        ))}
      </div>

      <p className="dim" style={{ fontSize: 13, marginTop: 14, marginBottom: 0, lineHeight: 1.75 }}>
        Tắt/bật công tắc vài lần và nhìn log: mỗi lần gắn đều có đúng một lần dọn dẹp tương ứng.
        Trước React 19, muốn làm việc này phải tự giữ observer trong một <code>useRef</code> rồi
        kiểm tra <code>node === null</code> để ngắt — dài dòng và rất dễ rò rỉ bộ nhớ.
      </p>
    </div>
  )
}

function pushLog(
  setLogs: React.Dispatch<React.SetStateAction<LogLine[]>>,
  kind: LogLine['kind'],
  text: string,
) {
  logSeed += 1
  const line: LogLine = {
    id: logSeed,
    kind,
    text,
    time: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
  }
  setLogs((prev) => [...prev.slice(-40), line])
}
