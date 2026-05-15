"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PedidoForm } from "./PedidoForm";

export function NovoPedidoClient() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">Novo pedido</h1>
          <p className="mt-1 text-sm text-zinc-400">Cadastre cliente, itens, rastreio e pagamento em um fluxo único.</p>
        </div>
        <PedidoForm />
      </div>
    </AppShell>
  );
}