import {
  MessageSquare,
  Clock,
  Star,
  CheckCircle,
  Phone,
  Mail,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Target,
  Users,
  BarChart3,
  Zap,
  ArrowRight,
  Bell,
  Eye,
  ChevronRight,
  Flame,
  Timer,
  UserCheck,
  AlertOctagon,
} from "lucide-react";
import { Text } from "../ui/text";
import { Button } from "../ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ==================== DADOS MOCK ====================

// Status geral da operação
const statusOperacional = {
  nivel: "crítico" as "crítico" | "atenção" | "normal" | "ótimo",
  score: 68, // Score geral de 0-100
  mensagem: "9.192 atendimentos fora do SLA Smoke - ação imediata necessária",
  itemsCriticos: 3,
  itemsAtencao: 5,
};

// KPIs principais com contexto
const kpiData = [
  {
    label: "Em Atendimento",
    value: 23,
    maxCapacity: 40,
    percentage: 58,
    trend: { value: 5, direction: "up" as const },
    status: "normal" as const,
  },
  {
    label: "Em Espera",
    value: 15,
    threshold: 10,
    percentage: 150,
    trend: { value: 8, direction: "up" as const },
    status: "atenção" as const,
  },
  {
    label: "TMR Médio",
    value: "2:34",
    target: "2:00",
    trend: { value: 15, direction: "down" as const },
    status: "atenção" as const,
  },
  {
    label: "CSAT",
    value: "4.7",
    target: "4.5",
    trend: { value: 3, direction: "up" as const },
    status: "ótimo" as const,
  },
];

// SLA com urgência e ações
const slaUrgente = [
  {
    id: "smoke",
    title: "SLA Smoke",
    limite: "5h",
    total: 9193,
    vencidos: 9192,
    noLimite: 15, // próximos a vencer (<30min)
    percentual: 0,
    meta: 85,
    status: "crítico" as const,
    acoes: [
      { label: "Escalar equipe", icon: Users },
      { label: "Ver atendimentos", icon: Eye },
    ],
  },
  {
    id: "nivel2",
    title: "SLA Nível 2",
    limite: "3h",
    total: 125,
    vencidos: 27,
    noLimite: 8,
    percentual: 78,
    meta: 90,
    status: "atenção" as const,
    acoes: [{ label: "Ver atendimentos", icon: Eye }],
  },
  {
    id: "nivel1",
    title: "SLA Nível 1",
    limite: "2h",
    total: 11,
    vencidos: 3,
    noLimite: 3,
    percentual: 73,
    meta: 90,
    status: "atenção" as const,
    acoes: [{ label: "Ver atendimentos", icon: Eye }],
  },
  {
    id: "reabertura",
    title: "SLA Reabertura",
    limite: "5min",
    total: 52,
    vencidos: 3,
    noLimite: 1,
    percentual: 94,
    meta: 95,
    status: "normal" as const,
    acoes: [],
  },
];

// Canais com heatmap de horários
const canaisData = [
  {
    canal: "Chat/Mensagens",
    icon: MessageSquare,
    color: "#10B981",
    emAtendimento: 12,
    emEspera: 5,
    tma: "2:15",
    totalHoje: 892,
    abandonados: 8,
    volumePorHora: [23, 34, 45, 67, 89, 98, 87, 76, 65, 54, 43, 32], // últimas 12h
  },
  {
    canal: "Voz",
    icon: Phone,
    color: "#3B82F6",
    emAtendimento: 8,
    emEspera: 3,
    tma: "3:24",
    totalHoje: 145,
    abandonados: 2,
    volumePorHora: [15, 18, 22, 28, 34, 38, 35, 32, 28, 24, 20, 16],
  },
  {
    canal: "E-Mail",
    icon: Mail,
    color: "#F59E0B",
    emAtendimento: 3,
    emEspera: 7,
    tma: "45:30",
    totalHoje: 234,
    abandonados: 0,
    volumePorHora: [8, 12, 18, 24, 32, 38, 34, 28, 22, 18, 14, 10],
  },
];

