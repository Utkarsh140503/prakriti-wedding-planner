import { useEffect, useState } from 'react'
import { collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'
import { subscribeWeddingSettings } from '../services/settings'
import { subscribeUsers } from '../services/users'
import { useAuth } from '../contexts/AuthContext'
import type { AppUser, Invitation } from '../types'
export default function SettingsPage() {
  const { user } = useAuth(); const isAdmin = user?.role === 'ADMIN'
  const [settings, setSettings] = useState<Record<string, unknown>>({}); const [wed, setWed] = useState({ groomName: '', brideName: '', weddingDate: '2026-12-02', city: '', venue: '' }); const [msg, setMsg] = useState('')
  const [invs, setInvs] = useState<(Invitation & { id: string })[]>([]); const [invEmail, setInvEmail] = useState(''); const [invName, setInvName] = useState(''); const [invRole, setInvRole] = useState('FAMILY')
  const [users, setUsers] = useState<AppUser[]>([]); const [myName, setMyName] = useState(user?.displayName || '')
  useEffect(() => subscribeWeddingSettings(setSettings), []); useEffect(() => subscribeUsers(setUsers), [])
  useEffect(() => { if (Object.keys(settings).length) setWed({ groomName: String(settings.groomName || ''), brideName: String(settings.brideName || ''), weddingDate: String(settings.weddingDate || '2026-12-02'), city: String(settings.city || ''), venue: String(settings.venue || '') }) }, [settings])
  useEffect(() => { if (!isAdmin) return; return onSnapshot(collection(db, 'invitations'), (s) => setInvs(s.docs.map(d => ({ id: d.id, ...(d.data() as Invitation) }))), () => {}) }, [isAdmin])
  return <div><h2 className="text-2xl font-bold text-[#6E1423] mb-4">Settings</h2>
    <div className="card p-5 mb-5"><h3 className="font-bold text-[#6E1423] mb-3">My profile</h3>
      <p className="font-sans text-sm mb-2">{user?.email} · Role: <b>{user?.role}</b></p>
      <div className="flex gap-2 font-sans"><input className="input !w-64" value={myName} onChange={e => setMyName(e.target.value)} placeholder="Your display name" /><button className="btn-gold" onClick={async () => { await updateDoc(doc(db, 'users', user!.uid), { displayName: myName }); setMsg('Profile saved ✓ — it will show everywhere after your next login.') }}>Save name</button></div>
    </div>
    {isAdmin && <div className="card p-5 mb-5"><h3 className="font-bold text-[#6E1423] mb-3">Wedding details (Admin)</h3>
      <div className="grid sm:grid-cols-3 gap-3 font-sans">
        <div><label className="label">Groom's name</label><input className="input" value={wed.groomName} onChange={e => setWed({ ...wed, groomName: e.target.value })} placeholder="Pending Confirmation" /></div>
        <div><label className="label">Bride's name</label><input className="input" value={wed.brideName} onChange={e => setWed({ ...wed, brideName: e.target.value })} placeholder="Pending Confirmation" /></div>
        <div><label className="label">Wedding date</label><input className="input" type="date" value={wed.weddingDate} onChange={e => setWed({ ...wed, weddingDate: e.target.value })} /></div>
        <div><label className="label">City</label><input className="input" value={wed.city} onChange={e => setWed({ ...wed, city: e.target.value })} placeholder="Pending Confirmation" /></div>
        <div><label className="label">Main venue</label><input className="input" value={wed.venue} onChange={e => setWed({ ...wed, venue: e.target.value })} placeholder="Pending Confirmation" /></div>
      </div>
      <button className="btn-primary mt-3 font-sans" onClick={async () => { await setDoc(doc(db, 'weddingSettings', 'main'), { ...wed }, { merge: true }); setMsg('Wedding details saved ✓') }}>Save wedding details</button>
      <p className="font-sans text-xs opacity-60 mt-2">Leave a field blank rather than guessing — blank honestly means Pending Confirmation.</p></div>}
    {isAdmin && <div className="card p-5 mb-5"><h3 className="font-bold text-[#6E1423] mb-1">Approved emails — invitations (Admin)</h3>
      <p className="font-sans text-sm opacity-70 mb-3">Only people on this list can register. Add a family member's email here, then ask them to open the site and Register with that exact email.</p>
      <div className="flex flex-wrap gap-2 font-sans items-end mb-3">
        <div><label className="label">Email</label><input className="input !w-64" value={invEmail} onChange={e => setInvEmail(e.target.value)} placeholder="name@example.com" /></div>
        <div><label className="label">Name</label><input className="input" value={invName} onChange={e => setInvName(e.target.value)} /></div>
        <div><label className="label">Role</label><select className="input" value={invRole} onChange={e => setInvRole(e.target.value)}><option>ADMIN</option><option>FAMILY</option><option>VIEWER</option></select></div>
        <button className="btn-primary" onClick={async () => { const e = invEmail.trim().toLowerCase(); if (!e.includes('@')) return; await setDoc(doc(db, 'invitations', e), { email: e, role: invRole, status: 'approved', name: invName }); setInvEmail(''); setInvName(''); setMsg('Invitation added ✓ — ' + e + ' can now register.') }}>Approve email</button>
      </div>
      {invs.map(i => <p key={i.id} className="font-sans text-sm border-b border-[#F5EEDD] py-1.5 flex justify-between"><span>{i.email} · {i.role} · {i.status}{i.name ? ' · ' + i.name : ''}</span><button className="underline text-red-800" onClick={() => deleteDoc(doc(db, 'invitations', i.id))}>Remove</button></p>)}
      {!invs.length && <p className="font-sans text-sm opacity-70">No invitations visible — if you just published the updated security rules, refresh; the list reads from Firestore directly.</p>}
    </div>}
    {isAdmin && <div className="card p-5"><h3 className="font-bold text-[#6E1423] mb-3">Registered users (Admin)</h3>
      {users.map(u => <div key={u.uid} className="font-sans text-sm border-b border-[#F5EEDD] py-2 flex flex-wrap justify-between gap-2 items-center"><span><b>{u.displayName}</b> · {u.email} · {u.status}</span>
        <span className="flex gap-2 items-center"><select className="input !w-auto" value={u.role} disabled={u.uid === user!.uid} onChange={e => updateDoc(doc(db, 'users', u.uid), { role: e.target.value })}><option>ADMIN</option><option>FAMILY</option><option>VIEWER</option></select>
        {u.uid !== user!.uid && <button className="underline" onClick={() => updateDoc(doc(db, 'users', u.uid), { status: u.status === 'active' ? 'suspended' : 'active' })}>{u.status === 'active' ? 'Suspend' : 'Reactivate'}</button>}</span></div>)}
    </div>}
    {msg && <p className="font-sans text-sm text-green-800 mt-3">{msg}</p>}
    {!isAdmin && <p className="font-sans text-sm opacity-70">Wedding details, invitations and user management are Admin-only. Ask the admin if you need a change.</p>}
  </div>
}
