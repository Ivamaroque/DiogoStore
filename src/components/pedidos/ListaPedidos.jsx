"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePedidos } from "@/hooks/usePedidos";
import { PedidoCard } from "./PedidoCard";
import { contarItensPorRastreio } from "@/utils/rastreios";
import { sincronizarRastreiosEmGrupo } from "@/services/rastreiosService";

export function ListaPedidos({ statusItens = [] }) {
  const [termo, setTermo] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("todos");

  const filtroAtivo = useMemo(() => {
    switch (abaAtiva) {
      case "aberto":
        return { somenteComRestante: true };
      case "pronto":
        return { somenteProntos: true };
      case "entregue":
        return { somenteEntregues: true };
      case "problema":
        return { somenteComProblema: true };
      case "cancelado":
        return { somenteCancelados: true };
      default:
        return {};
    }
  }, [abaAtiva]);

  const filtros = useMemo(() => ({
    termo,
    ...filtroAtivo,
  }), [termo, filtroAtivo]);

  const { pedidos, carregando, erro, recarregar } = usePedidos(filtros);
  const contagemPorRastreio = useMemo(() => contarItensPorRastreio(pedidos), [pedidos]);

  useEffect(() => {
    void sincronizarRastreiosEmGrupo(contagemPorRastreio).catch(() => {});
  }, [contagemPorRastreio]);

  const filtrosRapidos = [
    { id: "todos", label: "Todos" },
    { id: "aberto", label: "Em aberto" },
    { id: "pronto", label: "Pronto para retirada" },
    { id: "entregue", label: "Entregue" },
    { id: "problema", label: "Problema" },
    { id: "cancelado", label: "Cancelado" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Gerenciamento de Pedidos</h1>
          <p className="mt-1 text-sm text-zinc-400">Controle individual de status por item de venda.</p>
        </div>

        <Button variant="outline" onClick={recarregar} className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800">
          {carregando ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Atualizar Lista
        </Button>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/95 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              value={termo}
              onChange={(event) => setTermo(event.target.value)}
              className="h-12 rounded-2xl border-zinc-800 bg-zinc-950 pl-11 text-white placeholder:text-zinc-500"
              placeholder="Buscar por cliente ou número do pedido..."
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {filtrosRapidos.map((filtro) => {
              const ativo = abaAtiva === filtro.id;

              return (
                <Button
                  key={filtro.id}
                  type="button"
                  variant="outline"
                  onClick={() => setAbaAtiva(filtro.id)}
                  className={ativo
                    ? "h-10 rounded-full border-brand/70 bg-brand/10 px-4 text-brand hover:bg-brand/15"
                    : "h-10 rounded-full border-zinc-800 bg-zinc-900 px-4 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800"}
                >
                  {filtro.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {erro ? (
        <Card className="border-zinc-800 bg-zinc-900/95">
          <CardContent className="px-6 py-10 text-center text-sm text-red-300">
            Não foi possível carregar os pedidos. Tente novamente.
          </CardContent>
        </Card>
      ) : carregando ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="h-[320px] animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900" />
          ))}
        </div>
      ) : pedidos.length ? (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <PedidoCard key={pedido.id} pedido={pedido} contagemPorRastreio={contagemPorRastreio} />
          ))}
        </div>
      ) : (
        <Card className="border-zinc-800 bg-zinc-900/95">
          <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
            <span className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-100">Nenhum pedido encontrado</span>
            <p className="max-w-md text-sm text-zinc-400">
              Ajuste os filtros ou crie um novo pedido para começar a usar o sistema.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}