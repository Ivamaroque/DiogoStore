"use client";

import { useEffect, useState } from "react";
import { listarPedidos } from "@/services/pedidosService";

export function usePedidos(filtros = {}) {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await listarPedidos(filtros);
      setPedidos(dados);
    } catch (error) {
      setErro(error);
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
    erro,
    recarregar: carregar,
  };
}