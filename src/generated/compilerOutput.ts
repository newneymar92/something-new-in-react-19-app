// ⚠️ FILE TỰ SINH — đừng sửa tay.
// Sinh bởi: npm run gen:compiled  (scripts/gen-compiled-output.mjs)
// Nội dung là output THẬT của babel-plugin-react-compiler v1.0.0

export type CompiledSample = {
  id: string
  file: string
  compiled: string
}

export const COMPILED_SAMPLES: Record<string, CompiledSample> = {
  "cart-summary": {
    "id": "cart-summary",
    "file": "src/pages/compiler/samples/CartSummary.tsx",
    "compiled": "import { c as _c } from \"react/compiler-runtime\";\nimport { useState } from 'react';\nexport type CartItem = {\n  id: number;\n  name: string;\n  price: number;\n  qty: number;\n};\n\n/**\n * Một component \"đời thường\" — không có useMemo, useCallback hay React.memo nào cả.\n * File này được script `npm run gen:compiled` đưa qua React Compiler để lấy\n * output thật, phục vụ demo \"compiler đã viết lại code của bạn như thế nào\".\n */\nexport default function CartSummary(t0) {\n  const $ = _c(21);\n  const {\n    items,\n    vat\n  } = t0;\n  const [expanded, setExpanded] = useState(false);\n  const subtotal = items.reduce(_temp, 0);\n  let t1;\n  let t2;\n  let t3;\n  let t4;\n  let t5;\n  if ($[0] !== items.length || $[1] !== subtotal || $[2] !== vat) {\n    const total = Math.round(subtotal * (1 + vat));\n    let t6;\n    if ($[8] === Symbol.for(\"react.memo_cache_sentinel\")) {\n      t6 = () => setExpanded(_temp2);\n      $[8] = t6;\n    } else {\n      t6 = $[8];\n    }\n    const toggle = t6;\n    t5 = \"cart\";\n    t1 = toggle;\n    t2 = items.length;\n    t3 = \" s\\u1EA3n ph\\u1EA9m \\xB7 \";\n    t4 = total.toLocaleString(\"vi-VN\");\n    $[0] = items.length;\n    $[1] = subtotal;\n    $[2] = vat;\n    $[3] = t1;\n    $[4] = t2;\n    $[5] = t3;\n    $[6] = t4;\n    $[7] = t5;\n  } else {\n    t1 = $[3];\n    t2 = $[4];\n    t3 = $[5];\n    t4 = $[6];\n    t5 = $[7];\n  }\n  let t6;\n  if ($[9] !== t1 || $[10] !== t2 || $[11] !== t3 || $[12] !== t4) {\n    t6 = <button onClick={t1}>{t2}{t3}{t4}₫</button>;\n    $[9] = t1;\n    $[10] = t2;\n    $[11] = t3;\n    $[12] = t4;\n    $[13] = t6;\n  } else {\n    t6 = $[13];\n  }\n  let t7;\n  if ($[14] !== expanded || $[15] !== items) {\n    t7 = expanded && <ul>{items.map(_temp3)}</ul>;\n    $[14] = expanded;\n    $[15] = items;\n    $[16] = t7;\n  } else {\n    t7 = $[16];\n  }\n  let t8;\n  if ($[17] !== t5 || $[18] !== t6 || $[19] !== t7) {\n    t8 = <div className={t5}>{t6}{t7}</div>;\n    $[17] = t5;\n    $[18] = t6;\n    $[19] = t7;\n    $[20] = t8;\n  } else {\n    t8 = $[20];\n  }\n  return t8;\n}\nfunction _temp3(item_0) {\n  return <li key={item_0.id}>{item_0.name} × {item_0.qty}</li>;\n}\nfunction _temp2(value) {\n  return !value;\n}\nfunction _temp(sum, item) {\n  return sum + item.price * item.qty;\n}"
  }
}
