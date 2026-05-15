"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, getPerfilAtual, signOutUser } from "@/services/authService";

export function useAuthUser() {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    try {
      const currentUser = await getCurrentUser();
      setUsuario(currentUser);
      const perfilAtual = await getPerfilAtual();
      setPerfil(perfilAtual);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  async function sair() {
    await signOutUser();
    setUsuario(null);
    setPerfil(null);
  }

  return {
    usuario,
    perfil,
    carregando,
    recarregar: carregar,
    sair,
  };
}