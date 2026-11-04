import assert from "node:assert/strict";
import { gerarTextoPedidoWhatsApp } from "./gerarTextoPedido.js";
import { gerarTextoPedidoChegouWhatsApp } from "./gerarTextoAtualizacaoPedido.js";

const pedido = {
  nome_cliente: "Maxuel",
  itens_pedido: [{
    quantidade: 1,
    nome_produto: "Camisa do Vasco",
    tipo: "Masculina",
    tamanho: "2XL",
    observacao_status: "Igual à foto",
    rastreios: { codigo_rastreio: "LZ483904775CN" },
  }],
};

const encomenda = gerarTextoPedidoWhatsApp(pedido);
assert.match(encomenda, /1x Camisa do Vasco\n- Tipo: Masculina\n- Tamanho: 2XL\n> Observação: Igual à foto\n> Código de Rastreio: LZ483904775CN/);
assert.doesNotMatch(encomenda, /Camisa do Vasco \| LZ483904775CN/);

const chegada = gerarTextoPedidoChegouWhatsApp(pedido);
assert.match(chegada, /📦 Pedido: 1x Camisa do Vasco\n- Tipo: Masculina\n- Tamanho: 2XL/);
assert.match(chegada, /entrega ou realizar a retirada/);
