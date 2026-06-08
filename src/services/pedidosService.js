import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getResumoFinanceiro, getResumoPedido, getStatusPorId } from "@/lib/constants/status";
import { parseCurrency } from "@/utils/currency";
import { obterOuCriarRastreio } from "./rastreiosService";
import { getPersonalizacaoDoItem } from "@/utils/personalizacao";
import { criarPagamentoPedido } from "./pagamentosService";

const pedidosInFlight = new Map();

function dedupeInFlight(key, fetcher) {
  if (pedidosInFlight.has(key)) {
    return pedidosInFlight.get(key);
  }

  const promise = (async () => {
    try {
      return await fetcher();
    } finally {
      pedidosInFlight.delete(key);
    }
  })();

  pedidosInFlight.set(key, promise);
  return promise;
}

const PEDIDO_SELECT = `
  *,
  perfis (
    id,
    nome_completo,
    funcao
  ),
  itens_pedido (
    *,
    personalizacoes_item (
      id,
      item_id,
      nome_personalizado,
      numero_personalizado,
      observacao_personalizacao
    ),
    status_itens (
      id,
      nome,
      descricao,
      cor
    ),
    rastreios (
      id,
      codigo_rastreio,
      rastreio_em_grupo
    )
  )
`;

function buildPedidoQuery(supabase) {
  return supabase.from("pedidos").select(PEDIDO_SELECT, { count: "exact" }).order("criado_em", { ascending: false });
}

function normalizePedido(pedido) {
  if (!pedido) return null;

  const financeiro = getResumoFinanceiro(pedido.valor_total, pedido.valor_pago);
  const itens = [...(pedido.itens_pedido ?? [])]
    .map((item) => ({
      ...item,
      personalizacoes_item: getPersonalizacaoDoItem(item),
      status_itens: getStatusPorId(item.status_item_id) ?? item.status_itens,
    }))
    .sort((a, b) => new Date(a.criado_em ?? 0) - new Date(b.criado_em ?? 0));

  return {
    ...pedido,
    valor_total: financeiro.valorTotal,
    valor_pago: financeiro.valorPago,
    valor_restante: financeiro.valorRestante,
    itens_pedido: itens,
    resumo_status: getResumoPedido(itens),
  };
}

function matchText(source, term) {
  return String(source ?? "").toLowerCase().includes(term);
}

export async function listarPedidosPorPagina({ page = 1, pageSize = 10 } = {}, supabase = getSupabaseBrowserClient()) {
  const key = `listarPedidosPorPagina:${page}:${pageSize}`;

  return dedupeInFlight(key, async () => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await buildPedidoQuery(supabase).range(from, to);

    if (error) throw error;

    const pedidos = (data ?? []).map(normalizePedido).filter(Boolean);
    const total = count ?? 0;

    return {
      pedidos,
      total,
      hasMore: to + 1 < total,
    };
  });
}

export async function listarPedidos({ termo = "", statusId = "", somenteComProblema = false, somenteProntos = false, somenteEntregues = false, somenteCancelados = false, somenteComRestante = false, rastreioEmGrupo = false } = {}, supabase = getSupabaseBrowserClient()) {
  const key = `listarPedidos:${termo}:${statusId}:${somenteComProblema}:${somenteProntos}:${somenteEntregues}:${somenteCancelados}:${somenteComRestante}:${rastreioEmGrupo}`;

  return dedupeInFlight(key, async () => {
    const { data, error } = await buildPedidoQuery(supabase);
    if (error) throw error;

    const termoLimpo = termo.trim().toLowerCase();
    const pedidos = (data ?? []).map(normalizePedido);

    return pedidos.filter((pedido) => {
      const itens = pedido.itens_pedido ?? [];
      const correspondeTermo = !termoLimpo || matchText(pedido.id, termoLimpo) || matchText(pedido.nome_cliente, termoLimpo) || matchText(pedido.telefone, termoLimpo) || itens.some((item) => matchText(item.nome_produto, termoLimpo) || matchText(item.rastreios?.codigo_rastreio, termoLimpo));
      const correspondeStatus = !statusId || itens.some((item) => String(item.status_item_id) === String(statusId));
      const correspondeProblema = !somenteComProblema || itens.some((item) => Number(item.status_item_id) === 7);
      const correspondePronto = !somenteProntos || itens.some((item) => Number(item.status_item_id) === 4);
      const correspondeEntregue = !somenteEntregues || itens.some((item) => Number(item.status_item_id) === 5);
      const correspondeCancelado = !somenteCancelados || itens.some((item) => Number(item.status_item_id) === 6);
      const correspondeRestante = !somenteComRestante || Number(pedido.valor_restante) > 0;
      const correspondeRastreioGrupo = !rastreioEmGrupo || itens.some((item) => item.rastreios?.rastreio_em_grupo);

      return (
        correspondeTermo &&
        correspondeStatus &&
        correspondeProblema &&
        correspondePronto &&
        correspondeEntregue &&
        correspondeCancelado &&
        correspondeRestante &&
        correspondeRastreioGrupo
      );
    });
  });
}

