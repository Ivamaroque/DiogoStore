"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, CreditCard, Package, PencilLine, Phone, Save, Truck, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FinanceiroResumo } from "./FinanceiroResumo";
import { StatusBadge } from "./StatusBadge";
import { RastreioBadge } from "./RastreioBadge";
import { AtualizarStatusItemDialog } from "./AtualizarStatusItemDialog";
import { atualizarRastreioItem } from "@/services/itensPedidoService";
import { obterOuCriarRastreio } from "@/services/rastreiosService";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/dates";

export function PedidoDetalhes({ pedidoInicial, statusItens }) {
  const [pedido, setPedido] = useState(pedidoInicial);
  const [rastreioAbertoId, setRastreioAbertoId] = useState(null);
  const [rastreioCodigo, setRastreioCodigo] = useState("");
  const [rastreioEmGrupo, setRastreioEmGrupo] = useState(false);
  const [salvandoRastreio, setSalvandoRastreio] = useState(false);

  const financeiros = useMemo(() => ({
    valorTotal: Number(pedido?.valor_total || 0),
    valorPago: Number(pedido?.valor_pago || 0),
    valorRestante: Number(pedido?.valor_restante || 0),
  }), [pedido]);

  async function salvarRastreio(itemId) {
    setSalvandoRastreio(true);
    try {
      const rastreio = await obterOuCriarRastreio({ codigo_rastreio: rastreioCodigo, rastreio_em_grupo: rastreioEmGrupo });
      const itemAtualizado = await atualizarRastreioItem({ itemId, rastreio_id: rastreio?.id ?? null });

      setPedido((current) => ({
        ...current,
        itens_pedido: current.itens_pedido.map((item) => (item.id === itemId ? { ...item, rastreio_id: itemAtualizado.rastreio_id, rastreios: rastreio } : item)),
      }));

      toast.success("Rastreio atualizado.");
      setRastreioAbertoId(null);
      setRastreioCodigo("");
    } catch (error) {
      toast.error(error?.message || "Não foi possível atualizar o rastreio.");
    } finally {
      setSalvandoRastreio(false);
    }
  }

  function onStatusUpdated(itemAtualizado) {
    setPedido((current) => ({
      ...current,
      itens_pedido: current.itens_pedido.map((item) => (item.id === itemAtualizado.id ? { ...item, ...itemAtualizado } : item)),
    }));
  }

  if (!pedido) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-zinc-800 bg-zinc-900/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <User className="h-5 w-5 text-brand" />
              Dados do cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-zinc-300">
            <div className="flex items-center justify-between gap-4"><span>Cliente</span><span className="font-medium text-white">{pedido.nome_cliente}</span></div>
            <div className="flex items-center justify-between gap-4"><span>Telefone</span><span className="font-medium text-white">{pedido.telefone || "—"}</span></div>
            <div className="flex items-center justify-between gap-4"><span>Criado em</span><span className="font-medium text-white">{formatDateTime(pedido.criado_em)}</span></div>
            <div className="flex items-center justify-between gap-4"><span>Funcionário</span><span className="font-medium text-white">{pedido.perfis?.nome_completo || "—"}</span></div>
            <div className="flex items-center justify-between gap-4"><span>Função</span><span className="font-medium text-white">{pedido.perfis?.funcao || "—"}</span></div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CreditCard className="h-5 w-5 text-brand" />
              Resumo financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FinanceiroResumo {...financeiros} />
            <div className="grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Forma de pagamento</p><p className="mt-1 text-white">{pedido.forma_pagamento || "—"}</p></div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total de itens</p><p className="mt-1 text-white">{pedido.itens_pedido?.length || 0}</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Package className="h-5 w-5 text-brand" />
            Itens do pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pedido.itens_pedido?.length ? (
            pedido.itens_pedido.map((item) => (
              <div key={item.id} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{item.nome_produto}</h3>
                      <Badge variant="brand">Qtd. {item.quantidade}</Badge>
                    </div>
                    <div className="grid gap-2 text-sm text-zinc-400 sm:grid-cols-2 lg:grid-cols-3">
                      <p>Tipo: <span className="text-white">{item.tipo || "—"}</span></p>
                      <p>Tamanho: <span className="text-white">{item.tamanho || "—"}</span></p>
                      <p>Status: <span className="text-white">{item.status_itens?.nome || "—"}</span></p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={item.status_itens} />
                      <RastreioBadge rastreio={item.rastreios} />
                      {item.status_itens?.cor ? <Badge variant="default">Cor: {item.status_itens.cor}</Badge> : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <AtualizarStatusItemDialog item={item} statusItens={statusItens} onUpdated={onStatusUpdated} />
                    <Button variant="outline" size="sm" onClick={() => { setRastreioAbertoId((current) => (current === item.id ? null : item.id)); setRastreioCodigo(item.rastreios?.codigo_rastreio ?? ""); setRastreioEmGrupo(Boolean(item.rastreios?.rastreio_em_grupo)); }}>
                      <Truck className="h-4 w-4" />
                      Rastreio
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Personalização</p>
                    <p className="mt-1 text-white">{item.personalizacao || "—"}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Última atualização</p>
                    <p className="mt-1 text-white">{formatDateTime(item.ultima_atualizacao_status)}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Observação do status</p>
                  <p className="mt-1 text-sm text-white">{item.observacao_status || "Sem observação"}</p>
                </div>

                {rastreioAbertoId === item.id ? (
                  <div className="mt-4 space-y-3 rounded-2xl border border-brand/20 bg-brand/5 p-4">
                    <div className="space-y-2">
                      <Label>Código de rastreio</Label>
                      <Input value={rastreioCodigo} onChange={(event) => setRastreioCodigo(event.target.value)} placeholder="Opcional" />
                    </div>

                    <label className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white">
                      <span>Rastreio em grupo</span>
                      <input type="checkbox" checked={rastreioEmGrupo} onChange={(event) => setRastreioEmGrupo(event.target.checked)} className="h-4 w-4 accent-brand" />
                    </label>

                    <div className="flex flex-wrap items-center gap-3">
                      <Button onClick={() => salvarRastreio(item.id)} disabled={salvandoRastreio} className="gap-2">
                        {salvandoRastreio ? <Save className="h-4 w-4 animate-pulse" /> : <Save className="h-4 w-4" />}
                        Salvar rastreio
                      </Button>
                      <Button variant="outline" onClick={() => setRastreioAbertoId(null)}>Cancelar</Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950 px-4 py-10 text-center text-sm text-zinc-500">
              Nenhum item encontrado neste pedido.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-900/95"><CardContent className="p-5"><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Status resumido</p><p className="mt-2 text-lg font-semibold text-brand">{pedido.resumo_status}</p></CardContent></Card>
        <Card className="border-zinc-800 bg-zinc-900/95"><CardContent className="p-5"><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Itens com problema</p><p className="mt-2 text-lg font-semibold text-red-400">{pedido.itens_pedido?.filter((item) => Number(item.status_item_id) === 7).length || 0}</p></CardContent></Card>
        <Card className="border-zinc-800 bg-zinc-900/95"><CardContent className="p-5"><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Itens entregues</p><p className="mt-2 text-lg font-semibold text-emerald-400">{pedido.itens_pedido?.filter((item) => Number(item.status_item_id) === 5).length || 0}</p></CardContent></Card>
      </div>
    </div>
  );
}