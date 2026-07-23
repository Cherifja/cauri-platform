import { useEffect, useState } from "react";
import { api, fmt } from "../lib/api.js";
import { useAuth } from "../lib/AuthContext.jsx";

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("annonces");
  const [properties, setProperties] = useState([]);
  const [balance, setBalance] = useState(null);
  const [form, setForm] = useState({ title: "", city: "", price: "", guests: 2, beds: 1, desc: "" });
  const [submitting, setSubmitting] = useState(false);
  const [momoNumber, setMomoNumber] = useState("");
  const [momoStatus, setMomoStatus] = useState(""); // "" | "saving" | "saved" | "error"

  function loadProperties() {
    api.ownerProperties().then(setProperties).catch(() => {});
  }

  useEffect(() => {
    loadProperties();
    api.ownerBalance().then(setBalance).catch(() => {});
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (!form.title || !form.city || !form.price) return;
    setSubmitting(true);
    try {
      await api.createProperty({
        title: form.title,
        city: form.city,
        pricePerNight: Number(form.price),
        guests: Number(form.guests),
        beds: Number(form.beds),
        description: form.desc,
      });
      setForm({ title: "", city: "", price: "", guests: 2, beds: 1, desc: "" });
      loadProperties();
      setTab("annonces");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function saveMomo(e) {
    e.preventDefault();
    setMomoStatus("saving");
    try {
      await api.saveMobileMoneyNumber(momoNumber);
      setMomoStatus("saved");
    } catch (err) {
      setMomoStatus("error");
    }
  }

  return (
    <div className="bg-cream min-h-full">
      <div className="px-5 pt-8 pb-6 bg-gradient-to-b from-ink to-ink2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] mb-2 text-gold">Espace propriétaire</p>
            <h1 className="text-2xl mb-1 font-display font-semibold text-cream">
              Bienvenue, {user?.name}
            </h1>
          </div>
          <button onClick={logout} className="text-xs text-sandDeep underline mt-1">
            Déconnexion
          </button>
        </div>
        <p className="text-xs text-sandDeep">
          Commission plateforme : 12% prélevée automatiquement sur chaque réservation payée.
        </p>
      </div>

      <div className="flex px-5 gap-2 mt-4 mb-2">
        {[
          { id: "annonces", label: "Mes annonces" },
          { id: "revenus", label: "Revenus" },
          { id: "ajouter", label: "+ Ajouter" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-xs px-3 py-2 rounded-full ${
              tab === t.id ? "bg-clay text-cream" : "bg-sand text-ink2"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "annonces" && (
        <div className="px-5 py-4 flex flex-col gap-3">
          {properties.length === 0 && (
            <p className="text-sm text-ink2">Aucune annonce publiée pour le moment.</p>
          )}
          {properties.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl p-4 flex items-center gap-3 bg-white border border-sandDeep"
            >
              <div className="w-14 h-14 rounded-xl flex-shrink-0 bg-lagoon" />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink900">{p.title}</p>
                <p className="text-xs text-ink2">
                  {p.city} · {fmt(p.price_per_night)}/nuit
                </p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-sand text-green">Active</span>
            </div>
          ))}
        </div>
      )}

      {tab === "revenus" && (
        <div className="px-5 py-4">
          <div className="rounded-2xl p-4 mb-4 bg-white border border-sandDeep">
            <p className="text-[11px] text-ink2">Montant en attente de virement</p>
            <p className="text-lg font-semibold text-green">
              {balance ? fmt(balance.amountOwed) : "…"}
            </p>
          </div>

          <div className="rounded-2xl p-4 mb-4 bg-sand">
            <p className="text-xs uppercase tracking-wide mb-2 text-ink2">
              Numéro Mobile Money pour recevoir tes versements
            </p>
            <form onSubmit={saveMomo} className="flex gap-2">
              <input
                placeholder="Ex. 22997000000"
                value={momoNumber}
                onChange={(e) => setMomoNumber(e.target.value.replace(/[^0-9]/g, ""))}
                className="flex-1 px-3 py-2 rounded-lg text-sm bg-white border border-sandDeep"
              />
              <button
                type="submit"
                disabled={momoStatus === "saving"}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-clay text-cream disabled:opacity-70"
              >
                Enregistrer
              </button>
            </form>
            {momoStatus === "saved" && (
              <p className="text-xs mt-2 text-green">Numéro enregistré.</p>
            )}
            {momoStatus === "error" && (
              <p className="text-xs mt-2 text-clay">
                Format invalide — utilise l'indicatif pays sans le +, ex. 22997000000.
              </p>
            )}
            <p className="text-[11px] mt-2 text-ink2">
              Pour l'instant, les versements restent effectués manuellement par
              la plateforme. Ce numéro sera utilisé automatiquement dès que
              l'envoi automatique sera activé.
            </p>
          </div>

          <p className="text-xs uppercase tracking-wide mb-2 text-ink2">
            Réservations en attente de reversement
          </p>
          <div className="flex flex-col gap-2">
            {balance?.bookings?.length ? (
              balance.bookings.map((b) => (
                <div key={b.id} className="rounded-xl p-3 bg-white border border-sandDeep">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink900">Réservation {b.booking_id.slice(0, 8)}</span>
                    <span className="text-green font-medium">{fmt(b.amount)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-ink2">Aucun montant en attente.</p>
            )}
          </div>
        </div>
      )}

      {tab === "ajouter" && (
        <form onSubmit={submit} className="px-5 py-4 flex flex-col gap-3">
          <input
            placeholder="Titre de l'annonce"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="px-4 py-3 rounded-xl text-sm bg-white border border-sandDeep"
          />
          <input
            placeholder="Ville"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="px-4 py-3 rounded-xl text-sm bg-white border border-sandDeep"
          />
          <input
            placeholder="Prix par nuit (F CFA)"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="px-4 py-3 rounded-xl text-sm bg-white border border-sandDeep"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Voyageurs"
              type="number"
              value={form.guests}
              onChange={(e) => setForm({ ...form, guests: e.target.value })}
              className="px-4 py-3 rounded-xl text-sm bg-white border border-sandDeep"
            />
            <input
              placeholder="Chambres"
              type="number"
              value={form.beds}
              onChange={(e) => setForm({ ...form, beds: e.target.value })}
              className="px-4 py-3 rounded-xl text-sm bg-white border border-sandDeep"
            />
          </div>
          <textarea
            placeholder="Description"
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
            rows={3}
            className="px-4 py-3 rounded-xl text-sm bg-white border border-sandDeep"
          />
          <p className="text-[11px] text-ink2">
            Vous recevrez 88% du montant de chaque réservation, le reste (12%) va à la plateforme.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="py-3 rounded-xl text-sm font-medium bg-clay text-cream disabled:opacity-70"
          >
            {submitting ? "Publication…" : "Publier l'annonce"}
          </button>
        </form>
      )}
    </div>
  );
}
