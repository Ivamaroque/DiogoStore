import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function buscarEmailPorUsuario(usuario, supabase = getSupabaseBrowserClient()) {
  const usuarioLimpo = String(usuario ?? "").trim();

  if (!usuarioLimpo) return null;

  const { data, error } = await supabase.rpc("buscar_email_por_usuario", {
    usuario_login: usuarioLimpo,
  });

  if (error) throw error;

  return data?.[0]?.email ?? null;
}

export async function signIn({ usuario, password }) {
  const supabase = getSupabaseBrowserClient();

  try {
    const email = await buscarEmailPorUsuario(usuario, supabase);

    if (!email) {
      throw new Error("Usuário ou senha inválidos");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error("Usuário ou senha inválidos");
    }

    return data;
  } catch (error) {
    if (error?.message === "Usuário ou senha inválidos") {
      throw error;
    }

    throw new Error("Usuário ou senha inválidos");
  }
}

export async function signOutUser() {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;
  return data.user ?? null;
}

export async function getPerfilAtual() {
  const supabase = getSupabaseBrowserClient();
  const user = await getCurrentUser();

  if (!user) return null;

  const { data, error } = await supabase.from("perfis").select("*").eq("id", user.id).maybeSingle();
  if (error) throw error;

  return data ?? { id: user.id, nome_completo: user.email, funcao: "Funcionário" };
}

export async function buscarPerfilPorId(userId, supabase = getSupabaseBrowserClient()) {
  if (!userId) return null;

  const { data, error } = await supabase.from("perfis").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;

  return data ?? null;
}