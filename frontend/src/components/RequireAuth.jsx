import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";

export default function RequireAuth({ children, redirectTo = "/proprietaire/connexion", requireRole, requireAdmin }) {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) {
    return <p className="p-5 text-sm text-ink2">Vérification de la session…</p>;
  }
  if (!user) {
    // On retient la page demandée pour y renvoyer la personne juste après
    // sa connexion (ex. reprendre une réservation en cours).
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }
  if (requireRole && user.role !== requireRole) {
    // Connecté, mais avec le mauvais type de compte (ex. un voyageur qui
    // tente d'ouvrir le tableau de bord propriétaire).
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }
  if (requireAdmin && !user.isAdmin) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }
  return children;
}
