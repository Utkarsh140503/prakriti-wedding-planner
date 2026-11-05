// Google Drive–link documents (adopted 5 Nov 2026 instead of Firebase Storage / Blaze).
// Files live in the admin's Google Drive; Firestore stores only metadata + link.
export function extractDriveFileId(link: string): string | null {
  const m = link.match(/\/file\/d\/([^/]+)/) || link.match(/[?&]id=([^&]+)/) || link.match(/\/d\/([^/]+)/)
  return m ? m[1] : null
}
export function driveThumbnail(fileId: string) { return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200` }
export function drivePreview(fileId: string) { return `https://drive.google.com/file/d/${fileId}/preview` }
export function driveView(fileId: string) { return `https://drive.google.com/file/d/${fileId}/view` }
