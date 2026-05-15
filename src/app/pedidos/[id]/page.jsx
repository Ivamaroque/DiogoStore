import { PedidoDetalheClient } from "@/components/pedidos/PedidoDetalheClient";

export default function PedidoDetalhePage({ params }) {
  return <PedidoDetalheClient pedidoId={params.id} />;
}