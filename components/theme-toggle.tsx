"use client";

import { useSyncExternalStore } from "react";
import { DesktopIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";

import {
  applyThemeColorMeta,
  applyThemePrefAttribute,
  resolveTheme,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const options = [
  { value: "system", icon: DesktopIcon, label: "System" },
  { value: "light", icon: SunIcon, label: "Light" },
  { value: "dark", icon: MoonIcon, label: "Dark" },
] as const;

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme-pref"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.getAttribute("data-theme-pref");
}

function getServerSnapshot() {
  return null;
}

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme } = useTheme();
  const pref = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const select = (value: (typeof options)[number]["value"]) => {
    applyThemeColorMeta(resolveTheme(value));
    applyThemePrefAttribute(value);
    setTheme(value);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        "inline-flex items-center gap-0 rounded-full bg-card p-0.5 border border-foreground/10",
        className,
      )}
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={pref === value}
          aria-label={label}
          title={label}
          data-theme-option={value}
          onClick={() => select(value)}
          className="theme-option relative flex size-6 items-center justify-center rounded-full cursor-pointer text-foreground/55 hover:text-foreground"
        >
          <Icon size={12} weight="regular" />
        </button>
      ))}
    </div>
  );
}
