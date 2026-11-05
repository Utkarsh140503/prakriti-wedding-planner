import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from './firebase'
import { logActivity } from './activity'
import type { WeddingTask } from '../types'
export const tasksRef = collection(db, 'tasks')
export function subscribeTasks(cb: (t: WeddingTask[]) => void) {
  const q = query(tasksRef, orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as WeddingTask) }))), () => cb([]))
}
export async function createTask(t: Omit<WeddingTask,'id'>, uid: string) {
  const r = await addDoc(tasksRef, { ...t, createdBy: uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  logActivity('created', 'tasks', t.title); return r
}
export async function updateTask(id: string, patch: Partial<WeddingTask>) { logActivity('updated', 'tasks', patch.title || id)
  return updateDoc(doc(db, 'tasks', id), { ...patch, updatedAt: serverTimestamp() })
}
export async function removeTask(id: string) { logActivity('deleted', 'tasks', id); return deleteDoc(doc(db, 'tasks', id)) }
export async function seedTemplateTasks(tasks: Omit<WeddingTask,'id'>[], uid: string) {
  const batch = writeBatch(db)
  tasks.forEach(t => { const ref = doc(tasksRef); batch.set(ref, { ...t, createdBy: uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }) })
  const r = await batch.commit(); logActivity('imported template', 'tasks', tasks.length + ' tasks'); return r
}
export function subscribeExpenses(cb: (e: import('../types').Expense[]) => void) {
  return onSnapshot(collection(db, 'expenses'), (snap) => cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as import('../types').Expense) }))), () => cb([]))
}
