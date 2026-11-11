"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "./StatusBadge";
import { getStatusPorId } from "@/lib/constants/status";
import { buscarProdutos, fotoProduto } from "@/services/produtosService";
import { FotoProdutoZoom } from "@/components/produtos/FotoProdutoZoom";

const tipos = ["Infantil", "Feminina", "Masculina"];

export function ItemPedidoForm({ item, statusItens = [], onChange, onAdicionar, editando = false, showStatusBadge = true }) {
  const statusInicial = getStatusPorId(item.status_item_id ?? 1, statusItens);
  const [sugestoes, setSugestoes] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(null);

  useEffect(() => {
    if (!item.foto) { setFotoPreview(null); return; }
    const url = URL.createObjectURL(item.foto);
    setFotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [item.foto]);

  useEffect(() => {
    if (!mostrarSugestoes || item.nome_produto.trim().length < 2) return;
    let ativo = true;
    const timer = setTimeout(() => {
      buscarProdutos(item.nome_produto).then((produtos) => {
        if (ativo) setSugestoes(produtos);
      }).catch(() => {
        if (ativo) setSugestoes([]);
      });
    }, 200);
    return () => { ativo = false; clearTimeout(timer); };
  }, [item.nome_produto, mostrarSugestoes]);

  function updateField(field, value) {
    onChange((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">{editando ? "Editar item" : "Novo item"}</h3>
          <p className="text-sm text-zinc-500">Cada item começa em “Pedido realizado”.</p>
        </div>
        {showStatusBadge ? <StatusBadge status={statusInicial} /> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Quantidade</Label>
          <Input type="number" min="1" value={item.quantidade} onChange={(event) => updateField("quantidade", event.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Tipo</Label>
          <select
            value={item.tipo}
            onChange={(event) => updateField("tipo", event.target.value)}
            className="flex h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <option value="">Selecione</option>
            {tipos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="nome-produto-item">Nome do produto</Label>
          <div className="relative">
            <Input id="nome-produto-item" autoComplete="off" value={item.nome_produto} onChange={(event) => {
              const nome = event.target.value;
              onChange((current) => ({ ...current, nome_produto: nome, produto_id: null, imagem_path: null }));
              setMostrarSugestoes(true);
              if (nome.trim().length < 2) setSugestoes([]);
            }} onFocus={() => setMostrarSugestoes(true)} onBlur={(event) => { if (!event.relatedTarget?.closest("#sugestoes-produtos")) setMostrarSugestoes(false); }} onKeyDown={(event) => { if (event.key === "ArrowDown" && sugestoes.length) { event.preventDefault(); document.querySelector("#sugestoes-produtos button")?.focus(); } if (event.key === "Escape") setMostrarSugestoes(false); }} placeholder="Ex.: Camisa personalizada" aria-expanded={mostrarSugestoes && sugestoes.length > 0} aria-controls="sugestoes-produtos" />
            {mostrarSugestoes && sugestoes.length > 0 ? (
              <div id="sugestoes-produtos" className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900 p-1 shadow-xl" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setMostrarSugestoes(false); }}>
                {sugestoes.map((produto) => (
                  <button key={produto.id} type="button" className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:outline-none" onMouseDown={(event) => event.preventDefault()} onClick={() => {
                    onChange((current) => ({ ...current, produto_id: produto.id, imagem_path: produto.imagem_path, foto: null, nome_produto: produto.nome }));
                    setMostrarSugestoes(false);
                  }}>
                    {produto.imagem_path ? <img src={fotoProduto(produto.imagem_path)} alt="" className="h-9 w-9 rounded-lg object-cover" /> : <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500">•</span>}
                    <span className="font-medium">{produto.nome}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Foto do produto</Label>
          <div className="flex flex-wrap items-center gap-3">
            {fotoPreview || item.imagem_path ? <FotoProdutoZoom src={fotoPreview || fotoProduto(item.imagem_path)} nome={item.nome_produto || "Produto"} className="h-14 w-14 rounded-xl object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-900"><ImagePlus className="h-6 w-6 text-zinc-500" /></div>}
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-zinc-700 px-4 text-sm font-medium text-white hover:bg-zinc-900 focus-within:ring-2 focus-within:ring-brand/40"><ImagePlus className="h-4 w-4" />{item.foto || item.imagem_path ? "Trocar imagem" : "Adicionar imagem"}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => updateField("foto", event.target.files?.[0] || null)} /></label>
            {item.foto ? <span className="max-w-full truncate text-xs text-zinc-500">{item.foto.name}</span> : null}
          </div>
          <p className="text-xs text-zinc-500">Opcional. JPG, PNG ou WebP até 20 MB. A foto atualiza o produto no catálogo.</p>
        </div>

        <div className="space-y-2">
          <Label>Tamanho</Label>
          <Input value={item.tamanho} onChange={(event) => updateField("tamanho", event.target.value)} placeholder="M, G, 42..." />
        </div>

        <div className="space-y-2">
          <Label>Nome personalizado</Label>
          <Input value={item.nome_personalizado || ""} onChange={(event) => updateField("nome_personalizado", event.target.value)} placeholder="Ex: Fulano" />
        </div>

        <div className="space-y-2">
          <Label>Número personalizado</Label>
          <Input value={item.numero_personalizado || ""} onChange={(event) => updateField("numero_personalizado", event.target.value)} placeholder="Ex: 10" />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Observação do status</Label>
          <Textarea value={item.observacao_status} onChange={(event) => updateField("observacao_status", event.target.value)} placeholder="Opcional" />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button type="button" onClick={onAdicionar} className="w-full gap-2 sm:w-auto">
          <Plus className="h-4 w-4" />
          {editando ? "Salvar item" : "Adicionar item"}
        </Button>
      </div>
    </div>
  );
}
