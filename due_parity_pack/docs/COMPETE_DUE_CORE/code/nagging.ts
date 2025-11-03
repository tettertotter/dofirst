/**
 * Compute next nag times given a due timestamp and user cadence.
 * This does not schedule notifications; it only returns the schedule.
 */
export type Cadence = { firstAfterMin?: number; stepMinutes: number[]; repeatAfter?: number };
export type QuietHours = { start: string; end: string } | null; // 'HH:MM' in local time

const DEFAULT_CADENCE: Cadence = {
  firstAfterMin: 5,
  stepMinutes: [10, 10, 10, 15, 15], // used for first few nudges; then repeat last step
  repeatAfter: 15
};

function inQuiet(date: Date, quiet: QuietHours): boolean {
  if (!quiet) return false;
  const [sh, sm] = quiet.start.split(":").map(Number);
  const [eh, em] = quiet.end.split(":").map(Number);
  const mins = date.getHours() * 60 + date.getMinutes();
  const s = sh * 60 + sm, e = eh * 60 + em;
  return s <= e ? (mins >= s && mins < e) : (mins >= s || mins < e);
}

export function computeNextTimes(due: Date, now: Date, quiet: QuietHours = null, cadence: Cadence = DEFAULT_CADENCE, limit = 3): Date[] {
  const times: Date[] = [];
  let t = new Date(Math.max(due.getTime(), now.getTime()));
  // First nudge after firstAfterMin
  if (cadence.firstAfterMin && now >= due) {
    t = new Date(now.getTime() + cadence.firstAfterMin * 60000);
  } else if (cadence.firstAfterMin && now < due) {
    t = new Date(due.getTime() + cadence.firstAfterMin * 60000);
  }
  let i = 0;
  while (times.length < limit) {
    // Advance by step
    const step = cadence.stepMinutes[i] ?? cadence.repeatAfter ?? 15;
    t = new Date(t.getTime() + step * 60000);
    // If quiet, roll to end of quiet hours
    if (quiet && inQuiet(t, quiet)) {
      const [eh, em] = quiet.end.split(":").map(Number);
      const next = new Date(t);
      next.setHours(eh, em, 0, 0);
      if (inQuiet(next, quiet)) next.setDate(next.getDate() + 1); // cross midnight
      t = next;
    }
    times.push(new Date(t));
    i++;
  }
  return times;
}
