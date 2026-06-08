import { Badge } from "@/components/ui/badge";
import { getStatusBadgeStyle, getStatusPorId } from "@/lib/constants/status";

export function StatusBadge({ status, statusItens = [], className = "" }) {
  const statusData = typeof status === "object"
    ? status
    : getStatusPorId(status, statusItens);

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
