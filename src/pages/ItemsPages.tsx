import { useEffect, useState } from 'react'
import { subscribeCollection, createIn, updateIn, deleteIn } from '../services/collections'
import { SHOP_CATEGORIES, SHOP_PEOPLE, SHOP_STATUSES, RITUAL_CATEGORIES, RITUAL_STATUSES, SHOPPING_TEMPLATES, RITUAL_TEMPLATES } from '../data/templates-items'
import { WEDDING_FUNCTIONS } from '../data/functions'
import { useAuth } from '../contexts/AuthContext'
import type { ShopItem, RitualItem } from '../types'
const inr = (n?: number) => n == null ? '—' : '₹' + n.toLocaleString('en-IN')
const fname = (id: string) => WEDDING_FUNCTIONS.find(f => f.id === id)?.name || id

export function ShoppingPage() {
  const { user } = useAuth(); const [rows, setRows] = useState<(ShopItem & { id: string })[]>([])
  const [name, setName] = useState(''); const [person, setPerson] = useState('Groom'); const [fn, setFn] = useState('main-wedding'); const [filter, setFilter] = useState('all'); const [msg, setMsg] = useState('')
  useEffect(() => subscribeCollection<ShopItem>('shoppingItems', setRows), [])
  const canWrite = user && user.role !== 'VIEWER'; const shown = filter === 'all' ? rows : rows.filter(r => r.status === filter)
  const pending = rows.filter(r => !['Purchased','Delivered','Cancelled'].includes(r.status)).length
  return <div><h2 className="text-2xl font-bold text-[#6E1423] mb-1">Shopping</h2>
    <p className="font-sans text-sm opacity-70 mb-4">{rows.length} items · {pending} still to buy. Template items are marked TEMPLATE — edit or delete them freely; the family decides what actually applies.</p>
    {canWrite && <div className="card p-4 mb-4 font-sans flex flex-wrap gap-2 items-end">
      <div className="grow min-w-[180px]"><label className="label">Item name</label><input className="input" value={name} onChange={e => setName(e.target.value)} /></div>
      <div><label className="label">For</label><select className="input" value={person} onChange={e => setPerson(e.target.value)}>{SHOP_PEOPLE.map(x => <option key={x}>{x}</option>)}</select></div>
      <div><label className="label">Function</label><select className="input" value={fn} onChange={e => setFn(e.target.value)}>{WEDDING_FUNCTIONS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
      <button className="btn-gold" onClick={async () => { if (!name.trim()) return; await createIn('shoppingItems', { itemName: name, category: 'Other', personFor: person, functionId: fn, status: 'To Buy', priority: 'Medium' }, user!.uid); setName('') }}>Add item</button>
      {!rows.length && <button className="btn-primary" onClick={async () => { for (const t of SHOPPING_TEMPLATES) await createIn('shoppingItems', { ...t, status: 'To Buy', priority: 'Medium', isTemplate: true }, user!.uid); setMsg('Shopping template added ✓') }}>Add shopping template (13 items)</button>}
      {msg && <span className="text-sm text-green-700">{msg}</span>}
    </div>}
    <div className="font-sans text-sm flex flex-wrap gap-2 mb-4">{['all', ...SHOP_STATUSES].map(s => <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg border ${filter===s?'bg-[#6E1423] text-white':'bg-white'}`}>{s === 'all' ? 'All' : s}</button>)}</div>
    <div className="card overflow-x-auto"><table className="w-full text-left font-sans text-sm min-w-[680px]"><thead><tr className="border-b border-[#EADFC6]"><th className="p-3">Item</th><th className="p-3">For</th><th className="p-3">Function</th><th className="p-3">Est. / Actual</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
    <tbody>{shown.map(r => <tr key={r.id} className="border-b border-[#F5EEDD]"><td className="p-3 font-semibold">{r.itemName}{r.isTemplate && <span className="ml-2 text-[10px] bg-[#F5EEDD] px-1.5 py-0.5 rounded">TEMPLATE</span>}</td><td className="p-3">{r.personFor}</td><td className="p-3">{fname(r.functionId)}</td><td className="p-3">{inr(r.estimatedPrice)} / {inr(r.actualPrice)}</td>
      <td className="p-3">{canWrite ? <select className="input !w-auto" value={r.status} onChange={e => updateIn('shoppingItems', r.id, { status: e.target.value })}>{SHOP_STATUSES.map(x => <option key={x}>{x}</option>)}</select> : r.status}</td>
      <td className="p-3">{user?.role === 'ADMIN' && <button className="underline text-red-800" onClick={() => deleteIn('shoppingItems', r.id)}>Delete</button>}</td></tr>)}
    {!shown.length && <tr><td className="p-3" colSpan={6}>No items here yet.</td></tr>}</tbody></table></div>
    <p className="font-sans text-xs opacity-60 mt-3">Categories for reference: {SHOP_CATEGORIES.join(', ')}. Use the checklist task panel for detailed costing per item if needed; prices here feed the family shopping overview.</p></div>
}

export function SamagriPage() {
  const { user } = useAuth(); const [rows, setRows] = useState<(RitualItem & { id: string })[]>([])
  const [name, setName] = useState(''); const [hindi, setHindi] = useState(''); const [fn, setFn] = useState('main-wedding'); const [msg, setMsg] = useState('')
  useEffect(() => subscribeCollection<RitualItem>('ritualItems', setRows), [])
  const canWrite = user && user.role !== 'VIEWER'
  const groups = new Map<string, (RitualItem & { id: string })[]>(); rows.forEach(r => groups.set(r.functionId, [...(groups.get(r.functionId) || []), r]))
  const remaining = rows.filter(r => !['Ready','Used'].includes(r.status)).length
  return <div><h2 className="text-2xl font-bold text-[#6E1423] mb-1">Ritual Samagri</h2>
    <p className="font-sans text-sm opacity-70 mb-4">{rows.length} items · {remaining} still to arrange. Sil Main Poojan samagri is deliberately NOT in the template — its list must come from the family and pandit ji first.</p>
    {canWrite && <div className="card p-4 mb-4 font-sans flex flex-wrap gap-2 items-end">
      <div className="grow min-w-[160px]"><label className="label">Item name</label><input className="input" value={name} onChange={e => setName(e.target.value)} /></div>
      <div><label className="label">Hindi name</label><input className="input" value={hindi} onChange={e => setHindi(e.target.value)} /></div>
      <div><label className="label">Function</label><select className="input" value={fn} onChange={e => setFn(e.target.value)}>{WEDDING_FUNCTIONS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
      <button className="btn-gold" onClick={async () => { if (!name.trim()) return; await createIn('ritualItems', { itemName: name, hindiName: hindi, functionId: fn, category: 'Pooja Samagri', status: 'To Arrange', priority: 'Medium' }, user!.uid); setName(''); setHindi('') }}>Add item</button>
      {!rows.length && <button className="btn-primary" onClick={async () => { for (const t of RITUAL_TEMPLATES) await createIn('ritualItems', { ...t, status: 'To Arrange', priority: 'Medium', isTemplate: true }, user!.uid); setMsg('Samagri template added ✓ — please have pandit ji review it') }}>Add samagri template (29 items)</button>}
      {msg && <span className="text-sm text-green-700">{msg}</span>}
    </div>}
    {[...groups.entries()].map(([fid, items]) => <div key={fid} className="card p-4 mb-4"><h3 className="font-bold text-[#6E1423] mb-2">{fname(fid)} <span className="font-sans text-xs font-normal">({items.filter(i => ['Ready','Used'].includes(i.status)).length}/{items.length} ready)</span></h3>
      {items.map(r => <div key={r.id} className="font-sans text-sm border-b border-[#F5EEDD] py-2 flex flex-wrap justify-between gap-2 items-center"><span><b>{r.itemName}</b>{r.hindiName ? ' · ' + r.hindiName : ''}{r.isTemplate && <span className="ml-2 text-[10px] bg-[#F5EEDD] px-1.5 py-0.5 rounded">TEMPLATE</span>}{r.quantity ? ' · ' + r.quantity + ' ' + (r.unit || '') : ''}</span>
      <span className="flex gap-2 items-center">{canWrite ? <select className="input !w-auto" value={r.status} onChange={e => updateIn('ritualItems', r.id, { status: e.target.value })}>{RITUAL_STATUSES.map(x => <option key={x}>{x}</option>)}</select> : r.status}{user?.role === 'ADMIN' && <button className="underline text-red-800" onClick={() => deleteIn('ritualItems', r.id)}>Delete</button>}</span></div>)}
    </div>)}
    {!rows.length && <p className="font-sans text-sm opacity-70">No samagri items yet — add the template or add items one by one.</p>}
    <p className="font-sans text-xs opacity-60">Categories: {RITUAL_CATEGORIES.join(', ')}</p></div>
}
