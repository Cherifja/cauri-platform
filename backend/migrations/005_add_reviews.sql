-- Migration a executer dans le SQL Editor de Supabase (ta base existe deja).
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
