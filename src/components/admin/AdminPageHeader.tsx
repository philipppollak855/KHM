interface AdminPageHeaderProps {
  title: string;
  description?: string;
}

export default function AdminPageHeader({ title, description }: AdminPageHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="font-display text-2xl sm:text-3xl font-light text-wood-dark mb-1 sm:mb-2">
        {title}
      </h1>
      {description && (
        <p className="text-stone text-sm leading-relaxed max-w-2xl">{description}</p>
      )}
    </header>
  );
}
