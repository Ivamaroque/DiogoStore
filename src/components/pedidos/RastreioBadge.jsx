import { Badge } from "@/components/ui/badge";

export function RastreioBadge({ rastreio, className = "" }) {
  if (!rastreio) {
    return <Badge variant="default" className={className}>Sem rastreio</Badge>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="info" className={className}>
        {rastreio.codigo_rastreio}
      </Badge>
      <Badge variant={rastreio.rastreio_em_grupo ? "brand" : "default"} className={className}>
        {rastreio.rastreio_em_grupo ? "Em grupo" : "Individual"}
      </Badge>
    </div>
  );
}