export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="surface-navy border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <span className="eyebrow text-accent">{eyebrow}</span>
        <h1 className="mt-3 max-w-3xl text-4xl uppercase md:text-6xl">{title}</h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-navy-foreground/75">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
