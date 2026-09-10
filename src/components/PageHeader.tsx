import type { ReactNode } from 'react'
import { Space, Tag } from 'antd'

type PageHeaderProps = {
  eyebrow?: string
  title: ReactNode
  lede: ReactNode
  tags?: string[]
}

export function PageHeader({ eyebrow, title, lede, tags = [] }: PageHeaderProps) {
  return (
    <header className="page-head">
      {eyebrow && (
        <Tag color="blue" className="mono">
          {eyebrow}
        </Tag>
      )}
      <h1>{title}</h1>
      <p className="lede">{lede}</p>
      {tags.length > 0 && (
        <Space size={[6, 6]} wrap style={{ marginTop: 14 }}>
          {tags.map((t) => (
            <Tag key={t} className="mono" style={{ marginInlineEnd: 0 }}>
              {t}
            </Tag>
          ))}
        </Space>
      )}
    </header>
  )
}

export function SectionTitle({ num, children }: { num: string | number; children: ReactNode }) {
  return (
    <h2 className="section-title">
      <span className="num">{num}</span>
      {children}
    </h2>
  )
}
