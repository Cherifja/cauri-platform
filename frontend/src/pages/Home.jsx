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
      <div className="px-5 pt-10 pb-8 bg-gradient-to-b from-ink to-ink2">
        <p className="text-xs uppercase tracking-[0.2em] mb-2 text-gold">
          Réservez • Payez • Arrivez seul
        </p>
        <h1 className="text-3xl leading-tight mb-3 font-display font-semibold text-cream">
          Votre logement au Bénin, trouvé et payé avant le décollage.
        </h1>
        <p className="text-sm text-sandDeep">
          Chaque annonce inclut un itinéraire Google Maps précis jusqu'à la porte.
        </p>
      </div>

      <PaymentMethods />

      <div className="px-5 py-6">
        <h2 className="text-lg mb-4 font-display font-semibold text-ink900">
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

        <div className="flex flex-col gap-4">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
