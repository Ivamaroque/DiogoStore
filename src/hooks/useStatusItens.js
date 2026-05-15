"use client";

import { useEffect, useState } from "react";
import { listarStatusItens } from "@/services/statusService";

export function useStatusItens() {
  const [statusItens, setStatusItens] = useState([]);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    try {
      const dados = await listarStatusItens();
      setStatusItens(dados);
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
    recarregar: carregar,
  };
}