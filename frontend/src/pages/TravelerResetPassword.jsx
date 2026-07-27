import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "../lib/api.js";

export default function TravelerResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | saving | done | error

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setStatus("saving");
    try {
      await auth.resetPassword(token, password);
      setStatus("done");
    } catch (err) {
      setError(err.message || "Ce lien est invalide ou a expiré.");
      setStatus("error");
    }
  }

  if (!token) {
    return (
      <div className="bg-cream min-h-full px-5 py-10 max-w-md mx-auto">
        <p className="text-sm text-clay mb-3">
          Ce lien de réinitialisation est incomplet ou invalide.
        </p>
        <Link to="/mot-de-passe-oublie" className="text-sm underline text-ink2">
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-full">
      <div className="px-5 pt-10 pb-8 bg-gradient-to-b from-ink to-ink2">
        <div className="max-w-md mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] mb-2 text-gold">Bienvenue</p>
          <h1 className="text-2xl font-display font-semibold text-cream">Nouveau mot de passe</h1>
        </div>
      </div>

      <div className="px-5 py-6 max-w-md mx-auto">
        {status === "done" ? (
          <div className="rounded-xl p-4 bg-white border border-sandDeep flex flex-col gap-3">
            <p className="text-sm text-ink900">
              Ton mot de passe a bien été mis à jour. Tu peux maintenant te connecter.
            </p>
            <button
              onClick={() => navigate("/connexion")}
              className="py-3 rounded-xl text-sm font-medium bg-clay text-cream"
            >
              Se connecter
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Nouveau mot de passe (8 caractères min.)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-3 rounded-xl text-sm bg-white border border-sandDeep"
              required
            />
            <input
              type="password"
              placeholder="Confirme le nouveau mot de passe"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="px-4 py-3 rounded-xl text-sm bg-white border border-sandDeep"
              required
            />
            {error && <p className="text-xs text-clay">{error}</p>}
            <button
              type="submit"
              disabled={status === "saving"}
              className="py-3 rounded-xl text-sm font-medium bg-clay text-cream disabled:opacity-70"
            >
              {status === "saving" ? "Enregistrement…" : "Changer le mot de passe"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
