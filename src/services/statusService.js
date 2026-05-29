import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const statusItensPromises = new Map();

function dedupeInFlight(key, fetcher) {
  if (statusItensPromises.has(key)) {
    return statusItensPromises.get(key);
  }

  const promise = (async () => {
    try {
      return await fetcher();
    } finally {
      statusItensPromises.delete(key);
    }
  })();

  statusItensPromises.set(key, promise);
  return promise;
}

export async function listarStatusItens(supabase = getSupabaseBrowserClient()) {
  return dedupeInFlight("listarStatusItens", async () => {
    const { data, error } = await supabase.from("status_itens").select("*").order("id", { ascending: true });

    if (error) throw error;
    return data ?? [];
  });
}