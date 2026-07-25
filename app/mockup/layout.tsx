import type { Metadata } from "next";

// Mockup routes exist to be embedded in an article's phone frame via a
// same-origin iframe (see `article .device` in globals.css). They render the
// real components with fixed dummy data, so a post always shows the current
// UI rather than a screenshot that silently goes stale.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// An iframe reports no safe-area insets, so the frame stands them in: ~54pt at
// the top for the status bar, and ~34pt at the bottom, which `--safe-bottom`
// hands to anything pinned to the bottom of the screen. Without the first the
// header sits under the Dynamic Island; without the second the add box runs
// under the home indicator the frame draws — the two things that stop it
// reading as a real screenshot. Scrolling content still passes under the
// indicator, exactly as it does on the phone. Scoped to this layout's own
// document, so it only affects mockup routes.
const SAFE_AREA_CSS = `
  :root { --safe-bottom: 34px; }
  body { padding-top: 54px; }
`;

export default function MockupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SAFE_AREA_CSS }} />
      {children}
    </>
  );
}
