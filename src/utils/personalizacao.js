export function getPersonalizacaoDoItem(item) {
  const personalizacao = item?.personalizacoes_item;

  if (Array.isArray(personalizacao)) {
    return personalizacao[0] ?? null;
  }

  return personalizacao ?? null;
}

export function formatarPersonalizacaoItem(item) {
  const personalizacao = getPersonalizacaoDoItem(item);

  const nome = personalizacao?.nome_personalizado?.trim();
  const numero = personalizacao?.numero_personalizado?.trim();
  const observacao = personalizacao?.observacao_personalizacao?.trim();

  if (nome && numero) {
    return `Nome: ${nome} | Número: ${numero}`;
  }

  if (nome) {
    return `Nome: ${nome}`;
  }

  if (numero) {
    return `Número: ${numero}`;
  }

  if (observacao) {
    return observacao;
  }

  if (item?.personalizacao?.trim()) {
    return item.personalizacao.trim();
  }

  return "Sem personalização";
}

export function formatarPersonalizacaoWhatsApp(item) {
  const texto = formatarPersonalizacaoItem(item);

  if (!texto || texto === "Sem personalização") {
    return "sem personalização";
  }

  return texto;
}

export function temPersonalizacao(item) {
  const personalizacao = getPersonalizacaoDoItem(item);

  return Boolean(
    personalizacao?.nome_personalizado?.trim() ||
      personalizacao?.numero_personalizado?.trim() ||
      personalizacao?.observacao_personalizacao?.trim() ||
      item?.personalizacao?.trim(),
  );
}
