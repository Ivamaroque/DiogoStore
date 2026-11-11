"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { excluirProduto, fotoProduto, listarProdutos, salvarProduto } from "@/services/produtosService";
import { FotoProdutoZoom } from "./FotoProdutoZoom";

const vazio = { nome: "", imagem_path: null };

export function ProdutosClient() {
  const fotoInputRef = useRef(null);
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState(null);
  const [excluindo, setExcluindo] = useState(null);
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function recarregar() {
    try {
      setProdutos(await listarProdutos());
      setErro("");
    } catch (error) {
      setErro(error?.message || "Não foi possível carregar os produtos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { void recarregar(); }, []);
  useEffect(() => {
    if (!foto) { setFotoPreview(null); return; }
    const url = URL.createObjectURL(foto);
    setFotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);
  const filtrados = useMemo(() => produtos.filter((produto) => produto.nome.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR"))), [produtos, busca]);

  function abrir(produto = vazio) {
    setEditando({ ...produto });
    setFoto(null);
  }

  async function salvar() {
    setSalvando(true);
    try {
      await salvarProduto({ produto: editando, foto });
      setEditando(null);
      setFoto(null);
      toast.success("Produto salvo.");
      await recarregar();
    } catch (error) {
      toast.error(error?.message || "Não foi possível salvar o produto.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    setSalvando(true);
    try {
      await excluirProduto(excluindo);
      setExcluindo(null);
      toast.success("Produto excluído. Os itens dos pedidos foram preservados.");
      await recarregar();
    } catch (error) {
      toast.error(error?.message || "Não foi possível excluir o produto.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h1 className="text-3xl font-semibold text-white">Produtos</h1><p className="mt-1 text-sm text-zinc-400">Catálogo de produtos usados nos pedidos.</p></div>
          <Button onClick={() => abrir()} className="gap-2"><Plus className="h-4 w-4" />Adicionar produto</Button>
        </div>
        <div className="relative max-w-md"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-500" /><Input aria-label="Buscar produtos" value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar produto" className="pl-10" /></div>
        {erro ? <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{erro}</div> : null}
        {carregando ? <p className="text-sm text-zinc-400">Carregando produtos...</p> : filtrados.length === 0 ? <div className="rounded-3xl border border-dashed border-zinc-800 p-10 text-center text-sm text-zinc-500">{busca ? "Nenhum produto encontrado." : "Nenhum produto cadastrado."}</div> : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtrados.map((produto) => (
              <Card key={produto.id} className="overflow-hidden border-zinc-800 bg-zinc-900/95">
                <CardContent className="grid grid-cols-[5rem_minmax(0,1fr)] gap-4 p-4">
                  {produto.imagem_path ? <FotoProdutoZoom src={fotoProduto(produto.imagem_path)} nome={produto.nome} className="h-20 w-20 rounded-2xl object-cover" /> : <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-zinc-800"><Package className="h-7 w-7 text-zinc-500" /></div>}
                  <div className="flex min-w-0 flex-col justify-between gap-2">
                    <h2 className="line-clamp-2 break-words text-sm font-semibold leading-5 text-white" title={produto.nome}>{produto.nome}</h2>
                    <div className="flex items-center justify-end gap-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => abrir(produto)} className="gap-1.5"><Pencil className="h-4 w-4" />Editar</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setExcluindo(produto)} aria-label={`Excluir ${produto.nome}`} className="px-2.5"><Trash2 className="h-4 w-4 text-red-400" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={Boolean(editando)} onOpenChange={(open) => { if (!open && !salvando) { setEditando(null); setFoto(null); } }}>
        <DialogContent className="gap-5">
          <DialogHeader>
            <DialogTitle>{editando?.id ? "Editar produto" : "Novo produto"}</DialogTitle>
            <DialogDescription>Adicione um nome e uma foto para identificar o produto nos pedidos.</DialogDescription>
          </DialogHeader>
          {editando ? <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="produto-nome">Nome do produto</Label>
              <Input id="produto-nome" value={editando.nome} onChange={(event) => setEditando({ ...editando, nome: event.target.value })} maxLength={150} placeholder="Ex.: Camisa personalizada" className="h-11" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-white">Foto do produto</p>
              <div className="flex flex-wrap items-center gap-3">
                {fotoPreview || editando.imagem_path ? <FotoProdutoZoom src={fotoPreview || fotoProduto(editando.imagem_path)} nome={editando.nome || "Produto"} className="h-14 w-14 rounded-xl object-cover" /> : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-zinc-900"><ImagePlus className="h-6 w-6 text-zinc-500" /></div>}
                <Button type="button" variant="outline" size="sm" onClick={() => fotoInputRef.current?.click()} disabled={salvando} className="gap-2">
                  <ImagePlus className="h-4 w-4" />{foto || editando.imagem_path ? "Trocar imagem" : "Adicionar imagem"}
                </Button>
                {foto ? <span className="max-w-full truncate text-xs text-zinc-500">{foto.name}</span> : null}
                <input ref={fotoInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => setFoto(event.target.files?.[0] || null)} />
              </div>
              <p className="text-xs text-zinc-500">JPG, PNG ou WebP até 20 MB. A foto será otimizada quando possível.</p>
            </div>
          </div> : null}
          <DialogFooter className="border-t border-zinc-800 pt-4">
            <Button type="button" variant="outline" onClick={() => { setEditando(null); setFoto(null); }} disabled={salvando}>Cancelar</Button>
            <Button type="button" onClick={salvar} disabled={salvando || !editando?.nome.trim()}>{salvando ? "Salvando..." : "Salvar produto"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(excluindo)} onOpenChange={(open) => { if (!open && !salvando) setExcluindo(null); }}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Excluir produto?</AlertDialogTitle><AlertDialogDescription>O produto sairá do catálogo. Os itens já registrados nos pedidos continuarão com seus dados.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={salvando}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={excluir} disabled={salvando}>Excluir produto</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
