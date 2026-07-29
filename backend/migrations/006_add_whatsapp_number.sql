-- Migration a executer dans le SQL Editor de Supabase (ta base existe deja).
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
