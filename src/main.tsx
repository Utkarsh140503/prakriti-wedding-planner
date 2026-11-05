import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { firebaseInitError } from './services/firebase'

const rootEl = document.getElementById('root')!
if (firebaseInitError) {
  rootEl.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem;background:#FBF7EF;font-family:system-ui,sans-serif"><div style="background:#fff;border:1px solid #EADFC6;border-radius:1rem;padding:1.5rem;max-width:32rem"><h1 style="color:#6E1423;margin:0 0 .5rem">PraKriti Wedding Planner — setup incomplete</h1><p style="margin:0">' + firebaseInitError + '</p></div></div>'
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
