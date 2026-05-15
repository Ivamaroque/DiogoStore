export function parseCurrency(value) {
  if (typeof value === "number") return value;
  if (!value) return 0;

  const normalized = String(value)
    .replace(/[^0-9,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrency(value) {
  const numberValue = Number(value || 0);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numberValue);
}

export function currencyMask(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "R$ 0,00";

  const amount = Number(digits) / 100;
  return formatCurrency(amount);
}