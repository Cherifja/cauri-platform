import { useState } from "react";

const TOURISM_HIGHLIGHTS = [
  {
    name: "Ganvié",
    desc: "La \"Venise de l'Afrique\", cité lacustre sur pilotis.",
    detail:
      "Bâti entièrement sur l'eau au milieu du lac Nokoué, Ganvié se visite en pirogue, souvent au lever du soleil quand les pêcheurs relèvent leurs filets. On y découvre des maisons sur pilotis, un marché flottant animé, et un mode de vie unique en Afrique de l'Ouest, fondé il y a plusieurs siècles pour échapper aux razzias terrestres. Compte une demi-journée pour une visite tranquille en pirogue.",
  },
  {
    name: "Route des Pêches",
    desc: "Bord de mer entre Cotonou et Ouidah, restaurants et plages.",
    detail:
      "Cette route longe l'océan Atlantique sur une vingtaine de kilomètres entre Cotonou et Ouidah. On y trouve des plages de sable, des restaurants et bars en bord de mer, ainsi que quelques hôtels et résidences. C'est l'endroit privilégié pour une balade en fin de journée, un repas les pieds dans le sable, ou simplement se détendre après un séjour en ville.",
  },
  {
    name: "Ouidah",
    desc: "Route des Esclaves, temples vaudou et patrimoine historique.",
    detail:
      "Ville chargée d'histoire, Ouidah est considérée comme le berceau du culte vaudou au Bénin. La Route des Esclaves relie le centre-ville à la Porte du Non-Retour, sur la plage, en mémoire de la traite négrière. On y visite aussi le temple des pythons, le musée d'histoire, et la basilique. Une étape culturelle incontournable, facilement accessible depuis Cotonou.",
  },
  {
    name: "Grand-Popo",
    desc: "Plages calmes et embouchure du fleuve Mono.",
    detail:
      "Plus tranquille que la Route des Pêches, Grand-Popo offre de longues plages peu fréquentées, idéales pour se reposer. On peut y faire une excursion en pirogue sur le fleuve Mono jusqu'à son embouchure, découvrir des villages de pêcheurs, et profiter d'un cadre plus authentique et nature, à environ une heure et demie de Cotonou.",
  },
  {
    name: "Parc national de la Pendjari",
    desc: "Safari et faune sauvage, au nord du pays.",
    detail:
      "Situé à l'extrême nord du Bénin, la Pendjari est l'une des dernières grandes réserves de faune sauvage d'Afrique de l'Ouest : éléphants, lions, buffles, antilopes et de nombreuses espèces d'oiseaux. Les safaris se font généralement en 4x4 tôt le matin ou en fin de journée. C'est un voyage plus long depuis Cotonou (prévoir plusieurs jours), mais unique dans la région.",
  },
];

export default function Discover() {
  const [openItem, setOpenItem] = useState(null);

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
          {TOURISM_HIGHLIGHTS.map((h) => {
            const isOpen = openItem === h.name;
            return (
              <button
                key={h.name}
                onClick={() => setOpenItem(isOpen ? null : h.name)}
                className="text-left rounded-xl p-4 bg-white border border-sandDeep"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink900">{h.name}</p>
                  <span className="text-ink2 text-xs">{isOpen ? "−" : "+"}</span>
                </div>
                <p className="text-xs mt-1 text-ink2">{h.desc}</p>
                {isOpen && (
                  <p className="text-xs mt-3 pt-3 border-t border-sandDeep leading-relaxed text-ink900">
                    {h.detail}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
