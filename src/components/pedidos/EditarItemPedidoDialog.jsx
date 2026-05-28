"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { atualizarItemPedido } from "@/services/itensPedidoService";

export function EditarItemPedidoDialog({ item, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [tipo, setTipo] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [personalizacao, setPersonalizacao] = useState("");
  const [observacao, setObservacao] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!item) return;
    setNome(item.nome_produto ?? "");
    setQuantidade(item.quantidade ?? 1);
    setTipo(item.tipo ?? "");
    setTamanho(item.tamanho ?? "");
    setPersonalizacao(item.personalizacao ?? "");
    setObservacao(item.observacao_status ?? "");
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
        tipo,
        tamanho: tamanho || null,
        personalizacao: personalizacao || null,
        observacao_status: observacao || null,
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
        <Button variant="outline" size="sm" className="inline-flex items-center gap-2">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Quantidade</Label>
              <Input type="number" value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v)}>
                <option value="">Selecione</option>
                <option value="Infantil">Infantil</option>
                <option value="Feminina">Feminina</option>
                <option value="Masculina">Masculina</option>
              </Select>
            </div>
          </div>

          <div>
            <Label>Tamanho</Label>
            <Input value={tamanho} onChange={(e) => setTamanho(e.target.value)} />
          </div>

          <div>
            <Label>Personalização</Label>
            <Input value={personalizacao} onChange={(e) => setPersonalizacao(e.target.value)} />
          </div>

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
