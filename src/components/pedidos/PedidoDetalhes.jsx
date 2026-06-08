"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, CreditCard, Package, Phone, Save, Truck, User, ChevronDown, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import EditarPedidoDialog from "./EditarPedidoDialog";
import EditarItemPedidoDialog from "./EditarItemPedidoDialog";
import ConfirmarRemoverItemDialog from "./ConfirmarRemoverItemDialog";
import ConfirmarExcluirPedidoDialog from "./ConfirmarExcluirPedidoDialog";
import { buscarPedidoPorId } from "@/services/pedidosService";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FinanceiroResumo } from "./FinanceiroResumo";
import { StatusBadge } from "./StatusBadge";
import { RastreioBadge } from "./RastreioBadge";
import { atualizarRastreioItem, atualizarStatusItem } from "@/services/itensPedidoService";
import { obterOuCriarRastreio } from "@/services/rastreiosService";
import { getStatusBadgeStyle, getStatusDoItem, getStatusPorId, getStatusResumoPedido } from "@/lib/constants/status";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/dates";
import { gerarTextoPedidoWhatsApp } from "@/utils/gerarTextoPedido";
import { formatarPersonalizacaoItem } from "@/utils/personalizacao";
import { listarPagamentosPedido } from "@/services/pagamentosService";
import { RegistrarPagamentoDialog } from "./RegistrarPagamentoDialog";

