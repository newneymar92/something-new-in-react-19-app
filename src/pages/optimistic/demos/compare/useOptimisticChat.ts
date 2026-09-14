import { useOptimistic, useState, useTransition } from 'react'
import { App } from 'antd'

import { nextId, nowTime } from '../../../../lib/fakeServer'
import type { ChatBackend, ChatMessage, SendOptions } from './chatBackend'

// #region demo
export function useOptimisticChat(backend: ChatBackend, initial: ChatMessage[]) {
  const { message: toast } = App.useApp()

  const [messages, setMessages] = useState(initial) // state thật
  const [optimisticMessages, addOptimistic] = useOptimistic(
    messages,
    (current: ChatMessage[], draft: ChatMessage) => [...current, draft],
  )
  const [, startTransition] = useTransition()

  function send(text: string, opts?: SendOptions) {
    startTransition(async () => {
      addOptimistic({ id: nextId('tmp'), text, time: nowTime(), pending: true })

      try {
        const saved = await backend.send(text, opts)
        startTransition(() => setMessages((prev) => [...prev, saved]))
      } catch {
        // Không có dòng rollback nào: hết action là giá trị lạc quan tự biến mất
        toast.error(`useOptimistic: "${text}" gửi thất bại`)
      }
    })
  }

  return { messages: optimisticMessages, send }
}
// #endregion
