import { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../lib/api.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      await auth.forgotPassword(email);
      setStatus("sent");
    } catch (err) {
      setStatus("error");
    }
  }

  return (
    <div className="bg-cream min-h-full">
      <div className="px-5 pt-10 pb-8 bg-gradient-to-b from-ink to-ink2">
        <div className="max-w-md mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] mb-2 text-gold">Espace propriétaire</p>
          <h1 className="text-2xl font-display font-semibold text-cream">Mot de passe oublié</h1>
        </div>
      </div>

      <div className="px-5 py-6 max-w-md mx-auto">
        {status === "sent" ? (
          <div className="rounded-xl p-4 bg-white border border-sandDeep">
            <p className="text-sm text-ink900">
              Si un compte existe avec l'adresse <strong>{email}</strong>, un email vient d'être
              envoyé avec un lien pour choisir un nouveau mot de passe. Vérifie aussi tes spams.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <p className="text-sm text-ink2">
              Entre l'adresse email associée à ton compte propriétaire, on t'enverra un lien pour
              choisir un nouveau mot de passe.
            </p>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded-xl text-sm bg-white border border-sandDeep"
              required
            />
            {status === "error" && (
              <p className="text-xs text-clay">
                Une erreur est survenue. Réessaie dans un instant.
              </p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="py-3 rounded-xl text-sm font-medium bg-clay text-cream disabled:opacity-70"
            >
              {status === "sending" ? "Envoi…" : "Envoyer le lien"}
            </button>
          </form>
        )}

        <p className="text-xs text-ink2 text-center mt-4">
          <Link to="/proprietaire/connexion" className="underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
