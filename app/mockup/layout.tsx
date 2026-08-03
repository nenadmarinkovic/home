import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

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
