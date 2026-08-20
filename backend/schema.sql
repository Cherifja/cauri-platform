-- Schema Postgres pour Cauri, a executer dans l'editeur SQL de Supabase.
-- Version "mobile" : utilise le guillemet dollar ($t$...$t$) au lieu du
-- guillemet simple pour les textes, car les claviers de telephone
-- remplacent parfois automatiquement les apostrophes par des guillemets
-- typographiques, ce qui casse la syntaxe SQL.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT $t$owner$t$,
  -- Independant de "role" (owner/traveler) : un compte peut cumuler son
  -- role habituel ET des droits d'administration, sans que l'un remplace
  -- l'autre. Reserve a Cherif (createur de la plateforme) pour l'instant.
  is_admin BOOLEAN NOT NULL DEFAULT false,
  mobile_money_number TEXT,
  -- Numero WhatsApp du proprietaire (format international, ex. 22997000000),
  -- utilise pour permettre au voyageur de le contacter directement apres
  -- paiement afin de coordonner la remise des cles.
  whatsapp_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Jetons a usage unique pour la reinitialisation de mot de passe.
-- On stocke un hash du jeton (jamais le jeton en clair) pour que meme
-- un acces a la base ne permette pas de reinitialiser un compte.
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);

CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  city TEXT NOT NULL,
  neighborhood TEXT,
  property_type TEXT,
  price_per_month INTEGER NOT NULL,
  guests INTEGER NOT NULL,
  beds INTEGER NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  tag TEXT,
  description TEXT,
  landmark TEXT,
  amenities TEXT[] DEFAULT '{}',
  photo_urls TEXT[] DEFAULT '{}',
  video_url TEXT,
  owner_id TEXT NOT NULL REFERENCES users(id),
  owner_name TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(slug),
  owner_id TEXT NOT NULL,
  traveler_id TEXT REFERENCES users(id),
  traveler_email TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  months INTEGER NOT NULL,
  amount_total INTEGER NOT NULL,
  commission_amount INTEGER NOT NULL,
  payout_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT $t$pending$t$,
  kkiapay_transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS owner_payouts (
  id SERIAL PRIMARY KEY,
  owner_id TEXT NOT NULL,
  booking_id TEXT NOT NULL REFERENCES bookings(id),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT $t$owed$t$,
  transferred_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bookings_property_status ON bookings(property_id, status);
CREATE INDEX IF NOT EXISTS idx_owner_payouts_owner_status ON owner_payouts(owner_id, status);

-- Un avis est toujours rattaché à une réservation précise (booking_id
-- UNIQUE) : impossible de laisser un avis sans avoir réellement réservé et
-- séjourné (vérifié côté serveur avant l'insertion), et impossible d'en
-- laisser plusieurs pour le même séjour.
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  booking_id TEXT NOT NULL UNIQUE REFERENCES bookings(id),
  property_id TEXT NOT NULL REFERENCES properties(slug),
  traveler_id TEXT NOT NULL REFERENCES users(id),
  traveler_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_property ON reviews(property_id);

-- Destinations touristiques affichees sur la page "A decouvrir", geree
-- entierement depuis l'espace admin (/admin) - pas besoin de repasser par
-- le code pour ajouter/modifier/retirer une destination.
CREATE TABLE IF NOT EXISTS discover_spots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_desc TEXT,
  detail TEXT,
  icon TEXT,
  photo_url TEXT,
  video_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO discover_spots (id, name, short_desc, detail, icon, position) VALUES
  ($t$spot-1$t$, $t$Ganvié$t$, $t$La "Venise de l'Afrique", cité lacustre sur pilotis.$t$, $t$Bâti entièrement sur l'eau au milieu du lac Nokoué, Ganvié se visite en pirogue, souvent au lever du soleil quand les pêcheurs relèvent leurs filets.$t$, $t$🛶$t$, 1),
  ($t$spot-2$t$, $t$Route des Pêches$t$, $t$Bord de mer entre Cotonou et Ouidah, restaurants et plages.$t$, $t$Cette route longe l'océan Atlantique sur une vingtaine de kilomètres entre Cotonou et Ouidah, avec plages, restaurants et bars en bord de mer.$t$, $t$🌊$t$, 2),
  ($t$spot-3$t$, $t$Ouidah$t$, $t$Route des Esclaves, temples vaudou et patrimoine historique.$t$, $t$Ville chargée d'histoire, berceau du culte vaudou au Bénin. La Route des Esclaves relie le centre-ville à la Porte du Non-Retour, sur la plage.$t$, $t$🏛️$t$, 3),
  ($t$spot-4$t$, $t$Grand-Popo$t$, $t$Plages calmes et embouchure du fleuve Mono.$t$, $t$Plus tranquille que la Route des Pêches, Grand-Popo offre de longues plages peu fréquentées et une excursion en pirogue sur le fleuve Mono.$t$, $t$🏖️$t$, 4),
  ($t$spot-5$t$, $t$Parc national de la Pendjari$t$, $t$Safari et faune sauvage, au nord du pays.$t$, $t$Une des dernières grandes réserves de faune sauvage d'Afrique de l'Ouest : éléphants, lions, buffles, antilopes et de nombreuses espèces d'oiseaux.$t$, $t$🦁$t$, 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, password_hash, name, role) VALUES
  ($t$owner-adjovi$t$, $t$adjovi@example.com$t$, $t$$2a$10$oJohEGhjaKPG98L9ZruBmOzpto8YSekjstHLhaAOLWkKQ4ZSWUHPO$t$, $t$Adjovi$t$, $t$owner$t$),
  ($t$owner-roger$t$, $t$roger@example.com$t$, $t$$2a$10$oJohEGhjaKPG98L9ZruBmOzpto8YSekjstHLhaAOLWkKQ4ZSWUHPO$t$, $t$Roger$t$, $t$owner$t$)
ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, slug, title, city, price_per_month, guests, beds, lat, lng, tag, description, owner_id, owner_name) VALUES
  ($t$prop-1$t$, $t$villa-ganvie$t$, $t$Villa sur pilotis, Ganvié$t$, $t$Ganvié$t$, 450000, 4, 2, 6.4667, 2.4167, $t$Lagune$t$, $t$Villa au bord de l'eau avec vue sur la cité lacustre de Ganvié, accès en pirogue privée le matin.$t$, $t$owner-adjovi$t$, $t$Adjovi K.$t$),
  ($t$prop-2$t$, $t$appart-cotonou$t$, $t$Appartement moderne, Cotonou$t$, $t$Cotonou$t$, 320000, 2, 1, 6.3703, 2.3912, $t$Centre-ville$t$, $t$Appartement climatisé proche de la Marina, idéal pour un séjour d'affaires ou une escale en ville.$t$, $t$owner-adjovi$t$, $t$Adjovi K.$t$),
  ($t$prop-3$t$, $t$case-ouidah$t$, $t$Case traditionnelle, Ouidah$t$, $t$Ouidah$t$, 200000, 3, 2, 6.3616, 2.0852, $t$Culture$t$, $t$Logement à deux pas de la Route des Esclaves et des temples vaudou, jardin privé tropical.$t$, $t$owner-roger$t$, $t$Roger T.$t$),
  ($t$prop-4$t$, $t$bungalow-grand-popo$t$, $t$Bungalow plage, Grand-Popo$t$, $t$Grand-Popo$t$, 380000, 5, 3, 6.2833, 1.8167, $t$Plage$t$, $t$Bungalow face à l'océan Atlantique, réveil au son des vagues et ponton privé pour le coucher de soleil.$t$, $t$owner-roger$t$, $t$Roger T.$t$)
ON CONFLICT (id) DO NOTHING;
