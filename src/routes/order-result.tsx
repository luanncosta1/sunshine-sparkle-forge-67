
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getOrderByReference } from "@/lib/payments.functions";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/order-result")({
  component: OrderResult,
});

type StatusDetail = {
  title: string;
  description: string;
  color: string;
  icon: string;
};

const statusInfo: Record<string, StatusDetail> = {
  paid: {
    title: 'Pagamento Aprovado!',
    description: 'Seu pedido foi confirmado. Você receberá os detalhes em breve.',
    color: 'text-green-500',
    icon: 'fa-circle-check'
  },
  pending: {
    title: 'Aguardando Pagamento',
    description: 'Estamos aguardando a confirmação do seu pagamento pelo PagBank.',
    color: 'text-yellow-500',
    icon: 'fa-clock'
  },
  in_analysis: {
    title: 'Em Análise',
    description: 'Seu pagamento está sendo analisado pelo PagBank. Isso pode levar alguns minutos.',
    color: 'text-blue-500',
    icon: 'fa-magnifying-glass'
  },
  declined: {
    title: 'Pagamento Recusado',
    description: 'Infelizmente seu pagamento não foi aprovado pela operadora.',
    color: 'text-red-500',
    icon: 'fa-circle-xmark'
  },
  canceled: {
    title: 'Pedido Cancelado',
    description: 'Este pedido foi cancelado.',
    color: 'text-gray-500',
    icon: 'fa-ban'
  },
  expired: {
    title: 'Pedido Expirado',
    description: 'O tempo para pagamento expirou.',
    color: 'text-orange-500',
    icon: 'fa-hourglass-end'
  },
  unknown: {
    title: 'Status Desconhecido',
    description: 'Não conseguimos identificar o status do seu pagamento.',
    color: 'text-gray-500',
    icon: 'fa-circle-question'
  }
};

function OrderResult() {
  const { referenceId } = Route.useSearch() as { referenceId: string };

  const fetchOrder = useServerFn(getOrderByReference);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', referenceId],
    queryFn: () => fetchOrder({ data: { referenceId } }),
    enabled: !!referenceId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return (status === 'pending' || status === 'in_analysis') ? 3000 : false;
    }
  });

  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
        <p>Buscando informações do seu pedido...</p>
      </div>
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Pedido não encontrado</h2>
        <p className="text-muted-foreground mb-8">Não conseguimos localizar o seu pedido. Caso tenha ocorrido algum erro no pagamento, tente novamente.</p>
        <Link to="/" className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold">Voltar para a Loja</Link>
      </div>
    </div>
  );

  const currentStatus: StatusDetail = statusInfo[order.status] || statusInfo['unknown']!;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans text-foreground">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl text-center shadow-2xl">
        <i className={`fa-solid ${currentStatus.icon} text-6xl ${currentStatus.color} mb-6`}></i>
        <h2 className={`text-3xl font-bold mb-4 font-['Archivo_Black'] ${currentStatus.color}`}>{currentStatus.title}</h2>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          {currentStatus.description}
        </p>

        <div className="bg-white/5 rounded-xl p-6 mb-8 text-left space-y-3 border border-white/5">
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-muted-foreground">Referência:</span>
            <span className="font-mono font-medium">{order.reference_id}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-muted-foreground">Ingresso:</span>
            <span className="font-bold text-primary">{order.ticket_type}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-muted-foreground">Quantidade:</span>
            <span>{order.quantity}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-muted-foreground">Valor Total:</span>
            <span className="text-xl font-bold text-primary">R$ {(order.total_price / 100).toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        <Link to="/" className="w-full inline-block bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-bold transition-all transform hover:scale-105">
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
