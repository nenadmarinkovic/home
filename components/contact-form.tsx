"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, message, website }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setName("");
      setEmail("");
      setMessage("");
      setStatus("sent");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  const sending = status === "sending";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-5"
      noValidate
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            required
            disabled={sending}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="text-sm md:text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            disabled={sending}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="text-sm md:text-sm"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          placeholder="What's on your mind?"
          required
          disabled={sending}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="min-h-40 resize-y text-sm md:text-sm"
        />
      </div>
      <div aria-hidden className="hidden">
        <Label htmlFor="contact-website">Website</Label>
        <Input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>
      <div className="flex items-center justify-end gap-4">
        <p
          aria-live="polite"
          className={`font-sans text-sm ${status === "error" ? "text-red-600 dark:text-red-400" : "text-foreground/70"}`}
        >
          {status === "sent"
            ? "Thanks! Your message is on its way."
            : status === "error"
              ? error
              : ""}
        </p>
        <Button type="submit" size="lg" disabled={sending}>
          {sending ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
