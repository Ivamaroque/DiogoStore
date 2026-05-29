"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { buscarPerfilPorId } from "@/services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [perfilLoading, setPerfilLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function carregarSessao() {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (error) {
        setSession(null);
        setLoading(false);
        return;
      }

      setSession(data.session ?? null);
      setLoading(false);
    }

    void carregarSessao();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;
    const user = session?.user ?? null;

    async function carregarPerfil() {
      if (!user) {
        if (!isMounted) return;
        setPerfil(null);
        setPerfilLoading(false);
        return;
      }

      setPerfilLoading(true);

      try {
        const perfilAtual = await buscarPerfilPorId(user.id, supabase);

        if (!isMounted) return;

        setPerfil(
          perfilAtual ?? {
            id: user.id,
            nome_completo: user.email,
            funcao: "Funcionário",
          },
        );
      } catch {
        if (!isMounted) return;

        setPerfil({
          id: user.id,
          nome_completo: user.email,
          funcao: "Funcionário",
        });
      } finally {
        if (!isMounted) return;
        setPerfilLoading(false);
      }
    }

    void carregarPerfil();

    return () => {
      isMounted = false;
    };
  }, [session, supabase]);

  const value = useMemo(() => {
    const user = session?.user ?? null;

    return {
      session,
      user,
      perfil,
      perfilLoading,
      loading,
      isAuthenticated: Boolean(user),
    };
  }, [loading, perfil, perfilLoading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}