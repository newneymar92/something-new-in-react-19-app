import { useEffect, useRef } from 'react'
import { Tag } from 'antd'

import type { ChatMessage } from './chatBackend'

export default function MessageList({ messages }: { messages: ChatMessage[] }) {
  const boxRef = useRef<HTMLDivElement>(null)

  // Cuộn TRONG khung chat — không dùng scrollIntoView vì hai cột cùng cập nhật sẽ kéo cả trang
  useEffect(() => {
    const box = boxRef.current
    if (box) box.scrollTop = box.scrollHeight
  }, [messages.length])

  const pendingCount = messages.filter((m) => m.pending).length

  return (
    <>
      <div style={{ marginBottom: 8 }}>
        <Tag className="mono" color={pendingCount ? 'orange' : 'default'}>
          đang chờ server: {pendingCount}
        </Tag>
      </div>
      <div ref={boxRef} className="chat-window" style={{ height: 250 }}>
        {messages.map((m) => (
          <div
            key={m.id}
            className={[
              'bubble',
              m.id.startsWith('seed') ? 'bubble--them' : 'bubble--me',
              m.pending ? 'bubble--pending' : '',
            ].join(' ')}
          >
            {m.text}
            <span className="bubble__meta">
              {m.time}
              {m.pending ? ' · đang gửi…' : ' · ✓ đã gửi'}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}
