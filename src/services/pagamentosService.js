import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function listarPagamentosPedido(pedidoId) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("pagamentos_pedido")
    .select(`
      id,
      pedido_id,
      valor,
      forma_pagamento,
      observacao,
      criado_por,
      criado_em,
      perfis (
        id,
        nome_completo,
        funcao
      )
    `)
    .eq("pedido_id", pedidoId)
    .order("criado_em", { ascending: false });

  if (error) {
    throw new Error(error.message || "Erro ao listar pagamentos.");
  }

  return data ?? [];
}

export async function criarPagamentoPedido({
  pedido_id,
  valor,
  forma_pagamento,
  observacao,
  criado_por,
}, supabase = getSupabaseBrowserClient()) {
  const valorNumerico = Number(valor) || 0;

  if (valorNumerico <= 0) {
    throw new Error("Informe um valor de pagamento válido.");
  }

  if (!forma_pagamento?.trim()) {
    throw new Error("Informe a forma de pagamento.");
  }

  if (!criado_por) {
    throw new Error("Usuário responsável pelo pagamento não encontrado.");
  }

  const { data, error } = await supabase
    .from("pagamentos_pedido")
    .insert({
      pedido_id,
      valor: valorNumerico,
      forma_pagamento: forma_pagamento.trim(),
      observacao: observacao?.trim() || null,
      criado_por,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Erro ao registrar pagamento.");
  }

  return data;
}
