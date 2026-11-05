import { useEffect, useState } from 'react'
import { updateTask } from '../../services/tasks'
import { subscribeComments, addComment } from '../../services/comments'
import { WEDDING_FUNCTIONS } from '../../data/functions'
import { useAuth } from '../../contexts/AuthContext'
import type { AppUser, WeddingTask } from '../../types'
export default function TaskPanel({ task, members, onClose }: { task: WeddingTask; members: AppUser[]; onClose: () => void }) {
  const { user } = useAuth()
  const [f, setF] = useState({ ...task })
  const [comments, setComments] = useState<import('../../services/comments').TaskComment[]>([])
  const [ctext, setCtext] = useState(''); const [saved, setSaved] = useState('')
  useEffect(() => subscribeComments(task.id!, setComments), [task.id])
  const canWrite = user && user.role !== 'VIEWER'
  const num = (v: string) => v === '' ? undefined : Number(v)
  return <div className="fixed inset-0 z-20 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
    <div className="bg-[#FBF7EF] w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-start"><h3 className="text-lg font-bold text-[#6E1423]">Task details</h3>
      <button className="font-sans text-sm underline" onClick={onClose}>Close</button></div>
      <div className="grid sm:grid-cols-2 gap-3 mt-3 font-sans">
        <div className="sm:col-span-2"><label className="label">Title</label><input className="input" disabled={!canWrite} value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></div>
        <div className="sm:col-span-2"><label className="label">Description</label><textarea className="input" rows={2} disabled={!canWrite} value={f.description || ''} onChange={e => setF({ ...f, description: e.target.value })} /></div>
        <div><label className="label">Function</label><select className="input" disabled={!canWrite} value={f.functionId} onChange={e => setF({ ...f, functionId: e.target.value })}>{WEDDING_FUNCTIONS.map(x => <option key={x.id} value={x.id}>{x.code}. {x.name}</option>)}</select></div>
        <div><label className="label">Category</label><input className="input" disabled={!canWrite} value={f.category || ''} onChange={e => setF({ ...f, category: e.target.value })} /></div>
        <div><label className="label">Primary owner (one person)</label><select className="input" disabled={!canWrite} value={f.ownerId || ''} onChange={e => { const m = members.find(x => x.uid === e.target.value); setF({ ...f, ownerId: m?.uid, ownerName: m ? m.displayName : 'Unassigned — Pending Confirmation' }) }}>
          <option value="">Unassigned — Pending Confirmation</option>{members.map(m => <option key={m.uid} value={m.uid}>{m.displayName} ({m.role})</option>)}</select>
          {f.ownerId ? null : <input className="input mt-2" disabled={!canWrite} placeholder="Or type a name (not yet registered)" value={f.ownerName === 'Unassigned — Pending Confirmation' ? '' : f.ownerName} onChange={e => setF({ ...f, ownerName: e.target.value || 'Unassigned — Pending Confirmation' })} />}</div>
        <div><label className="label">Supporting members (comma separated)</label><input className="input" disabled={!canWrite} value={(f.supporters || []).join(', ')} onChange={e => setF({ ...f, supporters: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></div>
        <div><label className="label">Priority</label><select className="input" disabled={!canWrite} value={f.priority} onChange={e => setF({ ...f, priority: e.target.value as WeddingTask['priority'] })}>{['Critical','High','Medium','Low'].map(x => <option key={x}>{x}</option>)}</select></div>
        <div><label className="label">Status</label><select className="input" disabled={!canWrite} value={f.status} onChange={e => setF({ ...f, status: e.target.value as WeddingTask['status'] })}>{['Not Started','In Progress','Completed','On Hold','Cancelled'].map(x => <option key={x}>{x}</option>)}</select></div>
        <div><label className="label">Deadline</label><input className="input" type="date" disabled={!canWrite} value={f.deadline || ''} onChange={e => setF({ ...f, deadline: e.target.value })} /></div>
        <div><label className="label">Quantity</label><input className="input" disabled={!canWrite} value={f.quantity || ''} onChange={e => setF({ ...f, quantity: e.target.value })} /></div>
        <div><label className="label">Estimated cost (₹)</label><input className="input" type="number" disabled={!canWrite} value={f.estimatedCost ?? ''} onChange={e => setF({ ...f, estimatedCost: num(e.target.value) })} /></div>
        <div><label className="label">Actual cost (₹)</label><input className="input" type="number" disabled={!canWrite} value={f.actualCost ?? ''} onChange={e => setF({ ...f, actualCost: num(e.target.value) })} /></div>
        <div><label className="label">Vendor reference</label><input className="input" disabled={!canWrite} value={f.vendorRef || ''} onChange={e => setF({ ...f, vendorRef: e.target.value })} /></div>
        <div><label className="label">Payment status</label><select className="input" disabled={!canWrite} value={f.paymentStatus || 'Not Applicable'} onChange={e => setF({ ...f, paymentStatus: e.target.value })}>{['Not Applicable','Pending','Advance Paid','Partially Paid','Paid in Full'].map(x => <option key={x}>{x}</option>)}</select></div>
      </div>
      {canWrite && <div className="mt-4 flex items-center gap-3 font-sans"><button className="btn-primary" onClick={async () => { const { id, createdAt, updatedAt, ...patch } = f as WeddingTask & { createdAt?: unknown; updatedAt?: unknown }; await updateTask(task.id!, patch); setSaved('Saved ✓ — updates sync to all family members in real time.') }}>Save changes</button>{saved && <span className="text-sm text-green-700">{saved}</span>}</div>}
      <div className="mt-6 border-t border-[#EADFC6] pt-4">
        <h4 className="font-bold text-[#6E1423] mb-2">Comments</h4>
        {comments.length ? comments.map(c => <div key={c.id} className="font-sans text-sm bg-white border border-[#EADFC6] rounded-lg p-2.5 mb-2"><b>{c.authorName}</b><p>{c.text}</p></div>) : <p className="font-sans text-sm opacity-70">No comments yet.</p>}
        {canWrite && <form className="flex gap-2 mt-2 font-sans" onSubmit={async (e) => { e.preventDefault(); if (!ctext.trim()) return; await addComment(task.id!, ctext.trim(), user!); setCtext('') }}>
          <input className="input" placeholder="Add a comment…" value={ctext} onChange={e => setCtext(e.target.value)} /><button className="btn-gold shrink-0">Post</button></form>}
        <p className="font-sans text-xs opacity-60 mt-3">Attachments: add files via Google Drive and paste the link in a comment (Drive-link model, Phase 5 will add a dedicated Documents picker).</p>
      </div>
    </div></div>
}
