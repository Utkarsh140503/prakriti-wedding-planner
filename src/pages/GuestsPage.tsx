import { useEffect, useMemo, useState } from 'react'
import { subscribeCollection, createIn, updateIn, deleteIn } from '../services/collections'
import { WEDDING_FUNCTIONS } from '../data/functions'
import { useAuth } from '../contexts/AuthContext'
import type { Guest } from '../types'
const SIDES = ["Groom's Side", "Bride's Side", 'Common']
const INV_TYPES = ['Printed Card','Digital Card / WhatsApp','Personal Visit','Phone Invitation','Courier','Email','Not Yet Decided']
const INV_STATUS = ['Not Sent','Sent','Delivered','Received','Pending Confirmation']
const RSVP = ['Confirmed','Tentative','Declined','No Response','Pending Confirmation']
const MEALS = ['Vegetarian','Non-Vegetarian','Jain','No Onion-Garlic','Not Specified']
const empty: Guest = { fullName: '', side: SIDES[0], invitationStatus: 'Not Sent', rsvpStatus: 'Pending Confirmation', functionsInvited: [] }
const heads = (g: Guest) => g.memberCount ?? (((g.adults || 0) + (g.children || 0)) || 1)
export default function GuestsPage() {
  const { user } = useAuth(); const [rows, setRows] = useState<(Guest & { id: string })[]>([])
  const [form, setForm] = useState<Guest>(empty); const [editId, setEditId] = useState<string | null>(null)
  const [q, setQ] = useState(''); const [fSide, setFSide] = useState('all'); const [fRsvp, setFRsvp] = useState('all'); const [fFn, setFFn] = useState('all'); const [msg, setMsg] = useState('')
  useEffect(() => subscribeCollection<Guest>('guests', setRows), [])
  const canWrite = user && user.role !== 'VIEWER'
  const shown = rows.filter(g => (fSide === 'all' || g.side === fSide) && (fRsvp === 'all' || g.rsvpStatus === fRsvp) && (fFn === 'all' || (g.functionsInvited || []).includes(fFn)) && (!q || (g.fullName + ' ' + (g.familyName || '') + ' ' + (g.city || '')).toLowerCase().includes(q.toLowerCase())))
  const stats = useMemo(() => { const totalHeads = rows.reduce((s, g) => s + heads(g), 0); const confirmed = rows.filter(g => g.rsvpStatus === 'Confirmed').reduce((s, g) => s + heads(g), 0); const invited = rows.filter(g => g.invitationStatus !== 'Not Sent').length; const meals: Record<string, number> = {}; rows.forEach(g => { const k = g.mealPreference || 'Not Specified'; meals[k] = (meals[k] || 0) + heads(g) }); const acc = rows.filter(g => g.accommodation).length; const trn = rows.filter(g => g.transport).length; return { totalHeads, confirmed, invited, meals, acc, trn } }, [rows])
  const num = (v: string) => v === '' ? undefined : Number(v)
  const save = async () => { if (!form.fullName.trim()) return; if (editId) await updateIn('guests', editId, { ...form }); else await createIn('guests', { ...form }, user!.uid); setForm(empty); setEditId(null) }
  const toggleFn = (id: string) => setForm(f => ({ ...f, functionsInvited: (f.functionsInvited || []).includes(id) ? (f.functionsInvited || []).filter(x => x !== id) : [...(f.functionsInvited || []), id] }))
  function exportCsv() {
    const r = [['Full Name','Family/Group','Side','Phone','City','Members','Adults','Children','Invitation Type','Invitation Status','RSVP','Meal','Accommodation','Transport','Functions','Notes'], ...rows.map(g => [g.fullName, g.familyName || '', g.side, g.phone || '', g.city || '', String(heads(g)), String(g.adults || ''), String(g.children || ''), g.invitationType || '', g.invitationStatus, g.rsvpStatus, g.mealPreference || '', g.accommodation ? 'Yes' : 'No', g.transport ? 'Yes' : 'No', (g.functionsInvited || []).join(';'), g.notes || ''])]
    const csv = r.map(x => x.map(c => '"' + String(c).replaceAll('"', '""') + '"').join(',')).join(String.fromCharCode(10))
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'prakriti-guests.csv'; a.click(); URL.revokeObjectURL(a.href)
  }
  function downloadTemplate() {
    const csv = 'fullName,familyName,side,phone,city,memberCount,adults,children,mealPreference,notes' + String.fromCharCode(10) + 'Example Guest,Example Family,Groom’s Side,9876543210,City,4,3,1,Vegetarian,Sample row — delete this'
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'prakriti-guests-import-template.csv'; a.click(); URL.revokeObjectURL(a.href)
  }
  async function importCsv(file: File) {
    const text = await file.text(); const lines = text.split(/\r?\n/).filter(l => l.trim()); if (lines.length < 2) return
    const parse = (line: string) => { const out: string[] = []; let cur = ''; let inQ = false; for (let i = 0; i < line.length; i++) { const c = line[i]; if (inQ) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++ } else inQ = false } else cur += c } else if (c === '"') inQ = true; else if (c === ',') { out.push(cur); cur = '' } else cur += c } out.push(cur); return out.map(s => s.trim()) }
    const hdr = parse(lines[0]).map(h => h.toLowerCase().replace(/[^a-z]/g, ''))
    const idx = (names: string[]) => hdr.findIndex(h => names.includes(h))
    const ix = { name: idx(['fullname', 'name', 'guestname']), fam: idx(['familyname', 'family', 'group']), side: idx(['side']), phone: idx(['phone', 'mobile']), city: idx(['city']), members: idx(['membercount', 'members', 'guests', 'headcount']), adults: idx(['adults']), children: idx(['children', 'kids']), meal: idx(['mealpreference', 'meal', 'food']), notes: idx(['notes', 'note']) }
    if (ix.name === -1) { setMsg('Import failed: the CSV needs a "fullName" (or "name") column. Download the template for the exact format.'); return }
    let n = 0; for (const line of lines.slice(1)) { const c = parse(line); if (!c[ix.name]) continue; const g: Guest = { fullName: c[ix.name], familyName: ix.fam >= 0 ? c[ix.fam] : undefined, side: ix.side >= 0 && SIDES.includes(c[ix.side]) ? c[ix.side] : SIDES[0], phone: ix.phone >= 0 ? c[ix.phone] : undefined, city: ix.city >= 0 ? c[ix.city] : undefined, memberCount: ix.members >= 0 ? Number(c[ix.members]) || undefined : undefined, adults: ix.adults >= 0 ? Number(c[ix.adults]) || undefined : undefined, children: ix.children >= 0 ? Number(c[ix.children]) || undefined : undefined, mealPreference: ix.meal >= 0 ? c[ix.meal] : undefined, notes: ix.notes >= 0 ? c[ix.notes] : undefined, invitationStatus: 'Not Sent', rsvpStatus: 'Pending Confirmation', functionsInvited: [] }; await createIn('guests', { ...g }, user!.uid); n++ }
    setMsg('Imported ' + n + ' guest entries ✓ — set their invitation status, RSVP and functions from the list below.')
  }
  return <div><h2 className="text-2xl font-bold text-[#6E1423] mb-1">Guests</h2>
    <p className="font-sans text-sm opacity-70 mb-4">The guest master list — invitations, RSVPs, meals, stay and transport. Counts below are computed from real entries only; there is no assumed guest count anywhere.</p>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {[['Guest entries', rows.length],['Total people (headcount)', stats.totalHeads],['Invitations sent', stats.invited + ' / ' + rows.length],['Confirmed people (RSVP)', stats.confirmed]].map(([k, v]) => <div key={k} className="card p-4"><p className="font-sans text-xs uppercase tracking-wide opacity-70">{k}</p><p className="text-xl font-bold text-[#6E1423] mt-1">{v}</p></div>)}
    </div>
    <div className="card p-4 mb-4"><h3 className="font-bold text-[#6E1423] mb-2">Meal & logistics summary (headcount)</h3>
      <p className="font-sans text-sm">{Object.entries(stats.meals).map(([k, v]) => k + ': ' + v).join(' · ') || 'No guests yet'}</p>
      <p className="font-sans text-sm mt-1">Families needing accommodation: <b>{stats.acc}</b> · needing transport: <b>{stats.trn}</b></p></div>
    <div className="font-sans text-sm flex flex-wrap gap-2 mb-4 items-center">
      <input className="input !w-52" placeholder="Search name / family / city" value={q} onChange={e => setQ(e.target.value)} />
      <select className="input !w-auto" value={fSide} onChange={e => setFSide(e.target.value)}><option value="all">All sides</option>{SIDES.map(x => <option key={x}>{x}</option>)}</select>
      <select className="input !w-auto" value={fRsvp} onChange={e => setFRsvp(e.target.value)}><option value="all">All RSVP</option>{RSVP.map(x => <option key={x}>{x}</option>)}</select>
      <select className="input !w-auto" value={fFn} onChange={e => setFFn(e.target.value)}><option value="all">All functions</option>{WEDDING_FUNCTIONS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
      <button className="px-3 py-2 rounded-lg bg-[#B8912F] text-white" onClick={exportCsv}>Export CSV</button>
      <button className="px-3 py-2 rounded-lg border bg-white" onClick={downloadTemplate}>Import template</button>
      {canWrite && <label className="px-3 py-2 rounded-lg bg-[#6E1423] text-white cursor-pointer">Import CSV<input type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) importCsv(f); e.target.value = '' }} /></label>}
    </div>
    {msg && <p className="font-sans text-sm text-green-800 mb-3">{msg}</p>}
    {canWrite && <div className="card p-4 mb-5"><h3 className="font-bold text-[#6E1423] mb-3">{editId ? 'Edit guest' : 'Add guest / family'}</h3>
      <div className="grid sm:grid-cols-3 gap-3 font-sans">
        <div><label className="label">Full name</label><input className="input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div>
        <div><label className="label">Family / group name</label><input className="input" value={form.familyName || ''} onChange={e => setForm({ ...form, familyName: e.target.value })} /></div>
        <div><label className="label">Side</label><select className="input" value={form.side} onChange={e => setForm({ ...form, side: e.target.value })}>{SIDES.map(x => <option key={x}>{x}</option>)}</select></div>
        <div><label className="label">Phone / WhatsApp</label><input className="input" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
        <div><label className="label">City</label><input className="input" value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
        <div><label className="label">Total members</label><input className="input" type="number" value={form.memberCount ?? ''} onChange={e => setForm({ ...form, memberCount: num(e.target.value) })} /></div>
        <div><label className="label">Adults</label><input className="input" type="number" value={form.adults ?? ''} onChange={e => setForm({ ...form, adults: num(e.target.value) })} /></div>
        <div><label className="label">Children</label><input className="input" type="number" value={form.children ?? ''} onChange={e => setForm({ ...form, children: num(e.target.value) })} /></div>
        <div><label className="label">Invitation type</label><select className="input" value={form.invitationType || ''} onChange={e => setForm({ ...form, invitationType: e.target.value })}><option value="">—</option>{INV_TYPES.map(x => <option key={x}>{x}</option>)}</select></div>
        <div><label className="label">Invitation status</label><select className="input" value={form.invitationStatus} onChange={e => setForm({ ...form, invitationStatus: e.target.value })}>{INV_STATUS.map(x => <option key={x}>{x}</option>)}</select></div>
        <div><label className="label">RSVP status</label><select className="input" value={form.rsvpStatus} onChange={e => setForm({ ...form, rsvpStatus: e.target.value })}>{RSVP.map(x => <option key={x}>{x}</option>)}</select></div>
        <div><label className="label">Meal preference</label><select className="input" value={form.mealPreference || ''} onChange={e => setForm({ ...form, mealPreference: e.target.value })}><option value="">—</option>{MEALS.map(x => <option key={x}>{x}</option>)}</select></div>
        <label className="font-sans text-sm flex items-center gap-2 pt-6"><input type="checkbox" checked={!!form.accommodation} onChange={e => setForm({ ...form, accommodation: e.target.checked })} /> Accommodation needed</label>
        <label className="font-sans text-sm flex items-center gap-2 pt-6"><input type="checkbox" checked={!!form.transport} onChange={e => setForm({ ...form, transport: e.target.checked })} /> Transport needed</label>
        <div><label className="label">Notes</label><input className="input" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
      </div>
      <div className="mt-3"><p className="label">Invited to functions</p><div className="flex flex-wrap gap-2 font-sans text-sm">{WEDDING_FUNCTIONS.map(f => <button key={f.id} type="button" onClick={() => toggleFn(f.id)} className={`px-2.5 py-1 rounded-full border ${(form.functionsInvited || []).includes(f.id) ? 'bg-[#6E1423] text-white' : 'bg-white'}`}>{f.name}</button>)}</div></div>
      <div className="mt-3 flex gap-2"><button className="btn-primary" onClick={save}>{editId ? 'Save changes' : 'Add guest'}</button>{editId && <button className="btn-gold" onClick={() => { setForm(empty); setEditId(null) }}>Cancel</button>}</div></div>}
    <div className="card overflow-x-auto"><table className="w-full text-left font-sans text-sm min-w-[820px]"><thead><tr className="border-b border-[#EADFC6]"><th className="p-3">Guest</th><th className="p-3">People</th><th className="p-3">Invitation</th><th className="p-3">RSVP</th><th className="p-3">Meal</th><th className="p-3">Stay / Travel</th><th className="p-3"></th></tr></thead>
    <tbody>{shown.map(g => <tr key={g.id} className="border-b border-[#F5EEDD]"><td className="p-3"><b>{g.fullName}</b><br /><span className="opacity-70">{g.familyName || ''} · {g.side}{g.city ? ' · ' + g.city : ''}{g.phone ? ' · ' + g.phone : ''}</span></td><td className="p-3">{heads(g)}</td>
      <td className="p-3">{canWrite ? <select className="input !w-auto" value={g.invitationStatus} onChange={e => updateIn('guests', g.id, { invitationStatus: e.target.value })}>{INV_STATUS.map(x => <option key={x}>{x}</option>)}</select> : g.invitationStatus}</td>
      <td className="p-3">{canWrite ? <select className="input !w-auto" value={g.rsvpStatus} onChange={e => updateIn('guests', g.id, { rsvpStatus: e.target.value })}>{RSVP.map(x => <option key={x}>{x}</option>)}</select> : g.rsvpStatus}</td>
      <td className="p-3">{g.mealPreference || '—'}</td><td className="p-3">{g.accommodation ? 'Stay ' : ''}{g.transport ? 'Transport' : ''}{!g.accommodation && !g.transport ? '—' : ''}</td>
      <td className="p-3 whitespace-nowrap">{canWrite && <button className="underline mr-2" onClick={() => { setForm(g); setEditId(g.id) }}>Edit</button>}{user!.role === 'ADMIN' && <button className="underline text-red-800" onClick={() => deleteIn('guests', g.id)}>Delete</button>}</td></tr>)}
    {!shown.length && <tr><td className="p-3" colSpan={7}>No guests match — add guests one by one or import a CSV.</td></tr>}</tbody></table></div>
  </div>
}
