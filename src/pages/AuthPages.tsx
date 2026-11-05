import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="min-h-screen flex items-center justify-center p-4"><div className="card w-full max-w-md p-6">
    <h1 className="text-2xl font-bold text-[#6E1423] text-center">PraKriti Wedding Planner</h1>
    <p className="text-center text-sm italic text-[#B8912F] mt-1">One Family. One Celebration. Every Detail Taken Care Of.</p>
    <h2 className="text-lg font-semibold mt-6 mb-3 font-sans">{title}</h2>{children}</div></div>
}
export function LoginPage() {
  const { login, resetPassword, user } = useAuth(); const nav = useNavigate()
  useEffect(() => { if (user) nav('/') }, [user, nav])
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [msg, setMsg] = useState('')
  return <Shell title="Family Login">
    <form className="space-y-3 font-sans" onSubmit={async (e) => { e.preventDefault(); setErr(''); try { await login(email, pw); nav('/') } catch (x: any) { setErr(x.message || 'Login failed') } }}>
      <div><label className="label">Email</label><input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
      <div><label className="label">Password</label><input className="input" type="password" required value={pw} onChange={e => setPw(e.target.value)} /></div>
      {err && <p className="text-sm text-red-700">{err}</p>}{msg && <p className="text-sm text-green-700">{msg}</p>}
      <button className="btn-primary w-full">Login</button>
    </form>
    <div className="flex justify-between mt-4 font-sans text-sm">
      <button className="text-[#6E1423] underline" onClick={async () => { if (!email) { setErr('Enter your email first, then tap Forgot password'); return } await resetPassword(email); setMsg('Password reset email sent — check your inbox.') }}>Forgot password?</button>
      <Link className="text-[#6E1423] underline" to="/register">Register (approved emails only)</Link>
    </div></Shell>
}
export function RegisterPage() {
  const { register, user } = useAuth(); const nav = useNavigate()
  useEffect(() => { if (user) nav('/') }, [user, nav])
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState('')
  return <Shell title="Register — administrator-approved emails only">
    <form className="space-y-3 font-sans" onSubmit={async (e) => { e.preventDefault(); setErr(''); try { await register(email, pw, name); nav('/') } catch (x: any) { setErr(x.message || 'Registration failed') } }}>
      <div><label className="label">Full name</label><input className="input" required value={name} onChange={e => setName(e.target.value)} /></div>
      <div><label className="label">Email (must be pre-approved by admin)</label><input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
      <div><label className="label">Password</label><input className="input" type="password" required minLength={6} value={pw} onChange={e => setPw(e.target.value)} /></div>
      {err && <p className="text-sm text-red-700">{err}</p>}
      <button className="btn-gold w-full">Create account</button>
    </form>
    <p className="mt-4 font-sans text-sm">Already registered? <Link className="text-[#6E1423] underline" to="/login">Login</Link></p></Shell>
}
