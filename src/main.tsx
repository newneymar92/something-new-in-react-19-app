import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App as AntdApp, ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'

import App from './App'
import { darkTheme } from './theme'
import './index.css'

/**
 * LƯU Ý CHO BUỔI SEMINAR:
 * App này cố tình KHÔNG bọc <StrictMode>.
 * StrictMode ở dev sẽ render mỗi component 2 lần để soi side-effect,
 * làm các bộ đếm số lần render trong demo React Compiler nhảy 2, 4, 6...
 * và gây hiểu nhầm cho người xem. Ở dự án thật thì nên bật StrictMode.
 */
createRoot(document.getElementById('root')!).render(
  <ConfigProvider theme={darkTheme} locale={viVN}>
    <AntdApp>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AntdApp>
  </ConfigProvider>,
)
