export const OLD_FORWARD_REF = `// ❌ REACT 18: muốn nhận ref thì phải bọc forwardRef
import { forwardRef } from 'react'

type Props = { label: string } & React.InputHTMLAttributes<HTMLInputElement>

const TextField = forwardRef<HTMLInputElement, Props>(
  function TextField({ label, ...inputProps }, ref) {
    //                                          ^^^ ref là THAM SỐ THỨ HAI
    return (
      <label>
        <span>{label}</span>
        <input ref={ref} {...inputProps} />
      </label>
    )
  },
)

// Phiền ở chỗ:
// - Thêm một lớp bọc, DevTools hiện ra "ForwardRef(TextField)"
// - Generic <HTMLInputElement, Props> ngược thứ tự trực giác, hay gõ nhầm
// - Component nào cũng có thể cần ref -> bọc gần như khắp nơi
// - Muốn spread ...props kèm ref thì phải xử lý tách bạch`

export const NEW_REF_PROP = `// ✅ REACT 19: ref chỉ là một prop
type Props = ComponentPropsWithRef<'input'> & { label: string }

function TextField({ ref, label, ...inputProps }: Props) {
  return (
    <label>
      <span>{label}</span>
      <input ref={ref} {...inputProps} />
    </label>
  )
}

// - Không lớp bọc, DevTools hiện đúng tên "TextField"
// - ref có thể đặt mặc định, đổi tên, truyền tiếp như prop thường
// - <TextField ref={inputRef} /> ở phía cha thì vẫn y như cũ`

export const MIGRATION = `# Codemod chính thức của React: đổi forwardRef -> ref prop
npx codemod@latest react/19/migration-recipe

# Chỉ chạy riêng bước bỏ forwardRef
npx codemod@latest react/19/remove-forward-ref

# Cập nhật type cho TypeScript (ElementRef, ComponentProps...)
npx types-react-codemod@latest preset-19 ./src`

export const CLEANUP_OLD = `// ❌ TRƯỚC REACT 19: tự xoay xở với node === null
function Box() {
  const observerRef = useRef<ResizeObserver | null>(null)

  const setRef = useCallback((node: HTMLDivElement | null) => {
    // gỡ cái cũ trước
    observerRef.current?.disconnect()

    if (node === null) {
      observerRef.current = null
      return          // <- React gọi lại với null khi unmount
    }

    const observer = new ResizeObserver(handleResize)
    observer.observe(node)
    observerRef.current = observer
  }, [])

  return <div ref={setRef} />
}`

export const CLEANUP_NEW = `// ✅ REACT 19: trả về hàm cleanup, giống hệt useEffect
function Box() {
  const setRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return

    const observer = new ResizeObserver(handleResize)
    observer.observe(node)

    return () => observer.disconnect()   // <- React tự gọi khi gỡ
  }, [])

  return <div ref={setRef} />
}

// Kèm theo một thay đổi ngầm: khi ref callback CÓ trả về cleanup,
// React sẽ KHÔNG gọi lại callback với giá trị null nữa.`

export const TS_GOTCHA = `// ⚠️ Bẫy TypeScript hay gặp nhất với ref callback

// ❌ Hàm mũi tên rút gọn -> vô tình "trả về" kết quả của phép gán.
//    React tưởng đó là hàm cleanup và sẽ báo lỗi type.
<div ref={(node) => (nodeRef.current = node)} />

// ✅ Dùng thân hàm có ngoặc nhọn
<div ref={(node) => { nodeRef.current = node }} />


// ⚠️ Kiểu của ref khi bọc useImperativeHandle
type Props = {
  ref?: Ref<StopwatchHandle>   // KHÔNG phải Ref<HTMLDivElement>
}

// ⚠️ ElementRef đã bị bỏ, dùng ComponentRef thay thế
type Handle = React.ComponentRef<typeof Stopwatch>`
