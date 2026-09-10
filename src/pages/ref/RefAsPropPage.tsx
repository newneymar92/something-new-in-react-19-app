import { Alert, Col, Row } from 'antd'

import CodeBlock from '../../components/CodeBlock'
import DemoCard from '../../components/DemoCard'
import { PageHeader, SectionTitle } from '../../components/PageHeader'
import { extractRegion } from '../../lib/source'

import RefPropDemo from './demos/RefPropDemo'
import RefLayersDemo from './demos/RefLayersDemo'
import ImperativeHandleDemo from './demos/ImperativeHandleDemo'
import RefCleanupDemo from './demos/RefCleanupDemo'
import {
  CLEANUP_NEW,
  CLEANUP_OLD,
  MIGRATION,
  NEW_REF_PROP,
  OLD_FORWARD_REF,
  TS_GOTCHA,
} from './snippets'

import refPropRaw from './demos/RefPropDemo.tsx?raw'
import refLayersRaw from './demos/RefLayersDemo.tsx?raw'
import imperativeRaw from './demos/ImperativeHandleDemo.tsx?raw'
import cleanupRaw from './demos/RefCleanupDemo.tsx?raw'

export default function RefAsPropPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tính năng 03"
        title="ref trở thành prop bình thường"
        lede={
          <>
            Từ React 19, function component nhận <code>ref</code> ngay trong <code>props</code> —{' '}
            <code>forwardRef</code> không còn cần thiết và đã bị đánh dấu deprecated. Đi kèm là một
            thay đổi ít người để ý nhưng rất hữu ích: <b>ref callback có thể trả về hàm cleanup</b>.
          </>
        }
        tags={['ref as prop', 'forwardRef deprecated', 'ref cleanup', 'useImperativeHandle']}
      />

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <div className="demo-card" style={{ marginBottom: 0, height: '100%' }}>
            <div className="demo-pane__label">
              <span style={{ color: 'var(--danger)' }}>Trước — React 18</span>
            </div>
            <CodeBlock code={OLD_FORWARD_REF} language="tsx" />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="demo-card" style={{ marginBottom: 0, height: '100%' }}>
            <div className="demo-pane__label">
              <span style={{ color: 'var(--success)' }}>Sau — React 19</span>
            </div>
            <CodeBlock code={NEW_REF_PROP} language="tsx" />
          </div>
        </Col>
      </Row>

      <Alert
        style={{ marginTop: 20 }}
        type="warning"
        showIcon
        title="forwardRef vẫn chạy, nhưng sẽ bị gỡ ở bản sau"
        description={
          <span className="dim">
            Code cũ không vỡ ngay — React 19 vẫn hỗ trợ <code>forwardRef</code>. Nhưng nó đã
            deprecated, nên hãy chuyển dần. Lưu ý: thay đổi này chỉ áp dụng cho{' '}
            <b>function component</b>; class component vẫn dùng ref theo cách cũ.
          </span>
        }
      />

      <SectionTitle num="1">Ví dụ 1 — Ô nhập liệu nhận ref</SectionTitle>

      <DemoCard
        title="Một function component thuần, không lớp bọc nào"
        description={
          <>
            Ví dụ nhỏ nhất có thể: destructure <code>ref</code> từ props rồi gắn vào thẻ{' '}
            <code>&lt;input&gt;</code>. Ba nút bên phải điều khiển ô nhập qua ref.
          </>
        }
        code={{ code: extractRegion(refPropRaw, 'demo'), language: 'tsx', maxHeight: 520 }}
      >
        <RefPropDemo />
      </DemoCard>

      <SectionTitle num="2">Ví dụ 2 — Ref xuyên qua nhiều lớp component</SectionTitle>

      <DemoCard
        title="Form validate: nhảy con trỏ vào ô sai đầu tiên"
        description={
          <>
            Đây là chỗ <code>forwardRef</code> gây khó chịu nhất trong thực tế: design system nào
            cũng có <code>Input</code> → <code>FormField</code> → <code>FormRow</code>, và lớp nào
            cũng phải bọc. Giờ chỉ là truyền một prop xuống dưới.
          </>
        }
        code={{ code: extractRegion(refLayersRaw, 'demo'), language: 'tsx', maxHeight: 600 }}
        wideCode
      >
        <RefLayersDemo />
      </DemoCard>

      <SectionTitle num="3">Ví dụ 3 — Công bố API mệnh lệnh với useImperativeHandle</SectionTitle>

      <DemoCard
        title="Component cha gọi start() / pause() / reset() của con"
        description={
          <>
            <code>useImperativeHandle</code> vẫn nguyên vẹn, chỉ khác là <code>ref</code> giờ đến từ
            props. Kiểu dữ liệu cũng dễ đọc hơn nhiều so với generic của{' '}
            <code>forwardRef</code>.
          </>
        }
        code={{ code: extractRegion(imperativeRaw, 'demo'), language: 'tsx', maxHeight: 560 }}
      >
        <ImperativeHandleDemo />
      </DemoCard>

      <SectionTitle num="4">Ví dụ 4 — Ref callback có hàm cleanup</SectionTitle>

      <DemoCard
        title="Gắn ResizeObserver rồi tự động ngắt khi unmount"
        description={
          <>
            Tính năng &quot;lạ&quot; nhất trong nhóm này: ref callback giờ hành xử như{' '}
            <code>useEffect</code> — trả về hàm dọn dẹp và React sẽ gọi đúng lúc. Rất hợp cho
            observer, event listener, thư viện chart/map bên thứ ba.
          </>
        }
        code={[
          {
            key: 'now',
            label: 'Code đang chạy',
            code: extractRegion(cleanupRaw, 'demo'),
            language: 'tsx',
            maxHeight: 560,
          },
          { key: 'old', label: '❌ Cách cũ', code: CLEANUP_OLD, language: 'tsx', maxHeight: 560 },
          { key: 'new', label: '✅ Cách mới', code: CLEANUP_NEW, language: 'tsx', maxHeight: 560 },
        ]}
      >
        <RefCleanupDemo />
      </DemoCard>

      <SectionTitle num="5">Chuyển đổi &amp; bẫy TypeScript</SectionTitle>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={10}>
          <div className="demo-card" style={{ marginBottom: 0, height: '100%' }}>
            <div className="demo-pane__label">
              <span>Codemod chính thức</span>
            </div>
            <CodeBlock code={MIGRATION} language="bash" showLineNumbers={false} />
          </div>
        </Col>
        <Col xs={24} lg={14}>
          <div className="demo-card" style={{ marginBottom: 0, height: '100%' }}>
            <div className="demo-pane__label">
              <span>Những chỗ hay vấp</span>
            </div>
            <CodeBlock code={TS_GOTCHA} language="tsx" showLineNumbers={false} />
          </div>
        </Col>
      </Row>
    </>
  )
}
