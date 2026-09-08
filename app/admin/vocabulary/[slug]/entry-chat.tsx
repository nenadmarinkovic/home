"use client";

import { AiChat } from "../ai-chat";

const INTRO =
  "Šta želiš da saznaš o ovoj reči? Možeš me pitati za upotrebu, gramatiku, primere, registar ili nešto drugo.";

export function EntryChat({ slug, term }: { slug: string; term: string }) {
  return (
    <AiChat
      endpoint="/api/vocabulary/chat"
      payload={{ slug }}
      title={term}
      description="Razgovaraj sa AI tutorom o ovoj odrednici."
      intro={INTRO}
      triggerLabel="Chat"
      triggerAriaLabel="Chat about this entry"
    />
  );
}
