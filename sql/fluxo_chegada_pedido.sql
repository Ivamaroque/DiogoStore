-- Novas etapas somente para confirmações feitas após esta migração; não altera pedidos antigos.
alter table public.atualizacoes_pedido
  drop constraint chk_atualizacoes_tipo;

alter table public.atualizacoes_pedido
  add constraint chk_atualizacoes_tipo check (tipo in (
    'novo_pedido_para_gestor',
    'rastreio_adicionado_avisar_cliente',
    'pedido_aguardando_chegada',
    'pedido_chegou_avisar_cliente'
  ));

create unique index if not exists atualizacoes_pedido_etapa_chegada_unica
  on public.atualizacoes_pedido (pedido_id, tipo)
  where tipo in ('pedido_aguardando_chegada', 'pedido_chegou_avisar_cliente');

create or replace function public.confirmar_cliente_avisado(atualizacao_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  pendencia public.atualizacoes_pedido%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Acesso não autorizado';
  end if;

  select * into pendencia
  from public.atualizacoes_pedido
  where id = atualizacao_uuid and resolvida = false
    and tipo in ('rastreio_adicionado_avisar_cliente', 'pedido_chegou_avisar_cliente')
  for update;

  if not found or not (
    pendencia.destinatario_id = auth.uid()
    or pendencia.visivel_para_todos
    or (pendencia.destinatario_funcao = 'Gestor' and exists (
      select 1 from public.perfis where id = auth.uid() and funcao = 'Gestor' and ativo
    ))
  ) then
    raise exception 'Atualização indisponível para este usuário';
  end if;

  -- Serializa as confirmações dos itens do mesmo pedido para criar uma única etapa de chegada.
  perform 1 from public.pedidos where id = pendencia.pedido_id for update;

  update public.atualizacoes_pedido
  set resolvida = true, confirmado_por = auth.uid(), confirmado_em = now()
  where id = pendencia.id;

  if pendencia.tipo = 'rastreio_adicionado_avisar_cliente'
    and not exists (
      select 1 from public.atualizacoes_pedido
      where pedido_id = pendencia.pedido_id
        and tipo = 'rastreio_adicionado_avisar_cliente' and not resolvida
    ) then
    insert into public.atualizacoes_pedido (
      pedido_id, tipo, titulo, descricao, destinatario_funcao, visivel_para_todos, criado_por
    ) values (
      pendencia.pedido_id, 'pedido_aguardando_chegada', 'Aguardando chegada do pedido',
      'Cliente avisado sobre o envio. Confirme quando a encomenda chegar à loja.',
      'Gestor', false, auth.uid()
    ) on conflict do nothing;
  end if;
end;
$$;

revoke all on function public.confirmar_cliente_avisado(uuid) from public, anon;
grant execute on function public.confirmar_cliente_avisado(uuid) to authenticated;

create or replace function public.marcar_pedido_chegou(atualizacao_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  pendencia public.atualizacoes_pedido%rowtype;
  criador uuid;
begin
  if not exists (
    select 1 from public.perfis where id = auth.uid() and funcao = 'Gestor' and ativo
  ) then
    raise exception 'Apenas gestores podem confirmar a chegada';
  end if;

  select * into pendencia from public.atualizacoes_pedido
  where id = atualizacao_uuid and tipo = 'pedido_aguardando_chegada' and not resolvida
  for update;
  if not found then
    raise exception 'Atualização de chegada indisponível';
  end if;

  select criado_por into criador from public.pedidos
  where id = pendencia.pedido_id for update;

  if not exists (
    select 1 from public.itens_pedido
    where pedido_id = pendencia.pedido_id and status_item_id in (3, 4)
  ) then
    raise exception 'Este pedido não possui itens enviados';
  end if;

  update public.itens_pedido
  set status_item_id = 4, ultima_atualizacao_status = now()
  where pedido_id = pendencia.pedido_id and status_item_id = 3;

  update public.atualizacoes_pedido
  set resolvida = true, confirmado_por = auth.uid(), confirmado_em = now()
  where id = pendencia.id;

  insert into public.atualizacoes_pedido (
    pedido_id, tipo, titulo, descricao, destinatario_id, visivel_para_todos, criado_por
  ) values (
    pendencia.pedido_id, 'pedido_chegou_avisar_cliente', 'Avisar cliente sobre chegada',
    'A encomenda chegou à loja. Avise o cliente e confirme entrega ou retirada.',
    criador, criador is null, auth.uid()
  ) on conflict do nothing;
end;
$$;

revoke all on function public.marcar_pedido_chegou(uuid) from public, anon;
grant execute on function public.marcar_pedido_chegou(uuid) to authenticated;
