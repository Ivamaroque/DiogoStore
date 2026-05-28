"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { excluirPedido } from "@/services/pedidosService";

export function ConfirmarExcluirPedidoDialog({ pedidoId }) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  async function handleConfirm() {
    setLoading(true);
    try {
      await excluirPedido(pedidoId);
      toast.success("Pedido excluído com sucesso.");
      setOpen(false);
      router.push('/pedidos');
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Erro ao excluir pedido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="inline-flex items-center gap-2">
          <Trash2 className="h-4 w-4" /> Excluir pedido
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir pedido</AlertDialogTitle>
          <AlertDialogDescription>Tem certeza que deseja excluir este pedido? Todos os itens vinculados serão removidos. Essa ação não poderá ser desfeita.</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={loading}>{loading ? 'Excluindo...' : 'Excluir pedido'}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmarExcluirPedidoDialog;
