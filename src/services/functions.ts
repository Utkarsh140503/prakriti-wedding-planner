import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
export interface FunctionDetails { date?: string; startTime?: string; endTime?: string; venue?: string; notes?: string; description?: string }
export function subscribeFunctionDetails(id: string, cb: (d: FunctionDetails) => void) {
  return onSnapshot(doc(db, 'functions', id), (snap) => cb(snap.exists() ? (snap.data() as FunctionDetails) : {}), () => cb({}))
}
export async function saveFunctionDetails(id: string, d: FunctionDetails) {
  return setDoc(doc(db, 'functions', id), { ...d, updatedAt: serverTimestamp() }, { merge: true })
}
