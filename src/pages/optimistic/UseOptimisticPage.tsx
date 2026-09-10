import { Alert, Col, Row } from 'antd'

import CodeBlock from '../../components/CodeBlock'
import DemoCard from '../../components/DemoCard'
import ServerPanel from '../../components/ServerPanel'
import { PageHeader, SectionTitle } from '../../components/PageHeader'
import { extractRegion } from '../../lib/source'

import ChatDemo from './demos/ChatDemo'
import LikeDemo from './demos/LikeDemo'
import TodoDemo from './demos/TodoDemo'
import { GOTCHAS, NEW_WAY, OLD_WAY, SIGNATURE } from './snippets'

import chatRaw from './demos/ChatDemo.tsx?raw'
import likeRaw from './demos/LikeDemo.tsx?raw'
import todoRaw from './demos/TodoDemo.tsx?raw'

export default function UseOptimisticPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tính năng 02"
        title="useOptimistic"
        lede={
          <>
            Hiển thị kết quả <b>trước khi</b> server kịp trả lời, và nếu thất bại thì UI tự quay về
            như cũ. Điểm lạ nằm ở chỗ: bạn <b>không viết một dòng rollback nào</b> — React tự vứt bỏ
            giá trị lạc quan khi action kết thúc.
          </>
        }
        tags={['React 19', 'Actions', 'useTransition', 'useActionState', 'useFormStatus']}
      />

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={13}>
          <div className="demo-card" style={{ marginBottom: 0, height: '100%' }}>
            <div className="demo-pane__label">
              <span>Chữ ký &amp; cách hoạt động</span>
            </div>
            <CodeBlock code={SIGNATURE} language="tsx" showLineNumbers={false} />
          </div>
        </Col>
        <Col xs={24} lg={11}>
          <div className="panel-box" style={{ height: '100%' }}>
            <h4 style={{ marginTop: 0 }}>Ba trạng thái cần phân biệt</h4>
            <ul className="dim" style={{ paddingLeft: 18, lineHeight: 1.95, marginBottom: 0 }}>
              <li>
                <b style={{ color: 'var(--text)' }}>State thật</b> — dữ liệu server đã xác nhận.
              </li>
              <li>
                <b style={{ color: 'var(--primary)' }}>State lạc quan</b> — cái người dùng đang nhìn
                thấy, chỉ sống trong lúc action chạy.
              </li>
              <li>
                <b style={{ color: 'var(--warning)' }}>Pending</b> — cờ báo &quot;đang chờ&quot;, lấy
                từ <code>useTransition</code>, <code>useActionState</code> hoặc{' '}
                <code>useFormStatus</code>.
              </li>
            </ul>
            <Alert
              style={{ marginTop: 14 }}
              type="warning"
              showIcon
              title="Quy tắc số một"
              description={
                <span className="dim">
                  <code>addOptimistic()</code> chỉ có tác dụng khi được gọi bên trong một action hoặc
                  <code> startTransition</code>. Gọi ngoài ra là React cảnh báo và huỷ ngay — có demo
                  bấm thử ở ví dụ 2.
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
            Kéo độ trễ lên 2–3 giây rồi gửi vài tin: bong bóng mờ hiện ra tức thì, đủ thời gian để cả
            phòng nhìn thấy. Sau đó bật <b>Luôn lỗi</b> và gửi tiếp.
          </>
        }
        code={[
          {
            key: 'now',
            label: 'Code đang chạy',
            code: extractRegion(chatRaw, 'demo'),
            language: 'tsx',
            maxHeight: 640,
            highlight: [7, 8, 9, 10, 11, 12, 13, 14, 21],
          },
          { key: 'old', label: '❌ Cách cũ', code: OLD_WAY, language: 'tsx', maxHeight: 640 },
          { key: 'new', label: '✅ Cách mới', code: NEW_WAY, language: 'tsx', maxHeight: 640 },
        ]}
        wideCode
      >
        <ChatDemo />
      </DemoCard>

      <SectionTitle num="3">Ví dụ 2 — Nút Like và chuyện bấm liên tục</SectionTitle>

      <DemoCard
        title="Toggle lạc quan + cái bẫy gọi ngoài transition"
        description={
          <>
            Ví dụ này dùng <code>useTransition</code> thay cho form action, và có sẵn công tắc để bấm
            thử <b>cách gọi sai</b> — thứ mà đọc tài liệu suông rất khó hình dung.
          </>
        }
        code={{
          code: extractRegion(likeRaw, 'demo'),
          language: 'tsx',
          maxHeight: 520,
        }}
      >
        <LikeDemo />
      </DemoCard>

      <SectionTitle num="4">Ví dụ 3 — Danh sách công việc: thêm / tick / xoá</SectionTitle>

      <DemoCard
        title="useOptimistic + useActionState cho CRUD thật"
        description={
          <>
            Trường hợp sát thực tế nhất: một reducer lạc quan phục vụ cả ba thao tác, form dùng{' '}
            <code>useActionState</code> để có sẵn cờ pending và thông báo lỗi.
          </>
        }
        code={{
          code: extractRegion(todoRaw, 'demo'),
          language: 'tsx',
          maxHeight: 620,
        }}
        wideCode
      >
        <TodoDemo />
      </DemoCard>

      <SectionTitle num="5">Bốn điều dễ vấp</SectionTitle>

      <DemoCard
        title="Checklist trước khi mang lên production"
        description="Bốn lỗi hay gặp nhất khi mới dùng useOptimistic."
        code={{ code: GOTCHAS, language: 'tsx', showLineNumbers: false }}
        codeOnly
      />
    </>
  )
}
