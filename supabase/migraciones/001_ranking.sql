-- =====================================================================
--  Lomito Survivor · v0.16 · Ranking online
--  Cómo aplicarla: Supabase → SQL Editor → New query → pegar todo → Run.
--  Se puede correr de nuevo sin romper nada (no borra datos).
--
--  Crea:
--   - jugadores: el apodo de cada usuario (id = auth.users.id)
--   - partidas: cada partida enviada al ranking (no se pueden editar ni borrar)
--   - ranking_top: mejor partida de cada jugador por raza (con apodo)
--   - ranking_general: mejor partida de cada jugador (cualquier raza)
--  La fórmula del puntaje es la misma de CONFIG.ONLINE.PUNTAJE (src/config.js).
-- =====================================================================

-- ---------------- Jugadores ----------------
create table if not exists public.jugadores (
  id      uuid primary key references auth.users (id) on delete cascade,
  apodo   text not null
          check (char_length(apodo) between 3 and 16)
          check (apodo ~ '^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ _.-]+$')
          check (apodo = btrim(apodo)),
  creado  timestamptz not null default now()
);

-- Apodo único sin importar mayúsculas ("Firulais" = "firulais")
create unique index if not exists jugadores_apodo_unico on public.jugadores (lower(apodo));

-- ---------------- Partidas ----------------
create table if not exists public.partidas (
  id                     bigint generated always as identity primary key,
  jugador_id             uuid not null references public.jugadores (id) on delete cascade,
  raza                   text not null check (raza in ('quiltro', 'pitbull', 'galgo', 'beagle')),
  -- La noche dura 10 minutos (600 s); 1200 deja margen si el jefe sigue vivo a las 06:00.
  -- Debe ser igual a CONFIG.ONLINE.SEGUNDOS_MAXIMOS.
  segundos_sobrevividos  integer not null check (segundos_sobrevividos between 0 and 1200),
  nivel                  integer not null check (nivel between 1 and 300),
  enemigos               integer not null check (enemigos between 0 and 20000),
  jefe_derrotado         boolean not null default false,
  amanecer               boolean not null default false,
  puntaje                integer not null check (puntaje >= 0),
  version_juego          text not null default '' check (char_length(version_juego) <= 20),
  creado                 timestamptz not null default now(),
  -- Trampas obvias: no puedes ver el amanecer sin derrotar al jefe ni antes de que termine la noche
  constraint amanecer_con_jefe check (not amanecer or jefe_derrotado),
  constraint amanecer_al_final check (not amanecer or segundos_sobrevividos >= 590),
  -- No más de ~20 enemigos por segundo en promedio
  constraint enemigos_posibles check (enemigos <= (segundos_sobrevividos + 10) * 20)
);

create index if not exists partidas_jugador_raza on public.partidas (jugador_id, raza, puntaje desc);

-- El puntaje lo calcula el servidor (el que manda el juego se ignora).
-- Mismos números que CONFIG.ONLINE.PUNTAJE en src/config.js.
create or replace function public.calcular_puntaje(
  segundos integer, nivel integer, enemigos integer, jefe boolean, amanecer boolean
) returns integer
language sql immutable
set search_path = ''
as $$
  select segundos * 10
       + nivel * 50
       + enemigos * 5
       + (case when jefe then 2000 else 0 end)
       + (case when amanecer then 3000 else 0 end);
$$;

create or replace function public.partidas_antes_de_insertar()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.puntaje := public.calcular_puntaje(new.segundos_sobrevividos, new.nivel, new.enemigos,
                                         new.jefe_derrotado, new.amanecer);
  new.creado := now();
  return new;
end;
$$;

drop trigger if exists partidas_puntaje on public.partidas;
create trigger partidas_puntaje
  before insert on public.partidas
  for each row execute function public.partidas_antes_de_insertar();

-- ---------------- Seguridad (RLS) ----------------
alter table public.jugadores enable row level security;
alter table public.partidas  enable row level security;

-- Permisos de tabla: leer todos; escribir solo lo justo
revoke all on public.jugadores from anon, authenticated;
revoke all on public.partidas  from anon, authenticated;
grant select on public.jugadores to anon, authenticated;
grant select on public.partidas  to anon, authenticated;
grant insert (id, apodo) on public.jugadores to authenticated;
grant update (apodo)     on public.jugadores to authenticated;
grant insert (jugador_id, raza, segundos_sobrevividos, nivel, enemigos, jefe_derrotado, amanecer, puntaje, version_juego)
  on public.partidas to authenticated;
-- (sin update ni delete en partidas: nadie puede editarlas ni borrarlas)

drop policy if exists "jugadores: todos leen" on public.jugadores;
create policy "jugadores: todos leen" on public.jugadores
  for select to anon, authenticated using (true);

drop policy if exists "jugadores: crear el propio" on public.jugadores;
create policy "jugadores: crear el propio" on public.jugadores
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "jugadores: editar el propio" on public.jugadores;
create policy "jugadores: editar el propio" on public.jugadores
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "partidas: todos leen" on public.partidas;
create policy "partidas: todos leen" on public.partidas
  for select to anon, authenticated using (true);

drop policy if exists "partidas: insertar propias" on public.partidas;
create policy "partidas: insertar propias" on public.partidas
  for insert to authenticated with check ((select auth.uid()) = jugador_id);

-- ---------------- Vistas del ranking ----------------
-- security_invoker: la vista respeta las reglas RLS de quien la consulta
create or replace view public.ranking_top with (security_invoker = true) as
  select distinct on (p.jugador_id, p.raza)
         p.jugador_id, j.apodo, p.raza, p.puntaje, p.segundos_sobrevividos, p.nivel,
         p.enemigos, p.jefe_derrotado, p.amanecer, p.version_juego, p.creado
  from public.partidas p
  join public.jugadores j on j.id = p.jugador_id
  order by p.jugador_id, p.raza, p.puntaje desc, p.creado asc;

create or replace view public.ranking_general with (security_invoker = true) as
  select distinct on (p.jugador_id)
         p.jugador_id, j.apodo, p.raza, p.puntaje, p.segundos_sobrevividos, p.nivel,
         p.enemigos, p.jefe_derrotado, p.amanecer, p.version_juego, p.creado
  from public.partidas p
  join public.jugadores j on j.id = p.jugador_id
  order by p.jugador_id, p.puntaje desc, p.creado asc;

grant select on public.ranking_top     to anon, authenticated;
grant select on public.ranking_general to anon, authenticated;
