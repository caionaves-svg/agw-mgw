import {
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Zap,
  Calendar,
  BarChart3,
  Eye,
  Download,
  Filter,
} from "lucide-react";
import { Text } from "../ui/text";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { useState } from "react";

// ==================== DADOS MOCK ====================

// SLA com detalhamento completo
const slaData = [
  {
    id: "smoke",
    titulo: "SLA Smoke",
    descricao: "Tempo limite: 5 horas",
    meta: 85,
    atual: 0,
    total: 9193,
    dentroSLA: 1,
    foraSLA: 9192,
    emRisco: 15,
    status: "crítico" as const,
    tendencia: { valor: 12, direcao: "down" as const },
    tempoMedioAtendimento: "6h 45min",
    maiorTempoEspera: "12h 30min",
    impactoFinanceiro: "R$ 45.000",
  },
  {
    id: "nivel1",
    titulo: "SLA Nível 1",
    descricao: "Tempo limite: 2 horas",
    meta: 90,
    atual: 73,
    total: 11,
    dentroSLA: 8,
    foraSLA: 3,
    emRisco: 3,
    status: "atenção" as const,
    tendencia: { valor: 5, direcao: "down" as const },
    tempoMedioAtendimento: "1h 35min",
    maiorTempoEspera: "2h 15min",
    impactoFinanceiro: "R$ 1.200",
  },
  {
    id: "nivel2",
    titulo: "SLA Nível 2",
    descricao: "Tempo limite: 3 horas",
    meta: 90,
    atual: 78,
    total: 125,
    dentroSLA: 98,
    foraSLA: 27,
    emRisco: 8,
    status: "atenção" as const,
    tendencia: { valor: 2, direcao: "up" as const },
    tempoMedioAtendimento: "2h 20min",
    maiorTempoEspera: "3h 45min",
    impactoFinanceiro: "R$ 8.100",
  },
  {
    id: "reabertura",
    titulo: "SLA Reabertura",
    descricao: "Tempo limite: 5 minutos",
    meta: 95,
    atual: 94,
    total: 52,
    dentroSLA: 49,
    foraSLA: 3,
    emRisco: 1,
    status: "normal" as const,
    tendencia: { valor: 3, direcao: "up" as const },
    tempoMedioAtendimento: "4min",
    maiorTempoEspera: "7min",
    impactoFinanceiro: "R$ 450",
  },
];

// Metas operacionais
const metasOperacionais = [
  {
    id: "csat",
    nome: "CSAT Geral",
    meta: 4.5,
    atual: 4.7,
    unidade: "⭐",
    status: "alcançado" as const,
    tendencia: { valor: 4, direcao: "up" as const },
    percentual: 104,
  },
  {
    id: "tmr",
    nome: "TMR Médio",
    meta: "2:00",
    atual: "2:34",
    unidade: "min",
    status: "nao-alcançado" as const,
    tendencia: { valor: 8, direcao: "down" as const },
    percentual: 78,
  },
  {
    id: "resolucao",
    nome: "Taxa de Resolução",
    meta: 90,
    atual: 87,
    unidade: "%",
    status: "proximo" as const,
    tendencia: { valor: 2, direcao: "up" as const },
    percentual: 97,
  },
  {
    id: "abandono",
    nome: "Taxa de Abandono",
    meta: 5,
    atual: 4.2,
    unidade: "%",
    status: "alcançado" as const,
    tendencia: { valor: 3, direcao: "up" as const },
    percentual: 116,
  },
  {
    id: "fct",
    nome: "First Contact Resolution",
    meta: 85,
    atual: 82,
    unidade: "%",
    status: "proximo" as const,
    tendencia: { valor: 1, direcao: "up" as const },
    percentual: 96,
  },
  {
    id: "disponibilidade",
    nome: "Disponibilidade Equipe",
    meta: 80,
    atual: 75,
    unidade: "%",
    status: "nao-alcançado" as const,
    tendencia: { valor: 5, direcao: "down" as const },
    percentual: 94,
  },
];

// Histórico de cumprimento SLA (últimos 30 dias)
const historicoSLA = [
  { dia: 1, smoke: 12, nivel1: 85, nivel2: 82, reabertura: 96 },
  { dia: 5, smoke: 8, nivel1: 88, nivel2: 85, reabertura: 95 },
  { dia: 10, smoke: 5, nivel1: 90, nivel2: 88, reabertura: 97 },
  { dia: 15, smoke: 3, nivel1: 87, nivel2: 83, reabertura: 94 },
  { dia: 20, smoke: 1, nivel1: 82, nivel2: 80, reabertura: 93 },
  { dia: 25, smoke: 0, nivel1: 78, nivel2: 78, reabertura: 95 },
  { dia: 30, smoke: 0, nivel1: 73, nivel2: 78, reabertura: 94 },
];

