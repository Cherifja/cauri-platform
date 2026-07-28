import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, fmt } from "../lib/api.js";
import { StarPicker } from "../components/Stars.jsx";

function nightsBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_STYLE = {
  paid: { bg: "#EAF3EE", color: "#2F6B4F", label: "Payée" },
  pending: { bg: "#F1E6D2", color: "#8A6A2F", label: "En attente de paiement" },
  failed: { bg: "#F6E4DC", color: "#C1440E", label: "Échouée" },
};

function ReviewForm({ booking, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("idle"); // idle | saving | error
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (rating === 0) {
      setError("Choisis une note avant d'envoyer ton avis.");
      return;
    }
    setError("");
    setStatus("saving");
    try {
      await api.submitReview(booking.booking_id, { rating, comment });
      onSubmitted();
    } catch (err) {
      setError(err.message || "Impossible d'envoyer l'avis.");
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 pt-4 border-t border-sandDeep flex flex-col gap-3">
      <p className="text-xs uppercase tracking-wide text-ink2">Ton avis sur ce séjour</p>
      <StarPicker value={rating} onChange={setRating} />
      <textarea
        placeholder="Raconte ton séjour (optionnel)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="px-3 py-2 rounded-xl text-sm bg-sand border border-sandDeep"
      />
      {error && <p className="text-xs text-clay">{error}</p>}
      <button
        type="submit"
        disabled={status === "saving"}
        className="self-start px-5 py-2.5 rounded-full text-xs font-medium bg-clay text-cream disabled:opacity-70"
      >
        {status === "saving" ? "Envoi…" : "Envoyer l'avis"}
      </button>
    </form>
  );
}

function BookingCard({ booking: b, canReview, isOpen, onOpenReview, justReviewed, onSubmitted }) {
  const statusStyle = STATUS_STYLE[b.status] || { bg: "#F1E6D2", color: "#666", label: b.status };
  const nights = nightsBetween(b.check_in, b.check_out);

  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-sandDeep shadow-sm">
      <div className="relative h-40">
        {b.photo_urls?.[0] ? (
          <img src={b.photo_urls[0]} alt={b.property_title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-ink to-lagoon" />
        )}
        <span
          className="absolute top-3 right-3 text-[10px] font-medium px-2.5 py-1 rounded-full shadow-sm"
          style={{ background: statusStyle.bg, color: statusStyle.color }}
        >
          {statusStyle.label}
        </span>
      </div>

      <div className="p-4">
        <Link
          to={`/logement/${b.property_id}`}
          className="text-base font-display font-semibold text-ink900 hover:underline"
        >
          {b.property_title}
        </Link>

        <div className="flex items-center gap-2 mt-1.5 text-xs text-ink2">
          <span>{formatDate(b.check_in)}</span>
          <span className="text-sandDeep">→</span>
          <span>{formatDate(b.check_out)}</span>
          <span className="text-sandDeep">·</span>
          <span>{nights} nuit{nights > 1 ? "s" : ""}</span>
        </div>

        {b.already_reviewed && (
          <p className="text-xs mt-3 text-green flex items-center gap-1">
            <span>✓</span> Avis déjà envoyé pour ce séjour
          </p>
        )}
        {justReviewed && (
          <p className="text-xs mt-3 text-green flex items-center gap-1">
            <span>✓</span> Merci pour ton avis !
          </p>
        )}

        {canReview && !isOpen && (
          <button
            onClick={onOpenReview}
            className="text-xs mt-3 px-4 py-2 rounded-full border border-clay text-clay font-medium"
          >
            ★ Laisser un avis
          </button>
        )}

        {canReview && isOpen && <ReviewForm booking={b} onSubmitted={onSubmitted} />}
      </div>
    </div>
  );
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("loading");
  const [openReviewFor, setOpenReviewFor] = useState(null);
  const [justReviewed, setJustReviewed] = useState({});

  function load() {
    api
      .myBookings()
      .then((data) => {
        setBookings(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  useEffect(load, []);

  const today = new Date();
  const upcoming = bookings.filter((b) => new Date(b.check_out) > today);
  const past = bookings.filter((b) => new Date(b.check_out) <= today);

  function renderGroup(title, items) {
    if (items.length === 0) return null;
    return (
      <div className="mb-8">
        <h2 className="text-sm uppercase tracking-wide text-ink2 mb-3">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((b) => {
            const stayEnded = new Date(b.check_out) <= today;
            const canReview =
              stayEnded && b.status === "paid" && !b.already_reviewed && !justReviewed[b.booking_id];
            return (
              <BookingCard
                key={b.booking_id}
                booking={b}
                canReview={canReview}
                isOpen={openReviewFor === b.booking_id}
                justReviewed={Boolean(justReviewed[b.booking_id])}
                onOpenReview={() => setOpenReviewFor(b.booking_id)}
                onSubmitted={() => {
                  setJustReviewed((prev) => ({ ...prev, [b.booking_id]: true }));
                  setOpenReviewFor(null);
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-full">
      <div className="px-5 md:px-8 pt-10 pb-8 bg-gradient-to-b from-ink to-ink2">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] mb-2 text-gold">Mon compte</p>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-cream">Mes réservations</h1>
        </div>
      </div>

      <div className="px-5 md:px-8 py-8 max-w-4xl mx-auto">
        {status === "loading" && <p className="text-sm text-ink2">Chargement…</p>}
        {status === "error" && (
          <p className="text-sm text-clay">Impossible de charger tes réservations.</p>
        )}

        {status === "ready" && bookings.length === 0 && (
          <div className="rounded-2xl border border-sandDeep bg-white p-8 text-center">
            <p className="text-sm text-ink900 mb-3">Tu n'as pas encore de réservation.</p>
            <Link
              to="/"
              className="inline-block px-5 py-2.5 rounded-full text-xs font-medium bg-clay text-cream"
            >
              Découvrir les logements
            </Link>
          </div>
        )}

        {renderGroup("Séjours à venir", upcoming)}
        {renderGroup("Séjours passés", past)}
      </div>
    </div>
  );
}
