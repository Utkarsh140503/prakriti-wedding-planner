import { collection, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'
import type { AppUser } from '../types'
export function subscribeUsers(cb: (u: AppUser[]) => void) {
  return onSnapshot(collection(db, 'users'), (snap) => cb(snap.docs.map(d => d.data() as AppUser)), () => cb([]))
}
