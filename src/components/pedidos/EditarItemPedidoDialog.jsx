"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { atualizarItemPedido } from "@/services/itensPedidoService";
import { upsertPersonalizacaoItem } from "@/services/personalizacoesService";
import { getPersonalizacaoDoItem } from "@/utils/personalizacao";
import { fotoProduto } from "@/services/produtosService";
import { FotoProdutoZoom } from "@/components/produtos/FotoProdutoZoom";

export function EditarItemPedidoDialog({ item, onUpdated, triggerClassName = "inline-flex items-center gap-2", triggerSize = "sm", triggerVariant = "ghost" }) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [tipo, setTipo] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [nomePersonalizado, setNomePersonalizado] = useState("");
  const [numeroPersonalizado, setNumeroPersonalizado] = useState("");
  const [observacaoAntigaPersonalizacao, setObservacaoAntigaPersonalizacao] = useState("");
  const [observacao, setObservacao] = useState("");
  const [saving, setSaving] = useState(false);
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  useEffect(() => {
    if (!foto) { setFotoPreview(null); return; }
    const url = URL.createObjectURL(foto);
    setFotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);

  useEffect(() => {
    if (!item) return;
    setNome(item.nome_produto ?? "");
    setQuantidade(item.quantidade ?? 1);
    setTipo(item.tipo ?? "");
    setTamanho(item.tamanho ?? "");
    const personalizacao = getPersonalizacaoDoItem(item);
    const nome = personalizacao?.nome_personalizado ?? "";
    const numero = personalizacao?.numero_personalizado ?? "";
    const observacaoAntiga = personalizacao?.observacao_personalizacao ?? "";

    setNomePersonalizado(nome);
    setNumeroPersonalizado(numero);
    setObservacaoAntigaPersonalizacao(!nome?.trim() && !numero?.trim() ? observacaoAntiga : "");
    setObservacao(item.observacao_status ?? "");
    setFoto(null);
  }, [item, open]);

  async function handleSave() {
    if (!nome.trim()) return toast.error("Nome do produto obrigatório.");
    if (!tipo) return toast.error("Tipo obrigatório.");
    if (!quantidade || Number(quantidade) <= 0) return toast.error("Quantidade deve ser maior que 0.");

    setSaving(true);
    try {
      const atualizado = await atualizarItemPedido(item.id, {
        quantidade: Number(quantidade),
        nome_produto: nome,
        produto_id: nome.trim() === item.nome_produto?.trim() ? item.produto_id : null,
        foto,
        tipo,
        tamanho: tamanho || null,
        observacao_status: observacao || null,
      });

      await upsertPersonalizacaoItem({
        item_id: item.id,
        nome_personalizado: nomePersonalizado,
        numero_personalizado: numeroPersonalizado,
        preservarObservacaoAntiga: Boolean(observacaoAntigaPersonalizacao?.trim()) && !nomePersonalizado?.trim() && !numeroPersonalizado?.trim(),
      });

      toast.success("Item atualizado com sucesso.");
      setOpen(false);
      if (onUpdated) onUpdated(atualizado);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Erro ao atualizar item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize} className={triggerClassName} aria-label={`Editar ${item.nome_produto}`}>
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar item</DialogTitle>
          <DialogDescription>Atualize as informações do produto.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div>
            <Label>Nome do produto</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Foto do produto</Label>
            <div className="flex flex-wrap items-center gap-3">
              {fotoPreview || item.produtos?.imagem_path ? <FotoProdutoZoom src={fotoPreview || fotoProduto(item.produtos.imagem_path)} nome={nome || "Produto"} className="h-14 w-14 rounded-xl object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-900"><ImagePlus className="h-6 w-6 text-zinc-500" /></div>}
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-zinc-700 px-4 text-sm font-medium text-white hover:bg-zinc-900 focus-within:ring-2 focus-within:ring-brand/40"><ImagePlus className="h-4 w-4" />{foto || item.produtos?.imagem_path ? "Trocar foto" : "Adicionar foto"}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => setFoto(event.target.files?.[0] || null)} /></label>
            </div>
            <p className="text-xs text-zinc-500">JPG, PNG ou WebP até 20 MB. A foto atualiza o produto no catálogo.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Quantidade</Label>
              <Input type="number" value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} />
            </div>
            <div>
              <Label>Tipo</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v)}>
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* placeholder shown via SelectValue placeholder prop */}
                    <SelectItem value="Infantil">Infantil</SelectItem>
                    <SelectItem value="Feminina">Feminina</SelectItem>
                    <SelectItem value="Masculina">Masculina</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </div>

          <div>
            <Label>Tamanho</Label>
            <Input value={tamanho} onChange={(e) => setTamanho(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Nome personalizado</Label>
              <Input value={nomePersonalizado} onChange={(e) => setNomePersonalizado(e.target.value)} placeholder="Ex: Fulano" />
            </div>

            <div>
              <Label>Número personalizado</Label>
              <Input value={numeroPersonalizado} onChange={(e) => setNumeroPersonalizado(e.target.value)} placeholder="Ex: 10" />
            </div>
          </div>

          {observacaoAntigaPersonalizacao ? (
            <p className="text-sm text-zinc-500">Personalização antiga: {observacaoAntigaPersonalizacao}</p>
          ) : null}

          <div>
            <Label>Observação do status</Label>
            <Input value={observacao} onChange={(e) => setObservacao(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar item"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditarItemPedidoDialog;
