import { getPersonalizacaoDoItem } from "./personalizacao.js";

export function gerarTextoAtualizacaoPedidoWhatsApp(pedido) {
  const nomeCliente = pedido?.nome_cliente || "cliente";
  const itens = Array.isArray(pedido?.itens_pedido) ? pedido.itens_pedido : [];
  const itensComRastreio = itens.filter((item) => item?.rastreios?.codigo_rastreio?.trim());

  if (!itensComRastreio.length) {
    return "";
  }

  const linhasItens = itensComRastreio
    .map((item) => {
      const quantidade = item?.quantidade || 1;
      const nomeProduto = item?.nome_produto || "Produto não informado";
      const tipo = item?.tipo || "Tipo não informado";
      const tamanho = item?.tamanho || "sem tamanho";
      const codigoRastreio = item.rastreios.codigo_rastreio.trim();
      const personalizacao = getPersonalizacaoDoItem(item);
      const nomePersonalizado = personalizacao?.nome_personalizado?.trim();
      const numeroPersonalizado = personalizacao?.numero_personalizado?.trim();
      const linhas = [
        `${quantidade}x ${nomeProduto}`,
        `- Tipo: ${tipo}`,
        `- Tamanho: ${tamanho}`,
      ];

      if (nomePersonalizado) {
        linhas.push(`- Nome: ${nomePersonalizado}`);
      }

      if (numeroPersonalizado) {
        linhas.push(`- Número: ${numeroPersonalizado}`);
      }

      linhas.push(`- Rastreio: ${codigoRastreio}`);

      return linhas.join("\n");
    })
    .join("\n\n");

  return `Olá, ${nomeCliente}! 😊

Seu pedido na *Diogo Store* foi enviado.

📦 *Itens enviados:*

${linhasItens}

Você pode acompanhar a entrega pelo código de rastreio informado. 🚚
Link dos Correios para rastrear: https://rastreamento.correios.com.br/app/index.php

Qualquer dúvida, estamos à disposição!`;
}

export function gerarTextoPedidoChegouWhatsApp(pedido) {
  const itens = Array.isArray(pedido?.itens_pedido) ? pedido.itens_pedido : [];
  const descricao = itens.map((item) => [
    `${item.quantidade || 1}x ${item.nome_produto || "Produto não informado"}`,
    item.tipo ? `- Tipo: ${item.tipo}` : null,
    item.tamanho ? `- Tamanho: ${item.tamanho}` : null,
  ].filter(Boolean).join("\n")).join("\n\n");

  return `Olá! Temos uma ótima notícia: seu pedido por encomenda chegou! 🧡

📦 Pedido: ${descricao || "Pedido sem itens"}

Gostaríamos de confirmar: você prefere receber por entrega ou realizar a retirada em nossa loja?

Ficamos no aguardo! 😊`;
}

export default gerarTextoAtualizacaoPedidoWhatsApp;
