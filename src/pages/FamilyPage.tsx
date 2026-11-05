import { useEffect, useState } from 'react'
import { subscribeCollection, createIn, updateIn, deleteIn } from '../services/collections'
import { RELATIONS, SIDES } from '../data/templates-items'
import { WEDDING_FUNCTIONS } from '../data/functions'
import { useAuth } from '../contexts/AuthContext'
import type { FamilyMember } from '../types'
const empty: FamilyMember = { fullName: '', relation: 'Other', side: SIDES[0], status: 'Active', responsibilities: [], functionsInvolved: [] }
export default function FamilyPage() {
  const { user } = useAuth(); const [rows, setRows] = useState<(FamilyMember & { id: string })[]>([])
  const [form, setForm] = useState<FamilyMember>(empty); const [editId, setEditId] = useState<string | null>(null); const [side, setSide] = useState('all')
  useEffect(() => subscribeCollection<FamilyMember>('familyMembers', setRows), [])
  const canWrite = user && user.role !== 'VIEWER'; const shown = side === 'all' ? rows : rows.filter(r => r.side === side)
  const save = async () => { if (!form.fullName.trim()) return; if (editId) await updateIn('familyMembers', editId, { ...form }); else await createIn('familyMembers', { ...form }, user!.uid); setForm(empty); setEditId(null) }
  return <div><h2 className="text-2xl font-bold text-[#6E1423] mb-1">Family</h2>
    <p className="font-sans text-sm opacity-70 mb-4">The family directory — relatives and close family friends, whether or not they use the app. Registered app users appear automatically in task owner lists; this directory covers everyone else too. Names are added by the family only — nothing is pre-filled.</p>
    <div className="font-sans text-sm flex flex-wrap gap-2 mb-4">{['all', ...SIDES].map(s => <button key={s} onClick={() => setSide(s)} className={`px-3 py-1.5 rounded-lg border ${side===s?'bg-[#6E1423] text-white':'bg-white'}`}>{s === 'all' ? 'All' : s}</button>)}</div>
    {canWrite && <div className="card p-4 mb-5"><h3 className="font-bold text-[#6E1423] mb-3">{editId ? 'Edit member' : 'Add family member'}</h3>
      <div className="grid sm:grid-cols-3 gap-3 font-sans">
        <div><label className="label">Full name</label><input className="input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div>
        <div><label className="label">Relation to groom</label><select className="input" value={form.relation} onChange={e => setForm({ ...form, relation: e.target.value })}>{RELATIONS.map(x => <option key={x}>{x}</option>)}</select></div>
        <div><label className="label">Side</label><select className="input" value={form.side} onChange={e => setForm({ ...form, side: e.target.value })}>{SIDES.map(x => <option key={x}>{x}</option>)}</select></div>
        <div><label className="label">Phone</label><input className="input" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
        <div><label className="label">WhatsApp</label><input className="input" value={form.whatsapp || ''} onChange={e => setForm({ ...form, whatsapp: e.target.value })} /></div>
        <div><label className="label">Email</label><input className="input" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        <div><label className="label">Responsibilities (comma separated)</label><input className="input" value={(form.responsibilities || []).join(', ')} onChange={e => setForm({ ...form, responsibilities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></div>
        <div><label className="label">Functions involved (comma separated codes)</label><input className="input" placeholder="e.g. wedding, haldi" value={(form.functionsInvolved || []).join(', ')} onChange={e => setForm({ ...form, functionsInvolved: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></div>
        <div><label className="label">Status</label><select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option>Active</option><option>Inactive</option></select></div>
        <div className="sm:col-span-3"><label className="label">Address / notes</label><input className="input" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
      </div>
      <div className="mt-3 flex gap-2"><button className="btn-primary" onClick={save}>{editId ? 'Save changes' : 'Add member'}</button>{editId && <button className="btn-gold" onClick={() => { setForm(empty); setEditId(null) }}>Cancel</button>}</div>
      <p className="font-sans text-xs opacity-60 mt-2">Function names for reference: {WEDDING_FUNCTIONS.map(f => f.name).join(', ')}</p></div>}
    <div className="grid sm:grid-cols-2 gap-3">
      {shown.map(m => <div key={m.id} className="card p-4"><p className="font-bold text-[#6E1423]">{m.fullName}</p>
        <p className="font-sans text-sm">{m.relation} · {m.side}</p>
        {(m.responsibilities || []).length > 0 && <p className="font-sans text-sm mt-1"><b>Responsibilities:</b> {m.responsibilities!.join(', ')}</p>}
        {m.phone && <p className="font-sans text-sm">Phone: {m.phone}</p>}
        {canWrite && <div className="font-sans text-sm mt-2 flex gap-3"><button className="underline" onClick={() => { setForm(m); setEditId(m.id) }}>Edit</button>{user!.role === 'ADMIN' && <button className="underline text-red-800" onClick={() => deleteIn('familyMembers', m.id)}>Delete</button>}</div>}
      </div>)}
      {!shown.length && <p className="font-sans text-sm opacity-70">No family members added yet.</p>}
    </div></div>
}
