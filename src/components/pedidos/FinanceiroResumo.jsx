import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/currency";

export function FinanceiroResumo({ valorTotal = 0, valorPago = 0, valorRestante = 0, compact = false, showStatusBadge = true }) {
  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardContent className={compact ? "p-4" : "p-6"}>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total</p>
            <p className="mt-1 text-lg font-semibold text-brand">{formatCurrency(valorTotal)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Pago</p>
            <p className="mt-1 text-lg font-semibold text-emerald-400">{formatCurrency(valorPago)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Restante</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-lg font-semibold text-red-400">{formatCurrency(Math.max(valorRestante, 0))}</p>
              {/* {showStatusBadge ? (
                <Badge variant={valorRestante > 0 ? "danger" : "success"}>{valorRestante > 0 ? "Pendente" : "Quitado"}</Badge>
              ) : null} */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}