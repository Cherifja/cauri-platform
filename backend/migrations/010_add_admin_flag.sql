-- Migration a executer dans le SQL Editor de Supabase (ta base existe deja).
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Remplace l'email ci-dessous par celui de ton compte pour t'accorder les
-- droits d'administration (bouton "Verifier" sur les annonces).
-- UPDATE users SET is_admin = true WHERE email = $t$ton-email@exemple.com$t$;