// Violações de SLA por motivo
const violacoesPorMotivo = [
  { motivo: "Falta de atendentes", quantidade: 3845, percentual: 42 },
  { motivo: "Complexidade do caso", quantidade: 2756, percentual: 30 },
  { motivo: "Aguardando informação", quantidade: 1378, percentual: 15 },
  { motivo: "Transferências múltiplas", quantidade: 918, percentual: 10 },
  { motivo: "Problemas técnicos", quantidade: 276, percentual: 3 },
];

// Projeção de cumprimento
const projecaoCumprimento = [
  { semana: "Sem 1", realizado: 85, projetado: 85 },
  { semana: "Sem 2", realizado: 82, projetado: 83 },
  { semana: "Sem 3", realizado: 78, projetado: 80 },
  { semana: "Sem 4", realizado: 0, projetado: 76 },
];

// ==================== COMPONENTES ====================

// Card de SLA Detalhado
function SLADetailCard({ sla }: { sla: typeof slaData[0] }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "crítico":
        return {
          bg: "bg-red-50",
          border: "border-red-300",
          barColor: "#EF4444",
          icon: AlertOctagon,
          iconColor: "text-red-600",
          iconBg: "bg-red-600",
          badge: "bg-red-100 text-red-700",
        };
      case "atenção":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-300",
          barColor: "#EAB308",
          icon: AlertTriangle,
          iconColor: "text-yellow-600",
          iconBg: "bg-yellow-600",
          badge: "bg-yellow-100 text-yellow-700",
        };
      default:
        return {
          bg: "bg-green-50",
          border: "border-green-300",
          barColor: "#22C55E",
          icon: CheckCircle2,
          iconColor: "text-green-600",
          iconBg: "bg-green-600",
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
        <div className="flex items-center gap-3">
          <div className={`${config.iconBg} rounded-lg p-2`}>
            <StatusIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground" style={{ fontSize: "var(--text-base)" }}>
              {sla.titulo}
            </h4>
            <Text variant="xs" className="text-muted-foreground">
              {sla.descricao}
            </Text>
          </div>
        </div>
        <span className={`${config.badge} text-[11px] px-2.5 py-1 rounded-full font-medium`}>
          {sla.atual}%
        </span>
      </div>

      {/* Percentual Grande */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-foreground" style={{ fontSize: "var(--text-2xl)" }}>
            {sla.atual}%
          </span>
          <Text variant="sm" className="text-muted-foreground">
            dentro do SLA
          </Text>
        </div>
        {/* Tendência */}
        <div className="flex items-center gap-1 mt-1">
          {sla.tendencia.direcao === "up" ? (
            <TrendingUp className="w-3.5 h-3.5 text-green-600" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-red-600" />
          )}
          <Text
            variant="xs"
            className={sla.tendencia.direcao === "up" ? "text-green-600" : "text-red-600"}
          >
            {sla.tendencia.valor}% vs período anterior
          </Text>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="mb-4">
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full transition-all duration-500"
            style={{
              width: `${Math.min(sla.atual, 100)}%`,
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
            {sla.atual >= sla.meta ? "✓ Acima da meta" : "✗ Abaixo da meta"}
          </Text>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white rounded-lg p-2 border border-gray-200">
          <Text variant="xs" className="text-muted-foreground mb-0.5">
            Total
          </Text>
          <Text variant="sm" className="font-semibold text-foreground">
            {sla.total.toLocaleString()}
          </Text>
        </div>
        <div className="bg-white rounded-lg p-2 border border-gray-200">
          <Text variant="xs" className="text-red-600 mb-0.5">
            Vencidos
          </Text>
          <Text variant="sm" className="font-semibold text-red-600">
            {sla.foraSLA.toLocaleString()}
          </Text>
        </div>
        <div className="bg-white rounded-lg p-2 border border-gray-200">
          <Text variant="xs" className="text-orange-600 mb-0.5">
            Em risco
          </Text>
          <Text variant="sm" className="font-semibold text-orange-600">
            {sla.emRisco}
          </Text>
        </div>
      </div>

      {/* Info Adicional */}
      <div className="space-y-2 pt-3 border-t border-gray-300">
        <div className="flex items-center justify-between">
          <Text variant="xs" className="text-muted-foreground">
            Tempo médio atendimento
          </Text>
          <Text variant="xs" className="font-semibold text-foreground">
            {sla.tempoMedioAtendimento}
          </Text>
        </div>
        <div className="flex items-center justify-between">
          <Text variant="xs" className="text-muted-foreground">
            Maior tempo em espera
          </Text>
          <Text variant="xs" className="font-semibold text-red-600">
            {sla.maiorTempoEspera}
          </Text>
        </div>
        {sla.status === "crítico" && (
          <div className="flex items-center justify-between">
            <Text variant="xs" className="text-muted-foreground">
              Impacto financeiro estimado
            </Text>
            <Text variant="xs" className="font-semibold text-red-600">
              {sla.impactoFinanceiro}
            </Text>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          <Eye className="w-3.5 h-3.5" />
          Ver atendimentos
        </Button>
      </div>
    </div>
  );
}

// Card de Meta
function MetaCard({ meta }: { meta: typeof metasOperacionais[0] }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "alcançado":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-700",
          icon: CheckCircle2,
        };
      case "proximo":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-700",
          icon: AlertTriangle,
        };
      default:
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-700",
          icon: AlertCircle,
        };
    }
  };

  const config = getStatusConfig(meta.status);
  const StatusIcon = config.icon;

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-4 hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <Text variant="sm" className="font-semibold text-foreground mb-1">
            {meta.nome}
          </Text>
          <Text variant="xs" className="text-muted-foreground">
            Meta: {meta.meta}
            {meta.unidade}
          </Text>
        </div>
        <StatusIcon className={`w-5 h-5 ${config.text}`} />
      </div>

      <div className="mb-3">
        <span className="font-bold text-foreground" style={{ fontSize: "var(--text-xl)" }}>
          {meta.atual}
          {meta.unidade}
        </span>
      </div>

      <Progress value={meta.percentual} className="h-2 mb-2" />

      <div className="flex items-center justify-between">
        <Text variant="xs" className="text-muted-foreground">
          {meta.percentual}% da meta
        </Text>
        <div className="flex items-center gap-1">
          {meta.tendencia.direcao === "up" ? (
            <TrendingUp className="w-3 h-3 text-green-600" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-600" />
          )}
          <Text variant="xs" className={meta.tendencia.direcao === "up" ? "text-green-600" : "text-red-600"}>
            {meta.tendencia.valor}%
          </Text>
        </div>
      </div>
    </div>
  );
}

