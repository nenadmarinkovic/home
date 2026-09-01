"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  buildCalendar,
  CALENDAR_WEEKS,
  countToday,
  DAILY_GOAL,
  streaks,
  type Activity,
} from "@/lib/daily";
import { cn } from "@/lib/utils";

import { StreakCalendar } from "./streak-calendar";

const noSubscribe = () => () => {};

export function StreakDialog({ activity }: { activity: Activity }) {
  const [open, setOpen] = useState(false);
  const hydrated = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );

  const summary = useMemo(() => {
    if (!hydrated) return null;
    const now = new Date();
    const days = buildCalendar(activity, CALENDAR_WEEKS, now);
    return {
      current: streaks(days, now).current,
      today: countToday(activity.reviewedAt, now),
    };
  }, [activity, hydrated]);

  const complete = (summary?.today ?? 0) >= DAILY_GOAL;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-9"
        onClick={() => setOpen(true)}
        aria-label="Show the daily streak calendar"
      >
        {summary ? (
          <>
            <span className="tabular-nums">{summary.current}</span> day streak
            <span
              className={cn(
                "rounded-full px-1.5 py-px text-[11px] font-medium tabular-nums",
                complete
                  ? "bg-[#0040ff]/12 text-[#0040ff] dark:bg-[#ffff01]/12 dark:text-[#ffff01]"
                  : "bg-foreground/8 text-zinc-500 dark:text-zinc-400",
              )}
            >
              {Math.min(summary.today, DAILY_GOAL)}/{DAILY_GOAL}
            </span>
          </>
        ) : (
          "Streak"
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:w-[min(94vw,50rem)]">
          <DialogHeader>
            <DialogTitle>Daily streak</DialogTitle>
            <DialogDescription>
              Review {DAILY_GOAL} cards in a day to fill it in and keep the
              chain going.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {open && <StreakCalendar activity={activity} />}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
}
