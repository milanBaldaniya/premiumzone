export default function PageHero({ eyebrow, title, subtitle }) {
  return (
    <section className="relative overflow-hidden bg-dark-gradient">
      <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="container-luxe relative py-16 text-center lg:py-20">
        {eyebrow && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">{eyebrow}</p>
        )}
        <h1 className="font-display text-4xl font-bold text-white lg:text-5xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-4 max-w-xl text-slate-300">{subtitle}</p>}
      </div>
    </section>
  );
}
