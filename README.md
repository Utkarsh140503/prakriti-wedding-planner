# PraKriti Wedding Planner

**One Family. One Celebration. Every Detail Taken Care Of.**

Family wedding management portal for the wedding on **2 December 2026** (traditional North Indian Hindu wedding, groom's family). React + TypeScript + Vite + Tailwind, Firebase Authentication + Firestore, hosted on GitHub Pages via GitHub Actions. Hash routing is used so GitHub Pages refreshes never 404.

Live URL (after first deployment): https://utkarsh140503.github.io/prakriti-wedding-planner/

## File storage — Google Drive links (no Firebase Storage)
Firebase Storage now requires the Blaze billing plan, so this project stores **files in the admin's Google Drive** and stores only the Drive link + metadata in the Firestore `documents` collection. The app renders images (Drive thumbnail) and PDFs/docs/video (Drive preview) directly from Drive. Share the Drive folder only with specific approved family emails — never "anyone with the link" for receipts/contracts.

## Local development
1. `npm install`
2. Copy `.env.example` to `.env` and fill in the Firebase web config (Project settings → Your apps → Web app).
3. `npm run dev`
4. Production build: `npm run build`

## One-time Firebase bootstrap (project owner only)
Authentication and Firestore must be enabled in the Firebase Console first (Email/Password sign-in ON; Firestore in Production mode, location asia-south1).

**Publish the security rules:** paste `firestore.rules` into Firebase Console → Firestore Database → Rules → Publish. (Or with Firebase CLI: `firebase deploy --only firestore:rules,firestore:indexes`.)

**Create the FIRST admin (bootstrap):**
1. Firestore Database → Start collection → Collection ID: `invitations`
2. Document ID: the admin's email address, in lowercase (exactly the email they will register with)
3. Fields: `email` (string, same email), `role` (string, `ADMIN`), `status` (string, `approved`), `name` (string, admin's name)
4. Open the app → Register with that exact email → the app reads the approved invitation, creates the admin profile, and logs in.
5. After that, the admin adds every other family member the same way in `invitations` (roles: `ADMIN`, `FAMILY`, or `VIEWER`) *before* they register. Anyone registering without an approved invitation is rejected and their auth account is deleted by the app.

## GitHub Pages deployment
1. Repo Settings → Secrets and variables → Actions: add the six `VITE_FIREBASE_*` secrets (same values as `.env`).
2. Repo Settings → Pages → Source: **GitHub Actions**.
3. Push to `main` (or run the "Deploy to GitHub Pages" workflow manually). Deployment never touches Firestore data.

## Status / phases
- Phase 1 (this commit): setup, Firebase, auth + approved registration, roles + rules, layout, Dashboard (real Firestore data only).
- Phase 2: Master Checklist (table + Kanban + My Responsibilities, template import) — core included; comments/attachments next.
- Phases 3–6: Family/Budget/Vendors/Shopping/Samagri, Guests/Schedule, Documents (Drive links)/Activity/Reports, testing + hardening.
- All unknown wedding details (venue, function dates/times, budget, guest count, family assignments) are shown as **Pending Confirmation** — nothing is fabricated.
