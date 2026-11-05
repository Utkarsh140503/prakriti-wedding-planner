import { useEffect, useState } from 'react'
import { subscribeCollection, createIn, updateIn, deleteIn } from '../services/collections'
import { VENDOR_CATEGORIES, VENDOR_STATUSES } from '../data/templates-items'
import { WEDDING_FUNCTIONS } from '../data/functions'
import { useAuth } from '../contexts/AuthContext'
import type { Vendor } from '../types'
const inr = (n?: number) => '₹' + (n || 0).toLocaleString('en-IN')
const empty: Vendor = { businessName: '', category: 'Other', status: 'Pending Confirmation' }
export default function VendorsPage() {
  const { user } = useAuth(); const [rows, setRows] = useState<(Vendor & { id: string })[]>([])
  const [form, setForm] = useState<Vendor>(empty); const [editId, setEditId] = useState<string | null>(null); const [cat, setCat] = useState('all')
  useEffect(() => subscribeCollection<Vendor>('vendors', setRows), [])
  const canWrite = user && user.role !== 'VIEWER'; const shown = cat === 'all' ? rows : rows.filter(r => r.category === cat)
  const num = (v: string) => v === '' ? undefined : Number(v)
  const save = async () => { if (!form.businessName.trim()) return; if (editId) await updateIn('vendors', editId, { ...form }); else await createIn('vendors', { ...form }, user!.uid); setForm(empty); setEditId(null) }
  return <div><h2 className="text-2xl font-bold text-[#6E1423] mb-1">Vendors</h2>
    <p className="font-sans text-sm opacity-70 mb-4">Every vendor the family is talking to or has booked. Balance = final amount (or quoted, if final is not set) minus advance paid. No vendor is pre-filled — add only real enquiries and bookings.</p>
    <div className="font-sans text-sm flex flex-wrap gap-2 mb-4"><button onClick={() => setCat('all')} className={`px-3 py-1.5 rounded-lg border ${cat==='all'?'bg-[#6E1423] text-white':'bg-white'}`}>All</button>{VENDOR_CATEGORIES.map(c => <button key={c} onClick={() => setCat(c)} className={`px-3 py-1.5 rounded-lg border ${cat===c?'bg-[#6E1423] text-white':'bg-white'}`}>{c}</button>)}</div>
    {canWrite && <div className="card p-4 mb-5"><h3 className="font-bold text-[#6E1423] mb-3">{editId ? 'Edit vendor' : 'Add vendor'}</h3>
      <div className="grid sm:grid-cols-3 gap-3 font-sans">
        <div><label className="label">Business name</label><input className="input" value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} /></div>
        <div><label className="label">Owner name</label><input className="input" value={form.ownerName || ''} onChange={e => setForm({ ...form, ownerName: e.target.value })} /></div>
        <div><label className="label">Category</label><select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{VENDOR_CATEGORIES.map(x => <option key={x}>{x}</option>)}</select></div>
        <div><label className="label">Contact person</label><input className="input" value={form.contactPerson || ''} onChange={e => setForm({ ...form, contactPerson: e.target.value })} /></div>
        <div><label className="label">Phone</label><input className="input" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
        <div><label className="label">WhatsApp</label><input className="input" value={form.whatsapp || ''} onChange={e => setForm({ ...form, whatsapp: e.target.value })} /></div>
        <div><label className="label">Email</label><input className="input" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        <div><label className="label">Function</label><select className="input" value={form.functionId || ''} onChange={e => setForm({ ...form, functionId: e.target.value })}><option value="">—</option>{WEDDING_FUNCTIONS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
        <div><label className="label">Status</label><select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{VENDOR_STATUSES.map(x => <option key={x}>{x}</option>)}</select></div>
        <div><label className="label">Quoted (₹)</label><input className="input" type="number" value={form.quotedAmount ?? ''} onChange={e => setForm({ ...form, quotedAmount: num(e.target.value) })} /></div>
        <div><label className="label">Final (₹)</label><input className="input" type="number" value={form.finalAmount ?? ''} onChange={e => setForm({ ...form, finalAmount: num(e.target.value) })} /></div>
        <div><label className="label">Advance paid (₹)</label><input className="input" type="number" value={form.advancePaid ?? ''} onChange={e => setForm({ ...form, advancePaid: num(e.target.value) })} /></div>
        <div><label className="label">Rating after event (1–5)</label><input className="input" type="number" min={1} max={5} value={form.rating ?? ''} onChange={e => setForm({ ...form, rating: num(e.target.value) })} /></div>
        <div><label className="label">Contract (Google Drive link)</label><input className="input" placeholder="Paste Drive link" value={form.contractUrl || ''} onChange={e => setForm({ ...form, contractUrl: e.target.value })} /></div>
        <div><label className="label">City / Address / Notes</label><input className="input" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
      </div>
      <div className="mt-3 flex gap-2"><button className="btn-primary" onClick={save}>{editId ? 'Save changes' : 'Add vendor'}</button>{editId && <button className="btn-gold" onClick={() => { setForm(empty); setEditId(null) }}>Cancel</button>}</div></div>}
    <div className="grid sm:grid-cols-2 gap-3">
      {shown.map(v => { const bal = Math.max(((v.finalAmount ?? v.quotedAmount) || 0) - (v.advancePaid || 0), 0); return <div key={v.id} className="card p-4">
        <p className="font-bold text-[#6E1423]">{v.businessName} <span className="font-sans text-xs font-normal bg-[#F5EEDD] px-2 py-0.5 rounded-full">{v.status}</span></p>
        <p className="font-sans text-sm mt-1">{v.category}{v.contactPerson ? ' · ' + v.contactPerson : ''}{v.phone ? ' · ' + v.phone : ''}</p>
        <p className="font-sans text-sm">Final: <b>{inr(v.finalAmount ?? v.quotedAmount)}</b> · Advance: {inr(v.advancePaid)} · Balance: <b>{inr(bal)}</b>{v.rating ? ' · Rating: ' + v.rating + '/5' : ''}</p>
        {v.contractUrl && <a className="font-sans text-sm underline" href={v.contractUrl} target="_blank" rel="noreferrer">View contract (Drive)</a>}
        {canWrite && <div className="font-sans text-sm mt-2 flex gap-3"><button className="underline" onClick={() => { setForm(v); setEditId(v.id) }}>Edit</button>{user!.role === 'ADMIN' && <button className="underline text-red-800" onClick={() => deleteIn('vendors', v.id)}>Delete</button>}</div>}
      </div> })}
      {!shown.length && <p className="font-sans text-sm opacity-70">No vendors in this category yet.</p>}
    </div></div>
}
