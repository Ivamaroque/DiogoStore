"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { criarPagamentoPedido } from "@/services/pagamentosService";
import { currencyMask, formatCurrency, parseCurrency } from "@/utils/currency";

const FORMAS_PAGAMENTO = ["Pix", "Dinheiro", "Crédito", "Débito", "Outro"];

export function RegistrarPagamentoDialog({
  pedido,
  open,
  onOpenChange,
  onPagamentoRegistrado,
  usuarioAtual,
  perfilAtual,
}) {
  const { user, perfil } = useAuth();
  const [valor, setValor] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("Pix");
  const [observacao, setObservacao] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const responsavel = usuarioAtual ?? perfilAtual ?? perfil ?? user;
  const valorRestante = Number(pedido?.valor_restante || 0);

  useEffect(() => {
    if (!open || !pedido) return;

    setValor(formatCurrency(valorRestante));
    setFormaPagamento("Pix");
    setObservacao("");
    setErro("");
  }, [open, pedido, valorRestante]);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setErro("");

      const valorNumerico = parseCurrency(valor);

      if (valorNumerico <= 0) {
        throw new Error("Informe um valor maior que zero.");
      }

      if (valorNumerico > valorRestante) {
        throw new Error("O pagamento não pode ser maior que o valor restante.");
      }

      if (!formaPagamento) {
        throw new Error("Informe a forma de pagamento.");
      }

      if (!responsavel?.id) {
        throw new Error("Usuário responsável pelo pagamento não encontrado.");
      }

      const pagamento = await criarPagamentoPedido({
        pedido_id: pedido.id,
        valor: valorNumerico,
        forma_pagamento: formaPagamento,
        observacao,
        criado_por: responsavel.id,
      });

      await onPagamentoRegistrado?.(pagamento);
      onOpenChange(false);
      toast.success("Pagamento registrado com sucesso.");
    } catch (error) {
      setErro(error?.message || "Erro ao registrar pagamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !loading && onOpenChange(nextOpen)}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Registrar pagamento</DialogTitle>
            <DialogDescription>Informe o valor recebido e a forma de pagamento.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Valor total</p>
              <p className="mt-1 font-semibold text-white">{formatCurrency(pedido?.valor_total)}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Já pago</p>
              <p className="mt-1 font-semibold text-emerald-400">{formatCurrency(pedido?.valor_pago)}</p>
            </div>
            <div className="rounded-2xl border border-brand/40 bg-brand/10 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-brand/80">Restante</p>
              <p className="mt-1 font-semibold text-brand">{formatCurrency(valorRestante)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor-recebido">Valor recebido</Label>
            <Input
              id="valor-recebido"
              value={valor}
              onChange={(event) => setValor(currencyMask(event.target.value))}
              inputMode="numeric"
              autoFocus
              disabled={loading}
              className="focus-visible:ring-[#ed6f1a]/60"
              placeholder="R$ 0,00"
            />
          </div>

          <div className="space-y-2">
            <Label>Forma de pagamento</Label>
            <Select value={formaPagamento} onValueChange={setFormaPagamento} disabled={loading}>
              <SelectTrigger className="focus:ring-[#ed6f1a]/60">
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {FORMAS_PAGAMENTO.map((forma) => (
                  <SelectItem key={forma} value={forma}>{forma}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao-pagamento">Observação</Label>
            <Textarea
              id="observacao-pagamento"
              value={observacao}
              onChange={(event) => setObservacao(event.target.value)}
              disabled={loading}
              className="focus-visible:ring-[#ed6f1a]/60"
              placeholder="Ex: segunda parcela, pagamento complementar, comprovante enviado..."
            />
          </div>

          {erro ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {erro}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || valorRestante <= 0} className="bg-[#27a074] text-white hover:bg-[#27a074]/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Registrar pagamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
