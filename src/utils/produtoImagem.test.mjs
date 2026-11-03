import assert from "node:assert/strict";
import { converterFotoParaWebp } from "./produtoImagem.mjs";

let fechou = false;
let canvas;
globalThis.createImageBitmap = async () => ({ width: 4000, height: 2000, close: () => { fechou = true; } });
globalThis.document = { createElement: () => (canvas = {
  getContext: () => ({ drawImage: () => {} }),
  toBlob: (callback, tipo) => callback(new Blob(["webp"], { type: tipo })),
}) };

const convertido = await converterFotoParaWebp({ type: "image/png", size: 100 });
assert.equal(convertido.type, "image/webp");
assert.equal(canvas.width, 2048);
assert.equal(canvas.height, 1024);
assert.equal(fechou, true);
await assert.rejects(() => converterFotoParaWebp({ type: "image/svg+xml", size: 100 }), /JPG, PNG ou WebP/);
