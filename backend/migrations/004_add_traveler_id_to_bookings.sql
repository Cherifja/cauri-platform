-- Migration a executer dans le SQL Editor de Supabase (ta base existe deja).
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS traveler_id TEXT REFERENCES users(id);
