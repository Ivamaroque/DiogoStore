"use client";

import { useEffect, useState } from "react";
import { buscarPedidoPorId } from "@/services/pedidosService";

export function usePedidoPorId(pedidoId) {
  const [pedido, setPedido] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      if (!pedidoId) {
        setPedido(null);
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setErro(null);

      try {
        const dados = await buscarPedidoPorId(pedidoId);
        if (!ativo) return;
        setPedido(dados);
      } catch (error) {
        if (!ativo) return;
        setErro(error);
        setPedido(null);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [pedidoId]);

  return { pedido, carregando, erro };
}