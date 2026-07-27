import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, fmt } from "../lib/api.js";
import { StarPicker } from "../components/Stars.jsx";

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
    <form onSubmit={submit} className="mt-3 pt-3 border-t border-sandDeep flex flex-col gap-2">
      <StarPicker value={rating} onChange={setRating} />
      <textarea
        placeholder="Ton avis (optionnel)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        className="px-3 py-2 rounded-lg text-sm bg-sand"
      />
      {error && <p className="text-xs text-clay">{error}</p>}
      <button
        type="submit"
        disabled={status === "saving"}
        className="self-start px-4 py-2 rounded-lg text-xs font-medium bg-clay text-cream disabled:opacity-70"
      >
        {status === "saving" ? "Envoi…" : "Envoyer l'avis"}
      </button>
    </form>
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

  return (
    <div className="bg-cream min-h-full">
      <div className="px-5 pt-10 pb-8 bg-gradient-to-b from-ink to-ink2">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] mb-2 text-gold">Mon compte</p>
          <h1 className="text-2xl font-display font-semibold text-cream">Mes réservations</h1>
        </div>
      </div>

      <div className="px-5 py-6 max-w-2xl mx-auto">
        {status === "loading" && <p className="text-sm text-ink2">Chargement…</p>}
        {status === "error" && <p className="text-sm text-clay">Impossible de charger tes réservations.</p>}
        {status === "ready" && bookings.length === 0 && (
          <p className="text-sm text-ink2">
            Tu n'as pas encore de réservation.{" "}
            <Link to="/" className="underline">
              Découvrir les logements
            </Link>
          </p>
        )}

        <div className="flex flex-col gap-3">
          {bookings.map((b) => {
            const stayEnded = new Date(b.check_out) <= today;
            const canReview = stayEnded && b.status === "paid" && !b.already_reviewed && !justReviewed[b.booking_id];

            return (
              <div key={b.booking_id} className="rounded-2xl p-4 bg-white border border-sandDeep">
                <div className="flex items-center gap-3">
                  {b.photo_urls?.[0] ? (
                    <img
                      src={b.photo_urls[0]}
                      alt={b.property_title}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-lagoon flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link to={`/logement/${b.property_id}`} className="text-sm font-medium text-ink900 hover:underline">
                      {b.property_title}
                    </Link>
                    <p className="text-xs text-ink2">
                      {new Date(b.check_in).toLocaleDateString("fr-FR")} → {new Date(b.check_out).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span
                    className="text-[10px] px-2 py-1 rounded-full flex-shrink-0"
                    style={{
                      background: b.status === "paid" ? "#F1E6D2" : "#E4D2B2",
                      color: b.status === "paid" ? "#2F6B4F" : "#666",
                    }}
                  >
                    {b.status === "paid" ? "Payée" : b.status === "pending" ? "En attente" : b.status}
                  </span>
                </div>

                {b.already_reviewed && (
                  <p className="text-xs mt-2 text-green">✓ Tu as déjà laissé un avis pour ce séjour.</p>
                )}
                {justReviewed[b.booking_id] && (
                  <p className="text-xs mt-2 text-green">✓ Avis envoyé, merci !</p>
                )}

                {canReview && openReviewFor !== b.booking_id && (
                  <button
                    onClick={() => setOpenReviewFor(b.booking_id)}
                    className="text-xs mt-2 underline text-ink2"
                  >
                    Laisser un avis
                  </button>
                )}

                {canReview && openReviewFor === b.booking_id && (
                  <ReviewForm
                    booking={b}
                    onSubmitted={() => {
                      setJustReviewed((prev) => ({ ...prev, [b.booking_id]: true }));
                      setOpenReviewFor(null);
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
