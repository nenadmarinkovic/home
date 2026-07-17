"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowsClockwise,
  ArrowSquareOut,
  CheckCircle,
  CircleNotch,
  Cloud,
  Cube,
  Database,
  GitBranch,
  GlobeHemisphereWest,
  HardDrives,
  Lightning,
  Plug,
  Pulse,
  Stack,
  WarningCircle,
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

import type {
  DokployService,
  DokployServiceType,
  DokployServiceSource,
  DokploySnapshot,
  DokployStatus,
} from "@/lib/dokploy";

type LogClientProps = {
  configured: boolean;
  initialSnapshot: DokploySnapshot | null;
  initialError: string | null;
};

type ProjectGroup = {
  id: string;
  name: string;
  services: DokployService[];
  /** Default environment id, used to build the project-level deep link. */
  environmentId: string | null;
};

const TYPE_ORDER: Record<DokployServiceType, number> = {
  application: 0,
  compose: 1,
  postgres: 2,
  mysql: 3,
  mariadb: 4,
  mongo: 5,
  redis: 6,
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

function groupByProject(list: DokployService[]): ProjectGroup[] {
  const map = new Map<string, ProjectGroup>();
  for (const s of list) {
    const key = s.projectId || `__${s.projectName}`;
    let group = map.get(key);
    if (!group) {
      group = {
        id: key,
        name: s.projectName,
        services: [],
        environmentId: s.environmentId,
      };
      map.set(key, group);
    }
    group.services.push(s);
    if (!group.environmentId && s.environmentId) {
      group.environmentId = s.environmentId;
    }
  }
  for (const group of map.values()) {
    group.services.sort((a, b) => {
      const byType = TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
      if (byType !== 0) return byType;
      return a.name.localeCompare(b.name);
    });
  }
  return Array.from(map.values());
}

function dokployProjectUrl(
  base: string | null,
  projectId: string,
  environmentId: string | null,
): string | null {
  if (!base || !projectId) return null;
  if (environmentId) {
    return `${base}/dashboard/project/${projectId}/environment/${environmentId}`;
  }
  return `${base}/dashboard/project/${projectId}`;
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

  const services = useMemo(() => snapshot?.services ?? [], [snapshot]);
  const groups = useMemo(() => groupByProject(services), [services]);
  const dokployUrl = snapshot?.dokployUrl ?? null;
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

  async function refresh() {
    if (!configured) return;
    setRefreshing(true);
    try {
      const res = await fetch("/api/dokploy", { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        services?: DokployService[];
        fetchedAt?: string;
        dokployUrl?: string;
        error?: string;
      };
      if (
        !res.ok ||
        !data.ok ||
        !data.services ||
        !data.fetchedAt ||
        !data.dokployUrl
      ) {
        setError(data.error ?? `Refresh failed (${res.status})`);
        return;
      }
      setSnapshot({
        services: data.services,
        fetchedAt: data.fetchedAt,
        dokployUrl: data.dokployUrl,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 pt-8 pb-16 font-sans md:gap-8 md:pt-16">
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
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="text-3xl font-normal text-balance text-foreground sm:text-4xl">
            Log
          </h1>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
            <span>
              <span className="tabular-nums">{services.length}</span> service
              {services.length === 1 ? "" : "s"}
            </span>
            <Bullet />
            <span>
              <span className="tabular-nums">{groups.length}</span> project
              {groups.length === 1 ? "" : "s"}
            </span>
            {totals.error > 0 && (
              <>
                <Bullet />
                <span className="inline-flex items-center gap-1 text-destructive">
                  <WarningCircle weight="fill" className="size-3.5" />
                  <span className="tabular-nums">{totals.error}</span> error
                  {totals.error === 1 ? "" : "s"}
                </span>
              </>
            )}
            {totals.running > 0 && (
              <>
                <Bullet />
                <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-500">
                  <CircleNotch
                    weight="bold"
                    className="size-3.5 animate-spin"
                  />
                  <span className="tabular-nums">{totals.running}</span>{" "}
                  deploying
                </span>
              </>
            )}
            {totals.done > 0 && totals.error === 0 && totals.running === 0 && (
              <>
                <Bullet />
                <span
                  className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-500"
                  title="All services healthy."
                >
                  <CheckCircle weight="fill" className="size-3.5" />
                  All healthy
                </span>
              </>
            )}
            {snapshot && (
              <>
                <Bullet />
                <span title={new Date(snapshot.fetchedAt).toLocaleString()}>
                  updated {relativeTime(snapshot.fetchedAt)}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={refresh}
            disabled={!configured || refreshing}
            className="h-9"
          >
            <ArrowsClockwise
              weight="bold"
              className={refreshing ? "animate-spin" : undefined}
            />
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </header>

      {!configured ? (
        <NotConfigured />
      ) : error ? (
        <ErrorPanel error={error} onRetry={refresh} retrying={refreshing} />
      ) : groups.length === 0 ? (
        <EmptyAll />
      ) : (
        <div className="flex flex-col gap-10">
          {groups.map((group) => (
            <ProjectSection
              key={group.id}
              group={group}
              dokployUrl={dokployUrl}
            />
          ))}
        </div>
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

function ProjectSection({
  group,
  dokployUrl,
}: {
  group: ProjectGroup;
  dokployUrl: string | null;
}) {
  const projectUrl = dokployProjectUrl(
    dokployUrl,
    group.services[0]?.projectId ?? group.id,
    group.environmentId,
  );
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2 className="min-w-0 max-w-full truncate text-lg font-medium leading-tight text-foreground sm:text-xl">
          {group.name}
        </h2>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="font-sans text-[11px] font-medium uppercase tracking-wider tabular-nums text-zinc-500 dark:text-zinc-500">
            {group.services.length} service
            {group.services.length === 1 ? "" : "s"}
          </span>
          {projectUrl ? (
            <OpenInDokployLink
              href={projectUrl}
              label={`Open ${group.name} in Dokploy`}
            >
              <span className="hidden sm:inline">Open in Dokploy</span>
              <span className="sm:hidden">Open</span>
            </OpenInDokployLink>
          ) : null}
        </div>
      </div>
      <ul className="flex flex-col divide-y divide-foreground/5">
        {group.services.map((s) => (
          <ServiceRow key={`${s.projectId}:${s.id}:${s.type}`} service={s} />
        ))}
      </ul>
    </section>
  );
}

function OpenInDokployLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-foreground/10 bg-foreground/[0.02] px-2.5 py-1 font-sans text-[11px] font-medium uppercase tracking-wider text-zinc-600 transition-colors hover:border-foreground/20 hover:bg-foreground/[0.06] hover:text-foreground dark:text-zinc-400"
    >
      {children}
      <ArrowSquareOut weight="bold" className="size-3" />
    </a>
  );
}

function ServiceRow({ service: s }: { service: DokployService }) {
  const meta = buildMeta(s);
  return (
    <li className="flex items-start gap-3 py-3.5 sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <p className="min-w-0 max-w-full truncate text-base font-medium leading-tight text-foreground">
            {s.name}
          </p>
          <StatusTag status={s.status} />
          <TypeTag type={s.type} />
          {s.environment ? <EnvTag name={s.environment} /> : null}
        </div>
        {meta.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-xs text-zinc-500 dark:text-zinc-500">
            {meta.map((m, i) => (
              <MetaItem key={i} item={m} />
            ))}
          </div>
        ) : null}
        {s.lastDeploy?.title ? (
          <p
            className="mt-1.5 truncate font-sans text-xs text-zinc-500/80 dark:text-zinc-500/80"
            title={s.lastDeploy.description ?? undefined}
          >
            <span className="not-italic text-foreground/40">↳</span>{" "}
            {s.lastDeploy.title}
          </p>
        ) : null}
      </div>
      <span
        className="shrink-0 self-start pt-0.5 font-sans text-[11px] font-medium uppercase tracking-wider tabular-nums text-zinc-500 sm:text-xs dark:text-zinc-500"
        title={s.updatedAt ? new Date(s.updatedAt).toLocaleString() : undefined}
      >
        {relativeTime(s.updatedAt)}
      </span>
    </li>
  );
}

type MetaIcon =
  | "source"
  | "domain"
  | "image"
  | "build"
  | "port"
  | "replicas"
  | "volume"
  | "container";

type MetaEntry = {
  icon: MetaIcon;
  text: string;
  href?: string;
  title?: string;
};

function buildMeta(s: DokployService): MetaEntry[] {
  const out: MetaEntry[] = [];

  if (s.source) {
    out.push({
      icon: sourceIcon(s.source),
      text: s.source.label,
      href: s.source.url ?? undefined,
      title: s.source.kind ?? undefined,
    });
  }

  if (s.image) {
    out.push({ icon: "image", text: s.image, title: "Image" });
  }

  if (s.buildType) {
    out.push({ icon: "build", text: s.buildType, title: "Build" });
  }

  for (const d of s.domains) {
    const proto = d.https ? "https" : "http";
    const url = `${proto}://${d.host}${d.path && d.path !== "/" ? d.path : ""}`;
    const text =
      d.port && d.port !== (d.https ? 443 : 80)
        ? `${d.host}:${d.port}`
        : d.host;
    out.push({ icon: "domain", text, href: url, title: "Domain" });
  }

  if (s.database) {
    const parts: string[] = [];
    if (s.database.user) parts.push(s.database.user);
    if (s.database.name) parts.push(`@${s.database.name}`);
    if (s.database.externalPort) parts.push(`:${s.database.externalPort}`);
    if (parts.length > 0) {
      out.push({ icon: "port", text: parts.join(""), title: "Database" });
    } else if (s.database.externalPort) {
      out.push({
        icon: "port",
        text: `:${s.database.externalPort}`,
        title: "Port",
      });
    }
  } else if (s.port) {
    out.push({ icon: "port", text: `:${s.port}`, title: "Port" });
  }

  if (s.replicas !== null && s.replicas > 0) {
    out.push({
      icon: "replicas",
      text: `${s.replicas} ${s.replicas === 1 ? "replica" : "replicas"}`,
      title: "Replicas",
    });
  }

  for (const v of s.volumes) {
    out.push({ icon: "volume", text: v, title: "Volume" });
  }

  if (s.appName) {
    out.push({ icon: "container", text: s.appName, title: "Container" });
  }

  return out;
}

function sourceIcon(source: DokployServiceSource): MetaIcon {
  if (source.kind === "docker") return "image";
  if (source.kind === "raw") return "build";
  return "source";
}

function MetaItem({ item }: { item: MetaEntry }) {
  const icon = renderMetaIcon(item.icon);
  const baseClass =
    "inline-flex max-w-full items-center gap-1 truncate align-middle";
  const title = item.title ? `${item.title}: ${item.text}` : item.text;
  const children = (
    <>
      <span aria-hidden className="shrink-0 text-foreground/40">
        {icon}
      </span>
      <span className="min-w-0 truncate">{item.text}</span>
    </>
  );
  if (item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
        className={`${baseClass} -my-0.5 py-0.5 underline-offset-2 hover:text-foreground hover:underline`}
      >
        {children}
      </a>
    );
  }
  return (
    <span className={baseClass} title={title}>
      {children}
    </span>
  );
}

function renderMetaIcon(icon: MetaIcon) {
  switch (icon) {
    case "source":
      return <GitBranch weight="bold" className="size-3.5" />;
    case "domain":
      return <GlobeHemisphereWest weight="bold" className="size-3.5" />;
    case "image":
      return <Cube weight="bold" className="size-3.5" />;
    case "build":
      return <Lightning weight="bold" className="size-3.5" />;
    case "port":
      return <Plug weight="bold" className="size-3.5" />;
    case "replicas":
      return <Stack weight="bold" className="size-3.5" />;
    case "volume":
      return <Database weight="bold" className="size-3.5" />;
    case "container":
      return <HardDrives weight="bold" className="size-3.5" />;
  }
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

function EnvTag({ name }: { name: string }) {
  return (
    <span
      title={`Environment: ${name}`}
      className="inline-flex shrink-0 items-center rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
    >
      {name}
    </span>
  );
}

function EmptyAll() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-foreground/15 px-6 py-14 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-[#F25022]/10 text-[#F25022]">
        <Cloud weight="regular" className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-base font-medium text-foreground">
          Nothing deployed
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Dokploy is reachable, but no projects came back.
        </p>
      </div>
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
        <p className="text-base font-medium text-foreground">
          Couldn&apos;t reach Dokploy
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          {error}
        </p>
      </div>
      <Button
        onClick={onRetry}
        variant="outline"
        disabled={retrying}
        className="mt-2"
      >
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
        <p className="text-base font-medium text-foreground">
          Dokploy isn&apos;t wired up yet
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Set <code className="font-sans text-xs">DOKPLOY_URL</code> and{" "}
          <code className="font-sans text-xs">DOKPLOY_API_KEY</code> in the
          server environment, then redeploy.
        </p>
      </div>
    </div>
  );
}
