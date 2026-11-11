import assert from "node:assert/strict";
import { prepararFotoProduto } from "./produtoImagem.mjs";

let fechou = false;
let canvas;
let resultado = new Blob(["webp"], { type: "image/webp" });
let grande = false;
globalThis.createImageBitmap = async () => ({ width: 4000, height: 2000, close: () => { fechou = true; } });
globalThis.document = { createElement: () => (canvas = {
  getContext: () => ({ drawImage: () => {} }),
  toBlob: (callback, tipo) => {
    if (grande && tipo === "image/webp") return callback(new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: tipo }));
    callback(resultado.type === "image/png" ? resultado : new Blob(["foto"], { type: tipo }));
  },
}) };

const convertido = await prepararFotoProduto({ type: "image/png", size: 100 });
assert.equal(convertido.type, "image/webp");
assert.equal(canvas.width, 2048);
assert.equal(canvas.height, 1024);
assert.equal(fechou, true);
resultado = new Blob(["png"], { type: "image/png" });
assert.equal((await prepararFotoProduto({ type: "image/png", size: 100 })).type, "image/png");
resultado = new Blob(["webp"], { type: "image/webp" });
grande = true;
assert.equal((await prepararFotoProduto({ type: "image/png", size: 100 })).type, "image/jpeg");
await assert.rejects(() => prepararFotoProduto({ type: "image/svg+xml", size: 100 }), /JPG, PNG ou WebP/);
