import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Checklist from './pages/Checklist'
import Placeholder from './pages/Placeholder'
import DocumentsPage from './pages/DocumentsPage'
import { LoginPage, RegisterPage } from './pages/AuthPages'
function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <p className="p-8 font-sans">Loading…</p>
  return user ? <>{children}</> : <Navigate to="/login" replace />
}
export default function App() {
  return <AuthProvider><HashRouter><Routes>
    <Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} />
    <Route element={<Guard><AppLayout /></Guard>}>
      <Route path="/" element={<Dashboard />} /><Route path="/checklist" element={<Checklist />} />
      <Route path="/functions" element={<Placeholder title="Wedding Functions" phase="Phase 2" />} />
      <Route path="/family" element={<Placeholder title="Family Members" phase="Phase 3" />} />
      <Route path="/budget" element={<Placeholder title="Budget & Expenses" phase="Phase 3" />} />
      <Route path="/guests" element={<Placeholder title="Guest Management" phase="Phase 4" />} />
      <Route path="/vendors" element={<Placeholder title="Vendor Management" phase="Phase 3" />} />
      <Route path="/shopping" element={<Placeholder title="Shopping Tracker" phase="Phase 3" />} />
      <Route path="/samagri" element={<Placeholder title="Ritual Samagri" phase="Phase 3" />} />
      <Route path="/schedule" element={<Placeholder title="Event Schedule" phase="Phase 4" />} />
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/activity" element={<Placeholder title="Activity History" phase="Phase 5" />} />
      <Route path="/settings" element={<Placeholder title="Settings" phase="Phase 1 (admin invitations are managed in Firestore — see README)" />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></HashRouter></AuthProvider>
}
