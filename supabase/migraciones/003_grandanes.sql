-- =====================================================================
--  Lomito Survivor · v0.36 · Gran danés en el ranking
--  Cómo aplicarla: Supabase → SQL Editor → New query → pegar todo → Run.
--  Se puede correr de nuevo sin romper nada (no borra datos).
--
--  La tabla partidas solo acepta las razas de la lista (002_chowchow.sql).
--  Sin esto, las partidas con el Gran danés no se guardan en el ranking.
-- =====================================================================

alter table public.partidas drop constraint if exists partidas_raza_check;
alter table public.partidas add constraint partidas_raza_check
  check (raza in ('quiltro', 'pitbull', 'galgo', 'beagle', 'chowchow', 'grandanes'));
