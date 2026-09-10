import {
  MessageSquare,
  Clock,
  Users,
  ArrowRight,
  Search,
  Filter,
  Download,
  Eye,
  UserPlus,
  AlertCircle,
  Phone,
  Mail,
  Bot,
  TrendingUp,
  Zap,
  MoreVertical,
  Play,
  Pause,
  StopCircle,
} from "lucide-react";
import { Text } from "../ui/text";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { useState } from "react";
import ChannelAvatar from "../ChannelAvatar";

// ==================== DADOS MOCK ====================

// Filas de atendimento
const filasData = [
  {
    id: "voz-geral",
    nome: "Voz - Geral",
    canal: "Voz",
    icon: Phone,
    color: "#3B82F6",
    aguardando: 8,
    emAtendimento: 12,
    tempoMedioEspera: "00:02:34",
    atendentesDisponiveis: 5,
    atendentesOcupados: 7,
    status: "normal" as const,
  },
  {
    id: "chat-suporte",
    nome: "Chat - Suporte Técnico",
    canal: "Chat",
    icon: MessageSquare,
    color: "#10B981",
    aguardando: 15,
    emAtendimento: 18,
    tempoMedioEspera: "00:04:12",
    atendentesDisponiveis: 3,
    atendentesOcupados: 9,
    status: "atenção" as const,
  },
  {
    id: "chat-vendas",
    nome: "Chat - Vendas",
    canal: "Chat",
    icon: MessageSquare,
    color: "#10B981",
    aguardando: 3,
    emAtendimento: 8,
    tempoMedioEspera: "00:01:45",
    atendentesDisponiveis: 4,
    atendentesOcupados: 4,
    status: "normal" as const,
  },
  {
    id: "email-geral",
    nome: "E-mail - Geral",
    canal: "E-mail",
    icon: Mail,
    color: "#F59E0B",
    aguardando: 23,
    emAtendimento: 12,
    tempoMedioEspera: "01:34:20",
    atendentesDisponiveis: 6,
    atendentesOcupados: 6,
    status: "crítico" as const,
  },
];

// Atendimentos em curso
const atendimentosEmCurso = [
  {
    id: "ATD-001",
    protocolo: "2024001234",
    cliente: "Maria Santos",
    canal: "whatsapp",
    assunto: "Dúvida sobre fatura",
    atendente: "João Silva",
    fila: "Chat - Suporte Técnico",
    status: "em-atendimento" as const,
    prioridade: "normal" as const,
    tempoDecorrido: "00:08:34",
    sla: "00:51:26",
    slaStatus: "no-prazo" as const,
    ultimaInteracao: "Há 2 min",
  },
  {
    id: "ATD-002",
    protocolo: "2024001235",
    cliente: "Carlos Oliveira",
    canal: "webchat",
    assunto: "Cancelamento de serviço",
    atendente: "Ana Costa",
    fila: "Chat - Vendas",
    status: "em-atendimento" as const,
    prioridade: "alta" as const,
    tempoDecorrido: "00:15:22",
    sla: "00:44:38",
    slaStatus: "no-prazo" as const,
    ultimaInteracao: "Há 1 min",
  },
  {
    id: "ATD-003",
    protocolo: "2024001236",
    cliente: "Fernanda Lima",
    canal: "whatsapp",
    assunto: "Solicitação de reembolso",
    atendente: "Pedro Santos",
    fila: "Chat - Suporte Técnico",
    status: "aguardando-cliente" as const,
    prioridade: "normal" as const,
    tempoDecorrido: "00:22:10",
    sla: "00:37:50",
    slaStatus: "no-prazo" as const,
    ultimaInteracao: "Há 8 min",
  },
  {
    id: "ATD-004",
    protocolo: "2024001237",
    cliente: "Roberto Costa",
    canal: "email",
    assunto: "Alteração de dados cadastrais",
    atendente: "Mariana Souza",
    fila: "E-mail - Geral",
    status: "em-atendimento" as const,
    prioridade: "normal" as const,
    tempoDecorrido: "01:45:30",
    sla: "00:08:12",
    slaStatus: "em-risco" as const,
    ultimaInteracao: "Há 12 min",
  },
  {
    id: "ATD-005",
    protocolo: "2024001238",
    cliente: "Juliana Mendes",
    canal: "messenger",
    assunto: "Problema técnico no app",
    atendente: "Lucas Fernandes",
    fila: "Chat - Suporte Técnico",
    status: "em-atendimento" as const,
    prioridade: "urgente" as const,
    tempoDecorrido: "00:32:45",
    sla: "00:02:15",
    slaStatus: "vencido" as const,
    ultimaInteracao: "Agora",
  },
  {
    id: "ATD-006",
    protocolo: "2024001239",
    cliente: "André Ribeiro",
    canal: "telegram",
    assunto: "Consulta de saldo",
    atendente: "Camila Rocha",
    fila: "Chat - Vendas",
    status: "pausado" as const,
    prioridade: "baixa" as const,
    tempoDecorrido: "00:12:05",
    sla: "01:47:55",
    slaStatus: "no-prazo" as const,
    ultimaInteracao: "Há 15 min",
  },
  {
    id: "ATD-007",
    protocolo: "2024001240",
    cliente: "Patrícia Gomes",
    canal: "whatsapp",
    assunto: "Nova contratação",
    atendente: "Bot Vendas",
    fila: "Chat - Vendas",
    status: "em-atendimento-bot" as const,
    prioridade: "normal" as const,
    tempoDecorrido: "00:03:20",
    sla: "01:56:40",
    slaStatus: "no-prazo" as const,
    ultimaInteracao: "Há 30 seg",
  },
  {
    id: "ATD-008",
    protocolo: "2024001241",
    cliente: "Ricardo Alves",
    canal: "webchat",
    assunto: "Reclamação - Produto com defeito",
    atendente: "Maria Silva",
    fila: "Chat - Suporte Técnico",
    status: "escalado" as const,
    prioridade: "alta" as const,
    tempoDecorrido: "00:28:15",
    sla: "00:31:45",
    slaStatus: "em-risco" as const,
    ultimaInteracao: "Há 5 min",
  },
];

