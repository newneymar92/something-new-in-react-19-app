import { useState, useTransition } from 'react'
import { App, Button, Input, Tag } from 'antd'
import { SaveOutlined } from '@ant-design/icons'

import { fakeRequest } from '../../../lib/fakeServer'

// #region demo
function DisplayNameForm() {
  const { message: toast } = App.useApp()
  const [savedName, setSavedName] = useState('Ngọc Anh') // giá trị server đã lưu
  const [draft, setDraft] = useState('Ngọc Anh')
  const [isPending, startTransition] = useTransition()

  function save() {
    // React 19: startTransition nhận thẳng hàm async.
    // isPending = true từ lúc bấm tới khi hàm async chạy xong — không cần state isSaving.
    startTransition(async () => {
      try {
        const name = await fakeRequest(draft.trim())
        // Sau `await`, setState phải được bọc startTransition lần nữa
        startTransition(() => setSavedName(name))
        toast.success(`Đã lưu tên "${name}"`)
      } catch {
        toast.error('Server từ chối — tên cũ vẫn được giữ nguyên')
      }
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} disabled={isPending} />
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={isPending}
          disabled={!draft.trim() || draft.trim() === savedName}
          onClick={save}
        >
          Lưu
        </Button>
      </div>

      <div style={{ marginTop: 12 }}>
        <Tag color={isPending ? 'orange' : 'default'} className="mono">
          {isPending ? 'isPending = true · đang chờ server…' : 'isPending = false'}
        </Tag>
      </div>

      <p className="dim" style={{ marginTop: 12, marginBottom: 0 }}>
        Tên đang lưu trên server: <b style={{ color: 'var(--text)' }}>{savedName}</b>
      </p>
    </div>
  )
}
// #endregion

export default function AsyncActionDemo() {
  return <DisplayNameForm />
}
