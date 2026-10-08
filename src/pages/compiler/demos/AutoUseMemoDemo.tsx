import { useState } from 'react'
import { Alert, Input, Space, Statistic } from 'antd'
import { SearchOutlined, EditOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

import CompiledBadge from '../../../components/CompiledBadge'
import RenderBadge from '../../../components/RenderBadge'
import { useRenderCount, useRenderFlash } from '../../../hooks/useRenderCount'
import {
  PRODUCTS,
  expensiveSearch,
  formatVnd,
  type SearchResult,
} from '../../../lib/expensive'

// #region demo
/** ❌ Không có compiler: mỗi lần gõ vào ô "ghi chú" cũng lọc lại 2000 sản phẩm */
function SearchPanelNoCompiler({ query, note }: { query: string; note: string }) {
  'use no memo' // <- chỉ khác đúng dòng này

  const result = expensiveSearch(PRODUCTS, query, 'no-compiler')
  return <ResultView result={result} note={note} tone="hot" />
}

/** ✅ Có compiler: kết quả được cache theo `query`, gõ ghi chú không tính lại */
function SearchPanelCompiled({ query, note }: { query: string; note: string }) {
  const result = expensiveSearch(PRODUCTS, query, 'compiled')
  return <ResultView result={result} note={note} tone="cool" />
}
// #endregion

function ResultView({
  result,
  note,
  tone,
}: {
  result: SearchResult
  note: string
  tone: 'hot' | 'cool'
}) {
  const renders = useRenderCount()
  const flashRef = useRenderFlash<HTMLDivElement>(
    tone === 'hot' ? 'var(--danger)' : 'var(--success)',
  )

  return (
    <div ref={flashRef} className="panel-box" style={{ padding: 14 }}>
      <Space size={6} wrap>
        <RenderBadge label="render" value={renders} />
        <RenderBadge
          label="số lần lọc"
          value={result.runs}
          tone={tone}
          tip="Số lần hàm expensiveSearch() thực sự chạy"
        />
      </Space>

      <div style={{ display: 'flex', gap: 22, margin: '14px 0 10px' }}>
        <Statistic
          title="Lần lọc gần nhất"
          value={result.ms}
          suffix="ms"
          styles={{ content: { fontSize: 20, color: tone === 'hot' ? 'var(--danger)' : 'var(--success)' } }}
        />
        <Statistic
          title="Tổng thời gian lọc"
          value={result.totalMs}
          suffix="ms"
          styles={{ content: { fontSize: 20 } }}
        />
      </div>

      <div className="dim" style={{ fontSize: 12.5, marginBottom: 6 }}>
        5 kết quả rẻ nhất khớp từ khoá:
      </div>
      <div style={{ display: 'grid', gap: 4, fontSize: 13 }}>
        {result.items.length === 0 && <i className="dim">Không có sản phẩm nào khớp</i>}
        {result.items.map((p) => (
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
        title="Cách diễn cho khán giả"
        description={
          <span className="dim">
            Gõ liên tục vào ô ghi chú bên trái: chữ hiện ra bị khựng vì mỗi ký tự lại phải lọc lại
            2000 sản phẩm, &quot;số lần lọc&quot; tăng theo từng phím. Làm y hệt ở ô ghi chú bên
            phải: gõ mượt, &quot;số lần lọc&quot; đứng yên. Sau đó đổi từ khoá ở ô trên cùng — lúc
            này cả hai đều tính lại và ô từ khoá khựng ở cả hai bên: compiler chỉ bỏ qua phép tính
            thừa, không làm phép tính nhanh hơn. Muốn gõ vẫn mượt khi phép tính bắt buộc phải chạy,
            xem <Link to="/use-transition">useTransition</Link>.
          </span>
        }
      />
    </div>
  )
}
