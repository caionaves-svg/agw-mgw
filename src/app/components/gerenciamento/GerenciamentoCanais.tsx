import {
  Phone,
  Mail,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Clock,
  Star,
  Users,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Activity,
  Zap,
  Calendar,
} from "lucide-react";
import { Text } from "../ui/text";
import { Button } from "../ui/button";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { useState } from "react";

// ==================== DADOS MOCK ====================

// Canais principais
const canaisData = [
  {
    id: "whatsapp",
    nome: "WhatsApp",
    icon: MessageSquare,
    color: "#25D366",
    volumeHoje: 1245,
    volumeSemana: 8960,
    volumeMes: 38420,
    tma: "00:02:15",
    tme: "00:00:42",
    satisfacao: 4.8,
    taxaResolucao: 92,
    taxaAbandono: 3.2,
    atendentesAtivos: 12,
    horasPico: ["09:00-12:00", "14:00-17:00"],
    tendencia: "up" as const,
    percentualTotal: 42,
  },
  {
    id: "webchat",
    nome: "WebChat",
    icon: MessageSquare,
    color: "#6B7280",
    volumeHoje: 892,
    volumeSemana: 6244,
    volumeMes: 26780,
    tma: "00:03:10",
    tme: "00:01:15",
    satisfacao: 4.6,
    taxaResolucao: 88,
    taxaAbandono: 5.8,
    atendentesAtivos: 10,
    horasPico: ["10:00-12:00", "15:00-18:00"],
    tendencia: "up" as const,
    percentualTotal: 30,
  },
  {
    id: "email",
    nome: "E-mail",
    icon: Mail,
    color: "#34A853",
    volumeHoje: 342,
    volumeSemana: 2394,
    volumeMes: 10260,
    tma: "04:30:00",
    tme: "01:45:00",
    satisfacao: 4.5,
    taxaResolucao: 85,
    taxaAbandono: 0,
    atendentesAtivos: 6,
    horasPico: ["08:00-10:00", "14:00-16:00"],
    tendencia: "stable" as const,
    percentualTotal: 12,
  },
  {
    id: "voz",
    nome: "Voz (Telefone)",
    icon: Phone,
    color: "#3B82F6",
    volumeHoje: 156,
    volumeSemana: 1092,
    volumeMes: 4680,
    tma: "00:05:30",
    tme: "00:02:10",
    satisfacao: 4.7,
    taxaResolucao: 90,
    taxaAbandono: 8.5,
    atendentesAtivos: 5,
    horasPico: ["09:00-11:00", "14:00-16:00"],
    tendencia: "down" as const,
    percentualTotal: 5,
  },
  {
    id: "messenger",
    nome: "Messenger",
    icon: MessageSquare,
    color: "#0084FF",
    volumeHoje: 178,
    volumeSemana: 1246,
    volumeMes: 5340,
    tma: "00:02:45",
    tme: "00:00:55",
    satisfacao: 4.6,
    taxaResolucao: 87,
    taxaAbandono: 4.2,
    atendentesAtivos: 4,
    horasPico: ["11:00-13:00", "16:00-19:00"],
    tendencia: "up" as const,
    percentualTotal: 6,
  },
  {
    id: "instagram",
    nome: "Instagram",
    icon: MessageSquare,
    color: "#E4405F",
    volumeHoje: 123,
    volumeSemana: 861,
    volumeMes: 3690,
    tma: "00:03:20",
    tme: "00:01:05",
    satisfacao: 4.4,
    taxaResolucao: 83,
    taxaAbandono: 6.1,
    atendentesAtivos: 3,
    horasPico: ["12:00-14:00", "18:00-21:00"],
    tendencia: "up" as const,
    percentualTotal: 4,
  },
];

