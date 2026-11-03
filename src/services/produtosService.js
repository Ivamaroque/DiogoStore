import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { converterFotoParaWebp } from "@/utils/produtoImagem.mjs";

const BUCKET = "produtos";

export function fotoProduto(path, supabase = getSupabaseBrowserClient()) {
  return path ? supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl : null;
}

export async function listarProdutos(supabase = getSupabaseBrowserClient()) {
  const { data, error } = await supabase.from("produtos").select("*").order("nome");
  if (error) throw error;
  return data ?? [];
}

export async function buscarProdutos(nome, supabase = getSupabaseBrowserClient()) {
  const termo = nome.trim().replace(/[\\%_]/g, "\\$&");
  if (termo.length < 2) return [];
  const { data, error } = await supabase.from("produtos").select("*").ilike("nome", `%${termo}%`).order("nome").limit(8);
  if (error) throw error;
  return data ?? [];
}

export async function obterOuCriarProduto(item, supabase = getSupabaseBrowserClient()) {
  if (item.produto_id) return item.produto_id;
  const nome = item.nome_produto.trim();
  const nomeEscapado = nome.replace(/[\\%_]/g, "\\$&");
  const { data: existente, error: buscaError } = await supabase.from("produtos").select("id").ilike("nome", nomeEscapado).maybeSingle();
  if (buscaError) throw buscaError;
  if (existente) return existente.id;

  try {
    const criado = await salvarProduto({ produto: { nome }, foto: item.foto }, supabase);
    return criado.id;
  } catch (error) {
    if (error.code === "23505") {
      const { data: repetido } = await supabase.from("produtos").select("id").ilike("nome", nomeEscapado).maybeSingle();
      if (repetido) return repetido.id;
    }
    throw error;
  }
}

export async function salvarProduto({ produto, foto }, supabase = getSupabaseBrowserClient()) {
  const nome = produto.nome.trim();
  if (!nome) throw new Error("Informe o nome do produto.");
  let imagemPath = produto.imagem_path || null;
  if (foto) {
    const webp = await converterFotoParaWebp(foto);
    imagemPath = `${crypto.randomUUID()}.webp`;
    const { error } = await supabase.storage.from(BUCKET).upload(imagemPath, webp, { contentType: "image/webp" });
    if (error) throw error;
  }

  const payload = { nome, imagem_path: imagemPath };
  const query = produto.id ? supabase.from("produtos").update(payload).eq("id", produto.id) : supabase.from("produtos").insert(payload);
  const { data, error } = await query.select("*").single();
  if (error) {
    if (foto) await supabase.storage.from(BUCKET).remove([imagemPath]);
    if (error.code === "23505") {
      const duplicado = new Error("Já existe um produto com esse nome.");
      duplicado.code = error.code;
      throw duplicado;
    }
    throw error;
  }
  if (foto && produto.imagem_path) await supabase.storage.from(BUCKET).remove([produto.imagem_path]);
  return data;
}

export async function excluirProduto(produto, supabase = getSupabaseBrowserClient()) {
  const { error } = await supabase.from("produtos").delete().eq("id", produto.id);
  if (error) throw error;
  if (produto.imagem_path) await supabase.storage.from(BUCKET).remove([produto.imagem_path]);
}
