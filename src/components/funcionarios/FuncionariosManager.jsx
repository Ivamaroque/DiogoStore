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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatDateTime } from "@/utils/dates";

const formInicial = {
  nome_completo: "",
  funcao: "Funcionário",
  usuario: "",
  email: "",
  password: "",
};

function validarFormulario(form) {
  if (!form.nome_completo.trim()) {
    throw new Error("Informe o nome completo.");
  }

  const funcoesValidas = ["Funcionário", "Gestor"];
  if (!form.funcao || !funcoesValidas.includes(form.funcao)) {
    throw new Error("Informe a função válida.");
  }

  if (!form.usuario.trim()) {
    throw new Error("Informe o usuário.");
  }

  if (!form.email.trim()) {
    throw new Error("Informe o e-mail.");
  }

  if (!form.password || form.password.length < 6) {
    throw new Error("A senha precisa ter pelo menos 6 caracteres.");
  }
}

export function FuncionariosManager() {
  const [form, setForm] = useState(formInicial);
  const [funcionarios, setFuncionarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function carregar() {
    setCarregando(true);
    try {
      const dados = await listarFuncionarios();
      setFuncionarios(dados);
    } catch (error) {
      const mensagem = error?.message || "Não foi possível carregar os funcionários.";
      setErro(mensagem);
      toast.error(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  useEffect(() => {
    if (!sucesso) {
      return;
    }

    const timer = window.setTimeout(() => setSucesso(""), 4000);
    return () => window.clearTimeout(timer);
  }, [sucesso]);

  useEffect(() => {
    if (!erro) {
      return;
    }

    const timer = window.setTimeout(() => setErro(""), 6000);
    return () => window.clearTimeout(timer);
  }, [erro]);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSalvando(true);
      setErro("");
      setSucesso("");

      validarFormulario(form);

      await criarFuncionario({
        nome_completo: form.nome_completo.trim(),
        funcao: form.funcao.trim(),
        usuario: form.usuario.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      setForm(formInicial);
      await carregar();
      setSucesso("Funcionário criado com sucesso.");
      toast.success("Funcionário criado com sucesso.");
    } catch (error) {
      const mensagem = error?.message || "Erro ao criar funcionário.";
      setErro(mensagem);
      toast.error(mensagem);
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
        <CardContent className="space-y-4">
          {erro ? (
            <div className="rounded-2xl border border-red-900/60 bg-red-950/60 px-4 py-3 text-sm text-red-200">
              {erro}
            </div>
          ) : null}

          {sucesso ? (
            <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/60 px-4 py-3 text-sm text-emerald-200">
              {sucesso}
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="nome-completo">Nome completo</Label>
              <Input
                id="nome-completo"
                value={form.nome_completo}
                onChange={(event) => setForm((current) => ({ ...current, nome_completo: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="funcao">Função</Label>
              <Select
                value={form.funcao}
                onValueChange={(value) => setForm((current) => ({ ...current, funcao: value }))}
              >
                <SelectTrigger id="funcao">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Funcionário">Funcionário</SelectItem>
                  <SelectItem value="Gestor">Gestor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuário</Label>
              <Input
                id="usuario"
                placeholder="ex.: maria.souza"
                value={form.usuario}
                onChange={(event) => setForm((current) => ({ ...current, usuario: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="maria@diogostore.com"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Senha inicial"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
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