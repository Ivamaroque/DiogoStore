"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { confirmarClienteAvisado } from "@/services/atualizacoesPedidoService";
import { gerarTextoAtualizacaoPedidoWhatsApp } from "@/utils/gerarTextoAtualizacaoPedido";
import { contarItensPorRastreio } from "@/utils/rastreios";
import { PedidoCard } from "./PedidoCard";

const TIPO_AVISAR_CLIENTE = "rastreio_adicionado_avisar_cliente";

function getPedido(atualizacao) {
  return Array.isArray(atualizacao.pedidos)
    ? atualizacao.pedidos[0]
    : atualizacao.pedidos;
}

function getPedidosUnicos(atualizacoes) {
  const pedidosPorId = new Map();

  atualizacoes.forEach((atualizacao) => {
    const pedido = getPedido(atualizacao);

    if (pedido?.id && !pedidosPorId.has(pedido.id)) {
      pedidosPorId.set(pedido.id, pedido);
    }
  });

  return [...pedidosPorId.values()];
}

function getAtualizacaoDeRastreio(atualizacoes, pedidoId) {
  return atualizacoes.find((atualizacao) => (
    String(atualizacao.pedido_id) === String(pedidoId) &&
    atualizacao.tipo === TIPO_AVISAR_CLIENTE
  ));
}

export function AtualizacoesPedidos({
  atualizacoes,
  statusItens = [],
  erro = "",
  onRecarregar,
  onVerPedidosGerais,
  onAtualizacaoResolvida,
}) {
  const pedidosRecebidos = useMemo(() => getPedidosUnicos(atualizacoes), [atualizacoes]);
  const [pedidos, setPedidos] = useState(pedidosRecebidos);
  const [atualizacaoParaConfirmar, setAtualizacaoParaConfirmar] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    setPedidos(pedidosRecebidos);
  }, [pedidosRecebidos]);

  const contagemPorRastreio = useMemo(() => contarItensPorRastreio(pedidos), [pedidos]);

  async function notificarCliente(pedido, atualizacao) {
    const texto = gerarTextoAtualizacaoPedidoWhatsApp(pedido);

    if (!texto) {
      toast.error("Este pedido ainda não possui item com código de rastreio.");
      return;
    }

    try {
      await navigator.clipboard.writeText(texto);
      toast.success("Mensagem de atualização copiada!");
      setAtualizacaoParaConfirmar(atualizacao);
    } catch {
      toast.error("Não foi possível copiar a mensagem.");
    }
  }

  async function confirmarAviso() {
    if (!atualizacaoParaConfirmar) return;

    try {
      setConfirmando(true);
      await confirmarClienteAvisado(atualizacaoParaConfirmar.id);
      onAtualizacaoResolvida?.(atualizacaoParaConfirmar.id);
      toast.success("Atualização concluída.");
      setAtualizacaoParaConfirmar(null);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Não foi possível concluir a atualização.");
    } finally {
      setConfirmando(false);
    }
  }

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
            <p className="text-lg font-semibold text-white">Nenhuma atualização pendente.</p>
            <p className="mt-2 max-w-xl text-sm text-zinc-400">
              Quando houver pedidos aguardando ação, eles aparecerão aqui.
            </p>
          </div>
          <Button type="button" onClick={onVerPedidosGerais} className="bg-brand text-white hover:bg-brand/90">
            Ver pedidos gerais
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {pedidos.map((pedido) => {
          const atualizacaoRastreio = getAtualizacaoDeRastreio(atualizacoes, pedido.id);

          return (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              statusItens={statusItens}
              contagemPorRastreio={contagemPorRastreio}
              renderActions={atualizacaoRastreio ? (pedidoAtual) => {
                const possuiRastreio = Boolean(gerarTextoAtualizacaoPedidoWhatsApp(pedidoAtual));

                return (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => notificarCliente(pedidoAtual, atualizacaoRastreio)}
                    disabled={!possuiRastreio}
                    className="w-full gap-2 rounded-xl bg-emerald-600 px-4 text-white hover:bg-emerald-700 sm:w-auto"
                  >
                    <Bell className="h-4 w-4" />
                    Notificar cliente
                  </Button>
                );
              } : undefined}
              onPedidoAtualizado={(pedidoAtualizado) => {
                setPedidos((current) => current.map((item) => (
                  item.id === pedidoAtualizado.id ? pedidoAtualizado : item
                )));
              }}
            />
          );
        })}
      </div>

      <AlertDialog open={Boolean(atualizacaoParaConfirmar)} onOpenChange={(open) => {
        if (!open && !confirmando) setAtualizacaoParaConfirmar(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mensagem copiada</AlertDialogTitle>
            <AlertDialogDescription>
              A mensagem de atualização foi copiada. Confirma que o cliente já foi avisado sobre o envio do pedido?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              disabled={confirmando}
              onClick={(event) => {
                event.preventDefault();
                void confirmarAviso();
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {confirmando ? "Confirmando..." : "Confirmar aviso"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
