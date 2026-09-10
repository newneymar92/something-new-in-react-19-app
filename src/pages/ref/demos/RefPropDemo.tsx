import { useRef, type ComponentPropsWithRef } from 'react'
import { Button, Space } from 'antd'
import { AimOutlined, BgColorsOutlined, ClearOutlined } from '@ant-design/icons'

// #region demo
type TextFieldProps = ComponentPropsWithRef<'input'> & { label: string }

/**
 * ✅ React 19: `ref` nằm ngay trong props như mọi prop khác.
 * Không forwardRef, không bọc thêm lớp nào, và type cũng gọn hơn hẳn.
 */
function TextField({ ref, label, ...inputProps }: TextFieldProps) {
  return (
    <label style={{ display: 'block' }}>
      <span className="dim" style={{ fontSize: 13 }}>
        {label}
      </span>
      <input
        ref={ref}
        {...inputProps}
        style={{
          display: 'block',
          width: '100%',
          marginTop: 4,
          padding: '8px 11px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--bg)',
          color: 'var(--text)',
          font: 'inherit',
          outline: 'none',
        }}
      />
    </label>
  )
}

// Component cha dùng y như một thẻ <input> thường:
//
//   const inputRef = useRef<HTMLInputElement>(null)
//   <TextField ref={inputRef} label="Email công ty" />
//   <button onClick={() => inputRef.current?.focus()}>Focus</button>
// #endregion

export default function RefPropDemo() {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <TextField ref={inputRef} label="Email công ty" placeholder="ten@congty.vn" />

      <Space wrap style={{ marginTop: 14 }}>
        <Button icon={<AimOutlined />} onClick={() => inputRef.current?.focus()}>
          Focus
        </Button>
        <Button
          icon={<ClearOutlined />}
          onClick={() => {
            inputRef.current?.focus()
            inputRef.current?.select()
          }}
        >
          Bôi đen chữ
        </Button>
        <Button
          icon={<BgColorsOutlined />}
          onClick={() => {
            const el = inputRef.current
            if (!el) return
            el.style.borderColor = 'var(--success)'
            el.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--success) 25%, transparent)'
            window.setTimeout(() => {
              el.style.borderColor = 'var(--border)'
              el.style.boxShadow = 'none'
            }, 900)
          }}
        >
          Nháy viền
        </Button>
      </Space>

      <p className="dim" style={{ fontSize: 13, marginTop: 16, marginBottom: 0, lineHeight: 1.75 }}>
        Ba nút trên đều gọi thẳng DOM API qua <code>inputRef.current</code>. Component{' '}
        <code>TextField</code> vẫn là một function component bình thường —{' '}
        <b>không có forwardRef ở đâu cả</b>.
      </p>
    </div>
  )
}
