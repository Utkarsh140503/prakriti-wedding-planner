import { useEffect, useMemo, useState } from 'react'
import { subscribeTasks, createTask, updateTask, removeTask, seedTemplateTasks } from '../services/tasks'
import { WEDDING_FUNCTIONS } from '../data/functions'
import { TEMPLATE_TASKS } from '../data/templates'
import { useAuth } from '../contexts/AuthContext'
import type { WeddingTask, TaskStatus } from '../types'
const STATUSES: TaskStatus[] = ['Not Started','In Progress','Completed','On Hold','Cancelled']
export default function Checklist() {
  const { user } = useAuth(); const [tasks, setTasks] = useState<WeddingTask[]>([])
  const [view, setView] = useState<'table'|'kanban'|'mine'>('table'); const [q, setQ] = useState(''); const [fn, setFn] = useState('all'); const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ title: '', functionId: 'pre-wedding', ownerName: '', priority: 'Medium' as WeddingTask['priority'], deadline: '' })
  useEffect(() => subscribeTasks(setTasks), [])
  const filtered = useMemo(() => tasks.filter(t => (fn==='all'||t.functionId===fn) && (view!=='mine'||t.ownerId===user?.uid||t.ownerName===user?.displayName) && t.title.toLowerCase().includes(q.toLowerCase())), [tasks, fn, q, view, user])
  const fname = (id: string) => WEDDING_FUNCTIONS.find(f => f.id===id)?.name || id
  const canWrite = user && user.role !== 'VIEWER'
  return <div>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <h2 className="text-2xl font-bold text-[#6E1423]">Master Checklist</h2>
      <div className="font-sans text-sm space-x-2">
        {(['table','kanban','mine'] as const).map(v => <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-lg border ${view===v?'bg-[#6E1423] text-white':'bg-white'}`}>{v==='mine'?'My Responsibilities':v[0].toUpperCase()+v.slice(1)}</button>)}
      </div>
    </div>
    <div className="flex flex-wrap gap-2 mb-4 font-sans">
      <input className="input !w-64" placeholder="Search tasks…" value={q} onChange={e=>setQ(e.target.value)} />
      <select className="input !w-64" value={fn} onChange={e=>setFn(e.target.value)}><option value="all">All functions</option>{WEDDING_FUNCTIONS.map(f=><option key={f.id} value={f.id}>{f.code}. {f.name}</option>)}</select>
      {user?.role==='ADMIN' && !tasks.length && <button className="btn-gold" onClick={async()=>{ await seedTemplateTasks(TEMPLATE_TASKS, user.uid); setMsg('Template checklist imported — all tasks are editable, unassigned templates.') }}>Import template checklist ({TEMPLATE_TASKS.length} tasks)</button>}
    </div>
    {msg && <p className="font-sans text-sm text-green-700 mb-3">{msg}</p>}
    {canWrite && <form className="card p-4 mb-5 grid sm:grid-cols-5 gap-2 font-sans" onSubmit={async(e)=>{e.preventDefault(); if(!form.title.trim())return; await createTask({ title: form.title, functionId: form.functionId, ownerName: form.ownerName||'Unassigned — Pending Confirmation', ownerId: undefined, priority: form.priority, status:'Not Started', deadline: form.deadline||undefined }, user!.uid); setForm({...form,title:'',ownerName:'',deadline:''}) }}>
      <input className="input sm:col-span-2" placeholder="New task title *" required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
      <select className="input" value={form.functionId} onChange={e=>setForm({...form,functionId:e.target.value})}>{WEDDING_FUNCTIONS.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select>
      <input className="input" placeholder="Primary owner" value={form.ownerName} onChange={e=>setForm({...form,ownerName:e.target.value})} />
      <span className="flex gap-2"><input className="input" type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})} /><button className="btn-primary shrink-0">Add</button></span>
    </form>}
    {view==='kanban' ? <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
      {STATUSES.map(st => <div key={st} className="card p-3"><h4 className="font-sans font-bold text-sm text-[#6E1423] mb-2">{st} ({filtered.filter(t=>t.status===st).length})</h4>
        {filtered.filter(t=>t.status===st).map(t=><div key={t.id} className="border border-[#EADFC6] rounded-lg p-2 mb-2 font-sans text-sm"><p className="font-semibold">{t.title}</p><p className="text-xs opacity-70">{fname(t.functionId)} · {t.ownerName}</p></div>)}</div>)}
    </div> : <div className="card overflow-x-auto"><table className="w-full font-sans text-sm min-w-[720px]">
      <thead><tr className="text-left bg-[#F5EEDD]">{['Task','Function','Owner','Priority','Status','Deadline',''].map(h=><th key={h} className="p-3">{h}</th>)}</tr></thead>
      <tbody>{filtered.map(t=><tr key={t.id} className="border-t border-[#F5EEDD]">
        <td className="p-3 font-semibold">{t.title}{t.isTemplate && <span className="ml-2 text-[10px] bg-[#F5EEDD] px-1.5 py-0.5 rounded">TEMPLATE</span>}</td>
        <td className="p-3">{fname(t.functionId)}</td><td className="p-3">{t.ownerName}</td>
        <td className="p-3">{t.priority}</td>
        <td className="p-3">{canWrite ? <select className="border rounded px-1 py-1" value={t.status} onChange={e=>updateTask(t.id!,{status:e.target.value as TaskStatus})}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select> : t.status}</td>
        <td className="p-3">{t.deadline || '—'}</td>
        <td className="p-3">{user?.role==='ADMIN' && <button className="text-red-700 underline text-xs" onClick={()=>{ if(confirm('Delete this task?')) removeTask(t.id!) }}>Delete</button>}</td></tr>)}
      {!filtered.length && <tr><td colSpan={7} className="p-6 text-center opacity-70">No tasks yet. {user?.role==='ADMIN' ? 'Import the template checklist above, or add the first task.' : 'Tasks will appear here once added.'}</td></tr>}
      </tbody></table></div>}
    <p className="font-sans text-xs opacity-60 mt-3">Function-wise and member-wise views: use the function filter above; member view = filter by owner in My Responsibilities after tasks are assigned to you.</p>
  </div>
}
