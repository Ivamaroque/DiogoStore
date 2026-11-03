-- Estrutura aplicada no projeto Gestão Encomendas; a carga histórica foi desfeita.
create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(btrim(nome)) > 0),
  imagem_path text,
  criado_em timestamptz not null default now()
);

create unique index if not exists produtos_nome_unico on public.produtos (lower(btrim(nome)));

alter table public.itens_pedido add column if not exists produto_id uuid references public.produtos(id) on delete set null;
create index if not exists itens_pedido_produto_id_idx on public.itens_pedido (produto_id);

alter table public.produtos enable row level security;
create policy "Equipe ativa consulta produtos" on public.produtos for select to authenticated
using (exists (select 1 from public.perfis where id = (select auth.uid()) and ativo = true));
create policy "Equipe ativa cadastra produtos" on public.produtos for insert to authenticated
with check (exists (select 1 from public.perfis where id = (select auth.uid()) and ativo = true));
create policy "Equipe ativa atualiza produtos" on public.produtos for update to authenticated
using (exists (select 1 from public.perfis where id = (select auth.uid()) and ativo = true))
with check (exists (select 1 from public.perfis where id = (select auth.uid()) and ativo = true));
create policy "Equipe ativa exclui produtos" on public.produtos for delete to authenticated
using (exists (select 1 from public.perfis where id = (select auth.uid()) and ativo = true));
grant select, insert, update, delete on public.produtos to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produtos', 'produtos', true, 5242880, array['image/webp'])
on conflict (id) do nothing;

create policy "Equipe ativa envia fotos de produtos" on storage.objects for insert to authenticated
with check (bucket_id = 'produtos' and exists (select 1 from public.perfis where id = (select auth.uid()) and ativo = true));
create policy "Equipe ativa remove fotos de produtos" on storage.objects for delete to authenticated
using (bucket_id = 'produtos' and exists (select 1 from public.perfis where id = (select auth.uid()) and ativo = true));
