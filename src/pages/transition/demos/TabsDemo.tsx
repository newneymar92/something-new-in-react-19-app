import { useState, useTransition } from 'react'
import { Alert, Segmented, Space, Tag } from 'antd'

import SlowList from './SlowList'

type TabKey = 'about' | 'products' | 'contact'

const TAB_OPTIONS: { label: string; value: TabKey }[] = [
  { label: 'Giới thiệu', value: 'about' },
  { label: 'Sản phẩm (nặng)', value: 'products' },
  { label: 'Liên hệ', value: 'contact' },
]

function TabPanel({ tab }: { tab: TabKey }) {
  if (tab === 'products') return <SlowList query="" limit={1000} />

  return (
    <div className="panel-box dim" style={{ padding: 12, fontSize: 13.5, lineHeight: 1.7 }}>
      {tab === 'about'
        ? 'Cửa hàng linh kiện máy tính — tab nhẹ, render tức thì.'
        : 'Hotline 1900 1234 · Mở cửa 8:00–21:00 — tab nhẹ, render tức thì.'}
    </div>
  )
}

// #region demo
/** ❌ Đổi tab ngay: bấm "Sản phẩm" là cả trang đứng hình tới khi 1000 item render xong */
function TabsBlocking() {
  const [tab, setTab] = useState<TabKey>('about')

  return (
    <>
      <Segmented value={tab} options={TAB_OPTIONS} onChange={setTab} />
      <TabPanel tab={tab} />
    </>
  )
}

/** ✅ Đổi tab trong transition: lúc "Sản phẩm" đang render vẫn bấm được tab khác */
function TabsWithTransition() {
  const [tab, setTab] = useState<TabKey>('about')
  const [isPending, startTransition] = useTransition()

  function selectTab(next: TabKey) {
    startTransition(() => setTab(next))
  }

  return (
    <>
      <Space size={8} wrap>
        <Segmented value={tab} options={TAB_OPTIONS} onChange={selectTab} />
        {isPending && <Tag color="orange">đang chuyển tab…</Tag>}
      </Space>
      <div style={{ opacity: isPending ? 0.5 : 1 }}>
        <TabPanel tab={tab} />
      </div>
    </>
  )
}
// #endregion

export default function TabsDemo() {
  return (
    <div>
      <div
        style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}
      >
        <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
          <b style={{ color: 'var(--danger)' }}>❌ Không transition</b>
          <TabsBlocking />
        </div>
        <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
          <b style={{ color: 'var(--success)' }}>✅ Có useTransition</b>
          <TabsWithTransition />
        </div>
      </div>

      <Alert
        style={{ marginTop: 16 }}
        type="info"
        showIcon
        title="Cách diễn cho khán giả"
        description={
          <span className="dim">
            Bấm &quot;Sản phẩm (nặng)&quot; rồi bấm ngay &quot;Liên hệ&quot;. Bên trái: cả trang đứng
            khoảng nửa giây, cú bấm thứ hai chỉ có tác dụng sau đó. Bên phải: hiện &quot;đang chuyển
            tab…&quot;, cú bấm thứ hai được nhận ngay và React bỏ dở lần render danh sách.
          </span>
        }
      />
    </div>
  )
}
