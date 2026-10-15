-- ============================================================
-- Analytics de visitas do portfólio (kleberherlon.github.io)
-- Execute este arquivo inteiro no SQL Editor do Supabase
-- (Dashboard → SQL Editor → New query → Run).
-- Depois preencha visitas-config.js na raiz do repositório.
-- ============================================================

create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  ts timestamptz not null default now(),
  duration_ms int,
  path text,
  referrer text,
  origin_label text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  country text,
  region text,
  city text,
  org text,
  asn text,
  ip text,
  browser text,
  os text,
  device text,
  language text,
  timezone text,
  screen text
);

create index if not exists visits_ts_idx on public.visits (ts desc);
create index if not exists visits_vid_idx on public.visits (visitor_id);

alter table public.visits enable row level security;

-- Visitantes anônimos apenas INSEREM; ninguém lê a tabela diretamente.
-- TO public: vale para qualquer papel efetivo da publishable key (anon,
-- authenticated ou outro), evitando depender do papel exato da chave.
drop policy if exists "anon_insert_visits" on public.visits;
create policy "anon_insert_visits" on public.visits
  for insert to public with check (true);

-- Grant explícito (mesmo que as default privileges já existam).
grant insert on public.visits to anon, authenticated;

-- Leitura admin: só via RPC com a chave (troque a chave abaixo se quiser outra).
-- Mantenha a mesma string em visitas-config.js → ADMIN_KEY.
create or replace function public.visitas_admin_get(p_key text, p_limit int default 200)
returns setof public.visits
language sql
security definer
set search_path = public
as $$
  select * from public.visits
  where p_key = '565a62ba030e065554c09f7763051606'
  order by ts desc
  limit least(coalesce(p_limit, 200), 500);
$$;

-- Registra a duração da visita ao sair da página (limitada a 24h por segurança).
create or replace function public.visitas_close(p_id uuid, p_seconds int)
returns void
language sql
security definer
set search_path = public
as $$
  update public.visits
  set duration_ms = greatest(coalesce(duration_ms, 0),
                             least(greatest(coalesce(p_seconds, 0), 0), 86400) * 1000)
  where id = p_id;
$$;

revoke execute on function public.visitas_admin_get(text, int) from public;
revoke execute on function public.visitas_close(uuid, int) from public;
grant execute on function public.visitas_admin_get(text, int) to anon, authenticated;
grant execute on function public.visitas_close(uuid, int) to anon, authenticated;

-- Diagnóstico: ao final do Run, a lista abaixo deve mostrar a política
-- anon_insert_visits (cmd=i) cobrindo os papéis anon e authenticated.
select polname, polcmd,
       coalesce(array_to_string(polroles::regrole[], ', '), 'PUBLIC') as roles
from pg_policies
where schemaname = 'public' and tablename = 'visits';
