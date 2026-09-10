import { Alert, Col, Row, Tag, Typography } from 'antd'

import CodeBlock from '../../components/CodeBlock'
import DemoCard from '../../components/DemoCard'
import { PageHeader, SectionTitle } from '../../components/PageHeader'
import { extractRegion } from '../../lib/source'
import { COMPILED_SAMPLES } from '../../generated/compilerOutput'

import AutoMemoDemo from './demos/AutoMemoDemo'
import AutoUseMemoDemo from './demos/AutoUseMemoDemo'
import AutoUseCallbackDemo from './demos/AutoUseCallbackDemo'
import BailoutDemo from './demos/BailoutDemo'
import CartSummary from './samples/CartSummary'
import {
  CALLBACK_FIX_WAY,
  CALLBACK_OLD_WAY,
  DIRECTIVE_SNIPPET,
  ESLINT_SNIPPET,
  INSTALL_SNIPPET,
  MEMO_NEW_WAY,
  MEMO_OLD_WAY,
} from './snippets'

// Đọc thẳng source của chính các file demo (tính năng ?raw của Vite)
import autoMemoRaw from './demos/AutoMemoDemo.tsx?raw'
import autoUseMemoRaw from './demos/AutoUseMemoDemo.tsx?raw'
import autoUseCallbackRaw from './demos/AutoUseCallbackDemo.tsx?raw'
import bailoutRaw from './demos/BailoutDemo.tsx?raw'
import cartSummaryRaw from './samples/CartSummary.tsx?raw'
import viteConfigRaw from '../../../vite.config.ts?raw'

const CART_ITEMS = [
  { id: 1, name: 'Bàn phím cơ Keychron K2', price: 2_190_000, qty: 1 },
  { id: 2, name: 'Chuột Logitech MX Master 3S', price: 2_450_000, qty: 2 },
  { id: 3, name: 'Kê tay gỗ óc chó', price: 390_000, qty: 1 },
]

