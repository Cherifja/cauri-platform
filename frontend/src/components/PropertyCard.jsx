import { Link } from "react-router-dom";
import MapPreview from "./MapPreview.jsx";
import { StarDisplay } from "./Stars.jsx";
import { fmt } from "../lib/api.js";

export default function PropertyCard({ property }) {
  const coverPhoto = property.photo_urls?.[0];
  return (
    <Link
      to={`/logement/${property.slug}`}
      className="text-left rounded-2xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform block bg-white border border-sandDeep"
    >
      {coverPhoto ? (
        <img src={coverPhoto} alt={property.title} className="w-full h-40 object-cover" />
      ) : (
        <MapPreview tag={property.tag} />
      )}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-sand text-ink2">
            {property.tag}
          </span>
          <span className="text-sm font-semibold text-clay">
            {fmt(property.price_per_month)}
            <span className="text-xs font-normal text-ink2"> / mois</span>
          </span>
        </div>
        <h3 className="mt-2 text-base font-display font-semibold text-ink900">{property.title}</h3>
        <p className="text-xs mt-1 text-ink2">
          {property.neighborhood ? `${property.neighborhood}, ` : ""}
          {property.city} · {property.guests} voyageurs · {property.beds} chambres
        </p>
        {property.review_count > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <StarDisplay rating={property.avg_rating} size="text-xs" />
            <span className="text-xs text-ink2">({property.review_count})</span>
          </div>
        )}
      </div>
    </Link>
  );
}
