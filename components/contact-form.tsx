"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const RECIPIENT = "nenadmarinkovic@protonmail.com";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = encodeURIComponent(
      name ? `Hello from ${name}` : "Hello from your site",
    );
    const body = encodeURIComponent(
      `${message}\n\n— ${name || "Anonymous"}${email ? `\n${email}` : ""}`,
    );
    window.location.href = `mailto:${RECIPIENT}?subject=${subject}&body=${body}`;
  }

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
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="h-[145px] min-h-[120px] resize-y text-sm md:text-sm"
        />
      </div>
      <Button type="submit" size="lg" className="self-end">
        Send message
      </Button>
    </form>
  );
}
