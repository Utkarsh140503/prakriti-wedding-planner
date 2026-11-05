import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
export function subscribeWeddingSettings(cb: (s: Record<string, unknown>) => void) {
  return onSnapshot(doc(db, 'weddingSettings', 'main'), (snap) => cb(snap.exists() ? snap.data() : {}), () => cb({}))
}
export async function saveOverallBudget(amount: number) {
  return setDoc(doc(db, 'weddingSettings', 'main'), { overallBudget: amount, updatedAt: serverTimestamp() }, { merge: true })
}
