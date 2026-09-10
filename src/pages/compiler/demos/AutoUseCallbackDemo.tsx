import { memo, useState } from 'react'
import { Button, Space, Tag } from 'antd'
import { LineChartOutlined } from '@ant-design/icons'

import CompiledBadge from '../../../components/CompiledBadge'
import RenderBadge from '../../../components/RenderBadge'
import { useRenderCount, useRenderFlash } from '../../../hooks/useRenderCount'

type Point = { label: string; value: number }

const CHART_DATA: Point[] = [
  { label: 'T2', value: 62 },
  { label: 'T3', value: 88 },
  { label: 'T4', value: 45 },
  { label: 'T5', value: 96 },
  { label: 'T6', value: 71 },
  { label: 'T7', value: 34 },
  { label: 'CN', value: 52 },
]

// #region demo
/** Component con đã được bọc React.memo — kỳ vọng "chỉ render khi props đổi" */
const ExpensiveChart = memo(function ExpensiveChart({
  data,
  onPick,
}: {
  data: Point[]
  onPick: (label: string) => void
}) {
  const renders = useRenderCount()
  const flashRef = useRenderFlash<HTMLDivElement>()

  return (
    <div ref={flashRef} className="panel-box" style={{ padding: 12 }}>
      <RenderBadge label="Chart render" value={renders} tone={renders > 1 ? 'hot' : 'cool'} />
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 90, marginTop: 12 }}>
        {data.map((p) => (
          <button
            key={p.label}
            onClick={() => onPick(p.label)}
            title={`${p.label}: ${p.value}`}
            style={{
              flex: 1,
              height: `${p.value}%`,
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              background: 'linear-gradient(180deg, var(--primary), #2a5a99)',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        {data.map((p) => (
          <span key={p.label} className="dim mono" style={{ flex: 1, textAlign: 'center', fontSize: 11 }}>
            {p.label}
          </span>
        ))}
      </div>
    </div>
  )
})

/** ❌ Hàm mũi tên tạo mới mỗi lần render -> props đổi -> React.memo trở nên vô dụng */
function ParentNoCompiler({ tick }: { tick: number }) {
  'use no memo'

  const [picked, setPicked] = useState('—')

  return (
    <div>
      <p className="dim mono">tick = {tick}</p>
      <ExpensiveChart data={CHART_DATA} onPick={(label) => setPicked(label)} />
      <p style={{ marginBottom: 0 }}>
        Đang chọn: <b>{picked}</b>
      </p>
    </div>
  )
}

/** ✅ Compiler tự cache hàm mũi tên -> props ổn định -> React.memo phát huy tác dụng */
function ParentCompiled({ tick }: { tick: number }) {
  const [picked, setPicked] = useState('—')

  return (
    <div>
      <p className="dim mono">tick = {tick}</p>
      <ExpensiveChart data={CHART_DATA} onPick={(label) => setPicked(label)} />
      <p style={{ marginBottom: 0 }}>
        Đang chọn: <b>{picked}</b>
      </p>
    </div>
  )
}
// #endregion

export default function AutoUseCallbackDemo() {
  const [tick, setTick] = useState(0)

  return (
    <div>
      <Space wrap style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<LineChartOutlined />} onClick={() => setTick((t) => t + 1)}>
          Đổi state ở component cha
        </Button>
        <Tag className="mono">tick = {tick}</Tag>
      </Space>

      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div>
          <Space size={6} style={{ marginBottom: 8 }} wrap>
            <b style={{ color: 'var(--danger)' }}>❌ Không compiler</b>
            <CompiledBadge fn={ParentNoCompiler} name="ParentNoCompiler" />
          </Space>
          <ParentNoCompiler tick={tick} />
        </div>

        <div>
          <Space size={6} style={{ marginBottom: 8 }} wrap>
            <b style={{ color: 'var(--success)' }}>✅ Có compiler</b>
            <CompiledBadge fn={ParentCompiled} name="ParentCompiled" />
          </Space>
          <ParentCompiled tick={tick} />
        </div>
      </div>

      <p className="dim" style={{ marginTop: 16, marginBottom: 0, fontSize: 13.5, lineHeight: 1.7 }}>
        Đây là cái bẫy kinh điển: đã bọc <code>React.memo</code> rồi mà con vẫn render lại, chỉ vì
        prop <code>onPick</code> là hàm mũi tên viết thẳng trong JSX nên lần render nào cũng là một
        hàm mới. Trước đây phải nhớ bọc <code>useCallback</code>; giờ compiler làm hộ.
      </p>
    </div>
  )
}
