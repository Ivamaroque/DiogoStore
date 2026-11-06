export function itemDuplicado(itens, candidato, ignorarIndice = -1) {
  const campos = ["nome_produto", "tipo", "tamanho", "nome_personalizado", "numero_personalizado"];
  return itens.some((item, index) => index !== ignorarIndice && campos.every((campo) =>
    String(item[campo] ?? "").trim().toLocaleLowerCase("pt-BR") === String(candidato[campo] ?? "").trim().toLocaleLowerCase("pt-BR")));
}
