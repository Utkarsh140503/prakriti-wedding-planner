import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, deleteUser } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import type { AppUser } from '../types'
interface AuthCtx { user: AppUser | null; loading: boolean; login: (e:string,p:string)=>Promise<void>; register: (e:string,p:string,n:string)=>Promise<void>; logout: ()=>Promise<void>; resetPassword: (e:string)=>Promise<void> }
const Ctx = createContext<AuthCtx | null>(null)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => onAuthStateChanged(auth, async (fb) => {
    if (!fb) { setUser(null); setLoading(false); return }
    const snap = await getDoc(doc(db, 'users', fb.uid))
    if (snap.exists()) { const d = snap.data() as AppUser; if (d.status === 'active') setUser({ ...d, uid: fb.uid }); else { await signOut(auth); setUser(null) } }
    else setUser(null)
    setLoading(false)
  }), [])
  async function login(email: string, password: string) { await signInWithEmailAndPassword(auth, email.trim(), password) }
  async function register(email: string, password: string, displayName: string) {
    const e = email.trim().toLowerCase()
    const cred = await createUserWithEmailAndPassword(auth, e, password)
    try {
      const inv = await getDoc(doc(db, 'invitations', e))
      if (!inv.exists() || inv.data().status !== 'approved') throw new Error('This email is not pre-approved by the administrator. Please ask the admin to add your email first.')
      const role = inv.data().role || 'FAMILY'
      await setDoc(doc(db, 'users', cred.user.uid), { uid: cred.user.uid, email: e, displayName, role, status: 'active', createdAt: serverTimestamp() })
    } catch (err) { await deleteUser(cred.user).catch(() => signOut(auth)); throw err }
  }
  async function logout() { await signOut(auth) }
  async function resetPassword(email: string) { await sendPasswordResetEmail(auth, email.trim()) }
  return <Ctx.Provider value={{ user, loading, login, register, logout, resetPassword }}>{children}</Ctx.Provider>
}
export function useAuth() { const c = useContext(Ctx); if (!c) throw new Error('useAuth outside provider'); return c }
