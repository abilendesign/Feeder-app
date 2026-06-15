-- Guarda la tarjeta completa como JSON (flexible) + mantiene title para listar.
-- Ejecutar en Supabase -> SQL Editor -> Run.
alter table public.property_cards
  add column if not exists data jsonb;
