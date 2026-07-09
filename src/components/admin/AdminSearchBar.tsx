import { Search, X } from "lucide-react";

interface AdminSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
  totalCount?: number;
}

export default function AdminSearchBar({
  value,
  onChange,
  placeholder = "Suchen…",
  resultCount,
  totalCount,
}: AdminSearchBarProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="relative w-full sm:max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone"
          strokeWidth={1.5}
        />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border-2 border-wood/20 bg-linen pl-10 pr-10 py-3 sm:py-2.5 text-base sm:text-sm text-wood-dark placeholder:text-stone focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-wood-dark"
            aria-label="Suche löschen"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {value && resultCount !== undefined && totalCount !== undefined && (
        <p className="text-xs text-stone mt-2">
          {resultCount} von {totalCount} Einträgen
        </p>
      )}
    </div>
  );
}
