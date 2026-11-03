import { getStatusResumoPedido } from "../lib/constants/status.js";

export const TIPO_NOVO_PEDIDO_GESTOR = "novo_pedido_para_gestor";
export const TIPO_AVISAR_CLIENTE = "rastreio_adicionado_avisar_cliente";

export function getPedidoDaAtualizacao(atualizacao) {
  return Array.isArray(atualizacao?.pedidos)
    ? atualizacao.pedidos[0]
    : atualizacao?.pedidos;
}

export function pedidoCorrespondeFiltros(pedido, { termo = "", status = "todos", funcionarioId = "" } = {}, statusItens = []) {
  if (!pedido) return false;
  if (funcionarioId && String(pedido.criado_por) !== String(funcionarioId)) return false;
  const itens = pedido.itens_pedido ?? [];
  if (status !== "todos" && getStatusResumoPedido(itens, statusItens).chave !== status) return false;

  const busca = termo.trim().toLocaleLowerCase("pt-BR");
  if (!busca) return true;
  return [pedido.nome_cliente, pedido.telefone, ...itens.flatMap((item) => [item.nome_produto, item.rastreios?.codigo_rastreio])]
    .some((valor) => String(valor ?? "").toLocaleLowerCase("pt-BR").includes(busca));
}

export function todosItensPossuemRastreio(pedido) {
  const itens = Array.isArray(pedido?.itens_pedido) ? pedido.itens_pedido : [];

  return itens.length > 0 && itens.every((item) => item?.rastreios?.codigo_rastreio?.trim());
}

export function filtrarAtualizacoesVisiveis(atualizacoes) {
  return atualizacoes.filter((atualizacao) => {
    const pedido = getPedidoDaAtualizacao(atualizacao);

    if (getStatusResumoPedido(pedido?.itens_pedido).chave === "finalizado") {
      return false;
    }

    if (atualizacao.tipo !== TIPO_NOVO_PEDIDO_GESTOR) {
      return true;
    }

    return !todosItensPossuemRastreio(pedido);
  });
}

export function getPedidosUnicosDasAtualizacoes(atualizacoes) {
  const pedidosPorId = new Map();

  atualizacoes.forEach((atualizacao) => {
    const pedido = getPedidoDaAtualizacao(atualizacao);

    if (pedido?.id && !pedidosPorId.has(String(pedido.id))) {
      pedidosPorId.set(String(pedido.id), pedido);
    }
  });

  return [...pedidosPorId.values()];
}

export function getAtualizacoesAvisoDoPedido(atualizacoes, pedidoId) {
  return atualizacoes.filter((atualizacao) => (
    String(atualizacao.pedido_id) === String(pedidoId) &&
    atualizacao.tipo === TIPO_AVISAR_CLIENTE
  ));
}
