-- Migration a executer dans le SQL Editor de Supabase (ta base existe deja).

-- 1) Colonnes pour stocker les liens des photos et de la video de chaque logement.
ALTER TABLE properties ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT '{}';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 2) Bucket de stockage public pour heberger les photos/videos envoyees
--    par les proprietaires. "public" = les fichiers sont consultables via
--    une simple URL, sans authentification (necessaire pour les afficher
--    sur le site).
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-media', 'property-media', true)
ON CONFLICT (id) DO NOTHING;

-- 3) Autorise l'envoi de fichiers dans ce bucket depuis le site (via la
--    cle publique "anon"). Note : cette regle est volontairement simple
--    pour demarrer rapidement - elle autorise l'envoi a quiconque possede
--    la cle publique du site (visible dans le code du frontend, ce n'est
--    pas un secret). Pour une securite plus fine plus tard (limiter aux
--    seuls proprietaires connectes), il faudrait passer par une fonction
--    Supabase Edge qui verifie le jeton JWT de Cauri avant d'autoriser
--    l'upload.
DROP POLICY IF EXISTS "Envoi public vers property-media" ON storage.objects;
CREATE POLICY "Envoi public vers property-media"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'property-media');

DROP POLICY IF EXISTS "Lecture publique de property-media" ON storage.objects;
CREATE POLICY "Lecture publique de property-media"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'property-media');
