"use client";

import { useEffect, useState } from "react";
import { listarPedidos } from "@/services/pedidosService";

export function usePedidos(filtros = {}) {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    try {
      const dados = await listarPedidos(filtros);
      setPedidos(dados);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filtros)]);

  return {
    pedidos,
    carregando,
    recarregar: carregar,
  };
}