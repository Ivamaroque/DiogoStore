import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function listarFuncionarios(supabase = getSupabaseBrowserClient()) {
  const { data, error } = await supabase
    .from("perfis")
    .select("id, nome_completo, funcao, usuario, email, criado_em")
    .order("criado_em", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function criarFuncionario({ nome_completo, funcao, usuario, email, senha }, supabase = getSupabaseBrowserClient()) {
  const emailLimpo = String(email ?? "").trim();
  const usuarioLimpo = String(usuario ?? "").trim();

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: emailLimpo,
    password: senha,
    options: {
      data: {
        nome_completo,
        funcao,
        usuario: usuarioLimpo,
      },
    },
  });

  if (signUpError) throw signUpError;

  const userId = authData.user?.id;
  if (!userId) {
    throw new Error("Não foi possível criar o funcionário.");
  }

  const { data, error } = await supabase
    .from("perfis")
    .upsert(
      {
        id: userId,
        nome_completo,
        funcao,
        usuario: usuarioLimpo,
        email: emailLimpo,
      },
      { onConflict: "id" },
    )
    .select("id, nome_completo, funcao, usuario, email, criado_em")
    .single();

  if (error) throw error;

  return data;
}