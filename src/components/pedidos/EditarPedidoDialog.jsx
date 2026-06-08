"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPhone } from "@/utils/masks";
import { atualizarPedido } from "@/services/pedidosService";

export function EditarPedidoDialog({ pedido, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!pedido) return;
    setNome(pedido.nome_cliente ?? "");
    setTelefone(formatPhone(pedido.telefone ?? ""));
  }, [pedido, open]);

  async function handleSave() {
    setSaving(true);
    try {
      const atualizado = await atualizarPedido(pedido.id, {
        nome_cliente: nome,
        telefone: telefone || null,
      });

      toast.success("Pedido atualizado com sucesso.");
      setOpen(false);
      if (onUpdated) onUpdated(atualizado);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Erro ao atualizar pedido.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="inline-flex items-center gap-2">
          <Pencil className="h-4 w-4" /> Editar pedido
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar pedido</DialogTitle>
          <DialogDescription>Atualize os dados do cliente. Pagamentos são registrados no histórico financeiro.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div>
            <Label>Nome do cliente</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>

          <div>
            <Label>Telefone</Label>
            <Input value={telefone} onChange={(e) => setTelefone(formatPhone(e.target.value))} />
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400">
            Valores e formas de pagamento não são alterados aqui. Use “Registrar pagamento”.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar alterações"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditarPedidoDialog;
