"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowUpRight, CalendarDays, Clock3, ChevronDown, Package, Phone, User } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/dates";
import { RastreioBadge } from "./RastreioBadge";
import { StatusBadge } from "./StatusBadge";
import { getStatusBadgeStyle } from "@/lib/constants/status";
import { atualizarStatusItem, atualizarRastreioItem } from "@/services/itensPedidoService";
import { obterOuCriarRastreio } from "@/services/rastreiosService";
import { STATUS_FIXOS } from "@/lib/constants/status";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export function PedidoCard({ pedido }) {
  const router = useRouter();
  const [editingStatusFor, setEditingStatusFor] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusMap, setStatusMap] = useState({});
  const [editingRastreioFor, setEditingRastreioFor] = useState(null);
  const [rastreioValue, setRastreioValue] = useState("");
  const [rastreioEmGrupo, setRastreioEmGrupo] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSaveStatus(item) {
    try {
      setSaving(true);
      await atualizarStatusItem({ itemId: item.id, status_item_id: Number(selectedStatus) });
      setEditingStatusFor(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveRastreio(item) {
    try {
      setSaving(true);
      const rastreio = await obterOuCriarRastreio({ codigo_rastreio: rastreioValue, rastreio_em_grupo: rastreioEmGrupo });
      await atualizarRastreioItem({ itemId: item.id, rastreio_id: rastreio?.id ?? null });
      setEditingRastreioFor(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    function handleOutsideClick(e) {
      const target = e.target;

      if (editingStatusFor !== null) {
        const statusRoot = document.querySelector(`[data-status-root="${editingStatusFor}"]`);
        if (statusRoot && !statusRoot.contains(target)) {
          setEditingStatusFor(null);
        }
      }

      if (editingRastreioFor !== null) {
        const rastreioRoot = document.querySelector(`[data-rastreio-root="${editingRastreioFor}"]`);
        if (rastreioRoot && !rastreioRoot.contains(target)) {
          setEditingRastreioFor(null);
        }
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [editingStatusFor, editingRastreioFor]);

  return (
    <Card className="overflow-hidden border-zinc-800 bg-zinc-900/95">
      <CardHeader className="border-b border-zinc-800 bg-zinc-950/40 p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/20 text-brand">
              <User className="h-5 w-5" />
            </div>

            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="truncate text-xl text-white">{pedido.nome_cliente}</CardTitle>
                <Badge variant={pedido.valor_restante > 0 ? "danger" : "success"}>
                  {pedido.valor_restante > 0 ? "Em aberto" : "Pago"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
                <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-zinc-500" />{pedido.telefone || "Sem telefone"}</span>
                <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-zinc-500" />{formatDateTime(pedido.criado_em)}</span>
                {/* <span className="flex items-center gap-2">ID #{pedido.id}</span> */}
              </div>
            </div>
          </div>

          <div className="grid min-w-[280px] grid-cols-3 gap-3 text-right">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Total</p>
              <p className="mt-2 text-xl font-semibold text-brand">{formatCurrency(pedido.valor_total)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Pago</p>
              <p className="mt-2 text-xl font-semibold text-emerald-400">{formatCurrency(pedido.valor_pago)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Restante</p>
              <p className="mt-2 text-xl font-semibold text-rose-400">{formatCurrency(Math.max(pedido.valor_restante, 0))}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
          <Package className="h-4 w-4" />
          Itens do pedido
        </div>

        <div className="space-y-3">
          {pedido.itens_pedido?.map((item) => (
            <div key={item.id} className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 lg:flex-row lg:items-center">
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 text-sm font-semibold text-zinc-300">
                  {item.quantidade}x
                </div>

                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">{item.nome_produto}</p>
                  <p className="text-sm text-zinc-500">{item.tipo || "Sem tipo"}</p>
                </div>
              </div>

              <div className="mt-2 w-full flex-1 min-w-0 lg:mt-0 lg:px-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-zinc-300">Tamanho: {item.tamanho || '—'}</p>
                    <p className="truncate text-sm text-zinc-300">Personalização: {item.personalizacao || '—'}</p>
                  </div>
                </div>

              </div>

              <div className="mt-2 flex w-full items-center justify-end gap-3 sm:mt-0 sm:w-auto">
                <div data-status-root={item.id} className="relative flex items-center gap-2">
                  {(() => {
                    const current = statusMap[item.id] ?? item.status_itens;
                    const style = getStatusBadgeStyle(current?.cor);

                    return (
                      <>
                        <button
                          aria-label="Abrir menu de status"
                          className="inline-flex items-center gap-2 rounded-full border border-zinc-800 px-3 py-1 text-sm"
                          onClick={() => setEditingStatusFor((cur) => (cur === item.id ? null : item.id))}
                          style={{ backgroundColor: style.backgroundColor, borderColor: style.borderColor, color: style.color }}
                        >
                          <span className="text-xs">{current?.nome ?? "Status"}</span>
                          <ChevronDown className="h-4 w-4 text-zinc-200" />
                        </button>

                        {editingStatusFor === item.id ? (
                          <div className="absolute right-0 z-40 mt-10 w-56 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-lg">
                            {STATUS_FIXOS.map((s) => (
                              <button
                                key={s.id}
                                className={"flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-left " + (String(s.id) === String(current?.id ?? item.status_item_id) ? "bg-zinc-900 text-white" : "text-zinc-300 hover:bg-zinc-900")}
                                onClick={async () => {
                                  try {
                                    await atualizarStatusItem({ itemId: item.id, status_item_id: Number(s.id) });
                                    setStatusMap((m) => ({ ...m, [item.id]: s }));
                                  } catch (e) {
                                    // ignore, server will have authoritative state
                                  } finally {
                                    setEditingStatusFor(null);
                                  }
                                }}
                              >
                                <span>{s.nome}</span>
                                <span className="text-xs text-zinc-500">{s.descricao}</span>
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </>
                    );
                  })()}
                </div>

                <div data-rastreio-root={item.id} className="relative flex items-center gap-2">
                  <RastreioBadge 
                    rastreio={item.rastreios}
                    onEditClick={() => {
                      setEditingRastreioFor((cur) => (cur === item.id ? null : item.id));
                      if (editingRastreioFor !== item.id) {
                        setRastreioValue(item.rastreios?.codigo_rastreio ?? "");
                        setRastreioEmGrupo(Boolean(item.rastreios?.rastreio_em_grupo));
                      }
                    }}
                  />

                  {editingRastreioFor === item.id ? (
                    <div className="absolute right-0 z-40 mt-10 w-80 rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-lg">
                      <div className="space-y-2">
                        <label className="text-sm text-zinc-300">Código de rastreio</label>
                        <Input value={rastreioValue} onChange={(e) => setRastreioValue(e.target.value)} placeholder="Código de rastreio" />
                        <label className="flex items-center gap-2 text-sm text-zinc-400"><input type="checkbox" checked={rastreioEmGrupo} onChange={(e) => setRastreioEmGrupo(e.target.checked)} className="h-4 w-4 accent-brand" /> Rastreio em conjunto</label>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingRastreioFor(null)}>Cancelar</Button>
                          <Button size="sm" onClick={() => handleSaveRastreio(item)} disabled={saving}>Salvar</Button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 border-t border-zinc-800 bg-zinc-950/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
          <span className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-300">
            <Clock3 className="h-4 w-4 text-zinc-500" />
            {pedido.forma_pagamento || "Não informado"}
          </span>
          <span className="flex items-center gap-2 text-zinc-500">
            <User className="h-4 w-4" />
            Vendedor: {pedido.perfis?.nome_completo || "—"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild size="sm" className="gap-2 rounded-xl px-4">
            <Link href={`/pedidos/${pedido.id}`}>
              Ver detalhes
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}