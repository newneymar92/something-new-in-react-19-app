import { useRef, useState } from 'react'
import { Alert, Input, Space } from 'antd'
import { SearchOutlined, EditOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

import CompiledBadge from '../../../components/CompiledBadge'
import RenderBadge from '../../../components/RenderBadge'
import { useRenderCount, useRenderFlash } from '../../../hooks/useRenderCount'
import {
  PRODUCTS,
  expensiveSearch,
  formatVnd,
  type Product,
} from '../../../lib/expensive'

// #region demo
/** ❌ Không có compiler: mỗi lần gõ vào ô "ghi chú" cũng lọc lại 2000 sản phẩm */
function SearchPanelNoCompiler({ query, note }: { query: string; note: string }) {
  'use no memo' // <- chỉ khác đúng dòng này

  const result = expensiveSearch(PRODUCTS, query)
  return <ResultView result={result} note={note} tone="hot" />
}

/** ✅ Có compiler: kết quả được cache theo `query`, gõ ghi chú không tính lại */
function SearchPanelCompiled({ query, note }: { query: string; note: string }) {
  const result = expensiveSearch(PRODUCTS, query)
  return <ResultView result={result} note={note} tone="cool" />
}
// #endregion

/**
 * Mỗi lần expensiveSearch() thực sự chạy là ra một mảng kết quả MỚI, còn khi
 * compiler trả kết quả từ cache thì vẫn là mảng cũ. Nên chỉ cần đếm số mảng
 * khác nhau nhận được là biết hàm đã chạy bao nhiêu lần.
 *
 * Ghi vào ref ngay trong lúc render là phạm Rules of React — cùng lý do với
 * useRenderCount nên cũng tắt compiler cho hook này. Chỉ dùng để đo cho demo.
 */
/* eslint-disable react-hooks/refs -- cố ý vi phạm, xem chú thích phía trên */
function useSearchMeter(result: Product[]): number {
  'use no memo'

  const meter = useRef({ last: null as Product[] | null, runs: 0 })
  const m = meter.current
  if (m.last !== result) {
    m.last = result
    m.runs += 1
  }
  return m.runs
}
/* eslint-enable react-hooks/refs */

function ResultView({
  result,
  note,
  tone,
}: {
  result: Product[]
  note: string
  tone: 'hot' | 'cool'
}) {
  const renders = useRenderCount()
  const runs = useSearchMeter(result)
  const flashRef = useRenderFlash<HTMLDivElement>(
    tone === 'hot' ? 'var(--danger)' : 'var(--success)',
  )

  return (
    <div ref={flashRef} className="panel-box" style={{ padding: 14 }}>
      <Space size={6} wrap>
        <RenderBadge label="render" value={renders} />
        <RenderBadge
          label="số lần lọc"
          value={runs}
          tone={tone}
          tip="Số lần hàm expensiveSearch() thực sự chạy"
        />
      </Space>

      <div className="dim" style={{ fontSize: 12.5, margin: '14px 0 6px' }}>
        Kết quả lọc:
      </div>
      <div style={{ display: 'grid', gap: 4, fontSize: 13 }}>
        {result.length === 0 && <i className="dim">Không có sản phẩm nào khớp</i>}
        {result.map((p) => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.name}
            </span>
            <span className="mono dim" style={{ flex: 'none' }}>
              {formatVnd(p.price)}
            </span>
          </div>
        ))}
      </div>

      {note && (
        <div className="dim" style={{ marginTop: 10, fontSize: 12.5 }}>
          Ghi chú: <i>{note}</i>
        </div>
      )}
    </div>
  )
}

/**
 * Mỗi bên giữ state ghi chú RIÊNG: gõ ở bên nào thì chỉ bên đó render lại.
 * Nếu dùng chung một ô, cả hai panel nằm trong cùng một lần render nên bên
 * trái chậm sẽ kéo cả trang chậm theo — không còn thấy "trái giật, phải mượt".
 */
function DemoColumn({
  query,
  title,
  titleColor,
  Panel,
  panelName,
}: {
  query: string
  title: string
  titleColor: string
  Panel: typeof SearchPanelCompiled
  panelName: string
}) {
  const [note, setNote] = useState('')

  return (
    <div>
      <Space size={6} style={{ marginBottom: 8 }} wrap>
        <b style={{ color: titleColor }}>{title}</b>
        <CompiledBadge fn={Panel} name={panelName} />
      </Space>
      <label style={{ display: 'block', marginBottom: 10 }}>
        <div style={{ fontSize: 12.5, marginBottom: 4, color: 'var(--text-dim)', fontWeight: 600 }}>
          Ghi chú — KHÔNG liên quan gì tới phép lọc
        </div>
        <Input
          prefix={<EditOutlined />}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Gõ liên tục vào đây"
        />
      </label>
      <Panel query={query} note={note} />
    </div>
  )
}

export default function AutoUseMemoDemo() {
  const [query, setQuery] = useState('Dell')

  return (
    <div>
      <label style={{ display: 'block', marginBottom: 16 }}>
        <div style={{ fontSize: 12.5, marginBottom: 4, color: 'var(--warning)', fontWeight: 600 }}>
          Từ khoá — dùng chung cho cả hai bên, ẢNH HƯỞNG tới kết quả lọc
        </div>
        <Input
          prefix={<SearchOutlined />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Từ khoá tìm sản phẩm"
        />
      </label>

      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <DemoColumn
          query={query}
          title="❌ Không compiler"
          titleColor="var(--danger)"
          Panel={SearchPanelNoCompiler}
          panelName="SearchPanelNoCompiler"
        />
        <DemoColumn
          query={query}
          title="✅ Có compiler"
          titleColor="var(--success)"
          Panel={SearchPanelCompiled}
          panelName="SearchPanelCompiled"
        />
      </div>

      <Alert
        style={{ marginTop: 16 }}
        type="info"
        showIcon
        title="Bổ sung"
        description={
          <span className="dim">
          Muốn gõ vẫn mượt khi phép tính toán nặng bắt buộc phải chạy,
          xem <Link to="/use-transition">useTransition</Link>.
          </span>
        }
      />
    </div>
  )
}
