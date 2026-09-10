import type { ReactNode } from 'react'
import { Tabs } from 'antd'

import CodeBlock, { type CodeBlockProps } from './CodeBlock'

export type CodeTab = CodeBlockProps & {
  key: string
  label: ReactNode
}

type DemoCardProps = {
  title: ReactNode
  description?: ReactNode
  extra?: ReactNode
  /** Một khối code, hoặc nhiều tab code (vd: "Cách cũ" / "Cách mới") */
  code: CodeBlockProps | CodeTab[]
  /** Panel kết quả chạy thật bên phải */
  children?: ReactNode
  resultLabel?: string
  codeLabel?: string
  /** Cho code chiếm nhiều chỗ hơn (khi code dài, demo nhỏ) */
  wideCode?: boolean
  /** Ẩn hẳn panel kết quả — chỉ hiển thị code */
  codeOnly?: boolean
  footer?: ReactNode
}

export default function DemoCard({
  title,
  description,
  extra,
  code,
  children,
  resultLabel = 'Kết quả chạy thật',
  codeLabel = 'Code',
  wideCode = false,
  codeOnly = false,
  footer,
}: DemoCardProps) {
  return (
    <div className="demo-card">
      <div className="demo-card__head">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <h3 className="demo-card__title">{title}</h3>
          {extra}
        </div>
        {description && <p className="demo-card__desc">{description}</p>}
      </div>

      <div
        className={[
          'demo-split',
          wideCode ? 'demo-split--wide-code' : '',
          codeOnly ? 'demo-split--stack' : '',
        ].join(' ')}
      >
        <div className="demo-pane demo-pane--code">
          {Array.isArray(code) ? (
            <Tabs
              size="small"
              defaultActiveKey={code[0]?.key}
              tabBarStyle={{ margin: 0, padding: '0 12px', background: 'rgba(255,255,255,0.02)' }}
              items={code.map(({ key, label, ...rest }) => ({
                key,
                label,
                children: <CodeBlock {...rest} />,
              }))}
            />
          ) : (
            <>
              <div className="demo-pane__label">
                <span>{codeLabel}</span>
              </div>
              <CodeBlock {...code} />
            </>
          )}
        </div>

        {!codeOnly && (
          <div className="demo-pane">
            <div className="demo-pane__label">
              <span>{resultLabel}</span>
              <span style={{ color: 'var(--success)', textTransform: 'none', letterSpacing: 0 }}>
                ● live
              </span>
            </div>
            <div className="demo-pane__body">{children}</div>
          </div>
        )}
      </div>

      {footer && (
        <div style={{ borderTop: '1px solid var(--border-soft)', padding: '14px 20px' }}>{footer}</div>
      )}
    </div>
  )
}
