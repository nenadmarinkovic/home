import "server-only";

import { site } from "@/lib/site";

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

type Address = { email: string; name?: string };

export type SendEmailOptions = {
  to: Address[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: Address;
  sender?: Address;
};

function apiKey(): string {
  const key = process.env.BREVO_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "BREVO_API_KEY is not set. Add it to .env.local before sending email.",
    );
  }
  return key;
}

function defaultSender(): Address {
  const email = process.env.BREVO_SENDER_EMAIL?.trim();
  if (!email) {
    throw new Error(
      "BREVO_SENDER_EMAIL is not set. It must be a sender or domain verified in Brevo.",
    );
  }
  return { email, name: process.env.BREVO_SENDER_NAME?.trim() || site.name };
}

export async function sendEmail(
  options: SendEmailOptions,
  signal?: AbortSignal,
): Promise<{ messageId: string }> {
  const res = await fetch(BREVO_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      "api-key": apiKey(),
    },
    body: JSON.stringify({
      sender: options.sender ?? defaultSender(),
      to: options.to,
      replyTo: options.replyTo,
      subject: options.subject,
      htmlContent: options.htmlContent,
      textContent: options.textContent,
    }),
    signal,
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Brevo ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as { messageId?: string };
  return { messageId: data.messageId ?? "" };
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
