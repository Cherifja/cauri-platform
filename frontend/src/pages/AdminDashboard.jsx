import { useEffect, useState } from "react";
import { admin } from "../lib/api.js";

export default function AdminDashboard() {
  const [properties, setProperties] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [busySlug, setBusySlug] = useState(null);

  function load() {
    admin
      .listProperties()
      .then((data) => {
        setProperties(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  useEffect(load, []);

  async function toggle(property) {
    setBusySlug(property.slug);
    try {
      await admin.setVerified(property.slug, !property.is_verified);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setBusySlug(null);
    }
  }

  return (
    <div className="bg-cream min-h-full">
      <div className="px-5 md:px-8 pt-10 pb-8 bg-gradient-to-b from-ink to-ink2">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] mb-2 text-gold">Administration</p>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-cream">
            Vérification des logements
          </h1>
        </div>
      </div>

      <div className="px-5 md:px-8 py-8 max-w-4xl mx-auto">
        {status === "loading" && <p className="text-sm text-ink2">Chargement…</p>}
        {status === "error" && (
          <p className="text-sm text-clay">Impossible de charger la liste des annonces.</p>
        )}

        <div className="flex flex-col gap-3">
          {properties.map((p) => (
            <div
              key={p.slug}
              className="rounded-xl p-4 flex items-center justify-between gap-3 bg-white border border-sandDeep"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink900 truncate">{p.title}</p>
                <p className="text-xs text-ink2">
                  {p.city} · Propriétaire : {p.owner_name}
                  {p.is_verified && p.verified_at && (
                    <> · vérifié le {new Date(p.verified_at).toLocaleDateString("fr-FR")}</>
                  )}
                </p>
              </div>
              <button
                onClick={() => toggle(p)}
                disabled={busySlug === p.slug}
                className={`text-xs px-4 py-2 rounded-full flex-shrink-0 disabled:opacity-50 ${
                  p.is_verified
                    ? "bg-white border border-clay text-clay"
                    : "bg-green text-cream"
                }`}
              >
                {busySlug === p.slug
                  ? "…"
                  : p.is_verified
                  ? "Retirer la vérification"
                  : "✓ Vérifier"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
