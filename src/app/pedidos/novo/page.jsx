import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { buscarPerfilPorId } from "@/services/authService";
import { AppShell } from "@/components/layout/AppShell";
import { PedidoForm } from "@/components/pedidos/PedidoForm";

export default async function NovoPedidoPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const perfil = await buscarPerfilPorId(user.id, supabase);

  return (
    <AppShell perfil={perfil} email={user.email}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">Novo pedido</h1>
          <p className="mt-1 text-sm text-zinc-400">Cadastre cliente, itens, rastreio e pagamento em um fluxo único.</p>
        </div>
        <PedidoForm userId={user.id} />
      </div>
    </AppShell>
  );
}