import type { CalendarDayItem } from './types';

const MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;
const DATE_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/** Returns the current Ghana (`Africa/Accra`) `YYYY-MM` string. */
export function getCurrentGhanaMonth(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Accra',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(now);
  const year = parts.find((p) => p.type === 'year')?.value ?? String(now.getUTCFullYear());
  const month =
    parts.find((p) => p.type === 'month')?.value ??
    String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/** Shifts a `YYYY-MM` string by `deltaMonths` (e.g. `-1` or `+1`). */
export function shiftMonth(month: string, deltaMonths: number): string {
  const match = MONTH_PATTERN.exec(month);
  if (!match) return getCurrentGhanaMonth();
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const shifted = new Date(Date.UTC(year, monthIndex + deltaMonths, 1));
  const nextYear = shifted.getUTCFullYear();
  const nextMonth = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  return `${nextYear}-${nextMonth}`;
}

/** Formats `YYYY-MM` into a readable label such as `"December 2026"`. */
export function formatMonthHeading(month: string): string {
  const match = MONTH_PATTERN.exec(month);
  if (!match) return month;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/** Returns the number of days to add to a `YYYY-MM-DD` string. */
export function addDays(isoDate: string, deltaDays: number): string {
  const match = DATE_PATTERN.exec(isoDate);
  if (!match) return isoDate;
  const dt = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Validates a half-open Ghana date range `[startDate, endDate)`.
 * Returns `{ valid: true, nights }` or `{ valid: false, reason }`.
 */
export function validateBlockDateRange(
  startDate: string,
  endDate: string,
): { valid: true; nights: number } | { valid: false; reason: string } {
  const startMatch = DATE_PATTERN.exec(startDate.trim());
  const endMatch = DATE_PATTERN.exec(endDate.trim());
  if (!startMatch || !endMatch) {
    return { valid: false, reason: 'Select both a valid start date and check-out end date.' };
  }
  const startUtc = Date.UTC(
    Number(startMatch[1]),
    Number(startMatch[2]) - 1,
    Number(startMatch[3]),
  );
  const endUtc = Date.UTC(Number(endMatch[1]), Number(endMatch[2]) - 1, Number(endMatch[3]));
  const diffDays = Math.round((endUtc - startUtc) / 86_400_000);
  if (diffDays <= 0) {
    return { valid: false, reason: 'End date must be at least 1 night after the start date.' };
  }
  return { valid: true, nights: diffDays };
}

/**
 * Pads the beginning of a month's day list with `null` cells so Monday is column 0
 * and Sunday is column 6.
 */
export function buildMondayFirstGrid(
  month: string,
  days: CalendarDayItem[],
): Array<CalendarDayItem | null> {
  const match = MONTH_PATTERN.exec(month);
  if (!match) return days;
  const firstDayOfWeekUtc = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, 1),
  ).getUTCDay(); // 0=Sun, 1=Mon, ...
  const leadingBlanks = (firstDayOfWeekUtc + 6) % 7;
  return [...Array<null>(leadingBlanks).fill(null), ...days];
}

/** Checks whether a date `isoDate` falls inside the half-open selection `[startDate, endDate)`. */
export function isDateInSelection(
  isoDate: string,
  startDate: string,
  endDate: string,
): boolean {
  if (!startDate) return false;
  if (!endDate) return isoDate === startDate;
  return isoDate >= startDate && isoDate < endDate;
}
