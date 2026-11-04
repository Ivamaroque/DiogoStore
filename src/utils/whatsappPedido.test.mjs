import assert from "node:assert/strict";
import { linkWhatsAppPedido } from "./whatsappPedido.js";

const texto = "Olá! Pedido chegou 🧡";
assert.equal(linkWhatsAppPedido("(84) 99973-7481", texto), `https://wa.me/5584999737481?text=${encodeURIComponent(texto)}`);
assert.equal(linkWhatsAppPedido("+55 (84) 99973-7481", texto), `https://wa.me/5584999737481?text=${encodeURIComponent(texto)}`);
assert.equal(linkWhatsAppPedido("084999737481", texto), `https://wa.me/5584999737481?text=${encodeURIComponent(texto)}`);
assert.equal(linkWhatsAppPedido("99973-7481", texto), null);
