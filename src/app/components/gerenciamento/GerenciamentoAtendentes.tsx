import {
  Users,
  Star,
  Clock,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Zap,
  Search,
  Filter,
  Download,
  UserPlus,
  MoreVertical,
  Eye,
  UserCheck,
  UserX,
  Calendar,
  BarChart3,
  Phone,
  Mail,
  ThumbsUp,
  AlertCircle,
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
import { Progress } from "../ui/progress";
import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ==================== DADOS MOCK ====================

// Resumo da equipe
const resumoEquipe = {
  totalAtendentes: 24,
  online: 12,
  ausente: 6,
  offline: 6,
  capacidadeTotal: 96, // 24 atendentes * 4 slots
  capacidadeUsada: 58,
  atendimentosAtivos: 58,
  tempoMedioAtendimento: "00:02:45",
  satisfacaoMedia: 4.6,
};

// Top performers
const topPerformers = [
  {
    posicao: 1,
    nome: "Maria Silva",
    avatar: "MS",
    atendimentosHoje: 32,
    satisfacao: 4.9,
    tmr: "1:45",
    taxaResolucao: 95,
    medalha: "ouro",
  },
  {
    posicao: 2,
    nome: "João Santos",
    avatar: "JS",
    atendimentosHoje: 28,
    satisfacao: 4.8,
    tmr: "2:10",
    taxaResolucao: 92,
    medalha: "prata",
  },
  {
    posicao: 3,
    nome: "Ana Costa",
    avatar: "AC",
    atendimentosHoje: 25,
    satisfacao: 4.7,
    tmr: "2:30",
    taxaResolucao: 90,
    medalha: "bronze",
  },
];

// Atendentes completo
const atendentesData = [
  {
    id: 1,
    nome: "Maria Silva",
    avatar: "MS",
    email: "maria.silva@empresa.com",
    equipe: "Suporte Técnico",
    cargo: "Atendente Sênior",
    status: "online",
    statusColor: "#22C55E",
    statusLabel: "Online",
    atendimentosAtivos: 4,
    capacidade: 4,
    atendimentosHoje: 32,
    atendimentosSemana: 156,
    atendimentosMes: 628,
    tmr: "1:45",
    tme: "0:35",
    satisfacao: 4.9,
    taxaResolucao: 95,
    taxaTransferencia: 3,
    primeiroAtendimento: 92,
    horasLogadas: "7h 45min",
    pausas: "45min",
    canaisPrincipais: ["Chat", "WhatsApp"],
    ultimoAtendimento: "Há 2 min",
    metaMensal: 600,
    tendencia: "up" as const,
  },
  {
    id: 2,
    nome: "João Santos",
    avatar: "JS",
    email: "joao.santos@empresa.com",
    equipe: "Vendas",
    cargo: "Atendente Pleno",
    status: "online",
    statusColor: "#22C55E",
    statusLabel: "Online",
    atendimentosAtivos: 3,
    capacidade: 4,
    atendimentosHoje: 28,
    atendimentosSemana: 142,
    atendimentosMes: 580,
    tmr: "2:10",
    tme: "0:42",
    satisfacao: 4.8,
    taxaResolucao: 92,
    taxaTransferencia: 5,
    primeiroAtendimento: 88,
    horasLogadas: "8h 15min",
    pausas: "30min",
    canaisPrincipais: ["Chat", "Voz"],
    ultimoAtendimento: "Há 5 min",
    metaMensal: 550,
    tendencia: "up" as const,
  },
  {
    id: 3,
    nome: "Ana Costa",
    avatar: "AC",
    email: "ana.costa@empresa.com",
    equipe: "Suporte Técnico",
    cargo: "Atendente Pleno",
    status: "online",
    statusColor: "#22C55E",
    statusLabel: "Online",
    atendimentosAtivos: 4,
    capacidade: 4,
    atendimentosHoje: 25,
    atendimentosSemana: 128,
    atendimentosMes: 512,
    tmr: "2:30",
    tme: "0:50",
    satisfacao: 4.7,
    taxaResolucao: 90,
    taxaTransferencia: 6,
    primeiroAtendimento: 85,
    horasLogadas: "7h 30min",
    pausas: "1h 15min",
    canaisPrincipais: ["Email", "Chat"],
    ultimoAtendimento: "Há 1 min",
    metaMensal: 500,
    tendencia: "up" as const,
  },
  {
    id: 4,
    nome: "Carlos Oliveira",
    avatar: "CO",
    email: "carlos.oliveira@empresa.com",
    equipe: "Vendas",
    cargo: "Atendente Júnior",
    status: "ausente",
    statusColor: "#EAB308",
    statusLabel: "Ausente - Pausa",
    atendimentosAtivos: 0,
    capacidade: 4,
    atendimentosHoje: 18,
    atendimentosSemana: 95,
    atendimentosMes: 380,
    tmr: "3:15",
    tme: "1:05",
    satisfacao: 4.5,
    taxaResolucao: 82,
    taxaTransferencia: 12,
    primeiroAtendimento: 75,
    horasLogadas: "6h 20min",
    pausas: "2h 10min",
    canaisPrincipais: ["Chat", "WhatsApp"],
    ultimoAtendimento: "Há 25 min",
    metaMensal: 400,
    tendencia: "stable" as const,
  },
  {
    id: 5,
    nome: "Fernanda Lima",
    avatar: "FL",
    email: "fernanda.lima@empresa.com",
    equipe: "Suporte Técnico",
    cargo: "Atendente Sênior",
    status: "online",
    statusColor: "#22C55E",
    statusLabel: "Online",
    atendimentosAtivos: 4,
    capacidade: 4,
    atendimentosHoje: 30,
    atendimentosSemana: 148,
    atendimentosMes: 595,
    tmr: "1:55",
    tme: "0:38",
    satisfacao: 4.8,
    taxaResolucao: 93,
    taxaTransferencia: 4,
    primeiroAtendimento: 90,
    horasLogadas: "8h 05min",
    pausas: "40min",
    canaisPrincipais: ["Voz", "Chat"],
    ultimoAtendimento: "Agora",
    metaMensal: 600,
    tendencia: "up" as const,
  },
  {
    id: 6,
    nome: "Pedro Santos",
    avatar: "PS",
    email: "pedro.santos@empresa.com",
    equipe: "Vendas",
    cargo: "Atendente Pleno",
    status: "online",
    statusColor: "#22C55E",
    statusLabel: "Online",
    atendimentosAtivos: 2,
    capacidade: 4,
    atendimentosHoje: 22,
    atendimentosSemana: 115,
    atendimentosMes: 465,
    tmr: "2:45",
    tme: "0:55",
    satisfacao: 4.6,
    taxaResolucao: 87,
    taxaTransferencia: 8,
    primeiroAtendimento: 80,
    horasLogadas: "7h 50min",
    pausas: "55min",
    canaisPrincipais: ["Chat", "Email"],
    ultimoAtendimento: "Há 8 min",
    metaMensal: 500,
    tendencia: "down" as const,
  },
  {
    id: 7,
    nome: "Juliana Mendes",
    avatar: "JM",
    email: "juliana.mendes@empresa.com",
    equipe: "Suporte Técnico",
    cargo: "Atendente Júnior",
    status: "offline",
    statusColor: "#EF4444",
    statusLabel: "Offline",
    atendimentosAtivos: 0,
    capacidade: 4,
    atendimentosHoje: 0,
    atendimentosSemana: 78,
    atendimentosMes: 312,
    tmr: "3:30",
    tme: "1:15",
    satisfacao: 4.3,
    taxaResolucao: 78,
    taxaTransferencia: 15,
    primeiroAtendimento: 70,
    horasLogadas: "0h",
    pausas: "0h",
    canaisPrincipais: ["Chat", "Email"],
    ultimoAtendimento: "Ontem",
    metaMensal: 350,
    tendencia: "down" as const,
  },
  {
    id: 8,
    nome: "Roberto Costa",
    avatar: "RC",
    email: "roberto.costa@empresa.com",
    equipe: "Vendas",
    cargo: "Atendente Sênior",
    status: "online",
    statusColor: "#22C55E",
    statusLabel: "Online",
    atendimentosAtivos: 3,
    capacidade: 4,
    atendimentosHoje: 27,
    atendimentosSemana: 138,
    atendimentosMes: 558,
    tmr: "2:05",
    tme: "0:45",
    satisfacao: 4.7,
    taxaResolucao: 91,
    taxaTransferencia: 5,
    primeiroAtendimento: 87,
    horasLogadas: "7h 55min",
    pausas: "50min",
    canaisPrincipais: ["Voz", "WhatsApp"],
    ultimoAtendimento: "Há 3 min",
    metaMensal: 550,
    tendencia: "up" as const,
  },
];

// Performance por equipe
const performancePorEquipe = [
  { equipe: "Suporte Técnico", atendentes: 12, satisfacao: 4.7, tmr: "2:15", volume: 1850 },
  { equipe: "Vendas", atendentes: 8, satisfacao: 4.6, tmr: "2:30", volume: 1240 },
  { equipe: "Retenção", atendentes: 4, satisfacao: 4.8, tmr: "3:45", volume: 580 },
];

// Tendência de performance (última semana)
const tendenciaPerformance = [
  { dia: "Seg", atendimentos: 145, satisfacao: 4.5 },
  { dia: "Ter", atendimentos: 178, satisfacao: 4.6 },
  { dia: "Qua", atendimentos: 190, satisfacao: 4.7 },
  { dia: "Qui", atendimentos: 165, satisfacao: 4.6 },
  { dia: "Sex", atendimentos: 142, satisfacao: 4.5 },
  { dia: "Sáb", atendimentos: 89, satisfacao: 4.7 },
  { dia: "Dom", atendimentos: 67, satisfacao: 4.8 },
];

// ==================== COMPONENTES ====================

// Card de Resumo da Equipe
function ResumoEquipeCard() {
  const capacidadePerc = (resumoEquipe.capacidadeUsada / resumoEquipe.capacidadeTotal) * 100;

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2 bg-green-600">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-foreground" style={{ fontSize: "var(--text-xl)" }}>
              Resumo da Equipe
            </h2>
            <Text variant="sm" className="text-muted-foreground">
              {resumoEquipe.totalAtendentes} atendentes no total
            </Text>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <Text variant="xs" className="text-muted-foreground">
              Online
            </Text>
          </div>
          <div className="font-bold text-foreground" style={{ fontSize: "var(--text-xl)" }}>
            {resumoEquipe.online}
          </div>
          <Text variant="xs" className="text-green-600">
            {Math.round((resumoEquipe.online / resumoEquipe.totalAtendentes) * 100)}% da equipe
          </Text>
        </div>

        <div className="bg-white rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <Text variant="xs" className="text-muted-foreground">
              Ausente
            </Text>
          </div>
          <div className="font-bold text-foreground" style={{ fontSize: "var(--text-xl)" }}>
            {resumoEquipe.ausente}
          </div>
          <Text variant="xs" className="text-yellow-600">
            {Math.round((resumoEquipe.ausente / resumoEquipe.totalAtendentes) * 100)}% da equipe
          </Text>
        </div>

        <div className="bg-white rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <Text variant="xs" className="text-muted-foreground">
              Offline
            </Text>
          </div>
          <div className="font-bold text-foreground" style={{ fontSize: "var(--text-xl)" }}>
            {resumoEquipe.offline}
          </div>
          <Text variant="xs" className="text-red-600">
            {Math.round((resumoEquipe.offline / resumoEquipe.totalAtendentes) * 100)}% da equipe
          </Text>
        </div>
      </div>

      {/* Métricas de Performance */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Text variant="sm" className="text-muted-foreground">
              Capacidade Utilizada
            </Text>
            <Text variant="sm" className="font-semibold text-foreground">
              {capacidadePerc.toFixed(0)}%
            </Text>
          </div>
          <Progress value={capacidadePerc} className="h-2" />
          <Text variant="xs" className="text-muted-foreground mt-1.5">
            {resumoEquipe.capacidadeUsada} de {resumoEquipe.capacidadeTotal} slots
          </Text>
        </div>

        <div className="bg-white rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <Text variant="sm" className="text-muted-foreground">
              CSAT Médio
            </Text>
          </div>
          <div className="font-bold text-foreground" style={{ fontSize: "var(--text-xl)" }}>
            {resumoEquipe.satisfacaoMedia}
          </div>
          <Text variant="xs" className="text-green-600">
            Acima da meta (4.5)
          </Text>
        </div>
      </div>

      {/* TMR Médio */}
      <div className="bg-white rounded-lg p-3 border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <Text variant="sm" className="text-muted-foreground">
              Tempo Médio de Atendimento
            </Text>
          </div>
          <Text variant="base" className="font-semibold text-foreground">
            {resumoEquipe.tempoMedioAtendimento}
          </Text>
        </div>
      </div>
    </div>
  );
}

// Pódio de Top Performers
function TopPerformersCard() {
  const getMedalColor = (medalha: string) => {
    switch (medalha) {
      case "ouro":
        return "from-yellow-400 to-yellow-600";
      case "prata":
        return "from-gray-300 to-gray-500";
      case "bronze":
        return "from-orange-400 to-orange-600";
      default:
        return "from-gray-300 to-gray-500";
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="rounded-lg p-2 bg-purple-600">
          <Award className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-foreground" style={{ fontSize: "var(--text-xl)" }}>
            Top Performers Hoje
          </h2>
          <Text variant="sm" className="text-muted-foreground">
            Ranking por volume e qualidade
          </Text>
        </div>
      </div>

      <div className="space-y-4">
        {topPerformers.map((performer) => (
          <div
            key={performer.posicao}
            className="bg-white rounded-lg p-4 border-2 border-purple-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              {/* Posição com medalha */}
              <div className="flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${getMedalColor(
                    performer.medalha
                  )} flex items-center justify-center text-white font-bold shadow-lg`}
                  style={{ fontSize: "var(--text-lg)" }}
                >
                  {performer.posicao}º
                </div>
              </div>

              {/* Info do atendente */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Text variant="xs" className="font-semibold text-purple-600">
                      {performer.avatar}
                    </Text>
                  </div>
                  <div>
                    <Text variant="sm" className="font-semibold text-foreground">
                      {performer.nome}
                    </Text>
                  </div>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-4 gap-3 mt-2">
                  <div>
                    <Text variant="xs" className="text-muted-foreground">
                      Atendimentos
                    </Text>
                    <Text variant="sm" className="font-semibold text-foreground">
                      {performer.atendimentosHoje}
                    </Text>
                  </div>
                  <div>
                    <Text variant="xs" className="text-muted-foreground">
                      CSAT
                    </Text>
                    <Text variant="sm" className="font-semibold text-foreground">
                      {performer.satisfacao}
                    </Text>
                  </div>
                  <div>
                    <Text variant="xs" className="text-muted-foreground">
                      TMR
                    </Text>
                    <Text variant="sm" className="font-semibold text-foreground">
                      {performer.tmr}
                    </Text>
                  </div>
                  <div>
                    <Text variant="xs" className="text-muted-foreground">
                      Resolução
                    </Text>
                    <Text variant="sm" className="font-semibold text-foreground">
                      {performer.taxaResolucao}%
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Card de Atendente Individual
function AtendenteCard({ atendente }: { atendente: typeof atendentesData[0] }) {
  const capacidadePerc = (atendente.atendimentosAtivos / atendente.capacidade) * 100;
  const metaPerc = (atendente.atendimentosMes / atendente.metaMensal) * 100;

  return (
    <div className="bg-white border border-border rounded-lg p-5 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
              <Text variant="base" className="font-semibold text-brand-primary">
                {atendente.avatar}
              </Text>
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
              style={{ backgroundColor: atendente.statusColor }}
            />
          </div>
          <div>
            <Text variant="base" className="font-semibold text-foreground">
              {atendente.nome}
            </Text>
            <Text variant="xs" className="text-muted-foreground">
              {atendente.cargo} • {atendente.equipe}
            </Text>
          </div>
        </div>

        {/* Dropdown de ações */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="w-4 h-4" />
              Ver perfil completo
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BarChart3 className="w-4 h-4" />
              Ver histórico
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calendar className="w-4 h-4" />
              Ver agenda
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserCheck className="w-4 h-4" />
              Atribuir atendimento
            </DropdownMenuItem>
            {atendente.status === "online" && (
              <DropdownMenuItem className="text-red-600">
                <UserX className="w-4 h-4" />
                Desconectar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status atual */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <Text variant="xs" className="text-muted-foreground">
            Status
          </Text>
          <span
            className="text-[11px] px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: `${atendente.statusColor}20`,
              color: atendente.statusColor,
            }}
          >
            {atendente.statusLabel}
          </span>
        </div>
        <div className="flex items-center justify-between mb-1.5">
          <Text variant="xs" className="text-muted-foreground">
            Capacidade
          </Text>
          <Text variant="xs" className="font-semibold text-foreground">
            {atendente.atendimentosAtivos}/{atendente.capacidade}
          </Text>
        </div>
        <Progress value={capacidadePerc} className="h-2" />
      </div>

      {/* Métricas do dia */}
      <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-border">
        <div>
          <Text variant="xs" className="text-muted-foreground mb-0.5">
            Hoje
          </Text>
          <Text variant="sm" className="font-semibold text-foreground">
            {atendente.atendimentosHoje}
          </Text>
        </div>
        <div>
          <Text variant="xs" className="text-muted-foreground mb-0.5">
            Semana
          </Text>
          <Text variant="sm" className="font-semibold text-foreground">
            {atendente.atendimentosSemana}
          </Text>
        </div>
        <div>
          <Text variant="xs" className="text-muted-foreground mb-0.5">
            Mês
          </Text>
          <Text variant="sm" className="font-semibold text-foreground">
            {atendente.atendimentosMes}
          </Text>
        </div>
      </div>

      {/* Performance */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-yellow-500" />
            <Text variant="xs" className="text-muted-foreground">
              CSAT
            </Text>
          </div>
          <Text variant="sm" className="font-semibold text-foreground">
            {atendente.satisfacao}
          </Text>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <Text variant="xs" className="text-muted-foreground">
              TMR
            </Text>
          </div>
          <Text variant="sm" className="font-semibold text-foreground">
            {atendente.tmr}
          </Text>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-green-500" />
            <Text variant="xs" className="text-muted-foreground">
              Resolução
            </Text>
          </div>
          <Text variant="sm" className="font-semibold text-foreground">
            {atendente.taxaResolucao}%
          </Text>
        </div>
      </div>

      {/* Meta mensal */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-1.5">
          <Text variant="xs" className="text-muted-foreground">
            Meta mensal
          </Text>
          <Text variant="xs" className="font-semibold text-foreground">
            {metaPerc.toFixed(0)}%
          </Text>
        </div>
        <Progress value={metaPerc} className="h-2" />
        <Text variant="xs" className="text-muted-foreground mt-1">
          {atendente.atendimentosMes} de {atendente.metaMensal}
        </Text>
      </div>
    </div>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================

export function GerenciamentoAtendentes() {
  const [filtroEquipe, setFiltroEquipe] = useState("todas");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [busca, setBusca] = useState("");
  const [visualizacao, setVisualizacao] = useState<"grid" | "lista">("grid");

  // Filtrar atendentes
  const atendentesFiltrados = atendentesData.filter((atendente) => {
    const matchBusca =
      busca === "" ||
      atendente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      atendente.email.toLowerCase().includes(busca.toLowerCase());

    const matchEquipe = filtroEquipe === "todas" || atendente.equipe === filtroEquipe;

    const matchStatus = filtroStatus === "todos" || atendente.status === filtroStatus;

    return matchBusca && matchEquipe && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header em 2 colunas: Resumo + Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResumoEquipeCard />
        <TopPerformersCard />
      </div>

      {/* Performance por Equipe */}
      <div className="bg-white border border-border rounded-lg p-5">
        <h3 className="font-semibold text-foreground mb-4" style={{ fontSize: "var(--text-lg)" }}>
          Performance por Equipe
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {performancePorEquipe.map((equipe) => (
            <div key={equipe.equipe} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <Text variant="sm" className="font-semibold text-foreground">
                  {equipe.equipe}
                </Text>
                <Text variant="xs" className="text-muted-foreground">
                  {equipe.atendentes} atendentes
                </Text>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Text variant="xs" className="text-muted-foreground">
                    CSAT
                  </Text>
                  <Text variant="sm" className="font-semibold text-foreground">
                    {equipe.satisfacao}
                  </Text>
                </div>
                <div>
                  <Text variant="xs" className="text-muted-foreground">
                    TMR
                  </Text>
                  <Text variant="sm" className="font-semibold text-foreground">
                    {equipe.tmr}
                  </Text>
                </div>
                <div>
                  <Text variant="xs" className="text-muted-foreground">
                    Volume
                  </Text>
                  <Text variant="sm" className="font-semibold text-foreground">
                    {equipe.volume}
                  </Text>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico de Tendência */}
      <div className="bg-white border border-border rounded-lg p-5">
        <h3 className="font-semibold text-foreground mb-4" style={{ fontSize: "var(--text-lg)" }}>
          Tendência de Performance (Última Semana)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={tendenciaPerformance}>
            <defs>
              <linearGradient id="colorAtendimentos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00BCF2" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00BCF2" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSatisfacao" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dia" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" domain={[4, 5]} />
            <Tooltip />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="atendimentos"
              stroke="#00BCF2"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAtendimentos)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="satisfacao"
              stroke="#22C55E"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSatisfacao)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Lista de Atendentes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground" style={{ fontSize: "var(--text-lg)" }}>
              Todos os Atendentes
            </h3>
            <Text variant="sm" className="text-muted-foreground">
              {atendentesFiltrados.length} atendente(s) encontrado(s)
            </Text>
          </div>
          <Button variant="outline" size="sm">
            <UserPlus className="w-4 h-4" />
            Adicionar atendente
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              className="pl-10"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <Select value={filtroEquipe} onValueChange={setFiltroEquipe}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas as equipes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as equipes</SelectItem>
              <SelectItem value="Suporte Técnico">Suporte Técnico</SelectItem>
              <SelectItem value="Vendas">Vendas</SelectItem>
              <SelectItem value="Retenção">Retenção</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="ausente">Ausente</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid de Atendentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {atendentesFiltrados.map((atendente) => (
            <AtendenteCard key={atendente.id} atendente={atendente} />
          ))}
        </div>

        {/* Empty state */}
        {atendentesFiltrados.length === 0 && (
          <div className="bg-gray-50 border border-border rounded-lg p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2" style={{ fontSize: "var(--text-lg)" }}>
              Nenhum atendente encontrado
            </h3>
            <Text variant="sm" className="text-muted-foreground">
              Tente ajustar os filtros ou buscar por outro termo
            </Text>
          </div>
        )}
      </section>
    </div>
  );
}
