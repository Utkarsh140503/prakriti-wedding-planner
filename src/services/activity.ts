import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'
// Fire-and-forget activity logging (spec §21). Never blocks or breaks the main action.
export function logActivity(action: string, entityType: string, details: string) {
  try {
    const u = auth.currentUser
    if (!u) return
    addDoc(collection(db, 'activityLogs'), { action, entityType, details, userId: u.uid, userEmail: u.email || '', createdAt: serverTimestamp() }).catch(() => {})
  } catch { /* logging must never break the app */ }
}
