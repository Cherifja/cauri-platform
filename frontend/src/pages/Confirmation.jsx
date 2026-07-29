import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { fmt, mapsDirectionsUrl } from "../lib/api.js";
import { useAuth } from "../lib/AuthContext.jsx";

function formatDate(d) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function Confirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!state || !state.property || !state.order) {
    return <Navigate to="/" replace />;
  }

  const { property, order } = state;
  const mapsUrl = mapsDirectionsUrl(property.lat, property.lng);

  const whatsappUrl = property.owner_whatsapp
    ? (() => {
        const message =
          `Bonjour ${property.owner_name}, je viens de réserver "${property.title}" sur Cauri.\n` +
          `Arrivée : ${formatDate(order.checkIn)}\n` +
          `Départ : ${formatDate(order.checkOut)}\n` +
          `Voyageur : ${user?.name || ""}\n\n` +
          `Pouvons-nous organiser la remise des clés ?`;
        return `https://wa.me/${property.owner_whatsapp}?text=${encodeURIComponent(message)}`;
      })()
    : null;

  return (
    <div className="p-5 max-w-2xl mx-auto bg-cream min-h-full">
      <div className="rounded-2xl p-5 mb-5 text-center bg-ink">
        <div className="text-3xl mb-2">✓</div>
        <h1 className="text-xl mb-1 font-display font-semibold text-cream">
          Réservation confirmée
        </h1>
        <p className="text-xs text-sandDeep">
          Paiement de {fmt(order.amountTotal)} vérifié auprès de Kkiapay
        </p>
      </div>

      <div className="rounded-2xl p-4 mb-4 bg-white border border-sandDeep">
        <p className="text-sm font-medium mb-1 text-ink900">{property.title}</p>
        <p className="text-xs mb-3 text-ink2">{property.city}</p>
        <div className="flex items-center justify-between text-xs pt-2 border-t border-sandDeep">
          <span className="text-ink2">Reversé à {property.owner_name}</span>
          <span className="font-semibold text-green">{fmt(order.payoutDueToOwner)}</span>
        </div>
      </div>

      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-xl px-4 py-3 mb-3"
          style={{ background: "#25D366", color: "#0B1626" }}
        >
          <span className="text-sm font-medium">
            Contacter {property.owner_name} sur WhatsApp pour les clés
          </span>
          <span>↗</span>
        </a>
      ) : (
        <p className="text-xs mb-3 text-ink2 bg-white border border-sandDeep rounded-xl p-3">
          {property.owner_name} n'a pas encore renseigné de numéro WhatsApp — retrouve tes
          réservations dans "Mes réservations" pour le contacter autrement le moment venu.
        </p>
      )}

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between rounded-xl px-4 py-3 mb-3 bg-ink text-cream"
      >
        <span className="text-sm">Lancer l'itinéraire vers le logement</span>
        <span className="text-gold">↗</span>
      </a>

      <button
        onClick={() => navigate("/")}
        className="w-full py-3 rounded-xl text-sm font-medium bg-sand text-ink900"
      >
        Retour à l'accueil
      </button>
    </div>
  );
}
