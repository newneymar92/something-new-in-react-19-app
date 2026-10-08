export const VIA_VARIABLES = `// Cách thứ hai của TanStack: KHÔNG sửa cache, render tạm từ \`variables\`
function Chat() {
  const queryClient = useQueryClient()
  const { data: messages = [] } = useQuery({ queryKey: ['chat'], queryFn: api.list })

  const { mutate } = useMutation({
    mutationKey: ['chat', 'send'],
    mutationFn: api.send,
    // trả về promise: mutation giữ trạng thái pending tới khi tải lại xong → không bị nháy
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['chat'] }),
  })

  // variables của MỌI mutation đang chờ (kể cả được gọi từ component khác)
  const pending = useMutationState({
    filters: { mutationKey: ['chat', 'send'], status: 'pending' },
    select: (mutation) => ({
      text: mutation.state.variables as string,
      submittedAt: mutation.state.submittedAt,
    }),
  })

  return (
    <>
      {messages.map((m) => <Bubble key={m.id} text={m.text} />)}
      {pending.map((p) => <Bubble key={p.submittedAt} text={p.text} pending />)}
    </>
  )
}

// Lỗi → mutation hết pending → bong bóng tạm tự biến mất, không cần rollback.
// Hợp khi chỉ MỘT chỗ trên UI cần hiển thị giá trị tạm.`
