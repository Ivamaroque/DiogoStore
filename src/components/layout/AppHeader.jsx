"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "./Logo";
import { signOutUser } from "@/services/authService";

export function AppHeader({ perfil, email }) {
  const router = useRouter();
  const nome = perfil?.nome_completo || email || "Funcionário";

  async function handleLogout() {
    await signOutUser();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-black/95 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-200 lg:hidden" aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/pedidos" className="hidden sm:block">
            <Logo compact />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium text-white">{nome}</div>
            <div className="text-xs text-zinc-500">{perfil?.funcao || "Funcionário"}</div>
          </div>
          <Badge variant="brand" className="hidden md:inline-flex">Ativo</Badge>
          <Button variant="outline" size="sm" onClick={handleLogout} className="border-zinc-700">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}