// Indicadores de IA
const iaIndicadores = {
  botsAtivos: 3,
  atendimentosBot: 12,
  taxaResolucaoAutomatica: 68,
  handoffRate: 32,
  satisfacaoBot: 4.2,
  economiaHoras: "24h",
};

// ==================== COMPONENTES ====================

// Card de Fila
function FilaCard({ fila }: { fila: typeof filasData[0] }) {
  const Icon = fila.icon;
  const totalAtivos = fila.aguardando + fila.emAtendimento;
  const capacidadeUsada =
    (fila.atendentesOcupados / (fila.atendentesDisponiveis + fila.atendentesOcupados)) * 100;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "crítico":
        return {
          bg: "bg-red-50",
          border: "border-red-300",
          dot: "bg-red-500",
          text: "text-red-700",
        };
      case "atenção":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-300",
          dot: "bg-yellow-500",
          text: "text-yellow-700",
        };
      default:
        return {
          bg: "bg-green-50",
          border: "border-green-300",
          dot: "bg-green-500",
          text: "text-green-700",
        };
    }
  };

  const config = getStatusConfig(fila.status);

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-4 hover:shadow-md transition-all`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2" style={{ backgroundColor: `${fila.color}15` }}>
            <Icon className="w-5 h-5" style={{ color: fila.color }} />
          </div>
          <div>
            <h4 className="font-semibold text-foreground" style={{ fontSize: "var(--text-sm)" }}>
              {fila.nome}
            </h4>
            <Text variant="xs" className="text-muted-foreground">
              {totalAtivos} atendimentos ativos
            </Text>
          </div>
        </div>
        <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-white rounded-lg p-2 border border-gray-200">
          <Text variant="xs" className="text-muted-foreground mb-0.5">
            Aguardando
          </Text>
          <div className="font-semibold text-foreground" style={{ fontSize: "var(--text-lg)" }}>
            {fila.aguardando}
          </div>
        </div>
        <div className="bg-white rounded-lg p-2 border border-gray-200">
          <Text variant="xs" className="text-muted-foreground mb-0.5">
            Em atendimento
          </Text>
          <div className="font-semibold text-foreground" style={{ fontSize: "var(--text-lg)" }}>
            {fila.emAtendimento}
          </div>
        </div>
      </div>

      {/* Tempo Médio de Espera */}
      <div className="mb-3 p-2 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <Text variant="xs" className="text-muted-foreground">
              Tempo médio de espera
            </Text>
          </div>
          <Text variant="sm" className={`font-semibold ${config.text}`}>
            {fila.tempoMedioEspera}
          </Text>
        </div>
      </div>

      {/* Capacidade de Atendentes */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Text variant="xs" className="text-muted-foreground">
            Capacidade
          </Text>
          <Text variant="xs" className="text-muted-foreground">
            {fila.atendentesOcupados}/{fila.atendentesDisponiveis + fila.atendentesOcupados} atendentes
          </Text>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              capacidadeUsada >= 90
                ? "bg-red-500"
                : capacidadeUsada >= 70
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{ width: `${capacidadeUsada}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Card de Indicadores de IA
function IAIndicadoresCard() {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2 bg-purple-600">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground" style={{ fontSize: "var(--text-lg)" }}>
              Assistentes de IA Ativos
            </h3>
            <Text variant="sm" className="text-muted-foreground">
              Monitoramento em tempo real
            </Text>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4" />
          Gerenciar
        </Button>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-white rounded-lg p-3 border border-purple-200">
          <Text variant="xs" className="text-purple-600 mb-1">
            Bots Ativos
          </Text>
          <div className="font-bold text-foreground" style={{ fontSize: "var(--text-xl)" }}>
            {iaIndicadores.botsAtivos}
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-purple-200">
          <Text variant="xs" className="text-purple-600 mb-1">
            Atendimentos Bot
          </Text>
          <div className="font-bold text-foreground" style={{ fontSize: "var(--text-xl)" }}>
            {iaIndicadores.atendimentosBot}
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-purple-200">
          <Text variant="xs" className="text-purple-600 mb-1">
            CSAT Bot
          </Text>
          <div className="font-bold text-foreground" style={{ fontSize: "var(--text-xl)" }}>
            {iaIndicadores.satisfacaoBot}
          </div>
        </div>
      </div>

      {/* Métricas de Performance */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-1">
            <Text variant="xs" className="text-muted-foreground">
              Resolução Automática
            </Text>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <Text variant="xs" className="text-green-600">
                +8%
              </Text>
            </div>
          </div>
          <div className="font-semibold text-foreground" style={{ fontSize: "var(--text-lg)" }}>
            {iaIndicadores.taxaResolucaoAutomatica}%
          </div>
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${iaIndicadores.taxaResolucaoAutomatica}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-1">
            <Text variant="xs" className="text-muted-foreground">
              Handoff Rate
            </Text>
            <Text variant="xs" className="text-muted-foreground">
              Meta: &lt;35%
            </Text>
          </div>
          <div className="font-semibold text-foreground" style={{ fontSize: "var(--text-lg)" }}>
            {iaIndicadores.handoffRate}%
          </div>
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${iaIndicadores.handoffRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Economia */}
      <div className="mt-3 bg-white rounded-lg p-3 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-600" />
            <Text variant="sm" className="text-muted-foreground">
              Economia estimada hoje
            </Text>
          </div>
          <Text variant="base" className="font-semibold text-purple-600">
            {iaIndicadores.economiaHoras} de atendimento humano
          </Text>
        </div>
      </div>
    </div>
  );
}

