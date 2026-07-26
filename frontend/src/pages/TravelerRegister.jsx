import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../lib/api.js";
import { useAuth } from "../lib/AuthContext.jsx";

export default function TravelerRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from || "/";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setSubmitting(true);
    try {
      const session = await auth.register({ ...form, role: "traveler" });
      login(session);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Inscription impossible");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-cream min-h-full">
      <div className="px-5 pt-10 pb-8 bg-gradient-to-b from-ink to-ink2">
        <div className="max-w-md mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] mb-2 text-gold">Bienvenue</p>
          <h1 className="text-2xl font-display font-semibold text-cream">Créer un compte</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-6 flex flex-col gap-3 max-w-md mx-auto">
        <input
          placeholder="Nom complet"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="px-4 py-3 rounded-xl text-sm bg-white border border-sandDeep"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="px-4 py-3 rounded-xl text-sm bg-white border border-sandDeep"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe (8 caractères minimum)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="px-4 py-3 rounded-xl text-sm bg-white border border-sandDeep"
          required
        />

        {error && <p className="text-xs text-clay">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="py-3 rounded-xl text-sm font-medium bg-clay text-cream disabled:opacity-70"
        >
          {submitting ? "Création…" : "Créer mon compte"}
        </button>

        <p className="text-xs text-ink2 text-center mt-2">
          Déjà un compte ?{" "}
          <Link to="/connexion" state={{ from: redirectTo }} className="underline">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}
