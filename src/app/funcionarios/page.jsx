import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { buscarPerfilPorId } from "@/services/authService";
import { AppShell } from "@/components/layout/AppShell";
import { FuncionariosManager } from "@/components/funcionarios/FuncionariosManager";

export default async function FuncionariosPage() {
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
          <h1 className="text-3xl font-semibold text-white">Controlar funcionários</h1>
          <p className="mt-1 text-sm text-zinc-400">Crie usuários internos e mantenha o cadastro de perfis via Supabase.</p>
        </div>
        <FuncionariosManager />
      </div>
    </AppShell>
  );
}