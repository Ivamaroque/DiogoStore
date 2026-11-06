import assert from "node:assert/strict";
import { itemDuplicado } from "./itemDuplicado.mjs";

const item = { nome_produto: "Camisa do Vasco", tipo: "Masculina", tamanho: "G", numero_personalizado: "10" };
assert.equal(itemDuplicado([item], { ...item, nome_produto: " camisa DO vasco " }), true);
assert.equal(itemDuplicado([item], { ...item, tamanho: "GG" }), false);
assert.equal(itemDuplicado([item], { ...item, numero_personalizado: "11" }), false);
assert.equal(itemDuplicado([item], item, 0), false);
