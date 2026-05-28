"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPhone } from "@/utils/masks";
import { currencyMask, parseCurrency } from "@/utils/currency";
import { atualizarPedido } from "@/services/pedidosService";

export function EditarPedidoDialog({ pedido, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [valorPago, setValorPago] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!pedido) return;
    setNome(pedido.nome_cliente ?? "");
    setTelefone(formatPhone(pedido.telefone ?? ""));
    setValorTotal(currencyMask(String(pedido.valor_total ?? 0)));
    setValorPago(currencyMask(String(pedido.valor_pago ?? 0)));
    setFormaPagamento(pedido.forma_pagamento ?? "");
  }, [pedido, open]);

  async function handleSave() {
    const total = parseCurrency(valorTotal);
    const pago = parseCurrency(valorPago);

    if (pago > total) {
      toast.error("O valor pago não pode ser maior que o valor total.");
      return;
    }

    setSaving(true);
    try {
      const atualizado = await atualizarPedido(pedido.id, {
        nome_cliente: nome,
        telefone: telefone || null,
        valor_total: total,
        valor_pago: pago,
        valor_restante: Math.max(total - pago, 0),
        forma_pagamento: formaPagamento || null,
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
          <DialogDescription>Atualize os dados gerais da encomenda.</DialogDescription>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Valor total</Label>
              <Input value={valorTotal} onChange={(e) => setValorTotal(currencyMask(e.target.value))} />
            </div>
            <div>
              <Label>Valor pago</Label>
              <Input value={valorPago} onChange={(e) => setValorPago(currencyMask(e.target.value))} />
            </div>
          </div>

          <div>
            <Label>Forma de pagamento</Label>
            <Input value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} />
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
