import { fakeRequest, nextId, nowTime, sleep } from '../../../../lib/fakeServer'

export type ChatMessage = {
  id: string
  text: string
  time: string
  /** true = mới chỉ là giá trị lạc quan, server chưa xác nhận */
  pending?: boolean
}

/** Ghi đè cấu hình server giả cho riêng một request (không truyền = dùng bảng điều khiển) */
export type SendOptions = { latency?: number; fail?: boolean }

export type ChatBackend = {
  list: () => Promise<ChatMessage[]>
  send: (text: string, opts?: SendOptions) => Promise<ChatMessage>
}

/** Tin có sẵn khi mở trang — cả hai cột bắt đầu giống hệt nhau */
export const SEED_MESSAGES: ChatMessage[] = [
  { id: 'seed-1', text: 'Chiều nay demo React 19 nhé?', time: '14:02' },
]

/**
 * "Server chat" giả lưu tin trong bộ nhớ — cần có để TanStack Query có dữ liệu mà fetch lại.
 * `list` luôn thành công (chờ 300ms); `send` đi qua `fakeRequest` nên chịu độ trễ / lỗi của
 * bảng điều khiển, trừ khi `opts` ghi đè.
 */
export function createChatBackend(): ChatBackend {
  let rows = [...SEED_MESSAGES]

  return {
    async list() {
      await sleep(300)
      return [...rows]
    },
    async send(text, opts) {
      const saved = await fakeRequest<ChatMessage>({ id: nextId('msg'), text, time: nowTime() }, opts)
      rows = [...rows, saved]
      return saved
    },
  }
}
