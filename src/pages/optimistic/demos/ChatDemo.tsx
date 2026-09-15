import { useEffect, useOptimistic, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { App, Button, Input, Space, Tag } from "antd";
import { SendOutlined } from "@ant-design/icons";

import { fakeRequest, nextId, nowTime } from "../../../lib/fakeServer";

type Message = {
  id: string;
  text: string;
  author: "me" | "them";
  time: string;
  /** true = mới chỉ nằm trong optimistic state, server chưa xác nhận */
  pending?: boolean;
};

const INITIAL: Message[] = [
  { id: "m1", text: "Chiều nay đi cafe nhé?", author: "them", time: "14:02" },
  { id: "m2", text: "Ok, mình đi 👍", author: "me", time: "14:03" },
];

// #region demo
export default function ChatDemo() {
  const { message: toast } = App.useApp();

  // (1) State THẬT — chỉ đổi khi server xác nhận
  const [messages, setMessages] = useState<Message[]>(INITIAL);

  // (2) State LẠC QUAN — chỉ tồn tại trong lúc action đang chạy
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (current: Message[], text: string): Message[] => [
      ...current,
      {
        id: `tmp-${Date.now()}`,
        text,
        author: "me",
        time: nowTime(),
        pending: true,
      },
    ],
  );

  // (3) Action của form — React tự bọc trong transition
  async function sendAction(formData: FormData) {
    const text = String(formData.get("text") ?? "").trim();
    if (!text) return;

    addOptimisticMessage(text); // hiện lên NGAY, không chờ server

    try {
      const saved = await fakeRequest<Message>({
        id: nextId("msg"),
        text,
        author: "me",
        time: nowTime(),
      });
      setMessages((prev) => [...prev, saved]); // chốt vào state thật
    } catch {
      // Không cần tự xoá tin nhắn: action kết thúc là optimistic state
      // bị huỷ, UI quay về đúng `messages`.
      toast.error("Gửi thất bại — tin nhắn tự biến mất khỏi khung chat");
    }
  }

  return (
    <form action={sendAction}>
      <ChatWindow messages={optimisticMessages} />
      <Space.Compact style={{ width: "100%", marginTop: 12 }}>
        <Input
          name="text"
          placeholder="Nhập tin nhắn rồi Enter..."
          autoComplete="off"
        />
        <SendButton />
      </Space.Compact>
    </form>
  );
}

/** useFormStatus đọc được trạng thái của <form> cha — không cần truyền prop */
function SendButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="primary"
      htmlType="submit"
      icon={<SendOutlined />}
      loading={pending}
    >
      Gửi
    </Button>
  );
}
// #endregion

function ChatWindow({ messages }: { messages: Message[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const pendingCount = messages.filter((m) => m.pending).length;

  return (
    <>
      <Space size={8} style={{ marginBottom: 8 }} wrap>
        <Tag className="mono">
          state thật: {messages.filter((m) => !m.pending).length} tin
        </Tag>
        <Tag className="mono" color={pendingCount ? "orange" : "default"}>
          đang optimistic: {pendingCount} tin
        </Tag>
      </Space>

      <div className="chat-window">
        {messages.map((m) => (
          <div
            key={m.id}
            className={[
              "bubble",
              m.author === "me" ? "bubble--me" : "bubble--them",
              m.pending ? "bubble--pending" : "",
            ].join(" ")}
          >
            {m.text}
            <span className="bubble__meta">
              {m.time}
              {m.pending ? " · đang gửi…" : " · ✓ đã gửi"}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </>
  );
}
