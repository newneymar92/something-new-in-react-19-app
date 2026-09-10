import { useState } from 'react'
import { Modal, Tag, Tooltip } from 'antd'
import { CheckCircleFilled, CloseCircleFilled, EyeOutlined } from '@ant-design/icons'

import CodeBlock from './CodeBlock'
import { getCompileStatus, getTransformedSource } from '../lib/compilerCheck'

type CompiledBadgeProps = {
  /** Chính component cần kiểm tra (truyền hàm, không phải JSX) */
  fn: unknown
  name: string
  /** Cho phép mở modal xem source đã transform */
  inspectable?: boolean
}

/**
 * Huy hiệu "component này có được React Compiler biên dịch không" —
 * kiểm tra thật ở runtime chứ không phải viết cứng.
 */
export default function CompiledBadge({ fn, name, inspectable = true }: CompiledBadgeProps) {
  const [open, setOpen] = useState(false)
  const status = getCompileStatus(fn)
  const compiled = status === 'compiled'

  return (
    <>
      <Tooltip
        title={
          compiled
            ? `${name} đã được React Compiler biên dịch (tìm thấy _c(...) trong source runtime)`
            : `${name} KHÔNG được compiler đụng tới (có directive "use no memo" hoặc bị bỏ qua)`
        }
      >
        <Tag
          color={compiled ? 'success' : 'default'}
          icon={compiled ? <CheckCircleFilled /> : <CloseCircleFilled />}
          className="mono"
          style={{ marginInlineEnd: 0, cursor: inspectable ? 'pointer' : 'default' }}
          onClick={inspectable ? () => setOpen(true) : undefined}
        >
          {compiled ? 'đã compile' : 'không compile'}
          {inspectable && <EyeOutlined style={{ marginInlineStart: 6, opacity: 0.7 }} />}
        </Tag>
      </Tooltip>

      {inspectable && (
        <Modal
          open={open}
          onCancel={() => setOpen(false)}
          footer={null}
          width={880}
          title={
            <span className="mono">
              Source runtime của <b>{name}</b>
            </span>
          }
        >
          <p className="dim" style={{ marginTop: 0 }}>
            Đây là kết quả của <code>{name}.toString()</code> ngay trong trình duyệt — tức là code
            thật đang chạy sau khi Vite + React Compiler xử lý.
          </p>
          <div style={{ background: '#0d1017', borderRadius: 10, border: '1px solid var(--border)' }}>
            <CodeBlock code={getTransformedSource(fn)} language="js" maxHeight={460} />
          </div>
        </Modal>
      )}
    </>
  )
}