// Atendentes com status e carga
const atendentesData = [
  {
    id: 1,
    nome: "Maria Silva",
    avatar: "MS",
    status: "online",
    statusColor: "#22C55E",
    atendimentosAtivos: 3,
    capacidade: 4,
    tmr: "1:58",
    satisfacao: 4.9,
    atendimentosHoje: 15,
  },
  {
    id: 2,
    nome: "João Santos",
    avatar: "JS",
    status: "online",
    statusColor: "#22C55E",
    atendimentosAtivos: 4,
    capacidade: 4,
    tmr: "2:15",
    satisfacao: 4.7,
    atendimentosHoje: 12,
  },
  {
    id: 3,
    nome: "Ana Costa",
    avatar: "AC",
    status: "ausente",
    statusColor: "#EAB308",
    atendimentosAtivos: 2,
    capacidade: 4,
    tmr: "3:42",
    satisfacao: 4.5,
    atendimentosHoje: 8,
  },
  {
    id: 4,
    nome: "Carlos Oliveira",
    avatar: "CO",
    status: "offline",
    statusColor: "#EF4444",
    atendimentosAtivos: 0,
    capacidade: 4,
    tmr: "-",
    satisfacao: 4.8,
    atendimentosHoje: 0,
  },
];

// Timeline de próximos vencimentos
const proximosVencimentos = [
  { sla: "Reabertura", quantidade: 1, tempo: "2 min", urgencia: "crítico" },
  { sla: "Nível 1", quantidade: 3, tempo: "15 min", urgencia: "alto" },
  { sla: "Nível 2", quantidade: 8, tempo: "30 min", urgencia: "médio" },
  { sla: "Smoke", quantidade: 15, tempo: "45 min", urgencia: "médio" },
];

// Tendência de atendimentos (últimas 24h)
const tendenciaAtendimentos = [
  { hora: "00h", total: 12, voz: 3, chat: 8, email: 1 },
  { hora: "03h", total: 8, voz: 2, chat: 5, email: 1 },
  { hora: "06h", total: 15, voz: 4, chat: 9, email: 2 },
  { hora: "09h", total: 45, voz: 12, chat: 28, email: 5 },
  { hora: "12h", total: 67, voz: 18, chat: 42, email: 7 },
  { hora: "15h", total: 89, voz: 24, chat: 56, email: 9 },
  { hora: "18h", total: 78, voz: 20, chat: 50, email: 8 },
  { hora: "21h", total: 45, voz: 12, chat: 28, email: 5 },
];

// ==================== COMPONENTES ====================

// Header Executivo com Status Geral
function ExecutiveSummary() {
  const getStatusConfig = (nivel: string) => {
    switch (nivel) {
      case "crítico":
        return {
          bg: "bg-gradient-to-br from-red-50 to-red-100",
          border: "border-red-300",
          icon: AlertOctagon,
          iconColor: "text-red-600",
          iconBg: "bg-red-600",
          label: "Situação Crítica",
          labelColor: "text-red-700",
        };
      case "atenção":
        return {
          bg: "bg-gradient-to-br from-yellow-50 to-yellow-100",
          border: "border-yellow-300",
          icon: AlertTriangle,
          iconColor: "text-yellow-600",
          iconBg: "bg-yellow-600",
          label: "Atenção Necessária",
          labelColor: "text-yellow-700",
        };
      case "normal":
        return {
          bg: "bg-gradient-to-br from-blue-50 to-blue-100",
          border: "border-blue-300",
          icon: Activity,
          iconColor: "text-blue-600",
          iconBg: "bg-blue-600",
          label: "Operação Normal",
          labelColor: "text-blue-700",
        };
      default:
        return {
          bg: "bg-gradient-to-br from-green-50 to-green-100",
          border: "border-green-300",
          icon: CheckCircle2,
          iconColor: "text-green-600",
          iconBg: "bg-green-600",
          label: "Operação Ótima",
          labelColor: "text-green-700",
        };
    }
  };

  const config = getStatusConfig(statusOperacional.nivel);
  const StatusIcon = config.icon;

  return (
    <div className={`${config.bg} border-2 ${config.border} rounded-xl p-6 mb-8`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`${config.iconBg} rounded-lg p-2`}>
              <StatusIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-foreground" style={{ fontSize: "var(--text-xl)" }}>
                {config.label}
              </h2>
              <Text variant="sm" className="text-muted-foreground">
                Score operacional: {statusOperacional.score}/100
              </Text>
            </div>
          </div>
          
          <p className="text-foreground mb-4" style={{ fontSize: "var(--text-base)" }}>
            {statusOperacional.mensagem}
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <Text variant="sm" className="text-foreground">
                {statusOperacional.itemsCriticos} itens críticos
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <Text variant="sm" className="text-foreground">
                {statusOperacional.itemsAtencao} itens em atenção
              </Text>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="flex flex-col gap-2">
          <Button variant="default" size="sm">
            <Zap className="w-4 h-4" />
            Ações Rápidas
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4" />
            Ver Alertas ({statusOperacional.itemsCriticos + statusOperacional.itemsAtencao})
          </Button>
        </div>
      </div>
    </div>
  );
}

