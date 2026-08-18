import { NextResponse } from "next/server";
import { z } from "zod";

import {
  AUX_VALUES,
  CEFR_VALUES,
  GENDER_VALUES,
  POS_VALUES,
} from "@/db/schema";
import { saveEntry } from "@/lib/lib-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ExampleSchema = z.object({
  de: z.string().min(1),
  sr: z.string().min(1),
});

const WriteEntrySchema = z.object({
  id: z.number().int().positive().optional(),
  term: z.string().trim().min(1).max(200),
  pos: z.enum(POS_VALUES),
  gender: z.enum(GENDER_VALUES).nullable().optional(),
  plural: z.string().nullable().optional(),
  aux: z.enum(AUX_VALUES).nullable().optional(),
  separable: z.boolean().nullable().optional(),
  level: z.enum(CEFR_VALUES).nullable().optional(),
  translationSr: z.string().trim().min(1).max(500),
  examples: z.array(ExampleSchema).max(10).default([]),
  conjugations: z.record(z.string(), z.unknown()).default({}),
  notes: z.string().max(2000).default(""),
  tags: z.string().max(200).default(""),
  source: z.string().max(50).default("manual"),
});

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = WriteEntrySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  try {
    const result = saveEntry(parsed.data);
    return NextResponse.json({ ok: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
