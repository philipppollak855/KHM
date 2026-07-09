import Link from "next/link";

export interface ReportCard {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
  href?: string;
}

function ReportCardItem({ card }: { card: ReportCard }) {
  const className = `bg-cream border border-wood/10 p-3 sm:p-4 ${
    card.accent || ""
  } ${card.href ? "hover:border-forest/30 transition-colors" : ""}`;

  const content = (
    <>
      <p className="text-[10px] sm:text-xs text-stone uppercase tracking-wide">
        {card.label}
      </p>
      <p className="text-lg sm:text-2xl font-display text-wood-dark mt-1 break-words">
        {card.value}
      </p>
      {card.hint && (
        <p className="text-[10px] sm:text-xs text-stone mt-1 line-clamp-2">{card.hint}</p>
      )}
    </>
  );

  if (card.href) {
    return (
      <Link key={card.label} href={card.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div key={card.label} className={className}>
      {content}
    </div>
  );
}

export default function AdminReportCards({ cards }: { cards: ReportCard[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {cards.map((card) => (
        <ReportCardItem key={card.label} card={card} />
      ))}
    </div>
  );
}

export function AdminFilterChips<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ id: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {options.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
            value === id
              ? "bg-forest text-linen border-forest"
              : "bg-linen text-stone border-wood/20 hover:border-forest/30"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
