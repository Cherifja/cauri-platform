import { useEffect, useState } from "react";
import { admin, discover } from "../lib/api.js";
import { mediaStorage } from "../lib/mediaStorage.js";

function PropertiesSection() {
  const [properties, setProperties] = useState([]);
  const [status, setStatus] = useState("loading");
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
    <div>
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
                p.is_verified ? "bg-white border border-clay text-clay" : "bg-green text-cream"
              }`}
            >
              {busySlug === p.slug ? "…" : p.is_verified ? "Retirer la vérification" : "✓ Vérifier"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const EMPTY_FORM = { name: "", shortDesc: "", detail: "", icon: "📍" };

function DiscoverSection() {
  const [spots, setSpots] = useState([]);
  const [status, setStatus] = useState("loading");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [formError, setFormError] = useState("");

  function load() {
    discover
      .list()
      .then((data) => {
        setSpots(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  useEffect(load, []);

  function startEdit(spot) {
    setEditingId(spot.id);
    setForm({
      name: spot.name,
      shortDesc: spot.short_desc || "",
      detail: spot.detail || "",
      icon: spot.icon || "📍",
    });
    setPhotoFile(null);
    setVideoFile(null);
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPhotoFile(null);
    setVideoFile(null);
    setFormError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("Le nom de la destination est obligatoire.");
      return;
    }
    setFormError("");
    setSaving(true);
    try {
      let photoUrl;
      let videoUrl;

      if (photoFile) {
        if (!mediaStorage.isConfigured()) {
          throw new Error("L'envoi de photo n'est pas configuré sur ce site pour l'instant.");
        }
        setUploadStatus("Envoi de la photo…");
        photoUrl = await mediaStorage.uploadPhoto(photoFile, "decouvrir");
      }
      if (videoFile) {
        if (!mediaStorage.isConfigured()) {
          throw new Error("L'envoi de vidéo n'est pas configuré sur ce site pour l'instant.");
        }
        setUploadStatus("Envoi de la vidéo…");
        videoUrl = await mediaStorage.uploadVideo(videoFile, "decouvrir");
      }

      setUploadStatus(editingId ? "Mise à jour…" : "Publication…");
      const payload = { ...form };
      if (photoUrl) payload.photoUrl = photoUrl;
      if (videoUrl) payload.videoUrl = videoUrl;

      if (editingId) {
        await admin.updateDiscoverSpot(editingId, payload);
      } else {
        await admin.createDiscoverSpot(payload);
      }

      cancelEdit();
      load();
    } catch (err) {
      console.error(err);
      setFormError(err.message || "Une erreur est survenue.");
    } finally {
      setSaving(false);
      setUploadStatus("");
    }
  }

  async function handleDelete(spot) {
    const confirmed = window.confirm(`Supprimer "${spot.name}" de la page À découvrir ?`);
    if (!confirmed) return;
    try {
      await admin.deleteDiscoverSpot(spot.id);
      load();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="rounded-xl p-4 mb-6 bg-white border border-sandDeep flex flex-col gap-3">
        <p className="text-xs uppercase tracking-wide text-ink2">
          {editingId ? "Modifier la destination" : "Ajouter une destination"}
        </p>
        <input
          placeholder="Nom (ex. Ganvié)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="px-4 py-3 rounded-xl text-sm bg-sand border border-sandDeep"
        />
        <input
          placeholder="Description courte (une phrase)"
          value={form.shortDesc}
          onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
          className="px-4 py-3 rounded-xl text-sm bg-sand border border-sandDeep"
        />
        <textarea
          placeholder="Description détaillée (affichée au clic)"
          value={form.detail}
          onChange={(e) => setForm({ ...form, detail: e.target.value })}
          rows={3}
          className="px-4 py-3 rounded-xl text-sm bg-sand border border-sandDeep"
        />
        <input
          placeholder="Icône emoji (ex. 🛶) — utilisée si pas de photo"
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value })}
          className="px-4 py-3 rounded-xl text-sm bg-sand border border-sandDeep"
        />

        <div>
          <label className="block text-xs uppercase tracking-wide mb-1 text-ink2">
            Photo {editingId && "(laisser vide pour garder l'actuelle)"}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
            className="text-xs text-ink900 w-full"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide mb-1 text-ink2">
            Vidéo {editingId && "(laisser vide pour garder l'actuelle)"}
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            className="text-xs text-ink900 w-full"
          />
        </div>

        {formError && <p className="text-xs text-clay">{formError}</p>}
        {uploadStatus && <p className="text-xs text-ink2">{uploadStatus}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-medium bg-clay text-cream disabled:opacity-70"
          >
            {saving ? uploadStatus || "Enregistrement…" : editingId ? "Enregistrer" : "Ajouter"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-3 rounded-xl text-sm bg-sand text-ink900"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      {status === "loading" && <p className="text-sm text-ink2">Chargement…</p>}
      {status === "error" && (
        <p className="text-sm text-clay">Impossible de charger les destinations.</p>
      )}

      <div className="flex flex-col gap-3">
        {spots.map((spot) => (
          <div
            key={spot.id}
            className="rounded-xl p-4 flex items-center justify-between gap-3 bg-white border border-sandDeep"
          >
            <div className="flex items-center gap-3 min-w-0">
              {spot.photo_url ? (
                <img src={spot.photo_url} alt={spot.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg flex-shrink-0 bg-sand flex items-center justify-center text-lg">
                  {spot.icon || "📍"}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink900 truncate">{spot.name}</p>
                <p className="text-xs text-ink2 truncate">{spot.short_desc}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => startEdit(spot)}
                className="text-xs px-3 py-2 rounded-full bg-sand text-ink900"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(spot)}
                className="text-xs px-3 py-2 rounded-full border border-clay text-clay"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("properties"); // properties | discover

  return (
    <div className="bg-cream min-h-full">
      <div className="px-5 md:px-8 pt-10 pb-8 bg-gradient-to-b from-ink to-ink2">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] mb-2 text-gold">Administration</p>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-cream">
            Gestion de la plateforme
          </h1>
        </div>
      </div>

      <div className="flex px-5 gap-2 mt-4 mb-2 max-w-4xl mx-auto">
        {[
          { id: "properties", label: "Logements vérifiés" },
          { id: "discover", label: "À découvrir" },
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

      <div className="px-5 md:px-8 py-8 max-w-4xl mx-auto">
        {tab === "properties" ? <PropertiesSection /> : <DiscoverSection />}
      </div>
    </div>
  );
}
