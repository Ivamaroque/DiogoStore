"use client";

import { useEffect, useState } from "react";
import { Loader2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { criarFuncionario, listarFuncionarios } from "@/services/funcionariosService";
import { formatDateTime } from "@/utils/dates";

const formInicial = {
  nome_completo: "",
  funcao: "Funcionário",
  usuario: "",
  email: "",
  senha: "",
};

export function FuncionariosManager() {
  const [form, setForm] = useState(formInicial);
  const [funcionarios, setFuncionarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setCarregando(true);
    try {
      const dados = await listarFuncionarios();
      setFuncionarios(dados);
    } catch (error) {
      toast.error(error?.message || "Não foi possível carregar os funcionários.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.nome_completo.trim() || !form.usuario.trim() || !form.email.trim() || !form.senha.trim()) {
      toast.error("Preencha nome, usuário, e-mail e senha.");
      return;
    }

    setSalvando(true);
    try {
      await criarFuncionario(form);
      toast.success("Funcionário criado com sucesso.");
      setForm(formInicial);
      await carregar();
    } catch (error) {
      toast.error(error?.message || "Não foi possível criar o funcionário.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="border-zinc-800 bg-zinc-900/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <UserPlus className="h-5 w-5 text-brand" />
            Criar funcionário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Nome completo</Label>
              <Input value={form.nome_completo} onChange={(event) => setForm((current) => ({ ...current, nome_completo: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Função</Label>
              <Input value={form.funcao} onChange={(event) => setForm((current) => ({ ...current, funcao: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Usuário</Label>
              <Input value={form.usuario} onChange={(event) => setForm((current) => ({ ...current, usuario: event.target.value }))} placeholder="ex.: maria.souza" />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="maria@diogostore.com" />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input type="password" value={form.senha} onChange={(event) => setForm((current) => ({ ...current, senha: event.target.value }))} placeholder="Senha inicial" />
            </div>

            <Button type="submit" className="w-full" disabled={salvando}>
              {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Criar funcionário
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5 text-brand" />
            Funcionários cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {carregando ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-10 text-center text-sm text-zinc-500">
              Carregando funcionários...
            </div>
          ) : funcionarios.length ? (
            funcionarios.map((funcionario) => (
              <div key={funcionario.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{funcionario.nome_completo}</p>
                    <p className="text-sm text-zinc-500">@{funcionario.usuario || "sem-usuario"}</p>
                  </div>
                  <Badge variant="brand">{funcionario.funcao || "Funcionário"}</Badge>
                </div>
                <div className="mt-3 text-sm text-zinc-400">
                  <div>{funcionario.email || "Sem e-mail"}</div>
                  <div>{formatDateTime(funcionario.criado_em)}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-800 px-4 py-10 text-center text-sm text-zinc-500">
              Nenhum funcionário cadastrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}