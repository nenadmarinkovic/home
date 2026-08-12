"use client";

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

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
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
          aria-checked={theme === value}
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
