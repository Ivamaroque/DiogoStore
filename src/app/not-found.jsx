import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/layout/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-xl border-zinc-800 bg-zinc-900/95">
        <CardHeader className="items-center text-center">
          <Logo />
          <CardTitle className="mt-4 text-2xl text-white">Página não encontrada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-sm text-zinc-400">
          <p>A rota solicitada não existe ou foi removida.</p>
          <Button asChild>
            <Link href="/pedidos">Voltar para pedidos</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}