// Volume por dia (últimos 7 dias) - por canal
const volumePorDia = [
  {
    dia: "Seg",
    whatsapp: 1180,
    webchat: 850,
    email: 320,
    voz: 145,
    messenger: 165,
    instagram: 115,
  },
  {
    dia: "Ter",
    whatsapp: 1320,
    webchat: 920,
    email: 350,
    voz: 160,
    messenger: 180,
    instagram: 125,
  },
  {
    dia: "Qua",
    whatsapp: 1450,
    webchat: 980,
    email: 370,
    voz: 175,
    messenger: 195,
    instagram: 135,
  },
  {
    dia: "Qui",
    whatsapp: 1280,
    webchat: 890,
    email: 340,
    voz: 155,
    messenger: 175,
    instagram: 120,
  },
  {
    dia: "Sex",
    whatsapp: 1245,
    webchat: 892,
    email: 342,
    voz: 156,
    messenger: 178,
    instagram: 123,
  },
  {
    dia: "Sáb",
    whatsapp: 780,
    webchat: 560,
    email: 210,
    voz: 95,
    messenger: 110,
    instagram: 78,
  },
  {
    dia: "Dom",
    whatsapp: 580,
    webchat: 420,
    email: 160,
    voz: 70,
    messenger: 85,
    instagram: 60,
  },
];

// Comparativo de performance - Radar Chart
const comparativoPerformance = [
  {
    metrica: "Volume",
    whatsapp: 95,
    webchat: 70,
    email: 30,
    voz: 15,
  },
  {
    metrica: "CSAT",
    whatsapp: 96,
    webchat: 92,
    email: 90,
    voz: 94,
  },
  {
    metrica: "Resolução",
    whatsapp: 92,
    webchat: 88,
    email: 85,
    voz: 90,
  },
  {
    metrica: "Velocidade",
    whatsapp: 90,
    webchat: 85,
    email: 40,
    voz: 70,
  },
  {
    metrica: "Disponib.",
    whatsapp: 100,
    webchat: 95,
    email: 80,
    voz: 75,
  },
];

// Volume por hora (heatmap do dia)
const volumePorHora = [
  { hora: "00h", volume: 12 },
  { hora: "01h", volume: 8 },
  { hora: "02h", volume: 5 },
  { hora: "03h", volume: 4 },
  { hora: "04h", volume: 6 },
  { hora: "05h", volume: 10 },
  { hora: "06h", volume: 25 },
  { hora: "07h", volume: 45 },
  { hora: "08h", volume: 78 },
  { hora: "09h", volume: 145 },
  { hora: "10h", volume: 198 },
  { hora: "11h", volume: 215 },
  { hora: "12h", volume: 188 },
  { hora: "13h", volume: 165 },
  { hora: "14h", volume: 210 },
  { hora: "15h", volume: 235 },
  { hora: "16h", volume: 220 },
  { hora: "17h", volume: 195 },
  { hora: "18h", volume: 165 },
  { hora: "19h", volume: 125 },
  { hora: "20h", volume: 95 },
  { hora: "21h", volume: 65 },
  { hora: "22h", volume: 35 },
  { hora: "23h", volume: 20 },
];

// ==================== COMPONENTES ====================

