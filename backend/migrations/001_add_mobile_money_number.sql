-- Migration à exécuter une fois si ta base Supabase existe déjà (créée
-- avant l'ajout du numéro Mobile Money). Si tu repars d'une base neuve,
-- ce n'est pas nécessaire : schema.sql l'inclut déjà.
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_money_number TEXT;
