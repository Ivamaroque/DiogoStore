"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useStatusItens } from "@/hooks/useStatusItens";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { listarAtualizacoesPendentes } from "@/services/atualizacoesPedidoService";
import {
  filtrarAtualizacoesVisiveis,
  getPedidosUnicosDasAtualizacoes,
} from "@/utils/atualizacoesPedido";
import { AtualizacoesPedidos } from "./AtualizacoesPedidos";
import { ListaPedidos } from "./ListaPedidos";

export function PedidosClient() {
  const { statusItens, carregando, erro } = useStatusItens();
  const [modoLista, setModoLista] = useState(null);
  const [atualizacoes, setAtualizacoes] = useState([]);
  const [pedidosSincronizados, setPedidosSincronizados] = useState({});
  const [loadingAtualizacoes, setLoadingAtualizacoes] = useState(true);
  const [erroAtualizacoes, setErroAtualizacoes] = useState("");
  const atualizacoesVisiveis = useMemo(
    () => filtrarAtualizacoesVisiveis(atualizacoes),
    [atualizacoes],
  );
  const totalPedidosAtualizados = useMemo(
    () => getPedidosUnicosDasAtualizacoes(atualizacoesVisiveis).length,
    [atualizacoesVisiveis],
  );
  const sincronizarPedidoNasAtualizacoes = useCallback((pedidoAtualizado) => {
    setPedidosSincronizados((current) => ({
      ...current,
      [pedidoAtualizado.id]: pedidoAtualizado,
    }));

    setAtualizacoes((current) => current.map((atualizacao) => {
      if (String(atualizacao.pedido_id) !== String(pedidoAtualizado.id)) {
        return atualizacao;
      }

      return {
        ...atualizacao,
        pedidos: Array.isArray(atualizacao.pedidos)
          ? [pedidoAtualizado]
          : pedidoAtualizado,
      };
    }));
  }, []);

  const carregarAtualizacoes = useCallback(async () => {
    try {
      setLoadingAtualizacoes(true);
      setErroAtualizacoes("");
      const data = await listarAtualizacoesPendentes();

      const atualizacoesIniciais = filtrarAtualizacoesVisiveis(data);

      setAtualizacoes(data);
      setModoLista((modoAtual) => modoAtual ?? (atualizacoesIniciais.length > 0 ? "atualizados" : "geral"));
    } catch (error) {
      console.error(error);
      setErroAtualizacoes(error?.message || "Não foi possível carregar as atualizações.");
      setModoLista((modoAtual) => modoAtual ?? "geral");
    } finally {
      setLoadingAtualizacoes(false);
    }
  }, []);

  useEffect(() => {
    void carregarAtualizacoes();
  }, [carregarAtualizacoes]);

  return (
    <AppShell>
      <div className="space-y-6">
        {erro ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Não foi possível carregar os status. Tente novamente.
          </div>
        ) : null}

        {!modoLista || loadingAtualizacoes ? (
          <Card className="border-zinc-800 bg-zinc-900/95">
            <CardContent className="px-6 py-14 text-center text-sm text-zinc-400">
              Carregando atualizações...
            </CardContent>
          </Card>
        ) : (
          <ListaPedidos
            statusItens={statusItens}
            carregandoStatus={carregando}
            modoLista={modoLista}
            atualizacoes={atualizacoesVisiveis}
            pedidosSincronizados={pedidosSincronizados}
            atualizacoesCount={totalPedidosAtualizados}
            onModoListaChange={setModoLista}
            onPedidoAtualizado={sincronizarPedidoNasAtualizacoes}
            onAtualizacoesResolvidas={(atualizacaoIds) => {
              const idsResolvidos = new Set(atualizacaoIds.map(String));
              setAtualizacoes((current) => current.filter((item) => !idsResolvidos.has(String(item.id))));
            }}
            atualizacoesContent={(
              <AtualizacoesPedidos
                atualizacoes={atualizacoesVisiveis}
                statusItens={statusItens}
                erro={erroAtualizacoes}
                onRecarregar={carregarAtualizacoes}
                onVerPedidosGerais={() => setModoLista("geral")}
                onPedidoAtualizado={sincronizarPedidoNasAtualizacoes}
                onAtualizacoesResolvidas={(atualizacaoIds) => {
                  const idsResolvidos = new Set(atualizacaoIds.map(String));
                  setAtualizacoes((current) => current.filter((item) => !idsResolvidos.has(String(item.id))));
                }}
              />
            )}
          />
        )}
      </div>
    </AppShell>
  );
}
