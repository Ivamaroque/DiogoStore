import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, Plus, Users } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { buscarPerfilPorId } from "@/services/authService";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const perfil = await buscarPerfilPorId(user.id, supabase);

  return (
    <AppShell perfil={perfil} email={user.email}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Home</h1>
            <p className="mt-1 text-sm text-zinc-400">Atalhos principais para operar a Diogo Store.</p>
          </div>
          <Badge variant="brand">Acesso rápido</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-zinc-800 bg-zinc-900/95 transition-transform hover:-translate-y-0.5">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15 text-brand">
                <ClipboardList className="h-5 w-5" />
              </div>
              <CardTitle className="pt-4 text-white">Pedidos</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-400">
              Visualize, filtre e acompanhe todos os pedidos cadastrados.
              <div className="mt-4">
                <Link href="/pedidos" className="inline-flex rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-white hover:border-brand/40 hover:bg-brand/10">
                  Abrir pedidos
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/95 transition-transform hover:-translate-y-0.5">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15 text-brand">
                <Plus className="h-5 w-5" />
              </div>
              <CardTitle className="pt-4 text-white">Novo pedido</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-400">
              Cadastre cliente, itens, pagamento e rastreio em um único fluxo.
              <div className="mt-4">
                <Link href="/pedidos/novo" className="inline-flex rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-white hover:border-brand/40 hover:bg-brand/10">
                  Criar pedido
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/95 transition-transform hover:-translate-y-0.5">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15 text-brand">
                <Users className="h-5 w-5" />
              </div>
              <CardTitle className="pt-4 text-white">Controlar funcionários</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-400">
              Crie funcionários e associe usuário, e-mail e função via Supabase.
              <div className="mt-4">
                <Link href="/funcionarios" className="inline-flex rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-white hover:border-brand/40 hover:bg-brand/10">
                  Abrir funcionários
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}