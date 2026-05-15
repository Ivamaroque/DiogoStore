"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, User } from "lucide-react";
import { signIn } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/layout/Logo";

export function LoginForm() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await signIn({ usuario, password });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setErro(error?.message || "Usuário ou senha inválidos");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
      <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden flex-col justify-between rounded-[2rem] border border-zinc-800 bg-[radial-gradient(circle_at_top,_rgba(237,111,26,0.18),_transparent_55%),linear-gradient(180deg,#111111_0%,#090909_100%)] p-10 lg:flex">
          <div>
            <Logo />
            <h1 className="mt-10 max-w-xl text-5xl font-semibold tracking-tight text-white">
              Gestão de encomendas feita para o ritmo da loja.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-zinc-400">
              Acompanhe pedidos, itens, rastreios e status individuais em uma interface pensada para uso diário, rápida no celular e clara no desktop.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm text-zinc-300">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">Pedidos internos organizados</div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">Rastreio compartilhado</div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">Status por item</div>
          </div>
        </div>

        <Card className="border-zinc-800 bg-zinc-900/90 shadow-glow">
          <CardHeader className="space-y-3">
            <Logo compact />
            <div className="pt-4">
              <CardTitle>Acessar painel</CardTitle>
              <CardDescription>Entre com seu usuário e senha para continuar.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="usuario">Usuário</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    id="usuario"
                    type="text"
                    value={usuario}
                    onChange={(event) => setUsuario(event.target.value)}
                    className="pl-10"
                    placeholder="seu.usuario"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="pl-10" placeholder="Sua senha" required />
                </div>
              </div>

              {erro ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{erro}</div> : null}

              <Button type="submit" className="w-full" disabled={carregando}>
                {carregando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}