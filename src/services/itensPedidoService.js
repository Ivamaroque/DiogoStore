import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function criarItensPedido({ pedidoId, itens, supabase = getSupabaseBrowserClient() }) {
  const payload = itens.map((item) => ({
    pedido_id: pedidoId,
    rastreio_id: item.rastreio_id ?? null,
    quantidade: Number(item.quantidade ?? 1),
    nome_produto: item.nome_produto,
    tipo: item.tipo ?? null,
    tamanho: item.tamanho ?? null,
    personalizacao: item.personalizacao ?? null,
    observacao_status: item.observacao_status ?? null,
    ultima_atualizacao_status: new Date().toISOString(),
    status_item_id: Number(item.status_item_id ?? 1),
  }));

  const { data, error } = await supabase.from("itens_pedido").insert(payload).select("*");
  if (error) throw error;

  return data ?? [];
}

export async function atualizarStatusItem({ itemId, status_item_id, observacao_status }, supabase = getSupabaseBrowserClient()) {
  const { data, error } = await supabase
    .from("itens_pedido")
    .update({
      status_item_id: Number(status_item_id),
      observacao_status: observacao_status?.trim() || null,
      ultima_atualizacao_status: new Date().toISOString(),
    })
    .eq("id", itemId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function atualizarRastreioItem({ itemId, rastreio_id }, supabase = getSupabaseBrowserClient()) {
  const { data, error } = await supabase
    .from("itens_pedido")
    .update({ rastreio_id: rastreio_id ?? null })
    .eq("id", itemId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function atualizarObservacaoItem({ itemId, observacao_status }, supabase = getSupabaseBrowserClient()) {
  const { data, error } = await supabase
    .from("itens_pedido")
    .update({ observacao_status: observacao_status?.trim() || null })
    .eq("id", itemId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deletarItem(itemId, supabase = getSupabaseBrowserClient()) {
  const { error } = await supabase.from("itens_pedido").delete().eq("id", itemId);
  if (error) throw error;
}