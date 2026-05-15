import { notFound, redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { buscarPerfilPorId } from "@/services/authService";
import { listarStatusItens } from "@/services/statusService";
import { AppShell } from "@/components/layout/AppShell";
import { PedidoDetalhes } from "@/components/pedidos/PedidoDetalhes";

const PEDIDO_SELECT = `
  *,
  perfis (
    id,
    nome_completo,
    funcao
  ),
  itens_pedido (
    *,
    status_itens (
      id,
      nome,
      descricao,
      cor
    ),
    rastreios (
      id,
      codigo_rastreio,
      rastreio_em_grupo
    )
  )
`;

export default async function PedidoDetalhePage({ params }) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [perfil, statusItens, pedidoResult] = await Promise.all([
    buscarPerfilPorId(user.id, supabase),
    listarStatusItens(supabase),
    supabase.from("pedidos").select(PEDIDO_SELECT).eq("id", params.id).maybeSingle(),
  ]);

  if (pedidoResult.error) {
    throw pedidoResult.error;
  }

  if (!pedidoResult.data) {
    notFound();
  }

  return (
    <AppShell perfil={perfil} email={user.email}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">Detalhes do pedido</h1>
          <p className="mt-1 text-sm text-zinc-400">Visualize cliente, itens, rastreios e status individuais.</p>
        </div>
        <PedidoDetalhes pedidoInicial={pedidoResult.data} statusItens={statusItens} />
      </div>
    </AppShell>
  );
}