"use client";

import { useState } from "react";
import { Bell, PackageCheck } from "lucide-react";
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
import { confirmarClienteAvisado, confirmarEntregaPedido, marcarPedidoChegou } from "@/services/atualizacoesPedidoService";
import { buscarPedidoPorId } from "@/services/pedidosService";
import { baixarFotoProduto } from "@/services/produtosService";
import { gerarTextoAtualizacaoPedidoWhatsApp, gerarTextoPedidoChegouWhatsApp } from "@/utils/gerarTextoAtualizacaoPedido";
import { TIPO_AGUARDANDO_CHEGADA, TIPO_AVISAR_CHEGADA, TIPO_CONFIRMAR_ENTREGA } from "@/utils/atualizacoesPedido";
import { linkWhatsAppPedido } from "@/utils/whatsappPedido";

export function NotificarClienteButton({
  pedido,
  atualizacoes = [],
  onAtualizacoesResolvidas,
  onPedidoAtualizado,
}) {
  const [modalAberto, setModalAberto] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const tipo = atualizacoes[0]?.tipo;
  const atualizacoesDaEtapa = atualizacoes.filter((atualizacao) => atualizacao.tipo === tipo);
  const aguardandoChegada = tipo === TIPO_AGUARDANDO_CHEGADA;
  const avisarChegada = tipo === TIPO_AVISAR_CHEGADA;
  const confirmarEntrega = tipo === TIPO_CONFIRMAR_ENTREGA;
  const texto = avisarChegada
    ? gerarTextoPedidoChegouWhatsApp(pedido)
    : gerarTextoAtualizacaoPedidoWhatsApp(pedido);
  const imagens = [...new Set((pedido?.itens_pedido ?? [])
    .map((item) => item.produtos?.imagem_path)
    .filter(Boolean))];
  const linkWhatsApp = linkWhatsAppPedido(pedido?.telefone, texto);

  if (!atualizacoes.length) {
    return null;
  }

  async function baixarFotos() {
    let falhas = 0;
    for (const [index, path] of imagens.entries()) {
      try {
        const foto = await baixarFotoProduto(path);
        const url = URL.createObjectURL(foto);
        const link = document.createElement("a");
        link.href = url;
        link.download = `pedido-${String(pedido.id).slice(0, 8)}-foto-${index + 1}.${path.split(".").at(-1)}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      } catch {
        falhas += 1;
      }
    }
    if (falhas) toast.error(`${falhas} foto(s) não puderam ser baixadas.`);
  }

  function iniciarAcao() {
    if (aguardandoChegada || confirmarEntrega) {
      setModalAberto(true);
      return;
    }

    if (!texto) {
      toast.error("Este pedido ainda não possui item com código de rastreio.");
      return;
    }

    if (!linkWhatsApp) {
      toast.error("Cadastre um telefone com DDD válido para abrir o WhatsApp.");
      return;
    }

    window.open(linkWhatsApp, "_blank", "noopener,noreferrer");
    setModalAberto(true);
    if (imagens.length) void baixarFotos();
  }

  async function confirmarAviso() {
    try {
      setConfirmando(true);
      if (aguardandoChegada || confirmarEntrega) {
        if (confirmarEntrega) {
          await confirmarEntregaPedido(atualizacoesDaEtapa[0].id);
        } else {
          await marcarPedidoChegou(atualizacoesDaEtapa[0].id);
        }
        try {
          onPedidoAtualizado?.(await buscarPedidoPorId(pedido.id));
        } catch {
          // A mudança já foi registrada; a lista será sincronizada na próxima atualização.
        }
      } else {
        for (const atualizacao of atualizacoesDaEtapa) {
          await confirmarClienteAvisado(atualizacao.id);
        }
      }
      onAtualizacoesResolvidas?.(atualizacoesDaEtapa.map((atualizacao) => atualizacao.id));
      toast.success(confirmarEntrega
        ? "Entrega confirmada. Pedido finalizado."
        : aguardandoChegada ? "Chegada registrada. O funcionário será avisado." : "Atualização concluída.");
      setModalAberto(false);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Não foi possível concluir a atualização.");
    } finally {
      setConfirmando(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        onClick={iniciarAcao}
        disabled={!aguardandoChegada && !confirmarEntrega && !texto}
        className="w-full gap-2 rounded-xl bg-emerald-600 px-4 text-white hover:bg-emerald-700 sm:w-auto"
      >
        {aguardandoChegada || confirmarEntrega ? <PackageCheck className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        {confirmarEntrega ? "Confirmar entrega" : aguardandoChegada ? "Pedido chegou" : avisarChegada ? "Avisar chegada" : "Notificar cliente"}
      </Button>

      <AlertDialog open={modalAberto} onOpenChange={(open) => {
        if (!confirmando) setModalAberto(open);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmarEntrega ? "Confirmar entrega" : aguardandoChegada ? "Confirmar chegada" : "Conversa preparada"}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmarEntrega
                ? "Confirma que o cliente recebeu ou retirou o pedido? Todos os itens serão marcados como Finalizado."
                : aguardandoChegada
                  ? "Confirma que o pedido chegou à loja? O funcionário que registrou o pedido receberá uma atualização para avisar o cliente."
                  : avisarChegada
                    ? `O WhatsApp foi aberto com a mensagem de chegada pronta. ${imagens.length ? "Anexe as fotos baixadas e envie a mensagem." : "Envie a mensagem."} Confirme somente depois de avisar o cliente.`
                    : `O WhatsApp foi aberto com a mensagem de envio pronta. ${imagens.length ? "Anexe as fotos baixadas e envie a mensagem." : "Envie a mensagem."} Confirme somente depois de avisar o cliente.`}
            </AlertDialogDescription>
            {!aguardandoChegada && !confirmarEntrega ? (
              <div className="space-y-2">
                {imagens.length > 1 ? <p className="text-xs text-zinc-400">Se o navegador solicitar, permita o download de várias fotos.</p> : null}
                <a href={linkWhatsApp || "#"} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-400 underline underline-offset-2">
                  Abrir conversa no WhatsApp
                </a>
              </div>
            ) : null}
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
              {confirmando ? "Confirmando..." : confirmarEntrega ? "Finalizar pedido" : aguardandoChegada ? "Confirmar chegada" : "Confirmar aviso"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