// KPI Card Modernizado
function ModernKPICard({ kpi }: { kpi: typeof kpiData[0] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "crítico":
        return { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-500" };
      case "atenção":
        return { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", dot: "bg-yellow-500" };
      case "ótimo":
        return { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", dot: "bg-green-500" };
      default:
        return { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", dot: "bg-blue-500" };
    }
  };

  const colors = getStatusColor(kpi.status);

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-5 hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <Text variant="sm" className="text-muted-foreground font-medium">
          {kpi.label}
        </Text>
        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
      </div>

      <div className="mb-2">
        <span className="font-bold text-foreground" style={{ fontSize: "var(--text-2xl)" }}>
          {kpi.value}
        </span>
      </div>

      {/* Trend */}
      <div className="flex items-center gap-1.5">
        {kpi.trend.direction === "up" ? (
          <TrendingUp className={`w-3.5 h-3.5 ${kpi.status === "atenção" || kpi.status === "crítico" ? "text-red-600" : "text-green-600"}`} />
        ) : (
          <TrendingDown className={`w-3.5 h-3.5 ${kpi.status === "ótimo" ? "text-green-600" : "text-red-600"}`} />
        )}
        <Text variant="xs" className="text-muted-foreground">
          {kpi.trend.value}% vs anterior
        </Text>
      </div>

      {/* Progress bar se aplicável */}
      {kpi.percentage && (
        <div className="mt-3">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                kpi.percentage > 100 ? "bg-red-500" : colors.dot
              }`}
              style={{ width: `${Math.min(kpi.percentage, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Card de SLA Compacto e Acionável
function SLAActionCard({ sla }: { sla: typeof slaUrgente[0] }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "crítico":
        return {
          bg: "bg-red-50",
          border: "border-red-300",
          barColor: "#EF4444",
          icon: AlertOctagon,
          iconColor: "text-red-600",
          badge: "bg-red-100 text-red-700",
        };
      case "atenção":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-300",
          barColor: "#EAB308",
          icon: AlertTriangle,
          iconColor: "text-yellow-600",
          badge: "bg-yellow-100 text-yellow-700",
        };
      default:
        return {
          bg: "bg-green-50",
          border: "border-green-300",
          barColor: "#22C55E",
          icon: CheckCircle2,
          iconColor: "text-green-600",
          badge: "bg-green-100 text-green-700",
        };
    }
  };

  const config = getStatusConfig(sla.status);
  const StatusIcon = config.icon;

  return (
    <div className={`${config.bg} border-2 ${config.border} rounded-lg p-5 hover:shadow-lg transition-all`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-5 h-5 ${config.iconColor}`} />
          <div>
            <h4 className="font-semibold text-foreground" style={{ fontSize: "var(--text-base)" }}>
              {sla.title}
            </h4>
            <Text variant="xs" className="text-muted-foreground">
              Limite: {sla.limite}
            </Text>
          </div>
        </div>
        <span className={`${config.badge} text-[11px] px-2.5 py-1 rounded-full font-medium`}>
          {sla.percentual}%
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="mb-4">
        <div className="relative h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full transition-all duration-500"
            style={{
              width: `${Math.min(sla.percentual, 100)}%`,
              backgroundColor: config.barColor,
            }}
          />
          {/* Meta */}
          <div
            className="absolute top-0 h-full w-0.5 bg-gray-700 z-10"
            style={{ left: `${sla.meta}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <Text variant="xs" className="text-muted-foreground">
            Meta: {sla.meta}%
          </Text>
          <Text variant="xs" className={config.iconColor}>
            {sla.percentual >= sla.meta ? "✓ No prazo" : "✗ Abaixo da meta"}
          </Text>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <Text variant="xs" className="text-muted-foreground mb-0.5">
            Total
          </Text>
          <div className="font-semibold text-foreground" style={{ fontSize: "var(--text-sm)" }}>
            {sla.total.toLocaleString()}
          </div>
        </div>
        <div>
          <Text variant="xs" className="text-red-600 mb-0.5">
            Vencidos
          </Text>
          <div className="font-semibold text-red-600" style={{ fontSize: "var(--text-sm)" }}>
            {sla.vencidos.toLocaleString()}
          </div>
        </div>
        <div>
          <Text variant="xs" className="text-orange-600 mb-0.5">
            No limite
          </Text>
          <div className="font-semibold text-orange-600" style={{ fontSize: "var(--text-sm)" }}>
            {sla.noLimite}
          </div>
        </div>
      </div>

      {/* Ações */}
      {sla.acoes.length > 0 && (
        <div className="flex gap-2">
          {sla.acoes.map((acao, index) => {
            const ActionIcon = acao.icon;
            return (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
              >
                <ActionIcon className="w-3.5 h-3.5" />
                {acao.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Card de Canal com Mini Heatmap
function CanalHeatmapCard({ canal }: { canal: typeof canaisData[0] }) {
  const Icon = canal.icon;
  const maxVolume = Math.max(...canal.volumePorHora);

  return (
    <div className="bg-white border border-border rounded-lg p-5 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2" style={{ backgroundColor: `${canal.color}15` }}>
            <Icon className="w-5 h-5" style={{ color: canal.color }} />
          </div>
          <div>
            <h4 className="font-semibold text-foreground" style={{ fontSize: "var(--text-base)" }}>
              {canal.canal}
            </h4>
            <Text variant="xs" className="text-muted-foreground">
              {canal.totalHoje} atend. hoje
            </Text>
          </div>
        </div>
      </div>

      {/* Status Atual */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-50 rounded-lg p-2.5 border border-green-200">
          <Text variant="xs" className="text-green-700 mb-0.5">
            Atendimento
          </Text>
          <div className="font-semibold text-green-700" style={{ fontSize: "var(--text-base)" }}>
            {canal.emAtendimento}
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-2.5 border border-yellow-200">
          <Text variant="xs" className="text-yellow-700 mb-0.5">
            Espera
          </Text>
          <div className="font-semibold text-yellow-700" style={{ fontSize: "var(--text-base)" }}>
            {canal.emEspera}
          </div>
        </div>
      </div>

      {/* Mini Heatmap */}
      <div className="mb-4">
        <Text variant="xs" className="text-muted-foreground mb-2">
          Volume (últimas 12h)
        </Text>
        <div className="flex gap-1">
          {canal.volumePorHora.map((volume, index) => {
            const intensity = (volume / maxVolume) * 100;
            return (
              <div
                key={index}
                className="flex-1 h-8 rounded transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: canal.color,
                  opacity: Math.max(0.2, intensity / 100),
                }}
                title={`${volume} atendimentos`}
              />
            );
          })}
        </div>
      </div>

      {/* Métricas */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div>
          <Text variant="xs" className="text-muted-foreground">
            TMA
          </Text>
          <Text variant="sm" className="font-semibold text-foreground">
            {canal.tma}
          </Text>
        </div>
        <div className="text-right">
          <Text variant="xs" className="text-muted-foreground">
            Abandonados
          </Text>
          <Text variant="sm" className="font-semibold text-red-600">
            {canal.abandonados}
          </Text>
        </div>
      </div>
    </div>
  );
}

// Timeline de Urgência
function UrgencyTimeline() {
  const getUrgenciaConfig = (urgencia: string) => {
    switch (urgencia) {
      case "crítico":
        return { color: "bg-red-500", text: "text-red-700", bg: "bg-red-50" };
      case "alto":
        return { color: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50" };
      default:
        return { color: "bg-yellow-500", text: "text-yellow-700", bg: "bg-yellow-50" };
    }
  };

  return (
    <div className="bg-white border border-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-brand-primary" />
          <h3 className="font-semibold text-foreground" style={{ fontSize: "var(--text-lg)" }}>
            Próximos Vencimentos
          </h3>
        </div>
        <Button variant="ghost" size="sm">
          Ver todos
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {proximosVencimentos.map((item, index) => {
          const config = getUrgenciaConfig(item.urgencia);
          return (
            <div
              key={index}
              className={`${config.bg} border border-gray-200 rounded-lg p-3 flex items-center justify-between hover:shadow-sm transition-all`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-1 h-12 rounded-full ${config.color}`} />
                <div>
                  <div className="font-semibold text-foreground" style={{ fontSize: "var(--text-sm)" }}>
                    {item.quantidade} atend. ({item.sla})
                  </div>
                  <Text variant="xs" className={config.text}>
                    Vencem em {item.tempo}
                  </Text>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="w-3.5 h-3.5" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Card de Atendente Compacto
function AtendenteCard({ atendente }: { atendente: typeof atendentesData[0] }) {
  const capacidadePerc = (atendente.atendimentosAtivos / atendente.capacidade) * 100;

  return (
    <div className="bg-white border border-border rounded-lg p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
              <span className="font-semibold text-brand-primary" style={{ fontSize: "var(--text-sm)" }}>
                {atendente.avatar}
              </span>
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
              style={{ backgroundColor: atendente.statusColor }}
            />
          </div>
          <div>
            <div className="font-semibold text-foreground" style={{ fontSize: "var(--text-sm)" }}>
              {atendente.nome}
            </div>
            <Text variant="xs" className="text-muted-foreground">
              {atendente.status}
            </Text>
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-foreground" style={{ fontSize: "var(--text-base)" }}>
            {atendente.atendimentosAtivos}/{atendente.capacidade}
          </div>
          <Text variant="xs" className="text-muted-foreground">
            ativos
          </Text>
        </div>
      </div>

      {/* Barra de capacidade */}
      <div className="mb-3">
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              capacidadePerc >= 100
                ? "bg-red-500"
                : capacidadePerc >= 75
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{ width: `${Math.min(capacidadePerc, 100)}%` }}
          />
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Text variant="xs" className="text-muted-foreground">
            TMR
          </Text>
          <Text variant="xs" className="font-semibold text-foreground">
            {atendente.tmr}
          </Text>
        </div>
        <div>
          <Text variant="xs" className="text-muted-foreground">
            CSAT
          </Text>
          <Text variant="xs" className="font-semibold text-foreground">
            {atendente.satisfacao}
          </Text>
        </div>
        <div>
          <Text variant="xs" className="text-muted-foreground">
            Hoje
          </Text>
          <Text variant="xs" className="font-semibold text-foreground">
            {atendente.atendimentosHoje}
          </Text>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================

export function GerenciamentoOverview() {
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <ExecutiveSummary />

      {/* KPIs em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <ModernKPICard key={index} kpi={kpi} />
        ))}
      </div>

      {/* SLA Cards - Área de Foco */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg p-2 bg-red-600">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground" style={{ fontSize: "var(--text-xl)" }}>
                SLA - Atendimentos Não Finalizados
              </h2>
              <Text variant="sm" className="text-muted-foreground">
                Ação imediata necessária para itens críticos
              </Text>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Ver detalhes
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {slaUrgente.map((sla) => (
            <SLAActionCard key={sla.id} sla={sla} />
          ))}
        </div>
      </section>

      {/* Layout 2 Colunas: Canais + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canais (2/3) */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg p-2 bg-brand-primary/10">
              <Activity className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground" style={{ fontSize: "var(--text-xl)" }}>
                Canais de Atendimento
              </h2>
              <Text variant="sm" className="text-muted-foreground">
                Status em tempo real + volume nas últimas 12h
              </Text>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {canaisData.map((canal) => (
              <CanalHeatmapCard key={canal.canal} canal={canal} />
            ))}
          </div>
        </div>

        {/* Timeline de Urgência (1/3) */}
        <div>
          <UrgencyTimeline />
        </div>
      </div>

      {/* Gráfico de Tendência */}
      <div className="bg-white border border-border rounded-lg p-5">
        <h3 className="font-semibold text-foreground mb-4" style={{ fontSize: "var(--text-lg)" }}>
          Tendência de Atendimentos (Últimas 24h)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={tendenciaAtendimentos}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00BCF2" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00BCF2" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hora" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#00BCF2"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Equipe de Atendentes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg p-2 bg-green-600">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground" style={{ fontSize: "var(--text-xl)" }}>
                Equipe de Atendentes
              </h2>
              <Text variant="sm" className="text-muted-foreground">
                12 online • 4 ausentes • 4 offline
              </Text>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <UserCheck className="w-4 h-4" />
            Gerenciar equipe
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {atendentesData.map((atendente) => (
            <AtendenteCard key={atendente.id} atendente={atendente} />
          ))}
        </div>
      </section>
    </div>
  );
}
