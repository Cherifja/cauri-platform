import { createClient } from "@supabase/supabase-js";

// Ces deux valeurs sont publiques par nature (visibles dans le code envoyé
// au navigateur) : c'est la clé "anon" de Supabase, pas un secret. Elle
// n'autorise que ce que les règles définies côté Supabase permettent (ici :
// écrire/lire dans le bucket "property-media", voir migrations/003).
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const BUCKET = "property-media";
const MAX_PHOTO_MB = 8;
const MAX_VIDEO_MB = 100;

function assertConfigured() {
  if (!supabase) {
    throw new Error(
      "Le stockage des médias n'est pas configuré (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquants)."
    );
  }
}

function randomFileName(originalName) {
  const ext = originalName.split(".").pop();
  const random = Math.random().toString(36).slice(2, 10);
  return `${Date.now()}-${random}.${ext}`;
}

/**
 * Envoie un fichier vers Supabase Storage et renvoie son URL publique.
 * `folder` sert à ranger les fichiers par propriétaire (ex. "owner-adjovi").
 */
async function uploadFile(file, folder, maxMb) {
  assertConfigured();
  if (file.size > maxMb * 1024 * 1024) {
    throw new Error(`Le fichier "${file.name}" dépasse la taille maximale de ${maxMb} Mo.`);
  }

  const path = `${folder}/${randomFileName(file.name)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(`Échec de l'envoi de "${file.name}" : ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export const mediaStorage = {
  isConfigured: () => Boolean(supabase),
  uploadPhoto: (file, folder) => uploadFile(file, folder, MAX_PHOTO_MB),
  uploadVideo: (file, folder) => uploadFile(file, folder, MAX_VIDEO_MB),
};
