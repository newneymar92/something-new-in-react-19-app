import { Alert, Col, Row } from "antd";

import CodeBlock from "../../components/CodeBlock";
import DemoCard from "../../components/DemoCard";
import ServerPanel from "../../components/ServerPanel";
import { PageHeader, SectionTitle } from "../../components/PageHeader";
import { extractRegion } from "../../lib/source";

import ChatDemo from "./demos/ChatDemo";
import LikeDemo from "./demos/LikeDemo";
import {
  ACTIONS,
  CHAT_WITH_USEOPTIMISTIC,
  CHAT_WITH_USESTATE,
  GOTCHAS,
  NEW_WAY,
  OLD_WAY,
  SIGNATURE,
} from "./snippets";

import chatRaw from "./demos/ChatDemo.tsx?raw";
import likeRaw from "./demos/LikeDemo.tsx?raw";

type CompareRow = { aspect: string; left: string; right: string };

const VS_USESTATE_ROWS: CompareRow[] = [
  {
    aspect: "Code xử lý lỗi",
    left: "Tự gỡ tin tạm — phải gỡ đúng theo tempId; lỡ khôi phục snapshot cũ là xoá luôn các tin khác đang chờ",
    right:
      "Không có gì để gỡ: tin tạm chưa từng nằm trong state thật nên không thể viết sai",
  },
  {
    aspect: "State thật",
    left: "Lẫn tin chưa xác nhận → chỗ nào đếm / lưu / gửi messages đi cũng phải lọc pending",
    right:
      "Chỉ chứa tin server đã xác nhận; tin tạm nằm riêng, chỉ để hiển thị",
  },
  {
    aspect: "Dùng bên trong Action",
    left: "❌ setState bị giữ lại tới khi action xong → không còn “lạc quan”",
    right: "✅ Cách duy nhất để hiện giá trị ngay trong lúc action chạy",
  },
  {
    aspect: "Tin gửi lỗi",
    left: "Giữ lại được: đánh dấu failed + nút “Gửi lại”",
    right:
      "Bắt buộc biến mất khi hết action — muốn giữ thì vẫn phải đưa vào state thật",
  },
  {
    aspect: "Gửi dồn dập",
    left: "Tin nào server trả lời thì tin đó hiện ✓ ngay",
    right: "Cả loạt cùng hiện ✓ khi action cuối cùng xong (xem ví dụ 4)",
  },
  {
    aspect: "Phiên bản React",
    left: "Mọi phiên bản, event handler bình thường",
    right: "React 19+",
  },
];

