export function contarItensPorRastreio(pedidos) {
  const contagem = {};

  pedidos.forEach((pedido) => {
    pedido.itens_pedido?.forEach((item) => {
      if (!item.rastreio_id) return;

      contagem[item.rastreio_id] = (contagem[item.rastreio_id] || 0) + 1;
    });
  });

  return contagem;
}

export function isRastreioPacote(item, contagemPorRastreio) {
  if (!item?.rastreio_id) return false;

  return (contagemPorRastreio[item.rastreio_id] || 0) > 1;
}

export function getTipoRastreioLabel(item, contagemPorRastreio) {
  if (!item?.rastreio_id || !item?.rastreios) {
    return "Sem rastreio";
  }

  return isRastreioPacote(item, contagemPorRastreio) ? "Pacote" : "Individual";
}
