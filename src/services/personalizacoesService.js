import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function upsertPersonalizacaoItem({
  item_id,
  nome_personalizado,
  numero_personalizado,
  preservarObservacaoAntiga = false,
}) {
  const supabase = getSupabaseBrowserClient();

  const nome = nome_personalizado?.trim() || null;
  const numero = numero_personalizado?.trim() || null;

  if (!nome && !numero) {
    if (preservarObservacaoAntiga) {
      return null;
    }

    const { error } = await supabase.from("personalizacoes_item").delete().eq("item_id", item_id);

    if (error) {
      throw new Error(error.message || "Erro ao remover personalização.");
    }

    return null;
  }

  const { data, error } = await supabase
    .from("personalizacoes_item")
    .upsert(
      {
        item_id,
        nome_personalizado: nome,
        numero_personalizado: numero,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: "item_id" },
    )
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Erro ao salvar personalização.");
  }

  return data;
}
