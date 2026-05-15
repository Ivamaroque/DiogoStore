import Link from "next/link";
import Image from "next/image";
import { ClipboardList, Plus, ShoppingBag, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import logoImg from "@/assets/logo.png";

const links = [
  { href: "/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/pedidos/novo", label: "Novo pedido", icon: Plus },
  { href: "/funcionarios", label: "Funcionários", icon: Users },
];

export function AppSidebar({ pathname }) {
  return (
    <aside className="hidden w-80 shrink-0 border-r border-zinc-800 bg-zinc-950/95 lg:flex lg:flex-col">
      <div className="border-b border-zinc-800 px-6 py-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                active
                  ? "border-brand/30 bg-brand/10 text-brand"
                  : "border-transparent text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">
                <Image src={logoImg} alt="Diogo Store" width={120} height={24} className="object-contain" />
              </div>
              <div className="text-xs text-zinc-500">Painel interno</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}