-- Migration a executer dans le SQL Editor de Supabase (ta base existe deja).
-- Passe la plateforme d'une tarification "par nuit" a une tarification
-- "par mois", conformement a l'usage locatif habituel au Benin.

ALTER TABLE properties RENAME COLUMN price_per_night TO price_per_month;
ALTER TABLE bookings RENAME COLUMN nights TO months;

-- Note : cette migration renomme les colonnes sans modifier les valeurs
-- deja enregistrees. Si des logements existants avaient un prix par nuit
-- (ex. 45000), ce meme nombre sera desormais interprete comme un prix par
-- mois - pense a corriger ces prix directement depuis l'espace
-- proprietaire une fois la migration appliquee.
