"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "./StatusBadge";
import { getStatusPorId } from "@/lib/constants/status";

const tipos = ["Infantil", "Feminina", "Masculina"];

export function ItemPedidoForm({ item, onChange, onAdicionar }) {
  const statusInicial = getStatusPorId(item.status_item_id ?? 1);

  function updateField(field, value) {
    onChange((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">Novo item</h3>
          <p className="text-sm text-zinc-500">Cada item começa em “Pedido realizado”.</p>
        </div>
        <StatusBadge status={statusInicial} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Quantidade</Label>
          <Input type="number" min="1" value={item.quantidade} onChange={(event) => updateField("quantidade", event.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Tipo</Label>
          <select
            value={item.tipo}
            onChange={(event) => updateField("tipo", event.target.value)}
            className="flex h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <option value="">Selecione</option>
            {tipos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Nome do produto</Label>
          <Input value={item.nome_produto} onChange={(event) => updateField("nome_produto", event.target.value)} placeholder="Ex.: Camisa personalizada" />
        </div>

        <div className="space-y-2">
          <Label>Tamanho</Label>
          <Input value={item.tamanho} onChange={(event) => updateField("tamanho", event.target.value)} placeholder="M, G, 42..." />
        </div>

        <div className="space-y-2">
          <Label>Código de rastreio</Label>
          <Input value={item.codigo_rastreio} onChange={(event) => updateField("codigo_rastreio", event.target.value)} placeholder="Opcional" />
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 md:col-span-2">
          <div>
            <p className="text-sm font-medium text-white">Rastreio em grupo</p>
            <p className="text-xs text-zinc-500">Usado quando vários itens compartilham o mesmo código.</p>
          </div>
          <Switch checked={item.rastreio_em_grupo} onCheckedChange={(checked) => updateField("rastreio_em_grupo", checked)} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Personalização</Label>
          <Textarea value={item.personalizacao} onChange={(event) => updateField("personalizacao", event.target.value)} placeholder="Detalhes da arte, nome, cor..." />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Observação do status</Label>
          <Textarea value={item.observacao_status} onChange={(event) => updateField("observacao_status", event.target.value)} placeholder="Opcional" />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-zinc-500">
          Se o código já existir no banco, o sistema reutiliza o rastreio.
        </div>
        <Button type="button" onClick={onAdicionar} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar item
        </Button>
      </div>
    </div>
  );
}