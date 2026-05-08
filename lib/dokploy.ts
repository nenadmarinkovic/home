/**
 * Read-only Dokploy client. First hits `GET /api/project.all` for the slim
 * listing, then fans out to the per-service detail endpoints to enrich each
 * row with source, domains, last deploy, image, replicas, volumes, etc.
 *
 * Secrets (`env`, `databasePassword`, `refreshToken`) are stripped before the
 * data leaves this module.
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

export type DokployDomain = {
  host: string;
  https: boolean;
  port: number | null;
  path: string | null;
};

export type DokployDeployment = {
  status: DokployStatus;
  at: string | null;
  title: string;
  description: string | null;
};

export type DokployDatabaseInfo = {
  name: string | null;
  user: string | null;
  externalPort: number | null;
};

export type DokployServiceSource = {
  kind:
    | "github"
    | "gitlab"
    | "bitbucket"
    | "gitea"
    | "git"
    | "docker"
    | "raw"
    | null;
  label: string;
  url: string | null;
};

export type DokployService = {
  id: string;
  name: string;
  description: string | null;
  type: DokployServiceType;
  status: DokployStatus;
  projectId: string;
  projectName: string;
  /** Default environment hidden; non-default surfaced as "production" etc. */
  environment: string | null;
  environmentId: string | null;
  /** Internal docker container name, e.g. "home-nextjs-hv2sew". */
  appName: string | null;
  /** railpack / dockerfile / nixpacks / heroku-buildpacks / static (apps only). */
  buildType: string | null;
  replicas: number | null;
  port: number | null;
  image: string | null;
  source: DokployServiceSource | null;
  domains: DokployDomain[];
  database: DokployDatabaseInfo | null;
  volumes: string[];
  lastDeploy: DokployDeployment | null;
  /** ISO timestamp: most recent finished deploy, or service createdAt fallback. */
  updatedAt: string | null;
  createdAt: string | null;
};

export type DokploySnapshot = {
  services: DokployService[];
  fetchedAt: string;
  /** Dokploy instance base URL, used to build per-service deep links. */
  dokployUrl: string;
};

export type DokployResult =
  | { ok: true; snapshot: DokploySnapshot }
  | { ok: false; error: string; reason: "config" | "network" | "auth" | "server" };

type SlimService = {
  id: string;
  name: string;
  type: DokployServiceType;
  status: DokployStatus;
  projectId: string;
  projectName: string;
  environment: string | null;
  environmentId: string | null;
};

const STATUS_VALUES: ReadonlySet<DokployStatus> = new Set([
  "idle",
  "running",
  "done",
  "error",
]);

const DETAIL_ENDPOINT: Record<DokployServiceType, { path: string; idParam: string }> = {
  application: { path: "/api/application.one", idParam: "applicationId" },
  compose: { path: "/api/compose.one", idParam: "composeId" },
  postgres: { path: "/api/postgres.one", idParam: "postgresId" },
  mysql: { path: "/api/mysql.one", idParam: "mysqlId" },
  mariadb: { path: "/api/mariadb.one", idParam: "mariadbId" },
  mongo: { path: "/api/mongo.one", idParam: "mongoId" },
  redis: { path: "/api/redis.one", idParam: "redisId" },
};

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

