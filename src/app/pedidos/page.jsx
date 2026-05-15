import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { buscarPerfilPorId } from "@/services/authService";
import { listarStatusItens } from "@/services/statusService";
import { AppShell } from "@/components/layout/AppShell";
import { ListaPedidos } from "@/components/pedidos/ListaPedidos";

export default async function PedidosPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [perfil, statusItens] = await Promise.all([
    buscarPerfilPorId(user.id, supabase),
    listarStatusItens(supabase),
  ]);

  return (
    <AppShell perfil={perfil} email={user.email}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">Pedidos</h1>
          <p className="mt-1 text-sm text-zinc-400">Acompanhe todos os pedidos e seus itens individualmente.</p>
        </div>
        <ListaPedidos statusItens={statusItens} />
      </div>
    </AppShell>
  );
}