function CompareTable({
  rows,
  leftTitle,
  rightTitle,
}: {
  rows: CompareRow[];
  leftTitle: string;
  rightTitle: string;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 13.5,
          minWidth: 560,
        }}
      >
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th style={{ padding: "6px 10px", width: "20%" }} />
            <th style={{ padding: "6px 10px", color: "var(--primary)" }}>
              {leftTitle}
            </th>
            <th style={{ padding: "6px 10px", color: "var(--warning)" }}>
              {rightTitle}
            </th>
          </tr>
        </thead>
        <tbody className="dim">
          {rows.map((row) => (
            <tr
              key={row.aspect}
              style={{ borderTop: "1px solid var(--border-soft)" }}
            >
              <td
                style={{
                  padding: "8px 10px",
                  color: "var(--text)",
                  fontWeight: 600,
                }}
              >
                {row.aspect}
              </td>
              <td style={{ padding: "8px 10px" }}>{row.left}</td>
              <td style={{ padding: "8px 10px" }}>{row.right}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function UseOptimisticPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tính năng 02"
        title="useOptimistic"
        lede={
          <>
            Hiển thị kết quả <b>trước khi</b> server kịp trả lời, và nếu thất
            bại thì UI tự quay về như cũ. Điểm khác biệt nằm ở chỗ: bạn{" "}
            <b>không viết một dòng rollback nào</b> — React tự vứt bỏ giá trị
            lạc quan khi action kết thúc.
          </>
        }
        tags={[
          "React 19",
          "Actions",
          "useTransition",
          "useActionState",
          "useFormStatus",
        ]}
      />

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={13}>
          <div
            className="demo-card"
            style={{ marginBottom: 0, height: "100%" }}
          >
            <div className="demo-pane__label">
              <span>Chữ ký &amp; cách hoạt động</span>
            </div>
            <CodeBlock
              code={SIGNATURE}
              language="tsx"
              showLineNumbers={false}
            />
          </div>
        </Col>
        <Col xs={24} lg={11}>
          <div className="panel-box" style={{ height: "100%" }}>
            <h4 style={{ marginTop: 0 }}>Ba trạng thái cần phân biệt</h4>
            <ul
              className="dim"
              style={{ paddingLeft: 18, lineHeight: 1.95, marginBottom: 0 }}
            >
              <li>
                <b style={{ color: "var(--text)" }}>State thật</b> — dữ liệu
                server đã xác nhận.
              </li>
              <li>
                <b style={{ color: "var(--primary)" }}>State lạc quan</b> — cái
                người dùng đang nhìn thấy, chỉ sống trong lúc action chạy.
              </li>
              <li>
                <b style={{ color: "var(--warning)" }}>Pending</b> — cờ báo
                &quot;đang chờ&quot;, lấy từ <code>useTransition</code>,{" "}
                <code>useActionState</code> hoặc <code>useFormStatus</code>.
              </li>
            </ul>
          </div>
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        <Col xs={24} lg={13}>
          <div
            className="demo-card"
            style={{ marginBottom: 0, height: "100%" }}
          >
            <div className="demo-pane__label">
              <span>Action là gì?</span>
            </div>
            <CodeBlock code={ACTIONS} language="tsx" showLineNumbers={false} />
          </div>
        </Col>
        <Col xs={24} lg={11}>
          <div className="panel-box" style={{ height: "100%" }}>
            <h4 style={{ marginTop: 0 }}>Vòng đời của một action</h4>
            <div
              className="mono dim"
              style={{
                whiteSpace: "pre",
                overflowX: "auto",
                fontSize: 12.5,
                lineHeight: 1.9,
              }}
            >
              {`bấm Gửi → action bắt đầu
        → addOptimistic(tin)  → UI hiện tin mờ ngay
        → await server…
        → action kết thúc (thành công hay lỗi)
        → React bỏ giá trị lạc quan → hiện lại state thật`}
            </div>
            <p className="dim" style={{ margin: "10px 0 0", lineHeight: 1.7 }}>
              Nhờ biết chính xác lúc action kết thúc, React tự
              &quot;rollback&quot; giá trị lạc quan — bạn không phải viết dòng
              nào.
            </p>
            <Alert
              style={{ marginTop: 14 }}
              type="warning"
              showIcon
              title="Quy tắc số một"
              description={
                <span className="dim">
                  <code>addOptimistic()</code> chỉ có tác dụng khi được gọi bên
                  trong một action. Gọi ngoài ra thì không có action nào để gắn
                  vào: React cảnh báo và huỷ giá trị lạc quan ngay — có demo bấm
                  thử ở ví dụ 2.
                </span>
              }
            />
          </div>
        </Col>
      </Row>

      <SectionTitle num="1">Bảng điều khiển server giả</SectionTitle>
      <ServerPanel />

      <SectionTitle num="2">Ví dụ 1 — Khung chat gửi tin nhắn</SectionTitle>

      <DemoCard
        title="Tin nhắn hiện ngay, thất bại thì tự biến mất"
        description={
          <>
            Kéo độ trễ lên 2–3 giây rồi gửi vài tin: bong bóng mờ hiện ra tức
            thì. Hoặc có thể bật <b>Luôn lỗi</b> và gửi tiếp.
          </>
        }
        code={[
          {
            key: "now",
            label: "Code đang chạy",
            code: extractRegion(chatRaw, "demo"),
            language: "tsx",
            maxHeight: 640,
            highlight: [7, 8, 9, 10, 11, 12, 13, 14, 21],
          },
          {
            key: "old",
            label: "❌ Cách cũ",
            code: OLD_WAY,
            language: "tsx",
            maxHeight: 640,
          },
          {
            key: "new",
            label: "✅ Cách mới",
            code: NEW_WAY,
            language: "tsx",
            maxHeight: 640,
          },
        ]}
        wideCode
      >
        <ChatDemo />
      </DemoCard>

      <SectionTitle num="3">
        Ví dụ 2 — Nút Like và chuyện bấm liên tục
      </SectionTitle>

      <DemoCard
        title="Toggle lạc quan: hiện ngay, lỗi thì tự quay về"
        description={
          <>
            Ví dụ này dùng <code>useTransition</code> thay cho form action —
            cùng một hook nhưng không cần <code>&lt;form&gt;</code>, và giá trị
            lạc quan lần này là <b>toggle</b> chứ không phải thêm vào danh sách.
          </>
        }
        code={{
          code: extractRegion(likeRaw, "demo"),
          language: "tsx",
          maxHeight: 520,
        }}
      >
        <LikeDemo />
      </DemoCard>

      <SectionTitle num="4">useOptimistic hay useState thường?</SectionTitle>

      <DemoCard
        title="Cùng một khung chat, hai cách viết — hành vi giống hệt nhau"
        description={
          <>
            Cả hai đều hiện tin ngay và lỗi thì tin biến mất kèm thông báo. Khác
            nhau nằm ở code xử lý lỗi, độ &quot;sạch&quot; của state thật, và
            việc có dùng được Action của React 19 hay không —{" "}
            <b>
              <code>useOptimistic</code> không phải lúc nào cũng là lựa chọn
              đúng
            </b>
            .
          </>
        }
        code={[
          {
            key: "usestate",
            label: "A. useState + onSubmit",
            code: CHAT_WITH_USESTATE,
            language: "tsx",
          },
          {
            key: "useoptimistic",
            label: "B. useOptimistic + form action",
            code: CHAT_WITH_USEOPTIMISTIC,
            language: "tsx",
          },
        ]}
        codeOnly
        footer={
          <>
            <CompareTable
              rows={VS_USESTATE_ROWS}
              leftTitle="A. useState"
              rightTitle="B. useOptimistic"
            />
            <Row gutter={[16, 16]} style={{ marginTop: 14 }}>
              <Col xs={24} md={12}>
                <div className="panel-box" style={{ height: "100%" }}>
                  <h4 style={{ marginTop: 0, color: "var(--primary)" }}>
                    Chọn useState khi
                  </h4>
                  <ul
                    className="dim"
                    style={{
                      paddingLeft: 18,
                      lineHeight: 1.9,
                      marginBottom: 0,
                    }}
                  >
                    <li>Cần giữ tin lỗi lại để bấm &quot;Gửi lại&quot;</li>
                    <li>Cần ✓ chính xác từng tin khi gửi dồn dập</li>
                    <li>
                      Không dùng form action / useActionState / Server Actions
                    </li>
                    <li>→ App chat thật thường rơi vào đây</li>
                  </ul>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="panel-box" style={{ height: "100%" }}>
                  <h4 style={{ marginTop: 0, color: "var(--warning)" }}>
                    Chọn useOptimistic khi
                  </h4>
                  <ul
                    className="dim"
                    style={{
                      paddingLeft: 18,
                      lineHeight: 1.9,
                      marginBottom: 0,
                    }}
                  >
                    <li>
                      Đã dùng form action / <code>useActionState</code> / Server
                      Actions — lúc này <b>bắt buộc</b>
                    </li>
                    <li>Lỗi thì chỉ cần biến mất + báo lỗi</li>
                    <li>Muốn state thật chỉ chứa dữ liệu đã xác nhận</li>
                    <li>→ Like, thêm việc, đổi tên, gửi comment</li>
                  </ul>
                </div>
              </Col>
            </Row>
          </>
        }
      />

      <SectionTitle num="5">Lưu ý</SectionTitle>

      <DemoCard
        title="Hai lỗi hay gặp nhất khi mới dùng useOptimistic"
        code={{ code: GOTCHAS, language: "tsx", showLineNumbers: false }}
        codeOnly
      />
    </>
  );
}
