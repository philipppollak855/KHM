export type PeriodPreset =
  | "all"
  | "today"
  | "7d"
  | "month"
  | "last_month"
  | "quarter"
  | "year"
  | "custom";

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export const PERIOD_PRESETS: Array<{ id: PeriodPreset; label: string }> = [
  { id: "all", label: "Gesamt" },
  { id: "today", label: "Heute" },
  { id: "7d", label: "7 Tage" },
  { id: "month", label: "Dieser Monat" },
  { id: "last_month", label: "Letzter Monat" },
  { id: "quarter", label: "Quartal" },
  { id: "year", label: "Dieses Jahr" },
  { id: "custom", label: "Zeitraum" },
];

export function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getPeriodRange(
  preset: PeriodPreset,
  customFrom = "",
  customTo = ""
): DateRange {
  const now = new Date();

  switch (preset) {
    case "all":
      return { from: null, to: null };
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "7d": {
      const from = new Date(now);
      from.setDate(from.getDate() - 6);
      return { from: startOfDay(from), to: endOfDay(now) };
    }
    case "month":
      return {
        from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
        to: endOfDay(now),
      };
    case "last_month": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: startOfDay(from), to: endOfDay(to) };
    }
    case "quarter": {
      const quarter = Math.floor(now.getMonth() / 3);
      return {
        from: startOfDay(new Date(now.getFullYear(), quarter * 3, 1)),
        to: endOfDay(now),
      };
    }
    case "year":
      return {
        from: startOfDay(new Date(now.getFullYear(), 0, 1)),
        to: endOfDay(now),
      };
    case "custom": {
      const from = customFrom ? startOfDay(new Date(customFrom)) : null;
      const to = customTo ? endOfDay(new Date(customTo)) : null;
      return { from, to };
    }
    default:
      return { from: null, to: null };
  }
}

export function isDateInRange(date: Date, range: DateRange) {
  if (range.from && date < range.from) return false;
  if (range.to && date > range.to) return false;
  return true;
}

export function formatPeriodDescription(
  preset: PeriodPreset,
  range: DateRange
): string {
  if (preset === "all") return "Gesamter Zeitraum";
  if (!range.from && !range.to) return "Zeitraum wählen";

  const fmt = (d: Date) =>
    d.toLocaleDateString("de-AT", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (range.from && range.to) {
    return `${fmt(range.from)} – ${fmt(range.to)}`;
  }
  if (range.from) return `ab ${fmt(range.from)}`;
  if (range.to) return `bis ${fmt(range.to)}`;
  return "Zeitraum";
}

export function toInputDateValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
