export function formatTime(time?: string | null): string {
  // "05:00" -> "5:00 AM"
  if (!time) return '?';
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return '?';
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatTimeRange(start?: string | null, end?: string | null): string {
  if (!start || !end) return 'Time TBD';
  return `${formatTime(start)} - ${formatTime(end)}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isSameDate(a: string, b: string): boolean {
  return a === b;
}

export function generateReferenceCode(): string {
  const prefix = 'PJ';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}${code}`;
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function getMonthMatrix(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDay);

  const weeks: Date[][] = [];
  let current = new Date(startDate);
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(current));
      current = addDays(current, 1);
    }
    weeks.push(week);
    if (week[6].getMonth() !== month && week[0].getMonth() !== month) break;
  }
  return weeks;
}

// ═════════════════════════════════════════════════════════════
// Slot helpers — flexible formatting for slot-shaped objects
// ═════════════════════════════════════════════════════════════

/**
 * Formats a single slot's time range regardless of casing style.
 *
 * Accepts either camelCase (`startTime` / `endTime`) or snake_case
 * (`start_time` / `end_time`) fields — useful when a component may
 * receive slot data from different sources (Booking, Track, Success).
 *
 * Examples:
 *   { start_time: '18:00', end_time: '19:00' }   →  "6:00 PM - 7:00 PM"
 *   { startTime: '09:00', endTime: '11:00' }     →  "9:00 AM - 11:00 AM"
 *   {} or invalid                                 →  "Time TBD"
 */
export function formatSlotRange(slot: {
  startTime?: string | null;
  endTime?: string | null;
  start_time?: string | null;
  end_time?: string | null;
}): string {
  const start = slot.startTime ?? slot.start_time ?? null;
  const end = slot.endTime ?? slot.end_time ?? null;
  return formatTimeRange(start, end);
}

// ═════════════════════════════════════════════════════════════
// Slot collapsing — turn many hourly slots into readable ranges
// ═════════════════════════════════════════════════════════════

/**
 * Collapses contiguous hourly slots into merged ranges.
 *
 * Input:  [{ start_time: '18:00', end_time: '19:00' },
 *          { start_time: '19:00', end_time: '20:00' },
 *          { start_time: '20:00', end_time: '21:00' }]
 * Output: [{ start: '18:00', end: '21:00', hours: 3 }]
 */
export function collapseSlots(
  slots: { start_time: string; end_time: string }[] | undefined
): { start: string; end: string; hours: number }[] {
  if (!slots || slots.length === 0) return [];

  // Sort chronologically first — the API doesn't guarantee order
  const sorted = [...slots].sort((a, b) =>
    a.start_time.localeCompare(b.start_time)
  );

  const ranges: { start: string; end: string; hours: number }[] = [];
  let current = {
    start: sorted[0].start_time,
    end: sorted[0].end_time,
    hours: 1,
  };

  for (let i = 1; i < sorted.length; i++) {
    const slot = sorted[i];
    if (slot.start_time === current.end) {
      // Contiguous — extend the current range
      current.end = slot.end_time;
      current.hours += 1;
    } else {
      // Gap — flush current, start new range
      ranges.push(current);
      current = {
        start: slot.start_time,
        end: slot.end_time,
        hours: 1,
      };
    }
  }
  ranges.push(current);

  return ranges;
}

/**
 * Formats booking slots into a compact human-readable string.
 *
 * Examples:
 *   24 hourly slots 00:00–24:00  →  "All day · 24 hrs"
 *   4 hourly slots 18:00–22:00   →  "6:00 PM - 10:00 PM · 4 hrs"
 *   3 hourly slots 19:00–22:00   →  "7:00 PM - 10:00 PM · 3 hrs"
 *   2 non-contiguous blocks      →  "4:00 PM - 6:00 PM · 8:00 PM - 10:00 PM"
 *   Single slot 18:00–19:00      →  "6:00 PM - 7:00 PM"
 */
export function formatSlotsSummary(
  slots: { start_time: string; end_time: string }[] | undefined
): string {
  if (!slots || slots.length === 0) return 'No slots';

  const ranges = collapseSlots(slots);

  // Full-day booking — collapse to "All day"
  if (ranges.length === 1 && ranges[0].hours >= 24) {
    return `All day · ${ranges[0].hours} hrs`;
  }

  return ranges
    .map((r) => {
      const formatted = formatTimeRange(r.start, r.end);
      return r.hours > 1 ? `${formatted} · ${r.hours} hrs` : formatted;
    })
    .join(' · ');
}