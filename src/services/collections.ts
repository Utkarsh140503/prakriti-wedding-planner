import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import { logActivity } from './activity'
export function subscribeCollection<T>(name: string, cb: (rows: (T & { id: string })[]) => void) {
  return onSnapshot(collection(db, name), (snap) => cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as T) }))), () => cb([]))
}
const labelOf = (data: Record<string, unknown>) => String(data.title || data.itemName || data.businessName || data.fullName || data.eventName || data.name || '')
export async function createIn(name: string, data: Record<string, unknown>, uid: string) {
  const ref = await addDoc(collection(db, name), { ...data, createdBy: uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  logActivity('created', name, labelOf(data)); return ref
}
export async function updateIn(name: string, id: string, data: Record<string, unknown>) {
  const r = await updateDoc(doc(db, name, id), { ...data, updatedAt: serverTimestamp() })
  logActivity('updated', name, labelOf(data)); return r
}
export async function deleteIn(name: string, id: string) { const r = await deleteDoc(doc(db, name, id)); logActivity('deleted', name, id); return r }
