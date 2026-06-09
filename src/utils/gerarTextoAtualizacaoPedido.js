import { getPersonalizacaoDoItem } from "@/utils/personalizacao";

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

Qualquer dúvida, estamos à disposição!`;
}

export default gerarTextoAtualizacaoPedidoWhatsApp;
