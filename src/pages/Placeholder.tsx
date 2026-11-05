export default function Placeholder({ title, phase, children }: { title: string; phase: string; children?: React.ReactNode }) {
  return <div><h2 className="text-2xl font-bold text-[#6E1423] mb-4">{title}</h2>
    <div className="card p-6 font-sans">{children || <><p className="font-semibold">Coming in {phase}.</p>
    <p className="text-sm opacity-70 mt-2">This module is part of the approved PraKriti specification. Its data model and Firestore collection are already defined; the page is built in its phase so the core (Dashboard + Master Checklist) stays the priority. No sample or fabricated data is shown here.</p></>}</div></div>
}
