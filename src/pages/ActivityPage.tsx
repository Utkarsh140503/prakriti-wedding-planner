import { useEffect, useMemo, useState } from 'react'
import { subscribeCollection } from '../services/collections'
import { subscribeTasks, subscribeExpenses } from '../services/tasks'
import { subscribeUsers } from '../services/users'
import { WEDDING_FUNCTIONS } from '../data/functions'
import type { ActivityLog, AppUser, Expense, Guest, Vendor, WeddingTask } from '../types'
const NAMES: Record<string, string> = { tasks: 'Checklist', expenses: 'Budget', guests: 'Guests', vendors: 'Vendors', shoppingItems: 'Shopping', ritualItems: 'Samagri', eventSchedule: 'Schedule', familyMembers: 'Family', documents: 'Documents', functions: 'Functions' }
const inr = (n: number) => '₹' + n.toLocaleString('en-IN')
export default function ActivityPage() {
  const [tab, setTab] = useState<'log' | 'reports'>('log')
  const [logs, setLogs] = useState<(ActivityLog & { id: string })[]>([]); const [users, setUsers] = useState<AppUser[]>([])
  const [filter, setFilter] = useState('all')
  const [tasks, setTasks] = useState<WeddingTask[]>([]); const [expenses, setExpenses] = useState<Expense[]>([])
  const [guests, setGuests] = useState<(Guest & { id: string })[]>([]); const [vendors, setVendors] = useState<(Vendor & { id: string })[]>([])
  useEffect(() => subscribeCollection<ActivityLog>('activityLogs', setLogs), []); useEffect(() => subscribeUsers(setUsers), [])
  useEffect(() => subscribeTasks(setTasks), []); useEffect(() => subscribeExpenses(setExpenses), [])
  useEffect(() => subscribeCollection<Guest>('guests', setGuests), []); useEffect(() => subscribeCollection<Vendor>('vendors', setVendors), [])
  const nameOf = (l: ActivityLog) => users.find(u => u.uid === l.userId)?.displayName || l.userEmail || 'A family member'
  const sorted = useMemo(() => [...logs].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)), [logs])
  const shown = filter === 'all' ? sorted : sorted.filter(l => l.entityType === filter)
  const budget = useMemo(() => ({ est: expenses.reduce((s, e) => s + (e.estimatedCost || 0), 0), act: expenses.reduce((s, e) => s + (e.actualCost || 0), 0), adv: expenses.reduce((s, e) => s + (e.advancePaid || 0), 0) }), [expenses])
  const guestHeads = guests.reduce((s, g) => s + (g.memberCount ?? (((g.adults || 0) + (g.children || 0)) || 1)), 0)
  const confirmedHeads = guests.filter(g => g.rsvpStatus === 'Confirmed').reduce((s, g) => s + (g.memberCount ?? (((g.adults || 0) + (g.children || 0)) || 1)), 0)
  return <div><h2 className="text-2xl font-bold text-[#6E1423] mb-1">Activity & Reports</h2>
    <div className="font-sans text-sm flex gap-2 mb-4">{([['log', 'Activity Log'], ['reports', 'Reports']] as const).map(([v, l]) => <button key={v} onClick={() => setTab(v)} className={`px-3 py-1.5 rounded-lg border ${tab===v?'bg-[#6E1423] text-white':'bg-white'}`}>{l}</button>)}{tab === 'reports' && <button className="px-3 py-1.5 rounded-lg bg-[#B8912F] text-white" onClick={() => window.print()}>Print reports</button>}</div>
    {tab === 'log' ? <div>
      <p className="font-sans text-sm opacity-70 mb-3">Who did what, across every module — recorded automatically from now on. (Actions from before this update were not logged.)</p>
      <div className="font-sans text-sm flex flex-wrap gap-2 mb-4">{['all', ...Object.keys(NAMES)].map(k => <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 rounded-lg border ${filter===k?'bg-[#6E1423] text-white':'bg-white'}`}>{k === 'all' ? 'All modules' : NAMES[k]}</button>)}</div>
      {shown.slice(0, 200).map(l => <div key={l.id} className="card p-3 mb-2 font-sans text-sm flex justify-between gap-3"><span><b>{nameOf(l)}</b> {l.action} <span className="text-[#6E1423]">{NAMES[l.entityType] || l.entityType}</span>{l.details ? ' — ' + l.details : ''}</span><span className="opacity-60 shrink-0">{l.createdAt?.seconds ? new Date(l.createdAt.seconds * 1000).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : ''}</span></div>)}
      {!shown.length && <p className="font-sans text-sm opacity-70">No activity recorded yet — it will appear here as the family works.</p>}
    </div> : <div className="space-y-4">
      <div className="card p-5"><h3 className="font-bold text-[#6E1423] mb-2">Budget summary</h3><p className="font-sans text-sm">Estimated total: <b>{inr(budget.est)}</b> · Advances paid: <b>{inr(budget.adv)}</b> · Actual recorded: <b>{inr(budget.act)}</b> · Expense entries: {expenses.length}</p></div>
      <div className="card p-5"><h3 className="font-bold text-[#6E1423] mb-2">Guest summary</h3><p className="font-sans text-sm">Guest entries: {guests.length} · Total headcount: <b>{guestHeads}</b> · Confirmed (RSVP) headcount: <b>{confirmedHeads}</b> · Invitations sent: {guests.filter(g => g.invitationStatus !== 'Not Sent').length}</p></div>
      <div className="card p-5"><h3 className="font-bold text-[#6E1423] mb-2">Vendor summary</h3><p className="font-sans text-sm">Vendors tracked: {vendors.length} · Booked or beyond: {vendors.filter(v => ['Booked','Advance Paid','Partially Paid','Fully Paid','Service Completed'].includes(v.status)).length} · Total final/quoted value: <b>{inr(vendors.reduce((s, v) => s + ((v.finalAmount ?? v.quotedAmount) || 0), 0))}</b> · Advances paid: <b>{inr(vendors.reduce((s, v) => s + (v.advancePaid || 0), 0))}</b></p></div>
      <div className="card p-5"><h3 className="font-bold text-[#6E1423] mb-2">Checklist by function</h3>
        {WEDDING_FUNCTIONS.map(f => { const ft = tasks.filter(t => t.functionId === f.id); const dn = ft.filter(t => t.status === 'Completed').length; return <p key={f.id} className="font-sans text-sm border-b border-[#F5EEDD] py-1 flex justify-between"><span>{f.code}. {f.name}</span><span>{dn}/{ft.length} done{ft.length ? ' · ' + Math.round(dn / ft.length * 100) + '%' : ''}</span></p> })}
      </div>
      <p className="font-sans text-xs opacity-60">All figures are computed live from the family's real records. Detailed exports: Guests → Export CSV, Master Checklist → Export CSV.</p>
    </div>}
  </div>
}