export default function ReactCompilerPage() {
  const compiledSample = COMPILED_SAMPLES['cart-summary']
  const sourceLines = cartSummaryRaw.trim().split('\n').length
  const compiledLines = compiledSample.compiled.trim().split('\n').length

  return (
    <>
      <PageHeader
        eyebrow="Tính năng 01"
        title="React Compiler"
        lede={
          <>
            React Compiler đọc code của bạn lúc build và tự chèn cache vào đúng những chỗ trước đây
            phải viết tay bằng <code>useMemo</code>, <code>useCallback</code> và{' '}
            <code>React.memo</code>. Bạn viết code React thuần tuý nhất có thể, phần tối ưu để máy lo.
            Điều bất ngờ: nó là một <b>trình biên dịch</b>, không phải hook hay API runtime.
          </>
        }
        tags={['babel-plugin-react-compiler', 'build-time', 'Rules of React', 'React 19']}
      />

      <Alert
        type="info"
        showIcon
        title="App này đang bật React Compiler thật"
        description={
          <span className="dim">
            Mọi con số bạn thấy bên dưới là đo trực tiếp trong trình duyệt, không phải quay video.
            Phía &quot;không có compiler&quot; được tắt bằng directive <code>&quot;use no memo&quot;</code> —
            tức là hai bên chạy cùng một code, chỉ khác đúng một dòng.
          </span>
        }
      />

      {/* ------------------------------------------------------------------ */}
      <SectionTitle num="1">Bật lên như thế nào?</SectionTitle>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={10}>
          <div className="demo-card" style={{ marginBottom: 0, height: '100%' }}>
            <div className="demo-pane__label">
              <span>Cài đặt</span>
            </div>
            <CodeBlock code={INSTALL_SNIPPET} language="bash" showLineNumbers={false} />
          </div>
        </Col>
        <Col xs={24} lg={14}>
          <div className="demo-card" style={{ marginBottom: 0, height: '100%' }}>
            <div className="demo-pane__label">
              <span>vite.config.ts — file thật của dự án này</span>
              <Tag color="blue" style={{ marginInlineEnd: 0 }}>
                đang chạy
              </Tag>
            </div>
            <CodeBlock code={viteConfigRaw.trim()} language="ts" highlight={[9]} />
          </div>
        </Col>
      </Row>

      <Typography.Paragraph className="dim" style={{ marginTop: 14 }}>
        Chỉ có vậy. Không import gì thêm trong code ứng dụng, không đổi cách viết component. Compiler
        chạy ở bước build nên <b>không hề làm tăng kích thước runtime của React</b>.
      </Typography.Paragraph>

      {/* ------------------------------------------------------------------ */}
      <SectionTitle num="2">Ví dụ 1 — Con không còn render lại vô ích</SectionTitle>

      <DemoCard
        title="Cùng một component, chỉ khác một dòng directive"
        description={
          <>
            Hai bên dưới đây dùng <b>chung một</b> component con <code>TeamList</code>. Bên trái bị
            tắt compiler, bên phải để compiler làm việc. Bấm nút đổi state ở cha và nhìn bộ đếm.
          </>
        }
        code={[
          {
            key: 'now',
            label: 'Code đang chạy',
            code: extractRegion(autoMemoRaw, 'demo'),
            language: 'tsx',
            maxHeight: 620,
          },
          {
            key: 'old',
            label: '❌ Cách cũ (React 18)',
            code: MEMO_OLD_WAY,
            language: 'tsx',
            maxHeight: 620,
          },
          {
            key: 'new',
            label: '✅ Cách mới',
            code: MEMO_NEW_WAY,
            language: 'tsx',
            maxHeight: 620,
          },
        ]}
      >
        <AutoMemoDemo />
      </DemoCard>

      {/* ------------------------------------------------------------------ */}
      <SectionTitle num="3">Ví dụ 2 — useMemo tự động cho tính toán nặng</SectionTitle>

      <DemoCard
        title="Lọc 2000 sản phẩm mỗi lần gõ phím?"
        description={
          <>
            Một tình huống rất hay gặp: màn hình có ô tìm kiếm và vài state lặt vặt khác. Thiếu{' '}
            <code>useMemo</code>, mọi thay đổi state đều kéo theo cả phép lọc nặng chạy lại.
          </>
        }
        code={{
          code: extractRegion(autoUseMemoRaw, 'demo'),
          language: 'tsx',
          maxHeight: 420,
        }}
      >
        <AutoUseMemoDemo />
      </DemoCard>

      {/* ------------------------------------------------------------------ */}
      <SectionTitle num="4">Ví dụ 3 — Cái bẫy React.memo + hàm mũi tên</SectionTitle>

      <DemoCard
        title="Bọc React.memo rồi mà con vẫn render lại"
        description={
          <>
            Đây là lỗi hiệu năng bị bỏ sót nhiều nhất trong code review: prop là hàm viết thẳng trong
            JSX nên lần render nào cũng là một tham chiếu mới, khiến <code>React.memo</code> so sánh
            luôn thất bại.
          </>
        }
        code={[
          {
            key: 'now',
            label: 'Code đang chạy',
            code: extractRegion(autoUseCallbackRaw, 'demo'),
            language: 'tsx',
            maxHeight: 620,
          },
          {
            key: 'trap',
            label: '❌ Cái bẫy',
            code: CALLBACK_OLD_WAY,
            language: 'tsx',
            maxHeight: 620,
          },
          {
            key: 'fix',
            label: '🩹 Chữa kiểu cũ',
            code: CALLBACK_FIX_WAY,
            language: 'tsx',
            maxHeight: 620,
          },
        ]}
      >
        <AutoUseCallbackDemo />
      </DemoCard>

      {/* ------------------------------------------------------------------ */}
      <SectionTitle num="5">Ví dụ 4 — Compiler đã viết lại code của bạn ra sao?</SectionTitle>

      <DemoCard
        title={`${sourceLines} dòng bạn viết → ${compiledLines} dòng compiler sinh ra`}
        description={
          <>
            Đây là output THẬT, sinh bằng <code>npm run gen:compiled</code> từ chính file{' '}
            <code>{compiledSample.file}</code>. Component bên phải là component đó đang chạy. Chú ý
            mảng <code>$</code> — đó là bộ nhớ cache, và <code>_c(21)</code> nghĩa là component này
            cần 21 ô nhớ.
          </>
        }
        wideCode
        code={[
          {
            key: 'src',
            label: '✍️ Bạn viết',
            code: cartSummaryRaw.trim(),
            language: 'tsx',
            maxHeight: 560,
          },
          {
            key: 'out',
            label: '⚙️ Compiler sinh ra',
            code: compiledSample.compiled,
            language: 'jsx',
            maxHeight: 560,
            highlight: [15, 16],
          },
        ]}
        resultLabel="Component đó đang chạy"
      >
        <div className="panel-box">
          <CartSummary items={CART_ITEMS} vat={0.08} />
          <p className="dim" style={{ fontSize: 13, marginTop: 14, marginBottom: 0, lineHeight: 1.7 }}>
            Bấm vào nút để mở/đóng danh sách. Ba điểm đáng nói trong output:
          </p>
          <ul className="dim" style={{ fontSize: 13, lineHeight: 1.8, paddingLeft: 18, marginBottom: 0 }}>
            <li>
              <code>const $ = _c(21)</code> — xin React cấp 21 ô nhớ gắn với instance component.
            </li>
            <li>
              <code>if ($[0] !== items.length || ...)</code> — so sánh dependency y hệt{' '}
              <code>useMemo</code>, nhưng do máy tự sinh nên không bao giờ thiếu deps.
            </li>
            <li>
              <code>Symbol.for(&quot;react.memo_cache_sentinel&quot;)</code> — đánh dấu ô nhớ chưa
              từng được ghi, dùng cho giá trị hằng chỉ tính đúng một lần.
            </li>
          </ul>
        </div>
      </DemoCard>

      {/* ------------------------------------------------------------------ */}
      <SectionTitle num="6">Ví dụ 5 — Khi nào compiler bỏ qua component?</SectionTitle>

      <DemoCard
        title="Compiler chỉ tối ưu code tuân thủ Rules of React"
        description={
          <>
            Nếu phát hiện code có thể làm nó hiểu sai, compiler sẽ <b>lặng lẽ bỏ qua</b> component đó
            chứ không làm hỏng app. Nghĩa là bật compiler rất an toàn — nhưng cũng có nghĩa là bạn
            nên chạy lint để biết chỗ nào đang bị bỏ lỡ.
          </>
        }
        code={[
          {
            key: 'now',
            label: 'Code đang chạy',
            code: extractRegion(bailoutRaw, 'demo'),
            language: 'tsx',
            maxHeight: 560,
          },
          {
            key: 'directive',
            label: 'Directive & chế độ',
            code: DIRECTIVE_SNIPPET,
            language: 'tsx',
            maxHeight: 560,
          },
          {
            key: 'eslint',
            label: 'ESLint',
            code: ESLINT_SNIPPET,
            language: 'js',
            maxHeight: 560,
          },
        ]}
      >
        <BailoutDemo />
      </DemoCard>

      {/* ------------------------------------------------------------------ */}
      <SectionTitle num="7">Chốt lại</SectionTitle>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <div className="panel-box" style={{ height: '100%' }}>
            <h4 style={{ marginTop: 0, color: 'var(--success)' }}>Được gì</h4>
            <ul className="dim" style={{ paddingLeft: 18, lineHeight: 1.9, marginBottom: 0 }}>
              <li>Bớt 90% code memo hoá thủ công</li>
              <li>Không còn lo quên dependency</li>
              <li>Code review nhẹ đầu hơn hẳn</li>
              <li>Không tăng bundle runtime</li>
            </ul>
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div className="panel-box" style={{ height: '100%' }}>
            <h4 style={{ marginTop: 0, color: 'var(--warning)' }}>Cần lưu ý</h4>
            <ul className="dim" style={{ paddingLeft: 18, lineHeight: 1.9, marginBottom: 0 }}>
              <li>Thời gian build tăng lên</li>
              <li>Code vi phạm Rules of React bị bỏ qua âm thầm</li>
              <li>
                Vẫn cần <code>React.memo</code> ở vài trường hợp biên
              </li>
              <li>Debug khó hơn vì code chạy khác code viết</li>
            </ul>
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div className="panel-box" style={{ height: '100%' }}>
            <h4 style={{ marginTop: 0, color: 'var(--primary)' }}>Áp dụng cho team</h4>
            <ol className="dim" style={{ paddingLeft: 18, lineHeight: 1.9, marginBottom: 0 }}>
              <li>
                Chạy <code>react-compiler-healthcheck</code>
              </li>
              <li>Bật eslint-plugin-react-hooks, dọn sạch cảnh báo</li>
              <li>
                Bật ở chế độ <code>annotation</code> cho vài màn hình nóng
              </li>
              <li>Đo, rồi mới bật toàn bộ</li>
            </ol>
          </div>
        </Col>
      </Row>
    </>
  )
}
