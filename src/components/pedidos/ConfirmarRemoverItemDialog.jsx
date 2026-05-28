"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deletarItem } from "@/services/itensPedidoService";

export function ConfirmarRemoverItemDialog({ item, onRemoved, itemCount }) {
  const [open, setOpen] = React.useState(false);

  async function handleConfirm() {
    if (itemCount <= 1) {
      toast.error("Este é o último item do pedido. Exclua o pedido inteiro.");
      setOpen(false);
      return;
    }

    try {
      await deletarItem(item.id);
      toast.success("Item removido com sucesso.");
      setOpen(false);
      if (onRemoved) onRemoved(item.id);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Erro ao remover item.");
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-red-400">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover item</AlertDialogTitle>
          <AlertDialogDescription>Tem certeza que deseja remover este item do pedido? Essa ação não poderá ser desfeita.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Remover item</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmarRemoverItemDialog;
