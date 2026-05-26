import { Badge } from "@/components/ui/badge";
import { Copy, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { getTipoRastreioLabel, isRastreioPacote } from "@/utils/rastreios";

export function RastreioBadge({ item, rastreio, contagemPorRastreio = {}, className = "", onEditClick, showCodigo = true, showEdit = true, fullWidth = false, mode = "both" }) {
  const rastreioAtual = rastreio ?? item?.rastreios ?? null;
  const isPacote = isRastreioPacote(item, contagemPorRastreio);

  const handleCopyCodigo = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(rastreioAtual.codigo_rastreio);
    toast.success(`Código ${rastreioAtual.codigo_rastreio} copiado!`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEditClick) {
      onEditClick(e);
    }
  };

  if (!rastreioAtual) {
    return <Badge variant="default" className={className}>Sem rastreio</Badge>;
  }

  const renderCodigo = mode === "both" ? showCodigo : mode === "code";
  const renderEdit = mode === "both" ? showEdit : mode === "edit";

  return (
    <div className={`flex ${fullWidth ? "w-full flex-col gap-2" : "flex-wrap items-center gap-2"} ${className}`.trim()}>
      {renderCodigo ? (
        <button
          onClick={handleCopyCodigo}
          className={`inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs sm:text-sm text-zinc-200 min-w-0 transition-colors hover:bg-zinc-700 ${fullWidth ? "w-full justify-between" : ""}`.trim()}
          title="Copiar código"
        >
          <span className="truncate">{rastreioAtual.codigo_rastreio}</span>
          <Copy className="h-3.5 w-3.5 shrink-0" />
        </button>
      ) : null}

      {renderEdit ? (
        <button
          onClick={handleEditClick}
          className={`inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm transition-colors hover:bg-zinc-700 ${fullWidth || mode === "edit" ? "w-full justify-between" : ""}`.trim()}
          style={{ color: isPacote ? "#ed6f1a" : "#a1a1a1" }}
          title="Editar rastreio"
        >
          <span>{getTipoRastreioLabel(item, contagemPorRastreio) === "Sem rastreio" ? "Sem rastreio" : isPacote ? "Pacote" : "Individual"}</span>
          <Edit2 className="h-3.5 w-3.5 shrink-0" />
        </button>
      ) : null}
    </div>
  );
}