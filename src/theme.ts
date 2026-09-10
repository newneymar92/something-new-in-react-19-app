import type { ThemeConfig } from 'antd'
import { theme } from 'antd'

/** Palette dùng chung giữa antd token và CSS variables trong index.css */
export const palette = {
  bg: '#0a0c11',
  panel: '#12151d',
  panelAlt: '#171b25',
  border: '#242a37',
  primary: '#4f9dff',
  success: '#3ddc97',
  warning: '#ffb454',
  danger: '#ff6b6b',
  text: '#e6e9ef',
  textDim: '#98a2b3',
}

export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: palette.primary,
    colorSuccess: palette.success,
    colorWarning: palette.warning,
    colorError: palette.danger,
    colorBgBase: palette.bg,
    colorTextBase: palette.text,
    borderRadius: 10,
    fontSize: 15,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontFamilyCode:
      "'JetBrains Mono', 'Fira Code', ui-monospace, Consolas, monospace",
  },
  components: {
    Layout: {
      headerBg: 'rgba(10, 12, 17, 0.85)',
      siderBg: palette.panel,
      bodyBg: palette.bg,
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
    },
    Card: {
      colorBgContainer: palette.panel,
    },
  },
}
