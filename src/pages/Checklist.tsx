import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { subscribeTasks, createTask, updateTask, removeTask, seedTemplateTasks } from '../services/tasks'
import { WEDDING_FUNCTIONS } from '../data/functions'
import { TEMPLATE_TASKS } from '../data/templates'
import { useAuth } from '../contexts/AuthContext'
import { subscribeUsers } from '../services/users'
import TaskPanel from '../components/tasks/TaskPanel'
import type { AppUser, WeddingTask, TaskStatus } from '../types'
const STATUSES: TaskStatus[] = ['Not Started','In Progress','Completed','On Hold','Cancelled']
export default function Checklist() {
  const { user } = useAuth(); const [tasks, setTasks] = useState<WeddingTask[]>([])
  const [members, setMembers] = useState<AppUser[]>([]); const [selected, setSelected] = useState<WeddingTask | null>(null)
  const [view, setView] = useState<'table'|'kanban'|'function'|'member'|'mine'>('table'); const [q, setQ] = useState(''); const [fn, setFn] = useState('all'); const [msg, setMsg] = useState('')
  const [params, setParams] = useSearchParams(); const presetStatus = params.get('status'); const presetFilter = params.get('filter')
  const [statusF, setStatusF] = useState<string>(presetStatus || (presetFilter === 'overdue' ? 'Overdue' : 'all'))
  useEffect(() => { if (presetStatus) setStatusF(presetStatus); else if (presetFilter === 'overdue') setStatusF('Overdue') }, [presetStatus, presetFilter])
  useEffect(() => subscribeUsers(setMembers), [])
  function exportCsv() {
    const rows = [['Title','Function','Category','Owner','Priority','Status','Deadline','Estimated Cost','Actual Cost','Payment Status'], ...filtered.map(x => [x.title, fname(x.functionId), x.category || '', x.ownerName, x.priority, x.status, x.deadline || '', String(x.estimatedCost ?? ''), String(x.actualCost ?? ''), x.paymentStatus || ''])]
    const csv = rows.map(r => r.map(c => '"' + String(c).replaceAll('"', '""') + '"').join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'prakriti-master-checklist.csv'; a.click(); URL.revokeObjectURL(a.href)
  }
  const groups = (key: (x: WeddingTask) => string) => { const m = new Map<string, WeddingTask[]>(); filtered.forEach(x => { const k = key(x); m.set(k, [...(m.get(k) || []), x]) }); return [...m.entries()] }
  const [form, setForm] = useState({ title: '', functionId: 'pre-wedding', ownerName: '', priority: 'Medium' as WeddingTask['priority'], deadline: '' })
  useEffect(() => subscribeTasks(setTasks), [])
  const filtered = useMemo(() => tasks.filter(t => (fn==='all'||t.functionId===fn) && (view!=='mine'||t.ownerId===user?.uid||t.ownerName===user?.displayName) && t.title.toLowerCase().includes(q.toLowerCase())), [tasks, fn, q, view, user])
  const fname = (id: string) => WEDDING_FUNCTIONS.find(f => f.id===id)?.name || id
  const canWrite = user && user.role !== 'VIEWER'
  return <div>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <h2 className="text-2xl font-bold text-[#6E1423]">Master Checklist</h2>
    {statusF !== 'all' && <div className="font-sans text-sm bg-[#F5EEDD] border border-[#D9C07A] rounded-lg px-3 py-2 mb-3 flex justify-between items-center"><span>Showing only: <b>{statusF === 'Not Started' ? 'Pending (Not Started)' : statusF}</b> tasks — {filtered.length} of {tasks.length}</span><button className="underline" onClick={() => { setStatusF('all'); setParams({}) }}>Show all tasks</button></div>}
      <div className="font-sans text-sm flex flex-wrap gap-2">
        {([['table','Table'],['kanban','Kanban'],['function','Function-wise'],['member','Member-wise'],['mine','My Responsibilities']] as const).map(([v, label]) => <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-lg border ${view===v?'bg-[#6E1423] text-white':'bg-white'}`}>{label}</button>)}
        <button onClick={exportCsv} className="px-3 py-1.5 rounded-lg border bg-[#B8912F] text-white">Export CSV</button>
      </div>
    </div>
    <div className="flex flex-wrap gap-2 mb-4 font-sans">
      <input className="input !w-64" placeholder="Search tasks…" value={q} onChange={e=>setQ(e.target.value)} />
      <select className="input !w-auto" value={statusF} onChange={e => setStatusF(e.target.value)}><option value="all">All statuses</option>{['Not Started','In Progress','Completed','On Hold','Cancelled','Overdue'].map(x => <option key={x}>{x}</option>)}</select>
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
    {view==='function' || view==='member' ? <div className="space-y-4">
      {groups(view==='function' ? (x) => fname(x.functionId) : (x) => x.ownerName).map(([g, items]) => <div key={g} className="card p-4"><h4 className="font-bold text-[#6E1423] mb-2">{g} <span className="font-sans text-xs font-normal">({items.filter(i => i.status==='Completed').length}/{items.length} done)</span></h4>
        {items.map(x => <button key={x.id} onClick={() => setSelected(x)} className="w-full text-left font-sans text-sm border-b border-[#F5EEDD] py-1.5 flex justify-between gap-3"><span className="font-semibold">{x.title}</span><span className="text-xs shrink-0">{x.status} · {x.priority}</span></button>)}</div>)}
      {!filtered.length && <p className="font-sans text-sm opacity-70">No tasks match.</p>}
    </div> : view==='kanban' ? <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
      {STATUSES.map(st => <div key={st} className="card p-3"><h4 className="font-sans font-bold text-sm text-[#6E1423] mb-2">{st} ({filtered.filter(t=>t.status===st).length})</h4>
        {filtered.filter(t=>t.status===st).map(t=><button key={t.id} onClick={() => setSelected(t)} className="w-full text-left border border-[#EADFC6] rounded-lg p-2 mb-2 font-sans text-sm bg-white"><p className="font-semibold">{t.title}</p><p className="text-xs opacity-70">{fname(t.functionId)} · {t.ownerName}</p></button>)}</div>)}
    </div> : <div className="card overflow-x-auto"><table className="w-full font-sans text-sm min-w-[720px]">
      <thead><tr className="text-left bg-[#F5EEDD]">{['Task','Function','Owner','Priority','Status','Deadline',''].map(h=><th key={h} className="p-3">{h}</th>)}</tr></thead>
      <tbody>{filtered.map(t=><tr key={t.id} className="border-t border-[#F5EEDD]">
        <td className="p-3 font-semibold"><button className="underline decoration-[#D9C07A] underline-offset-2 text-left" onClick={() => setSelected(t)}>{t.title}</button>{t.isTemplate && <span className="ml-2 text-[10px] bg-[#F5EEDD] px-1.5 py-0.5 rounded">TEMPLATE</span>}</td>
        <td className="p-3">{fname(t.functionId)}</td><td className="p-3">{t.ownerName}</td>
        <td className="p-3">{t.priority}</td>
        <td className="p-3">{canWrite ? <select className="border rounded px-1 py-1" value={t.status} onChange={e=>updateTask(t.id!,{status:e.target.value as TaskStatus})}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select> : t.status}</td>
        <td className="p-3">{t.deadline || '—'}</td>
        <td className="p-3">{user?.role==='ADMIN' && <button className="text-red-700 underline text-xs" onClick={()=>{ if(confirm('Delete this task?')) removeTask(t.id!) }}>Delete</button>}</td></tr>)}
      {!filtered.length && <tr><td colSpan={7} className="p-6 text-center opacity-70">No tasks yet. {user?.role==='ADMIN' ? 'Import the template checklist above, or add the first task.' : 'Tasks will appear here once added.'}</td></tr>}
      </tbody></table></div>}
    <p className="font-sans text-xs opacity-60 mt-3">Tap any task title to open full details — edit every field, assign a primary owner from the family list, and discuss it in comments. All changes sync in real time.</p>
    {selected && <TaskPanel task={selected} members={members} onClose={() => setSelected(null)} />}
  </div>
}
