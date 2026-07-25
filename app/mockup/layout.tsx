import type { Metadata } from "next";

// Mockup routes exist to be embedded in an article's phone frame via a
// same-origin iframe (see `article .device` in globals.css). They render the
// real components with fixed dummy data, so a post always shows the current
// UI rather than a screenshot that silently goes stale.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// iOS reserves ~54pt at the top of the screen. Without it the site header
// sits flush against the bezel and the Dynamic Island floats over the logo,
// which is the main thing that stops the frame reading as a real screenshot.
// Scoped to this layout's own document, so it only affects mockup routes.
const STATUS_BAR_CSS = `
  body { padding-top: 54px; }
`;

export default function MockupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STATUS_BAR_CSS }} />
      {children}
    </>
  );
}
