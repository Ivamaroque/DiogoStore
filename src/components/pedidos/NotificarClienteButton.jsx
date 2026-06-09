"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
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
import { confirmarClienteAvisado } from "@/services/atualizacoesPedidoService";
import { gerarTextoAtualizacaoPedidoWhatsApp } from "@/utils/gerarTextoAtualizacaoPedido";

export function NotificarClienteButton({
  pedido,
  atualizacoes = [],
  onAtualizacoesResolvidas,
}) {
  const [modalAberto, setModalAberto] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const texto = gerarTextoAtualizacaoPedidoWhatsApp(pedido);

  if (!atualizacoes.length) {
    return null;
  }

  async function notificarCliente() {
    if (!texto) {
      toast.error("Este pedido ainda não possui item com código de rastreio.");
      return;
    }

    try {
      await navigator.clipboard.writeText(texto);
      toast.success("Mensagem de atualização copiada!");
      setModalAberto(true);
    } catch {
      toast.error("Não foi possível copiar a mensagem.");
    }
  }

  async function confirmarAviso() {
    try {
      setConfirmando(true);
      for (const atualizacao of atualizacoes) {
        await confirmarClienteAvisado(atualizacao.id);
      }
      onAtualizacoesResolvidas?.(atualizacoes.map((atualizacao) => atualizacao.id));
      toast.success("Atualização concluída.");
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
        onClick={notificarCliente}
        disabled={!texto}
        className="w-full gap-2 rounded-xl bg-emerald-600 px-4 text-white hover:bg-emerald-700 sm:w-auto"
      >
        <Bell className="h-4 w-4" />
        Notificar cliente
      </Button>

      <AlertDialog open={modalAberto} onOpenChange={(open) => {
        if (!confirmando) setModalAberto(open);
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
