"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowsClockwise,
  ArrowsDownUp,
  Check,
  CheckCircle,
  CircleNotch,
  Cloud,
  Cube,
  Database,
  FunnelSimple,
  HardDrives,
  MagnifyingGlass,
  Pulse,
  WarningCircle,
  X as XIcon,
} from "@phosphor-icons/react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import { LogoutButton } from "../writing/logout-button";
import type {
  DokployService,
  DokployServiceType,
  DokploySnapshot,
  DokployStatus,
} from "@/lib/dokploy";

type LogClientProps = {
  configured: boolean;
  initialSnapshot: DokploySnapshot | null;
  initialError: string | null;
};

type SortKey = "status" | "name-asc" | "name-desc" | "recent" | "project";
type FilterKey = "all" | DokployStatus;

const SORT_LABELS: Record<SortKey, string> = {
  status: "Status",
  recent: "Recently updated",
  project: "Project",
  "name-asc": "Name A–Z",
  "name-desc": "Name Z–A",
};

const FILTER_LABELS: Record<FilterKey, string> = {
  all: "All",
  done: "Healthy",
  running: "Deploying",
  error: "Error",
  idle: "Idle",
};

const STATUS_ORDER: Record<DokployStatus, number> = {
  error: 0,
  running: 1,
  done: 2,
  idle: 3,
};

const TYPE_LABEL: Record<DokployServiceType, string> = {
  application: "App",
  compose: "Compose",
  postgres: "Postgres",
  mysql: "MySQL",
  mariadb: "MariaDB",
  mongo: "Mongo",
  redis: "Redis",
};

function applyControls(
  list: DokployService[],
  search: string,
  sort: SortKey,
  filter: FilterKey,
): DokployService[] {
  const q = search.trim().toLowerCase();
  const filtered = list.filter((s) => {
    if (filter !== "all" && s.status !== filter) return false;
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.projectName.toLowerCase().includes(q) ||
      (s.hint?.toLowerCase().includes(q) ?? false)
    );
  });
  const sorted = [...filtered];
  switch (sort) {
    case "status":
      sorted.sort((a, b) => {
        const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        if (byStatus !== 0) return byStatus;
        return a.name.localeCompare(b.name);
      });
      break;
    case "recent":
      sorted.sort((a, b) => {
        const aT = a.updatedAt ? Date.parse(a.updatedAt) : 0;
        const bT = b.updatedAt ? Date.parse(b.updatedAt) : 0;
        return bT - aT;
      });
      break;
    case "project":
      sorted.sort(
        (a, b) =>
          a.projectName.localeCompare(b.projectName) ||
          a.name.localeCompare(b.name),
      );
      break;
    case "name-asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }
  return sorted;
}

function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return "—";
  const diff = Date.now() - then;
  if (diff < 0) return "just now";
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.round(months / 12);
  return `${years}y ago`;
}

