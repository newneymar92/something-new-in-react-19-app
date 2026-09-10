import { useState } from 'react'
import { Alert, Input, Space, Statistic } from 'antd'
import { SearchOutlined, EditOutlined } from '@ant-design/icons'

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
          title="Tổng CPU đã tiêu"
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

export default function AutoUseMemoDemo() {
  const [query, setQuery] = useState('Dell')
  const [note, setNote] = useState('')

  return (
    <div>
      <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
        <label>
          <div style={{ fontSize: 12.5, marginBottom: 4, color: 'var(--warning)', fontWeight: 600 }}>
            Ô này ẢNH HƯỞNG tới kết quả lọc
          </div>
          <Input
            prefix={<SearchOutlined />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Từ khoá tìm sản phẩm"
          />
        </label>
        <label>
          <div style={{ fontSize: 12.5, marginBottom: 4, color: 'var(--text-dim)', fontWeight: 600 }}>
            Ô này KHÔNG liên quan gì tới phép lọc
          </div>
          <Input
            prefix={<EditOutlined />}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Gõ thoải mái — để ý bên trái giật, bên phải mượt"
          />
        </label>
      </div>

      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <div>
          <Space size={6} style={{ marginBottom: 8 }} wrap>
            <b style={{ color: 'var(--danger)' }}>❌ Không compiler</b>
            <CompiledBadge fn={SearchPanelNoCompiler} name="SearchPanelNoCompiler" />
          </Space>
          <SearchPanelNoCompiler query={query} note={note} />
        </div>

        <div>
          <Space size={6} style={{ marginBottom: 8 }} wrap>
            <b style={{ color: 'var(--success)' }}>✅ Có compiler</b>
            <CompiledBadge fn={SearchPanelCompiled} name="SearchPanelCompiled" />
          </Space>
          <SearchPanelCompiled query={query} note={note} />
        </div>
      </div>

      <Alert
        style={{ marginTop: 16 }}
        type="info"
        showIcon
        title="Cách diễn cho khán giả"
        description={
          <span className="dim">
            Gõ liên tục vào ô &quot;KHÔNG liên quan&quot;: ô nhập bên trái sẽ khựng lại vì mỗi ký tự
            phải lọc lại 2000 sản phẩm, còn &quot;số lần lọc&quot; bên phải đứng yên. Sau đó đổi từ
            khoá ở ô trên — lúc này cả hai đều tính lại, đúng như mong đợi.
          </span>
        }
      />
    </div>
  )
}
