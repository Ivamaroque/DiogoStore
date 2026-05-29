"use client";

import { createContext, useContext, useEffect, useMemo, useState, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { buscarPerfilPorId } from "@/services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [perfilLoading, setPerfilLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const sessionTimeoutRef = useRef(null);
  const userId = session?.user?.id ?? null;

  useEffect(() => {
    let isMounted = true;

    async function carregarSessao() {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (error) {
        setSession(null);
        setLoading(false);
        if (sessionTimeoutRef.current) {
          clearTimeout(sessionTimeoutRef.current);
          sessionTimeoutRef.current = null;
        }
        return;
      }

      setSession(data.session ?? null);
      setLoading(false);
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
    }

    void carregarSessao();

    // Fallback: if session check hangs for any reason, stop showing global loading after a short timeout
    sessionTimeoutRef.current = setTimeout(() => {
      if (isMounted) setLoading(false);
      sessionTimeoutRef.current = null;
    }, 2500);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession ?? null);
      setLoading(false);
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
    });

    return () => {
      isMounted = false;
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    async function carregarPerfil() {
      if (!userId) {
        if (!isMounted) return;
        setPerfil(null);
        setPerfilLoading(false);
        return;
      }

      setPerfilLoading(true);

      try {
        const perfilAtual = await buscarPerfilPorId(userId, supabase);

        if (!isMounted) return;

        setPerfil(
          perfilAtual ?? {
            id: userId,
            nome_completo: session?.user?.email,
            funcao: "Funcionário",
          },
        );
      } catch {
        if (!isMounted) return;

        setPerfil({
          id: userId,
          nome_completo: session?.user?.email,
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
  }, [session?.user?.email, supabase, userId]);

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