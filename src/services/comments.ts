import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
export interface TaskComment { id?: string; text: string; authorName: string; authorId: string; createdAt?: unknown }
export function subscribeComments(taskId: string, cb: (c: TaskComment[]) => void) {
  const q = query(collection(db, 'tasks', taskId, 'comments'), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap) => cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as TaskComment) }))), () => cb([]))
}
export async function addComment(taskId: string, text: string, author: { uid: string; displayName: string }) {
  return addDoc(collection(db, 'tasks', taskId, 'comments'), { text, authorName: author.displayName, authorId: author.uid, createdAt: serverTimestamp() })
}
