/**
 * Read-only Dokploy client. Hits `GET /api/project.all` on the configured
 * instance and normalises every service (application, compose, database) into
 * a single shape the dashboard can render.
 *
 * Auth: `x-api-key` header. Generate the token from the Dokploy UI under
 * Settings → Profile → API/CLI.
 */

export type DokployStatus = "idle" | "running" | "done" | "error";

export type DokployServiceType =
  | "application"
  | "compose"
  | "postgres"
  | "mysql"
  | "mariadb"
  | "mongo"
  | "redis";

export type DokployService = {
  id: string;
  name: string;
  description: string | null;
  type: DokployServiceType;
  status: DokployStatus;
  projectId: string;
  projectName: string;
  /** ISO timestamp of last create/update we can read. */
  updatedAt: string | null;
  /** Domain or repo hint surfaced as a tertiary line, when available. */
  hint: string | null;
};

export type DokploySnapshot = {
  services: DokployService[];
  fetchedAt: string;
};

export type DokployResult =
  | { ok: true; snapshot: DokploySnapshot }
  | { ok: false; error: string; reason: "config" | "network" | "auth" | "server" };

type RawProject = {
  projectId?: string;
  name?: string;
  applications?: RawApplication[];
  compose?: RawCompose[];
  postgres?: RawDatabase[];
  mysql?: RawDatabase[];
  mariadb?: RawDatabase[];
  mongo?: RawDatabase[];
  redis?: RawDatabase[];
};

type RawApplication = {
  applicationId?: string;
  name?: string;
  description?: string | null;
  applicationStatus?: string;
  appName?: string | null;
  domain?: string | null;
  customGitUrl?: string | null;
  repository?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

type RawCompose = {
  composeId?: string;
  name?: string;
  description?: string | null;
  composeStatus?: string;
  applicationStatus?: string;
  appName?: string | null;
  customGitUrl?: string | null;
  repository?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

type RawDatabase = {
  postgresId?: string;
  mysqlId?: string;
  mariadbId?: string;
  mongoId?: string;
  redisId?: string;
  name?: string;
  description?: string | null;
  applicationStatus?: string;
  databaseName?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

const STATUS_VALUES: ReadonlySet<DokployStatus> = new Set([
  "idle",
  "running",
  "done",
  "error",
]);

function normaliseStatus(value: unknown): DokployStatus {
  if (typeof value === "string" && STATUS_VALUES.has(value as DokployStatus)) {
    return value as DokployStatus;
  }
  return "idle";
}

function normaliseTimestamp(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
}

function pickHint(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function flattenProject(project: RawProject): DokployService[] {
  const projectId = project.projectId ?? "";
  const projectName = project.name ?? "Untitled project";
  const services: DokployService[] = [];

  for (const app of project.applications ?? []) {
    services.push({
      id: app.applicationId ?? `${projectId}:app:${app.name ?? ""}`,
      name: app.name ?? "Untitled app",
      description: app.description ?? null,
      type: "application",
      status: normaliseStatus(app.applicationStatus),
      projectId,
      projectName,
      updatedAt: normaliseTimestamp(app.updatedAt ?? app.createdAt),
      hint:
        pickHint(app.domain) ??
        pickHint(app.customGitUrl) ??
        pickHint(app.repository) ??
        pickHint(app.appName),
    });
  }

  for (const compose of project.compose ?? []) {
    services.push({
      id: compose.composeId ?? `${projectId}:compose:${compose.name ?? ""}`,
      name: compose.name ?? "Untitled compose",
      description: compose.description ?? null,
      type: "compose",
      status: normaliseStatus(compose.composeStatus ?? compose.applicationStatus),
      projectId,
      projectName,
      updatedAt: normaliseTimestamp(compose.updatedAt ?? compose.createdAt),
      hint:
        pickHint(compose.customGitUrl) ??
        pickHint(compose.repository) ??
        pickHint(compose.appName),
    });
  }

  const databases: Array<[DokployServiceType, RawDatabase[] | undefined, keyof RawDatabase]> = [
    ["postgres", project.postgres, "postgresId"],
    ["mysql", project.mysql, "mysqlId"],
    ["mariadb", project.mariadb, "mariadbId"],
    ["mongo", project.mongo, "mongoId"],
    ["redis", project.redis, "redisId"],
  ];
  for (const [type, list, idKey] of databases) {
    for (const db of list ?? []) {
      const id = (db[idKey] as string | undefined) ?? `${projectId}:${type}:${db.name ?? ""}`;
      services.push({
        id,
        name: db.name ?? `Untitled ${type}`,
        description: db.description ?? null,
        type,
        status: normaliseStatus(db.applicationStatus),
        projectId,
        projectName,
        updatedAt: normaliseTimestamp(db.updatedAt ?? db.createdAt),
        hint: pickHint(db.databaseName),
      });
    }
  }

  return services;
}

export function getDokployConfig(): { url: string; key: string } | null {
  const rawUrl = (process.env.DOKPLOY_URL ?? "").trim();
  const key = (process.env.DOKPLOY_API_KEY ?? "").trim();
  if (!rawUrl || !key) return null;
  const url = rawUrl.replace(/\/+$/, "");
  return { url, key };
}

export async function fetchDokploySnapshot(): Promise<DokployResult> {
  const config = getDokployConfig();
  if (!config) {
    return {
      ok: false,
      reason: "config",
      error:
        "Dokploy is not configured. Set DOKPLOY_URL and DOKPLOY_API_KEY in your environment.",
    };
  }

  const endpoint = `${config.url}/api/project.all`;
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-api-key": config.key,
      },
      cache: "no-store",
    });
  } catch (err) {
    return {
      ok: false,
      reason: "network",
      error: err instanceof Error ? err.message : "Network error",
    };
  }

  if (response.status === 401 || response.status === 403) {
    return {
      ok: false,
      reason: "auth",
      error: `Dokploy rejected the API key (HTTP ${response.status}).`,
    };
  }
  if (!response.ok) {
    return {
      ok: false,
      reason: "server",
      error: `Dokploy returned HTTP ${response.status}.`,
    };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return {
      ok: false,
      reason: "server",
      error: "Dokploy returned a non-JSON response.",
    };
  }

  if (!Array.isArray(payload)) {
    return {
      ok: false,
      reason: "server",
      error: "Unexpected response shape from /api/project.all.",
    };
  }

  const services = (payload as RawProject[]).flatMap(flattenProject);
  return {
    ok: true,
    snapshot: {
      services,
      fetchedAt: new Date().toISOString(),
    },
  };
}
