"use client";

import dynamic from "next/dynamic";

import type { DokployService, DokploySnapshot } from "@/lib/dokploy";

const LogClient = dynamic(
  () => import("@/app/admin/log/log-client").then((m) => m.LogClient),
  { ssr: false },
);

const MINUTE = 60_000;

type Seed = {
  name: string;
  project: string;
  domain: string;
  repo: string;
  deploy: string;
  ago: number;
};

const SEEDS: Seed[] = [
  {
    name: "monolinie",
    project: "monolinie",
    domain: "monolinie.com",
    repo: "monolinie/home",
    deploy: "fix: correct title wording for consistency in messaging",
    ago: 34,
  },
  {
    name: "flickschuh",
    project: "flickschuh",
    domain: "flickschuh.wien",
    repo: "nenadmarinkovic/flickschuh.wien",
    deploy: "feat: sync opening hours from Google Places",
    ago: 3 * 24 * 60,
  },
  {
    name: "sprachenwald",
    project: "sprachenwald",
    domain: "sprachenwald.com",
    repo: "nenadmarinkovic/sprachenwald",
    deploy: "feat: add lesson ratings and tester functionality",
    ago: 21 * 24 * 60,
  },
];

function buildSnapshot(): DokploySnapshot {
  const now = Date.now();
  const services: DokployService[] = SEEDS.map((s, i) => ({
    id: `mockup-${i + 1}`,
    name: s.name,
    description: null,
    type: "application",
    status: "done",
    projectId: `project-${i + 1}`,
    projectName: s.project,
    environment: "production",
    environmentId: `env-${i + 1}`,
    appName: s.name,
    buildType: "nixpacks",
    replicas: 1,
    port: 3000,
    image: null,
    source: {
      kind: "github",
      label: s.repo,
      url: `https://github.com/${s.repo}`,
    },
    domains: [{ host: s.domain, https: true, port: 443, path: "/" }],
    database: null,
    volumes: [],
    lastDeploy: {
      status: "done",
      at: new Date(now - s.ago * MINUTE).toISOString(),
      title: s.deploy,
      description: null,
    },
    updatedAt: new Date(now - s.ago * MINUTE).toISOString(),
    createdAt: new Date(now - 200 * 24 * 60 * MINUTE).toISOString(),
  }));

  return {
    services,
    fetchedAt: new Date(now - 2 * MINUTE).toISOString(),
    dokployUrl: "https://dokploy.example",
  };
}

export function ServiceLogMockup() {
  return (
    <LogClient
      configured
      initialSnapshot={buildSnapshot()}
      initialError={null}
    />
  );
}
