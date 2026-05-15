export const STATUS_FIXOS = [
  { id: 1, nome: "Pedido realizado", descricao: "Pedido cadastrado e aguardando andamento.", cor: "#f59e0b" },
  { id: 2, nome: "Aguardando envio", descricao: "Separado e pendente de envio.", cor: "#f97316" },
  { id: 3, nome: "Pedido enviado", descricao: "Item já foi despachado.", cor: "#3b82f6" },
  { id: 4, nome: "Pronto para retirada", descricao: "Disponível para retirada na loja.", cor: "#8b5cf6" },
  { id: 5, nome: "Entregue", descricao: "Pedido concluído com sucesso.", cor: "#22c55e" },
  { id: 6, nome: "Cancelado", descricao: "Processo cancelado.", cor: "#ef4444" },
  { id: 7, nome: "Item com problema", descricao: "Existe alguma pendência no item.", cor: "#f43f5e" },
];

export const STATUS_MAP = Object.fromEntries(STATUS_FIXOS.map((status) => [status.id, status]));

export function getStatusPorId(statusId) {
  return STATUS_MAP[Number(statusId)] ?? null;
}

export function getResumoPedido(itens = []) {
  if (!itens.length) return "Pedido realizado";

  const statusIds = itens.map((item) => Number(item.status_item_id ?? item.status_itens?.id)).filter(Boolean);
  if (statusIds.length && statusIds.every((id) => id === 5)) return "Pedido entregue";
  if (statusIds.includes(7)) return "Pedido com problema";
  if (statusIds.includes(4)) return "Itens prontos para retirada";
  if (statusIds.includes(3)) return "Pedido em andamento";
  return "Pedido realizado";
}

export function getStatusBadgeStyle(cor) {
  if (!cor) {
    return {
      backgroundColor: "rgba(255,255,255,0.04)",
      borderColor: "rgba(255,255,255,0.1)",
      color: "#f4f4f5",
    };
  }

  return {
    backgroundColor: `${cor}22`,
    borderColor: `${cor}55`,
    color: cor,
  };
}

export function getResumoFinanceiro(valorTotal = 0, valorPago = 0) {
  const restante = Math.max(Number(valorTotal || 0) - Number(valorPago || 0), 0);
  return {
    valorTotal: Number(valorTotal || 0),
    valorPago: Number(valorPago || 0),
    valorRestante: restante,
  };
}