// Resumo Geral de SLA
function ResumoGeralSLA() {
  const totalAtendimentos = slaData.reduce((acc, sla) => acc + sla.total, 0);
  const totalForaSLA = slaData.reduce((acc, sla) => acc + sla.foraSLA, 0);
  const percentualGeral = Math.round(((totalAtendimentos - totalForaSLA) / totalAtendimentos) * 100);
  const metasAlcancadas = metasOperacionais.filter((m) => m.status === "alcançado").length;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2 bg-purple-600">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-foreground" style={{ fontSize: "var(--text-xl)" }}>
              Resumo Geral - SLA e Metas
            </h2>
            <Text variant="sm" className="text-muted-foreground">
              Performance consolidada de todos os indicadores
            </Text>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <Text variant="xs" className="text-muted-foreground">
              SLA Geral
            </Text>
          </div>
          <div className="font-bold text-foreground" style={{ fontSize: "var(--text-2xl)" }}>
            {percentualGeral}%
          </div>
          <Text variant="xs" className={percentualGeral >= 85 ? "text-green-600" : "text-red-600"}>
            {percentualGeral >= 85 ? "Dentro da meta" : "Abaixo da meta"}
          </Text>
        </div>

        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <Text variant="xs" className="text-muted-foreground">
              Fora do SLA
            </Text>
          </div>
          <div className="font-bold text-foreground" style={{ fontSize: "var(--text-2xl)" }}>
            {totalForaSLA.toLocaleString()}
          </div>
          <Text variant="xs" className="text-red-600">
            Necessita ação imediata
          </Text>
        </div>

        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <Text variant="xs" className="text-muted-foreground">
              Metas Alcançadas
            </Text>
          </div>
          <div className="font-bold text-foreground" style={{ fontSize: "var(--text-2xl)" }}>
            {metasAlcancadas}/{metasOperacionais.length}
          </div>
          <Text variant="xs" className="text-muted-foreground">
            {Math.round((metasAlcancadas / metasOperacionais.length) * 100)}% das metas
          </Text>
        </div>

        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-orange-600" />
            <Text variant="xs" className="text-muted-foreground">
              Itens Críticos
            </Text>
          </div>
          <div className="font-bold text-foreground" style={{ fontSize: "var(--text-2xl)" }}>
            {slaData.filter((s) => s.status === "crítico").length}
          </div>
          <Text variant="xs" className="text-red-600">
            Requer escalonamento
          </Text>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================

export function GerenciamentoSLA() {
  const [periodo, setPeriodo] = useState("mes");

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <ResumoGeralSLA />

      {/* SLA Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground" style={{ fontSize: "var(--text-lg)" }}>
              Indicadores de SLA
            </h3>
            <Text variant="sm" className="text-muted-foreground">
              Cumprimento de SLA por nível de atendimento
            </Text>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {slaData.map((sla) => (
            <SLADetailCard key={sla.id} sla={sla} />
          ))}
        </div>
      </section>

      {/* Metas Operacionais */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground" style={{ fontSize: "var(--text-lg)" }}>
              Metas Operacionais
            </h3>
            <Text variant="sm" className="text-muted-foreground">
              Indicadores de qualidade e eficiência
            </Text>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metasOperacionais.map((meta) => (
            <MetaCard key={meta.id} meta={meta} />
          ))}
        </div>
      </section>

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Histórico de Cumprimento */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4" style={{ fontSize: "var(--text-lg)" }}>
            Histórico de Cumprimento (Últimos 30 Dias)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicoSLA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" label={{ value: "Dia do mês", position: "insideBottom", offset: -5 }} />
              <YAxis label={{ value: "% SLA", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="nivel1" stroke="#3B82F6" strokeWidth={2} name="Nível 1" />
              <Line type="monotone" dataKey="nivel2" stroke="#10B981" strokeWidth={2} name="Nível 2" />
              <Line type="monotone" dataKey="reabertura" stroke="#22C55E" strokeWidth={2} name="Reabertura" />
              <Line type="monotone" dataKey="smoke" stroke="#EF4444" strokeWidth={2} name="Smoke" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Violações por Motivo */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4" style={{ fontSize: "var(--text-lg)" }}>
            Violações de SLA por Motivo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={violacoesPorMotivo} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="motivo" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="quantidade" radius={[0, 4, 4, 0]}>
                {violacoesPorMotivo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? "#EF4444" : "#6B7280"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Projeção de Cumprimento */}
      <div className="bg-white border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground" style={{ fontSize: "var(--text-lg)" }}>
              Projeção de Cumprimento
            </h3>
            <Text variant="sm" className="text-muted-foreground">
              Comparativo realizado vs projetado (próximas semanas)
            </Text>
          </div>
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semana">Próxima semana</SelectItem>
              <SelectItem value="mes">Próximo mês</SelectItem>
              <SelectItem value="trimestre">Próximo trimestre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={projecaoCumprimento}>
            <defs>
              <linearGradient id="colorRealizado" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00BCF2" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00BCF2" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProjetado" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="semana" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="realizado"
              stroke="#00BCF2"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRealizado)"
              name="Realizado"
            />
            <Area
              type="monotone"
              dataKey="projetado"
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorProjetado)"
              name="Projetado"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <Text variant="sm" className="font-semibold text-yellow-800 mb-1">
                Alerta de Projeção
              </Text>
              <Text variant="sm" className="text-yellow-700">
                A projeção indica queda de 9% no cumprimento de SLA nas próximas semanas. Recomenda-se
                aumentar a equipe em 15% ou redistribuir carga de trabalho.
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Análise Detalhada por Motivo */}
      <div className="bg-white border border-border rounded-lg p-5">
        <h3 className="font-semibold text-foreground mb-4" style={{ fontSize: "var(--text-lg)" }}>
          Análise Detalhada - Violações de SLA
        </h3>
        <div className="space-y-3">
          {violacoesPorMotivo.map((violacao, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      index === 0 ? "bg-red-500" : "bg-gray-400"
                    }`}
                  />
                  <Text variant="sm" className="text-foreground">
                    {violacao.motivo}
                  </Text>
                </div>
                <div className="flex items-center gap-3">
                  <Text variant="sm" className="font-semibold text-foreground">
                    {violacao.quantidade.toLocaleString()}
                  </Text>
                  <Text variant="sm" className="text-muted-foreground w-12 text-right">
                    {violacao.percentual}%
                  </Text>
                </div>
              </div>
              <Progress value={violacao.percentual} className="h-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