export function PedidoDetalhes({ pedidoInicial, statusItens, contagemPorRastreio = {} }) {
  const [pedido, setPedido] = useState(pedidoInicial);
  const [editingStatusFor, setEditingStatusFor] = useState(null);
  const [rastreioAbertoId, setRastreioAbertoId] = useState(null);
  const [rastreioCodigo, setRastreioCodigo] = useState("");
  const [rastreioEmGrupo, setRastreioEmGrupo] = useState(false);
  const [rastreioMenuRect, setRastreioMenuRect] = useState(null);
  const [salvandoRastreio, setSalvandoRastreio] = useState(false);
  const [statusMap, setStatusMap] = useState({});
  const [pagamentos, setPagamentos] = useState([]);
  const [carregandoPagamentos, setCarregandoPagamentos] = useState(true);
  const [erroPagamentos, setErroPagamentos] = useState("");
  const [pagamentoDialogOpen, setPagamentoDialogOpen] = useState(false);
  const pagamentosRequestRef = useRef(0);

  const financeiros = useMemo(
    () => ({
      valorTotal: Number(pedido?.valor_total || 0),
      valorPago: Number(pedido?.valor_pago || 0),
      valorRestante: Number(pedido?.valor_restante || 0),
    }),
    [pedido],
  );
  const statusResumoPedido = getStatusResumoPedido(pedido?.itens_pedido, statusItens);

  async function salvarRastreio(itemId) {
    setSalvandoRastreio(true);
    try {
      const rastreio = await obterOuCriarRastreio({ codigo_rastreio: rastreioCodigo, rastreio_em_grupo: rastreioEmGrupo });
      const itemAtualizado = await atualizarRastreioItem({ itemId, rastreio_id: rastreio?.id ?? null });
      const statusEnviado = getStatusPorId(itemAtualizado.status_item_id, statusItens);

      setPedido((current) => ({
        ...current,
        itens_pedido: current.itens_pedido.map((item) => (
          item.id === itemId
            ? {
                ...item,
                ...itemAtualizado,
                rastreio_id: itemAtualizado.rastreio_id,
                rastreios: rastreio,
                status_itens: statusEnviado,
              }
            : item
        )),
      }));

      toast.success("Rastreio atualizado e pedido marcado como enviado.");
      setRastreioAbertoId(null);
      setRastreioCodigo("");
      setRastreioMenuRect(null);
    } catch (error) {
      const mensagemErro = error instanceof Error ? error.message : typeof error === "string" ? error : error?.message || JSON.stringify(error);
      toast.error(mensagemErro || "Não foi possível atualizar o rastreio.");
    } finally {
      setSalvandoRastreio(false);
    }
  }

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

  useEffect(() => {
    if (rastreioAbertoId === null) return;

    function handleOutside(e) {
      const target = e.target;
      const root = document.querySelector(`[data-rastreio-root="${rastreioAbertoId}"]`);
      const portal = document.querySelector(`[data-rastreio-portal="${rastreioAbertoId}"]`);
      if (root && root.contains(target)) return;
      if (portal && portal.contains(target)) return;
      setRastreioAbertoId(null);
      setRastreioMenuRect(null);
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [rastreioAbertoId]);

  async function copiarTextoPedido() {
    try {
      const texto = gerarTextoPedidoWhatsApp({ ...pedido, pagamentos_pedido: pagamentos });
      await navigator.clipboard.writeText(texto);
      toast.success("Texto da encomenda copiado!");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível copiar o texto.");
    }
  }

  if (!pedido) return null;

  async function reloadPedido() {
    try {
      const updated = await buscarPedidoPorId(pedido.id);
      setPedido(updated);
    } catch (e) {
      console.error("Erro ao recarregar pedido:", e);
    }
  }

  const carregarPagamentos = useCallback(async () => {
    if (!pedido?.id) return;
    const requestId = ++pagamentosRequestRef.current;

    try {
      setCarregandoPagamentos(true);
      setErroPagamentos("");
      const dados = await listarPagamentosPedido(pedido.id);
      if (requestId !== pagamentosRequestRef.current) return;
      setPagamentos(dados);
    } catch (error) {
      if (requestId !== pagamentosRequestRef.current) return;
      console.error("Erro ao carregar pagamentos:", error);
      setErroPagamentos(error?.message || "Não foi possível carregar os pagamentos.");
    } finally {
      if (requestId !== pagamentosRequestRef.current) return;
      setCarregandoPagamentos(false);
    }
  }, [pedido?.id]);

  useEffect(() => {
    void carregarPagamentos();

    return () => {
      pagamentosRequestRef.current += 1;
    };
  }, [carregarPagamentos]);

  async function handlePagamentoRegistrado() {
    await Promise.all([reloadPedido(), carregarPagamentos()]);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button
          type="button"
          onClick={copiarTextoPedido}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-[#ed6f1a]/40 bg-[#ed6f1a]/10 px-4 py-3 text-sm font-bold text-[#ed6f1a] transition hover:bg-[#ed6f1a] hover:text-white"
        >
          <Copy size={18} />
          Copiar encomenda
        </Button>
      </div>
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
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Pagamentos</p><p className="mt-1 text-white">{Number(pedido.valor_pago) > 0 ? "Histórico disponível abaixo" : "Nenhum pagamento"}</p></div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total de itens</p><p className="mt-1 text-white">{pedido.itens_pedido?.length || 0}</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/95">
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <CreditCard className="h-5 w-5 text-brand" />
              Pagamentos
            </CardTitle>
            <p className="mt-1 text-sm text-zinc-400">Histórico dos valores recebidos neste pedido.</p>
          </div>

          {Number(pedido.valor_restante) > 0 ? (
            <Button
              type="button"
              onClick={() => setPagamentoDialogOpen(true)}
              className="bg-[#27a074] text-white hover:bg-[#27a074]/90"
            >
              Registrar pagamento
            </Button>
          ) : (
            <Badge variant="success">Pedido quitado</Badge>
          )}
        </CardHeader>
        <CardContent>
          {carregandoPagamentos ? (
            <p className="text-sm text-zinc-500">Carregando pagamentos...</p>
          ) : erroPagamentos ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {erroPagamentos}
            </div>
          ) : pagamentos.length ? (
            <div className="divide-y divide-zinc-800 rounded-2xl border border-zinc-800 bg-zinc-950">
              {pagamentos.map((pagamento) => (
                <div key={pagamento.id} className="grid gap-2 px-4 py-4 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-semibold text-white">{formatCurrency(pagamento.valor)}</span>
                      <span className="text-zinc-300">{pagamento.forma_pagamento}</span>
                      <span className="text-zinc-500">{pagamento.perfis?.nome_completo || "Usuário não identificado"}</span>
                    </div>
                    {pagamento.observacao ? (
                      <p className="mt-1 text-zinc-500">{pagamento.observacao}</p>
                    ) : null}
                  </div>
                  <span className="text-zinc-500">{formatDateTime(pagamento.criado_em)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 px-4 py-8 text-center text-sm text-zinc-500">
              Nenhum pagamento registrado.
            </div>
          )}
        </CardContent>
      </Card>

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
              <div key={item.id} className="relative rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{item.nome_produto}</h3>
                      <Badge variant="brand">Qtd. {item.quantidade}</Badge>
                    </div>
                    <div className="grid gap-2 text-sm text-zinc-400 sm:grid-cols-2 lg:grid-cols-3">
                      <p>Tipo: <span className="text-white">{item.tipo || "—"}</span></p>
                      <p>Tamanho: <span className="text-white">{item.tamanho || "—"}</span></p>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:hidden">
                      <StatusBadge status={getStatusDoItem(item, statusItens)} />
                      <RastreioBadge
                        item={item}
                        rastreio={item.rastreios}
                        contagemPorRastreio={contagemPorRastreio}
                        onEditClick={(event) => {
                          const rect = event?.currentTarget?.getBoundingClientRect?.();
                          if (rastreioAbertoId === item.id) {
                            setRastreioAbertoId(null);
                            setRastreioMenuRect(null);
                            return;
                          }

                          setRastreioAbertoId(item.id);
                          setRastreioCodigo(item.rastreios?.codigo_rastreio ?? "");
                          setRastreioEmGrupo(Boolean(item.rastreios?.rastreio_em_grupo));
                          if (rect) setRastreioMenuRect(rect);
                        }}
                      />
                    </div>
                  </div>

                  <div className="hidden lg:flex flex-wrap gap-2 items-center">
                    {/* Inline status button + dropdown (stays on page) */}
                    <div className="relative">
                      <button
                        aria-label="Abrir menu de status"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (editingStatusFor === item.id) {
                            setEditingStatusFor(null);
                            return;
                          }

                          setEditingStatusFor(item.id);
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-zinc-800 px-3 py-1 text-sm"
                        style={getStatusBadgeStyle(getStatusDoItem(item, statusItens)?.cor)}
                      >
                        <span className="text-xs">{getStatusDoItem(item, statusItens)?.nome ?? "Sem status"}</span>
                        <ChevronDown className="h-4 w-4 text-zinc-200" />
                      </button>

                      {editingStatusFor === item.id ? (
                        <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
                          <div className="max-h-60 overflow-auto">
                            {statusItens.map((s) => (
                              <button
                                key={s.id}
                                className={"flex w-full items-start justify-between gap-3 rounded-md px-3 py-2 text-left text-sm " + (String(s.id) === String(item.status_item_id) ? "bg-zinc-900 text-white" : "text-zinc-300 hover:bg-zinc-900")}
                                onClick={async () => {
                                  try {
                                    const atualizado = await atualizarStatusItem({ itemId: item.id, status_item_id: Number(s.id) });
                                    setPedido((current) => ({
                                      ...current,
                                      itens_pedido: current.itens_pedido.map((it) => (
                                        it.id === item.id
                                          ? { ...it, ...atualizado, status_itens: s }
                                          : it
                                      )),
                                    }));
                                    toast.success("Status atualizado.");
                                  } catch (e) {
                                    toast.error("Não foi possível atualizar o status.");
                                  } finally {
                                    setEditingStatusFor(null);
                                  }
                                }}
                              >
                                <span className="min-w-0 flex-1">{s.nome}</span>
                                <span className="max-w-44 text-xs leading-5 text-zinc-500">{s.descricao}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Rastreio inline editor trigger */}
                    <RastreioBadge
                      item={item}
                      rastreio={item.rastreios}
                      contagemPorRastreio={contagemPorRastreio}
                      onEditClick={(event) => {
                        const rect = event?.currentTarget?.getBoundingClientRect?.();
                        if (rastreioAbertoId === item.id) {
                          setRastreioAbertoId(null);
                          setRastreioMenuRect(null);
                          return;
                        }

                        setRastreioAbertoId(item.id);
                        setRastreioCodigo(item.rastreios?.codigo_rastreio ?? "");
                        setRastreioEmGrupo(Boolean(item.rastreios?.rastreio_em_grupo));
                        if (rect) setRastreioMenuRect(rect);
                      }}
                    />
                    <div className="flex items-center gap-2 border-none">
                      <EditarItemPedidoDialog item={item} onUpdated={() => void reloadPedido()} />
                      <ConfirmarRemoverItemDialog item={item} itemCount={(pedido.itens_pedido || []).length} onRemoved={() => void reloadPedido()} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Personalização</p>
                    <p className="mt-1 text-white">{formatarPersonalizacaoItem(item)}</p>
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

                {/* Mobile controls: edit/remove buttons shown at bottom of the card */}
                <div className="mt-4 flex gap-3 lg:hidden">
                  <EditarItemPedidoDialog item={item} onUpdated={() => void reloadPedido()} triggerClassName="flex-1 justify-center py-3" triggerSize="default" triggerVariant="secondary" />
                  <ConfirmarRemoverItemDialog item={item} itemCount={(pedido.itens_pedido || []).length} onRemoved={() => void reloadPedido()} triggerClassName="flex-1 justify-center py-3" triggerSize="default" triggerVariant="destructive" />
                </div>

                {typeof document !== "undefined" && rastreioAbertoId === item.id && rastreioMenuRect
                  ? createPortal(
                      <div
                        data-rastreio-portal={item.id}
                        className="fixed z-[60] rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl shadow-black/50"
                        style={getMenuPlacement(rastreioMenuRect, 352, 200)}
                      >
                        <div className="space-y-3">
                          <label className="text-sm text-zinc-300">Código de rastreio</label>
                          <Input value={rastreioCodigo} onChange={(e) => setRastreioCodigo(e.target.value)} placeholder="Código de rastreio" />
                          {/* 'Rastreio em grupo' checkbox removed per UX request */}
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => {
                              setRastreioAbertoId(null);
                              setRastreioMenuRect(null);
                            }}>Cancelar</Button>
                            <Button size="sm" onClick={() => salvarRastreio(item.id)} disabled={salvandoRastreio}>Salvar</Button>
                          </div>
                        </div>
                      </div>,
                      document.body,
                    )
                  : null}
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
        <Card className="border-zinc-800 bg-zinc-900/95"><CardContent className="p-5"><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Status resumido</p><StatusBadge status={statusResumoPedido} className="mt-2" /></CardContent></Card>
        <Card className="border-zinc-800 bg-zinc-900/95"><CardContent className="p-5"><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Itens com problema</p><p className="mt-2 text-lg font-semibold text-red-400">{pedido.itens_pedido?.filter((item) => Number(item.status_item_id) === 7).length || 0}</p></CardContent></Card>
        <Card className="border-zinc-800 bg-zinc-900/95"><CardContent className="p-5"><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Itens entregues</p><p className="mt-2 text-lg font-semibold text-emerald-400">{pedido.itens_pedido?.filter((item) => Number(item.status_item_id) === 5).length || 0}</p></CardContent></Card>
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-zinc-800 bg-zinc-950 p-4 sm:flex-row sm:items-center sm:justify-end sm:p-5">
        <EditarPedidoDialog pedido={pedido} onUpdated={() => void reloadPedido()} />
        <ConfirmarExcluirPedidoDialog pedidoId={pedido.id} />
      </div>

      <RegistrarPagamentoDialog
        pedido={pedido}
        open={pagamentoDialogOpen}
        onOpenChange={setPagamentoDialogOpen}
        onPagamentoRegistrado={handlePagamentoRegistrado}
      />
    </div>
  );
}
