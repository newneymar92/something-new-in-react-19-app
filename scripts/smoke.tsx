/**
 * Smoke test: render toàn bộ các route bằng react-dom/server để chắc chắn
 * không có lỗi runtime lúc render (sai API, hook dùng sai chỗ, component undefined...).
 *
 *   npm run smoke
 */
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { App as AntdApp, ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'

import App from '../src/App'
import { darkTheme } from '../src/theme'

const ROUTES = ['/', '/react-compiler', '/use-optimistic', '/ref-as-prop', '/use-transition']

let failed = false

for (const route of ROUTES) {
  try {
    const html = renderToString(
      <ConfigProvider theme={darkTheme} locale={viVN}>
        <AntdApp>
          <MemoryRouter initialEntries={[route]}>
            <App />
          </MemoryRouter>
        </AntdApp>
      </ConfigProvider>,
    )
    console.log(`  ✔ ${route.padEnd(18)} render OK (${html.length.toLocaleString()} ký tự HTML)`)
  } catch (error) {
    failed = true
    console.error(`  ✘ ${route.padEnd(18)} LỖI:`, error)
  }
}

console.log(failed ? '\n✘ Smoke test THẤT BẠI' : '\n✔ Tất cả route render được')
process.exit(failed ? 1 : 0)
