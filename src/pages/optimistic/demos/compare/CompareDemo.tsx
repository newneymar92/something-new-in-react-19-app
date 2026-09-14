import { useState } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  useIsMutating,
  useQuery,
} from '@tanstack/react-query'
import { Alert, Button, Input, Segmented, Space, Tag, Tooltip } from 'antd'
import { SendOutlined, ThunderboltOutlined } from '@ant-design/icons'

import MessageList from './MessageList'
import {
  SEED_MESSAGES,
  createChatBackend,
  type ChatBackend,
  type SendOptions,
} from './chatBackend'
import { useOptimisticChat } from './useOptimisticChat'
import { useTanstackChatBasic, useTanstackChatBetter } from './useTanstackChat'

type Mode = 'basic' | 'better'

const MODE_OPTIONS: { label: string; value: Mode }[] = [
  { label: 'Cơ bản', value: 'basic' },
  { label: 'Chuẩn hơn', value: 'better' },
]

/** Kịch bản cố định (bỏ qua bảng điều khiển) để lần trình diễn nào cũng giống nhau */
const BURST: { text: string; opts: SendOptions }[] = [
  { text: 'Tin 1 (sẽ lỗi)', opts: { latency: 800, fail: true } },
  { text: 'Tin 2', opts: { latency: 1600, fail: false } },
  { text: 'Tin 3', opts: { latency: 2400, fail: false } },
]

const COLUMN_HEAD = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 8,
  minHeight: 32,
  marginBottom: 8,
} as const

function Composer({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const value = text.trim()
        if (!value) return
        onSend(value)
        setText('')
      }}
    >
      <Space.Compact style={{ width: '100%', marginTop: 10 }}>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập tin rồi Enter…"
          autoComplete="off"
        />
        <Button type="primary" htmlType="submit" icon={<SendOutlined />} />
      </Space.Compact>
    </form>
  )
}

/** Component thứ HAI đọc chung cache ['chat'] — chỉ cần cùng queryKey là thấy tin lạc quan */
function InboxBadge({ backend }: { backend: ChatBackend }) {
  const { data = [] } = useQuery({ queryKey: ['chat'], queryFn: backend.list })
  const sending = useIsMutating({ mutationKey: ['chat', 'send'] })

  return (
    <div className="panel-box" style={{ marginTop: 10, padding: '8px 12px', fontSize: 13 }}>
      <span className="dim">Một component khác đọc chung cache:</span>{' '}
      <Tag className="mono">hộp thư: {data.length} tin</Tag>
      <Tag className="mono" color={sending ? 'orange' : 'default'} style={{ marginInlineEnd: 0 }}>
        mutation đang chạy: {sending}
      </Tag>
    </div>
  )
}

function CompareColumns({
  leftBackend,
  rightBackend,
}: {
  leftBackend: ChatBackend
  rightBackend: ChatBackend
}) {
  const [mode, setMode] = useState<Mode>('basic')

  const left = useOptimisticChat(leftBackend, SEED_MESSAGES)
  // Gọi cả hai hook (cùng queryKey → dùng chung một cache), chế độ nào thì gửi qua hook đó
  const basic = useTanstackChatBasic(rightBackend)
  const better = useTanstackChatBetter(rightBackend)
  const right = mode === 'basic' ? basic : better
  const mutating = useIsMutating({ mutationKey: ['chat', 'send'] })

  function sendBurst() {
    for (const { text, opts } of BURST) {
      left.send(text, opts)
      right.send(text, opts)
    }
  }

  return (
    <div>
      <Space wrap size={12} style={{ marginBottom: 14 }}>
        <Button type="primary" icon={<ThunderboltOutlined />} onClick={sendBurst}>
          Gửi 3 tin cùng lúc
        </Button>
        <span className="dim mono" style={{ fontSize: 12.5 }}>
          Tin 1 lỗi sau 0,8s · Tin 2 xong sau 1,6s · Tin 3 xong sau 2,4s
        </span>
      </Space>

      <div
        style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
      >
        <div>
          <div style={COLUMN_HEAD}>
            <b>useOptimistic</b>
          </div>
          <MessageList messages={left.messages} />
          <Composer onSend={left.send} />
        </div>

        <div>
          <div style={COLUMN_HEAD}>
            <b>TanStack Query</b>
            <Tooltip title={mutating ? 'Chờ các tin đang gửi xong rồi hãy đổi cách viết' : undefined}>
              <Segmented
                size="small"
                value={mode}
                options={MODE_OPTIONS}
                onChange={setMode}
                disabled={mutating > 0}
              />
            </Tooltip>
          </div>
          <MessageList messages={right.messages} />
          <Composer onSend={right.send} />
          <InboxBadge backend={rightBackend} />
        </div>
      </div>

      <Alert
        style={{ marginTop: 16 }}
        type="info"
        showIcon
        title="Cách diễn cho khán giả"
        description={
          <span className="dim">
            Bấm &quot;Gửi 3 tin cùng lúc&quot; ở chế độ <b>Cơ bản</b>: lúc Tin 1 lỗi (0,8s), bên
            TanStack mất luôn cả Tin 2 và Tin 3 đang chờ, rồi từng tin mới hiện lại sau khi tải lại —
            vì snapshot của Tin 1 được chụp trước khi hai tin kia được thêm vào. Chuyển sang{' '}
            <b>Chuẩn hơn</b> và bấm lại: chỉ Tin 1 biến mất, Tin 2 và Tin 3 hiện ✓ đúng lúc server trả
            lời. Bên <code>useOptimistic</code> không nhấp nháy và không có dòng rollback nào, nhưng
            cả ba tin giữ nguyên &quot;đang gửi…&quot; tới khi cả loạt xong (2,4s) — React gộp các
            action đang chạy lại với nhau.
          </span>
        }
      />
    </div>
  )
}

export default function CompareDemo() {
  // QueryClient riêng cho demo này — không cần bọc Provider cho cả app
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false, staleTime: Infinity },
        },
      }),
  )
  const [leftBackend] = useState(createChatBackend)
  const [rightBackend] = useState(createChatBackend)

  return (
    <QueryClientProvider client={queryClient}>
      <CompareColumns leftBackend={leftBackend} rightBackend={rightBackend} />
    </QueryClientProvider>
  )
}
