import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function listarStatusItens(supabase = getSupabaseBrowserClient()) {
  const { data, error } = await supabase.from("status_itens").select("*").order("id", { ascending: true });

  if (error) throw error;
  return data ?? [];
}