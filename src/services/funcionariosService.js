import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function listarFuncionarios() {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("perfis")
    .select(`
      id,
      nome_completo,
      funcao,
      usuario,
      email,
      ativo,
      criado_em,
      atualizado_em,
      desativado_em,
      desativado_por
    `)
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

  const { data, error } = await supabase.functions.invoke("criar-funcionario", {
    body: {
      nome_completo,
      funcao,
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

export async function editarFuncionario({
  id,
  nome_completo,
  funcao,
  usuario,
  email,
  ativo,
}) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase.functions.invoke("editar-funcionario", {
    body: {
      id,
      nome_completo,
      funcao,
      usuario,
      email,
      ativo,
    },
  });

  if (error) {
    throw new Error(error.message || "Erro ao editar funcionário.");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

export async function desativarFuncionario(id) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase.functions.invoke("desativar-funcionario", {
    body: {
      id,
    },
  });

  if (error) {
    throw new Error(error.message || "Erro ao desativar funcionário.");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}
