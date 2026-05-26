"use client";

import { AppShell } from "@/components/layout/AppShell";
import { FuncionariosManager } from "./FuncionariosManager";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePerfilAtual } from "@/hooks/usePerfilAtual";
import { Card, CardContent } from "@/components/ui/card";

export function FuncionariosClient() {
  const { user } = useAuth();
  const { perfil, loading } = usePerfilAtual(user?.id);
  const podeGerenciarFuncionarios = perfil?.funcao === "Gestor";

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">Controlar funcionários</h1>
          <p className="mt-1 text-sm text-zinc-400">Crie usuários internos e mantenha o cadastro de perfis via Supabase.</p>
        </div>

        {loading ? (
          <Card className="border-zinc-800 bg-zinc-900/95">
            <CardContent className="px-6 py-10 text-sm text-zinc-400">Verificando permissões...</CardContent>
          </Card>
        ) : podeGerenciarFuncionarios ? (
          <FuncionariosManager />
        ) : (
          <Card className="border-zinc-800 bg-zinc-900/95">
            <CardContent className="px-6 py-10 text-sm text-zinc-300">
              Você não tem permissão para gerenciar funcionários.
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}