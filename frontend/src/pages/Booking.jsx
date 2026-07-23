import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, fmt, splitCommission } from "../lib/api.js";

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

function nightsBetween(checkIn, checkOut) {
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

// Un intervalle [checkIn, checkOut) chevauche une plage bloquée si les
// bornes se croisent ; check_out est exclusif, donc arriver le jour du
// départ d'une autre réservation est autorisé.
function overlapsBlocked(checkIn, checkOut, blockedRanges) {
  return blockedRanges.some((b) => checkIn < b.checkOut && b.checkIn < checkOut);
}

export default function Booking() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [blockedRanges, setBlockedRanges] = useState([]);
  const today = useMemo(() => toISODate(new Date()), []);
  const [checkIn, setCheckIn] = useState(addDays(today, 1));
  const [checkOut, setCheckOut] = useState(addDays(today, 4));
  const [status, setStatus] = useState("loading"); // loading | ready | paying | error
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    Promise.all([api.getProperty(slug), api.getAvailability(slug)])
      .then(([propertyData, availabilityData]) => {
        setProperty(propertyData);
        setBlockedRanges(availabilityData.blockedRanges);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [slug]);

  // Écoute globale du widget Kkiapay : le succès annoncé côté client n'est
  // qu'une indication. La confirmation réelle vient de confirmBooking, qui
  // revérifie la transaction auprès de Kkiapay avant de valider quoi que ce soit.
  useEffect(() => {
    function onSuccess(response) {
      const bookingId = window.__pendingBookingId;
      if (!bookingId) return;
      api
        .confirmBooking(bookingId, response.transactionId)
        .then((order) => {
          navigate(`/confirmation`, { state: { property, order } });
        })
        .catch((err) => {
          console.error(err);
          setStatus("error");
        });
    }
    function onFailed() {
      setStatus("ready");
    }
    if (window.addSuccessListener) window.addSuccessListener(onSuccess);
    if (window.addFailedListener) window.addFailedListener(onFailed);
  }, [property, navigate]);

  if (status === "loading") return <p className="p-5 text-sm text-ink2">Chargement…</p>;
  if (!property)
    return (
      <div className="p-5">
        <p className="text-sm text-clay mb-3">Logement introuvable.</p>
        <Link to="/" className="text-sm text-ink2 underline">
          Retour à l'accueil
        </Link>
      </div>
    );

  const nights = nightsBetween(checkIn, checkOut);
  const validRange = nights > 0;
  const conflict = validRange && overlapsBlocked(checkIn, checkOut, blockedRanges);
  const total = validRange ? property.price_per_night * nights : 0;
  const preview = splitCommission(total);

  function handleCheckInChange(value) {
    setCheckIn(value);
    if (value >= checkOut) {
      setCheckOut(addDays(value, 1));
    }
  }

  async function startPayment() {
    if (!validRange) {
      setDateError("La date de départ doit être après la date d'arrivée.");
      return;
    }
    if (conflict) {
      setDateError("Ces dates ne sont plus disponibles pour ce logement.");
      return;
    }
    setDateError("");
    setStatus("paying");
    try {
      const { bookingId, amountTotal, publicKey } = await api.initiateBooking({
        propertyId: property.slug,
        checkIn,
        checkOut,
      });

      if (typeof window.openKkiapayWidget !== "function") {
        throw new Error("Widget Kkiapay non chargé");
      }
      window.__pendingBookingId = bookingId;
      window.openKkiapayWidget({
        amount: amountTotal,
        key: publicKey,
        sandbox: true, // passer à false en production
        data: bookingId,
      });
      setStatus("ready");
    } catch (err) {
      // Le backend renvoie 409 si les dates viennent d'être prises par
      // quelqu'un d'autre entre l'affichage de la page et le clic.
      if (err.message && err.message.includes("disponibles")) {
        setDateError(err.message);
        api.getAvailability(slug).then((data) => setBlockedRanges(data.blockedRanges));
      } else {
        console.error(err);
        setStatus("error");
      }
    }
  }

  return (
    <div className="bg-cream min-h-full">
      <div className="p-5">
        <button onClick={() => navigate(-1)} className="text-xs mb-4 text-ink2">
          ← Retour
        </button>
        <h1 className="text-xl mb-4 font-display font-semibold text-ink900">
          Confirmer et payer
        </h1>

        <div className="rounded-2xl p-4 mb-4 bg-white border border-sandDeep">
          <div className="text-sm font-medium mb-3 text-ink900">{property.title}</div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <label className="block">
              <span className="text-[11px] uppercase tracking-wide text-ink2">Arrivée</span>
              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => handleCheckInChange(e.target.value)}
                className="mt-1 w-full px-2 py-2 rounded-lg text-sm bg-sand text-ink900"
              />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-wide text-ink2">Départ</span>
              <input
                type="date"
                min={addDays(checkIn, 1)}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="mt-1 w-full px-2 py-2 rounded-lg text-sm bg-sand text-ink900"
              />
            </label>
          </div>

          {!validRange && (
            <p className="text-xs text-clay mb-2">La date de départ doit être après l'arrivée.</p>
          )}
          {validRange && conflict && (
            <p className="text-xs text-clay mb-2">
              Ces dates chevauchent une réservation existante — essayez une autre période.
            </p>
          )}
          {validRange && !conflict && (
            <p className="text-xs text-ink2 mb-2">{nights} nuit{nights > 1 ? "s" : ""}</p>
          )}

          <div className="flex items-center justify-between text-sm pt-2 border-t border-sandDeep">
            <span className="text-ink2">Total payé par le voyageur</span>
            <span className="font-semibold text-clay">{fmt(total)}</span>
          </div>
        </div>

        <div className="rounded-2xl p-4 mb-5 bg-sand">
          <p className="text-[11px] uppercase tracking-wide mb-2 text-ink2">
            Répartition automatique (calculée côté serveur)
          </p>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-ink900">Commission plateforme (12%)</span>
            <span className="text-ink900">{fmt(preview.commission)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink900">Reversé à {property.owner_name}</span>
            <span className="font-semibold text-green">{fmt(preview.payout)}</span>
          </div>
        </div>

        {dateError && <p className="text-xs mb-3 text-clay">{dateError}</p>}
        {status === "error" && (
          <p className="text-xs mb-3 text-clay">
            Impossible de joindre le backend. Vérifie que le serveur tourne sur{" "}
            <code>localhost:4000</code>.
          </p>
        )}

        <button
          onClick={startPayment}
          disabled={status === "paying" || !validRange || conflict}
          className="w-full py-4 rounded-xl text-sm font-medium bg-clay text-cream disabled:opacity-50"
        >
          {status === "paying" ? "Ouverture du paiement…" : `Payer ${fmt(total)} avec Kkiapay`}
        </button>
      </div>
    </div>
  );
}
