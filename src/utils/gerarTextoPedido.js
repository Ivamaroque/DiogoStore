import { getPersonalizacaoDoItem } from "@/utils/personalizacao";

export function gerarTextoPedidoWhatsApp(pedido) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value) || 0);
  };

  const formatDate = (value) => {
    if (!value) return "Não informada";

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  };

  const nomeCliente = pedido?.nome_cliente || "Não informado";
  const telefone = pedido?.telefone || "Não informado";
  const vendedor = pedido?.perfis?.nome_completo || "Não informado";

  const itens = pedido?.itens_pedido || [];
  const linhasItens = itens
    .map((item) => {
      const quantidade = item?.quantidade || 1;
      const nomeProduto = item?.nome_produto || "Produto não informado";
      const tipo = item?.tipo || "Tipo não informado";
      const tamanho = item?.tamanho || "sem tamanho";
      const codigoRastreio = item?.rastreios?.codigo_rastreio?.trim();
      const personalizacao = getPersonalizacaoDoItem(item);
      const nomePersonalizado = personalizacao?.nome_personalizado?.trim();
      const numeroPersonalizado = personalizacao?.numero_personalizado?.trim();
      const observacao = item?.observacao_status?.trim() || "";
      const personalizacaoLegada = item?.personalizacao?.trim() || "";

      const linhas = [];
      const tituloItem = codigoRastreio ? `${quantidade}x ${nomeProduto} | ${codigoRastreio}` : `${quantidade}x ${nomeProduto}`;

      linhas.push(tituloItem);
      linhas.push(`- Tipo: ${tipo}`);
      linhas.push(`- Tamanho: ${tamanho}`);

      if (nomePersonalizado) {
        linhas.push(`- Nome: ${nomePersonalizado}`);
      }

      if (numeroPersonalizado) {
        linhas.push(`- Número: ${numeroPersonalizado}`);
      }

      if (!nomePersonalizado && !numeroPersonalizado && personalizacaoLegada) {
        linhas.push(`- Personalização: ${personalizacaoLegada}`);
      }

      if (observacao) {
        linhas.push(`> Observação: ${observacao}`);
      }

      return linhas.join("\n");
    })
    .join("\n\n");

  return `ENCOMENDA

NOME DO CLIENTE:
${nomeCliente}

TELEFONE:
${telefone}

VENDEDOR:
${vendedor}

ITENS:
${linhasItens || "Nenhum item informado"}

TOTAL:
${formatCurrency(pedido?.valor_total)}

TOTAL PAGO:
${formatCurrency(pedido?.valor_pago)} (${pedido?.forma_pagamento || "Não informado"})

RESTA PAGAR:
${formatCurrency(pedido?.valor_restante)}

Informações adicionais:
* Data da encomenda: ${formatDate(pedido?.criado_em)}
* Prazo estimado: 30 - 40 dias úteis para entrega 🚚`;
}

export default gerarTextoPedidoWhatsApp;
