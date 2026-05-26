import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function listarFuncionarios() {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("perfis")
    .select("id, nome_completo, funcao, usuario, email, criado_em")
    .order("criado_em", { ascending: false });

  if (error) {
    throw new Error(error.message || "Erro ao listar funcionários.");
  }

  return data ?? [];
}

export async function criarFuncionario({
  nome_completo,
  funcao,
  usuario,
  email,
  password,
}) {
  const supabase = getSupabaseBrowserClient();

  const funcoesValidas = ["Funcionário", "Gestor"];
  const funcaoNormalizada = funcoesValidas.includes(funcao) ? funcao : "Funcionário";

  const { data, error } = await supabase.functions.invoke("criar-funcionario", {
    body: {
      nome_completo,
      funcao: funcaoNormalizada,
      usuario,
      email,
      password,
    },
  });

  if (error) {
    throw new Error(error.message || "Erro ao criar funcionário.");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}
