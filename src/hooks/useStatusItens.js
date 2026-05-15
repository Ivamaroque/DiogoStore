"use client";

import { useEffect, useState } from "react";
import { listarStatusItens } from "@/services/statusService";

export function useStatusItens() {
  const [statusItens, setStatusItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await listarStatusItens();
      setStatusItens(dados);
    } catch (error) {
      setErro(error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  return {
    statusItens,
    carregando,
    erro,
    recarregar: carregar,
  };
}