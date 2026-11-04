export function linkWhatsAppPedido(telefone, mensagem) {
  let numero = String(telefone ?? "").replace(/\D/g, "");
  if (numero.startsWith("0") && [11, 12].includes(numero.length)) numero = numero.slice(1);
  if ([10, 11].includes(numero.length)) numero = `55${numero}`;
  if (!/^55\d{10,11}$/.test(numero)) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
