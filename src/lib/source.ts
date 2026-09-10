/**
 * Tiện ích lấy source code THẬT của các file demo.
 *
 * Ý tưởng: mọi đoạn code hiển thị trên màn hình đều được import bằng
 * `import raw from './Demo.tsx?raw'` (tính năng của Vite) rồi cắt ra theo
 * marker `// #region <tên>` ... `// #endregion`.
 *
 * Nhờ vậy code trên slide LUÔN khớp với code đang chạy — không bao giờ bị lệch
 * như khi copy-paste code vào string.
 */

/** Bỏ phần thụt lề chung của cả đoạn */
export function dedent(code: string): string {
  const lines = code.replace(/\t/g, '  ').split('\n')
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^ */)?.[0].length ?? 0)
  const min = indents.length ? Math.min(...indents) : 0
  return lines.map((line) => line.slice(min)).join('\n').trim()
}

/**
 * Cắt một vùng code được đánh dấu bằng:
 *   // #region ten-vung
 *   ...code...
 *   // #endregion
 */
export function extractRegion(source: string, region: string): string {
  const lines = source.split('\n')
  const start = lines.findIndex((line) =>
    new RegExp(`//\\s*#region\\s+${region}\\b`).test(line),
  )
  if (start === -1) {
    return `// [!] Không tìm thấy region "${region}"`
  }
  let depth = 0
  const collected: string[] = []
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i]
    if (/\/\/\s*#region\b/.test(line)) {
      depth++
      continue
    }
    if (/\/\/\s*#endregion\b/.test(line)) {
      if (depth === 0) break
      depth--
      continue
    }
    collected.push(line)
  }
  return dedent(collected.join('\n'))
}

/** Bỏ toàn bộ dòng import + các dòng đánh dấu region để code gọn khi trình chiếu */
export function stripImports(source: string): string {
  return source
    .split('\n')
    .filter((line) => !/^\s*import\s.+from\s.+$/.test(line))
    .filter((line) => !/\/\/\s*#(region|endregion)\b/.test(line))
    .join('\n')
    .trim()
}
