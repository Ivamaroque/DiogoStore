"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/layout/Logo";
import { redefinirSenha, signOutUser, validarNovaSenha } from "@/services/authService";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function RedefinirSenhaForm() {
  const router = useRouter();
  const [pronto, setPronto] = useState(false);
  const [validandoLink, setValidandoLink] = useState(true);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let ativo = true;

    async function validarLink() {
      const { data } = await supabase.auth.getSession();
      if (!ativo) return;
      setPronto(Boolean(data.session));
      setValidandoLink(false);
    }

    void validarLink();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!ativo) return;
      setPronto(Boolean(session));
      setValidandoLink(false);
    });

    return () => {
      ativo = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");

    try {
      validarNovaSenha({ novaSenha, confirmarSenha });
      setSalvando(true);
      await redefinirSenha(novaSenha);
      try {
        await signOutUser();
      } catch {
        // A senha já foi atualizada; o próximo acesso exigirá a nova credencial.
      }
      router.replace("/login");
    } catch (error) {
      setErro(error?.message || "Não foi possível redefinir a senha.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
      <Card className="w-full border-zinc-800 bg-zinc-900/90 shadow-glow">
        <CardHeader className="space-y-3">
          <Logo compact />
          <div className="pt-4">
            <CardTitle>Definir nova senha</CardTitle>
            <CardDescription>Escolha uma nova senha para acessar o painel.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {validandoLink ? (
            <div className="flex items-center gap-3 text-sm text-zinc-400"><Loader2 className="h-4 w-4 animate-spin text-brand" />Validando link...</div>
          ) : !pronto ? (
            <div className="space-y-4">
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">Este link é inválido ou expirou. Solicite uma nova redefinição de senha.</p>
              <Button asChild className="w-full"><Link href="/login">Voltar para o login</Link></Button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="nova-senha">Nova senha</Label>
                <Input id="nova-senha" type="password" autoComplete="new-password" value={novaSenha} onChange={(event) => setNovaSenha(event.target.value)} required />
                <p className="text-xs text-zinc-500">Use pelo menos 8 caracteres.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmar-senha">Confirmar nova senha</Label>
                <Input id="confirmar-senha" type="password" autoComplete="new-password" value={confirmarSenha} onChange={(event) => setConfirmarSenha(event.target.value)} required />
              </div>
              {erro ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{erro}</div> : null}
              <Button type="submit" className="w-full" disabled={salvando}>
                {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Salvar nova senha
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
