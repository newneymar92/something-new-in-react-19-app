import { Alert, Col, Row } from 'antd'
import { Link } from 'react-router-dom'

import CodeBlock from '../../components/CodeBlock'
import DemoCard from '../../components/DemoCard'
import ServerPanel from '../../components/ServerPanel'
import { PageHeader, SectionTitle } from '../../components/PageHeader'
import { extractRegion, stripImports } from '../../lib/source'

import AsyncActionDemo from './demos/AsyncActionDemo'
import SearchDemo from './demos/SearchDemo'
import TabsDemo from './demos/TabsDemo'
import { GOTCHAS, REACT18_WAY, SIGNATURE } from './snippets'

import asyncActionRaw from './demos/AsyncActionDemo.tsx?raw'
import searchRaw from './demos/SearchDemo.tsx?raw'
import slowListRaw from './demos/SlowList.tsx?raw'
import tabsRaw from './demos/TabsDemo.tsx?raw'

export default function UseTransitionPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tính năng 04"
        title="useTransition"
        lede={
          <>
            Đánh dấu một cập nhật là <b>không gấp</b> để React được phép hoãn, tạm dừng giữa chừng
            và bỏ dở khi có thao tác mới. Phép tính nặng vẫn chạy đủ — nhưng ô nhập và cú click{' '}
            <b>không còn phải xếp hàng chờ nó</b>.
          </>
        }
        tags={['React 18+', 'React 19', 'Concurrent rendering', 'Actions']}
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
            <h4 style={{ marginTop: 0 }}>Gấp và không gấp</h4>
            <ul className="dim" style={{ paddingLeft: 18, lineHeight: 1.95, marginBottom: 0 }}>
              <li>
                <b style={{ color: 'var(--text)' }}>Cập nhật gấp</b> — gõ phím, click, kéo thả. Người
                dùng chờ phản hồi ngay; React render một mạch, không dừng.
              </li>
              <li>
                <b style={{ color: 'var(--primary)' }}>Cập nhật không gấp</b> — lọc danh sách, chuyển
                tab, chuyển trang. Chậm một nhịp không sao; React render từng đoạn nhỏ và nhường lượt
                cho cập nhật gấp.
              </li>
              <li>
                <b style={{ color: 'var(--warning)' }}>isPending</b> — cờ báo cập nhật không gấp chưa
                hiển thị xong, dùng để làm mờ hoặc hiện loading.
              </li>
            </ul>
            <Alert
              style={{ marginTop: 14 }}
              type="info"
              showIcon
              title="Khác gì React Compiler?"
              description={
                <span className="dim">
                  Compiler <b>bỏ qua</b> phép tính khi đầu vào không đổi (xem{' '}
                  <Link to="/react-compiler">ví dụ lọc 2000 sản phẩm</Link>). Khi đầu vào đổi thật và
                  phép tính bắt buộc phải chạy, compiler không giúp được — lúc đó cần{' '}
                  <code>useTransition</code> để UI không bị khựng.
                </span>
              }
            />
          </div>
        </Col>
      </Row>

      <SectionTitle num="1">Ví dụ 1 — Ô tìm kiếm không còn khựng</SectionTitle>

      <DemoCard
        title="Tách một state thành hai: gấp cho ô nhập, không gấp cho danh sách"
        description={
          <>
            Mỗi bên có ô nhập riêng và cùng render một danh sách 200 sản phẩm, mỗi sản phẩm tốn khoảng
            0,5ms. Đồng hồ trong ô nhập đo thật từ lúc gõ phím tới lúc chữ hiện ra.
          </>
        }
        code={[
          {
            key: 'now',
            label: 'Code đang chạy',
            code: extractRegion(searchRaw, 'demo'),
            language: 'tsx',
            maxHeight: 560,
          },
          {
            key: 'slow',
            label: 'SlowList',
            code: stripImports(slowListRaw),
            language: 'tsx',
            maxHeight: 560,
          },
        ]}
      >
        <SearchDemo />
      </DemoCard>

      <SectionTitle num="2">Ví dụ 2 — Chuyển tab nặng</SectionTitle>

      <DemoCard
        title="Bấm tab khác được ngay cả khi tab trước chưa render xong"
        description={
          <>
            Tab <b>Sản phẩm</b> render 1000 sản phẩm (khoảng nửa giây). Không có transition, cú click
            đó khoá cả trang; có transition, React vẫn nhận cú click tiếp theo và bỏ dở lần render cũ.
          </>
        }
        code={{
          code: extractRegion(tabsRaw, 'demo'),
          language: 'tsx',
          maxHeight: 520,
        }}
      >
        <TabsDemo />
      </DemoCard>

      <SectionTitle num="3">Ví dụ 3 — Mới ở React 19: transition nhận hàm async</SectionTitle>
      <ServerPanel />

      <DemoCard
        title="isPending tự kéo dài suốt thời gian await"
        description={
          <>
            React 18 chỉ cho truyền hàm đồng bộ vào <code>startTransition</code>, nên trạng thái
            &quot;đang lưu&quot; phải tự quản lý. React 19 gọi hàm async trong transition là{' '}
            <b>Action</b>: <code>isPending</code> bật từ lúc bấm tới khi hàm chạy xong. Kéo độ trễ
            server lên rồi bấm Lưu, sau đó thử chế độ <b>Luôn lỗi</b>.
          </>
        }
        code={[
          {
            key: 'new',
            label: '✅ React 19 (code đang chạy)',
            code: extractRegion(asyncActionRaw, 'demo'),
            language: 'tsx',
            maxHeight: 520,
          },
          { key: 'old', label: '❌ React 18', code: REACT18_WAY, language: 'tsx', maxHeight: 520 },
        ]}
      >
        <AsyncActionDemo />
      </DemoCard>

      <SectionTitle num="4">Năm điều dễ vấp</SectionTitle>

      <DemoCard
        title="Checklist trước khi rắc startTransition khắp nơi"
        description="Năm lỗi hay gặp nhất khi mới dùng useTransition."
        code={{ code: GOTCHAS, language: 'tsx', showLineNumbers: false }}
        codeOnly
      />

      <SectionTitle num="5">Chốt lại — khi nào dùng gì</SectionTitle>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <div className="panel-box" style={{ height: '100%' }}>
            <h4 style={{ marginTop: 0, color: 'var(--success)' }}>React Compiler / useMemo</h4>
            <p className="dim" style={{ marginTop: 0 }}>
              Phép tính <b>thừa</b>: đầu vào không đổi mà vẫn tính lại.
            </p>
            <ul className="dim" style={{ paddingLeft: 18, lineHeight: 1.9, marginBottom: 0 }}>
              <li>Gõ ô không liên quan mà danh sách vẫn lọc lại</li>
              <li>Con render lại dù props không đổi</li>
              <li>→ Bỏ qua hẳn phép tính</li>
            </ul>
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div className="panel-box" style={{ height: '100%' }}>
            <h4 style={{ marginTop: 0, color: 'var(--primary)' }}>useTransition</h4>
            <p className="dim" style={{ marginTop: 0 }}>
              Render <b>nặng nhưng bắt buộc</b>.
            </p>
            <ul className="dim" style={{ paddingLeft: 18, lineHeight: 1.9, marginBottom: 0 }}>
              <li>Lọc / tìm kiếm trên danh sách lớn</li>
              <li>Chuyển tab, chuyển trang</li>
              <li>Gửi form async (React 19)</li>
              <li>→ Vẫn tính đủ, nhưng UI không bị khoá</li>
            </ul>
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div className="panel-box" style={{ height: '100%' }}>
            <h4 style={{ marginTop: 0, color: 'var(--warning)' }}>Debounce / Web Worker</h4>
            <p className="dim" style={{ marginTop: 0 }}>
              Vấn đề <b>không nằm ở render</b>.
            </p>
            <ul className="dim" style={{ paddingLeft: 18, lineHeight: 1.9, marginBottom: 0 }}>
              <li>Gọi API theo từng phím → debounce</li>
              <li>Một phép tính lớn không chia nhỏ được → Web Worker</li>
            </ul>
          </div>
        </Col>
      </Row>
    </>
  )
}
