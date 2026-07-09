"use client";

import {
  PERIOD_PRESETS,
  getPeriodRange,
  formatPeriodDescription,
  toInputDateValue,
  type PeriodPreset,
} from "@/lib/date-filters";

export interface AdminPeriodFilterProps {
  preset: PeriodPreset;
  onPresetChange: (preset: PeriodPreset) => void;
  customFrom: string;
  customTo: string;
  onCustomFromChange: (value: string) => void;
  onCustomToChange: (value: string) => void;
}

export function getActiveDateRange(
  preset: PeriodPreset,
  customFrom: string,
  customTo: string
) {
  return getPeriodRange(preset, customFrom, customTo);
}

export default function AdminPeriodFilter({
  preset,
  onPresetChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
}: AdminPeriodFilterProps) {
  const range = getPeriodRange(preset, customFrom, customTo);

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap gap-2">
        {PERIOD_PRESETS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onPresetChange(id)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              preset === id
                ? "bg-forest text-linen border-forest"
                : "bg-linen text-stone border-wood/20 hover:border-forest/30"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex-1 text-sm">
            <span className="block text-stone text-xs mb-1">Von</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => onCustomFromChange(e.target.value)}
              className="w-full rounded-lg border border-wood/20 bg-linen px-3 py-2.5 text-base sm:text-sm"
            />
          </label>
          <label className="flex-1 text-sm">
            <span className="block text-stone text-xs mb-1">Bis</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => onCustomToChange(e.target.value)}
              min={customFrom || undefined}
              className="w-full rounded-lg border border-wood/20 bg-linen px-3 py-2.5 text-base sm:text-sm"
            />
          </label>
        </div>
      )}

      <p className="text-xs text-stone">
        Berichtszeitraum: {formatPeriodDescription(preset, range)}
      </p>
    </div>
  );
}

export function useDefaultCustomRange() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    from: toInputDateValue(monthStart),
    to: toInputDateValue(now),
  };
}
