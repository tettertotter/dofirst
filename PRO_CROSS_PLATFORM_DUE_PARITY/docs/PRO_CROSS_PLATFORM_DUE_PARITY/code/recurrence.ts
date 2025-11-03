export type Freq = 'DAILY'|'WEEKLY'|'MONTHLY_DATE'|'YEARLY';
export type Rule = { freq: Freq; interval?: number; byweekday?: number[]; bymonthday?: number[] };

export function nextInstance(from: Date, rule: Rule): Date {
  const interval = rule.interval ?? 1;
  const d = new Date(from);
  switch (rule.freq) {
    case 'DAILY': d.setDate(d.getDate() + interval); break;
    case 'WEEKLY': d.setDate(d.getDate() + 7 * interval); break;
    case 'MONTHLY_DATE': d.setMonth(d.getMonth() + interval); break;
    case 'YEARLY': d.setFullYear(d.getFullYear() + interval); break;
  }
  return d;
}
