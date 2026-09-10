import { useOptimistic, useState, useTransition } from 'react'
import { App, Button, Space, Statistic, Switch, Tag, Tooltip } from 'antd'
import { HeartFilled, HeartOutlined } from '@ant-design/icons'

import { fakeRequest } from '../../../lib/fakeServer'

type Post = { liked: boolean; likes: number }

// #region demo
/** Toàn bộ logic like nằm gọn trong một custom hook */
function useLike(initial: Post) {
  const { message: toast } = App.useApp()

  const [post, setPost] = useState<Post>(initial) // state thật
  const [isPending, startTransition] = useTransition()

  const [optimisticPost, setOptimisticLike] = useOptimistic(
    post,
    (current: Post, liked: boolean): Post => ({
      liked,
      likes: current.likes + (liked ? 1 : -1),
    }),
  )

  function toggleLike() {
    // ⚠️ BẮT BUỘC gọi setOptimistic bên trong transition (hoặc trong form action).
    // Gọi ngoài transition thì React cảnh báo và huỷ giá trị lạc quan ngay lập tức.
    startTransition(async () => {
      const nextLiked = !optimisticPost.liked
      setOptimisticLike(nextLiked)

      try {
        const saved = await fakeRequest<Post>({
          liked: nextLiked,
          likes: post.likes + (nextLiked ? 1 : -1),
        })
        startTransition(() => setPost(saved))
      } catch {
        // Không cần code rollback: hết action là optimistic state bị bỏ đi.
        toast.error('Server từ chối — số like tự quay về giá trị cũ')
      }
    })
  }

  return { post, optimisticPost, isPending, toggleLike }
}
// #endregion

export default function LikeDemo() {
  const { post, optimisticPost, isPending, toggleLike } = useLike({ liked: false, likes: 128 })

  return (
    <div>
      <div className="panel-box" style={{ textAlign: 'center', padding: '22px 16px' }}>
        <div className="dim" style={{ fontSize: 13, marginBottom: 4 }}>
          Bài viết: &quot;React 19 có gì mới&quot;
        </div>

        <Button
          size="large"
          type={optimisticPost.liked ? 'primary' : 'default'}
          danger={optimisticPost.liked}
          icon={optimisticPost.liked ? <HeartFilled /> : <HeartOutlined />}
          onClick={toggleLike}
          style={{ marginTop: 10 }}
        >
          {optimisticPost.likes} lượt thích
        </Button>

        <div style={{ marginTop: 14 }}>
          <Tag color={isPending ? 'orange' : 'default'} className="mono">
            {isPending ? 'đang chờ server…' : 'đã đồng bộ'}
          </Tag>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, marginTop: 16, justifyContent: 'center' }}>
        <Tooltip title="Giá trị người dùng đang NHÌN THẤY">
          <Statistic
            title="Optimistic (UI)"
            value={optimisticPost.likes}
            styles={{ content: { fontSize: 22, color: 'var(--primary)' } }}
          />
        </Tooltip>
        <Tooltip title="Giá trị server đã xác nhận">
          <Statistic title="State thật" value={post.likes} styles={{ content: { fontSize: 22 } }} />
        </Tooltip>
      </div>

      <WrongWayDemo />
    </div>
  )
}

/** Phần phụ: bật công tắc để thấy hậu quả khi gọi setOptimistic sai chỗ */
function WrongWayDemo() {
  const [wrongMode, setWrongMode] = useState(false)
  const [value, setValue] = useState(0)
  const [optimisticValue, setOptimisticValue] = useOptimistic(
    value,
    (_current: number, next: number) => next,
  )
  const [, startTransition] = useTransition()

  async function run() {
    if (wrongMode) {
      // ❌ SAI: gọi ngoài transition -> React warning, giá trị bị huỷ ngay
      setOptimisticValue(999)
      await fakeRequest(null, { latency: 900 })
      setValue((v) => v + 1)
      return
    }

    // ✅ ĐÚNG
    startTransition(async () => {
      setOptimisticValue(999)
      await fakeRequest(null, { latency: 900 })
      startTransition(() => setValue((v) => v + 1))
    })
  }

  return (
    <div className="panel-box" style={{ marginTop: 16 }}>
      <Space wrap size={12}>
        <Switch checked={wrongMode} onChange={setWrongMode} />
        <span className={wrongMode ? '' : 'dim'}>
          Gọi <code>setOptimistic</code> ngoài transition (cách SAI)
        </span>
      </Space>
      <div style={{ marginTop: 12 }}>
        <Space wrap>
          <Button onClick={run}>Chạy thử</Button>
          <Tag className="mono">đang hiển thị: {optimisticValue}</Tag>
          <Tag className="mono">state thật: {value}</Tag>
        </Space>
      </div>
      <p className="dim" style={{ fontSize: 12.5, marginTop: 10, marginBottom: 0, lineHeight: 1.7 }}>
        Bật công tắc rồi bấm &quot;Chạy thử&quot; và mở Console: React in cảnh báo{' '}
        <i>&quot;An optimistic state update occurred outside a transition…&quot;</i>, đồng thời số 999
        biến mất ngay lập tức thay vì hiển thị trong lúc chờ.
      </p>
    </div>
  )
}
