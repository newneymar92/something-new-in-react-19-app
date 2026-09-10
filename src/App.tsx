import { Navigate, Route, Routes } from 'react-router-dom'

import AppLayout from './components/AppLayout'
import HomePage from './pages/HomePage'
import ReactCompilerPage from './pages/compiler/ReactCompilerPage'
import UseOptimisticPage from './pages/optimistic/UseOptimisticPage'
import RefAsPropPage from './pages/ref/RefAsPropPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/react-compiler" element={<ReactCompilerPage />} />
        <Route path="/use-optimistic" element={<UseOptimisticPage />} />
        <Route path="/ref-as-prop" element={<RefAsPropPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
