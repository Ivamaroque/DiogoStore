"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Pencil, Power, RefreshCw, Search, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { criarFuncionario, desativarFuncionario, editarFuncionario, listarFuncionarios } from "@/services/funcionariosService";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatDateTime } from "@/utils/dates";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePerfilAtual } from "@/hooks/usePerfilAtual";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formInicial = {
  nome_completo: "",
  funcao: "Funcionário",
  usuario: "",
  email: "",
  password: "",
};

const formEdicaoInicial = {
  id: null,
  nome_completo: "",
  funcao: "Funcionário",
  usuario: "",
  email: "",
  ativo: true,
};

const filtrosIniciais = {
  busca: "",
  status: "todos",
  funcao: "todos",
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

function validarEdicao(form) {
  if (!form.id) {
    throw new Error("Funcionário inválido para edição.");
  }

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
}

function badgeStatus(ativo) {
  return ativo ? <Badge variant="success">Ativo</Badge> : <Badge variant="danger">Inativo</Badge>;
}

function badgeFuncao(funcao) {
  return funcao === "Gestor" ? <Badge variant="warning">Gestor</Badge> : <Badge variant="default">Funcionário</Badge>;
}

export function FuncionariosManager() {
  const { user, loading: carregandoAuth } = useAuth();
  const { perfil, loading: carregandoPerfil } = usePerfilAtual(user?.id);
  const [form, setForm] = useState(formInicial);
  const [formEdicao, setFormEdicao] = useState(formEdicaoInicial);
  const [funcionarios, setFuncionarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvandoCriacao, setSalvandoCriacao] = useState(false);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [desativando, setDesativando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [dialogEdicaoAberto, setDialogEdicaoAberto] = useState(false);
  const [dialogDesativarAberto, setDialogDesativarAberto] = useState(false);
  const [funcionarioDesativar, setFuncionarioDesativar] = useState(null);
  const podeGerenciar = perfil?.funcao === "Gestor";

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

  useEffect(() => {
    if (!dialogEdicaoAberto) {
      setFormEdicao(formEdicaoInicial);
    }
  }, [dialogEdicaoAberto]);

  const funcionariosFiltrados = funcionarios.filter((funcionario) => {
    const textoBusca = filtros.busca.trim().toLowerCase();
    const correspondeBusca = !textoBusca
      || [funcionario.nome_completo, funcionario.usuario, funcionario.email]
        .filter(Boolean)
        .some((valor) => String(valor).toLowerCase().includes(textoBusca));

    const correspondeStatus = filtros.status === "todos"
      || (filtros.status === "ativos" && funcionario.ativo)
      || (filtros.status === "inativos" && !funcionario.ativo);

    const correspondeFuncao = filtros.funcao === "todos"
      || (filtros.funcao === "gestores" && funcionario.funcao === "Gestor")
      || (filtros.funcao === "funcionarios" && funcionario.funcao !== "Gestor");

    return correspondeBusca && correspondeStatus && correspondeFuncao;
  });

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSalvandoCriacao(true);
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
      setSalvandoCriacao(false);
    }
  }

  function abrirEdicao(funcionario) {
    setErro("");
    setSucesso("");
    setFormEdicao({
      id: funcionario.id,
      nome_completo: funcionario.nome_completo ?? "",
      funcao: funcionario.funcao === "Gestor" ? "Gestor" : "Funcionário",
      usuario: funcionario.usuario ?? "",
      email: funcionario.email ?? "",
      ativo: Boolean(funcionario.ativo),
    });
    setDialogEdicaoAberto(true);
  }

  async function salvarEdicao(event) {
    event.preventDefault();

    try {
      setSalvandoEdicao(true);
      setErro("");
      setSucesso("");

      validarEdicao(formEdicao);

      await editarFuncionario({
        id: formEdicao.id,
        nome_completo: formEdicao.nome_completo.trim(),
        funcao: formEdicao.funcao.trim(),
        usuario: formEdicao.usuario.trim().toLowerCase(),
        email: formEdicao.email.trim().toLowerCase(),
        ativo: Boolean(formEdicao.ativo),
      });

      setDialogEdicaoAberto(false);
      await carregar();
      setSucesso("Funcionário atualizado com sucesso.");
      toast.success("Funcionário atualizado com sucesso.");
    } catch (error) {
      const mensagem = error?.message || "Erro ao editar funcionário.";
      setErro(mensagem);
      toast.error(mensagem);
    } finally {
      setSalvandoEdicao(false);
    }
  }

  function abrirConfirmacaoDesativar(funcionario) {
    setErro("");
    setSucesso("");
    setFuncionarioDesativar(funcionario);
    setDialogDesativarAberto(true);
  }

  async function confirmarDesativacao() {
    if (!funcionarioDesativar?.id) return;

    try {
      setDesativando(true);
      setErro("");
      setSucesso("");

      await desativarFuncionario(funcionarioDesativar.id);

      setDialogDesativarAberto(false);
      setFuncionarioDesativar(null);
      await carregar();
      setSucesso("Funcionário desativado com sucesso.");
      toast.success("Funcionário desativado com sucesso.");
    } catch (error) {
      const mensagem = error?.message || "Erro ao desativar funcionário.";
      setErro(mensagem);
      toast.error(mensagem);
    } finally {
      setDesativando(false);
    }
  }

  if (carregandoAuth || carregandoPerfil) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/95 px-4 py-10 text-center text-sm text-zinc-400">
        Verificando permissões...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {erro ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-900/60 bg-red-950/60 px-4 py-3 text-sm text-red-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
          <span>{erro}</span>
        </div>
      ) : null}

      {sucesso ? (
        <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/60 px-4 py-3 text-sm text-emerald-200">
          {sucesso}
        </div>
      ) : null}

      {!podeGerenciar ? (
        <div className="rounded-2xl border border-amber-900/60 bg-amber-950/50 px-4 py-4 text-sm text-amber-200">
          Você não tem permissão para gerenciar funcionários.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        {podeGerenciar ? (
          <Card className="border-zinc-800 bg-zinc-900/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <UserPlus className="h-5 w-5 text-brand" />
                Criar funcionário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

                <Button type="submit" className="w-full" disabled={salvandoCriacao}>
                  {salvandoCriacao ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Criar funcionário
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-zinc-800 bg-zinc-900/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-brand" />
                Funcionários cadastrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-dashed border-zinc-800 px-4 py-10 text-center text-sm text-zinc-500">
                Apenas gestores podem criar e editar funcionários.
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-zinc-800 bg-zinc-900/95">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-brand" />
                Funcionários cadastrados
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => void carregar()} disabled={carregando}>
                <RefreshCw className={`h-4 w-4 ${carregando ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
              <div className="space-y-2">
                <Label htmlFor="busca-funcionarios">Buscar</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    id="busca-funcionarios"
                    className="pl-10"
                    placeholder="Nome, usuário ou e-mail"
                    value={filtros.busca}
                    onChange={(event) => setFiltros((current) => ({ ...current, busca: event.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filtro-status">Status</Label>
                <Select
                  value={filtros.status}
                  onValueChange={(value) => setFiltros((current) => ({ ...current, status: value }))}
                >
                  <SelectTrigger id="filtro-status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativos">Ativos</SelectItem>
                    <SelectItem value="inativos">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filtro-funcao">Função</Label>
                <Select
                  value={filtros.funcao}
                  onValueChange={(value) => setFiltros((current) => ({ ...current, funcao: value }))}
                >
                  <SelectTrigger id="filtro-funcao">
                    <SelectValue placeholder="Função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="gestores">Gestores</SelectItem>
                    <SelectItem value="funcionarios">Funcionários</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {carregando ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-10 text-center text-sm text-zinc-500">
                Carregando funcionários...
              </div>
            ) : funcionariosFiltrados.length ? (
              funcionariosFiltrados.map((funcionario) => {
                const isSelf = funcionario.id === user?.id;

                return (
                  <div key={funcionario.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-white">{funcionario.nome_completo}</p>
                            {badgeFuncao(funcionario.funcao)}
                            {badgeStatus(funcionario.ativo)}
                          </div>
                          {!funcionario.ativo ? (
                            <p className="text-xs text-zinc-500">Funcionário inativo</p>
                          ) : null}
                        </div>

                        <div className="grid gap-2 text-sm text-zinc-400 sm:grid-cols-2">
                          <div>
                            <span className="text-zinc-500">Usuário:</span> {funcionario.usuario || "sem-usuario"}
                          </div>
                          <div>
                            <span className="text-zinc-500">E-mail:</span> {funcionario.email || "Sem e-mail"}
                          </div>
                          <div>
                            <span className="text-zinc-500">Criado em:</span> {formatDateTime(funcionario.criado_em)}
                          </div>
                          <div>
                            <span className="text-zinc-500">Atualizado em:</span> {formatDateTime(funcionario.atualizado_em)}
                          </div>
                          <div>
                            <span className="text-zinc-500">Desativado em:</span> {formatDateTime(funcionario.desativado_em)}
                          </div>
                          <div>
                            <span className="text-zinc-500">Desativado por:</span> {funcionario.desativado_por || "-"}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:flex-none lg:flex-col lg:items-stretch">
                        {podeGerenciar ? (
                          <Button variant="outline" size="sm" onClick={() => abrirEdicao(funcionario)}>
                            <Pencil className="h-4 w-4" />
                            Editar
                          </Button>
                        ) : null}

                        {podeGerenciar ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={!funcionario.ativo || isSelf}
                            onClick={() => abrirConfirmacaoDesativar(funcionario)}
                          >
                            <Power className="h-4 w-4" />
                            Desativar
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    {isSelf && funcionario.ativo ? (
                      <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-400">
                        Este é o seu acesso atual. A desativação fica bloqueada na interface.
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-800 px-4 py-10 text-center text-sm text-zinc-500">
                Nenhum funcionário encontrado para os filtros atuais.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogEdicaoAberto} onOpenChange={setDialogEdicaoAberto}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar funcionário</DialogTitle>
            <DialogDescription>
              Atualize os dados do cadastro e salve as alterações via Edge Function.
            </DialogDescription>
          </DialogHeader>

          <form className="grid gap-4 py-2" onSubmit={salvarEdicao}>
            <div className="space-y-2">
              <Label htmlFor="edicao-nome">Nome completo</Label>
              <Input
                id="edicao-nome"
                value={formEdicao.nome_completo}
                onChange={(event) => setFormEdicao((current) => ({ ...current, nome_completo: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edicao-funcao">Função</Label>
              <Select
                value={formEdicao.funcao}
                onValueChange={(value) => setFormEdicao((current) => ({ ...current, funcao: value }))}
              >
                <SelectTrigger id="edicao-funcao">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Funcionário">Funcionário</SelectItem>
                  <SelectItem value="Gestor">Gestor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edicao-usuario">Usuário</Label>
              <Input
                id="edicao-usuario"
                value={formEdicao.usuario}
                onChange={(event) => setFormEdicao((current) => ({ ...current, usuario: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edicao-email">E-mail</Label>
              <Input
                id="edicao-email"
                type="email"
                value={formEdicao.email}
                onChange={(event) => setFormEdicao((current) => ({ ...current, email: event.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">Ativo</p>
                <p className="text-xs text-zinc-500">Funcionários inativos não conseguem acessar o sistema.</p>
              </div>
              <button
                type="button"
                className="inline-flex h-6 w-11 items-center rounded-full bg-zinc-800 p-1 transition data-[state=checked]:bg-brand"
                role="switch"
                aria-checked={formEdicao.ativo}
                data-state={formEdicao.ativo ? "checked" : "unchecked"}
                disabled={formEdicao.id === user?.id}
                onClick={() => {
                  if (formEdicao.id === user?.id) return;
                  setFormEdicao((current) => ({ ...current, ativo: !current.ativo }));
                }}
              >
                <span
                  className={`h-4 w-4 rounded-full bg-white transition-transform ${formEdicao.ativo ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>

            {formEdicao.id === user?.id ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-400">
                Você não pode desativar o seu próprio acesso pela interface.
              </div>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogEdicaoAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={salvandoEdicao}>
                {salvandoEdicao ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Salvar alterações
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={dialogDesativarAberto} onOpenChange={setDialogDesativarAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar funcionário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar este funcionário? Ele não poderá mais acessar o sistema, mas o histórico de pedidos será preservado.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={desativando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={desativando || funcionarioDesativar?.id === user?.id}
              onClick={(event) => {
                event.preventDefault();
                void confirmarDesativacao();
              }}
            >
              {desativando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Desativar funcionário
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}