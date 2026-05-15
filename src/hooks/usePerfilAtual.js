"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function usePerfilAtual(userId) {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState(null);

  useEffect(() => {
    let ativo = true;

    async function carregarPerfil() {
      if (!userId) {
        setPerfil(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const supabase = getSupabaseBrowserClient();
      const { data, error: perfilError } = await supabase
        .from("perfis")
        .select("id, nome_completo, funcao, usuario, email")
        .eq("id", userId)
        .maybeSingle();

      if (!ativo) return;

      if (perfilError) {
        setError(perfilError);
        setPerfil(null);
      } else {
        setPerfil(data ?? null);
      }

      setLoading(false);
    }

    void carregarPerfil();

    return () => {
      ativo = false;
    };
  }, [userId]);

  return { perfil, loading, error };
}