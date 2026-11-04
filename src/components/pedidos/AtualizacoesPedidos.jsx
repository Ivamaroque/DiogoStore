"use client";

import { useMemo } from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getAtualizacoesAvisoDoPedido,
  getPedidosUnicosDasAtualizacoes,
} from "@/utils/atualizacoesPedido";
import { contarItensPorRastreio } from "@/utils/rastreios";
import { NotificarClienteButton } from "./NotificarClienteButton";
import { PedidoCard } from "./PedidoCard";

export function AtualizacoesPedidos({
  atualizacoes,
  totalAtualizacoes = 0,
  statusItens = [],
  erro = "",
  onRecarregar,
  onVerPedidosGerais,
  onPedidoAtualizado,
  onAtualizacoesResolvidas,
}) {
  const pedidos = useMemo(
    () => getPedidosUnicosDasAtualizacoes(atualizacoes),
    [atualizacoes],
  );

  const contagemPorRastreio = useMemo(() => contarItensPorRastreio(pedidos), [pedidos]);

  if (erro) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/95">
        <CardContent className="flex flex-col items-center gap-4 px-6 py-14 text-center">
          <p className="text-sm text-red-300">Não foi possível carregar as atualizações.</p>
          <Button type="button" variant="outline" onClick={onRecarregar} className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800">
            <RefreshCcw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!pedidos.length) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/95">
        <CardContent className="flex flex-col items-center gap-4 px-6 py-14 text-center">
          <div>
            <p className="text-lg font-semibold text-white">{totalAtualizacoes ? "Nenhum pedido encontrado neste filtro." : "Nenhuma atualização pendente."}</p>
            {!totalAtualizacoes ? <p className="mt-2 max-w-xl text-sm text-zinc-400">Quando houver pedidos aguardando ação, eles aparecerão aqui.</p> : null}
          </div>
          <Button type="button" onClick={onVerPedidosGerais} className="bg-brand text-white hover:bg-brand/90">
            Ver pedidos gerais
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pedidos.map((pedido) => {
        const atualizacoesAviso = getAtualizacoesAvisoDoPedido(atualizacoes, pedido.id);

        return (
          <PedidoCard
            key={pedido.id}
            pedido={pedido}
            statusItens={statusItens}
            contagemPorRastreio={contagemPorRastreio}
            renderActions={atualizacoesAviso.length ? (pedidoAtual) => (
              <NotificarClienteButton
                pedido={pedidoAtual}
                atualizacoes={atualizacoesAviso}
                onAtualizacoesResolvidas={onAtualizacoesResolvidas}
                onPedidoAtualizado={onPedidoAtualizado}
              />
            ) : undefined}
            onPedidoAtualizado={(pedidoAtualizado) => {
              onPedidoAtualizado?.(pedidoAtualizado);
            }}
          />
        );
      })}
    </div>
  );
}
