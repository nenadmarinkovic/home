import { LibClient } from "@/app/admin/lib/lib-client";
import type { ClientEntry } from "@/app/admin/lib/types";

export const dynamic = "force-dynamic";

const BASE = new Date("2026-07-20T09:00:00Z");

type Seed = {
  term: string;
  pos: string;
  gender?: string;
  plural?: string;
  aux?: string;
  separable?: boolean;
  translationSr: string;
  tags: string;
  due: number;
  reviewed: number;
};

const SEEDS: Seed[] = [
  { term: "Verbindung", pos: "noun", gender: "die", plural: "die Verbindungen", translationSr: "veza, spoj, povezanost", tags: "reisen,technik", due: 2, reviewed: 7 },
  { term: "ausdrucken", pos: "verb", aux: "haben", separable: true, translationSr: "odštampati, isprintati", tags: "büro", due: 1, reviewed: 12 },
  { term: "Bahnhof", pos: "noun", gender: "der", plural: "die Bahnhöfe", translationSr: "železnička stanica", tags: "reisen", due: 0, reviewed: 21 },
  { term: "vorschlagen", pos: "verb", aux: "haben", separable: true, translationSr: "predložiti", tags: "alltag", due: 2, reviewed: 4 },
  { term: "Rechnung", pos: "noun", gender: "die", plural: "die Rechnungen", translationSr: "račun, faktura", tags: "büro,geld", due: 1, reviewed: 9 },
  { term: "Wie komme ich zum Bahnhof?", pos: "sentence", translationSr: "Kako da dođem do železničke stanice?", tags: "reisen,fragen", due: 0, reviewed: 15 },
  { term: "zuverlässig", pos: "adjective", translationSr: "pouzdan", tags: "alltag", due: 2, reviewed: 3 },
  { term: "sich verspäten", pos: "verb", aux: "haben", translationSr: "zakasniti", tags: "reisen", due: 1, reviewed: 6 },
  { term: "Termin", pos: "noun", gender: "der", plural: "die Termine", translationSr: "termin, zakazani sastanak", tags: "büro", due: 0, reviewed: 18 },
  { term: "Es tut mir leid", pos: "phrase", translationSr: "Žao mi je", tags: "höflichkeit", due: 1, reviewed: 11 },
  { term: "Krankenkasse", pos: "noun", gender: "die", plural: "die Krankenkassen", translationSr: "zdravstveno osiguranje", tags: "amt", due: 2, reviewed: 2 },
  { term: "erledigen", pos: "verb", aux: "haben", translationSr: "obaviti, završiti", tags: "büro,alltag", due: 0, reviewed: 14 },
];

const entries: ClientEntry[] = SEEDS.map((s, i) => ({
  id: i + 1,
  slug: `mockup-${i + 1}`,
  term: s.term,
  lemma: s.term.toLowerCase(),
  pos: s.pos,
  gender: s.gender ?? null,
  plural: s.plural ?? null,
  aux: s.aux ?? null,
  separable: s.separable ?? null,
  level: "B1",
  translationSr: s.translationSr,
  examples: [],
  conjugations: {},
  notes: "",
  tags: s.tags,
  source: "mistral",
  createdAt: new Date(BASE.getTime() - i * 864e5),
  updatedAt: new Date(BASE.getTime() - i * 864e5),
  due: s.due,
  reviewed: s.reviewed,
}));

const stats = {
  due: entries.reduce((n, e) => n + e.due, 0),
  newCards: 6,
  total: entries.length * 2,
};

export default function LibListMockup() {
  return <LibClient initialEntries={entries} initialStats={stats} />;
}
