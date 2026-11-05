import { useEffect, useMemo, useState } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { subscribeCollection, createIn, updateIn, deleteIn } from '../services/collections'
import { subscribeWeddingSettings, saveOverallBudget } from '../services/settings'
import { EXPENSE_CATEGORIES } from '../data/templates-items'
import { WEDDING_FUNCTIONS } from '../data/functions'
import { useAuth } from '../contexts/AuthContext'
import type { Expense } from '../types'
const COLORS = ['#6E1423','#B8912F','#2E5E4E','#8A6D3B','#A26769','#5B7C99','#946846','#7A8B6F','#C08552','#4A4E69']
const inr = (n?: number) => '₹' + (n || 0).toLocaleString('en-IN')
const empty: Expense = { title: '', category: 'Other', functionId: 'main-wedding' }
export default function BudgetPage() {
  const { user } = useAuth(); const [rows, setRows] = useState<(Expense & { id: string })[]>([])
  const [settings, setSettings] = useState<Record<string, unknown>>({}); const [budgetInput, setBudgetInput] = useState('')
  const [form, setForm] = useState<Expense>(empty); const [editId, setEditId] = useState<string | null>(null)
  useEffect(() => subscribeCollection<Expense>('expenses', setRows), []); useEffect(() => subscribeWeddingSettings(setSettings), [])
  const canWrite = user && user.role !== 'VIEWER'
  const overall = Number(settings.overallBudget || 0)
  const t = useMemo(() => { const est = rows.reduce((s, r) => s + (r.estimatedCost || 0), 0); const act = rows.reduce((s, r) => s + (r.actualCost || 0), 0); const adv = rows.reduce((s, r) => s + (r.advancePaid || 0), 0); const due = rows.reduce((s, r) => s + Math.max(((r.actualCost ?? r.estimatedCost) || 0) - (r.advancePaid || 0), 0), 0); return { est, act, adv, due } }, [rows])
  const byCat = useMemo(() => { const m = new Map<string, number>(); rows.forEach(r => m.set(r.category, (m.get(r.category) || 0) + ((r.actualCost ?? r.estimatedCost) || 0))); return [...m.entries()].map(([name, value]) => ({ name, value })).filter(x => x.value > 0) }, [rows])
  const byFn = useMemo(() => WEDDING_FUNCTIONS.map(f => { const fr = rows.filter(r => r.functionId === f.id); return { name: f.name.split(' ')[0], Estimated: fr.reduce((s, r) => s + (r.estimatedCost || 0), 0), Actual: fr.reduce((s, r) => s + (r.actualCost || 0), 0) } }).filter(x => x.Estimated || x.Actual), [rows])
  const byPayer = useMemo(() => { const m = new Map<string, number>(); rows.forEach(r => { if (r.paidBy) m.set(r.paidBy, (m.get(r.paidBy) || 0) + (r.advancePaid || 0)) }); return [...m.entries()] }, [rows])
  const num = (v: string) => v === '' ? undefined : Number(v)
  const save = async () => { if (!form.title.trim()) return; if (editId) await updateIn('expenses', editId, { ...form }); else await createIn('expenses', { ...form }, user!.uid); setForm(empty); setEditId(null) }
  return <div><h2 className="text-2xl font-bold text-[#6E1423] mb-1">Budget & Expenses</h2>
    <p className="font-sans text-sm opacity-70 mb-4">Every rupee, planned and actual. Balances are calculated automatically: payable (actual, or estimated if actual is not yet known) minus advance paid.</p>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {[['Overall budget', overall ? inr(overall) : 'Not set'],['Estimated total', inr(t.est)],['Paid so far (advances)', inr(t.adv)],['Balance due', inr(t.due)]].map(([k, v]) => <div key={k} className="card p-4"><p className="font-sans text-xs uppercase tracking-wide opacity-70">{k}</p><p className="text-xl font-bold text-[#6E1423] mt-1">{v}</p></div>)}
    </div>
    {overall > 0 && <div className="card p-4 mb-4"><p className="font-sans text-sm mb-1">Estimated spend vs overall budget: <b>{Math.round(t.est / overall * 100)}%</b> {t.est > overall && <span className="text-red-800 font-bold">— over budget by {inr(t.est - overall)}</span>}</p><div className="h-3 bg-[#F5EEDD] rounded"><div className={`h-3 rounded ${t.est > overall ? 'bg-red-800' : 'bg-[#B8912F]'}`} style={{ width: Math.min(t.est / overall * 100, 100) + '%' }} /></div></div>}
    {user?.role === 'ADMIN' && <div className="card p-4 mb-4 font-sans flex flex-wrap items-end gap-3"><div><label className="label">Set overall budget (₹) — Admin</label><input className="input" type="number" value={budgetInput} placeholder={overall ? String(overall) : 'e.g. 1500000'} onChange={e => setBudgetInput(e.target.value)} /></div><button className="btn-primary" onClick={async () => { if (budgetInput) { await saveOverallBudget(Number(budgetInput)); setBudgetInput('') } }}>Save budget</button></div>}
    {(byCat.length > 0 || byFn.length > 0) && <div className="grid lg:grid-cols-2 gap-4 mb-5">
      <div className="card p-4"><h3 className="font-bold text-[#6E1423] mb-2">Spend by category</h3><ResponsiveContainer width="100%" height={260}><PieChart><Pie data={byCat} dataKey="value" nameKey="name" outerRadius={90} label>{byCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(v) => inr(Number(v))} /></PieChart></ResponsiveContainer></div>
      <div className="card p-4"><h3 className="font-bold text-[#6E1423] mb-2">Estimated vs actual, by function</h3><ResponsiveContainer width="100%" height={260}><BarChart data={byFn}><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} /><Tooltip formatter={(v) => inr(Number(v))} /><Legend /><Bar dataKey="Estimated" fill="#B8912F" /><Bar dataKey="Actual" fill="#6E1423" /></BarChart></ResponsiveContainer></div>
    </div>}
    {byPayer.length > 0 && <div className="card p-4 mb-5"><h3 className="font-bold text-[#6E1423] mb-2">Family contributions (advances paid, by payer)</h3>{byPayer.map(([name, v]) => <p key={name} className="font-sans text-sm border-b border-[#F5EEDD] py-1.5 flex justify-between"><span>{name}</span><b>{inr(v)}</b></p>)}</div>}
    {canWrite && <div className="card p-4 mb-5"><h3 className="font-bold text-[#6E1423] mb-3">{editId ? 'Edit expense' : 'Add expense'}</h3>
      <div className="grid sm:grid-cols-3 gap-3 font-sans">
        <div><label className="label">Title</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div><label className="label">Category</label><select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{EXPENSE_CATEGORIES.map(x => <option key={x}>{x}</option>)}</select></div>
        <div><label className="label">Function</label><select className="input" value={form.functionId} onChange={e => setForm({ ...form, functionId: e.target.value })}>{WEDDING_FUNCTIONS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
        <div><label className="label">Vendor (name)</label><input className="input" value={form.vendorName || ''} onChange={e => setForm({ ...form, vendorName: e.target.value })} /></div>
        <div><label className="label">Estimated (₹)</label><input className="input" type="number" value={form.estimatedCost ?? ''} onChange={e => setForm({ ...form, estimatedCost: num(e.target.value) })} /></div>
        <div><label className="label">Actual (₹)</label><input className="input" type="number" value={form.actualCost ?? ''} onChange={e => setForm({ ...form, actualCost: num(e.target.value) })} /></div>
        <div><label className="label">Advance paid (₹)</label><input className="input" type="number" value={form.advancePaid ?? ''} onChange={e => setForm({ ...form, advancePaid: num(e.target.value) })} /></div>
        <div><label className="label">Paid by</label><input className="input" value={form.paidBy || ''} onChange={e => setForm({ ...form, paidBy: e.target.value })} /></div>
        <div><label className="label">Payment method</label><select className="input" value={form.paymentMethod || ''} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}><option value="">—</option>{['Cash','UPI','Bank Transfer','Cheque','Card','Other'].map(x => <option key={x}>{x}</option>)}</select></div>
        <div><label className="label">Payment date</label><input className="input" type="date" value={form.paymentDate || ''} onChange={e => setForm({ ...form, paymentDate: e.target.value })} /></div>
        <div><label className="label">Receipt (Google Drive link)</label><input className="input" placeholder="Paste Drive link" value={form.receiptUrl || ''} onChange={e => setForm({ ...form, receiptUrl: e.target.value })} /></div>
        <div><label className="label">Notes</label><input className="input" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
      </div>
      <div className="mt-3 flex gap-2"><button className="btn-primary" onClick={save}>{editId ? 'Save changes' : 'Add expense'}</button>{editId && <button className="btn-gold" onClick={() => { setForm(empty); setEditId(null) }}>Cancel</button>}</div></div>}
    <div className="card overflow-x-auto"><table className="w-full text-left font-sans text-sm min-w-[760px]"><thead><tr className="border-b border-[#EADFC6]"><th className="p-3">Expense</th><th className="p-3">Category</th><th className="p-3">Est.</th><th className="p-3">Actual</th><th className="p-3">Advance</th><th className="p-3">Balance</th><th className="p-3"></th></tr></thead>
      <tbody>{rows.map(r => { const bal = Math.max(((r.actualCost ?? r.estimatedCost) || 0) - (r.advancePaid || 0), 0); return <tr key={r.id} className="border-b border-[#F5EEDD]"><td className="p-3 font-semibold">{r.title}{r.receiptUrl && <> · <a className="underline" href={r.receiptUrl} target="_blank" rel="noreferrer">receipt</a></>}</td><td className="p-3">{r.category}</td><td className="p-3">{inr(r.estimatedCost)}</td><td className="p-3">{r.actualCost != null ? inr(r.actualCost) : '—'}</td><td className="p-3">{inr(r.advancePaid)}</td><td className="p-3 font-semibold">{inr(bal)}</td><td className="p-3 whitespace-nowrap">{canWrite && <button className="underline mr-2" onClick={() => { setForm(r); setEditId(r.id) }}>Edit</button>}{user!.role === 'ADMIN' && <button className="underline text-red-800" onClick={() => deleteIn('expenses', r.id)}>Delete</button>}</td></tr> })}
      {!rows.length && <tr><td className="p-3" colSpan={7}>No expenses recorded yet.</td></tr>}</tbody></table></div>
  </div>
}
