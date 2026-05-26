import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { contarItensPorRastreio } from "@/utils/rastreios";

export async function buscarRastreioPorCodigo(codigoRastreio, supabase = getSupabaseBrowserClient()) {
  const codigo = String(codigoRastreio ?? "").trim();
  if (!codigo) return null;

  const { data, error } = await supabase
    .from("rastreios")
    .select("*")
    .eq("codigo_rastreio", codigo)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;

  return data ?? null;
}

export async function criarRastreio({ codigo_rastreio, rastreio_em_grupo }, supabase = getSupabaseBrowserClient()) {
  const codigo = String(codigo_rastreio ?? "").trim();
  if (!codigo) return null;

  const { data, error } = await supabase
    .from("rastreios")
    .insert({ codigo_rastreio: codigo, rastreio_em_grupo: Boolean(rastreio_em_grupo) })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function obterOuCriarRastreio({ codigo_rastreio, rastreio_em_grupo }, supabase = getSupabaseBrowserClient()) {
  const codigo = String(codigo_rastreio ?? "").trim();
  if (!codigo) return null;

  const existente = await buscarRastreioPorCodigo(codigo, supabase);
  if (existente) {
    if (Boolean(existente.rastreio_em_grupo) === Boolean(rastreio_em_grupo)) {
      return existente;
    }

    return criarRastreio({ codigo_rastreio: codigo, rastreio_em_grupo }, supabase);
  }

  return criarRastreio({ codigo_rastreio: codigo, rastreio_em_grupo }, supabase);
}

export async function contarUsoRastreios(supabase = getSupabaseBrowserClient()) {
  const { data, error } = await supabase
    .from("itens_pedido")
    .select("rastreio_id")
    .not("rastreio_id", "is", null);

  if (error) throw error;

  const pedidosSinteticos = [{ itens_pedido: data ?? [] }];
  return contarItensPorRastreio(pedidosSinteticos);
}

export async function sincronizarRastreiosEmGrupo(contagemPorRastreio, supabase = getSupabaseBrowserClient()) {
  const updates = Object.entries(contagemPorRastreio ?? {}).map(([rastreioId, quantidade]) =>
    supabase.from("rastreios").update({ rastreio_em_grupo: Number(quantidade) > 1 }).eq("id", rastreioId),
  );

  await Promise.allSettled(updates);
}