import { Badge } from "@/components/ui/badge";
import { Copy, Edit2 } from "lucide-react";
import { toast } from "sonner";

export function RastreioBadge({ rastreio, className = "", onEditClick, showCodigo = true, showEdit = true, fullWidth = false, mode = "both" }) {
  const handleCopyCodigo = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(rastreio.codigo_rastreio);
    toast.success(`Código ${rastreio.codigo_rastreio} copiado!`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEditClick) {
      onEditClick(e);
    }
  };

  if (!rastreio) {
    return <Badge variant="default" className={className}>Sem rastreio</Badge>;
  }

  const renderCodigo = mode === "both" ? showCodigo : mode === "code";
  const renderEdit = mode === "both" ? showEdit : mode === "edit";

  return (
    <div className={`flex ${fullWidth ? "w-full flex-col gap-2" : "flex-wrap items-center gap-2"} ${className}`.trim()}>
      {renderCodigo ? (
        <button
          onClick={handleCopyCodigo}
          className={`inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-zinc-200 transition-colors hover:bg-zinc-700 ${fullWidth ? "w-full justify-between" : ""}`.trim()}
          title="Copiar código"
        >
          <span className="truncate">{rastreio.codigo_rastreio}</span>
          <Copy className="h-3.5 w-3.5 shrink-0" />
        </button>
      ) : null}

      {renderEdit ? (
        <button
          onClick={handleEditClick}
          className={`inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm transition-colors hover:bg-zinc-700 ${fullWidth || mode === "edit" ? "w-full justify-between" : ""}`.trim()}
          style={{ color: rastreio.rastreio_em_grupo ? "#e01e5a" : "#a1a1a1" }}
          title="Editar rastreio"
        >
          <span>{rastreio.rastreio_em_grupo ? "Em grupo" : "Individual"}</span>
          <Edit2 className="h-3.5 w-3.5 shrink-0" />
        </button>
      ) : null}
    </div>
  );
}