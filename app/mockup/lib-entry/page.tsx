// TEMPORARY — used to capture a UI mockup for the blog post, then deleted.
// It renders the real EntryDetailClient so the mockup is the actual component
// tree at the actual sizes, not a hand-drawn approximation.
import { EntryDetailClient } from "@/app/admin/lib/[slug]/entry-detail-client";
import type { SrsCardRow } from "@/db/schema";
import type { VocabEntry } from "@/lib/lib-db";

export const dynamic = "force-dynamic";

const NOW = new Date("2026-07-25T09:00:00Z");

const entry: VocabEntry = {
  id: 1,
  slug: "mockup",
  term: "Verbindung",
  lemma: "verbindung",
  pos: "noun",
  gender: "die",
  plural: "die Verbindungen",
  aux: null,
  separable: null,
  level: "B1",
  translationSr: "veza, spoj, povezanost",
  examples: [
    { de: "Die Verbindung ist sehr stabil.", sr: "Veza je veoma stabilna." },
    { de: "Ich habe leider keine Verbindung.", sr: "Nažalost, nemam vezu." },
    {
      de: "Gibt es eine direkte Verbindung nach Wien?",
      sr: "Postoji li direktna veza za Beč?",
    },
  ],
  conjugations: {
    singular: {
      nominativ: "die Verbindung",
      akkusativ: "die Verbindung",
      dativ: "der Verbindung",
      genitiv: "der Verbindung",
    },
    plural: {
      nominativ: "die Verbindungen",
      akkusativ: "die Verbindungen",
      dativ: "den Verbindungen",
      genitiv: "der Verbindungen",
    },
  },
  notes:
    "Koristi se i za fizičku vezu (spoj) i za prenosnu (kontakt, saobraćajna veza).",
  tags: "reisen,technik,b1",
  source: "mistral",
  createdAt: new Date("2026-06-02T10:00:00Z"),
  updatedAt: new Date("2026-07-20T18:30:00Z"),
};

const cards: SrsCardRow[] = [
  {
    id: 1,
    entryId: 1,
    direction: "de_sr",
    due: new Date(NOW.getTime() + 3 * 864e5),
    stability: 12.4,
    difficulty: 5.1,
    elapsedDays: 6,
    scheduledDays: 3,
    reps: 7,
    lapses: 1,
    state: 2,
    learningSteps: 0,
    lastReview: new Date(NOW.getTime() - 6 * 864e5),
    suspended: false,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  },
  {
    id: 2,
    entryId: 1,
    direction: "sr_de",
    due: new Date(NOW.getTime() + 10 * 6e4),
    stability: 1.2,
    difficulty: 6.3,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 2,
    lapses: 0,
    state: 1,
    learningSteps: 1,
    lastReview: new Date(NOW.getTime() - 20 * 6e4),
    suspended: false,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  },
];

export default function MockupPage() {
  return <EntryDetailClient entry={entry} cards={cards} />;
}
