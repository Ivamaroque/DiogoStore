"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, User } from "lucide-react";
import { enviarRedefinicaoSenha, signIn } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/layout/Logo";
import { useAuth } from "./AuthProvider";

export function LoginForm() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [recuperandoSenha, setRecuperandoSenha] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/pedidos");
    }
  }, [isAuthenticated, loading, router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await signIn({ usuario, password });
      router.replace("/pedidos");
    } catch (error) {
      setErro(error?.message || "Usuário ou senha inválidos");
    } finally {
      setCarregando(false);
    }
  }

  async function handleRecuperarSenha(event) {
    event.preventDefault();
    setErro("");
    setMensagem("");
    setCarregando(true);

    try {
      await enviarRedefinicaoSenha(usuario);
      setMensagem("Se houver uma conta com esses dados, enviaremos um link para o e-mail cadastrado.");
    } catch (error) {
      setErro(error?.message || "Não foi possível enviar o link de redefinição.");
    } finally {
      setCarregando(false);
    }
  }

  function abrirRecuperacao() {
    setErro("");
    setMensagem("");
    setRecuperandoSenha(true);
  }

  function voltarParaLogin() {
    setErro("");
    setMensagem("");
    setRecuperandoSenha(false);
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
              <CardTitle>{recuperandoSenha ? "Recuperar senha" : "Acessar painel"}</CardTitle>
              <CardDescription>{recuperandoSenha ? "Informe seu e-mail ou nome de usuário para receber o link." : "Entre com seu usuário e senha para continuar."}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={recuperandoSenha ? handleRecuperarSenha : handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="usuario">{recuperandoSenha ? "E-mail ou nome de usuário" : "Usuário"}</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    id="usuario"
                    type="text"
                    value={usuario}
                    onChange={(event) => setUsuario(event.target.value)}
                    className="pl-10"
                    placeholder={recuperandoSenha ? "email@exemplo.com ou seu.usuario" : "seu.usuario"}
                    autoComplete={recuperandoSenha ? "off" : "username"}
                    required
                  />
                </div>
                {recuperandoSenha ? <p className="text-xs leading-5 text-zinc-500">Enviaremos um link para definir uma nova senha no e-mail cadastrado.</p> : null}
              </div>

              {!recuperandoSenha ? (
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="pl-10" placeholder="Sua senha" required />
                  </div>
                </div>
              ) : null}

              {erro ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{erro}</div> : null}
              {mensagem ? <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{mensagem}</div> : null}

              <Button type="submit" className="w-full" disabled={carregando}>
                {carregando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {recuperandoSenha ? "Enviar link de redefinição" : "Entrar"}
              </Button>
              <Button type="button" variant="ghost" className="w-full text-zinc-400 hover:text-white" onClick={recuperandoSenha ? voltarParaLogin : abrirRecuperacao} disabled={carregando}>
                {recuperandoSenha ? "Voltar para o login" : "Esqueci minha senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