export function LogClient({
  configured,
  initialSnapshot,
  initialError,
}: LogClientProps) {
  const [snapshot, setSnapshot] = useState<DokploySnapshot | null>(
    initialSnapshot,
  );
  const [error, setError] = useState<string | null>(initialError);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("status");
  const [filter, setFilter] = useState<FilterKey>("all");

  const services = useMemo(
    () => snapshot?.services ?? [],
    [snapshot],
  );
  const totals = useMemo(() => {
    const acc: Record<DokployStatus, number> = {
      done: 0,
      running: 0,
      error: 0,
      idle: 0,
    };
    for (const s of services) acc[s.status] += 1;
    return acc;
  }, [services]);

  const list = useMemo(
    () => applyControls(services, search, sort, filter),
    [services, search, sort, filter],
  );
  const isFiltering = search.trim().length > 0 || filter !== "all";

  async function refresh() {
    if (!configured) return;
    setRefreshing(true);
    try {
      const res = await fetch("/api/dokploy", { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        services?: DokployService[];
        fetchedAt?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.services || !data.fetchedAt) {
        setError(data.error ?? `Refresh failed (${res.status})`);
        return;
      }
      setSnapshot({ services: data.services, fetchedAt: data.fetchedAt });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-8 py-16 font-sans">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Log</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-3xl font-semibold leading-none tracking-tight text-foreground">
            Log
          </h1>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
            <span>
              <span className="tabular-nums">{services.length}</span> service
              {services.length === 1 ? "" : "s"}
            </span>
            <Bullet />
            <Stat
              label="healthy"
              count={totals.done}
              tone="emerald"
              icon={<CheckCircle weight="fill" className="size-3.5" />}
            />
            {totals.running > 0 && (
              <>
                <Bullet />
                <Stat
                  label="deploying"
                  count={totals.running}
                  tone="blue"
                  icon={
                    <CircleNotch
                      weight="bold"
                      className="size-3.5 animate-spin"
                    />
                  }
                />
              </>
            )}
            {totals.error > 0 && (
              <>
                <Bullet />
                <Stat
                  label="error"
                  count={totals.error}
                  tone="red"
                  icon={<WarningCircle weight="fill" className="size-3.5" />}
                />
              </>
            )}
            {totals.idle > 0 && (
              <>
                <Bullet />
                <Stat label="idle" count={totals.idle} tone="muted" />
              </>
            )}
            {snapshot && (
              <>
                <Bullet />
                <span title={new Date(snapshot.fetchedAt).toLocaleString()}>
                  {relativeTime(snapshot.fetchedAt)}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={!configured || refreshing}
            className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
          >
            <ArrowsClockwise
              weight="bold"
              className={refreshing ? "animate-spin" : undefined}
            />
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
          <LogoutButton />
        </div>
      </header>

      {!configured ? (
        <NotConfigured />
      ) : error ? (
        <ErrorPanel error={error} onRetry={refresh} retrying={refreshing} />
      ) : (
        <section className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <SearchField search={search} onSearchChange={setSearch} />
            <FilterMenu filter={filter} onFilterChange={setFilter} />
            <SortMenu sort={sort} onSortChange={setSort} />
          </div>

          {list.length === 0 ? (
            isFiltering ? (
              <NoResults
                onClear={() => {
                  setSearch("");
                  setFilter("all");
                }}
              />
            ) : (
              <EmptyAll />
            )
          ) : (
            <ServiceList services={list} />
          )}
        </section>
      )}
    </main>
  );
}

function Bullet() {
  return (
    <span aria-hidden className="text-foreground/20">
      ·
    </span>
  );
}

function Stat({
  label,
  count,
  tone,
  icon,
}: {
  label: string;
  count: number;
  tone: "emerald" | "blue" | "red" | "muted";
  icon?: React.ReactNode;
}) {
  const className =
    tone === "emerald"
      ? "inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-500"
      : tone === "blue"
        ? "inline-flex items-center gap-1 text-blue-700 dark:text-blue-500"
        : tone === "red"
          ? "inline-flex items-center gap-1 text-destructive"
          : "inline-flex items-center gap-1";
  return (
    <span className={className}>
      {icon}
      <span className="tabular-nums">{count}</span> {label}
    </span>
  );
}

function ServiceList({ services }: { services: DokployService[] }) {
  return (
    <ul className="flex flex-col divide-y divide-foreground/5">
      {services.map((s) => (
        <li
          key={`${s.projectId}:${s.id}`}
          className="group/row flex items-center gap-4 py-3.5"
        >
          <ServiceIcon type={s.type} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-serif text-base font-semibold leading-tight text-foreground">
                {s.name}
              </p>
              <StatusTag status={s.status} />
              <TypeTag type={s.type} />
            </div>
            <p className="mt-1 truncate font-sans text-xs text-zinc-500 dark:text-zinc-500">
              {s.projectName}
              {s.hint ? <span className="text-foreground/30"> · {s.hint}</span> : null}
            </p>
          </div>
          <span
            className="shrink-0 font-sans text-xs font-medium uppercase tracking-wider tabular-nums text-zinc-500 dark:text-zinc-500"
            title={s.updatedAt ? new Date(s.updatedAt).toLocaleString() : undefined}
          >
            {relativeTime(s.updatedAt)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ServiceIcon({ type }: { type: DokployServiceType }) {
  const Icon =
    type === "application"
      ? Cloud
      : type === "compose"
        ? HardDrives
        : type === "redis"
          ? Cube
          : Database;
  return (
    <span
      aria-hidden
      className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.04] text-zinc-700 dark:text-zinc-300"
    >
      <Icon weight="regular" className="size-4" />
    </span>
  );
}

function StatusTag({ status }: { status: DokployStatus }) {
  if (status === "done") {
    return (
      <span
        title="Deployed and healthy."
        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-500"
      >
        <CheckCircle weight="fill" className="size-3" />
        Healthy
      </span>
    );
  }
  if (status === "running") {
    return (
      <span
        title="Deploy or operation in progress."
        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-500"
      >
        <CircleNotch weight="bold" className="size-3 animate-spin" />
        Deploying
      </span>
    );
  }
  if (status === "error") {
    return (
      <span
        title="Last operation failed. Check Dokploy logs."
        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-[11px] font-medium text-destructive"
      >
        <WarningCircle weight="fill" className="size-3" />
        Error
      </span>
    );
  }
  return (
    <span
      title="Never deployed or stopped."
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-foreground/[0.06] px-2.5 py-0.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300"
    >
      <Pulse weight="bold" className="size-3" />
      Idle
    </span>
  );
}

function TypeTag({ type }: { type: DokployServiceType }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-foreground/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
      {TYPE_LABEL[type]}
    </span>
  );
}

function SearchField({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="relative flex-1">
      <MagnifyingGlass
        weight="regular"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
      />
      <Input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search services…"
        aria-label="Search services by name or project"
        className="h-9 pl-9 pr-9 text-sm"
      />
      {search && (
        <button
          type="button"
          onClick={() => onSearchChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-zinc-500 transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <XIcon weight="bold" className="size-3" />
        </button>
      )}
    </div>
  );
}

function FilterMenu({
  filter,
  onFilterChange,
}: {
  filter: FilterKey;
  onFilterChange: (filter: FilterKey) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={`Show: ${FILTER_LABELS[filter]}`}
          className="h-9 shrink-0 gap-1.5"
        >
          <FunnelSimple weight="bold" />
          <span className="hidden sm:inline">{FILTER_LABELS[filter]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onFilterChange(key)}
            className="justify-between"
          >
            <span>{FILTER_LABELS[key]}</span>
            {filter === key && (
              <Check weight="bold" className="size-3.5 text-[#fd6401]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SortMenu({
  sort,
  onSortChange,
}: {
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={`Sort: ${SORT_LABELS[sort]}`}
          className="h-9 shrink-0 gap-1.5"
        >
          <ArrowsDownUp weight="bold" />
          <span className="hidden sm:inline">{SORT_LABELS[sort]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onSortChange(key)}
            className="justify-between"
          >
            <span>{SORT_LABELS[key]}</span>
            {sort === key && (
              <Check weight="bold" className="size-3.5 text-[#fd6401]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EmptyAll() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-foreground/15 px-6 py-14 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-[#fd6401]/10 text-[#fd6401]">
        <Cloud weight="regular" className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-serif text-base font-semibold text-foreground">
          Nothing deployed
        </p>
        <p className="font-serif text-sm italic text-zinc-500 dark:text-zinc-500">
          Dokploy is reachable, but no projects came back.
        </p>
      </div>
    </div>
  );
}

function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-foreground/15 px-6 py-14 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-foreground/[0.04] text-zinc-500 dark:text-zinc-500">
        <MagnifyingGlass weight="regular" className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">No matches</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Nothing here fits your search or filter.
        </p>
      </div>
      <Button onClick={onClear} variant="outline" className="mt-2">
        Reset filters
      </Button>
    </div>
  );
}

function ErrorPanel({
  error,
  onRetry,
  retrying,
}: {
  error: string;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-destructive/30 px-6 py-14 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <WarningCircle weight="regular" className="size-5" />
      </div>
      <div className="flex max-w-prose flex-col gap-1">
        <p className="font-serif text-base font-semibold text-foreground">
          Couldn&apos;t reach Dokploy
        </p>
        <p className="font-serif text-sm italic text-zinc-500 dark:text-zinc-500">
          {error}
        </p>
      </div>
      <Button onClick={onRetry} variant="outline" disabled={retrying} className="mt-2">
        <ArrowsClockwise
          weight="bold"
          className={retrying ? "animate-spin" : undefined}
        />
        {retrying ? "Retrying…" : "Try again"}
      </Button>
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-foreground/15 px-6 py-14 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-foreground/[0.04] text-zinc-500 dark:text-zinc-500">
        <Cloud weight="regular" className="size-5" />
      </div>
      <div className="flex max-w-prose flex-col gap-1">
        <p className="font-serif text-base font-semibold text-foreground">
          Dokploy isn&apos;t wired up yet
        </p>
        <p className="font-serif text-sm italic text-zinc-500 dark:text-zinc-500">
          Set <code className="font-sans text-xs">DOKPLOY_URL</code> and{" "}
          <code className="font-sans text-xs">DOKPLOY_API_KEY</code> in the
          server environment, then redeploy.
        </p>
      </div>
    </div>
  );
}

