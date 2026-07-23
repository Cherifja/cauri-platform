import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(auth.getStoredUser());
  const [checking, setChecking] = useState(auth.isLoggedIn());

  // Au chargement, si un token est stocké, on vérifie qu'il est toujours
  // valide auprès du backend plutôt que de faire confiance aveuglément
  // à ce qui est en localStorage (le token a pu expirer entre-temps).
  useEffect(() => {
    if (!auth.isLoggedIn()) {
      setChecking(false);
      return;
    }
    auth
      .me()
      .then(({ user: freshUser }) => setUser(freshUser))
      .catch(() => {
        auth.clearSession();
        setUser(null);
      })
      .finally(() => setChecking(false));
  }, []);

  function login(session) {
    auth.saveSession(session);
    setUser(session.user);
  }

  function logout() {
    auth.clearSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, checking, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  return ctx;
}
