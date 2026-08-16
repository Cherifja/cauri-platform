import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, fmt, splitCommission } from "../lib/api.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { useLanguage } from "../lib/LanguageContext.jsx";

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

// Même logique que côté serveur (addMonths dans server.js) : gère
// correctement les fins de mois irrégulières (31 janvier + 1 mois =
// 28/29 février, pas le 3 mars). Sert uniquement à un aperçu local ; le
// vrai calcul, qui fait foi, est toujours refait côté serveur.
function addMonths(isoDate, months) {
  const d = new Date(isoDate + "T00:00:00Z");
  const targetMonth = d.getUTCMonth() + months;
  const result = new Date(Date.UTC(d.getUTCFullYear(), targetMonth, 1));
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(d.getUTCDate(), lastDay));
  return toISODate(result);
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
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [property, setProperty] = useState(null);
  const [blockedRanges, setBlockedRanges] = useState([]);
  const today = useMemo(() => toISODate(new Date()), []);
  const [checkIn, setCheckIn] = useState(addDays(today, 1));
  const [months, setMonths] = useState(1);
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

  if (status === "loading") return <p className="p-5 text-sm text-ink2">{t("property.loading")}</p>;
  if (!property)
    return (
      <div className="p-5 max-w-2xl mx-auto">
        <p className="text-sm text-clay mb-3">{t("property.notFound")}</p>
        <Link to="/" className="text-sm text-ink2 underline">
          {t("property.backHome")}
        </Link>
      </div>
    );

  const checkOut = addMonths(checkIn, months);
  const conflict = overlapsBlocked(checkIn, checkOut, blockedRanges);
  const total = property.price_per_month * months;
  const preview = splitCommission(total);
  const locale = lang === "en" ? "en-US" : "fr-FR";

  async function startPayment() {
    if (conflict) {
      setDateError(t("booking.conflict"));
      return;
    }
    setDateError("");
    setStatus("paying");
    try {
      const { bookingId, amountTotal, publicKey, sandbox } = await api.initiateBooking({
        propertyId: property.slug,
        checkIn,
        months,
      });

      if (typeof window.openKkiapayWidget !== "function") {
        throw new Error("Widget Kkiapay non chargé");
      }
      window.__pendingBookingId = bookingId;
      window.openKkiapayWidget({
        amount: amountTotal,
        key: publicKey,
        sandbox, // suit automatiquement KKIAPAY_SANDBOX défini sur le backend
        data: bookingId,
      });
      setStatus("ready");
    } catch (err) {
      // Le backend renvoie 409 si la période vient d'être prise par
      // quelqu'un d'autre entre l'affichage de la page et le clic.
      if (err.message && (err.message.includes("disponible") || err.message.includes("available"))) {
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
      <div className="p-5 max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-xs mb-4 text-ink2">
          ← {t("property.back")}
        </button>
        <h1 className="text-xl mb-1 font-display font-semibold text-ink900">{t("booking.title")}</h1>
        {user && (
          <p className="text-xs mb-4 text-ink2">
            {t("booking.loggedInAs")} <strong>{user.name}</strong> ({user.email})
          </p>
        )}

        <div className="rounded-2xl p-4 mb-4 bg-white border border-sandDeep">
          <div className="text-sm font-medium mb-3 text-ink900">{property.title}</div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <label className="block">
              <span className="text-[11px] uppercase tracking-wide text-ink2">{t("booking.checkIn")}</span>
              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="mt-1 w-full px-2 py-2 rounded-lg text-sm bg-sand text-ink900"
              />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-wide text-ink2">{t("booking.duration")}</span>
              <div className="mt-1 flex items-center gap-2 bg-sand rounded-lg px-2 py-2">
                <button
                  type="button"
                  onClick={() => setMonths((m) => Math.max(1, m - 1))}
                  className="w-6 h-6 rounded-full bg-white text-ink900 text-sm"
                >
                  −
                </button>
                <span className="flex-1 text-center text-sm text-ink900">
                  {months} {t("booking.months")}
                </span>
                <button
                  type="button"
                  onClick={() => setMonths((m) => Math.min(24, m + 1))}
                  className="w-6 h-6 rounded-full bg-white text-ink900 text-sm"
                >
                  +
                </button>
              </div>
            </label>
          </div>

          <p className="text-xs text-ink2 mb-2">
            {t("booking.dateRange")
              .replace("{start}", new Date(checkIn).toLocaleDateString(locale))
              .replace("{end}", new Date(checkOut).toLocaleDateString(locale))}
          </p>

          {conflict && <p className="text-xs text-clay mb-2">{t("booking.conflict")}</p>}

          <div className="flex items-center justify-between text-sm pt-2 border-t border-sandDeep">
            <span className="text-ink2">{t("booking.total")}</span>
            <span className="font-semibold text-clay">{fmt(total)}</span>
          </div>
        </div>

        <div className="rounded-2xl p-4 mb-5 bg-sand">
          <p className="text-[11px] uppercase tracking-wide mb-2 text-ink2">{t("booking.breakdown")}</p>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-ink900">{t("booking.commission")}</span>
            <span className="text-ink900">{fmt(preview.commission)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink900">
              {t("booking.payout")} {property.owner_name}
            </span>
            <span className="font-semibold text-green">{fmt(preview.payout)}</span>
          </div>
        </div>

        {dateError && <p className="text-xs mb-3 text-clay">{dateError}</p>}
        {status === "error" && (
          <p className="text-xs mb-3 text-clay">{t("booking.backendError")}</p>
        )}

        <button
          onClick={startPayment}
          disabled={status === "paying" || conflict}
          className="w-full py-4 rounded-xl text-sm font-medium bg-clay text-cream disabled:opacity-50"
        >
          {status === "paying"
            ? t("booking.opening")
            : `${t("booking.pay")} ${fmt(total)} ${t("booking.withKkiapay")}`}
        </button>
      </div>
    </div>
  );
}
