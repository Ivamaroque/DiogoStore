"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function usePerfilAtual(userId) {
  const { user, perfil: perfilAutenticado, perfilLoading } = useAuth();
  const [perfilLocal, setPerfilLocal] = useState(null);
  const [loadingLocal, setLoadingLocal] = useState(Boolean(userId));
  const [errorLocal, setErrorLocal] = useState(null);

  const mesmoUsuarioLogado = Boolean(userId) && String(userId) === String(user?.id ?? "");

  useEffect(() => {
    let ativo = true;

    async function carregarPerfil() {
      if (!userId || mesmoUsuarioLogado) {
        setPerfilLocal(null);
        setLoadingLocal(false);
        setErrorLocal(null);
        return;
      }

      setLoadingLocal(true);
      setErrorLocal(null);

      const supabase = getSupabaseBrowserClient();
      const { data, error: perfilError } = await supabase
        .from("perfis")
        .select("id, nome_completo, funcao, usuario, email")
        .eq("id", userId)
        .maybeSingle();

      if (!ativo) return;

      if (perfilError) {
        setErrorLocal(perfilError);
        setPerfilLocal(null);
      } else {
        setPerfilLocal(data ?? null);
      }

      setLoadingLocal(false);
    }

    void carregarPerfil();

    return () => {
      ativo = false;
    };
  }, [mesmoUsuarioLogado, userId]);

  return {
    perfil: mesmoUsuarioLogado ? perfilAutenticado : perfilLocal,
    loading: mesmoUsuarioLogado ? perfilLoading : loadingLocal,
    error: mesmoUsuarioLogado ? null : errorLocal,
  };
}