import { NextResponse } from "next/server";
import { z } from "zod";

import { escapeHtml, sendEmail } from "@/lib/brevo";
import { checkContactRate } from "@/lib/rate-limit";
import { site } from "@/lib/site";

export const runtime = "nodejs";

const ContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.email("Enter a valid email").max(254),
  message: z.string().trim().min(10, "Message is too short").max(5000),
  website: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const rate = checkContactRate(ip);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many messages. Try again in a few minutes." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid submission" },
      { status: 400 },
    );
  }

  const { name, email, message, website } = parsed.data;
  if (website) {
    return NextResponse.json({ ok: true });
  }

  const recipient =
    process.env.CONTACT_RECIPIENT_EMAIL?.trim() || site.author.email;

  try {
    await sendEmail({
      to: [{ email: recipient, name: site.author.name }],
      replyTo: { email, name },
      subject: `Contact form: ${name}`,
      textContent: `${message}\n\n—\nFrom: ${name} <${email}>\nIP: ${ip}`,
      htmlContent: `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>
<hr />
<p>From: ${escapeHtml(name)} &lt;<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>&gt;<br />IP: ${escapeHtml(ip)}</p>`,
    });
  } catch (err) {
    console.error("Contact form send failed:", err);
    return NextResponse.json(
      { error: "Could not send your message. Please email me directly." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
