import { Segmented, Slider, Space, Tag, Tooltip } from 'antd'
import { CloudServerOutlined } from '@ant-design/icons'

import { setServerConfig, useServerConfig, type FailMode } from '../lib/fakeServer'

const FAIL_OPTIONS = [
  { label: 'Luôn thành công', value: 'never' },
  { label: 'Lỗi ngẫu nhiên 50%', value: 'random' },
  { label: 'Luôn lỗi', value: 'always' },
]

/**
 * Bảng điều khiển "server giả" — dùng chung cho mọi demo useOptimistic.
 * Khi present: kéo latency lên ~3s để khán giả kịp nhìn trạng thái optimistic,
 * rồi bật "Luôn lỗi" để show cơ chế tự rollback.
 */
export default function ServerPanel() {
  const { latency, failMode } = useServerConfig()

  return (
    <div
      className="panel-box"
      style={{
        marginBottom: 24,
        display: 'flex',
        gap: 28,
        flexWrap: 'wrap',
        alignItems: 'center',
        borderColor: 'color-mix(in srgb, var(--primary) 35%, transparent)',
      }}
    >
      <Space size={8}>
        <CloudServerOutlined style={{ color: 'var(--primary)', fontSize: 18 }} />
        <b>Server giả lập</b>
        <Tooltip title="Mọi demo bên dưới đều gọi qua server giả này. Chỉnh ở đây để thấy rõ hành vi optimistic.">
          <Tag className="mono">điều khiển demo</Tag>
        </Tooltip>
      </Space>

      <div style={{ flex: '1 1 280px', minWidth: 240 }}>
        <div className="dim" style={{ fontSize: 13, marginBottom: 2 }}>
          Độ trễ mạng: <b className="mono" style={{ color: 'var(--text)' }}>{latency}ms</b>
        </div>
        <Slider
          min={0}
          max={4000}
          step={100}
          value={latency}
          onChange={(value) => setServerConfig({ latency: value })}
          tooltip={{ formatter: (v) => `${v}ms` }}
        />
      </div>

      <div>
        <div className="dim" style={{ fontSize: 13, marginBottom: 6 }}>
          Kết quả từ server
        </div>
        <Segmented
          value={failMode}
          options={FAIL_OPTIONS}
          onChange={(value) => setServerConfig({ failMode: value as FailMode })}
        />
      </div>
    </div>
  )
}
