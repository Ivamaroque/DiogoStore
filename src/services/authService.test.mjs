import assert from "node:assert/strict";
import { validarNovaSenha } from "../utils/senha.js";

assert.doesNotThrow(() => validarNovaSenha({ novaSenha: "novaSenha8", confirmarSenha: "novaSenha8" }));
assert.throws(() => validarNovaSenha({ novaSenha: "curta", confirmarSenha: "curta" }), /pelo menos 8/);
assert.throws(() => validarNovaSenha({ novaSenha: "novaSenha8", confirmarSenha: "diferente" }), /confirmação/);
