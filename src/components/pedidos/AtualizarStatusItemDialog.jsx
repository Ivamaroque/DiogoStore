"use client";

import { useMemo, useState } from "react";
import { Loader2, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { atualizarStatusItem } from "@/services/itensPedidoService";
import { toast } from "sonner";

export function AtualizarStatusItemDialog({ item, statusItens = [], onUpdated }) {
  const [aberto, setAberto] = useState(false);
  const [statusId, setStatusId] = useState(String(item.status_item_id ?? 1));
  const [observacao, setObservacao] = useState(item.observacao_status ?? "");
  const [salvando, setSalvando] = useState(false);

  const statusAtual = useMemo(() => statusItens.find((status) => String(status.id) === String(statusId)) ?? null, [statusId, statusItens]);

  async function handleSalvar() {
    setSalvando(true);
    try {
      const atualizado = await atualizarStatusItem({
        itemId: item.id,
        status_item_id: Number(statusId),
        observacao_status: observacao,
      });

      toast.success("Status do item atualizado.");
      onUpdated?.(atualizado);
      setAberto(false);
    } catch (error) {
      toast.error(error?.message || "Não foi possível atualizar o status.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setAberto(true)}>
        <PencilLine className="h-4 w-4" />
        Atualizar status
      </Button>

      {aberto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Atualizar status</h3>
                <p className="text-sm text-zinc-400">{item.nome_produto}</p>
              </div>
              <button className="text-sm text-zinc-400 hover:text-white" onClick={() => setAberto(false)}>Fechar</button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`status-${item.id}`}>Status</Label>
                <select
                  id={`status-${item.id}`}
                  value={statusId}
                  onChange={(event) => setStatusId(event.target.value)}
                  className="flex h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  {!statusAtual ? <option value={statusId}>Sem status</option> : null}
                  {statusItens.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`obs-${item.id}`}>Observação</Label>
                <Textarea
                  id={`obs-${item.id}`}
                  value={observacao}
                  onChange={(event) => setObservacao(event.target.value)}
                  placeholder="Opcional"
                />
              </div>

              {statusAtual ? <div className="text-sm text-zinc-500">Novo status: {statusAtual.nome}</div> : null}

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setAberto(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSalvar} disabled={salvando}>
                  {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
