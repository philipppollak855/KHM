const steps = [
  {
    step: "Auswahl",
    title: "Materialien mit Geschichte",
    text: "Jedes Holz, jede Faser wird bewusst ausgewählt — oft direkt aus der Umgebung des Schneeberglandes.",
  },
  {
    step: "Entstehung",
    title: "Handwerk in der Werkstatt",
    text: "In ruhiger Atmosphäre formen wir jedes Stück mit traditionellen Techniken und modernem Auge für Form.",
  },
  {
    step: "Vollendung",
    title: "Pflege & Übergabe",
    text: "Natürliche Öle, sorgfältige Verpackung — bis das Unikat bereit ist, ein neues Zuhause zu finden.",
  },
];

export default function CraftSection() {
  return (
    <section className="py-28 md:py-36 bg-linen-dark/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <p className="section-label text-bark mb-5">Der Weg zum Unikat</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-wood-dark leading-tight">
            Vom Rohstoff zum
            <br />
            <span className="italic">fertigen Stück</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {steps.map((item, i) => (
            <div key={item.step} className="relative text-center md:text-left">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(100%+1rem)] w-[calc(100%-2rem)] h-px bg-gradient-to-r from-wheat/40 to-transparent" />
              )}
              <p className="text-[10px] tracking-[0.35em] uppercase text-wheat mb-4">
                {item.step}
              </p>
              <h3 className="font-display text-2xl font-light text-wood-dark mb-4">
                {item.title}
              </h3>
              <p className="text-stone leading-relaxed text-[15px]">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
