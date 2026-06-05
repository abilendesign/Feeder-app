-- ============================================================
-- Feederapp - Esquema de base de datos (bienes raíces, Panamá)
-- Ejecutar en: Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================

-- ---------- TARJETA DE PROPIEDAD (tabla principal) ----------
create table if not exists public.property_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text,
  operation_type text,        -- venta | alquiler
  property_type text,         -- casa | apartamento | terreno | local ...
  price numeric,
  currency text default 'USD',
  area_m2 numeric,
  bedrooms int,
  bathrooms numeric,
  parking int,
  address_text text,
  province text,
  district text,
  corregimiento text,
  lat double precision,
  lng double precision,
  ai_summary text,
  missing_fields text[] default '{}',
  confidence_score numeric,   -- 0..1
  source_type text,           -- chat | audio | imagen | escaneo
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- MENSAJES DEL CHAT ----------
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.property_cards (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- ---------- DOCUMENTOS (imágenes / escaneos en Storage) ----------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.property_cards (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  storage_path text not null,   -- ruta dentro del bucket 'documents'
  file_type text,               -- imagen | escaneo | pdf
  created_at timestamptz not null default now()
);

-- ---------- TRANSCRIPCIONES (texto de audios ya borrados) ----------
create table if not exists public.transcriptions (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.property_cards (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

-- ---------- updated_at automático en property_cards ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_property_cards_updated_at on public.property_cards;
create trigger trg_property_cards_updated_at
  before update on public.property_cards
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS: cada usuario ve y maneja SOLO lo suyo
-- ============================================================
alter table public.property_cards enable row level security;
alter table public.chat_messages  enable row level security;
alter table public.documents      enable row level security;
alter table public.transcriptions enable row level security;

do $$
declare t text;
begin
  foreach t in array array['property_cards','chat_messages','documents','transcriptions']
  loop
    execute format('drop policy if exists "own_select" on public.%I;', t);
    execute format('drop policy if exists "own_insert" on public.%I;', t);
    execute format('drop policy if exists "own_update" on public.%I;', t);
    execute format('drop policy if exists "own_delete" on public.%I;', t);

    execute format('create policy "own_select" on public.%I for select using (user_id = auth.uid());', t);
    execute format('create policy "own_insert" on public.%I for insert with check (user_id = auth.uid());', t);
    execute format('create policy "own_update" on public.%I for update using (user_id = auth.uid());', t);
    execute format('create policy "own_delete" on public.%I for delete using (user_id = auth.uid());', t);
  end loop;
end $$;

-- ============================================================
-- STORAGE: bucket privado 'documents' (imágenes / escaneos)
-- Las rutas son: <user_id>/<archivo>
-- ============================================================
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

drop policy if exists "docs_own_all" on storage.objects;
create policy "docs_own_all" on storage.objects
  for all to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- índices útiles ----------
create index if not exists idx_chat_messages_card on public.chat_messages (card_id);
create index if not exists idx_documents_card on public.documents (card_id);
create index if not exists idx_transcriptions_card on public.transcriptions (card_id);
create index if not exists idx_property_cards_user on public.property_cards (user_id);
