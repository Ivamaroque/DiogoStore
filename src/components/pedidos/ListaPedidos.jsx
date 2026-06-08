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
import { useStatusItens } from "@/hooks/useStatusItens";

const PAGE_SIZE = 10;

export function ListaPedidos() {
  const { statusItens } = useStatusItens();
  const [pedidos, setPedidos] = useState([]);
  const [termo, setTermo] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("aberto");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const loadMoreRef = useRef(null);
  const loadingRef = useRef(false);
  const pageRef = useRef(1);

  const carregarPedidos = useCallback(async ({ reset = false } = {}) => {
    if (loadingRef.current) return;

    loadingRef.current = true;

    try {
      setLoading(true);
      setError("");

      const paginaAtual = reset ? 1 : pageRef.current;
      const result = await listarPedidosPorPagina({ page: paginaAtual, pageSize: PAGE_SIZE });

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
      console.error(error);
      setError("Não foi possível carregar os pedidos. Tente novamente.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    pageRef.current = 1;
    setPage(1);
    setHasMore(true);
    void carregarPedidos({ reset: true });
  }, [carregarPedidos]);

  const contagemPorRastreio = useMemo(() => contarItensPorRastreio(pedidos), [pedidos]);

  useEffect(() => {
    void sincronizarRastreiosEmGrupo(contagemPorRastreio).catch(() => {});
  }, [contagemPorRastreio]);

  const pedidosFiltrados = useMemo(() => {
    const termoLimpo = termo.trim().toLowerCase();

    return pedidos.filter((pedido) => {
      const itens = pedido.itens_pedido ?? [];
      const correspondeTermo =
        !termoLimpo ||
        String(pedido.id ?? "").toLowerCase().includes(termoLimpo) ||
        String(pedido.nome_cliente ?? "").toLowerCase().includes(termoLimpo) ||
        String(pedido.telefone ?? "").toLowerCase().includes(termoLimpo) ||
        itens.some(
          (item) =>
            String(item.nome_produto ?? "").toLowerCase().includes(termoLimpo) ||
            String(item.rastreios?.codigo_rastreio ?? "").toLowerCase().includes(termoLimpo),
        );

      const statusResumo = getStatusResumoPedido(itens, statusItens);
      const correspondeStatus =
        abaAtiva === "todos" ||
        statusResumo?.chave === abaAtiva;

      return correspondeTermo && correspondeStatus;
    });
  }, [abaAtiva, pedidos, statusItens, termo]);

  const filtrosRapidos = [
    { id: "todos", label: "Todos" },
    { id: "aberto", label: "Em aberto" },
    { id: "pronto", label: "Pronto para retirada" },
    { id: "finalizado", label: "Finalizado" },
    { id: "problema", label: "Problema" },
    { id: "cancelado", label: "Cancelado" },
  ];

  useEffect(() => {
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
  }, [hasMore, loading, initialLoading, page, carregarPedidos]);

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
              placeholder="Buscar por cliente, pedido ou rastreio..."
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

      {initialLoading ? (
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
      ) : pedidosFiltrados.length ? (
        <div className="space-y-4">
          {pedidosFiltrados.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              statusItens={statusItens}
              contagemPorRastreio={contagemPorRastreio}
              onPedidoAtualizado={(pedidoAtualizado) => {
                setPedidos((current) => current.map((item) => (
                  item.id === pedidoAtualizado.id ? pedidoAtualizado : item
                )));
              }}
            />
          ))}

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
