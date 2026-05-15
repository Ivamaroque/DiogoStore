import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, CheckCircle2, ClipboardList, Clock3, Package, Truck, Wallet, TrendingUp } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { buscarPerfilPorId } from "@/services/authService";
import { obterResumoDashboard } from "@/services/pedidosService";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/dates";

function StatCard({ title, value, icon: Icon, tone = "default" }) {
  const toneClasses = {
    default: "text-white",
    brand: "text-brand",
    success: "text-emerald-400",
    danger: "text-red-400",
    info: "text-sky-400",
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/95">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{title}</p>
          <p className={`mt-2 text-2xl font-semibold ${toneClasses[tone] || toneClasses.default}`}>{value}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-brand">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [perfil, resumo] = await Promise.all([
    buscarPerfilPorId(user.id, supabase),
    obterResumoDashboard(supabase),
  ]);

  return (
    <AppShell perfil={perfil} email={user.email}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-400">Resumo operacional da Diogo Store.</p>
          </div>
          <Badge variant="brand">Atualizado em tempo real</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total de pedidos" value={resumo.totalPedidos} icon={ClipboardList} tone="brand" />
          <StatCard title="Total vendido" value={formatCurrency(resumo.totalVendido)} icon={TrendingUp} tone="success" />
          <StatCard title="Total recebido" value={formatCurrency(resumo.totalRecebido)} icon={Wallet} tone="success" />
          <StatCard title="Total a receber" value={formatCurrency(resumo.totalAReceber)} icon={Clock3} tone="danger" />
          <StatCard title="Itens com problema" value={resumo.totalItensProblema} icon={AlertTriangle} tone="danger" />
          <StatCard title="Prontos para retirada" value={resumo.totalItensProntos} icon={Package} tone="info" />
          <StatCard title="Itens entregues" value={resumo.totalItensEntregues} icon={CheckCircle2} tone="success" />
          <StatCard title="Em acompanhamento" value={resumo.pedidosRecentes.length} icon={Truck} tone="default" />
        </div>

        <Card className="border-zinc-800 bg-zinc-900/95">
          <CardHeader>
            <CardTitle className="text-white">Pedidos mais recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {resumo.pedidosRecentes.length ? resumo.pedidosRecentes.map((pedido) => (
              <Link
                href={`/pedidos/${pedido.id}`}
                key={pedido.id}
                className="flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition-colors hover:border-brand/40 hover:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-white">{pedido.nome_cliente}</p>
                  <p className="text-sm text-zinc-500">{formatDateTime(pedido.criado_em)} • {pedido.perfis?.nome_completo || "Sem funcionário"}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-brand">{formatCurrency(pedido.valor_total)}</p>
                  <p className="text-zinc-400">{pedido.resumo_status}</p>
                </div>
              </Link>
            )) : (
              <div className="rounded-2xl border border-dashed border-zinc-800 px-4 py-12 text-center text-sm text-zinc-500">
                Nenhum pedido encontrado.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}