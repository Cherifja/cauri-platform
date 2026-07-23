import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MapPreview from "../components/MapPreview.jsx";
import { api, fmt, mapsDirectionsUrl } from "../lib/api.js";

export default function PropertyDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    api
      .getProperty(slug)
      .then((data) => {
        setProperty(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [slug]);

  if (status === "loading") return <p className="p-5 text-sm text-ink2">Chargement…</p>;
  if (status === "error" || !property)
    return (
      <div className="p-5">
        <p className="text-sm text-clay mb-3">Logement introuvable.</p>
        <Link to="/" className="text-sm text-ink2 underline">
          Retour à l'accueil
        </Link>
      </div>
    );

  const mapsUrl = mapsDirectionsUrl(property.lat, property.lng);

  return (
    <div className="bg-cream min-h-full">
      <div className="p-5">
        <button onClick={() => navigate(-1)} className="text-xs mb-4 text-ink2">
          ← Retour
        </button>
        <div className="rounded-2xl overflow-hidden mb-4">
          <MapPreview tag={property.tag} />
        </div>
        <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-sand text-ink2">
          {property.tag}
        </span>
        <h1 className="text-2xl mt-2 mb-1 font-display font-semibold text-ink900">
          {property.title}
        </h1>
        <p className="text-sm mb-4 text-ink2">
          {property.city} · {property.guests} voyageurs · {property.beds} chambres
        </p>
        <p className="text-sm leading-relaxed mb-5 text-ink900">{property.description}</p>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-xl px-4 py-3 mb-6 bg-ink text-cream"
        >
          <span className="text-sm">Ouvrir l'itinéraire dans Google Maps</span>
          <span className="text-gold">↗</span>
        </a>

        <div className="flex items-center justify-between rounded-2xl p-4 bg-white border border-sandDeep">
          <div>
            <div className="text-lg font-semibold text-clay">{fmt(property.price_per_night)}</div>
            <div className="text-xs text-ink2">par nuit</div>
          </div>
          <button
            onClick={() => navigate(`/logement/${property.slug}/reserver`)}
            className="px-5 py-3 rounded-xl text-sm font-medium bg-clay text-cream"
          >
            Réserver
          </button>
        </div>
      </div>
    </div>
  );
}
