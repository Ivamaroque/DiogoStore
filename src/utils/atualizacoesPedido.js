import { getStatusResumoPedido } from "@/lib/constants/status";

export const TIPO_NOVO_PEDIDO_GESTOR = "novo_pedido_para_gestor";
export const TIPO_AVISAR_CLIENTE = "rastreio_adicionado_avisar_cliente";

export function getPedidoDaAtualizacao(atualizacao) {
  return Array.isArray(atualizacao?.pedidos)
    ? atualizacao.pedidos[0]
    : atualizacao?.pedidos;
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
