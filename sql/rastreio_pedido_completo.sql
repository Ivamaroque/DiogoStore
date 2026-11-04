-- A passagem gestor -> funcionário ocorre após todos os itens terem rastreio.
-- Pedidos já existentes não são alterados retroativamente.
create or replace function public.ao_adicionar_rastreio_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pedido_criador uuid;
  funcao_criador text;
begin
  if old.rastreio_id is null and new.rastreio_id is not null then
    new.status_item_id := 3;
    new.ultima_atualizacao_status := now();

    -- Serializa adições simultâneas de rastreio para itens do mesmo pedido.
    select p.criado_por, perf.funcao
    into pedido_criador, funcao_criador
    from public.pedidos p
    left join public.perfis perf on perf.id = p.criado_por
    where p.id = new.pedido_id
    for update of p;

    if not exists (
      select 1 from public.itens_pedido item
      where item.pedido_id = new.pedido_id
        and item.id <> new.id
        and item.rastreio_id is null
    ) then
      update public.atualizacoes_pedido
      set resolvida = true, confirmado_em = now()
      where pedido_id = new.pedido_id
        and tipo = 'novo_pedido_para_gestor'
        and not resolvida;

      if not exists (
        select 1 from public.atualizacoes_pedido
        where pedido_id = new.pedido_id
          and tipo = 'rastreio_adicionado_avisar_cliente'
          and not resolvida
      ) then
        insert into public.atualizacoes_pedido (
          pedido_id, item_id, rastreio_id, tipo, titulo, descricao,
          destinatario_id, visivel_para_todos, criado_por
        ) values (
          new.pedido_id, new.id, new.rastreio_id,
          'rastreio_adicionado_avisar_cliente',
          'Avisar cliente sobre envio',
          'Todos os itens foram enviados. Avise o cliente sobre o rastreio.',
          case when funcao_criador = 'Gestor' then null else pedido_criador end,
          case when funcao_criador = 'Gestor' then true else false end,
          pedido_criador
        );
      end if;
    end if;
  end if;

  return new;
end;
$$;
