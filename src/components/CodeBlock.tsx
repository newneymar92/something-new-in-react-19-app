import { useState } from 'react'
import { Highlight, Prism, themes } from 'prism-react-renderer'
import { Button, Tooltip } from 'antd'
import { CheckOutlined, CopyOutlined } from '@ant-design/icons'

/**
 * prism-react-renderer không kèm sẵn grammar cho shell, mà các khối lệnh cài đặt
 * để trắng trơn thì nhìn rất chán khi chiếu lên máy chiếu — đăng ký một bộ tối giản.
 */
if (!Prism.languages.bash) {
  Prism.languages.bash = {
    comment: { pattern: /(^|\s)#.*/, lookbehind: true },
    string: { pattern: /(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1/, greedy: true },
    keyword: /\b(?:npm|npx|yarn|pnpm|node|git|cd|ls|rm|mkdir|echo)\b/,
    operator: { pattern: /(^|\s)--?[\w-]+/, lookbehind: true },
  }
}

type Language = 'tsx' | 'ts' | 'jsx' | 'js' | 'bash' | 'json'

export type CodeBlockProps = {
  code: string
  language?: Language
  /** Dòng được tô sáng (1-based) */
  highlight?: number[]
  /** Dòng "thêm mới" — nền xanh */
  added?: number[]
  /** Dòng "bỏ đi" — nền đỏ */
  removed?: number[]
  showLineNumbers?: boolean
  maxHeight?: number
}

/** Theme code: dựa trên vsDark nhưng chỉnh nền cho khớp với app */
const codeTheme = {
  ...themes.vsDark,
  plain: { ...themes.vsDark.plain, backgroundColor: 'transparent' },
}

export default function CodeBlock({
  code,
  language = 'tsx',
  highlight = [],
  added = [],
  removed = [],
  showLineNumbers = true,
  maxHeight,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    })
  }

  return (
    <div
      className="code-block"
      style={maxHeight ? ({ ['--code-max-h']: `${maxHeight}px` } as React.CSSProperties) : undefined}
    >
      <Tooltip title={copied ? 'Đã copy!' : 'Copy code'}>
        <Button
          className="code-block__copy"
          size="small"
          type="text"
          icon={copied ? <CheckOutlined style={{ color: 'var(--success)' }} /> : <CopyOutlined />}
          onClick={copy}
        />
      </Tooltip>

      <Highlight theme={codeTheme} code={code} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={className} style={style}>
            {tokens.map((line, i) => {
              const lineNo = i + 1
              const lineProps = getLineProps({ line })
              const marks = [
                highlight.includes(lineNo) && 'is-hl',
                added.includes(lineNo) && 'is-add',
                removed.includes(lineNo) && 'is-del',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <div
                  key={lineNo}
                  {...lineProps}
                  className={`cb-line ${lineProps.className ?? ''} ${marks}`}
                >
                  {showLineNumbers && <span className="cb-ln">{lineNo}</span>}
                  <span>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              )
            })}
          </pre>
        )}
      </Highlight>
    </div>
  )
}