// Tabela de Atendimentos
function TabelaAtendimentos({ atendimentos }: { atendimentos: typeof atendimentosEmCurso }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "em-atendimento":
        return { bg: "bg-blue-100", text: "text-blue-700", label: "Em atendimento" };
      case "em-atendimento-bot":
        return { bg: "bg-purple-100", text: "text-purple-700", label: "Bot atendendo" };
      case "aguardando-cliente":
        return { bg: "bg-yellow-100", text: "text-yellow-700", label: "Aguardando cliente" };
      case "pausado":
        return { bg: "bg-gray-100", text: "text-gray-700", label: "Pausado" };
      case "escalado":
        return { bg: "bg-orange-100", text: "text-orange-700", label: "Escalado" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", label: status };
    }
  };

  const getPrioridadeBadge = (prioridade: string) => {
    switch (prioridade) {
      case "urgente":
        return { bg: "bg-red-100", text: "text-red-700", label: "Urgente" };
      case "alta":
        return { bg: "bg-orange-100", text: "text-orange-700", label: "Alta" };
      case "normal":
        return { bg: "bg-blue-100", text: "text-blue-700", label: "Normal" };
      case "baixa":
        return { bg: "bg-gray-100", text: "text-gray-700", label: "Baixa" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", label: prioridade };
    }
  };

  const getSLABadge = (slaStatus: string) => {
    switch (slaStatus) {
      case "vencido":
        return { bg: "bg-red-100", text: "text-red-700", icon: AlertCircle };
      case "em-risco":
        return { bg: "bg-orange-100", text: "text-orange-700", icon: Clock };
      default:
        return { bg: "bg-green-100", text: "text-green-700", icon: null };
    }
  };

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left">
                <Text variant="xs" className="font-semibold text-muted-foreground uppercase">
                  Protocolo
                </Text>
              </th>
              <th className="px-4 py-3 text-left">
                <Text variant="xs" className="font-semibold text-muted-foreground uppercase">
                  Cliente
                </Text>
              </th>
              <th className="px-4 py-3 text-left">
                <Text variant="xs" className="font-semibold text-muted-foreground uppercase">
                  Assunto
                </Text>
              </th>
              <th className="px-4 py-3 text-left">
                <Text variant="xs" className="font-semibold text-muted-foreground uppercase">
                  Atendente
                </Text>
              </th>
              <th className="px-4 py-3 text-left">
                <Text variant="xs" className="font-semibold text-muted-foreground uppercase">
                  Fila
                </Text>
              </th>
              <th className="px-4 py-3 text-left">
                <Text variant="xs" className="font-semibold text-muted-foreground uppercase">
                  Status
                </Text>
              </th>
              <th className="px-4 py-3 text-left">
                <Text variant="xs" className="font-semibold text-muted-foreground uppercase">
                  Tempo
                </Text>
              </th>
              <th className="px-4 py-3 text-left">
                <Text variant="xs" className="font-semibold text-muted-foreground uppercase">
                  SLA
                </Text>
              </th>
              <th className="px-4 py-3 text-left">
                <Text variant="xs" className="font-semibold text-muted-foreground uppercase">
                  Ações
                </Text>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {atendimentos.map((atendimento) => {
              const statusBadge = getStatusBadge(atendimento.status);
              const prioridadeBadge = getPrioridadeBadge(atendimento.prioridade);
              const slaBadge = getSLABadge(atendimento.slaStatus);
              const SLAIcon = slaBadge.icon;

              return (
                <tr key={atendimento.id} className="hover:bg-gray-50 transition-colors">
                  {/* Protocolo */}
                  <td className="px-4 py-3">
                    <Text variant="sm" className="font-mono font-medium text-foreground">
                      {atendimento.protocolo}
                    </Text>
                  </td>

                  {/* Cliente */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ChannelAvatar nome={atendimento.cliente} channel={atendimento.canal as any} />
                      <div>
                        <Text variant="sm" className="font-medium text-foreground">
                          {atendimento.cliente}
                        </Text>
                      </div>
                    </div>
                  </td>

                  {/* Assunto */}
                  <td className="px-4 py-3">
                    <div className="max-w-[200px]">
                      <Text variant="sm" className="text-foreground truncate">
                        {atendimento.assunto}
                      </Text>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${prioridadeBadge.bg} ${prioridadeBadge.text}`}>
                          {prioridadeBadge.label}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Atendente */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {atendimento.atendente.includes("Bot") ? (
                        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-purple-600" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-brand-primary/10 flex items-center justify-center">
                          <Text variant="xs" className="font-semibold text-brand-primary">
                            {atendimento.atendente.split(" ").map((n) => n[0]).join("")}
                          </Text>
                        </div>
                      )}
                      <Text variant="sm" className="text-foreground">
                        {atendimento.atendente}
                      </Text>
                    </div>
                  </td>

                  {/* Fila */}
                  <td className="px-4 py-3">
                    <Text variant="xs" className="text-muted-foreground">
                      {atendimento.fila}
                    </Text>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                      {statusBadge.label}
                    </span>
                  </td>

                  {/* Tempo Decorrido */}
                  <td className="px-4 py-3">
                    <div>
                      <Text variant="sm" className="font-medium text-foreground">
                        {atendimento.tempoDecorrido}
                      </Text>
                      <Text variant="xs" className="text-muted-foreground">
                        {atendimento.ultimaInteracao}
                      </Text>
                    </div>
                  </td>

                  {/* SLA */}
                  <td className="px-4 py-3">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded ${slaBadge.bg} w-fit`}>
                      {SLAIcon && <SLAIcon className={`w-3.5 h-3.5 ${slaBadge.text}`} />}
                      <Text variant="sm" className={`font-medium ${slaBadge.text}`}>
                        {atendimento.sla}
                      </Text>
                    </div>
                  </td>

                  {/* Ações */}
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserPlus className="w-4 h-4" />
                          Transferir
                        </DropdownMenuItem>
                        {atendimento.status === "pausado" ? (
                          <DropdownMenuItem>
                            <Play className="w-4 h-4" />
                            Retomar
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem>
                            <Pause className="w-4 h-4" />
                            Pausar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <StopCircle className="w-4 h-4" />
                          Encerrar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================

export function GerenciamentoAtendimentos() {
  const [filtroFila, setFiltroFila] = useState("todas");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [busca, setBusca] = useState("");

  // Totais
  const totalAguardando = filasData.reduce((acc, fila) => acc + fila.aguardando, 0);
  const totalEmAtendimento = filasData.reduce((acc, fila) => acc + fila.emAtendimento, 0);
  const totalAtendentes = filasData.reduce(
    (acc, fila) => acc + fila.atendentesDisponiveis + fila.atendentesOcupados,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header com resumo */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-bold text-foreground mb-2" style={{ fontSize: "var(--text-xl)" }}>
              Visão Geral de Atendimentos
            </h2>
            <Text variant="sm" className="text-muted-foreground">
              Monitoramento em tempo real de todas as filas e atendimentos em curso
            </Text>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <Text variant="xs" className="text-muted-foreground">
                Aguardando
              </Text>
            </div>
            <div className="font-bold text-foreground" style={{ fontSize: "var(--text-2xl)" }}>
              {totalAguardando}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <Text variant="xs" className="text-muted-foreground">
                Em atendimento
              </Text>
            </div>
            <div className="font-bold text-foreground" style={{ fontSize: "var(--text-2xl)" }}>
              {totalEmAtendimento}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-green-600" />
              <Text variant="xs" className="text-muted-foreground">
                Atendentes ativos
              </Text>
            </div>
            <div className="font-bold text-foreground" style={{ fontSize: "var(--text-2xl)" }}>
              {totalAtendentes}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-purple-600" />
              <Text variant="xs" className="text-muted-foreground">
                Bots ativos
              </Text>
            </div>
            <div className="font-bold text-foreground" style={{ fontSize: "var(--text-2xl)" }}>
              {iaIndicadores.botsAtivos}
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Filas */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground" style={{ fontSize: "var(--text-lg)" }}>
              Filas de Atendimento
            </h3>
            <Text variant="sm" className="text-muted-foreground">
              Status em tempo real por fila
            </Text>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filasData.map((fila) => (
            <FilaCard key={fila.id} fila={fila} />
          ))}
        </div>
      </section>

      {/* Card de IA */}
      <IAIndicadoresCard />

      {/* Tabela de Atendimentos em Curso */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground" style={{ fontSize: "var(--text-lg)" }}>
              Atendimentos em Curso
            </h3>
            <Text variant="sm" className="text-muted-foreground">
              {atendimentosEmCurso.length} atendimentos ativos no momento
            </Text>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por protocolo, cliente ou assunto..."
              className="pl-10"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <Select value={filtroFila} onValueChange={setFiltroFila}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas as filas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as filas</SelectItem>
              {filasData.map((fila) => (
                <SelectItem key={fila.id} value={fila.id}>
                  {fila.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="em-atendimento">Em atendimento</SelectItem>
              <SelectItem value="em-atendimento-bot">Bot atendendo</SelectItem>
              <SelectItem value="aguardando-cliente">Aguardando cliente</SelectItem>
              <SelectItem value="pausado">Pausado</SelectItem>
              <SelectItem value="escalado">Escalado</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabela */}
        <TabelaAtendimentos atendimentos={atendimentosEmCurso} />
      </section>
    </div>
  );
}
