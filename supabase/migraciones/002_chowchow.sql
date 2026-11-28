-- =====================================================================
--  Lomito Survivor · v0.35 · Chow chow en el ranking
--  Cómo aplicarla: Supabase → SQL Editor → New query → pegar todo → Run.
--  Se puede correr de nuevo sin romper nada (no borra datos).
--
--  La tabla partidas solo aceptaba 4 razas (001_ranking.sql). Sin esto,
--  las partidas con el Chow chow no se guardan en el ranking.
-- =====================================================================

alter table public.partidas drop constraint if exists partidas_raza_check;
alter table public.partidas add constraint partidas_raza_check
  check (raza in ('quiltro', 'pitbull', 'galgo', 'beagle', 'chowchow'));
