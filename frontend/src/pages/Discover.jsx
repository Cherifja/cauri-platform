const TOURISM_HIGHLIGHTS = [
  { name: "Ganvié", desc: "La \"Venise de l'Afrique\", cité lacustre sur pilotis." },
  { name: "Route des Pêches", desc: "Bord de mer entre Cotonou et Ouidah, restaurants et plages." },
  { name: "Ouidah", desc: "Route des Esclaves, temples vaudou et patrimoine historique." },
  { name: "Grand-Popo", desc: "Plages calmes et embouchure du fleuve Mono." },
  { name: "Parc national de la Pendjari", desc: "Safari et faune sauvage, au nord du pays." },
];

export default function Discover() {
  return (
    <div className="bg-cream min-h-full">
      <div className="px-5 md:px-8 pt-10 pb-8 bg-gradient-to-b from-ink to-ink2">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] mb-2 text-gold">À découvrir</p>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-cream">
            Le Bénin autour de votre séjour
          </h1>
        </div>
      </div>

      <div className="px-5 md:px-8 py-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TOURISM_HIGHLIGHTS.map((h) => (
            <div key={h.name} className="rounded-xl p-4 bg-white border border-sandDeep">
              <p className="text-sm font-medium mb-1 text-ink900">{h.name}</p>
              <p className="text-xs text-ink2">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
