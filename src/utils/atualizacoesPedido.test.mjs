import assert from "node:assert/strict";
import { getAtualizacoesAvisoDoPedido, getPedidoDaAtualizacao, pedidoCorrespondeFiltros } from "./atualizacoesPedido.js";

const statusItens = [
  { id: 1, nome: "Pedido realizado" },
  { id: 3, nome: "Pedido enviado" },
  { id: 4, nome: "Pronto para retirada" },
];
const pedido = {
  criado_por: "funcionario-1",
  nome_cliente: "João Silva",
  telefone: "(84) 99999-1234",
  itens_pedido: [{ nome_produto: "Camisa Vermelha", status_item_id: 4, rastreios: { codigo_rastreio: "BR123" } }],
};
const atualizacao = { pedidos: pedido };

assert.equal(pedidoCorrespondeFiltros(getPedidoDaAtualizacao(atualizacao), { termo: "camisa", status: "pronto" }, statusItens), true);
assert.equal(pedidoCorrespondeFiltros(pedido, { termo: "br123", status: "pronto" }, statusItens), true);
assert.equal(pedidoCorrespondeFiltros(pedido, { termo: "joão", status: "aberto" }, statusItens), false);
assert.equal(pedidoCorrespondeFiltros(pedido, { termo: "outro", status: "todos" }, statusItens), false);
assert.equal(pedidoCorrespondeFiltros(pedido, { funcionarioId: "funcionario-1" }, statusItens), true);
assert.equal(pedidoCorrespondeFiltros(pedido, { funcionarioId: "funcionario-2" }, statusItens), false);
const pedidoEnviado = { ...pedido, itens_pedido: [{ status_item_id: 3, nome_produto: "Camisa Vermelha" }] };
assert.equal(pedidoCorrespondeFiltros(pedidoEnviado, { status: "enviado" }, statusItens), true);
assert.equal(pedidoCorrespondeFiltros(pedidoEnviado, { status: "aberto" }, statusItens), false);
assert.equal(pedidoCorrespondeFiltros({ ...pedido, itens_pedido: [{ status_item_id: 1 }, { status_item_id: 3 }] }, { status: "aberto" }, statusItens), true);
assert.deepEqual(getAtualizacoesAvisoDoPedido([
  { id: 1, pedido_id: "pedido-1", tipo: "pedido_aguardando_chegada" },
  { id: 2, pedido_id: "pedido-1", tipo: "pedido_chegou_avisar_cliente" },
  { id: 3, pedido_id: "pedido-2", tipo: "pedido_aguardando_chegada" },
  { id: 4, pedido_id: "pedido-1", tipo: "pedido_confirmar_entrega" },
], "pedido-1").map((item) => item.id), [1, 2, 4]);
