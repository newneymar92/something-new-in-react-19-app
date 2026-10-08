import {
  AimOutlined,
  ArrowRightOutlined,
  FieldTimeOutlined,
  RocketOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Col, Row, Space, Tag } from "antd";
import { version } from "react";
import { Link } from "react-router-dom";

const TOPICS = [
  {
    to: "/react-compiler",
    icon: <RocketOutlined />,
    title: "React Compiler",
    tag: "Tự động memo hoá",
    desc: "Trình biên dịch tự chèn cache vào code của bạn. Xoá sạch useMemo / useCallback / React.memo mà app vẫn nhanh — thậm chí nhanh hơn.",
    points: [
      "So sánh A/B ngay trong 1 app",
      "Xem code sau khi compile",
      "Khi nào compiler bỏ qua",
    ],
  },
  {
    to: "/use-optimistic",
    icon: <ThunderboltOutlined />,
    title: "useOptimistic",
    tag: "UI phản hồi tức thì",
    desc: "Hiển thị kết quả trước khi server trả lời, và tự động rollback khi thất bại — không cần tự quản lý đống state tạm.",
    points: [
      "Chat gửi tin nhắn",
      "Nút Like chống spam click",
      "Form + useActionState",
      "So với TanStack Query",
    ],
  },
  {
    to: "/ref-as-prop",
    icon: <AimOutlined />,
    title: "ref là prop bình thường",
    tag: "Tạm biệt forwardRef",
    desc: "Function component nhận thẳng ref qua props. Kèm theo đó: ref callback giờ có thể trả về hàm cleanup.",
    points: [
      "forwardRef vs ref prop",
      "useImperativeHandle",
      "Cleanup cho ref callback",
    ],
  },
  {
    to: "/use-transition",
    icon: <FieldTimeOutlined />,
    title: "useTransition",
    tag: "UI không bị khựng",
    desc: "Đánh dấu cập nhật nặng là không gấp để ô nhập và cú click luôn phản hồi ngay. React 19 cho truyền thẳng hàm async vào transition.",
    points: [
      "Ô tìm kiếm không khựng",
      "Chuyển tab nặng",
      "Transition nhận hàm async",
    ],
  },
];

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <Tag color="blue" className="mono">
          Demo · React {version}
        </Tag>
        <h1>Có gì mới &amp; lạ trong React 19?</h1>
      </section>

      <Row gutter={[20, 20]} style={{ marginTop: 26 }}>
        {TOPICS.map((topic) => (
          <Col key={topic.to} xs={24} md={12} xl={6}>
            <Link to={topic.to} className="topic-card">
              <div className="topic-card__icon">{topic.icon}</div>
              <Space size={8} align="center">
                <span style={{ fontSize: 21, fontWeight: 700 }}>
                  {topic.title}
                </span>
              </Space>
              <Tag color="blue" style={{ width: "fit-content" }}>
                {topic.tag}
              </Tag>
              <p
                className="dim"
                style={{ margin: "4px 0 10px", lineHeight: 1.65 }}
              >
                {topic.desc}
              </p>
              <ul
                className="dim"
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  lineHeight: 1.9,
                  fontSize: 14,
                }}
              >
                {topic.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <span
                style={{
                  marginTop: "auto",
                  paddingTop: 16,
                  color: "var(--primary)",
                  fontWeight: 600,
                }}
              >
                Xem demo <ArrowRightOutlined />
              </span>
            </Link>
          </Col>
        ))}
      </Row>
    </>
  );
}
