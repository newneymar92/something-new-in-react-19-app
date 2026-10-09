import { useOptimistic, useState, useTransition } from "react";
import {
  Alert,
  App,
  Button,
  Statistic,
  Tag,
  Tooltip,
} from "antd";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";

import { fakeRequest } from "../../../lib/fakeServer";

type Post = { liked: boolean; likes: number };

// #region demo
/** Toàn bộ logic like nằm gọn trong một custom hook */
function useLike(initial: Post) {
  const { message: toast } = App.useApp();

  const [post, setPost] = useState<Post>(initial); // state thật
  const [isPending, startTransition] = useTransition();

  const [optimisticPost, setOptimisticLike] = useOptimistic(
    post,
    (current: Post, liked: boolean): Post => ({
      liked,
      likes: current.likes + (liked ? 1 : -1),
    }),
  );

  function toggleLike() {
    // ⚠️ BẮT BUỘC gọi setOptimistic bên trong transition (hoặc trong form action).
    // Gọi ngoài transition thì React cảnh báo và huỷ giá trị lạc quan ngay lập tức.
    startTransition(async () => {
      const nextLiked = !optimisticPost.liked;
      setOptimisticLike(nextLiked);

      try {
        const saved = await fakeRequest<Post>({
          liked: nextLiked,
          likes: post.likes + (nextLiked ? 1 : -1),
        });
        startTransition(() => setPost(saved));
      } catch {
        // Không cần code rollback: hết action là optimistic state bị bỏ đi.
        toast.error("Server từ chối — số like tự quay về giá trị cũ");
      }
    });
  }

  return { post, optimisticPost, isPending, toggleLike };
}
// #endregion

export default function LikeDemo() {
  const { post, optimisticPost, isPending, toggleLike } = useLike({
    liked: false,
    likes: 128,
  });

  return (
    <div>
      <div
        className="panel-box"
        style={{ textAlign: "center", padding: "22px 16px" }}
      >
        <div className="dim" style={{ fontSize: 13, marginBottom: 4 }}>
          Bài viết: &quot;React 19 có gì mới&quot;
        </div>

        <Button
          size="large"
          type={optimisticPost.liked ? "primary" : "default"}
          danger={optimisticPost.liked}
          icon={optimisticPost.liked ? <HeartFilled /> : <HeartOutlined />}
          onClick={toggleLike}
          style={{ marginTop: 10 }}
        >
          {optimisticPost.likes} lượt thích
        </Button>

        <div style={{ marginTop: 14 }}>
          <Tag color={isPending ? "orange" : "default"} className="mono">
            {isPending ? "đang chờ server…" : "đã đồng bộ"}
          </Tag>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 24,
          marginTop: 16,
          justifyContent: "center",
        }}
      >
        <Tooltip title="Giá trị người dùng đang NHÌN THẤY">
          <Statistic
            title="Optimistic (UI)"
            value={optimisticPost.likes}
            styles={{ content: { fontSize: 22, color: "var(--primary)" } }}
          />
        </Tooltip>
        <Tooltip title="Giá trị server đã xác nhận">
          <Statistic
            title="State thật"
            value={post.likes}
            styles={{ content: { fontSize: 22 } }}
          />
        </Tooltip>
      </div>

      <Alert
        style={{ marginTop: 16 }}
        type="info"
        showIcon
        title="Ví dụ này cho thấy gì"
        description={
          <span className="dim">
            <b>Hai con số đặt cạnh nhau.</b> &quot;Optimistic (UI)&quot; chỉ là
            lớp phủ tạm lên &quot;State thật&quot;. Server từ chối thì khối{" "}
            <code>catch</code> chỉ có đúng một dòng báo lỗi, không một dòng
            rollback nào, mà số vẫn tự quay về.
          </span>
        }
      />
    </div>
  );
}
