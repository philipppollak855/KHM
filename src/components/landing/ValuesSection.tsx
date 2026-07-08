import { Leaf, Hand, Mountain } from "lucide-react";

const values = [
  {
    icon: Leaf,
    number: "01",
    title: "Reine Materialien",
    text: "Holz aus heimischen Wäldern, Wolle von regionalen Höfen — nur was die Natur uns gibt und was wir mit gutem Gewissen verarbeiten.",
  },
  {
    icon: Hand,
    number: "02",
    title: "Handwerkliche Präzision",
    text: "Jede Schnitzung, jeder Stich wird von Hand gesetzt. Unregelmäßigkeiten sind kein Fehler, sondern das Zeichen echter Arbeit.",
  },
  {
    icon: Mountain,
    number: "03",
    title: "Heimat & Herkunft",
    text: "Das Schneebergland prägt unsere Formen, Farben und unseren Rhythmus. Was wir schaffen, trägt die Seele dieser Landschaft.",
  },
];

export default function ValuesSection() {
  return (
    <section className="py-28 md:py-36 bg-wood-dark text-linen relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] wood-texture" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-wheat/30 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <p className="section-label text-wheat/80 mb-5">Was uns leitet</p>
          <h2 className="font-display text-4xl md:text-5xl font-light leading-tight">
            Werte, die man <span className="italic">spürt</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-wheat/10">
          {values.map(({ icon: Icon, number, title, text }) => (
            <div
              key={title}
              className="bg-wood-dark p-10 md:p-12 group hover:bg-[#332820] transition-colors duration-500"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-5xl font-light text-wheat/20 group-hover:text-wheat/30 transition-colors">
                  {number}
                </span>
                <Icon className="w-5 h-5 text-wheat/60" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-2xl font-light mb-4">{title}</h3>
              <p className="text-linen/55 leading-relaxed text-[15px]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
