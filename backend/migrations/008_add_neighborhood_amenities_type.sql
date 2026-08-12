-- Migration a executer dans le SQL Editor de Supabase (ta base existe deja).
ALTER TABLE properties ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_type TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS landmark TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}';
