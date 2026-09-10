import { useActionState, useOptimistic, useState, useTransition } from 'react'
import { App, Alert, Button, Checkbox, Input, Space, Tag } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'

import { fakeRequest, nextId } from '../../../lib/fakeServer'

type Todo = { id: string; title: string; done: boolean; pending?: boolean }

const INITIAL: Todo[] = [
  { id: 't1', title: 'Chuẩn bị slide React 19', done: true },
  { id: 't2', title: 'Dựng app demo', done: false },
]

// #region demo
/** 3 loại thao tác lạc quan trên cùng một danh sách */
type OptimisticAction =
  | { type: 'add'; title: string }
  | { type: 'toggle'; id: string }
  | { type: 'delete'; id: string }

function optimisticReducer(current: Todo[], action: OptimisticAction): Todo[] {
  switch (action.type) {
    case 'add':
      return [...current, { id: `tmp-${Date.now()}`, title: action.title, done: false, pending: true }]
    case 'toggle':
      return current.map((t) => (t.id === action.id ? { ...t, done: !t.done, pending: true } : t))
    case 'delete':
      return current.filter((t) => t.id !== action.id)
  }
}

function useTodos() {
  const { message: toast } = App.useApp()

  const [todos, setTodos] = useState<Todo[]>(INITIAL)
  const [optimisticTodos, applyOptimistic] = useOptimistic(todos, optimisticReducer)
  const [, startTransition] = useTransition()

  // useActionState: quản lý luôn cả trạng thái pending và lỗi trả về của form
  const [formError, addAction, isAdding] = useActionState(
    async (_previousError: string | null, formData: FormData) => {
      const title = String(formData.get('title') ?? '').trim()
      if (!title) return 'Bạn chưa nhập tên công việc'

      applyOptimistic({ type: 'add', title })

      try {
        const saved = await fakeRequest<Todo>({ id: nextId('todo'), title, done: false })
        setTodos((prev) => [...prev, saved])
        return null
      } catch {
        return 'Thêm thất bại — dòng vừa hiện đã tự biến mất'
      }
    },
    null,
  )

  function toggleTodo(id: string) {
    startTransition(async () => {
      applyOptimistic({ type: 'toggle', id })
      try {
        await fakeRequest(null)
        startTransition(() =>
          setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))),
        )
      } catch {
        toast.error('Đổi trạng thái thất bại — ô tick tự bỏ chọn lại')
      }
    })
  }

  function deleteTodo(id: string) {
    startTransition(async () => {
      applyOptimistic({ type: 'delete', id })
      try {
        await fakeRequest(null)
        startTransition(() => setTodos((prev) => prev.filter((t) => t.id !== id)))
      } catch {
        toast.error('Xoá thất bại — dòng vừa biến mất đã quay trở lại')
      }
    })
  }

  return { optimisticTodos, addAction, formError, isAdding, toggleTodo, deleteTodo }
}
// #endregion

export default function TodoDemo() {
  const { optimisticTodos, addAction, formError, isAdding, toggleTodo, deleteTodo } = useTodos()

  return (
    <div>
      <form action={addAction}>
        <Space.Compact style={{ width: '100%' }}>
          <Input name="title" placeholder="Thêm việc mới rồi Enter..." autoComplete="off" />
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={isAdding}>
            Thêm
          </Button>
        </Space.Compact>
      </form>

      {formError && (
        <Alert type="error" showIcon title={formError} style={{ marginTop: 10 }} banner />
      )}

      <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
        {optimisticTodos.map((todo) => (
          <div
            key={todo.id}
            className="panel-box"
            style={{
              padding: '9px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              opacity: todo.pending ? 0.55 : 1,
              borderStyle: todo.pending ? 'dashed' : 'solid',
            }}
          >
            <Checkbox checked={todo.done} onChange={() => toggleTodo(todo.id)} />
            <span style={{ flex: 1, textDecoration: todo.done ? 'line-through' : 'none' }}>
              {todo.title}
            </span>
            {todo.pending && (
              <Tag color="orange" className="mono" style={{ marginInlineEnd: 0 }}>
                đang chờ server
              </Tag>
            )}
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => deleteTodo(todo.id)}
            />
          </div>
        ))}
        {optimisticTodos.length === 0 && <i className="dim">Chưa có việc nào</i>}
      </div>

      <p className="dim" style={{ fontSize: 13, marginTop: 14, marginBottom: 0, lineHeight: 1.7 }}>
        Cả ba thao tác thêm / tick / xoá đều phản hồi tức thì. Bật &quot;Luôn lỗi&quot; ở bảng
        điều khiển trên cùng rồi thao tác tiếp: mọi thứ tự quay về nguyên trạng mà trong code
        không có lấy một dòng rollback.
      </p>
    </div>
  )
}
