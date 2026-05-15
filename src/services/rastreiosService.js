import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function buscarRastreioPorCodigo(codigoRastreio, supabase = getSupabaseBrowserClient()) {
  const codigo = String(codigoRastreio ?? "").trim();
  if (!codigo) return null;

  const { data, error } = await supabase.from("rastreios").select("*").eq("codigo_rastreio", codigo).maybeSingle();
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
  if (existente) return existente;

  return criarRastreio({ codigo_rastreio: codigo, rastreio_em_grupo }, supabase);
}