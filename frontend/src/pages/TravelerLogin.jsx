import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../lib/api.js";
import { useAuth } from "../lib/AuthContext.jsx";

export default function TravelerLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from || "/";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const session = await auth.login(form);
      login(session);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Connexion impossible");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-cream min-h-full">
      <div className="px-5 pt-10 pb-8 bg-gradient-to-b from-ink to-ink2">
        <div className="max-w-md mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] mb-2 text-gold">Bienvenue</p>
          <h1 className="text-2xl font-display font-semibold text-cream">Connexion</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-6 flex flex-col gap-3 max-w-md mx-auto">
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
          placeholder="Mot de passe"
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
          {submitting ? "Connexion…" : "Se connecter"}
        </button>

        <p className="text-xs text-ink2 text-center mt-2">
          Pas encore de compte ?{" "}
          <Link
            to="/inscription"
            state={{ from: redirectTo }}
            className="underline"
          >
            Créer un compte
          </Link>
        </p>
      </form>
    </div>
  );
}
