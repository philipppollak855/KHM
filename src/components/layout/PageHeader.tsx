interface PageHeaderProps {
  label?: string;
  title: string;
  description?: string;
}

export default function PageHeader({ label, title, description }: PageHeaderProps) {
  return (
    <div className="mb-10 md:mb-14">
      {label && (
        <p className="section-label text-bark mb-3">{label}</p>
      )}
      <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-wood-dark leading-tight">
        {title}
      </h1>
      {description && (
        <p className="text-stone mt-4 max-w-2xl leading-relaxed">{description}</p>
      )}
    </div>
  );
}
