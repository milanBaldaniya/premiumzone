import PageHero from './PageHero';

export default function LegalPage({ title, updated, sections }) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} subtitle={`Last updated: ${updated}`} />
      <section className="container-luxe max-w-3xl py-16">
        <div className="space-y-10">
          {sections.map((section, i) => (
            <div key={i}>
              <h2 className="font-display text-xl font-bold text-primary">
                {i + 1}. {section.heading}
              </h2>
              <div className="mt-3 space-y-3 leading-relaxed text-slate-600">
                {section.body.map((para, j) => (
                  <p key={j} className="text-sm">{para}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
