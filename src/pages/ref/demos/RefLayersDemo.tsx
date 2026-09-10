import { useRef, useState, type ComponentPropsWithRef, type ReactNode } from 'react'
import { Alert, Button, Space } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'

type Values = { name: string; email: string; phone: string }

const FIELDS: { key: keyof Values; label: string; placeholder: string }[] = [
  { key: 'name', label: 'Họ và tên', placeholder: 'Nguyễn Văn A' },
  { key: 'email', label: 'Email', placeholder: 'a@congty.vn' },
  { key: 'phone', label: 'Số điện thoại', placeholder: '09xxxxxxxx' },
]

// #region demo
/** Lớp trong cùng — thẻ input thật */
function BaseInput({ ref, ...props }: ComponentPropsWithRef<'input'>) {
  return <input ref={ref} {...props} className="ref-input" />
}

/** Lớp giữa — thêm label + thông báo lỗi, chỉ việc chuyển tiếp `ref` xuống dưới */
function FormField({
  ref,
  label,
  error,
  ...inputProps
}: ComponentPropsWithRef<'input'> & { label: ReactNode; error?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="dim" style={{ fontSize: 13, marginBottom: 4 }}>
        {label}
      </div>
      <BaseInput ref={ref} aria-invalid={Boolean(error)} {...inputProps} />
      {error && (
        <div style={{ color: 'var(--danger)', fontSize: 12.5, marginTop: 4 }}>{error}</div>
      )}
    </div>
  )
}

/**
 * Ở React 18, để cái ref của form đi xuyên qua FormField rồi tới BaseInput
 * thì CẢ HAI lớp đều phải bọc forwardRef. React 19: chỉ là prop, truyền thẳng.
 */
function useFocusFirstError() {
  const refs = useRef<Record<string, HTMLInputElement | null>>({})

  const register = (key: string) => (node: HTMLInputElement | null) => {
    refs.current[key] = node
  }

  const focusFirst = (keys: string[]) => {
    for (const key of keys) {
      const node = refs.current[key]
      if (node) {
        node.focus()
        node.scrollIntoView({ block: 'center', behavior: 'smooth' })
        return
      }
    }
  }

  return { register, focusFirst }
}
// #endregion

export default function RefLayersDemo() {
  const [values, setValues] = useState<Values>({ name: '', email: 'sai-dinh-dang', phone: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({})
  const [ok, setOk] = useState(false)
  const { register, focusFirst } = useFocusFirstError()

  function submit() {
    const next: Partial<Record<keyof Values, string>> = {}
    if (!values.name.trim()) next.name = 'Vui lòng nhập họ tên'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) next.email = 'Email không hợp lệ'
    if (!/^0\d{9}$/.test(values.phone)) next.phone = 'Số điện thoại phải có 10 số, bắt đầu bằng 0'

    setErrors(next)
    setOk(Object.keys(next).length === 0)

    // Đưa con trỏ về ô sai ĐẦU TIÊN — việc chỉ làm được nhờ ref
    focusFirst(FIELDS.map((f) => f.key).filter((key) => next[key]))
  }

  return (
    <div>
      <style>{`
        .ref-input {
          display: block; width: 100%; padding: 8px 11px; border-radius: 8px;
          border: 1px solid var(--border); background: var(--bg);
          color: var(--text); font: inherit; outline: none;
        }
        .ref-input[aria-invalid="true"] { border-color: var(--danger); }
        .ref-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 22%, transparent); }
      `}</style>

      {FIELDS.map((field) => (
        <FormField
          key={field.key}
          ref={register(field.key)}
          label={field.label}
          placeholder={field.placeholder}
          error={errors[field.key]}
          value={values[field.key]}
          onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
        />
      ))}

      <Space wrap>
        <Button type="primary" onClick={submit}>
          Kiểm tra &amp; gửi
        </Button>
        <Button
          onClick={() => {
            setValues({ name: '', email: 'sai-dinh-dang', phone: '' })
            setErrors({})
            setOk(false)
          }}
        >
          Đặt lại
        </Button>
      </Space>

      {ok && (
        <Alert
          style={{ marginTop: 12 }}
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          message="Hợp lệ hết rồi!"
        />
      )}

      <p className="dim" style={{ fontSize: 13, marginTop: 14, marginBottom: 0, lineHeight: 1.75 }}>
        Bấm &quot;Kiểm tra &amp; gửi&quot; khi form còn trống: con trỏ tự nhảy vào ô sai đầu tiên.
        Cái ref đó đi qua <b>hai lớp component</b> (<code>FormField</code> →{' '}
        <code>BaseInput</code>) mà không cần <code>forwardRef</code> lần nào.
      </p>
    </div>
  )
}
