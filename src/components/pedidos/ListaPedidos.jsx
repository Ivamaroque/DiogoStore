"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Filter, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePedidos } from "@/hooks/usePedidos";
import { PedidoCard } from "./PedidoCard";

export function ListaPedidos({ statusItens = [] }) {
  const [termo, setTermo] = useState("");
  const [statusId, setStatusId] = useState("");
  const [somenteComProblema, setSomenteComProblema] = useState(false);
  const [somenteProntos, setSomenteProntos] = useState(false);
  const [somenteEntregues, setSomenteEntregues] = useState(false);
  const [somenteCancelados, setSomenteCancelados] = useState(false);
  const [somenteComRestante, setSomenteComRestante] = useState(false);
  const [rastreioEmGrupo, setRastreioEmGrupo] = useState(false);

  const filtros = useMemo(() => ({
    termo,
    statusId,
    somenteComProblema,
    somenteProntos,
    somenteEntregues,
    somenteCancelados,
    somenteComRestante,
    rastreioEmGrupo,
  }), [termo, statusId, somenteComProblema, somenteProntos, somenteEntregues, somenteCancelados, somenteComRestante, rastreioEmGrupo]);

  const { pedidos, carregando, recarregar } = usePedidos(filtros);

  return (
    <div className="space-y-6">
      <Card className="border-zinc-800 bg-zinc-900/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Filter className="h-5 w-5 text-brand" />
            Filtros e busca
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2 lg:col-span-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input value={termo} onChange={(event) => setTermo(event.target.value)} className="pl-10" placeholder="Buscar por cliente, telefone, produto ou rastreio" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Status do item</label>
            <select
              value={statusId}
              onChange={(event) => setStatusId(event.target.value)}
              className="flex h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <option value="">Todos</option>
              {statusItens.map((status) => (
                <option key={status.id} value={status.id}>{status.nome}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 lg:col-span-2">
            <Button type="button" variant={somenteComProblema ? "default" : "outline"} onClick={() => setSomenteComProblema((value) => !value)}>
              <AlertTriangle className="h-4 w-4" />
              Problema
            </Button>
            <Button type="button" variant={somenteProntos ? "default" : "outline"} onClick={() => setSomenteProntos((value) => !value)}>
              Prontos para retirada
            </Button>
            <Button type="button" variant={somenteEntregues ? "default" : "outline"} onClick={() => setSomenteEntregues((value) => !value)}>
              Entregues
            </Button>
            <Button type="button" variant={somenteCancelados ? "default" : "outline"} onClick={() => setSomenteCancelados((value) => !value)}>
              Cancelados
            </Button>
            <Button type="button" variant={somenteComRestante ? "default" : "outline"} onClick={() => setSomenteComRestante((value) => !value)}>
              Com valor restante
            </Button>
            <Button type="button" variant={rastreioEmGrupo ? "default" : "outline"} onClick={() => setRastreioEmGrupo((value) => !value)}>
              Rastreio em grupo
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{pedidos.length} pedido(s) encontrado(s)</p>
        <Button variant="outline" size="sm" onClick={recarregar}>
          {carregando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Atualizar
        </Button>
      </div>

      {carregando ? (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900" />
          ))}
        </div>
      ) : pedidos.length ? (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {pedidos.map((pedido) => (
            <PedidoCard key={pedido.id} pedido={pedido} />
          ))}
        </div>
      ) : (
        <Card className="border-zinc-800 bg-zinc-900/95">
          <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
            <Badge variant="default">Nenhum pedido encontrado</Badge>
            <p className="max-w-md text-sm text-zinc-400">
              Ajuste os filtros ou crie um novo pedido para começar a usar o sistema.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}