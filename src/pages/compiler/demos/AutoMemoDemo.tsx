import { useState } from 'react'
import { Avatar, Button, Space } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'

import RenderBadge from '../../../components/RenderBadge'
import CompiledBadge from '../../../components/CompiledBadge'
import { useRenderCount, useRenderFlash } from '../../../hooks/useRenderCount'

type Member = { id: number; name: string; role: string; color: string }

const TEAM: Member[] = [
  { id: 1, name: 'Ngọc Anh', role: 'Frontend', color: '#4f9dff' },
  { id: 2, name: 'Minh Quân', role: 'Backend', color: '#3ddc97' },
  { id: 3, name: 'Thu Hà', role: 'QC', color: '#ffb454' },
  { id: 4, name: 'Đức Duy', role: 'DevOps', color: '#a78bfa' },
]

// #region demo
/** Component con — dùng chung cho CẢ HAI phía để so sánh công bằng */
function TeamList({ members }: { members: Member[] }) {
  const renders = useRenderCount()
  const flashRef = useRenderFlash<HTMLDivElement>()

  return (
    <div ref={flashRef} className="panel-box" style={{ padding: 12 }}>
      <RenderBadge label="TeamList render" value={renders} tone={renders > 1 ? 'hot' : 'cool'} />
      <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
        {members.map((m) => (
          <Space key={m.id} size={8}>
            <Avatar size={26} style={{ background: m.color, color: '#0a0c11', fontWeight: 700 }}>
              {m.name.at(0)}
            </Avatar>
            <span>{m.name}</span>
            <span className="dim" style={{ fontSize: 13 }}>
              {m.role}
            </span>
          </Space>
        ))}
      </div>
    </div>
  )
}

/** ❌ Bản KHÔNG được compiler xử lý (bị tắt bằng directive) */
function ParentNoCompiler({ count }: { count: number }) {
  'use no memo' // <- CHỈ khác đúng dòng này

  const renders = useRenderCount()
  const [members] = useState(TEAM)

  return (
    <div>
      <RenderBadge label="Parent render" value={renders} />
      <p className="dim mono" style={{ margin: '10px 0' }}>
        count = {count}
      </p>
      <TeamList members={members} />
    </div>
  )
}

/** ✅ Bản ĐƯỢC React Compiler xử lý — code y hệt, không thêm memo gì cả */
function ParentCompiled({ count }: { count: number }) {
  const renders = useRenderCount()
  const [members] = useState(TEAM)

  return (
    <div>
      <RenderBadge label="Parent render" value={renders} />
      <p className="dim mono" style={{ margin: '10px 0' }}>
        count = {count}
      </p>
      <TeamList members={members} />
    </div>
  )
}
// #endregion

export default function AutoMemoDemo() {
  const [count, setCount] = useState(0)
  const [nonce, setNonce] = useState(0)

  return (
    <div>
      <Space wrap style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCount((c) => c + 1)}>
          Bấm để đổi state cha ({count})
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            setCount(0)
            setNonce((n) => n + 1)
          }}
        >
          Reset
        </Button>
      </Space>

      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
        <div>
          <Space size={6} style={{ marginBottom: 8 }} wrap>
            <b style={{ color: 'var(--danger)' }}>❌ Không compiler</b>
            <CompiledBadge fn={ParentNoCompiler} name="ParentNoCompiler" />
          </Space>
          <ParentNoCompiler key={`a-${nonce}`} count={count} />
        </div>

        <div>
          <Space size={6} style={{ marginBottom: 8 }} wrap>
            <b style={{ color: 'var(--success)' }}>✅ Có compiler</b>
            <CompiledBadge fn={ParentCompiled} name="ParentCompiled" />
          </Space>
          <ParentCompiled key={`b-${nonce}`} count={count} />
        </div>
      </div>

      <p className="dim" style={{ marginTop: 16, marginBottom: 0, fontSize: 13.5, lineHeight: 1.7 }}>
        Bấm nút vài lần: cả hai <code>Parent</code> đều render lại (vì prop <code>count</code> đổi),
        nhưng chỉ bên trái là <code>TeamList</code> render theo. Bên phải compiler đã cache sẵn phần
        tử JSX <code>&lt;TeamList members=&#123;members&#125; /&gt;</code> nên React bỏ qua luôn.
      </p>
    </div>
  )
}
