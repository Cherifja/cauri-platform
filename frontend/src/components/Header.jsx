import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";

export default function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-ink border-b border-ink2">
      <div className="flex items-center justify-between px-5 md:px-8 py-4 max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl md:text-2xl font-display font-semibold text-sand">Cauri</span>
          <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-gold text-ink900">
            Bénin
          </span>
        </Link>
        {/* Le lien vers l'espace propriétaire n'apparaît ici que si un
            propriétaire est déjà connecté (pour qu'il retrouve son tableau
            de bord facilement). Pour un visiteur non connecté, cet espace
            n'est volontairement pas mis en avant dans la navigation
            principale — voir le petit lien en bas de page (Footer). */}
        {user && (
          <button
            onClick={() => navigate("/proprietaire")}
            className="text-[11px] md:text-xs px-3 py-1.5 rounded-full bg-ink2 text-sandDeep hover:text-cream"
          >
            {user.name}
          </button>
        )}
      </div>
    </header>
  );
}
