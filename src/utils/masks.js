export function removeNonDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

export function formatPhone(value = "") {
  const digits = removeNonDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;

  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);

  if (rest.length <= 4) {
    return `(${ddd}) ${rest}`.trim();
  }

  const middleLength = rest.length > 8 ? 5 : 4;
  const firstPart = rest.slice(0, middleLength);
  const secondPart = rest.slice(middleLength, middleLength + 4);

  return `(${ddd}) ${firstPart}${secondPart ? `-${secondPart}` : ""}`;
}