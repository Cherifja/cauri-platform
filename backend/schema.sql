-- Schéma Postgres pour Cauri, à exécuter dans l'éditeur SQL de Supabase
-- (ou via psql sur n'importe quelle base Postgres).
-- Équivalent Postgres du schéma SQLite utilisé en développement local.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  -- Numéro Mobile Money (format international, ex. 22997000000) où le
  -- propriétaire souhaite recevoir ses versements. Facultatif pour l'instant
  -- (le versement est manuel), mais nécessaire le jour où l'automatisation
  -- via Kkiapay Push sera activée.
  mobile_money_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  city TEXT NOT NULL,
  price_per_night INTEGER NOT NULL,
  guests INTEGER NOT NULL,
  beds INTEGER NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  tag TEXT,
  description TEXT,
  owner_id TEXT NOT NULL REFERENCES users(id),
  owner_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(slug),
  owner_id TEXT NOT NULL,
  traveler_email TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INTEGER NOT NULL,
  amount_total INTEGER NOT NULL,
  commission_amount INTEGER NOT NULL,
  payout_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  kkiapay_transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS owner_payouts (
  id SERIAL PRIMARY KEY,
  owner_id TEXT NOT NULL,
  booking_id TEXT NOT NULL REFERENCES bookings(id),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'owed',
  transferred_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bookings_property_status ON bookings(property_id, status);
CREATE INDEX IF NOT EXISTS idx_owner_payouts_owner_status ON owner_payouts(owner_id, status);

-- Comptes propriétaires de démo (mot de passe : motdepasse123).
-- Le hash ci-dessous est un hash bcrypt réel de "motdepasse123" — tu peux
-- le regénérer avec : node -e "console.log(require('bcryptjs').hashSync('motdepasse123', 10))"
INSERT INTO users (id, email, password_hash, name, role) VALUES
  ('owner-adjovi', 'adjovi@example.com', '$2a$10$oJohEGhjaKPG98L9ZruBmOzpto8YSekjstHLhaAOLWkKQ4ZSWUHPO', 'Adjovi', 'owner'),
  ('owner-roger', 'roger@example.com', '$2a$10$oJohEGhjaKPG98L9ZruBmOzpto8YSekjstHLhaAOLWkKQ4ZSWUHPO', 'Roger', 'owner')
ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, slug, title, city, price_per_night, guests, beds, lat, lng, tag, description, owner_id, owner_name) VALUES
  ('prop-1', 'villa-ganvie', 'Villa sur pilotis, Ganvié', 'Ganvié', 45000, 4, 2, 6.4667, 2.4167, 'Lagune', 'Villa au bord de l''eau avec vue sur la cité lacustre de Ganvié, accès en pirogue privée le matin.', 'owner-adjovi', 'Adjovi K.'),
  ('prop-2', 'appart-cotonou', 'Appartement moderne, Cotonou', 'Cotonou', 32000, 2, 1, 6.3703, 2.3912, 'Centre-ville', 'Appartement climatisé proche de la Marina, idéal pour un séjour d''affaires ou une escale en ville.', 'owner-adjovi', 'Adjovi K.'),
  ('prop-3', 'case-ouidah', 'Case traditionnelle, Ouidah', 'Ouidah', 28000, 3, 2, 6.3616, 2.0852, 'Culture', 'Logement à deux pas de la Route des Esclaves et des temples vaudou, jardin tropical privé.', 'owner-roger', 'Roger T.'),
  ('prop-4', 'bungalow-grand-popo', 'Bungalow plage, Grand-Popo', 'Grand-Popo', 38000, 5, 3, 6.2833, 1.8167, 'Plage', 'Bungalow face à l''océan Atlantique, réveil au son des vagues et ponton privé pour le coucher de soleil.', 'owner-roger', 'Roger T.')
ON CONFLICT (id) DO NOTHING;