function pickStr(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function pickInt(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

type RawProject = {
  projectId?: string;
  name?: string;
  environments?: RawEnvironment[];
};

type RawEnvironment = {
  environmentId?: string;
  name?: string;
  isDefault?: boolean;
  applications?: { applicationId?: string; name?: string; applicationStatus?: string }[];
  compose?: { composeId?: string; name?: string; composeStatus?: string; applicationStatus?: string }[];
  postgres?: { postgresId?: string; name?: string; applicationStatus?: string }[];
  mysql?: { mysqlId?: string; name?: string; applicationStatus?: string }[];
  mariadb?: { mariadbId?: string; name?: string; applicationStatus?: string }[];
  mongo?: { mongoId?: string; name?: string; applicationStatus?: string }[];
  redis?: { redisId?: string; name?: string; applicationStatus?: string }[];
};

function flattenProjects(projects: RawProject[]): SlimService[] {
  const out: SlimService[] = [];
  for (const project of projects) {
    const projectId = project.projectId ?? "";
    const projectName = project.name ?? "Untitled project";
    for (const env of project.environments ?? []) {
      const envName =
        env.isDefault === false && typeof env.name === "string" && env.name.length > 0
          ? env.name
          : null;
      const environmentId = env.environmentId ?? null;

      for (const app of env.applications ?? []) {
        out.push({
          id: app.applicationId ?? "",
          name: app.name ?? "Untitled app",
          type: "application",
          status: normaliseStatus(app.applicationStatus),
          projectId,
          projectName,
          environment: envName,
          environmentId,
        });
      }
      for (const compose of env.compose ?? []) {
        out.push({
          id: compose.composeId ?? "",
          name: compose.name ?? "Untitled compose",
          type: "compose",
          status: normaliseStatus(compose.composeStatus ?? compose.applicationStatus),
          projectId,
          projectName,
          environment: envName,
          environmentId,
        });
      }
      const databases: Array<[
        DokployServiceType,
        Exclude<RawEnvironment["postgres"], undefined>,
        "postgresId" | "mysqlId" | "mariadbId" | "mongoId" | "redisId",
      ]> = [
        ["postgres", env.postgres ?? [], "postgresId"],
        ["mysql", env.mysql ?? [], "mysqlId"],
        ["mariadb", env.mariadb ?? [], "mariadbId"],
        ["mongo", env.mongo ?? [], "mongoId"],
        ["redis", env.redis ?? [], "redisId"],
      ];
      for (const [type, list, idKey] of databases) {
        for (const db of list) {
          const id = (db as Record<string, unknown>)[idKey] as string | undefined;
          out.push({
            id: id ?? "",
            name: db.name ?? type,
            type,
            status: normaliseStatus(db.applicationStatus),
            projectId,
            projectName,
            environment: envName,
            environmentId,
          });
        }
      }
    }
  }
  return out;
}

type RawDomain = {
  host?: string;
  https?: boolean;
  port?: number | null;
  path?: string | null;
};

type RawDeployment = {
  status?: string;
  finishedAt?: string | null;
  startedAt?: string | null;
  createdAt?: string | null;
  title?: string;
  description?: string | null;
};

type RawMount = {
  type?: string;
  volumeName?: string | null;
  hostPath?: string | null;
  filePath?: string | null;
};

type RawDetail = Record<string, unknown> & {
  domains?: RawDomain[];
  deployments?: RawDeployment[];
  mounts?: RawMount[];
};

function pickDomains(detail: RawDetail): DokployDomain[] {
  const list = Array.isArray(detail.domains) ? detail.domains : [];
  const seen = new Set<string>();
  const out: DokployDomain[] = [];
  for (const raw of list) {
    const host = pickStr(raw.host);
    if (!host || seen.has(host)) continue;
    seen.add(host);
    out.push({
      host,
      https: raw.https === true,
      port: pickInt(raw.port),
      path: pickStr(raw.path),
    });
  }
  return out;
}

function pickVolumes(detail: RawDetail): string[] {
  const list = Array.isArray(detail.mounts) ? detail.mounts : [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const m of list) {
    if (m.type !== "volume") continue;
    const name = pickStr(m.volumeName);
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push(name);
  }
  return out;
}

function pickLastDeploy(detail: RawDetail): DokployDeployment | null {
  const list = Array.isArray(detail.deployments) ? detail.deployments : [];
  if (list.length === 0) return null;
  // Dokploy returns deployments newest-first. Trust that, but be defensive.
  let best: RawDeployment | null = null;
  let bestT = -Infinity;
  for (const dep of list) {
    const ts = Date.parse(
      dep.finishedAt ?? dep.startedAt ?? dep.createdAt ?? "",
    );
    const t = Number.isFinite(ts) ? ts : -Infinity;
    if (t > bestT) {
      best = dep;
      bestT = t;
    }
  }
  if (!best) return null;
  return {
    status: normaliseStatus(best.status),
    at: normaliseTimestamp(best.finishedAt ?? best.startedAt ?? best.createdAt),
    title: pickStr(best.title) ?? "Deployment",
    description: pickStr(best.description),
  };
}

function pickSource(detail: RawDetail, type: DokployServiceType): DokployServiceSource | null {
  if (type === "application" || type === "compose") {
    const sourceType = pickStr(detail.sourceType as unknown);
    if (sourceType === "github") {
      const owner = pickStr(detail.owner);
      const repo = pickStr(detail.repository);
      const branch = pickStr(detail.branch) ?? "main";
      if (owner && repo) {
        return {
          kind: "github",
          label: `${owner}/${repo}@${branch}`,
          // Repo root is always valid (handles private repos, deleted/renamed
          // branches, and lets iOS Universal Links hand off to the GitHub app).
          url: `https://github.com/${owner}/${repo}`,
        };
      }
    }
    if (sourceType === "gitlab") {
      const owner = pickStr(detail.gitlabOwner);
      const repo = pickStr(detail.gitlabRepository);
      const branch = pickStr(detail.gitlabBranch) ?? "main";
      if (owner && repo) {
        return { kind: "gitlab", label: `${owner}/${repo}@${branch}`, url: null };
      }
    }
    if (sourceType === "bitbucket") {
      const owner = pickStr(detail.bitbucketOwner);
      const repo = pickStr(detail.bitbucketRepository);
      const branch = pickStr(detail.bitbucketBranch) ?? "main";
      if (owner && repo) {
        return { kind: "bitbucket", label: `${owner}/${repo}@${branch}`, url: null };
      }
    }
    if (sourceType === "gitea") {
      const owner = pickStr(detail.giteaOwner);
      const repo = pickStr(detail.giteaRepository);
      const branch = pickStr(detail.giteaBranch) ?? "main";
      if (owner && repo) {
        return { kind: "gitea", label: `${owner}/${repo}@${branch}`, url: null };
      }
    }
    if (sourceType === "git") {
      const url = pickStr(detail.customGitUrl);
      const branch = pickStr(detail.customGitBranch) ?? "main";
      if (url) return { kind: "git", label: `${url}@${branch}`, url };
    }
    if (sourceType === "docker" || sourceType === "registry") {
      const image = pickStr(detail.dockerImage);
      if (image) return { kind: "docker", label: image, url: null };
    }
    if (sourceType === "raw") {
      return { kind: "raw", label: "Raw compose", url: null };
    }
    if (sourceType) {
      return { kind: null, label: sourceType, url: null };
    }
  }
  return null;
}

function pickPort(detail: RawDetail, type: DokployServiceType): number | null {
  if (type === "application") {
    return pickInt(detail.previewPort);
  }
  return null;
}

function pickImage(detail: RawDetail, type: DokployServiceType): string | null {
  if (type === "application" || type === "compose") {
    return pickStr(detail.dockerImage);
  }
  return pickStr(detail.dockerImage);
}

function pickDatabase(detail: RawDetail, type: DokployServiceType): DokployDatabaseInfo | null {
  if (type === "application" || type === "compose") return null;
  return {
    name: pickStr(detail.databaseName),
    user: pickStr(detail.databaseUser),
    externalPort: pickInt(detail.externalPort),
  };
}

async function fetchDetail(
  config: { url: string; key: string },
  type: DokployServiceType,
  id: string,
): Promise<RawDetail | null> {
  const ep = DETAIL_ENDPOINT[type];
  const endpoint = `${config.url}${ep.path}?${ep.idParam}=${encodeURIComponent(id)}`;
  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: { accept: "application/json", "x-api-key": config.key },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as RawDetail;
  } catch {
    return null;
  }
}

function enrich(slim: SlimService, detail: RawDetail | null): DokployService {
  const base: DokployService = {
    id: slim.id,
    name: slim.name,
    description: null,
    type: slim.type,
    status: slim.status,
    projectId: slim.projectId,
    projectName: slim.projectName,
    environment: slim.environment,
    environmentId: slim.environmentId,
    appName: null,
    buildType: null,
    replicas: null,
    port: null,
    image: null,
    source: null,
    domains: [],
    database: null,
    volumes: [],
    lastDeploy: null,
    updatedAt: null,
    createdAt: null,
  };
  if (!detail) return base;

  const lastDeploy = pickLastDeploy(detail);
  const createdAt = normaliseTimestamp(detail.createdAt);
  const detailName = pickStr(detail.name);
  return {
    ...base,
    name: detailName ?? base.name,
    description: pickStr(detail.description),
    appName: pickStr(detail.appName),
    buildType: pickStr(detail.buildType),
    replicas: pickInt(detail.replicas),
    port: pickPort(detail, slim.type),
    image: pickImage(detail, slim.type),
    source: pickSource(detail, slim.type),
    domains: pickDomains(detail),
    database: pickDatabase(detail, slim.type),
    volumes: pickVolumes(detail),
    lastDeploy,
    updatedAt: lastDeploy?.at ?? createdAt,
    createdAt,
  };
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
      headers: { accept: "application/json", "x-api-key": config.key },
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

  const slim = flattenProjects(payload as RawProject[]);
  const details = await Promise.all(
    slim.map((s) => (s.id ? fetchDetail(config, s.type, s.id) : Promise.resolve(null))),
  );
  const services = slim.map((s, i) => enrich(s, details[i]));

  return {
    ok: true,
    snapshot: {
      services,
      fetchedAt: new Date().toISOString(),
      dokployUrl: config.url,
    },
  };
}
