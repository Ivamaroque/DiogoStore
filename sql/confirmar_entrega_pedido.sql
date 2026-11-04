-- Cria a última etapa somente quando um aviso de chegada for confirmado daqui em diante.
alter table public.atualizacoes_pedido
  drop constraint chk_atualizacoes_tipo;

alter table public.atualizacoes_pedido
  add constraint chk_atualizacoes_tipo check (tipo in (
    'novo_pedido_para_gestor',
    'rastreio_adicionado_avisar_cliente',
    'pedido_aguardando_chegada',
    'pedido_chegou_avisar_cliente',
    'pedido_confirmar_entrega'
  ));

create unique index if not exists atualizacoes_pedido_confirmar_entrega_unica
  on public.atualizacoes_pedido (pedido_id, tipo)
  where tipo = 'pedido_confirmar_entrega';

create or replace function public.criar_pendencia_confirmar_entrega()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.atualizacoes_pedido (
    pedido_id, tipo, titulo, descricao, destinatario_id, visivel_para_todos, criado_por
  ) values (
    new.pedido_id, 'pedido_confirmar_entrega', 'Confirmar entrega do pedido',
    'O cliente foi avisado da chegada. Confirme quando receber ou retirar o pedido.',
    new.destinatario_id, new.visivel_para_todos, auth.uid()
  ) on conflict do nothing;

  return new;
end;
$$;

create trigger trg_criar_pendencia_confirmar_entrega
after update of resolvida on public.atualizacoes_pedido
for each row
when (
  old.resolvida = false
  and new.resolvida = true
  and new.tipo = 'pedido_chegou_avisar_cliente'
)
execute function public.criar_pendencia_confirmar_entrega();

create or replace function public.confirmar_entrega_pedido(atualizacao_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  pendencia public.atualizacoes_pedido%rowtype;
begin
  if not exists (select 1 from public.perfis where id = auth.uid() and ativo) then
    raise exception 'Acesso não autorizado';
  end if;

  select * into pendencia from public.atualizacoes_pedido
  where id = atualizacao_uuid and tipo = 'pedido_confirmar_entrega' and not resolvida
  for update;

  if not found or not (
    pendencia.destinatario_id = auth.uid()
    or (pendencia.destinatario_id is null and pendencia.visivel_para_todos and exists (
      select 1 from public.perfis where id = auth.uid() and funcao = 'Gestor'
    ))
  ) then
    raise exception 'Atualização de entrega indisponível';
  end if;

  if not exists (select 1 from public.itens_pedido where pedido_id = pendencia.pedido_id) then
    raise exception 'Este pedido não possui itens';
  end if;

  update public.itens_pedido
  set status_item_id = 5, ultima_atualizacao_status = now()
  where pedido_id = pendencia.pedido_id and status_item_id <> 5;

  update public.atualizacoes_pedido
  set resolvida = true, confirmado_por = auth.uid(), confirmado_em = now()
  where id = pendencia.id;
end;
$$;

revoke all on function public.confirmar_entrega_pedido(uuid) from public, anon;
grant execute on function public.confirmar_entrega_pedido(uuid) to authenticated;
