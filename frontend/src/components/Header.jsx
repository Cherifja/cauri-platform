import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  function go(path) {
    closeMenu();
    navigate(path);
  }

  function handleLogout() {
    closeMenu();
    logout();
    navigate("/");
  }

  return (
    <>
      <header className="sticky top-0 z-20 bg-ink border-b border-ink2">
        <div className="flex items-center justify-between px-5 md:px-8 py-4 max-w-6xl mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl md:text-2xl font-display font-semibold text-sand">
              Stay<span className="text-gold">Benin</span>
            </span>
          </Link>

          {user ? (
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu du compte"
              className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-full bg-ink2"
            >
              <span className="block w-4 h-0.5 bg-sandDeep" />
              <span className="block w-4 h-0.5 bg-sandDeep" />
              <span className="block w-4 h-0.5 bg-sandDeep" />
            </button>
          ) : (
            <button
              onClick={() => navigate("/connexion")}
              className="text-[11px] md:text-xs px-3 py-1.5 rounded-full bg-ink2 text-sandDeep hover:text-cream"
            >
              Se connecter
            </button>
          )}
        </div>
      </header>

      {/* Voile derrière le tiroir, pour fermer au clic en dehors */}
      {menuOpen && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 bg-black/40 z-30"
          aria-hidden="true"
        />
      )}

      {/* Tiroir glissant depuis la droite */}
      <div
        className={`fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-ink z-40 transform transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink2">
          <span className="text-sm text-sandDeep">{user?.name}</span>
          <button
            onClick={closeMenu}
            aria-label="Fermer le menu"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-ink2 text-sandDeep"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col p-3">
          {user?.role === "traveler" && (
            <button
              onClick={() => go("/mes-reservations")}
              className="text-left px-3 py-3 rounded-xl text-sm text-cream hover:bg-ink2"
            >
              Mes réservations
            </button>
          )}

          {user?.role === "owner" && (
            <button
              onClick={() => go("/proprietaire")}
              className="text-left px-3 py-3 rounded-xl text-sm text-cream hover:bg-ink2"
            >
              Mon espace propriétaire
            </button>
          )}

          <button
            onClick={handleLogout}
            className="text-left px-3 py-3 rounded-xl text-sm text-clay hover:bg-ink2 mt-1"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </>
  );
}
