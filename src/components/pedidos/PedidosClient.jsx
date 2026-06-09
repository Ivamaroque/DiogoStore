"use client";

import { useCallback, useEffect, useState } from "react";
import { useStatusItens } from "@/hooks/useStatusItens";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { listarAtualizacoesPendentes } from "@/services/atualizacoesPedidoService";
import { AtualizacoesPedidos } from "./AtualizacoesPedidos";
import { ListaPedidos } from "./ListaPedidos";

export function PedidosClient() {
  const { statusItens, carregando, erro } = useStatusItens();
  const [modoLista, setModoLista] = useState(null);
  const [atualizacoes, setAtualizacoes] = useState([]);
  const [loadingAtualizacoes, setLoadingAtualizacoes] = useState(true);
  const [erroAtualizacoes, setErroAtualizacoes] = useState("");

  const carregarAtualizacoes = useCallback(async () => {
    try {
      setLoadingAtualizacoes(true);
      setErroAtualizacoes("");
      const data = await listarAtualizacoesPendentes();

      setAtualizacoes(data);
      setModoLista((modoAtual) => modoAtual ?? (data.length > 0 ? "atualizados" : "geral"));
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
            atualizacoesCount={atualizacoes.length}
            onModoListaChange={setModoLista}
            atualizacoesContent={(
              <AtualizacoesPedidos
                atualizacoes={atualizacoes}
                statusItens={statusItens}
                erro={erroAtualizacoes}
                onRecarregar={carregarAtualizacoes}
                onVerPedidosGerais={() => setModoLista("geral")}
                onAtualizacaoResolvida={(atualizacaoId) => {
                  setAtualizacoes((current) => current.filter((item) => item.id !== atualizacaoId));
                }}
              />
            )}
          />
        )}
      </div>
    </AppShell>
  );
}