export async function buscarPedidoPorId(id, supabase = getSupabaseBrowserClient()) {
  const { data, error } = await supabase.from("pedidos").select(PEDIDO_SELECT).eq("id", id).single();
  if (error) throw error;

  return normalizePedido(data);
}

export async function criarPedidoCompleto({ pedido, itens, criadoPor }, supabase = getSupabaseBrowserClient()) {
  const valorTotal = parseCurrency(pedido.valor_total);
  const valorPago = parseCurrency(pedido.valor_pago);

  const { data: pedidoCriado, error: pedidoError } = await supabase
    .from("pedidos")
    .insert({
      nome_cliente: pedido.nome_cliente,
      telefone: pedido.telefone || null,
      valor_total: valorTotal,
      valor_pago: 0,
      valor_restante: valorTotal,
      forma_pagamento: pedido.forma_pagamento || null,
      criado_por: criadoPor,
    })
    .select("*")
    .single();

  if (pedidoError) throw pedidoError;

  const itensComRastreio = [];

  for (const item of itens) {
    const rastreio = await obterOuCriarRastreio(
      {
        codigo_rastreio: item.codigo_rastreio,
        rastreio_em_grupo: item.rastreio_em_grupo,
      },
      supabase,
    );

    itensComRastreio.push({
      ...item,
      rastreio_id: rastreio?.id ?? null,
    });
  }

  const itensPayload = itensComRastreio.map((item) => ({
    pedido_id: pedidoCriado.id,
    rastreio_id: item.rastreio_id ?? null,
    quantidade: Number(item.quantidade ?? 1),
    nome_produto: item.nome_produto,
    tipo: item.tipo || null,
    tamanho: item.tamanho || null,
    observacao_status: item.observacao_status || null,
    ultima_atualizacao_status: new Date().toISOString(),
    status_item_id: Number(item.status_item_id ?? 1),
  }));

  const { data: itensCriados, error: itensError } = await supabase.from("itens_pedido").insert(itensPayload).select("*");
  if (itensError) throw itensError;

  const personalizacoesPayload = (itensCriados ?? [])
    .map((itemCriado, index) => {
      const itemOriginal = itensComRastreio[index] ?? {};
      const nome = itemOriginal.nome_personalizado?.trim() || null;
      const numero = itemOriginal.numero_personalizado?.trim() || null;

      if (!nome && !numero) return null;

      return {
        item_id: itemCriado.id,
        nome_personalizado: nome,
        numero_personalizado: numero,
      };
    })
    .filter(Boolean);

  if (personalizacoesPayload.length > 0) {
    const { error: personalizacoesError } = await supabase.from("personalizacoes_item").insert(personalizacoesPayload);
    if (personalizacoesError) throw personalizacoesError;
  }

  if (valorPago > 0) {
    await criarPagamentoPedido(
      {
        pedido_id: pedidoCriado.id,
        valor: valorPago,
        forma_pagamento: pedido.forma_pagamento,
        observacao: "Pagamento inicial",
        criado_por: criadoPor,
      },
      supabase,
    );
  }

  const pedidoAtualizado = await buscarPedidoPorId(pedidoCriado.id, supabase);
  return { pedido: pedidoAtualizado, itens: itensCriados ?? [] };
}

export async function atualizarPedido(id, payload, supabase = getSupabaseBrowserClient()) {
  const { data, error } = await supabase.from("pedidos").update(payload).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

export async function excluirPedido(id, supabase = getSupabaseBrowserClient()) {
  const { error } = await supabase.from("pedidos").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function obterResumoDashboard(supabase = getSupabaseBrowserClient()) {
  const pedidos = await listarPedidos({}, supabase);
  const totalPedidos = pedidos.length;
  const totalVendido = pedidos.reduce((soma, pedido) => soma + Number(pedido.valor_total || 0), 0);
  const totalRecebido = pedidos.reduce((soma, pedido) => soma + Number(pedido.valor_pago || 0), 0);
  const totalAReceber = pedidos.reduce((soma, pedido) => soma + Number(pedido.valor_restante || 0), 0);

  const todosItens = pedidos.flatMap((pedido) => pedido.itens_pedido ?? []);

  return {
    totalPedidos,
    totalVendido,
    totalRecebido,
    totalAReceber,
    totalItensProblema: todosItens.filter((item) => Number(item.status_item_id) === 7).length,
    totalItensProntos: todosItens.filter((item) => Number(item.status_item_id) === 4).length,
    totalItensEntregues: todosItens.filter((item) => Number(item.status_item_id) === 5).length,
    pedidosRecentes: pedidos.slice(0, 5),
  };
}
