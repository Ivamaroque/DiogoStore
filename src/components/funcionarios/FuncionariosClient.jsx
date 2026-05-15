"use client";

import { AppShell } from "@/components/layout/AppShell";
import { FuncionariosManager } from "./FuncionariosManager";

export function FuncionariosClient() {
  return (
    <AppShell>
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