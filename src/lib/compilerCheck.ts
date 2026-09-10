/**
 * Kiểm tra tại RUNTIME xem một component có thực sự được React Compiler
 * biên dịch hay không.
 *
 * Cách hoạt động: React Compiler chèn vào đầu component một dòng
 *     const $ = _c(13);
 * (`_c` được import từ "react/compiler-runtime") và dùng `$[0]`, `$[1]`, ...
 * làm ô nhớ cache. Ta chỉ cần đọc source của hàm bằng `Function.toString()`
 * và tìm các dấu vết đó.
 *
 * Ở chế độ dev (npm run dev) source chưa bị minify nên cách này rất chính xác —
 * đây chính là bằng chứng "sống" để show cho khán giả thấy compiler có chạy thật.
 */

const MARKERS = [
  /\b_c\s*\(\s*\d+\s*\)/, // const $ = _c(13)
  /react\.memo_cache_sentinel/, // Symbol.for("react.memo_cache_sentinel")
]

export type CompileStatus = 'compiled' | 'not-compiled' | 'unknown'

export function getCompileStatus(fn: unknown): CompileStatus {
  if (typeof fn !== 'function') return 'unknown'

  let src = ''
  try {
    src = Function.prototype.toString.call(fn)
  } catch {
    return 'unknown'
  }

  if (MARKERS.some((re) => re.test(src))) return 'compiled'

  // Có directive tắt compiler -> chắc chắn không được compile
  if (/["']use no memo["']/.test(src)) return 'not-compiled'

  return 'not-compiled'
}

/** Lấy source (đã transform) của một component để soi trực tiếp trên UI */
export function getTransformedSource(fn: unknown): string {
  if (typeof fn !== 'function') return ''
  try {
    return Function.prototype.toString.call(fn)
  } catch {
    return ''
  }
}
