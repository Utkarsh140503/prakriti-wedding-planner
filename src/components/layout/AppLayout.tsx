import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ListChecks, Sparkles, Users, Wallet, UserRound, Store, ShoppingBag, Flower2, CalendarDays, FolderOpen, History, Settings, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
const NAV = [
  ['/', 'Dashboard', LayoutDashboard], ['/checklist', 'Master Checklist', ListChecks], ['/functions', 'Wedding Functions', Sparkles],
  ['/family', 'Family Members', Users], ['/budget', 'Budget & Expenses', Wallet], ['/guests', 'Guest Management', UserRound],
  ['/vendors', 'Vendor Management', Store], ['/shopping', 'Shopping Tracker', ShoppingBag], ['/samagri', 'Ritual Samagri', Flower2],
  ['/schedule', 'Event Schedule', CalendarDays], ['/documents', 'Documents', FolderOpen], ['/activity', 'Activity History', History], ['/settings', 'Settings', Settings],
] as const
export default function AppLayout() {
  const { user, logout } = useAuth(); const [open, setOpen] = useState(false); const nav = useNavigate()
  const links = (
    <nav className="space-y-1">
      {NAV.map(([to, label, Icon]) => (
        <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}
          className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-sans ${isActive ? 'bg-[#6E1423] text-white' : 'text-[#2B2118] hover:bg-[#F5EEDD]'}`}>
          <Icon size={18} /> {label}
        </NavLink>
      ))}
    </nav>
  )
  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden lg:block w-72 shrink-0 border-r border-[#EADFC6] bg-[#FBF7EF] p-5 sticky top-0 h-screen overflow-y-auto">
        <h1 className="text-xl font-bold text-[#6E1423]">PraKriti Wedding Planner</h1>
        <p className="text-xs italic text-[#B8912F] mt-1 mb-5">One Family. One Celebration. Every Detail Taken Care Of.</p>
        {links}
        <div className="mt-6 border-t border-[#EADFC6] pt-4 font-sans text-sm">
          <p className="font-semibold">{user?.displayName}</p><p className="text-xs opacity-70">{user?.email} · {user?.role}</p>
          <button className="mt-3 flex items-center gap-2 text-[#6E1423]" onClick={async () => { await logout(); nav('/login') }}><LogOut size={16} /> Logout</button>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-10 bg-[#FBF7EF] border-b border-[#EADFC6] p-3 flex items-center justify-between">
          <span className="font-bold text-[#6E1423]">PraKriti Wedding Planner</span>
          <button onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
        </header>
        {open && <div className="lg:hidden p-4 bg-[#FBF7EF] border-b border-[#EADFC6]">{links}
          <button className="mt-3 flex items-center gap-2 text-[#6E1423] font-sans text-sm" onClick={async () => { await logout(); nav('/login') }}><LogOut size={16} /> Logout ({user?.displayName})</button></div>}
        <main className="p-4 sm:p-6 max-w-6xl mx-auto"><Outlet /></main>
      </div>
    </div>
  )
}
