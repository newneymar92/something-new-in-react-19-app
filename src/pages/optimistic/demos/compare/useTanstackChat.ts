import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'

import { nextId, nowTime } from '../../../../lib/fakeServer'
import type { ChatBackend, ChatMessage, SendOptions } from './chatBackend'

type SendVariables = { text: string; tempId: string; opts?: SendOptions }

// #region basic
/** Cách viết theo ví dụ trong tài liệu: chụp snapshot → lỗi thì khôi phục snapshot */
export function useTanstackChatBasic(backend: ChatBackend) {
  const { message: toast } = App.useApp()
  const queryClient = useQueryClient()
  const { data: messages = [] } = useQuery({ queryKey: ['chat'], queryFn: backend.list })

  const mutation = useMutation({
    mutationKey: ['chat', 'send'],
    mutationFn: ({ text, opts }: SendVariables) => backend.send(text, opts),

    onMutate: async ({ text, tempId }) => {
      await queryClient.cancelQueries({ queryKey: ['chat'] }) // chặn refetch đang chạy ghi đè
      const previous = queryClient.getQueryData<ChatMessage[]>(['chat']) // tự chụp snapshot
      queryClient.setQueryData<ChatMessage[]>(['chat'], (old = []) => [
        ...old,
        { id: tempId, text, time: nowTime(), pending: true },
      ])
      return { previous }
    },

    onError: (_error, { text }, context) => {
      queryClient.setQueryData(['chat'], context?.previous) // TỰ VIẾT rollback về snapshot
      toast.error(`TanStack: "${text}" gửi thất bại`)
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: ['chat'] }), // tải lại từ server
  })

  function send(text: string, opts?: SendOptions) {
    mutation.mutate({ text, tempId: nextId('tmp'), opts })
  }

  return { messages, send }
}
// #endregion

// #region better
/** Cách viết an toàn khi nhiều request chạy song song */
export function useTanstackChatBetter(backend: ChatBackend) {
  const { message: toast } = App.useApp()
  const queryClient = useQueryClient()
  const { data: messages = [] } = useQuery({ queryKey: ['chat'], queryFn: backend.list })

  const mutation = useMutation({
    mutationKey: ['chat', 'send'],
    mutationFn: ({ text, opts }: SendVariables) => backend.send(text, opts),

    onMutate: async ({ text, tempId }) => {
      await queryClient.cancelQueries({ queryKey: ['chat'] })
      queryClient.setQueryData<ChatMessage[]>(['chat'], (old = []) => [
        ...old,
        { id: tempId, text, time: nowTime(), pending: true },
      ])
    },

    // ✅ Thành công: thay đúng tin tạm bằng tin thật
    onSuccess: (saved, { tempId }) => {
      queryClient.setQueryData<ChatMessage[]>(['chat'], (old = []) =>
        old.map((m) => (m.id === tempId ? saved : m)),
      )
    },

    // ✅ Lỗi: chỉ gỡ đúng tin của mutation này, không đụng tới tin khác đang chờ
    onError: (_error, { text, tempId }) => {
      queryClient.setQueryData<ChatMessage[]>(['chat'], (old = []) =>
        old.filter((m) => m.id !== tempId),
      )
      toast.error(`TanStack: "${text}" gửi thất bại`)
    },

    // ✅ Chỉ tải lại khi đây là mutation cuối cùng còn chạy (con số này tính cả chính nó)
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: ['chat', 'send'] }) === 1) {
        return queryClient.invalidateQueries({ queryKey: ['chat'] })
      }
    },
  })

  function send(text: string, opts?: SendOptions) {
    mutation.mutate({ text, tempId: nextId('tmp'), opts })
  }

  return { messages, send }
}
// #endregion
