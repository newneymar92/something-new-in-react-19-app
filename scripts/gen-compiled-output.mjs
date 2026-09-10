/**
 * Chạy React Compiler (babel-plugin-react-compiler) trên các file mẫu THẬT
 * trong src/, rồi ghi kết quả ra src/generated/compilerOutput.ts để trang demo
 * có thể hiển thị "code bạn viết" vs "code compiler sinh ra".
 *
 *   npm run gen:compiled
 */
import * as babel from '@babel/core'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Các file sẽ được đưa qua compiler */
const SAMPLES = [
  { id: 'cart-summary', file: 'src/pages/compiler/samples/CartSummary.tsx' },
]

function compile(relativePath) {
  const absolute = resolve(root, relativePath)
  const source = readFileSync(absolute, 'utf8')

  const result = babel.transformSync(source, {
    filename: absolute,
    babelrc: false,
    configFile: false,
    // Chỉ parse TS/JSX, KHÔNG transform — để output vẫn giữ nguyên JSX cho dễ đọc
    parserOpts: { plugins: ['jsx', 'typescript'] },
    plugins: [['babel-plugin-react-compiler', { target: '19' }]],
  })

  if (!result?.code) {
    throw new Error(`Không compile được ${relativePath}`)
  }
  return result.code
}

const entries = SAMPLES.map(({ id, file }) => ({
  id,
  file,
  compiled: compile(file),
}))

const banner = `// ⚠️ FILE TỰ SINH — đừng sửa tay.
// Sinh bởi: npm run gen:compiled  (scripts/gen-compiled-output.mjs)
// Nội dung là output THẬT của babel-plugin-react-compiler v${
  JSON.parse(readFileSync(resolve(root, 'node_modules/babel-plugin-react-compiler/package.json'), 'utf8')).version
}
`

const body = `
export type CompiledSample = {
  id: string
  file: string
  compiled: string
}

export const COMPILED_SAMPLES: Record<string, CompiledSample> = ${JSON.stringify(
  Object.fromEntries(entries.map((e) => [e.id, e])),
  null,
  2,
)}
`

const outFile = resolve(root, 'src/generated/compilerOutput.ts')
mkdirSync(dirname(outFile), { recursive: true })
writeFileSync(outFile, banner + body, 'utf8')

console.log(`✔ Đã ghi ${SAMPLES.length} mẫu vào src/generated/compilerOutput.ts`)
for (const e of entries) {
  console.log(`  - ${e.id}: ${e.file} (${e.compiled.split('\n').length} dòng output)`)
}
