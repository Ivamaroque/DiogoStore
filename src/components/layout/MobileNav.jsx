import Link from "next/link";
import { ClipboardList, Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePerfilAtual } from "@/hooks/usePerfilAtual";

const items = [
  { href: "/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/pedidos/novo", label: "Novo", icon: Plus },
  { href: "/funcionarios", label: "Funcionários", icon: Users },
];

export function MobileNav({ pathname }) {
  const { user } = useAuth();
  const { perfil } = usePerfilAtual(user?.id);
  const podeGerenciarFuncionarios = perfil?.funcao === "Gestor";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-800 bg-black/95 px-3 py-2 backdrop-blur lg:hidden">
      <div className="grid grid-cols-3 gap-2">
        {items.filter((item) => item.href !== "/funcionarios" || podeGerenciarFuncionarios).map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center rounded-2xl px-3 py-2 text-xs transition-colors",
                active ? "bg-brand/15 text-brand" : "text-zinc-400",
              )}
            >
              <Icon className="mb-1 h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}