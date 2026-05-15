import Link from "next/link";
import { ArrowUpRight, CalendarDays, Package, Phone, User } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/dates";
import { RastreioBadge } from "./RastreioBadge";
import { StatusBadge } from "./StatusBadge";

export function PedidoCard({ pedido }) {
  return (
    <Card className="overflow-hidden border-zinc-800 bg-zinc-900/95">
      <CardHeader className="space-y-4 border-b border-zinc-800 bg-zinc-950/50">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{pedido.nome_cliente}</CardTitle>
            <p className="mt-1 text-sm text-zinc-400">{pedido.resumo_status}</p>
          </div>
          <Badge variant={pedido.valor_restante > 0 ? "danger" : "success"}>
            {pedido.valor_restante > 0 ? "Em aberto" : "Pago"}
          </Badge>
        </div>

        <div className="grid gap-2 text-sm text-zinc-400 sm:grid-cols-2">
          <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand" /> {pedido.telefone || "Sem telefone"}</div>
          <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-brand" /> {formatDateTime(pedido.criado_em)}</div>
          <div className="flex items-center gap-2"><User className="h-4 w-4 text-brand" /> {pedido.perfis?.nome_completo || "Sem responsável"}</div>
          <div className="flex items-center gap-2"><Package className="h-4 w-4 text-brand" /> {pedido.itens_pedido?.length || 0} itens</div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
            <p className="text-xs text-zinc-500">Valor total</p>
            <p className="mt-1 text-lg font-semibold text-brand">{formatCurrency(pedido.valor_total)}</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
            <p className="text-xs text-zinc-500">Valor pago</p>
            <p className="mt-1 text-lg font-semibold text-emerald-400">{formatCurrency(pedido.valor_pago)}</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
            <p className="text-xs text-zinc-500">Valor restante</p>
            <p className="mt-1 text-lg font-semibold text-red-400">{formatCurrency(Math.max(pedido.valor_restante, 0))}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {pedido.itens_pedido?.slice(0, 3).map((item) => (
            <div key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
              <p className="text-sm font-medium text-white">{item.nome_produto}</p>
              <p className="text-xs text-zinc-500">Qtd. {item.quantidade} • {item.tipo || "Sem tipo"}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge status={item.status_itens} />
                <RastreioBadge rastreio={item.rastreios} />
              </div>
            </div>
          ))}
        </div>

        {pedido.itens_pedido?.length > 3 ? <p className="text-xs text-zinc-500">+ {pedido.itens_pedido.length - 3} itens adicionais</p> : null}
      </CardContent>

      <CardFooter className="justify-between border-t border-zinc-800 bg-zinc-950/50 p-5">
        <div className="text-sm text-zinc-400">
          Pagamento: <span className="text-white">{pedido.forma_pagamento || "Não informado"}</span>
        </div>
        <Button asChild size="sm" className="gap-2">
          <Link href={`/pedidos/${pedido.id}`}>
            Ver detalhes
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}