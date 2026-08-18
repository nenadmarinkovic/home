import { NextResponse } from "next/server";
import { z } from "zod";

import { setCardSuspended } from "@/lib/lib-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({ suspended: z.boolean() });

export async function POST(
  request: Request,
  context: RouteContext<"/api/lib/cards/[id]/suspend">,
) {
  const { id: idParam } = await context.params;
  const id = Number.parseInt(idParam, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const updated = setCardSuspended(id, parsed.data.suspended);
  if (!updated) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    card: { id: updated.id, suspended: updated.suspended },
  });
}
