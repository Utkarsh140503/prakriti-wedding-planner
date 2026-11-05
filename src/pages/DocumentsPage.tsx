import { useEffect, useState } from 'react'
import { subscribeCollection, createIn, deleteIn } from '../services/collections'
import { extractDriveFileId, driveThumbnail, drivePreview } from '../services/documents'
import { WEDDING_FUNCTIONS } from '../data/functions'
import { useAuth } from '../contexts/AuthContext'
import type { WeddingDocument } from '../types'
const CATEGORIES = ['Vendor Contract','Receipt / Bill','Invitation Design','Identity Document','Booking Confirmation','Ritual Reference','Photo','Other']
const fname = (id?: string) => WEDDING_FUNCTIONS.find(f => f.id === id)?.name || ''
export default function DocumentsPage() {
  const { user } = useAuth(); const [rows, setRows] = useState<(WeddingDocument & { id: string })[]>([])
  const [title, setTitle] = useState(''); const [cat, setCat] = useState(CATEGORIES[0]); const [link, setLink] = useState(''); const [fn, setFn] = useState(''); const [vendor, setVendor] = useState('')
  const [filter, setFilter] = useState('all'); const [q, setQ] = useState(''); const [openId, setOpenId] = useState<string | null>(null); const [err, setErr] = useState('')
  useEffect(() => subscribeCollection<WeddingDocument>('documents', setRows), [])
  const canWrite = user && user.role !== 'VIEWER'
  const shown = rows.filter(d => (filter === 'all' || d.category === filter) && (!q || d.title.toLowerCase().includes(q.toLowerCase())))
  const add = async () => { const id = extractDriveFileId(link.trim()); if (!title.trim()) { setErr('Give the document a title.'); return } if (!id) { setErr('That does not look like a Google Drive file link. In Drive: right-click the file → Share → Copy link, then paste it here.'); return } setErr(''); await createIn('documents', { title, category: cat, driveLink: link.trim(), fileId: id, functionId: fn || undefined, vendorName: vendor || undefined }, user!.uid); setTitle(''); setLink(''); setVendor('') }
  return <div><h2 className="text-2xl font-bold text-[#6E1423] mb-1">Documents</h2>
    <p className="font-sans text-sm opacity-70 mb-4">Files live in the family's Google Drive folder “PraKriti Wedding Planner” — this page keeps the organised index with previews. Upload in Drive first, then paste the file's share link here. Share that Drive folder only with specific approved family emails, never “anyone with the link” for contracts and receipts.</p>
    {canWrite && <div className="card p-4 mb-5"><h3 className="font-bold text-[#6E1423] mb-3">Add document (paste a Drive link)</h3>
      <div className="grid sm:grid-cols-2 gap-3 font-sans">
        <div><label className="label">Title</label><input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Venue contract — signed" /></div>
        <div><label className="label">Category</label><select className="input" value={cat} onChange={e => setCat(e.target.value)}>{CATEGORIES.map(x => <option key={x}>{x}</option>)}</select></div>
        <div className="sm:col-span-2"><label className="label">Google Drive file link</label><input className="input" value={link} onChange={e => setLink(e.target.value)} placeholder="https://drive.google.com/file/d/…" /></div>
        <div><label className="label">Related function (optional)</label><select className="input" value={fn} onChange={e => setFn(e.target.value)}><option value="">—</option>{WEDDING_FUNCTIONS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
        <div><label className="label">Vendor (optional)</label><input className="input" value={vendor} onChange={e => setVendor(e.target.value)} /></div>
      </div>
      {err && <p className="font-sans text-sm text-red-800 mt-2">{err}</p>}
      <button className="btn-primary mt-3 font-sans" onClick={add}>Add document</button></div>}
    <div className="font-sans text-sm flex flex-wrap gap-2 mb-4 items-center">
      <input className="input !w-52" placeholder="Search documents" value={q} onChange={e => setQ(e.target.value)} />
      {['all', ...CATEGORIES].map(c => <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-lg border ${filter===c?'bg-[#6E1423] text-white':'bg-white'}`}>{c === 'all' ? 'All' : c}</button>)}
    </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {shown.map(d => <div key={d.id} className="card overflow-hidden">
        {d.fileId && <button className="block w-full" onClick={() => setOpenId(openId === d.id ? null : d.id)}><img src={driveThumbnail(d.fileId)} alt={d.title} className="w-full h-36 object-cover bg-[#F5EEDD]" loading="lazy" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} /></button>}
        <div className="p-4"><p className="font-bold text-[#6E1423]">{d.title}</p>
          <p className="font-sans text-xs opacity-70">{d.category}{d.functionId ? ' · ' + fname(d.functionId) : ''}{d.vendorName ? ' · ' + d.vendorName : ''}</p>
          <div className="font-sans text-sm mt-2 flex gap-3"><a className="underline" href={d.driveLink} target="_blank" rel="noreferrer">Open in Drive</a><button className="underline" onClick={() => setOpenId(openId === d.id ? null : d.id)}>{openId === d.id ? 'Hide preview' : 'Preview here'}</button>{user?.role === 'ADMIN' && <button className="underline text-red-800" onClick={() => deleteIn('documents', d.id)}>Delete</button>}</div>
        </div>
        {openId === d.id && d.fileId && <iframe title={d.title} src={drivePreview(d.fileId)} className="w-full h-96 border-t border-[#EADFC6]" allow="autoplay" />}
      </div>)}
      {!shown.length && <p className="font-sans text-sm opacity-70">No documents yet — add the first Drive link above.</p>}
    </div></div>
}
