import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";

export default function RequireAuth({ children }) {
  const { user, checking } = useAuth();

  if (checking) {
    return <p className="p-5 text-sm text-ink2">Vérification de la session…</p>;
  }
  if (!user) {
    return <Navigate to="/proprietaire/connexion" replace />;
  }
  return children;
}
