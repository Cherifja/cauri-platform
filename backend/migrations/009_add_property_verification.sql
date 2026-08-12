-- Migration a executer dans le SQL Editor de Supabase (ta base existe deja).
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Pour activer le badge "Logement verifie" sur une annonce, une fois que
-- tu as toi-meme confirme l'identite du proprietaire et les photos (appel
-- telephonique, piece d'identite, etc.), lance cette commande en
-- remplacant le slug par celui de l'annonce concernee :
--
-- UPDATE properties SET is_verified = true, verified_at = now()
-- WHERE slug = 'villa-ganvie';
