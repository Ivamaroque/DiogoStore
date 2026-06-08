import { Badge } from "@/components/ui/badge";
import { getStatusBadgeStyle, getStatusPorId } from "@/lib/constants/status";

export function StatusBadge({ status, className = "" }) {
  const statusFixo = getStatusPorId(typeof status === "object" ? status?.id : status);
  const statusData = typeof status === "object"
    ? { ...statusFixo, ...status, cor: status?.cor || statusFixo?.cor }
    : statusFixo;

  if (!statusData) {
    return <Badge variant="default" className={className}>Sem status</Badge>;
  }

  return (
    <Badge
      title={statusData.descricao}
      className={className}
      style={{
        ...getStatusBadgeStyle(statusData.cor),
        borderWidth: 1,
      }}
    >
      {statusData.nome}
    </Badge>
  );
}
