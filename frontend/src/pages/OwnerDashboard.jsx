import { useEffect, useState } from "react";
import { api, fmt } from "../lib/api.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { mediaStorage } from "../lib/mediaStorage.js";

const MAX_PHOTOS = 8;

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("annonces");
  const [properties, setProperties] = useState([]);
  const [balance, setBalance] = useState(null);
  const [form, setForm] = useState({ title: "", city: "", price: "", guests: 2, beds: 1, desc: "" });
  const [photoFiles, setPhotoFiles] = useState([]); // File[]
  const [videoFile, setVideoFile] = useState(null); // File | null
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(""); // texte affiché pendant l'envoi
  const [formError, setFormError] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [momoStatus, setMomoStatus] = useState(""); // "" | "saving" | "saved" | "error"
  const [deletingSlug, setDeletingSlug] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  function loadProperties() {
    api.ownerProperties().then(setProperties).catch(() => {});
  }

  useEffect(() => {
    loadProperties();
    api.ownerBalance().then(setBalance).catch(() => {});
  }, []);

  function handlePhotoChange(e) {
    const files = Array.from(e.target.files || []);
    setPhotoFiles(files.slice(0, MAX_PHOTOS));
  }

  async function submit(e) {
    e.preventDefault();
    setFormError("");
    if (!form.title || !form.city || !form.price) return;

    if ((photoFiles.length > 0 || videoFile) && !mediaStorage.isConfigured()) {
      setFormError(
        "L'envoi de photos/vidéo n'est pas encore configuré sur ce site (VITE_SUPABASE_URL manquant). Tu peux publier l'annonce sans média pour l'instant."
      );
      return;
    }

    setSubmitting(true);
    try {
      let photoUrls = [];
      let videoUrl = null;

      if (photoFiles.length > 0) {
        setUploadStatus(`Envoi des photos (0/${photoFiles.length})…`);
        for (let i = 0; i < photoFiles.length; i++) {
          const url = await mediaStorage.uploadPhoto(photoFiles[i], user.id);
          photoUrls.push(url);
          setUploadStatus(`Envoi des photos (${i + 1}/${photoFiles.length})…`);
        }
      }

      if (videoFile) {
        setUploadStatus("Envoi de la vidéo…");
        videoUrl = await mediaStorage.uploadVideo(videoFile, user.id);
      }

      setUploadStatus("Publication de l'annonce…");
      await api.createProperty({
        title: form.title,
        city: form.city,
        pricePerNight: Number(form.price),
        guests: Number(form.guests),
        beds: Number(form.beds),
        description: form.desc,
        photoUrls,
        videoUrl,
      });

      setForm({ title: "", city: "", price: "", guests: 2, beds: 1, desc: "" });
      setPhotoFiles([]);
      setVideoFile(null);
      loadProperties();
      setTab("annonces");
    } catch (err) {
      console.error(err);
      setFormError(err.message || "Une erreur est survenue lors de la publication.");
    } finally {
      setSubmitting(false);
      setUploadStatus("");
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

  async function handleDelete(property) {
    const confirmed = window.confirm(
      `Supprimer définitivement "${property.title}" ? Cette action est irréversible.`
    );
    if (!confirmed) return;

    setDeleteError("");
    setDeletingSlug(property.slug);
    try {
      await api.deleteProperty(property.slug);
      loadProperties();
    } catch (err) {
      setDeleteError(err.message || "Impossible de supprimer cette annonce.");
    } finally {
      setDeletingSlug(null);
    }
  }

  return (
    <div className="bg-cream min-h-full">
      <div className="px-5 pt-8 pb-6 bg-gradient-to-b from-ink to-ink2">
        <div className="max-w-4xl mx-auto">
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
      </div>

      <div className="flex px-5 gap-2 mt-4 mb-2 max-w-4xl mx-auto">
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
        <div className="px-5 py-4 max-w-4xl mx-auto">
          {deleteError && (
            <p className="text-xs text-clay mb-3 rounded-lg bg-white border border-clay p-3">
              {deleteError}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {properties.length === 0 && (
              <p className="text-sm text-ink2">Aucune annonce publiée pour le moment.</p>
            )}
            {properties.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl p-4 flex items-center gap-3 bg-white border border-sandDeep"
              >
                {p.photo_urls && p.photo_urls.length > 0 ? (
                  <img
                    src={p.photo_urls[0]}
                    alt={p.title}
                    className="w-14 h-14 rounded-xl flex-shrink-0 object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl flex-shrink-0 bg-lagoon" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink900 truncate">{p.title}</p>
                  <p className="text-xs text-ink2">
                    {p.city} · {fmt(p.price_per_night)}/nuit
                    {p.photo_urls?.length > 0 && ` · ${p.photo_urls.length} photo${p.photo_urls.length > 1 ? "s" : ""}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(p)}
                  disabled={deletingSlug === p.slug}
                  className="text-[11px] px-2 py-1.5 rounded-full text-clay border border-clay disabled:opacity-50 flex-shrink-0"
                >
                  {deletingSlug === p.slug ? "…" : "Supprimer"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "revenus" && (
        <div className="px-5 py-4 max-w-4xl mx-auto">
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
        <form onSubmit={submit} className="px-5 py-4 flex flex-col gap-3 max-w-xl mx-auto">
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

          <div className="rounded-xl p-4 bg-sand">
            <label className="block text-xs uppercase tracking-wide mb-2 text-ink2">
              Photos (jusqu'à {MAX_PHOTOS}, 8 Mo max chacune)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="text-xs text-ink900 w-full"
            />
            {photoFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {photoFiles.map((file, i) => (
                  <img
                    key={i}
                    src={URL.createObjectURL(file)}
                    alt={`Aperçu ${i + 1}`}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl p-4 bg-sand">
            <label className="block text-xs uppercase tracking-wide mb-2 text-ink2">
              Vidéo (optionnel, 100 Mo max)
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className="text-xs text-ink900 w-full"
            />
            {videoFile && <p className="text-xs mt-2 text-ink2">Sélectionnée : {videoFile.name}</p>}
          </div>

          <p className="text-[11px] text-ink2">
            Vous recevrez 88% du montant de chaque réservation, le reste (12%) va à la plateforme.
          </p>

          {formError && <p className="text-xs text-clay">{formError}</p>}
          {uploadStatus && <p className="text-xs text-ink2">{uploadStatus}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="py-3 rounded-xl text-sm font-medium bg-clay text-cream disabled:opacity-70"
          >
            {submitting ? uploadStatus || "Publication…" : "Publier l'annonce"}
          </button>
        </form>
      )}
    </div>
  );
}
