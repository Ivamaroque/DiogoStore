export function getStatusPorId(statusId, statusItens = []) {
  return statusItens.find((status) => String(status.id) === String(statusId)) ?? null;
}

function normalizarStatus(status) {
  return Array.isArray(status) ? status[0] ?? null : status ?? null;
}

export function getStatusDoItem(item, statusItens = []) {
  if (!item) return null;
  return normalizarStatus(item.status_itens) ?? getStatusPorId(item.status_item_id, statusItens);
}

function encontrarStatus(statusItens, nomes) {
  const termos = nomes.map((nome) => nome.toLowerCase());
  return statusItens.find((status) => termos.includes(status.nome?.trim().toLowerCase())) ?? null;
}

function criarResumo(chave, nome, descricao, statusBase, corFallback) {
  return {
    ...statusBase,
    chave,
    nome,
    descricao,
    cor: statusBase?.cor || corFallback,
  };
}

export function getStatusResumoPedido(itens = [], statusItens = []) {
  const statusResolvidos = itens.map((item) => getStatusDoItem(item, statusItens));
  const statusValidos = statusResolvidos.filter(Boolean);
  const catalogoStatus = [...statusItens];

  statusValidos.forEach((status) => {
    if (!catalogoStatus.some((item) => String(item.id) === String(status.id))) {
      catalogoStatus.push(status);
    }
  });

  const statusRealizado = encontrarStatus(catalogoStatus, ["Pedido realizado"]);
  const statusEnviado = encontrarStatus(catalogoStatus, ["Pedido enviado"]);
  const statusPronto = encontrarStatus(catalogoStatus, ["Pronto para retirada"]);
  const statusFinalizado = encontrarStatus(catalogoStatus, ["Finalizado", "Entregue"]);
  const statusCancelado = encontrarStatus(catalogoStatus, ["Cancelado"]);
  const statusProblema = encontrarStatus(catalogoStatus, ["Item com problema", "Problema"]);

  if (statusProblema && statusValidos.some((status) => String(status.id) === String(statusProblema.id))) {
    return criarResumo(
      "problema",
      "Problema",
      "Existe pelo menos um item com problema.",
      statusProblema,
      "#dc2626",
    );
  }

  if (statusCancelado && statusValidos.some((status) => String(status.id) === String(statusCancelado.id))) {
    return criarResumo(
      "cancelado",
      "Cancelado",
      "Existe pelo menos um item cancelado.",
      statusCancelado,
      "#ef4444",
    );
  }

  if (
    itens.length > 0 &&
    statusFinalizado &&
    statusValidos.length === itens.length &&
    statusValidos.every((status) => String(status.id) === String(statusFinalizado.id))
  ) {
    return criarResumo(
      "finalizado",
      "Finalizado",
      "Todos os itens foram finalizados.",
      statusFinalizado,
      "#16a34a",
    );
  }

  if (statusPronto && statusValidos.some((status) => String(status.id) === String(statusPronto.id))) {
    return criarResumo(
      "pronto",
      "Pronto para retirada",
      "Existe pelo menos um item pronto para retirada.",
      statusPronto,
      "#10b981",
    );
  }

  const possuiItemEmAberto = statusValidos.some((status) => (
    String(status.id) === String(statusRealizado?.id) ||
    String(status.id) === String(statusEnviado?.id)
  ));

  return criarResumo(
    "aberto",
    "Em aberto",
    possuiItemEmAberto
      ? "Existem itens realizados ou enviados."
      : "O pedido ainda possui itens em andamento.",
    null,
    "#ef4444",
  );
}

export function getResumoPedido(itens = [], statusItens = []) {
  return getStatusResumoPedido(itens, statusItens)?.nome ?? "Sem status";
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
