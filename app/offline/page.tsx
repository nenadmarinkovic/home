import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline",
  description: "You appear to be offline.",
  robots: { index: false, follow: false },
};

// This page is precached by the service worker at install time and served from
// cache while offline — so it never gets a fresh server render that bakes the
// current theme-color in from the cookie (see app/layout.tsx generateViewport).
// Its cached theme-color is therefore whatever the theme was when the worker
// installed, which goes stale the moment the user switches theme. iOS Safari
// animates theme-color changes, so when ThemeColorSync corrects it after
// hydration the iPhone notch visibly fades from the stale color to the right
// one — a flash of black on light theme / white on dark theme.
//
// Fix the notch synchronously before first paint: read the same resolved theme
// next-themes uses (localStorage "theme", falling back to the OS preference)
// and write a matching theme-color meta into the head. Because this lands the
// correct color before anything paints, ThemeColorSync's later update is a
// no-op (same color → no fade), so there's no flicker. Runs inline with no
// network dependency, so it works while offline.
const SET_NOTCH_COLOR = `(function(){try{
  var t=localStorage.getItem("theme");
  if(t!=="dark"&&t!=="light"){
    t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
  }
  var color=t==="dark"?"#0c1115":"#f5f4f0";
  document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){
    m.setAttribute("media","not all");
  });
  var meta=document.createElement("meta");
  meta.name="theme-color";
  meta.content=color;
  meta.setAttribute("data-tcs","1");
  document.head.insertBefore(meta,document.head.firstChild);
}catch(e){}})();`;

export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-start gap-6 py-20">
      <script dangerouslySetInnerHTML={{ __html: SET_NOTCH_COLOR }} />
      <hgroup className="max-w-prose self-center space-y-3 text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Offline
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-pretty">
          You&apos;re offline.
        </h1>
        <p className="font-serif text-2xl italic leading-snug text-zinc-600 dark:text-zinc-400">
          Some things still work — pages you&apos;ve already visited and your
          vocabulary review are here. Anything that needs a live connection will
          be waiting when you reconnect.
        </p>
      </hgroup>
    </main>
  );
}
