/**
 * Các đoạn code MINH HOẠ (không phải code đang chạy trong app) — dùng để so sánh
 * "cách viết cũ" với "cách viết React 19".
 * Những đoạn code chạy thật đều được import bằng `?raw` từ file demo tương ứng.
 */

export const INSTALL_SNIPPET = `# 1. Cài plugin cho Babel
npm install -D babel-plugin-react-compiler

# 2. Kiểm tra code có tuân thủ Rules of React không
npm install -D eslint-plugin-react-hooks@latest

# 3. (tuỳ chọn) Soi xem compiler đã tối ưu được bao nhiêu component
npx react-compiler-healthcheck`

export const ESLINT_SNIPPET = `// eslint.config.js
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  // Bộ rule này bắt các vi phạm Rules of React khiến compiler
  // phải bỏ qua component của bạn.
  reactHooks.configs.flat.recommended,
]`

export const MEMO_OLD_WAY = `// ❌ CÁCH CŨ (React 18): tự tay memo hoá 3 tầng
import { memo, useMemo, useCallback, useState } from 'react'

// 1. Bọc component con bằng React.memo
const TeamList = memo(function TeamList({ members, onSelect }) {
  return members.map((m) => <Row key={m.id} member={m} onSelect={onSelect} />)
})

function Parent({ count }) {
  const [members] = useState(TEAM)

  // 2. Bọc dữ liệu dẫn xuất bằng useMemo
  const active = useMemo(
    () => members.filter((m) => m.active),
    [members],
  )

  // 3. Bọc callback bằng useCallback
  const handleSelect = useCallback((id) => {
    console.log('chọn', id)
  }, [])

  return (
    <>
      <p>count = {count}</p>
      <TeamList members={active} onSelect={handleSelect} />
    </>
  )
}

// Quên MỘT trong ba chỗ trên là toàn bộ tối ưu đổ sông đổ biển,
// mà lint thì không hề báo lỗi.`

export const MEMO_NEW_WAY = `// ✅ REACT 19 + COMPILER: xoá sạch, viết như bình thường
import { useState } from 'react'

function TeamList({ members, onSelect }) {
  return members.map((m) => <Row key={m.id} member={m} onSelect={onSelect} />)
}

function Parent({ count }) {
  const [members] = useState(TEAM)

  const active = members.filter((m) => m.active)

  const handleSelect = (id) => {
    console.log('chọn', id)
  }

  return (
    <>
      <p>count = {count}</p>
      <TeamList members={active} onSelect={handleSelect} />
    </>
  )
}

// Compiler tự chèn cache cho: mảng \`active\`, hàm \`handleSelect\`
// và cả phần tử JSX \`<TeamList />\`.`

export const CALLBACK_OLD_WAY = `// ❌ Cái bẫy kinh điển của React.memo
const ExpensiveChart = memo(function ExpensiveChart({ data, onPick }) {
  // ...
})

function Parent({ tick }) {
  const [picked, setPicked] = useState('—')

  return (
    <ExpensiveChart
      data={CHART_DATA}
      // ⚠️ Mỗi lần Parent render là một HÀM MỚI được tạo ra.
      //    props.onPick khác nhau -> React.memo so sánh thất bại
      //    -> con vẫn render lại, bọc memo coi như vô nghĩa.
      onPick={(label) => setPicked(label)}
    />
  )
}`

export const CALLBACK_FIX_WAY = `// 🩹 Cách chữa của React 18: nhớ mà bọc useCallback
function Parent({ tick }) {
  const [picked, setPicked] = useState('—')

  const handlePick = useCallback((label) => {
    setPicked(label)
  }, []) // <- và phải tự canh mảng dependency cho đúng

  return <ExpensiveChart data={CHART_DATA} onPick={handlePick} />
}`

export const DIRECTIVE_SNIPPET = `// Tắt compiler cho MỘT component
function LegacyWidget(props) {
  'use no memo'
  // ...
}

// Hoặc bật compiler cho riêng một số file, bằng cách đổi option
// trong vite.config.ts:
//   reactCompilerPreset({ compilationMode: 'annotation' })
// rồi đánh dấu từng component muốn tối ưu:
function HotPath(props) {
  'use memo'
  // ...
}`
