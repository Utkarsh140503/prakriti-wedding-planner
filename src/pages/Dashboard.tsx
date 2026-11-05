import { useEffect, useMemo, useState } from 'react'
import { subscribeTasks, subscribeExpenses } from '../services/tasks'
import { WEDDING_FUNCTIONS, WEDDING_DATE, WEDDING_DATE_LABEL } from '../data/functions'
import type { WeddingTask, Expense } from '../types'
import { Link } from 'react-router-dom'
function daysLeft() { const ms = new Date(WEDDING_DATE).getTime() - Date.now(); return Math.max(0, Math.ceil(ms / 86400000)) }
export default function Dashboard() {
  const [tasks, setTasks] = useState<WeddingTask[]>([]); const [expenses, setExpenses] = useState<Expense[]>([])
  useEffect(() => subscribeTasks(setTasks), []); useEffect(() => subscribeExpenses(setExpenses), [])
  const s = useMemo(() => ({
    total: tasks.length, done: tasks.filter(t => t.status === 'Completed').length,
    pending: tasks.filter(t => t.status === 'Not Started').length, prog: tasks.filter(t => t.status === 'In Progress').length,
    overdue: tasks.filter(t => t.deadline && t.deadline < new Date().toISOString().slice(0,10) && t.status !== 'Completed').length,
  }), [tasks])
  const pct = s.total ? Math.round((s.done / s.total) * 100) : 0
  const fin = useMemo(() => {
    const planned = expenses.reduce((a,e) => a + (e.estimatedAmount||0), 0)
    const actual = expenses.reduce((a,e) => a + (e.actualAmount||0), 0)
    const adv = expenses.reduce((a,e) => a + (e.advancePaid||0), 0)
    return { planned, actual, adv, remaining: actual - adv }
  }, [expenses])
  const urgent = tasks.filter(t => (t.priority === 'Critical' || t.priority === 'High') && t.status !== 'Completed').slice(0,6)
  return <div>
    <div className="card p-6 text-center mb-5 bg-gradient-to-b from-white to-[#F5EEDD]">
      <p className="text-sm font-sans tracking-widest text-[#B8912F]">THE WEDDING DAY</p>
      <h2 className="text-3xl font-bold text-[#6E1423] mt-1">{WEDDING_DATE_LABEL}</h2>
      <p className="font-sans mt-2"><span className="text-4xl font-bold">{daysLeft()}</span> days to go</p>
      <p className="text-sm font-sans opacity-70 mt-1">Venue & city: Pending Confirmation</p>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5 font-sans">
      {[['Total tasks', s.total], ['Completed', s.done], ['Pending', s.pending], ['In progress', s.prog], ['Overdue', s.overdue], ['Completion', pct + '%']].map(([l,v]) => (
        <div key={l as string} className="card p-4 text-center"><p className="text-2xl font-bold text-[#6E1423]">{v}</p><p className="text-xs">{l}</p></div>))}
    </div>
    <div className="grid md:grid-cols-2 gap-5">
      <div className="card p-5"><h3 className="font-bold text-[#6E1423] mb-3">Function progress</h3>
        {WEDDING_FUNCTIONS.map(f => { const ft = tasks.filter(t => t.functionId === f.id); const d = ft.filter(t => t.status === 'Completed').length; const p = ft.length ? Math.round(d/ft.length*100) : 0
          return <div key={f.id} className="font-sans text-sm mb-2"><div className="flex justify-between"><span>{f.code}. {f.name}</span><span>{ft.length ? p + '%' : 'No tasks yet'}</span></div>
          <div className="h-2 bg-[#F5EEDD] rounded"><div className="h-2 bg-[#B8912F] rounded" style={{ width: p + '%' }} /></div></div> })}
      </div>
      <div className="space-y-5">
        <div className="card p-5 font-sans"><h3 className="font-bold text-[#6E1423] mb-3 font-serif">Financial overview (from real expense records)</h3>
          <p>Planned budget: <b>{fin.planned ? '₹' + fin.planned.toLocaleString('en-IN') : 'Pending Confirmation'}</b></p>
          <p>Actual expenditure: <b>₹{fin.actual.toLocaleString('en-IN')}</b></p>
          <p>Advances paid: <b>₹{fin.adv.toLocaleString('en-IN')}</b></p>
          <p>Remaining payments: <b>₹{fin.remaining.toLocaleString('en-IN')}</b></p>
          {!expenses.length && <p className="text-sm opacity-70 mt-2">No expenses recorded yet — nothing here is estimated or fabricated.</p>}
        </div>
        <div className="card p-5"><h3 className="font-bold text-[#6E1423] mb-3">Urgent tasks</h3>
          {urgent.length ? urgent.map(t => <p key={t.id} className="font-sans text-sm border-b border-[#F5EEDD] py-1.5">• {t.title} <span className="text-xs text-[#6E1423]">({t.priority} · {t.ownerName})</span></p>)
          : <p className="font-sans text-sm opacity-70">No urgent tasks right now.</p>}
          <Link to="/checklist" className="font-sans text-sm text-[#6E1423] underline mt-3 inline-block">Open Master Checklist →</Link>
        </div>
      </div>
    </div></div>
}
