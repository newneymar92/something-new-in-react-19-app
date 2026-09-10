import { Tooltip } from 'antd'

type RenderBadgeProps = {
  label: string
  value: number
  /** 'hot' = render nhiều (xấu), 'cool' = ít render (tốt) */
  tone?: 'hot' | 'cool' | 'neutral'
  tip?: string
  unit?: string
}

export default function RenderBadge({
  label,
  value,
  tone = 'neutral',
  tip,
  unit,
}: RenderBadgeProps) {
  const cls = tone === 'hot' ? 'rc rc--hot' : tone === 'cool' ? 'rc rc--cool' : 'rc'

  const badge = (
    <span className={cls}>
      {label}
      <span className="rc__val">
        {value}
        {unit}
      </span>
    </span>
  )

  return tip ? <Tooltip title={tip}>{badge}</Tooltip> : badge
}
