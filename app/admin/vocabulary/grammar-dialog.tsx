"use client";

import {
  cloneElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CaretLeftIcon,
  CaretRightIcon,
  InfoIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { AiChat } from "./ai-chat";
import { GRAMMAR_SECTIONS, type GrammarSection } from "./grammar-sections";

const FADE = "2rem";
const EDGE_MASK: Record<string, string | undefined> = {
  none: undefined,
  s: `linear-gradient(to right, transparent 0, #000 ${FADE}, #000 100%)`,
  e: `linear-gradient(to right, #000 0, #000 calc(100% - ${FADE}), transparent 100%)`,
  se: `linear-gradient(to right, transparent 0, #000 ${FADE}, #000 calc(100% - ${FADE}), transparent 100%)`,
};
import { searchGrammar, type Hit } from "./grammar-search";

export function GrammarDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [activeId, setActiveId] = useState(GRAMMAR_SECTIONS[0].id);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [fade, setFade] = useState({ start: false, end: false });
  const drag = useRef<{ x: number; left: number } | null>(null);
  const dragged = useRef(false);

  const activeIndex = Math.max(
    0,
    GRAMMAR_SECTIONS.findIndex((s) => s.id === activeId),
  );
  const active = GRAMMAR_SECTIONS[activeIndex];

  const results = useMemo(
    () => (open && searching ? searchGrammar(query) : []),
    [open, searching, query],
  );
  const resultTotal = results.reduce((sum, r) => sum + r.total, 0);
  const maskKey = `${fade.start ? "s" : ""}${fade.end ? "e" : ""}` || "none";

  useEffect(() => {
    if (!open || searching) return;
    navRef.current
      ?.querySelector('[aria-current="true"]')
      ?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [open, searching, activeId]);

  const updateFade = useCallback(() => {
    const el = navRef.current;
    if (!el) return setFade({ start: false, end: false });
    const max = el.scrollWidth - el.clientWidth;
    setFade({
      start: max > 4 && el.scrollLeft > 4,
      end: max > 4 && el.scrollLeft < max - 4,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updateFade();
    window.addEventListener("resize", updateFade);
    return () => window.removeEventListener("resize", updateFade);
  }, [open, searching, activeId, updateFade]);

  function onPointerDown(e: React.PointerEvent<HTMLElement>) {
    const el = navRef.current;
    if (!el || e.pointerType !== "mouse") return;
    if (el.scrollWidth <= el.clientWidth) return;
    drag.current = { x: e.clientX, left: el.scrollLeft };
    dragged.current = false;
    el.style.scrollBehavior = "auto";
  }

  function onPointerMove(e: React.PointerEvent<HTMLElement>) {
    const el = navRef.current;
    const from = drag.current;
    if (!el || !from) return;
    const dx = e.clientX - from.x;
    if (Math.abs(dx) > 4 && !dragged.current) {
      dragged.current = true;
      el.setPointerCapture(e.pointerId);
    }
    if (!dragged.current) return;
    el.scrollLeft = from.left - dx;
    updateFade();
  }

  function endDrag(e: React.PointerEvent<HTMLElement>) {
    const el = navRef.current;
    if (!el || !drag.current) return;
    drag.current = null;
    el.style.scrollBehavior = "";
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  }

  function onNavClickCapture(e: React.MouseEvent) {
    if (!dragged.current) return;
    dragged.current = false;
    e.preventDefault();
    e.stopPropagation();
  }

  function toTop() {
    scrollRef.current?.scrollTo({ top: 0 });
  }

  function select(id: string) {
    setActiveId(id);
    setSearching(false);
    toTop();
  }

  function onQueryChange(value: string) {
    setQuery(value);
    setSearching(value.trim().length >= 2);
    toTop();
  }

  function clearQuery() {
    setQuery("");
    setSearching(false);
    toTop();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[calc(100dvh-var(--inset-top)-var(--inset-bottom)-2rem)] sm:w-[min(96vw,84rem)]">
        <DialogHeader className="[@media(max-height:560px)]:py-2.5">
          <DialogTitle>Nemačka gramatika od A1 do B2</DialogTitle>
          <DialogDescription className="[@media(max-height:560px)]:hidden">
            Sve što treba znati da bi nemačka rečenica bila tačna, objašnjeno na
            srpskom, sa tabelama i primerima.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="flex shrink-0 flex-col gap-2.5 border-b border-foreground/10 px-4 py-2.5 [@media(max-height:560px)]:gap-1.5 [@media(max-height:560px)]:py-1.5 sm:px-6 sm:py-3 lg:w-64 lg:gap-3 lg:border-b-0 lg:border-r lg:px-3 lg:py-4">
            <div className="relative shrink-0">
              <MagnifyingGlassIcon
                weight="regular"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
              />
              <Input
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Traži po celoj gramatici…"
                aria-label="Traži po celoj gramatici"
                className="h-9 pl-9 pr-9 text-sm"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearQuery}
                  aria-label="Obriši pretragu"
                  className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-zinc-500 transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  <XIcon weight="bold" className="size-3" />
                </button>
              )}
            </div>

            <nav
              ref={navRef}
              aria-label="Oblasti gramatike"
              onScroll={updateFade}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onClickCapture={onNavClickCapture}
              style={{
                maskImage: EDGE_MASK[maskKey],
                WebkitMaskImage: EDGE_MASK[maskKey],
              }}
              className="scrollbar-none min-h-0 scroll-smooth max-lg:-mx-1 max-lg:cursor-grab max-lg:overflow-x-auto max-lg:overscroll-x-contain max-lg:px-1 max-lg:select-none max-lg:active:cursor-grabbing lg:overflow-y-auto"
            >
              <ul className="flex list-none gap-1.5 pl-0 lg:flex-col lg:gap-0.5">
                {GRAMMAR_SECTIONS.map((section, i) => {
                  const isActive = !searching && section.id === active.id;
                  const hits = results.find((r) => r.id === section.id)?.total;
                  return (
                    <li key={section.id} className="pl-0">
                      <button
                        type="button"
                        onClick={() => select(section.id)}
                        aria-current={isActive ? "true" : undefined}
                        className={cn(
                          "flex w-full cursor-pointer items-baseline gap-2 rounded-lg px-2.5 py-1.5 text-left font-sans text-sm whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 lg:whitespace-normal",
                          isActive
                            ? "bg-foreground text-background"
                            : "text-zinc-600 hover:bg-foreground/5 hover:text-foreground dark:text-zinc-400",
                          searching && !hits && "opacity-40",
                        )}
                      >
                        <span
                          className={cn(
                            "hidden text-[11px] tabular-nums lg:inline",
                            isActive ? "text-background/50" : "text-zinc-400",
                          )}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="font-medium">{section.label}</span>
                          <span
                            className={cn(
                              "hidden text-[11px] leading-snug lg:block",
                              isActive
                                ? "text-background/60"
                                : "text-zinc-500 dark:text-zinc-500",
                            )}
                          >
                            {section.hint}
                          </span>
                        </span>
                        {searching && hits ? (
                          <span className="shrink-0 rounded-full bg-foreground/8 px-1.5 text-[10px] font-semibold tabular-nums text-zinc-600 dark:text-zinc-400">
                            {hits}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div
            ref={scrollRef}
            className="@container min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 [@media(max-height:560px)]:py-3 sm:px-6 sm:py-6"
          >
            {!open ? null : searching ? (
              <SearchResults
                query={query}
                total={resultTotal}
                results={results}
                onSelect={select}
                onClear={clearQuery}
              />
            ) : (
              cloneElement(
                active.render() as React.ReactElement<{
                  action?: React.ReactNode;
                }>,
                {
                  action: (
                    <GrammarSectionChat key={active.id} section={active} />
                  ),
                },
              )
            )}
          </div>
        </div>

        <DialogFooter className="flex-nowrap justify-between gap-2 [@media(max-height:560px)]:py-2">
          {searching ? (
            <>
              <span className="min-w-0 truncate font-sans text-xs text-zinc-500 dark:text-zinc-500">
                <span className="tabular-nums">{resultTotal}</span>{" "}
                {resultTotal === 1 ? "pogodak" : "pogodaka"} za „{query}“
              </span>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={clearQuery}
                className="shrink-0"
              >
                Nazad na gramatiku
              </Button>
            </>
          ) : (
            <SectionPager index={activeIndex} onSelect={select} />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GrammarSectionChat({ section }: { section: GrammarSection }) {
  return (
    <AiChat
      endpoint="/api/vocabulary/grammar-chat"
      payload={{ sectionId: section.id }}
      title={section.label}
      description={`Razgovaraj sa AI tutorom o ovoj oblasti: ${section.hint}.`}
      intro={`Pitaj me bilo šta o oblasti „${section.label}“. Objašnjavam pravila, dajem primere i ispravljam tvoje rečenice.`}
      triggerLabel="Chat"
      triggerAriaLabel={`Chat o oblasti: ${section.label}`}
      triggerClassName="shrink-0"
    />
  );
}

function SearchResults({
  query,
  total,
  results,
  onSelect,
  onClear,
}: {
  query: string;
  total: number;
  results: ReturnType<typeof searchGrammar>;
  onSelect: (id: string) => void;
  onClear: () => void;
}) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="rounded-xl border border-dashed border-foreground/15 px-4 py-6 font-sans text-sm text-zinc-500 dark:text-zinc-500">
          Ništa nije pronađeno za „{query}“.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={onClear}>
          Nazad na gramatiku
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
        <span className="tabular-nums">{total}</span>{" "}
        {total === 1 ? "pogodak" : "pogodaka"} u{" "}
        <span className="tabular-nums">{results.length}</span> oblasti
      </p>

      {results.map((result) => (
        <div key={result.id} className="flex min-w-0 flex-col gap-2">
          <button
            type="button"
            onClick={() => onSelect(result.id)}
            className="group flex cursor-pointer flex-wrap items-baseline gap-x-2 gap-y-0.5 self-start text-left"
          >
            <span className="font-sans text-base font-medium text-foreground group-hover:underline">
              {result.label}
            </span>
            <span className="font-sans text-xs text-zinc-500 dark:text-zinc-500">
              {result.total > result.hits.length
                ? `${result.total} pogodaka`
                : result.hint}
            </span>
            <CaretRightIcon
              weight="bold"
              aria-hidden
              className="size-3 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5"
            />
          </button>

          {result.hits.length > 0 && (
            <ul className="list-none divide-y divide-foreground/8 overflow-hidden rounded-xl border border-foreground/10 pl-0">
              {result.hits.map((hit, i) => (
                <li key={i} className="pl-0">
                  <button
                    type="button"
                    onClick={() => onSelect(result.id)}
                    className="w-full cursor-pointer px-3.5 py-2.5 text-left text-sm leading-snug text-foreground/90 transition-colors hover:bg-foreground/3"
                  >
                    <Snippet hit={hit} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function Snippet({ hit }: { hit: Hit }) {
  const before = hit.text.slice(0, hit.at);
  const match = hit.text.slice(hit.at, hit.at + hit.length);
  const after = hit.text.slice(hit.at + hit.length);
  return (
    <>
      {before}
      <mark className="rounded bg-[#0040ff]/12 px-0.5 text-[#0040ff] dark:bg-[#ffff01]/15 dark:text-[#ffff01]">
        {match}
      </mark>
      {after}
    </>
  );
}

function SectionPager({
  index,
  onSelect,
}: {
  index: number;
  onSelect: (id: string) => void;
}) {
  const prev = index > 0 ? GRAMMAR_SECTIONS[index - 1] : null;
  const next =
    index < GRAMMAR_SECTIONS.length - 1 ? GRAMMAR_SECTIONS[index + 1] : null;

  return (
    <>
      <div className="flex min-w-0 flex-1 justify-start">
        {prev && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => onSelect(prev.id)}
            aria-label={`Prethodno: ${prev.label}`}
            className="group min-w-0"
          >
            <CaretLeftIcon
              weight="bold"
              className="transition-transform group-hover:-translate-x-0.5"
            />
            <span className="truncate">{prev.label}</span>
          </Button>
        )}
      </div>
      <span className="shrink-0 px-2 font-sans text-[11px] font-medium uppercase tracking-wider tabular-nums text-zinc-500 dark:text-zinc-500">
        {index + 1} / {GRAMMAR_SECTIONS.length}
      </span>
      <div className="flex min-w-0 flex-1 justify-end">
        {next && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => onSelect(next.id)}
            aria-label={`Sledeće: ${next.label}`}
            className="group min-w-0"
          >
            <span className="truncate">{next.label}</span>
            <CaretRightIcon
              weight="bold"
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Button>
        )}
      </div>
    </>
  );
}

export function GrammarInfoButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Nemačka gramatika od A1 do B2"
        aria-label="Open the German grammar reference"
        className="inline-flex cursor-pointer items-center transition-colors hover:text-foreground"
      >
        <InfoIcon weight="bold" className="size-4" />
      </button>

      <GrammarDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
