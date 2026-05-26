"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { usePedidoPorId } from "@/hooks/usePedidoPorId";
import { useStatusItens } from "@/hooks/useStatusItens";
import { PedidoDetalhes } from "./PedidoDetalhes";
import { contarUsoRastreios, sincronizarRastreiosEmGrupo } from "@/services/rastreiosService";

export function PedidoDetalheClient({ pedidoId }) {
  const { pedido, carregando, erro } = usePedidoPorId(pedidoId);
  const { statusItens } = useStatusItens();
  const [contagemPorRastreio, setContagemPorRastreio] = useState({});

  useEffect(() => {
    let ativo = true;

    async function carregarContagem() {
      try {
        const contagem = await contarUsoRastreios();
        if (!ativo) return;
        setContagemPorRastreio(contagem);
        void sincronizarRastreiosEmGrupo(contagem).catch(() => {});
      } catch {
        if (!ativo) return;
        setContagemPorRastreio({});
      }
    }

    void carregarContagem();

    return () => {
      ativo = false;
    };
  }, [pedidoId]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">Detalhes do pedido</h1>
          <p className="mt-1 text-sm text-zinc-400">Visualize cliente, itens, rastreios e status individuais.</p>
        </div>

        {erro ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Não foi possível carregar o pedido. Tente novamente.
          </div>
        ) : null}

        {carregando ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-sm text-zinc-400">Carregando pedido...</div>
        ) : (
          <PedidoDetalhes pedidoInicial={pedido} statusItens={statusItens} contagemPorRastreio={contagemPorRastreio} />
        )}
      </div>
    </AppShell>
  );
}