// Card de Canal
function CanalCard({ canal }: { canal: typeof canaisData[0] }) {
  const Icon = canal.icon;

  return (
    <div className="bg-white border border-border rounded-lg p-5 hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-3" style={{ backgroundColor: `${canal.color}15` }}>
            <Icon className="w-6 h-6" style={{ color: canal.color }} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground" style={{ fontSize: "var(--text-lg)" }}>
              {canal.nome}
            </h3>
            <Text variant="xs" className="text-muted-foreground">
              {canal.atendentesAtivos} atendentes ativos
            </Text>
          </div>
        </div>
        {/* Tendência */}
        {canal.tendencia === "up" && <TrendingUp className="w-5 h-5 text-green-600" />}
        {canal.tendencia === "down" && <TrendingDown className="w-5 h-5 text-red-600" />}
      </div>

      {/* Volume */}
      <div className="mb-4 pb-4 border-b border-border">
        <Text variant="xs" className="text-muted-foreground mb-2">
          Volume de atendimentos
        </Text>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Text variant="xs" className="text-muted-foreground">
              Hoje
            </Text>
            <Text variant="base" className="font-bold text-foreground">
              {canal.volumeHoje.toLocaleString()}
            </Text>
          </div>
          <div>
            <Text variant="xs" className="text-muted-foreground">
              Semana
            </Text>
            <Text variant="base" className="font-bold text-foreground">
              {canal.volumeSemana.toLocaleString()}
            </Text>
          </div>
          <div>
            <Text variant="xs" className="text-muted-foreground">
              Mês
            </Text>
            <Text variant="base" className="font-bold text-foreground">
              {canal.volumeMes.toLocaleString()}
            </Text>
          </div>
        </div>
      </div>

      {/* Métricas de Performance */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <Text variant="sm" className="text-muted-foreground">
              CSAT
            </Text>
          </div>
          <Text variant="sm" className="font-semibold text-foreground">
            {canal.satisfacao}
          </Text>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <Text variant="sm" className="text-muted-foreground">
              TMA
            </Text>
          </div>
          <Text variant="sm" className="font-semibold text-foreground">
            {canal.tma}
          </Text>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <Text variant="sm" className="text-muted-foreground">
              Resolução
            </Text>
          </div>
          <Text variant="sm" className="font-semibold text-foreground">
            {canal.taxaResolucao}%
          </Text>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <Text variant="sm" className="text-muted-foreground">
              Abandono
            </Text>
          </div>
          <Text variant="sm" className="font-semibold text-foreground">
            {canal.taxaAbandono}%
          </Text>
        </div>
      </div>

      {/* Horários de Pico */}
      <div className="mt-4 pt-4 border-t border-border">
        <Text variant="xs" className="text-muted-foreground mb-2">
          Horários de pico
        </Text>
        <div className="flex flex-wrap gap-1.5">
          {canal.horasPico.map((horario, index) => (
            <span
              key={index}
              className="text-[10px] px-2 py-1 rounded-full"
              style={{
                backgroundColor: `${canal.color}20`,
                color: canal.color,
              }}
            >
              {horario}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Resumo Geral
function ResumoGeralCanais() {
  const totalVolume = canaisData.reduce((acc, canal) => acc + canal.volumeHoje, 0);
  const satisfacaoMedia = (
    canaisData.reduce((acc, canal) => acc + canal.satisfacao, 0) / canaisData.length
  ).toFixed(1);
  const totalAtendentes = canaisData.reduce((acc, canal) => acc + canal.atendentesAtivos, 0);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="rounded-lg p-2 bg-blue-600">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-foreground" style={{ fontSize: "var(--text-xl)" }}>
            Resumo Geral - Todos os Canais
          </h2>
          <Text variant="sm" className="text-muted-foreground">
            Visão consolidada de performance
          </Text>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <Text variant="xs" className="text-muted-foreground">
              Volume Total Hoje
            </Text>
          </div>
          <div className="font-bold text-foreground" style={{ fontSize: "var(--text-2xl)" }}>
            {totalVolume.toLocaleString()}
          </div>
          <Text variant="xs" className="text-green-600">
            Todos os canais
          </Text>
        </div>

        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <Text variant="xs" className="text-muted-foreground">
              CSAT Médio
            </Text>
          </div>
          <div className="font-bold text-foreground" style={{ fontSize: "var(--text-2xl)" }}>
            {satisfacaoMedia}
          </div>
          <Text variant="xs" className="text-green-600">
            Acima da meta
          </Text>
        </div>

        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-600" />
            <Text variant="xs" className="text-muted-foreground">
              Atendentes Ativos
            </Text>
          </div>
          <div className="font-bold text-foreground" style={{ fontSize: "var(--text-2xl)" }}>
            {totalAtendentes}
          </div>
          <Text variant="xs" className="text-muted-foreground">
            Em {canaisData.length} canais
          </Text>
        </div>

        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-600" />
            <Text variant="xs" className="text-muted-foreground">
              Canal Principal
            </Text>
          </div>
          <div className="font-bold text-foreground" style={{ fontSize: "var(--text-lg)" }}>
            {canaisData[0].nome}
          </div>
          <Text variant="xs" className="text-muted-foreground">
            {canaisData[0].percentualTotal}% do volume
          </Text>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================

export function GerenciamentoCanais() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState<"dia" | "semana" | "mes">("semana");

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <ResumoGeralCanais />

      {/* Cards de Canais */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground" style={{ fontSize: "var(--text-lg)" }}>
              Performance por Canal
            </h3>
            <Text variant="sm" className="text-muted-foreground">
              Métricas detalhadas de cada canal de atendimento
            </Text>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {canaisData.map((canal) => (
            <CanalCard key={canal.id} canal={canal} />
          ))}
        </div>
      </section>

      {/* Gráficos Comparativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume por Dia */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4" style={{ fontSize: "var(--text-lg)" }}>
            Volume por Canal (Últimos 7 Dias)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={volumePorDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="whatsapp"
                stackId="1"
                stroke="#25D366"
                fill="#25D366"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="webchat"
                stackId="1"
                stroke="#6B7280"
                fill="#6B7280"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="email"
                stackId="1"
                stroke="#34A853"
                fill="#34A853"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="voz"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Comparativo de Performance - Radar */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4" style={{ fontSize: "var(--text-lg)" }}>
            Comparativo de Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={comparativoPerformance}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metrica" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="WhatsApp"
                dataKey="whatsapp"
                stroke="#25D366"
                fill="#25D366"
                fillOpacity={0.3}
              />
              <Radar
                name="WebChat"
                dataKey="webchat"
                stroke="#6B7280"
                fill="#6B7280"
                fillOpacity={0.3}
              />
              <Radar name="E-mail" dataKey="email" stroke="#34A853" fill="#34A853" fillOpacity={0.3} />
              <Radar name="Voz" dataKey="voz" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap de Volume por Hora */}
      <div className="bg-white border border-border rounded-lg p-5">
        <h3 className="font-semibold text-foreground mb-4" style={{ fontSize: "var(--text-lg)" }}>
          Distribuição de Volume por Hora (Hoje)
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={volumePorHora}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hora" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
              {volumePorHora.map((entry, index) => {
                // Colorir baseado no volume
                let color = "#22C55E"; // verde
                if (entry.volume > 200) color = "#EF4444"; // vermelho
                else if (entry.volume > 150) color = "#F59E0B"; // laranja
                else if (entry.volume > 100) color = "#EAB308"; // amarelo

                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <Text variant="xs" className="text-muted-foreground">
              Baixo (&lt;100)
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <Text variant="xs" className="text-muted-foreground">
              Médio (100-150)
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <Text variant="xs" className="text-muted-foreground">
              Alto (150-200)
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <Text variant="xs" className="text-muted-foreground">
              Crítico (&gt;200)
            </Text>
          </div>
        </div>
      </div>

      {/* Distribuição de Volume */}
      <div className="bg-white border border-border rounded-lg p-5">
        <h3 className="font-semibold text-foreground mb-4" style={{ fontSize: "var(--text-lg)" }}>
          Distribuição de Volume por Canal (Mês Atual)
        </h3>
        <div className="space-y-3">
          {canaisData.map((canal) => {
            const Icon = canal.icon;
            return (
              <div key={canal.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color: canal.color }} />
                    <Text variant="sm" className="text-foreground">
                      {canal.nome}
                    </Text>
                  </div>
                  <div className="flex items-center gap-3">
                    <Text variant="sm" className="font-semibold text-foreground">
                      {canal.volumeMes.toLocaleString()}
                    </Text>
                    <Text variant="sm" className="text-muted-foreground">
                      {canal.percentualTotal}%
                    </Text>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${canal.percentualTotal}%`,
                      backgroundColor: canal.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
