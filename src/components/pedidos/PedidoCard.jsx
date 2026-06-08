"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { ArrowUpRight, CalendarDays, Clock3, ChevronDown, Package, Phone, User, Copy, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/dates";
import { RastreioBadge } from "./RastreioBadge";
import { StatusBadge } from "./StatusBadge";
import { getStatusBadgeStyle, getStatusPorId, STATUS_FIXOS } from "@/lib/constants/status";
import { atualizarStatusItem, atualizarRastreioItem } from "@/services/itensPedidoService";
import { obterOuCriarRastreio } from "@/services/rastreiosService";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { atualizarPedido } from "@/services/pedidosService";
import { formatarPersonalizacaoItem } from "@/utils/personalizacao";

export function PedidoCard({ pedido, contagemPorRastreio = {} }) {
  const router = useRouter();
  const [pedidoLocal, setPedidoLocal] = useState(pedido);
  const [editingStatusFor, setEditingStatusFor] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusMap, setStatusMap] = useState({});
  const [statusMenuRect, setStatusMenuRect] = useState(null);
  const [editingRastreioFor, setEditingRastreioFor] = useState(null);
  const [rastreioValue, setRastreioValue] = useState("");
  const [rastreioEmGrupo, setRastreioEmGrupo] = useState(false);
  const [rastreioMenuRect, setRastreioMenuRect] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPedidoLocal(pedido);
  }, [pedido]);

  const itensPedido = pedidoLocal.itens_pedido ?? [];
  const todosItensEntregues = itensPedido.length > 0 && itensPedido.every((item) => Number(item.status_item_id) === 5);
  const statusResumoPedido = todosItensEntregues
    ? { label: "Finalizado", variant: "success" }
    : pedidoLocal.valor_restante > 0
      ? { label: "Em aberto", variant: "danger" }
      : { label: "Pago", variant: "success" };

  function getMenuPlacement(rect, width, height) {
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;
    const margin = 8;

    let top = rect.bottom + 8;
    if (viewportHeight && top + height > viewportHeight - margin) {
      top = Math.max(margin, rect.top - height - 8);
    }

    const left = Math.min(Math.max(margin, rect.right - width), Math.max(margin, viewportWidth - width - margin));

    return {
      top,
      left,
      width: Math.min(width, Math.max(0, viewportWidth - margin * 2)),
    };
  }

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
      const itemAtualizado = await atualizarRastreioItem({ itemId: item.id, rastreio_id: rastreio?.id ?? null });
      const statusEnviado = getStatusPorId(itemAtualizado?.status_item_id);

      setPedidoLocal((current) => ({
        ...current,
        itens_pedido: (current.itens_pedido ?? []).map((currentItem) =>
          currentItem.id === item.id
            ? {
                ...currentItem,
                ...itemAtualizado,
                rastreio_id: itemAtualizado?.rastreio_id ?? rastreio?.id ?? null,
                rastreios: rastreio,
                status_itens: statusEnviado,
              }
            : currentItem,
        ),
      }));
      setStatusMap((current) => ({ ...current, [item.id]: statusEnviado }));

      setEditingRastreioFor(null);
      setRastreioMenuRect(null);
      setRastreioValue("");
      router.refresh();
      toast.success("Rastreio atualizado e pedido marcado como enviado.");
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Não foi possível atualizar o rastreio.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePagarRestante() {
    if (!pedidoLocal || Number(pedidoLocal.valor_restante) <= 0) return;

    try {
      setSaving(true);
      const atualizado = await atualizarPedido(pedidoLocal.id, {
        valor_pago: Number(pedidoLocal.valor_total || 0),
        valor_restante: 0,
      });

      setPedidoLocal((current) => ({
        ...current,
        ...atualizado,
        valor_pago: Number(atualizado?.valor_pago ?? current.valor_total ?? 0),
        valor_restante: 0,
      }));

      router.refresh();
      toast.success("Restante quitado com sucesso.");
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Não foi possível quitar o restante.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    function closeMenus() {
      setEditingStatusFor(null);
      setEditingRastreioFor(null);
    }

    function handleOutsideClick(e) {
      const target = e.target;

      if (editingStatusFor !== null) {
        const statusRoot = document.querySelector(`[data-status-root="${editingStatusFor}"]`);
        const statusPortal = document.querySelector(`[data-status-portal="${editingStatusFor}"]`);
        if (statusRoot && !statusRoot.contains(target)) {
          if (statusPortal && statusPortal.contains(target)) return;
          setEditingStatusFor(null);
          setStatusMenuRect(null);
        }
      }

      if (editingRastreioFor !== null) {
        const rastreioRoot = document.querySelector(`[data-rastreio-root="${editingRastreioFor}"]`);
        const rastreioPortal = document.querySelector(`[data-rastreio-portal="${editingRastreioFor}"]`);
        if (rastreioRoot && !rastreioRoot.contains(target)) {
          if (rastreioPortal && rastreioPortal.contains(target)) return;
          setEditingRastreioFor(null);
          setRastreioMenuRect(null);
        }
      }
    }

    function handleScroll() {
      closeMenus();
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      window.removeEventListener("scroll", handleScroll, true);
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
                <Badge variant={statusResumoPedido.variant}>
                  {statusResumoPedido.label}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
                <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-zinc-500" />{pedidoLocal.telefone || "Sem telefone"}</span>
                <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-zinc-500" />{formatDateTime(pedidoLocal.criado_em)}</span>
                {/* <span className="flex items-center gap-2">ID #{pedido.id}</span> */}
              </div>
            </div>
          </div>

          <div className="grid min-w-[280px] grid-cols-3 gap-3 text-right">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Total</p>
              <p className="mt-2 text-xl font-semibold text-brand">{formatCurrency(pedidoLocal.valor_total)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Pago</p>
              <p className="mt-2 text-xl font-semibold text-emerald-400">{formatCurrency(pedidoLocal.valor_pago)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Restante</p>
                <div className="mt-2 flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                  <p className="text-xl font-semibold text-rose-400">{formatCurrency(Math.max(pedidoLocal.valor_restante, 0))}</p>
                </div>
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
          {pedidoLocal.itens_pedido?.map((item) => (
            (() => {
              const current = statusMap[item.id] ?? getStatusPorId(item.status_item_id) ?? item.status_itens;
              const isStatusOpen = editingStatusFor === item.id;
              const isRastreioOpen = editingRastreioFor === item.id;

              return (
            <div key={item.id} className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 lg:flex-row lg:items-center">
              <div className="flex items-start gap-4 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-sm font-semibold text-zinc-300">
                  {item.quantidade}x
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-white sm:text-base">{item.nome_produto}</p>
                  <p className="text-sm text-zinc-500">{item.tipo || "Sem tipo"}</p>
                </div>
              </div>

              <div className="w-full flex-1 min-w-0 lg:px-6">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 text-sm text-zinc-300">
                  <p className="min-w-0 truncate">Tamanho</p>
                  <p className="justify-self-end truncate text-right font-semibold text-white">{item.tamanho || '—'}</p>
                  <p className="min-w-0 truncate">Personalização</p>
                  <p className="justify-self-end truncate text-right font-semibold text-white">{formatarPersonalizacaoItem(item)}</p>
                </div>
              </div>

              <div data-rastreio-root={item.id} className="grid w-full gap-3 sm:mt-0 sm:w-auto sm:gap-0">
                <div className="grid w-full gap-3 sm:hidden">
                  {item.rastreios ? (
                    <RastreioBadge
                      item={item}
                      rastreio={item.rastreios}
                      contagemPorRastreio={contagemPorRastreio}
                      fullWidth
                      onEditClick={(event) => {
                        const rect = event?.currentTarget?.getBoundingClientRect?.();
                        if (isRastreioOpen) {
                          setEditingRastreioFor(null);
                          setRastreioMenuRect(null);
                          return;
                        }

                        setEditingRastreioFor(item.id);
                        setEditingStatusFor(null);
                        setStatusMenuRect(null);
                        setRastreioValue(item.rastreios?.codigo_rastreio ?? "");
                        setRastreioEmGrupo(Boolean(item.rastreios?.rastreio_em_grupo));
                        if (rect) setRastreioMenuRect(rect);
                      }}
                    />
                  ) : (
                    <button
                        onClick={(event) => {
                          event.stopPropagation();
                          const rect = event.currentTarget.getBoundingClientRect();
                          if (isRastreioOpen) {
                            setEditingRastreioFor(null);
                            setRastreioMenuRect(null);
                            return;
                          }

                          setEditingRastreioFor(item.id);
                          setEditingStatusFor(null);
                          setStatusMenuRect(null);
                          setRastreioValue("");
                          setRastreioEmGrupo(false);
                          if (rect) setRastreioMenuRect(rect);
                        }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-700"
                      title="Adicionar rastreio"
                    >
                      <span className="truncate">Sem rastreio</span>
                    </button>
                  )}

                  <div data-status-root={item.id} className="relative flex w-full items-center gap-2">
                    <button
                      aria-label="Abrir menu de status"
                      className="inline-flex min-w-0 flex-1 items-center justify-between gap-2 rounded-full border border-zinc-800 px-4 py-2 text-sm"
                      onClick={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        setEditingRastreioFor(null);
                        setRastreioMenuRect(null);

                        if (isStatusOpen) {
                          setEditingStatusFor(null);
                          setStatusMenuRect(null);
                          return;
                        }

                        setEditingStatusFor(item.id);
                        setStatusMenuRect(rect);
                      }}
                      style={{ backgroundColor: getStatusBadgeStyle(current?.cor).backgroundColor, borderColor: getStatusBadgeStyle(current?.cor).borderColor, color: getStatusBadgeStyle(current?.cor).color }}
                    >
                      <span className="min-w-0 truncate text-xs">{current?.nome ?? "Status"}</span>
                      <ChevronDown className="h-4 w-4 text-zinc-200" />
                    </button>
                  </div>
                </div>

                <div className="hidden items-center gap-3 sm:flex">
                  <div data-status-root={item.id} className="relative flex items-center gap-2">
                    <button
                      aria-label="Abrir menu de status"
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-800 px-3 py-1 text-sm"
                      onClick={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        setEditingRastreioFor(null);
                        setRastreioMenuRect(null);

                        if (isStatusOpen) {
                          setEditingStatusFor(null);
                          setStatusMenuRect(null);
                          return;
                        }

                        setEditingStatusFor(item.id);
                        setStatusMenuRect(rect);
                      }}
                      style={{ backgroundColor: getStatusBadgeStyle(current?.cor).backgroundColor, borderColor: getStatusBadgeStyle(current?.cor).borderColor, color: getStatusBadgeStyle(current?.cor).color }}
                    >
                      <span className="text-xs">{current?.nome ?? "Status"}</span>
                      <ChevronDown className="h-4 w-4 text-zinc-200" />
                    </button>
                  </div>

                  {item.rastreios ? (
                    <RastreioBadge 
                      item={item}
                      rastreio={item.rastreios}
                      contagemPorRastreio={contagemPorRastreio}
                      onEditClick={(event) => {
                        const rect = event?.currentTarget?.getBoundingClientRect?.();
                        if (isRastreioOpen) {
                          setEditingRastreioFor(null);
                          setRastreioMenuRect(null);
                          return;
                        }

                        setEditingRastreioFor(item.id);
                        setEditingStatusFor(null);
                        setStatusMenuRect(null);
                        setRastreioValue(item.rastreios?.codigo_rastreio ?? "");
                        setRastreioEmGrupo(Boolean(item.rastreios?.rastreio_em_grupo));
                        if (rect) setRastreioMenuRect(rect);
                      }}
                    />
                  ) : (
                    <button
                        onClick={(event) => {
                          event.stopPropagation();
                          const rect = event.currentTarget.getBoundingClientRect();
                          if (isRastreioOpen) {
                            setEditingRastreioFor(null);
                            setRastreioMenuRect(null);
                            return;
                          }

                          setEditingRastreioFor(item.id);
                          setEditingStatusFor(null);
                          setStatusMenuRect(null);
                          setRastreioValue("");
                          setRastreioEmGrupo(false);
                          if (rect) setRastreioMenuRect(rect);
                        }}
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-800 px-3 py-1 text-sm"
                      title="Adicionar rastreio"
                    >
                      <span className="truncate">Sem rastreio</span>
                    </button>
                  )}
                </div>
              </div>

              {typeof document !== "undefined" && isStatusOpen && statusMenuRect ? createPortal(
                <div
                  data-status-portal={item.id}
                  className="fixed z-[60] rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl shadow-black/50"
                  style={getMenuPlacement(statusMenuRect, 320, 360)}
                >
                  <div className="max-h-[min(360px,calc(100vh-2rem))] overflow-auto">
                    {STATUS_FIXOS.map((s) => (
                      <button
                        key={s.id}
                        className={"flex w-full items-start justify-between gap-3 rounded-md px-3 py-2 text-left text-sm " + (String(s.id) === String(current?.id ?? item.status_item_id) ? "bg-zinc-900 text-white" : "text-zinc-300 hover:bg-zinc-900")}
                        onClick={async () => {
                          try {
                            const atualizado = await atualizarStatusItem({ itemId: item.id, status_item_id: Number(s.id) });
                            setStatusMap((m) => ({ ...m, [item.id]: s }));
                            toast.success("Status atualizado.");
                          } catch (e) {
                            console.error("Erro ao atualizar status:", e);
                            toast.error(e?.message || "Não foi possível atualizar o status.");
                          } finally {
                            setEditingStatusFor(null);
                            setStatusMenuRect(null);
                          }
                        }}
                      >
                        <span className="min-w-0 flex-1">{s.nome}</span>
                        <span className="max-w-44 text-xs leading-5 text-zinc-500">{s.descricao}</span>
                      </button>
                    ))}
                  </div>
                </div>,
                document.body,
              ) : null}

              {typeof document !== "undefined" && isRastreioOpen && rastreioMenuRect ? createPortal(
                <div
                  data-rastreio-portal={item.id}
                  className="fixed z-[60] rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl shadow-black/50"
                  style={getMenuPlacement(rastreioMenuRect, 352, 240)}
                >
                  <div className="space-y-3">
                    <label className="text-sm text-zinc-300">Código de rastreio</label>
                    <Input value={rastreioValue} onChange={(e) => setRastreioValue(e.target.value)} placeholder="Código de rastreio" />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        setEditingRastreioFor(null);
                        setRastreioMenuRect(null);
                      }}>Cancelar</Button>
                      <Button size="sm" onClick={() => handleSaveRastreio(item)} disabled={saving}>Salvar</Button>
                    </div>
                  </div>
                </div>,
                document.body,
              ) : null}
            </div>
              );
            })()
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 border-t border-zinc-800 bg-zinc-950/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
          <span className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-300">
            <Clock3 className="h-4 w-4 text-zinc-500" />
            {pedidoLocal.forma_pagamento || "Não informado"}
          </span>
          <span className="flex items-center gap-2 text-zinc-500">
            <User className="h-4 w-4" /> {pedidoLocal.perfis?.nome_completo || "—"}
          </span>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          {Number(pedidoLocal.valor_restante) > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handlePagarRestante}
              disabled={saving}
              className="w-full gap-2 rounded-xl border-[#27a074]/40 bg-[#27a074] px-4 text-white shadow-glow hover:bg-[#27a074]/90 hover:text-white sm:w-auto"
            >
              Pagar restante
            </Button>
          ) : null}

          <Button asChild size="sm" className="w-full gap-2 rounded-xl px-4 sm:w-auto">
            <Link href={`/pedidos/${pedidoLocal.id}`}>
              Ver detalhes
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
