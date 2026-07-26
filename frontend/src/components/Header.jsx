import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-ink border-b border-ink2">
      <div className="flex items-center justify-between px-5 md:px-8 py-4 max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl md:text-2xl font-display font-semibold text-sand">Cauri</span>
          <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-gold text-ink900">
            Bénin
          </span>
        </Link>

        {/* Le lien vers l'espace propriétaire n'apparaît que si un
            propriétaire est déjà connecté (pour qu'il retrouve son tableau
            de bord facilement) — il n'est jamais mis en avant pour un
            simple visiteur. Le compte voyageur, lui, est visible pour tous
            puisque c'est l'espace destiné aux clients de la plateforme. */}
        {user?.role === "owner" && (
          <button
            onClick={() => navigate("/proprietaire")}
            className="text-[11px] md:text-xs px-3 py-1.5 rounded-full bg-ink2 text-sandDeep hover:text-cream"
          >
            {user.name}
          </button>
        )}

        {user?.role === "traveler" && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] md:text-xs text-sandDeep">{user.name}</span>
            <button
              onClick={logout}
              className="text-[11px] md:text-xs px-3 py-1.5 rounded-full bg-ink2 text-sandDeep hover:text-cream"
            >
              Déconnexion
            </button>
          </div>
        )}

        {!user && (
          <button
            onClick={() => navigate("/connexion")}
            className="text-[11px] md:text-xs px-3 py-1.5 rounded-full bg-ink2 text-sandDeep hover:text-cream"
          >
            Se connecter
          </button>
        )}
      </div>
    </header>
  );
}
