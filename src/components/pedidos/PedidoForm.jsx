"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Package, Phone, Save, ShoppingBag, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FinanceiroResumo } from "./FinanceiroResumo";
import { ItemPedidoForm } from "./ItemPedidoForm";
import { criarPedidoCompleto } from "@/services/pedidosService";
import { currencyMask, parseCurrency } from "@/utils/currency";
import { formatPhone } from "@/utils/masks";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency } from "@/utils/currency";
import { useAuth } from "@/components/auth/AuthProvider";
import { temPersonalizacao } from "@/utils/personalizacao";

const itemPadrao = {
  quantidade: 1,
  nome_produto: "",
  tipo: "",
  tamanho: "",
  nome_personalizado: "",
  numero_personalizado: "",
  observacao_status: "",
  rastreio_id: null,
  status_item_id: 1,
};

export function PedidoForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [nomeCliente, setNomeCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [valorPago, setValorPago] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("Pix");
  const [itens, setItens] = useState([]);
  const [itemAtual, setItemAtual] = useState(itemPadrao);
  const [salvando, setSalvando] = useState(false);

  const valorTotalNumerico = parseCurrency(valorTotal);
  const valorPagoNumerico = parseCurrency(valorPago);
  const valorRestante = Math.max(valorTotalNumerico - valorPagoNumerico, 0);

  const tiposResumo = useMemo(() => itens.map((item) => item.nome_produto).join(", "), [itens]);

  function limparItem() {
    setItemAtual(itemPadrao);
  }

  function adicionarItem() {
    if (!itemAtual.nome_produto.trim()) {
      toast.error("Informe o nome do produto do item.");
      return;
    }

    if (Number(itemAtual.quantidade) < 1) {
      toast.error("A quantidade precisa ser maior ou igual a 1.");
      return;
    }

    setItens((current) => [...current, { ...itemAtual, quantidade: Number(itemAtual.quantidade) }]);
    limparItem();
    toast.success("Item adicionado.");
  }

  async function handleSalvar() {
    if (!nomeCliente.trim()) return toast.error("Informe o nome do cliente.");
    if (!itens.length) return toast.error("Adicione pelo menos um item.");
    if (valorTotalNumerico <= 0) return toast.error("O valor total precisa ser maior que zero.");
    if (valorPagoNumerico > valorTotalNumerico) return toast.error("O valor pago não pode ser maior que o valor total.");
    if (valorPagoNumerico > 0 && !formaPagamento) return toast.error("Informe a forma de pagamento.");
    if (!user?.id) return toast.error("Usuário logado não encontrado.");

    setSalvando(true);
    try {
      const resultado = await criarPedidoCompleto(
        {
          pedido: {
            nome_cliente: nomeCliente.trim(),
            telefone: telefone.trim(),
            valor_total: valorTotalNumerico,
            valor_pago: valorPagoNumerico,
            forma_pagamento: formaPagamento,
          },
          itens,
          criadoPor: user.id,
        },
      );

      toast.success("Pedido salvo com sucesso.");
      router.push(`/pedidos/${resultado.pedido.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error?.message || "Não foi possível salvar o pedido.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-zinc-800 bg-zinc-900/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ShoppingBag className="h-5 w-5 text-brand" />
              Novo pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Nome do cliente</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input value={nomeCliente} onChange={(event) => setNomeCliente(event.target.value)} className="pl-10" placeholder="Nome completo" />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Telefone / WhatsApp</Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    value={telefone}
                    onChange={(event) => setTelefone(formatPhone(event.target.value))}
                    className="pl-10"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </div>

            <ItemPedidoForm item={itemAtual} onChange={setItemAtual} onAdicionar={adicionarItem} showStatusBadge={false} />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Itens adicionados</h3>
                <Badge variant="brand">{itens.length} itens</Badge>
              </div>

              {!itens.length ? (
                <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/70 px-4 py-8 text-center text-sm text-zinc-500">
                  Nenhum item adicionado ainda.
                </div>
              ) : (
                <div className="space-y-3">
                  {itens.map((item, index) => (
                    <div key={`${item.nome_produto}-${index}`} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{item.nome_produto}</p>
                          <p className="text-xs text-zinc-500">Qtd. {item.quantidade} • {item.tipo || "Sem tipo"} • {item.tamanho || "Sem tamanho"}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setItens((current) => current.filter((_, currentIndex) => currentIndex !== index))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatusBadge status={1} />
                        {temPersonalizacao(item) ? <Badge variant="default">Personalização adicionada</Badge> : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <FinanceiroResumo valorTotal={valorTotalNumerico} valorPago={valorPagoNumerico} valorRestante={valorRestante} showStatusBadge={false} />

          <Card className="border-zinc-800 bg-zinc-900/95">
            <CardHeader>
              <CardTitle className="text-white">Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Valor total</Label>
                <Input value={valorTotal} onChange={(event) => setValorTotal(currencyMask(event.target.value))} placeholder="R$ 0,00" />
              </div>
              <div className="space-y-2">
                <Label>Valor pago</Label>
                <Input value={valorPago} onChange={(event) => setValorPago(currencyMask(event.target.value))} placeholder="R$ 0,00" />
              </div>
              <div className="space-y-2">
                <Label>Forma de pagamento</Label>
                <select
                  value={formaPagamento}
                  onChange={(event) => setFormaPagamento(event.target.value)}
                  className="flex h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  {[
                    "Pix",
                    "Dinheiro",
                    "Débito",
                    "Crédito",
                  ].map((opcao) => (
                    <option key={opcao} value={opcao}>{opcao}</option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
                Valor restante calculado: <span className="font-semibold text-red-400">{formatCurrency(valorRestante)}</span>
              </div>

              <Button onClick={handleSalvar} className="w-full gap-2" disabled={salvando}>
                {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar pedido
              </Button>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/95">
            <CardHeader>
              <CardTitle className="text-white">Resumo rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-400">
              <div className="flex items-center justify-between"><span>Cliente</span><span className="text-white">{nomeCliente || "—"}</span></div>
              <div className="flex items-center justify-between"><span>Telefone</span><span className="text-white">{telefone || "—"}</span></div>
              <div className="flex items-center justify-between"><span>Itens</span><span className="text-white">{itens.length}</span></div>
              <div className="flex items-center justify-between"><span>Produtos</span><span className="text-white">{tiposResumo || "—"}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
