import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// If the GitHub Actions VITE_FIREBASE_* secrets are missing, the build still
// succeeds but Firebase cannot start. Export that as a readable error instead
// of crashing silently to a blank page (fixed 5 Nov 2026).
export const firebaseInitError: string | null =
  !firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || !firebaseConfig.appId
    ? 'Firebase configuration is missing in this build. Add the six VITE_FIREBASE_* repository secrets in GitHub (Settings \u2192 Secrets and variables \u2192 Actions) and re-run the deployment workflow.'
    : null

let app: FirebaseApp | undefined
let authInstance: Auth | undefined
let dbInstance: Firestore | undefined
if (!firebaseInitError) {
  try {
    app = initializeApp(firebaseConfig)
    authInstance = getAuth(app)
    dbInstance = getFirestore(app)
  } catch (e) {
    // surfaced to the UI by main.tsx via firebaseInitError-like handling
    console.error('Firebase failed to initialise', e)
  }
}
export { app }
export const auth = authInstance as Auth
export const db = dbInstance as Firestore
