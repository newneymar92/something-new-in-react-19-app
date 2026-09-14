import { Alert, Col, Row } from 'antd'

import CodeBlock from '../../components/CodeBlock'
import DemoCard from '../../components/DemoCard'
import ServerPanel from '../../components/ServerPanel'
import { PageHeader, SectionTitle } from '../../components/PageHeader'
import { extractRegion } from '../../lib/source'

import ChatDemo from './demos/ChatDemo'
import LikeDemo from './demos/LikeDemo'
import TodoDemo from './demos/TodoDemo'
import CompareDemo from './demos/compare/CompareDemo'
import { VIA_VARIABLES } from './demos/compare/snippets'
import { GOTCHAS, NEW_WAY, OLD_WAY, SIGNATURE } from './snippets'

import chatRaw from './demos/ChatDemo.tsx?raw'
import likeRaw from './demos/LikeDemo.tsx?raw'
import todoRaw from './demos/TodoDemo.tsx?raw'
import optimisticChatRaw from './demos/compare/useOptimisticChat.ts?raw'
import tanstackChatRaw from './demos/compare/useTanstackChat.ts?raw'

const COMPARE_ROWS = [
  {
    aspect: 'Rollback khi lỗi',
    optimistic: 'Tự động — hết action là giá trị lạc quan biến mất',
    tanstack: 'Tự viết trong onError (hoặc dùng cách qua variables)',
  },
  {
    aspect: 'Giá trị lạc quan nằm ở đâu',
    optimistic: 'Cục bộ trong component gọi hook',
    tanstack: 'Trong cache dùng chung — mọi component cùng queryKey đều thấy',
  },
  {
    aspect: 'Nhiều request song song',
    optimistic: 'Không nhấp nháy, nhưng cả loạt cùng "chốt" khi action cuối cùng xong',
    tanstack: 'Viết cơ bản thì nhấp nháy; viết chuẩn thì chính xác từng tin',
  },
  {
    aspect: 'Phạm vi',
    optimistic: 'Chỉ là một hook UI, không fetch hay cache gì',
    tanstack: 'Quản lý server state đầy đủ: fetch, cache, retry, refetch, invalidate',
  },
  {
    aspect: 'Hợp với',
    optimistic: 'form action, useActionState, Server Actions, app không có thư viện data',
    tanstack: 'App đã dùng TanStack Query cho dữ liệu server',
  },
]

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
        tags={['React 19', 'Actions', 'useTransition', 'useActionState', 'useFormStatus', 'TanStack Query']}
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

      <SectionTitle num="5">Ví dụ 4 — So với TanStack Query</SectionTitle>

      <DemoCard
        title="onMutate cũng set UI trước và rollback được — vậy khác gì?"
        description={
          <>
            Cùng một khung chat, bên trái dùng <code>useOptimistic</code>, bên phải dùng TanStack Query
            (<code>@tanstack/react-query</code> cài thật trong app). Gửi tay từng tin thì hai bên trông
            như nhau — khác biệt chỉ lộ ra khi <b>nhiều request chạy song song và có cái lỗi</b>.
          </>
        }
        code={[
          {
            key: 'optimistic',
            label: 'useOptimistic',
            code: extractRegion(optimisticChatRaw, 'demo'),
            language: 'tsx',
            maxHeight: 640,
          },
          {
            key: 'basic',
            label: 'TanStack — cơ bản',
            code: extractRegion(tanstackChatRaw, 'basic'),
            language: 'tsx',
            maxHeight: 640,
          },
          {
            key: 'better',
            label: 'TanStack — chuẩn hơn',
            code: extractRegion(tanstackChatRaw, 'better'),
            language: 'tsx',
            maxHeight: 640,
          },
          {
            key: 'variables',
            label: 'TanStack — qua variables',
            code: VIA_VARIABLES,
            language: 'tsx',
            maxHeight: 640,
          },
        ]}
        wideCode
        footer={
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: 560 }}>
                <thead>
                  <tr style={{ textAlign: 'left' }}>
                    <th style={{ padding: '6px 10px', width: '20%' }} />
                    <th style={{ padding: '6px 10px', color: 'var(--primary)' }}>useOptimistic</th>
                    <th style={{ padding: '6px 10px', color: 'var(--warning)' }}>TanStack Query</th>
                  </tr>
                </thead>
                <tbody className="dim">
                  {COMPARE_ROWS.map((row) => (
                    <tr key={row.aspect} style={{ borderTop: '1px solid var(--border-soft)' }}>
                      <td style={{ padding: '8px 10px', color: 'var(--text)', fontWeight: 600 }}>
                        {row.aspect}
                      </td>
                      <td style={{ padding: '8px 10px' }}>{row.optimistic}</td>
                      <td style={{ padding: '8px 10px' }}>{row.tanstack}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="dim" style={{ margin: '12px 0 0', lineHeight: 1.7 }}>
              <b style={{ color: 'var(--text)' }}>Chốt:</b> dự án đã dùng TanStack Query thì cứ dùng
              pattern của nó (chỉ một chỗ hiển thị → cách qua <code>variables</code>; nhiều component
              cùng thấy → sửa cache kiểu &quot;chuẩn hơn&quot;). <code>useOptimistic</code> toả sáng khi
              đi cùng form action / Server Actions của React 19 và không muốn thêm thư viện.
            </p>
          </>
        }
      >
        <CompareDemo />
      </DemoCard>

      <SectionTitle num="6">Bốn điều dễ vấp</SectionTitle>

      <DemoCard
        title="Checklist trước khi mang lên production"
        description="Bốn lỗi hay gặp nhất khi mới dùng useOptimistic."
        code={{ code: GOTCHAS, language: 'tsx', showLineNumbers: false }}
        codeOnly
      />
    </>
  )
}
