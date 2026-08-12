import { useEffect, useMemo, useState } from "react";
import PropertyCard from "../components/PropertyCard.jsx";
import PaymentMethods from "../components/PaymentMethods.jsx";
import { api } from "../lib/api.js";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [selectedCity, setSelectedCity] = useState(""); // "" = toutes les villes
  const [neighborhoodQuery, setNeighborhoodQuery] = useState("");

  useEffect(() => {
    api
      .listProperties()
      .then((data) => {
        setProperties(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  const cities = useMemo(() => {
    const unique = [...new Set(properties.map((p) => p.city))];
    return unique.sort((a, b) => a.localeCompare(b, "fr"));
  }, [properties]);

  const filteredProperties = properties.filter((p) => {
    const matchesCity = !selectedCity || p.city === selectedCity;
    const q = neighborhoodQuery.trim().toLowerCase();
    const matchesNeighborhood =
      !q ||
      (p.neighborhood && p.neighborhood.toLowerCase().includes(q)) ||
      p.title.toLowerCase().includes(q);
    return matchesCity && matchesNeighborhood;
  });

  return (
    <div>
      <div className="bg-gradient-to-b from-ink to-ink2">
        <div className="px-5 md:px-8 pt-10 md:pt-16 pb-8 md:pb-14 max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] mb-2 text-gold">
            Réservez • Payez • Arrivez seul
          </p>
          <h1 className="text-3xl md:text-5xl leading-tight mb-3 font-display font-semibold text-cream md:max-w-2xl">
            Votre logement au Bénin, trouvé et payé avant le décollage.
          </h1>
          <p className="text-sm md:text-base text-sandDeep md:max-w-lg">
            Chaque annonce inclut un itinéraire Google Maps précis jusqu'à la porte.
          </p>
        </div>
      </div>

      <PaymentMethods />

      <div className="px-5 md:px-8 py-6 md:py-12 max-w-6xl mx-auto">
        <h2 className="text-lg md:text-2xl mb-4 md:mb-6 font-display font-semibold text-ink900">
          Logements disponibles
        </h2>

        {status === "loading" && (
          <p className="text-sm text-ink2">Chargement des logements…</p>
        )}
        {status === "error" && (
          <p className="text-sm text-clay">
            Impossible de joindre le serveur pour le moment. Réessaie dans un instant.
          </p>
        )}

        {status === "ready" && (
          <input
            type="text"
            placeholder="Rechercher un quartier (ex. Akpakpa, Fidjrossè, Cadjèhoun…)"
            value={neighborhoodQuery}
            onChange={(e) => setNeighborhoodQuery(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-xl text-sm bg-white border border-sandDeep"
          />
        )}

        {status === "ready" && cities.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-5">
            <button
              onClick={() => setSelectedCity("")}
              className={`text-xs px-4 py-2 rounded-full border ${
                selectedCity === ""
                  ? "bg-ink text-cream border-ink"
                  : "bg-white text-ink2 border-sandDeep"
              }`}
            >
              Toutes les villes
            </button>
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`text-xs px-4 py-2 rounded-full border ${
                  selectedCity === city
                    ? "bg-ink text-cream border-ink"
                    : "bg-white text-ink2 border-sandDeep"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        )}

        {status === "ready" && filteredProperties.length === 0 && (
          <p className="text-sm text-ink2">Aucun logement ne correspond à cette recherche pour le moment.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredProperties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </div>

      <div className="bg-ink">
        <div className="px-5 md:px-8 py-10 md:py-14 max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] mb-2 text-gold">Confiance</p>
          <h2 className="text-xl md:text-2xl mb-6 font-display font-semibold text-cream">
            Réserver l'esprit tranquille
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium mb-1 text-cream">Logements vérifiés</p>
              <p className="text-xs text-sandDeep">
                Chaque annonce est publiée par un propriétaire identifié sur la plateforme.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1 text-cream">Prix transparents</p>
              <p className="text-xs text-sandDeep">
                Le montant affiché est le montant payé, sans frais cachés à l'arrivée.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1 text-cream">Assistance disponible</p>
              <p className="text-xs text-sandDeep">
                Contact WhatsApp direct avec le propriétaire dès la réservation confirmée.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
