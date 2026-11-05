import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Checklist from './pages/Checklist'
import DocumentsPage from './pages/DocumentsPage'
import { FunctionsList, FunctionDetail } from './pages/FunctionsPage'
import FamilyPage from './pages/FamilyPage'
import BudgetPage from './pages/BudgetPage'
import VendorsPage from './pages/VendorsPage'
import { ShoppingPage, SamagriPage } from './pages/ItemsPages'
import GuestsPage from './pages/GuestsPage'
import SchedulePage from './pages/SchedulePage'
import ActivityPage from './pages/ActivityPage'
import SettingsPage from './pages/SettingsPage'
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
      <Route path="/functions" element={<FunctionsList />} /><Route path="/functions/:id" element={<FunctionDetail />} />
      <Route path="/family" element={<FamilyPage />} />
      <Route path="/budget" element={<BudgetPage />} />
      <Route path="/guests" element={<GuestsPage />} />
      <Route path="/vendors" element={<VendorsPage />} />
      <Route path="/shopping" element={<ShoppingPage />} />
      <Route path="/samagri" element={<SamagriPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/activity" element={<ActivityPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></HashRouter></AuthProvider>
}
