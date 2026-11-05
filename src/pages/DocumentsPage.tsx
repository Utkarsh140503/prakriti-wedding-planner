import Placeholder from './Placeholder'
export default function DocumentsPage() {
  return <Placeholder title="Documents" phase="Phase 5">
    <p className="font-semibold">Storage model adopted: Google Drive links (decided 5 Nov 2026).</p>
    <p className="text-sm opacity-80 mt-2">Files will live in the admin's Google Drive folder <i>PraKriti Wedding Planner/</i>; this page will store each file's Drive link + metadata in Firestore and render images and PDFs directly from Drive (thumbnail / preview embeds). Upload flow: upload in Drive, paste the share link here. Share the Drive folder only with specific approved family emails — never "anyone with the link" for receipts or contracts.</p>
  </Placeholder>
}
