import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function listarAtualizacoesPendentes(supabase = getSupabaseBrowserClient()) {
  const { data, error } = await supabase
    .from("atualizacoes_pedido")
    .select(`
      id,
      pedido_id,
      item_id,
      rastreio_id,
      tipo,
      titulo,
      descricao,
      destinatario_id,
      destinatario_funcao,
      visivel_para_todos,
      resolvida,
      confirmado_por,
      confirmado_em,
      criado_por,
      criado_em,
      pedidos (
        *,
        perfis (
          id,
          nome_completo,
          funcao
        ),
        itens_pedido (
          *,
          status_itens (
            id,
            nome,
            descricao,
            cor
          ),
          rastreios (
            id,
            codigo_rastreio,
            rastreio_em_grupo
          ),
          personalizacoes_item (
            id,
            item_id,
            nome_personalizado,
            numero_personalizado,
            observacao_personalizacao
          )
        )
      ),
      itens_pedido (
        *,
        status_itens (
          id,
          nome,
          descricao,
          cor
        ),
        rastreios (
          id,
          codigo_rastreio,
          rastreio_em_grupo
        ),
        personalizacoes_item (
          id,
          item_id,
          nome_personalizado,
          numero_personalizado,
          observacao_personalizacao
        )
      )
    `)
    .eq("resolvida", false)
    .order("criado_em", { ascending: false });

  if (error) {
    throw new Error(error.message || "Erro ao carregar atualizações.");
  }

  return data ?? [];
}

export async function confirmarClienteAvisado(atualizacaoId, supabase = getSupabaseBrowserClient()) {
  const { error } = await supabase.rpc("confirmar_cliente_avisado", {
    atualizacao_uuid: atualizacaoId,
  });

  if (error) {
    throw new Error(error.message || "Erro ao confirmar atualização.");
  }

  return true;
}
