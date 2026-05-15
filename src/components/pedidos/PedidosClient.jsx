"use client";

import { useStatusItens } from "@/hooks/useStatusItens";
import { AppShell } from "@/components/layout/AppShell";
import { ListaPedidos } from "./ListaPedidos";

export function PedidosClient() {
  const { statusItens, carregando, erro } = useStatusItens();

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">Pedidos</h1>
          <p className="mt-1 text-sm text-zinc-400">Acompanhe todos os pedidos e seus itens individualmente.</p>
        </div>

        {erro ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Não foi possível carregar os status. Tente novamente.
          </div>
        ) : null}

        <ListaPedidos statusItens={statusItens} carregandoStatus={carregando} />
      </div>
    </AppShell>
  );
}