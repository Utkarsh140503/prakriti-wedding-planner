import { useEffect, useMemo, useState } from 'react'
import { subscribeCollection, createIn, updateIn, deleteIn } from '../services/collections'
import { WEDDING_FUNCTIONS } from '../data/functions'
import { useAuth } from '../contexts/AuthContext'
import type { ScheduleEvent } from '../types'
const STATUSES = ['Confirmed','Tentative','Pending Confirmation','Cancelled']
const empty: ScheduleEvent = { eventName: '', functionId: 'main-wedding', date: '', status: 'Pending Confirmation' }
const fname = (id: string) => WEDDING_FUNCTIONS.find(f => f.id === id)?.name || id
const mapsUrl = (e: ScheduleEvent) => e.mapsLink || (e.address || e.venue ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((e.venue ? e.venue + ', ' : '') + (e.address || '')) : '')
export default function SchedulePage() {
  const { user } = useAuth(); const [rows, setRows] = useState<(ScheduleEvent & { id: string })[]>([])
  const [form, setForm] = useState<ScheduleEvent>(empty); const [editId, setEditId] = useState<string | null>(null)
  useEffect(() => subscribeCollection<ScheduleEvent>('eventSchedule', setRows), [])
  const canWrite = user && user.role !== 'VIEWER'
  const sorted = useMemo(() => [...rows].sort((a, b) => (a.date + (a.startTime || '')).localeCompare(b.date + (b.startTime || ''))), [rows])
  const byDate = useMemo(() => { const m = new Map<string, typeof sorted>(); sorted.forEach(e => m.set(e.date || 'Date pending', [...(m.get(e.date || 'Date pending') || []), e])); return [...m.entries()] }, [sorted])
  const save = async () => { if (!form.eventName.trim()) return; if (editId) await updateIn('eventSchedule', editId, { ...form }); else await createIn('eventSchedule', { ...form }, user!.uid); setForm(empty); setEditId(null) }
  const shareText = () => { const lines = sorted.map(e => '• ' + (e.date || 'Date TBC') + (e.startTime ? ' ' + e.startTime : '') + ' — ' + e.eventName + (e.venue ? ' @ ' + e.venue : '') + (mapsUrl(e) ? ' (' + mapsUrl(e) + ')' : '')); return 'PraKriti Wedding — Event Schedule (2 Dec 2026 wedding)' + String.fromCharCode(10) + (lines.join(String.fromCharCode(10)) || 'Schedule to be confirmed.') }
  return <div><div className="flex flex-wrap justify-between items-center gap-3 mb-1"><h2 className="text-2xl font-bold text-[#6E1423]">Event Schedule</h2>
    <div className="font-sans text-sm flex gap-2"><a className="px-3 py-2 rounded-lg bg-[#2E5E4E] text-white" href={'https://wa.me/?text=' + encodeURIComponent(shareText())} target="_blank" rel="noreferrer">Share on WhatsApp</a><button className="px-3 py-2 rounded-lg border bg-white" onClick={() => window.print()}>Print schedule</button></div></div>
    <p className="font-sans text-sm opacity-70 mb-4">The family timeline, in date order. Events appear here only when added — dates and venues are never assumed. Use the per-function pages to store each function's official date; add the running-order events here.</p>
    {canWrite && <div className="card p-4 mb-5"><h3 className="font-bold text-[#6E1423] mb-3">{editId ? 'Edit event' : 'Add schedule event'}</h3>
      <div className="grid sm:grid-cols-3 gap-3 font-sans">
        <div><label className="label">Event name</label><input className="input" value={form.eventName} onChange={e => setForm({ ...form, eventName: e.target.value })} /></div>
        <div><label className="label">Function</label><select className="input" value={form.functionId} onChange={e => setForm({ ...form, functionId: e.target.value })}>{WEDDING_FUNCTIONS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
        <div><label className="label">Status</label><select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{STATUSES.map(x => <option key={x}>{x}</option>)}</select></div>
        <div><label className="label">Date</label><input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
        <div><label className="label">Start time</label><input className="input" type="time" value={form.startTime || ''} onChange={e => setForm({ ...form, startTime: e.target.value })} /></div>
        <div><label className="label">End time</label><input className="input" type="time" value={form.endTime || ''} onChange={e => setForm({ ...form, endTime: e.target.value })} /></div>
        <div><label className="label">Venue</label><input className="input" value={form.venue || ''} onChange={e => setForm({ ...form, venue: e.target.value })} /></div>
        <div><label className="label">Address</label><input className="input" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
        <div><label className="label">Google Maps link (optional — auto from address)</label><input className="input" value={form.mapsLink || ''} onChange={e => setForm({ ...form, mapsLink: e.target.value })} /></div>
        <div><label className="label">Dress code</label><input className="input" value={form.dressCode || ''} onChange={e => setForm({ ...form, dressCode: e.target.value })} /></div>
        <div><label className="label">Contact person</label><input className="input" value={form.contactPerson || ''} onChange={e => setForm({ ...form, contactPerson: e.target.value })} /></div>
        <div><label className="label">Notes</label><input className="input" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
      </div>
      <div className="mt-3 flex gap-2"><button className="btn-primary" onClick={save}>{editId ? 'Save changes' : 'Add event'}</button>{editId && <button className="btn-gold" onClick={() => { setForm(empty); setEditId(null) }}>Cancel</button>}</div></div>}
    {byDate.map(([date, events]) => <div key={date} className="mb-5"><h3 className="font-bold text-[#6E1423] mb-2">{date === 'Date pending' ? 'Date: Pending Confirmation' : new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
      <div className="relative border-l-2 border-[#D9C07A] ml-2 pl-5 space-y-3">
      {events.map(e => <div key={e.id} className="card p-4 relative"><span className="absolute -left-[27px] top-5 w-3 h-3 rounded-full bg-[#B8912F] border-2 border-[#FBF7EF]" />
        <p className="font-bold text-[#6E1423]">{e.startTime || 'Time TBC'}{e.endTime ? ' – ' + e.endTime : ''} · {e.eventName} <span className="font-sans text-xs font-normal bg-[#F5EEDD] px-2 py-0.5 rounded-full">{e.status}</span></p>
        <p className="font-sans text-sm mt-1">{fname(e.functionId)}{e.venue ? ' · ' + e.venue : ''}{e.dressCode ? ' · Dress: ' + e.dressCode : ''}{e.contactPerson ? ' · Contact: ' + e.contactPerson : ''}</p>
        {e.description && <p className="font-sans text-sm opacity-80">{e.description}</p>}
        {mapsUrl(e) && <a className="font-sans text-sm underline" href={mapsUrl(e)} target="_blank" rel="noreferrer">Get directions (Google Maps)</a>}
        {canWrite && <div className="font-sans text-sm mt-1 flex gap-3"><button className="underline" onClick={() => { setForm(e); setEditId(e.id) }}>Edit</button>{user!.role === 'ADMIN' && <button className="underline text-red-800" onClick={() => deleteIn('eventSchedule', e.id)}>Delete</button>}</div>}
      </div>)}
      </div></div>)}
    {!rows.length && <p className="font-sans text-sm opacity-70">No schedule events yet — they will appear here as the family confirms dates and venues.</p>}
  </div>
}
