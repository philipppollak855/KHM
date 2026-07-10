"use client";

import type { TeamDataScope } from "@/lib/types";

export default function TeamAccessOptions({
  fullAccess,
  dataScope,
  onFullAccessChange,
  onDataScopeChange,
  disabled,
}: {
  fullAccess: boolean;
  dataScope: TeamDataScope;
  onFullAccessChange: (value: boolean) => void;
  onDataScopeChange: (value: TeamDataScope) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-wood/10 bg-linen/40 p-4">
      <label className="flex items-start gap-3 text-sm text-wood-dark">
        <input
          type="checkbox"
          checked={fullAccess}
          disabled={disabled}
          onChange={(e) => onFullAccessChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-forest"
        />
        <span>
          <strong>Vollzugriff</strong>
          <span className="block text-xs text-stone mt-0.5">
            Lese- und Schreibrechte auf alle Module außer Team-Verwaltung.
          </span>
        </span>
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-wood-dark">Daten-Sichtbarkeit</legend>
        <p className="text-xs text-stone">
          Steuert, ob Kunden, Bestellungen, Rechnungen und Kontaktanfragen von allen
          Teammitgliedern oder nur vom jeweiligen Bearbeiter sichtbar sind.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(
            [
              {
                id: "all" as const,
                label: "Alle Team-Daten",
                hint: "Sieht Aufträge und Kunden des gesamten Teams.",
              },
              {
                id: "own" as const,
                label: "Nur eigene Daten",
                hint: "Nur eigene POS-Verkäufe, angelegte Kunden und zugewiesene Anfragen.",
              },
            ] as const
          ).map((option) => (
            <label
              key={option.id}
              className={`cursor-pointer rounded-xl border px-4 py-3 text-sm transition-colors ${
                dataScope === option.id
                  ? "border-forest bg-forest/5 text-wood-dark"
                  : "border-wood/15 bg-white text-stone hover:border-wood/30"
              } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <input
                type="radio"
                name="team-data-scope"
                value={option.id}
                checked={dataScope === option.id}
                disabled={disabled}
                onChange={() => onDataScopeChange(option.id)}
                className="sr-only"
              />
              <span className="font-medium text-wood-dark">{option.label}</span>
              <span className="block text-xs text-stone mt-1">{option.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
