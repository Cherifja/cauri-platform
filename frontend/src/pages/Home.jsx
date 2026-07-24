import { useEffect, useState } from "react";
import PropertyCard from "../components/PropertyCard.jsx";
import PaymentMethods from "../components/PaymentMethods.jsx";
import { api } from "../lib/api.js";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    api
      .listProperties()
      .then((data) => {
        setProperties(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

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
            Impossible de joindre le serveur. Vérifie que le backend tourne sur{" "}
            <code>localhost:4000</code>.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
