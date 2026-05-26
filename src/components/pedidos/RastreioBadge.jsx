import { Badge } from "@/components/ui/badge";
import { Copy, Edit2 } from "lucide-react";
import { toast } from "sonner";

export function RastreioBadge({ rastreio, className = "", onEditClick }) {
  const handleCopyCodigo = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(rastreio.codigo_rastreio);
    toast.success(`Código ${rastreio.codigo_rastreio} copiado!`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEditClick) {
      onEditClick();
    }
  };

  if (!rastreio) {
    return <Badge variant="default" className={className}>Sem rastreio</Badge>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={handleCopyCodigo}
        className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-3 py-1 text-sm text-zinc-200 transition-colors"
        title="Copiar código"
      >
        <span>{rastreio.codigo_rastreio}</span>
        <Copy className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={handleEditClick}
        className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-3 py-1 text-sm transition-colors"
        style={{ color: rastreio.rastreio_em_grupo ? "#e01e5a" : "#a1a1a1" }}
        title="Editar rastreio"
      >
        <span>{rastreio.rastreio_em_grupo ? "Em grupo" : "Individual"}</span>
        <Edit2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}