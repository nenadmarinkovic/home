"use client";

import { useEffect, useState } from "react";

const WAVE = "👋";
const GREETINGS = ["Hi.", "Hallo.", "Zdravo.", WAVE];
const HOLD_MS = 1800;
const EXIT_MS = 360;

export function AnimatedGreeting() {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    const tick = setInterval(() => {
      setPhase("out");
      setTimeout(() => {
        setI((v) => (v + 1) % GREETINGS.length);
        setPhase("in");
      }, EXIT_MS);
    }, HOLD_MS + EXIT_MS);
    return () => clearInterval(tick);
  }, []);

  return (
    <span aria-live="polite" className="inline-block align-baseline">
      <span
        key={`${phase}-${i}`}
        className={`inline-block will-change-[opacity,transform] ${
          phase === "in" ? "animate-greeting-in" : "animate-greeting-out"
        }`}
      >
        {GREETINGS[i] === WAVE && phase === "in" ? (
          <span className="animate-wave">{WAVE}</span>
        ) : (
          GREETINGS[i]
        )}
      </span>
    </span>
  );
}
