export const DAILY_GOAL = 20;
export const DAILY_MAX = 50;
export const CALENDAR_WEEKS = 53;

export type Activity = {
  addedAt: number[];
  reviewedAt: number[];
};

export type Day = {
  key: string;
  date: Date;
  reviews: number;
  added: number;
  done: boolean;
};

export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function tally(timestamps: number[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const ts of timestamps) {
    const key = dayKey(new Date(ts));
    out.set(key, (out.get(key) ?? 0) + 1);
  }
  return out;
}

export function countToday(timestamps: number[], now: Date): number {
  const today = dayKey(now);
  let n = 0;
  for (const ts of timestamps) {
    if (dayKey(new Date(ts)) === today) n += 1;
  }
  return n;
}

export function buildCalendar(
  activity: Activity,
  weeks: number,
  now: Date,
): Day[] {
  const reviews = tally(activity.reviewedAt);
  const added = tally(activity.addedAt);

  const today = startOfDay(now);
  const weekday = (today.getDay() + 6) % 7;
  const end = new Date(today);
  end.setDate(end.getDate() + (6 - weekday));
  const start = new Date(end);
  start.setDate(start.getDate() - (weeks * 7 - 1));

  const days: Day[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = dayKey(date);
    const count = reviews.get(key) ?? 0;
    days.push({
      key,
      date,
      reviews: count,
      added: added.get(key) ?? 0,
      done: count >= DAILY_GOAL,
    });
  }
  return days;
}

export function streaks(
  days: Day[],
  now: Date,
): { current: number; best: number } {
  const done = new Set(days.filter((d) => d.done).map((d) => d.key));

  let best = 0;
  let run = 0;
  for (const day of days) {
    run = done.has(day.key) ? run + 1 : 0;
    if (run > best) best = run;
  }

  const cursor = startOfDay(now);
  if (!done.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let current = 0;
  while (done.has(dayKey(cursor))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { current, best };
}
