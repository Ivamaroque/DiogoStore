"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Loader2, RefreshCcw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PedidoCard } from "./PedidoCard";
import { contarItensPorRastreio } from "@/utils/rastreios";
import { sincronizarRastreiosEmGrupo } from "@/services/rastreiosService";
import { listarPedidosPorPagina } from "@/services/pedidosService";
import { getStatusResumoPedido } from "@/lib/constants/status";
import { getAtualizacoesAvisoDoPedido } from "@/utils/atualizacoesPedido";
import { useStatusItens } from "@/hooks/useStatusItens";
import { NotificarClienteButton } from "./NotificarClienteButton";

const PAGE_SIZE = 10;

export function ListaPedidos({
  modoLista = "geral",
  atualizacoes = [],
  pedidosSincronizados = {},
  atualizacoesCount = 0,
  onModoListaChange,
  onPedidoAtualizado,
  onAtualizacoesResolvidas,
  atualizacoesContent = null,
}) {
  const { statusItens } = useStatusItens();
  const [pedidos, setPedidos] = useState([]);
  const [termo, setTermo] = useState("");
  const [termoBusca, setTermoBusca] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("aberto");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const loadMoreRef = useRef(null);
  const loadingRef = useRef(false);
  const pageRef = useRef(1);
  const requestIdRef = useRef(0);

  const carregarPedidos = useCallback(async ({ reset = false } = {}) => {
    if (loadingRef.current && !reset) return;

    const requestId = reset ? ++requestIdRef.current : requestIdRef.current;
    loadingRef.current = true;

    try {
      setLoading(true);
      setError("");
      if (reset) setInitialLoading(true);

      const paginaAtual = reset ? 1 : pageRef.current;
      const result = await listarPedidosPorPagina({
        page: paginaAtual,
        pageSize: PAGE_SIZE,
        termo: termoBusca,
      });

      if (requestId !== requestIdRef.current) return;

      setPedidos((prev) => {
        if (reset) return result.pedidos;

        const idsExistentes = new Set(prev.map((pedido) => pedido.id));
        const novos = result.pedidos.filter((pedido) => !idsExistentes.has(pedido.id));

        return [...prev, ...novos];
      });

      setHasMore(result.hasMore);
      pageRef.current = paginaAtual + 1;
      setPage(pageRef.current);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      console.error(error);
      setError("Não foi possível carregar os pedidos. Tente novamente.");
    } finally {
      if (requestId !== requestIdRef.current) return;
      loadingRef.current = false;
      setLoading(false);
      setInitialLoading(false);
    }
  }, [termoBusca]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setTermoBusca(termo.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [termo]);

  useEffect(() => {
    pageRef.current = 1;
    setPage(1);
    setHasMore(true);
    void carregarPedidos({ reset: true });
  }, [carregarPedidos]);

  useEffect(() => {
    const idsSincronizados = Object.keys(pedidosSincronizados);
    if (!idsSincronizados.length) return;

    setPedidos((current) => current.map((pedido) => (
      pedidosSincronizados[pedido.id] ?? pedido
    )));
  }, [pedidosSincronizados]);

  const contagemPorRastreio = useMemo(() => contarItensPorRastreio(pedidos), [pedidos]);

  useEffect(() => {
    void sincronizarRastreiosEmGrupo(contagemPorRastreio).catch(() => {});
  }, [contagemPorRastreio]);

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      const itens = pedido.itens_pedido ?? [];
      const statusResumo = getStatusResumoPedido(itens, statusItens);
      const correspondeStatus =
        abaAtiva === "todos" ||
        statusResumo?.chave === abaAtiva;

      return correspondeStatus;
    });
  }, [abaAtiva, pedidos, statusItens]);

  const filtrosRapidos = [
    { id: "todos", label: "Todos" },
    { id: "aberto", label: "Em aberto" },
    { id: "pronto", label: "Pronto para retirada" },
    { id: "finalizado", label: "Finalizado" },
    { id: "problema", label: "Problema" },
    { id: "cancelado", label: "Cancelado" },
  ];

  useEffect(() => {
    if (modoLista !== "geral") return;

    const target = loadMoreRef.current;

    if (!target || !hasMore || loading || initialLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];

        if (first.isIntersecting && hasMore && !loadingRef.current) {
          void carregarPedidos();
        }
      },
      {
        root: null,
        rootMargin: "300px",
        threshold: 0,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [modoLista, hasMore, loading, initialLoading, page, carregarPedidos]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Gerenciamento de Pedidos</h1>
          <p className="mt-1 text-sm text-zinc-400">Controle individual de status por item de venda.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => carregarPedidos({ reset: true })} disabled={loading} className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Atualizar Lista
          </Button>

          <Button asChild className="bg-brand text-white hover:bg-brand/90">
            <Link href="/pedidos/novo">
              <Plus className="h-4 w-4" />
              Novo pedido
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/95 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="relative">
            <Input
              value={termo}
              onChange={(event) => setTermo(event.target.value)}
              className="h-12 rounded-2xl border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500"
              placeholder="Buscar por cliente, telefone, produto ou rastreio..."
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

      <div className="flex w-full rounded-2xl border border-zinc-800 gap-2 bg-zinc-900/70 p-1 sm:w-fit">
        <Button
          type="button"
          onClick={() => onModoListaChange?.("atualizados")}
          className={modoLista === "atualizados"
            ? "h-10 flex-1 bg-brand px-5 text-white hover:bg-brand/90 sm:flex-none"
            : "h-10 flex-1 border border-transparent bg-transparent px-5 text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900 hover:text-white sm:flex-none"}
        >
          Atualizados ({atualizacoesCount})
        </Button>
        <Button
          type="button"
          onClick={() => onModoListaChange?.("geral")}
          className={modoLista === "geral"
            ? "h-10 flex-1 bg-brand px-5 text-white hover:bg-brand/90 sm:flex-none"
            : "h-10 flex-1 border border-transparent bg-transparent px-5 text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900 hover:text-white sm:flex-none"}
        >
          Geral
        </Button>
      </div>

      {modoLista === "atualizados" ? (
        atualizacoesContent
      ) : initialLoading ? (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">Carregando pedidos...</p>
          {[...Array(2)].map((_, index) => (
            <div key={index} className="h-[320px] animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900" />
          ))}
        </div>
      ) : error && pedidos.length === 0 ? (
        <Card className="border-zinc-800 bg-zinc-900/95">
          <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
            <p className="text-sm text-red-300">{error}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" onClick={() => carregarPedidos({ reset: true })} className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800">
                Tentar novamente
              </Button>
              <Button asChild className="bg-brand text-white hover:bg-brand/90">
                <Link href="/pedidos/novo">+ Novo pedido</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : pedidos.length ? (
        <div className="space-y-4">
          {pedidosFiltrados.length ? (
            pedidosFiltrados.map((pedido) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                statusItens={statusItens}
                contagemPorRastreio={contagemPorRastreio}
                renderActions={(() => {
                  const atualizacoesAviso = getAtualizacoesAvisoDoPedido(atualizacoes, pedido.id);

                  if (!atualizacoesAviso.length) return undefined;

                  return (pedidoAtual) => (
                    <NotificarClienteButton
                      pedido={pedidoAtual}
                      atualizacoes={atualizacoesAviso}
                      onAtualizacoesResolvidas={onAtualizacoesResolvidas}
                    />
                  );
                })()}
                onPedidoAtualizado={(pedidoAtualizado) => {
                  setPedidos((current) => current.map((item) => (
                    item.id === pedidoAtualizado.id ? pedidoAtualizado : item
                  )));
                  onPedidoAtualizado?.(pedidoAtualizado);
                }}
              />
            ))
          ) : (
            <p className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-6 text-center text-sm text-zinc-500">
              Nenhum pedido encontrado neste filtro.
            </p>
          )}

          <div ref={loadMoreRef} className="h-10" />

          {loading && !initialLoading ? (
            <p className="text-center text-sm text-zinc-500">Carregando mais pedidos...</p>
          ) : null}

          {!hasMore ? (
            <p className="text-center text-sm text-zinc-600">Todos os pedidos foram carregados.</p>
          ) : null}

          {error ? (
            <p className="text-center text-sm text-red-300">{error}</p>
          ) : null}
        </div>
      ) : (
        <Card className="border-zinc-800 bg-zinc-900/95">
          <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
            <p className="text-lg font-semibold text-white">Nenhum pedido encontrado.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" onClick={() => carregarPedidos({ reset: true })} className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800">
                Atualizar lista
              </Button>
              <Button asChild className="bg-brand text-white hover:bg-brand/90">
                <Link href="/pedidos/novo">+ Novo pedido</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
