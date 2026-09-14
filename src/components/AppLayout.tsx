import { version } from 'react'
import { Layout, Menu, Tag, Tooltip } from 'antd'
import {
  GithubOutlined,
  HomeOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  AimOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons'
import { Link, Outlet, useLocation } from 'react-router-dom'

const { Header, Content } = Layout

const NAV_ITEMS = [
  { key: '/', icon: <HomeOutlined />, label: 'Tổng quan' },
  { key: '/react-compiler', icon: <RocketOutlined />, label: 'React Compiler' },
  { key: '/use-optimistic', icon: <ThunderboltOutlined />, label: 'useOptimistic' },
  { key: '/ref-as-prop', icon: <AimOutlined />, label: 'ref là prop' },
  { key: '/use-transition', icon: <FieldTimeOutlined />, label: 'useTransition' },
]

export default function AppLayout() {
  const { pathname } = useLocation()

  return (
    <Layout className="app-shell">
      <Header className="app-header">
        <Link to="/" className="app-brand">
          <span className="dot" />
          React 19 
        </Link>

        <Menu
          mode="horizontal"
          theme="dark"
          selectedKeys={[pathname]}
          style={{ flex: 1, minWidth: 0, background: 'transparent', borderBottom: 'none' }}
          items={NAV_ITEMS.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: <Link to={item.key}>{item.label}</Link>,
          }))}
        />

        <Tooltip title="Phiên bản React đang chạy thật trong app này (React.version)">
          <Tag color="blue" className="mono" style={{ marginInlineEnd: 0 }}>
            react@{version}
          </Tag>
        </Tooltip>

        <Tooltip title="react.dev">
          <a
            href="https://react.dev/blog/2024/12/05/react-19"
            target="_blank"
            rel="noreferrer"
            className="dim"
            style={{ fontSize: 18, display: 'flex' }}
          >
            <GithubOutlined />
          </a>
        </Tooltip>
      </Header>

      <Content className="app-content">
        <Outlet />
      </Content>
    </Layout>
  )
}
