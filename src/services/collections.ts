import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
export function subscribeCollection<T>(name: string, cb: (rows: (T & { id: string })[]) => void) {
  return onSnapshot(collection(db, name), (snap) => cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as T) }))), () => cb([]))
}
export async function createIn(name: string, data: Record<string, unknown>, uid: string) {
  return addDoc(collection(db, name), { ...data, createdBy: uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
}
export async function updateIn(name: string, id: string, data: Record<string, unknown>) {
  return updateDoc(doc(db, name, id), { ...data, updatedAt: serverTimestamp() })
}
export async function deleteIn(name: string, id: string) { return deleteDoc(doc(db, name, id)) }
