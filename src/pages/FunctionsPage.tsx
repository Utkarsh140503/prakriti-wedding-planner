import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { WEDDING_FUNCTIONS } from '../data/functions'
import { subscribeTasks, createTask } from '../services/tasks'
import { subscribeFunctionDetails, saveFunctionDetails, type FunctionDetails } from '../services/functions'
import { subscribeUsers } from '../services/users'
import TaskPanel from '../components/tasks/TaskPanel'
import { useAuth } from '../contexts/AuthContext'
import type { AppUser, WeddingTask } from '../types'

export function FunctionsList() {
  const [tasks, setTasks] = useState<WeddingTask[]>([])
  useEffect(() => subscribeTasks(setTasks), [])
  return <div><h2 className="text-2xl font-bold text-[#6E1423] mb-1">Wedding Functions</h2>
    <p className="font-sans text-sm opacity-70 mb-4">14 function categories (A–N). Dates, timings and venues are Pending Confirmation until the family confirms them — open a function to fill them in.</p>
    <div className="grid sm:grid-cols-2 gap-3">
      {WEDDING_FUNCTIONS.map(f => { const ft = tasks.filter(t => t.functionId === f.id); const d = ft.filter(t => t.status === 'Completed').length; const pct = ft.length ? Math.round(d / ft.length * 100) : 0
        return <Link key={f.id} to={`/functions/${f.id}`} className="card p-4 block hover:border-[#B8912F]">
          <p className="font-bold text-[#6E1423]"><span className="text-[#B8912F]">{f.code}.</span> {f.name}</p>
          <p className="font-sans text-sm mt-1">{ft.length} tasks · {pct}% complete</p>
          <div className="h-2 bg-[#F5EEDD] rounded mt-2"><div className="h-2 bg-[#B8912F] rounded" style={{ width: pct + '%' }} /></div>
          {f.id === 'sil-main-poojan' && <p className="font-sans text-xs text-[#6E1423] mt-2">Family-specific ceremony — procedure to be confirmed with family & pandit.</p>}
        </Link> })}
    </div></div>
}

export function FunctionDetail() {
  const { id } = useParams(); const { user } = useAuth()
  const fn = WEDDING_FUNCTIONS.find(f => f.id === id)
  const [tasks, setTasks] = useState<WeddingTask[]>([]); const [members, setMembers] = useState<AppUser[]>([])
  const [details, setDetails] = useState<FunctionDetails>({}); const [edit, setEdit] = useState<FunctionDetails>({})
  const [selected, setSelected] = useState<WeddingTask | null>(null); const [title, setTitle] = useState(''); const [msg, setMsg] = useState('')
  useEffect(() => subscribeTasks(setTasks), []); useEffect(() => subscribeUsers(setMembers), [])
  useEffect(() => { if (id) return subscribeFunctionDetails(id, (d) => { setDetails(d); setEdit(d) }) }, [id])
  if (!fn) return <p className="font-sans">Function not found.</p>
  const ft = tasks.filter(t => t.functionId === fn.id); const done = ft.filter(t => t.status === 'Completed').length
  const pct = ft.length ? Math.round(done / ft.length * 100) : 0
  const canWrite = user && user.role !== 'VIEWER'
  return <div>
    <Link to="/functions" className="font-sans text-sm text-[#6E1423] underline">← All functions</Link>
    <h2 className="text-2xl font-bold text-[#6E1423] mt-2">{fn.code}. {fn.name}</h2>
    <p className="font-sans text-sm mt-1">{ft.length} tasks · {pct}% complete</p>
    <div className="h-2.5 bg-[#F5EEDD] rounded mt-2 mb-5 max-w-md"><div className="h-2.5 bg-[#B8912F] rounded" style={{ width: pct + '%' }} /></div>
    <div className="card p-5 mb-5">
      <h3 className="font-bold text-[#6E1423] mb-3">Function details</h3>
      <div className="grid sm:grid-cols-3 gap-3 font-sans">
        <div><label className="label">Date</label><input className="input" type="date" disabled={!canWrite} value={edit.date || ''} onChange={e => setEdit({ ...edit, date: e.target.value })} /></div>
        <div><label className="label">Start time</label><input className="input" type="time" disabled={!canWrite} value={edit.startTime || ''} onChange={e => setEdit({ ...edit, startTime: e.target.value })} /></div>
        <div><label className="label">End time</label><input className="input" type="time" disabled={!canWrite} value={edit.endTime || ''} onChange={e => setEdit({ ...edit, endTime: e.target.value })} /></div>
        <div className="sm:col-span-2"><label className="label">Venue</label><input className="input" disabled={!canWrite} placeholder="Pending Confirmation" value={edit.venue || ''} onChange={e => setEdit({ ...edit, venue: e.target.value })} /></div>
        <div><label className="label">Description / notes</label><input className="input" disabled={!canWrite} value={edit.notes || ''} onChange={e => setEdit({ ...edit, notes: e.target.value })} /></div>
      </div>
      {!details.date && !details.venue && <p className="font-sans text-sm opacity-70 mt-2">Date & venue: Pending Confirmation</p>}
      {canWrite && <button className="btn-primary mt-3 font-sans" onClick={async () => { await saveFunctionDetails(fn.id, edit); setMsg('Function details saved ✓') }}>Save details</button>}
      {msg && <span className="font-sans text-sm text-green-700 ml-3">{msg}</span>}
    </div>
    <div className="card p-5">
      <h3 className="font-bold text-[#6E1423] mb-3">Checklist for this function</h3>
      {canWrite && <form className="flex gap-2 mb-3 font-sans" onSubmit={async (e) => { e.preventDefault(); if (!title.trim()) return; await createTask({ title, functionId: fn.id, ownerName: 'Unassigned — Pending Confirmation', priority: 'Medium', status: 'Not Started' }, user!.uid); setTitle('') }}>
        <input className="input" placeholder="Add a task for this function…" value={title} onChange={e => setTitle(e.target.value)} /><button className="btn-gold shrink-0">Add</button></form>}
      {ft.length ? ft.map(t => <button key={t.id} onClick={() => setSelected(t)} className="w-full text-left font-sans text-sm border-b border-[#F5EEDD] py-2 flex justify-between gap-3"><span className="font-semibold">{t.title}</span><span className="text-xs shrink-0">{t.status} · {t.ownerName}</span></button>)
      : <p className="font-sans text-sm opacity-70">No tasks yet for this function.</p>}
      <p className="font-sans text-xs opacity-60 mt-3">Tap any task to edit it in full, assign an owner and discuss it in comments. Shopping items, ritual samagri, vendors and budgets for this function arrive with their Phase 3 modules and will be linked here.</p>
    </div>
    {selected && <TaskPanel task={selected} members={members} onClose={() => setSelected(null)} />}
  </div>
}
