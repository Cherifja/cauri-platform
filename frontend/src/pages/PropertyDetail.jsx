import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MapPreview from "../components/MapPreview.jsx";
import { StarDisplay } from "../components/Stars.jsx";
import { api, fmt, mapsDirectionsUrl } from "../lib/api.js";
import { distanceToCotonouAirportKm } from "../lib/propertyOptions.js";

export default function PropertyDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    Promise.all([api.getProperty(slug), api.getReviews(slug)])
      .then(([propertyData, reviewsData]) => {
        setProperty(propertyData);
        setReviews(reviewsData);
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
  const photos = property.photo_urls || [];

  return (
    <div className="bg-cream min-h-full">
      <div className="p-5 md:p-8 max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-xs mb-4 text-ink2">
          ← Retour
        </button>

        {photos.length > 0 ? (
          <div className="mb-4">
            <img
              src={photos[0]}
              alt={property.title}
              className="w-full h-56 md:h-80 object-cover rounded-2xl"
            />
            {photos.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                {photos.slice(1).map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`${property.title} ${i + 2}`}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden mb-4">
            <MapPreview tag={property.tag} className="h-40 md:h-72" />
          </div>
        )}

        {property.video_url && (
          <video
            src={property.video_url}
            controls
            className="w-full rounded-2xl mb-4 bg-black"
          />
        )}

        <div className="flex flex-wrap gap-2">
          <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-sand text-ink2">
            {property.tag}
          </span>
          {property.property_type && (
            <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-sand text-ink2">
              {property.property_type}
            </span>
          )}
          {property.is_verified && (
            <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-white border border-green text-green">
              ✓ Logement vérifié
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl mt-2 mb-1 font-display font-semibold text-ink900">
          {property.title}
        </h1>
        {property.review_count > 0 && (
          <div className="flex items-center gap-2 mb-1">
            <StarDisplay rating={property.avg_rating} />
            <span className="text-xs text-ink2">
              {property.avg_rating.toFixed(1)} ({property.review_count} avis)
            </span>
          </div>
        )}
        <p className="text-sm mb-1 text-ink2">
          {property.neighborhood ? `${property.neighborhood}, ` : ""}
          {property.city} · {property.guests} voyageurs · {property.beds} chambres
        </p>
        {property.landmark && (
          <p className="text-xs mb-1 text-ink2">📍 {property.landmark}</p>
        )}
        {property.lat && property.lng && (
          <p className="text-xs mb-4 text-ink2">
            ✈️ {distanceToCotonouAirportKm(property.lat, property.lng)} km de l'aéroport de Cotonou
          </p>
        )}
        <p className="text-sm leading-relaxed mb-5 text-ink900">{property.description}</p>

        {property.amenities && property.amenities.length > 0 && (
          <div className="mb-5">
            <p className="text-xs uppercase tracking-wide mb-2 text-ink2">Équipements</p>
            <div className="grid grid-cols-2 gap-2">
              {property.amenities.map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-ink900">
                  <span className="text-green">✓</span> {item}
                </div>
              ))}
            </div>
          </div>
        )}

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-xl px-4 py-3 mb-6 bg-ink text-cream"
        >
          <span className="text-sm">Ouvrir l'itinéraire dans Google Maps</span>
          <span className="text-gold">↗</span>
        </a>

        <div className="flex items-center justify-between rounded-2xl p-4 bg-white border border-sandDeep mb-8">
          <div>
            <div className="text-lg font-semibold text-clay">{fmt(property.price_per_month)}</div>
            <div className="text-xs text-ink2">par mois</div>
          </div>
          <button
            onClick={() => navigate(`/logement/${property.slug}/reserver`)}
            className="px-5 py-3 rounded-xl text-sm font-medium bg-clay text-cream"
          >
            Réserver
          </button>
        </div>

        <div>
          <h2 className="text-lg font-display font-semibold text-ink900 mb-3">
            Avis des voyageurs {reviews.length > 0 && `(${reviews.length})`}
          </h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-ink2">Aucun avis pour l'instant.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl p-4 bg-white border border-sandDeep">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-ink900">{r.traveler_name}</span>
                    <StarDisplay rating={r.rating} />
                  </div>
                  {r.comment && <p className="text-sm text-ink2">{r.comment}</p>}
                  <p className="text-[11px] text-ink2 mt-1">
                    {new Date(r.created_at).toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
