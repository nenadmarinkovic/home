"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  buildCalendar,
  CALENDAR_WEEKS,
  DAILY_GOAL,
  dayKey,
  streaks,
  type Activity,
  type Day,
} from "@/lib/daily";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["", "Mon", "", "Wed", "", "Fri", ""];
const CAPTION =
  "font-sans text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500";

const GUTTER = 30;
const GAP = 3;
const CELL = 10;
const MIN_WEEKS = 8;

const CELL_BASE = "size-2.5 shrink-0 rounded-[2px]";

const TINTS = [
  "bg-foreground/[0.07]",
  "bg-[#0040ff]/20 dark:bg-[#ffff01]/20",
  "bg-[#0040ff]/40 dark:bg-[#ffff01]/40",
  "bg-[#0040ff]/65 dark:bg-[#ffff01]/65",
  "bg-[#0040ff] dark:bg-[#ffff01]",
];

function columnsThatFit(width: number): number {
  const fits = Math.floor((width - GUTTER + GAP) / (CELL + GAP));
  return Math.max(MIN_WEEKS, Math.min(CALENDAR_WEEKS, fits));
}

function tint(day: Day): string {
  if (day.done) return TINTS[4];
  if (day.reviews === 0) return TINTS[0];
  const share = day.reviews / DAILY_GOAL;
  if (share >= 0.5) return TINTS[3];
  if (share >= 0.25) return TINTS[2];
  return TINTS[1];
}

function shortDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function headline(day: Day, isFuture: boolean): string {
  if (isFuture) return "Upcoming";
  const parts = [
    day.reviews === 0 ? "No reviews" : `${day.reviews}/${DAILY_GOAL} reviews`,
  ];
  if (day.added > 0) parts.push(`${day.added} added`);
  return parts.join(", ");
}

type Box = { left: number; top: number; width: number; height: number };
type Hovered = { day: Day; future: boolean; box: Box };

export function StreakCalendar({ activity }: { activity: Activity }) {
  const [hovered, setHovered] = useState<Hovered | null>(null);
  const [columns, setColumns] = useState(CALENDAR_WEEKS);
  const frame = useRef<HTMLDivElement | null>(null);
  const observer = useRef<ResizeObserver | null>(null);

  const measure = useCallback((node: HTMLDivElement | null) => {
    frame.current = node;
    observer.current?.disconnect();
    if (!node) {
      observer.current = null;
      return;
    }
    observer.current = new ResizeObserver(([entry]) => {
      setColumns(columnsThatFit(entry.contentRect.width));
    });
    observer.current.observe(node);
  }, []);

  const data = useMemo(() => {
    const now = new Date();
    const days = buildCalendar(activity, CALENDAR_WEEKS, now);
    const todayKey = dayKey(now);
    return {
      days,
      todayKey,
      today: days.find((day) => day.key === todayKey)?.reviews ?? 0,
      ...streaks(days, now),
    };
  }, [activity]);

  const grid = useMemo(() => {
    const days = data.days.slice((CALENDAR_WEEKS - columns) * 7);
    const months: { key: string; column: number; text: string }[] = [];
    let seen = -1;
    for (let column = 0; column < columns; column++) {
      const midweek = days[column * 7 + 3].date;
      const month = midweek.getMonth();
      if (month === seen) continue;
      seen = month;
      const previous = months[months.length - 1];
      if (previous && column - previous.column < 3) continue;
      months.push({
        key: `${midweek.getFullYear()}-${month}`,
        column,
        text: midweek.toLocaleDateString(undefined, { month: "short" }),
      });
    }
    return {
      days,
      months,
      template: `${GUTTER}px repeat(${columns}, ${CELL}px)`,
      rows: `repeat(7, ${CELL}px)`,
      reviews: days.reduce(
        (n, day) => (day.key <= data.todayKey ? n + day.reviews : n),
        0,
      ),
      range:
        columns === CALENDAR_WEEKS ? "the last 12 months" : `the last ${columns} weeks`,
    };
  }, [data.days, data.todayKey, columns]);

  const show = useCallback(
    (day: Day, target: HTMLElement) => {
      const box = frame.current?.getBoundingClientRect();
      if (!box) return;
      const cell = target.getBoundingClientRect();
      setHovered({
        day,
        future: day.key > data.todayKey,
        box: {
          left: cell.left - box.left,
          top: cell.top - box.top,
          width: cell.width,
          height: cell.height,
        },
      });
    },
    [data.todayKey],
  );

  return (
    <div className="flex flex-col gap-5">
      <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-1", CAPTION)}>
        <span>
          <span className="tabular-nums">{data.current}</span> day streak
        </span>
        <span aria-hidden className="text-foreground/20">
          ·
        </span>
        <span>
          <span className="tabular-nums">{data.today}</span>/
          <span className="tabular-nums">{DAILY_GOAL}</span> today
        </span>
      </p>

      <div className="flex flex-col gap-3">
        <div
          ref={measure}
          className="relative"
          onMouseLeave={() => setHovered(null)}
        >
          <div
            className={cn("mb-1.5 grid gap-[3px]", CAPTION)}
            style={{ gridTemplateColumns: grid.template }}
          >
            {grid.months.map((month) => (
              <span
                key={month.key}
                style={{ gridColumnStart: month.column + 2 }}
                className="whitespace-nowrap leading-none"
              >
                {month.text}
              </span>
            ))}
          </div>

          <div
            className="grid grid-flow-col gap-[3px] animate-in fade-in-0 duration-300"
            style={{
              gridTemplateColumns: grid.template,
              gridTemplateRows: grid.rows,
            }}
          >
            {WEEKDAYS.map((weekday, row) => (
              <span
                key={row}
                className={cn(
                  "self-center pr-2 leading-none whitespace-nowrap",
                  CAPTION,
                )}
              >
                {weekday}
              </span>
            ))}
            {grid.days.map((day) => {
              const future = day.key > data.todayKey;
              return (
                <button
                  key={day.key}
                  type="button"
                  tabIndex={-1}
                  aria-label={`${shortDate(day.date)}, ${headline(day, future)}`}
                  onMouseEnter={(e) => show(day, e.currentTarget)}
                  onClick={(e) => show(day, e.currentTarget)}
                  className={cn(
                    CELL_BASE,
                    "relative cursor-pointer transition duration-150",
                    future ? "bg-foreground/[0.03]" : tint(day),
                    !future &&
                      "hover:z-10 hover:ring-1 hover:ring-foreground/50 hover:ring-offset-1 hover:ring-offset-card",
                    day.key === data.todayKey &&
                      "ring-1 ring-foreground/40 ring-offset-1 ring-offset-card",
                  )}
                />
              );
            })}
          </div>

          {hovered && (
            <Tooltip key={hovered.day.key} open>
              <TooltipTrigger
                render={
                  <span
                    aria-hidden
                    className="pointer-events-none absolute"
                    style={hovered.box}
                  />
                }
              />
              <TooltipContent side="top" sideOffset={6}>
                <span className="font-medium">
                  {headline(hovered.day, hovered.future)}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {shortDate(hovered.day.date)}
                </span>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
          <p className={cn("leading-none", CAPTION)}>
            <span className="tabular-nums">{grid.reviews}</span> reviews in{" "}
            {grid.range}
          </p>
          <p className={cn("flex items-center gap-1 leading-none", CAPTION)}>
            Less
            {TINTS.map((shade) => (
              <span key={shade} className={cn(CELL_BASE, shade)} />
            ))}
            More
          </p>
        </div>
      </div>
    </div>
  );
}
