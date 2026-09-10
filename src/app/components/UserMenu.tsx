import {
  User,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Type,
  Clock,
  Activity,
  CircleAlert,
  Wifi,
  LogOut as LogOutIcon,
  Settings,
  Bell,
  UserPlus,
  Coffee,
  X,
  Check,
  UserCircle,
  BarChart3,
  LayoutDashboard,
  PieChart,
  TrendingUp,
  ArrowLeft,
  FileText,
  Phone,
  Circle,
  CheckCircle2,
  Hash,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { usePreferences } from "../contexts/PreferencesContext";
import { usePermissions } from "../contexts/PermissionsContext";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Text } from "./ui/text";
import avatarPlaceholder from "../imports/avatar-placeholder.png";

// --- Types ---

type Theme = "light" | "dark" | "system";
type FontSize = "small" | "medium" | "large";

type AgentStatus =
  | "disponivel"
  | "pausa"
  | "almoco"
  | "ausente"
  | "offline";

type MenuScreen =
  | "main"
  | "solicitar-pausa"
  | "sumarios-tempo"
  | "monitoramento-internet"
  | "tema"
  | "tamanho-fonte";

interface StatusOption {
  value: AgentStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

interface UserMenuWrapperProps {
  agentStatus: AgentStatus;
  setAgentStatus: (status: AgentStatus) => void;
  statusOptions: StatusOption[];
  currentStatus: StatusOption;
  theme: Theme;
  fontSize: FontSize;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
  handleNavigation: (path: string) => void;
}

interface UserMenuContentProps {
  theme: Theme;
  fontSize: FontSize;
  onThemeChange: (theme: Theme) => void;
  onFontSizeChange: (size: FontSize) => void;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

// --- Sub-components ---

interface MenuHeaderProps {
  title: string;
  onBack: () => void;
}

function MenuHeader({ title, onBack }: MenuHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
      <button
        onClick={onBack}
        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <Text as="h3" variant="sm" className="font-semibold">
        {title}
      </Text>
    </div>
  );
}

interface MenuItemProps {
  icon?: React.ElementType;
  label: string;
  onClick?: () => void;
  hasArrow?: boolean;
  isDestructive?: boolean;
  rightContent?: React.ReactNode;
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  hasArrow = false,
  isDestructive = false,
  rightContent,
}: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-muted transition-colors ${
        isDestructive ? "text-red-600 hover:bg-red-50" : ""
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <Text as="span" variant="sm" className="flex-1 text-left">
        {label}
      </Text>
      {rightContent}
      {hasArrow && (
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );
}

interface SectionHeaderProps {
  title: string;
}

function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="px-3 py-1.5">
      <Text
        as="span"
        variant="xs"
        className="font-semibold text-muted-foreground uppercase tracking-wide"
      >
        {title}
      </Text>
    </div>
  );
}

// --- UserMenu Content ---

function UserMenuContent({
  theme,
  fontSize,
  onThemeChange,
  onFontSizeChange,
  onNavigate,
  onLogout,
}: UserMenuContentProps) {
  const [currentScreen, setCurrentScreen] =
    useState<MenuScreen>("main");

  // Estado para controlar status do atendente e timer
  const [statusType, setStatusType] = useState<
    "atendimento" | "pausa"
  >("atendimento");
  const [pauseType, setPauseType] = useState<string>("");
  const [timerSeconds, setTimerSeconds] = useState(335); // 00:05:35 em segundos

  // Estados para monitoramento de rede (sempre declarados, independente da tela)
  const [networkStatus, setNetworkStatus] = useState<
    "normal" | "slow"
  >("normal");
  const [dataCounter, setDataCounter] = useState(0); // Contador para IDs únicos
  const [latencyData, setLatencyData] = useState(() => {
    const baseLatency = 150;
    const variance = 100;
    return Array.from({ length: 7 }, (_, i) => ({
      id: `point-0-${i}`,
      time: `${i * 5}s`,
      latency: Math.max(
        50,
        baseLatency + Math.random() * variance - variance / 2,
      ),
    }));
  });

  // Estado para status expansíveis no relatório de desempenho
  const [expandedStatus, setExpandedStatus] = useState<string | null>(null);

  // Timer que conta automaticamente
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Simular mudanças de status em tempo real (monitoramento de rede)
  useEffect(() => {
    const interval = setInterval(() => {
      const newStatus: "normal" | "slow" =
        Math.random() > 0.7 ? "slow" : "normal";
      setNetworkStatus(newStatus);

      setDataCounter((prev) => {
        const newCounter = prev + 1;
        const baseLatency = newStatus === "normal" ? 150 : 350;
        const variance = newStatus === "normal" ? 100 : 150;

        setLatencyData(
          Array.from({ length: 7 }, (_, i) => ({
            id: `point-${newCounter}-${i}`,
            time: `${i * 5}s`,
            latency: Math.max(
              50,
              baseLatency +
                Math.random() * variance -
                variance / 2,
            ),
          })),
        );

        return newCounter;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Formata segundos para HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Função para solicitar pausa
  const handlePauseRequest = (pauseName: string) => {
    setStatusType("pausa");
    setPauseType(pauseName);
    setTimerSeconds(0); // Reset timer
    setCurrentScreen("main");
  };

  // Função para cancelar pausa e voltar ao atendimento
  const handleCancelPause = () => {
    setStatusType("atendimento");
    setPauseType("");
    setTimerSeconds(0); // Reset timer
  };

  const handleBack = () => {
    setCurrentScreen("main");
  };

  // --- Main Screen ---
  if (currentScreen === "main") {
    return (
      <>
        <div className="w-80">
          {/* Header - Informações do Atendente */}
          <div className="px-3 py-2.5 border-b border-border">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <Text
                  as="p"
                  variant="sm"
                  className="text-foreground truncate"
                >
                  <span className="font-semibold">
                    Maria Silva
                  </span>
                  <span className="font-normal">
                    {" "}
                    | @maria.silva
                  </span>
                </Text>
                <Text
                  as="p"
                  variant="xs"
                  className="text-muted-foreground truncate"
                >
                  maria.silva@empresa.com
                </Text>

                {/* Status badge com timer */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded ${
                      statusType === "atendimento"
                        ? "bg-primary/15 text-primary"
                        : "bg-warning/15 text-warning"
                    }`}
                  >
                    <Text
                      as="span"
                      variant="xs"
                      className="font-medium"
                    >
                      {statusType === "atendimento"
                        ? "Em atendimento"
                        : pauseType}
                    </Text>
                    <Text
                      as="span"
                      variant="xs"
                      className="font-mono"
                    >
                      • {formatTime(timerSeconds)}
                    </Text>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Seção STATUS */}
          <div className="p-1">
            <SectionHeader title="Status" />
            {statusType === "atendimento" ? (
              <MenuItem
                icon={Coffee}
                label="Solicitar pausa"
                hasArrow
                onClick={() =>
                  setCurrentScreen("solicitar-pausa")
                }
              />
            ) : (
              <MenuItem
                icon={X}
                label="Cancelar pausa"
                onClick={handleCancelPause}
              />
            )}
          </div>

          <div className="h-px bg-border" />

          {/* Seção PERFIL */}
          <div className="p-1">
            <SectionHeader title="Perfil" />
            <MenuItem
              icon={UserCircle}
              label="Minha Conta"
              onClick={() => onNavigate("/perfil")}
            />
            <MenuItem
              icon={BarChart3}
              label="Meu Relatório e Desempenho"
              hasArrow
              onClick={() => setCurrentScreen("sumarios-tempo")}
            />
            <MenuItem
              icon={Activity}
              label="Meu Monitoramento de Internet"
              hasArrow
              onClick={() =>
                setCurrentScreen("monitoramento-internet")
              }
            />
          </div>

          <div className="h-px bg-border" />

          {/* Seção SISTEMA */}
          <div className="p-1">
            <SectionHeader title="Sistema" />
            <MenuItem
              icon={Settings}
              label="Configurações"
              onClick={() => onNavigate("/configuracoes")}
            />
            <MenuItem
              icon={LayoutDashboard}
              label="Gerenciamento"
              onClick={() => onNavigate("/management/cases")}
            />
            <MenuItem
              icon={PieChart}
              label="Analítico"
              onClick={() => onNavigate("/analytics")}
            />
          </div>

          <div className="h-px bg-border" />

          {/* Seção APARÊNCIA */}
          <div className="p-1">
            <SectionHeader title="Aparência" />
            <MenuItem
              icon={theme === "light" ? Sun : Moon}
              label="Tema"
              hasArrow
              onClick={() => setCurrentScreen("tema")}
            />
            <MenuItem
              icon={Type}
              label="Tamanho de Fonte"
              hasArrow
              onClick={() => setCurrentScreen("tamanho-fonte")}
            />
          </div>

          <div className="h-px bg-border" />

          {/* Sair */}
          <div className="p-1">
            <MenuItem
              icon={LogOutIcon}
              label="Sair"
              isDestructive
              onClick={onLogout}
            />
          </div>
        </div>
      </>
    );
  }

  // --- Solicitar Pausa Screen ---
  if (currentScreen === "solicitar-pausa") {
    return (
      <>
        <div className="w-80">
          <MenuHeader
            title="Solicitar pausa"
            onBack={handleBack}
          />
          <div className="p-1">
            <MenuItem
              label="Pausa Almoço"
              onClick={() => handlePauseRequest("Pausa Almoço")}
            />
            <MenuItem
              label="Pausa Café"
              onClick={() => handlePauseRequest("Pausa Café")}
            />
            <MenuItem
              label="Pausa para Reunião"
              onClick={() =>
                handlePauseRequest("Pausa Reunião")
              }
            />
            <MenuItem
              label="Alinhamento com Time"
              onClick={() => handlePauseRequest("Alinhamento")}
            />
          </div>
        </div>
      </>
    );
  }

  // --- Sumários do Tempo de Trabalho Screen ---
  if (currentScreen === "sumarios-tempo") {
    const toggleStatus = (status: string) => {
      setExpandedStatus(expandedStatus === status ? null : status);
    };

    // Dados de histórico para cada status (múltiplas ocorrências)
    const statusHistory = {
      atendimento: [
        { inicio: "15:18:39", fim: "-", duracao: "00h 00m 00s" }
      ],
      disponivel: [
        { inicio: "15:18:35", fim: "15:18:39", duracao: "00h 00m 05s" }
      ],
      naoPronto: [
        { inicio: "15:18:30", fim: "15:18:35", duracao: "00h 00m 05s" },
        { inicio: "10:56:01", fim: "11:07:01", duracao: "00h 11m 00s" },
        { inicio: "09:13:46", fim: "09:32:01", duracao: "00h 18m 15s" },
        { inicio: "09:08:32", fim: "09:10:01", duracao: "00h 01m 30s" },
      ],
      indisponivel: []
    };

    return (
      <div className="w-80">
        <MenuHeader
          title="Relatório de desempenho"
          onBack={handleBack}
        />

        {/* Conteúdo scrollável */}
        <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
          <div className="p-3 space-y-4">
            {/* Cards de Métricas - Ícone à esquerda, valor à direita */}
            <div className="space-y-2">
              {/* Casos Finalizados Hoje */}
              <div className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <Text as="p" variant="xs" className="text-muted-foreground">
                    Casos Finalizados Hoje
                  </Text>
                </div>
                <Text as="p" variant="lg" className="font-bold text-foreground">
                  0
                </Text>
              </div>

              {/* Último Caso Atendido */}
              <div className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-primary" />
                  <Text as="p" variant="xs" className="text-muted-foreground">
                    Último Caso Atendido
                  </Text>
                </div>
                <Text as="p" variant="lg" className="font-bold text-foreground">
                  304112
                </Text>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Detalhamento de Status */}
            <div>
              <Text
                as="p"
                variant="sm"
                className="font-semibold text-foreground mb-2"
              >
                Detalhamento de Status
              </Text>

              {/* Status expansíveis em cards */}
              <div className="space-y-1.5">
                {/* Em atendimento */}
                <div className="bg-card border border-border rounded-md overflow-hidden">
                  <button
                    onClick={() => toggleStatus("atendimento")}
                    className="w-full p-2 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Phone className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <Text as="span" variant="xs" className="text-foreground truncate">
                        Em atendimento
                      </Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <Text as="span" variant="xs" className="text-muted-foreground">
                        00h 00m 00s
                      </Text>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${
                          expandedStatus === "atendimento" ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>
                  {expandedStatus === "atendimento" && (
                    <div className="bg-muted/20 border-t border-border">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-1 px-2 text-muted-foreground font-medium">Início</th>
                            <th className="text-left py-1 px-2 text-muted-foreground font-medium">Fim</th>
                            <th className="text-left py-1 px-2 text-muted-foreground font-medium">Duração</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statusHistory.atendimento.map((item, idx) => (
                            <tr key={idx} className="even:bg-muted/30">
                              <td className="py-1 px-2 text-foreground">{item.inicio}</td>
                              <td className="py-1 px-2 text-foreground">{item.fim}</td>
                              <td className="py-1 px-2 text-foreground">{item.duracao}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Disponível */}
                <div className="bg-card border border-border rounded-md overflow-hidden">
                  <button
                    onClick={() => toggleStatus("disponivel")}
                    className="w-full p-2 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-success rounded-full" />
                      </div>
                      <Text as="span" variant="xs" className="text-foreground truncate">
                        Disponível
                      </Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <Text as="span" variant="xs" className="text-muted-foreground">
                        00h 00m 05s
                      </Text>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${
                          expandedStatus === "disponivel" ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>
                  {expandedStatus === "disponivel" && (
                    <div className="bg-muted/20 border-t border-border">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-1 px-2 text-muted-foreground font-medium">Início</th>
                            <th className="text-left py-1 px-2 text-muted-foreground font-medium">Fim</th>
                            <th className="text-left py-1 px-2 text-muted-foreground font-medium">Duração</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statusHistory.disponivel.map((item, idx) => (
                            <tr key={idx} className="even:bg-muted/30">
                              <td className="py-1 px-2 text-foreground">{item.inicio}</td>
                              <td className="py-1 px-2 text-foreground">{item.fim}</td>
                              <td className="py-1 px-2 text-foreground">{item.duracao}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Não está pronto */}
                <div className="bg-card border border-border rounded-md overflow-hidden">
                  <button
                    onClick={() => toggleStatus("nao-pronto")}
                    className="w-full p-2 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Phone className="w-3.5 h-3.5 text-destructive rotate-135 flex-shrink-0" />
                      <Text as="span" variant="xs" className="text-foreground truncate">
                        Não está pronto
                      </Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <Text as="span" variant="xs" className="text-muted-foreground">
                        00h 30m 51s
                      </Text>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${
                          expandedStatus === "nao-pronto" ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>
                  {expandedStatus === "nao-pronto" && (
                    <div className="bg-muted/20 border-t border-border">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-1 px-2 text-muted-foreground font-medium">Início</th>
                            <th className="text-left py-1 px-2 text-muted-foreground font-medium">Fim</th>
                            <th className="text-left py-1 px-2 text-muted-foreground font-medium">Duração</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statusHistory.naoPronto.map((item, idx) => (
                            <tr key={idx} className="even:bg-muted/30">
                              <td className="py-1 px-2 text-foreground">{item.inicio}</td>
                              <td className="py-1 px-2 text-foreground">{item.fim}</td>
                              <td className="py-1 px-2 text-foreground">{item.duracao}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Indisponível */}
                <div className="bg-card border border-border rounded-md overflow-hidden">
                  <button
                    onClick={() => toggleStatus("indisponivel")}
                    className="w-full p-2 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <LogOut className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <Text as="span" variant="xs" className="text-foreground truncate">
                        Indisponível
                      </Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <Text as="span" variant="xs" className="text-muted-foreground">
                        05h 39m 11s
                      </Text>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${
                          expandedStatus === "indisponivel" ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>
                  {expandedStatus === "indisponivel" && statusHistory.indisponivel.length > 0 && (
                    <div className="bg-muted/20 border-t border-border">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-1 px-2 text-muted-foreground font-medium">Início</th>
                            <th className="text-left py-1 px-2 text-muted-foreground font-medium">Fim</th>
                            <th className="text-left py-1 px-2 text-muted-foreground font-medium">Duração</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statusHistory.indisponivel.map((item, idx) => (
                            <tr key={idx} className="even:bg-muted/30">
                              <td className="py-1 px-2 text-foreground">{item.inicio}</td>
                              <td className="py-1 px-2 text-foreground">{item.fim}</td>
                              <td className="py-1 px-2 text-foreground">{item.duracao}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {expandedStatus === "indisponivel" && statusHistory.indisponivel.length === 0 && (
                    <div className="px-2 py-2 bg-muted/20 border-t border-border text-center">
                      <Text as="p" variant="xs" className="text-muted-foreground italic">
                        Nenhuma ocorrência hoje
                      </Text>
                    </div>
                  )}
                </div>

                {/* Total Logado */}
                <div className="bg-muted/40 border border-border rounded-md p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-foreground flex-shrink-0" />
                    <Text as="span" variant="xs" className="font-medium text-foreground">
                      Total Logado
                    </Text>
                  </div>
                  <Text as="span" variant="xs" className="font-bold text-foreground">
                    00h 30m 55s
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Monitoramento de Rede Screen (Experiência Premium) ---
  if (currentScreen === "monitoramento-internet") {
    const isNormal = networkStatus === "normal";
    const currentLatency = Math.round(
      latencyData[latencyData.length - 1]?.latency || 0,
    );

    return (
      <div className="w-80">
        <MenuHeader
          title="Monitoramento de Internet"
          onBack={handleBack}
        />

        {/* Conteúdo scrollável */}
        <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
          <div className="p-3 space-y-3">
            {/* 1. Badge de Status */}
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  isNormal
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {isNormal
                  ? "Internet normal"
                  : "Internet lenta"}
              </span>
            </div>

            {/* 2. Título */}
            <div>
              <Text variant="sm" className="font-bold">
                Sua internet está funcionando bem
              </Text>
            </div>

            {/* 3. Descrição + Valor */}
            <div className="flex justify-between items-baseline">
              <Text
                variant="xs"
                className="text-muted-foreground w-full"
              >
                {isNormal
                  ? "Sua conexão está estável para chamadas de voz e vídeo."
                  : "Sua conexão apresenta instabilidade. Tente se aproximar do roteador."}
              </Text>
            </div>

            {/* 4. Gráfico de Latência */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={latencyData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: -10,
                    bottom: 5,
                  }}
                >
                  {/* XAxis OCULTO - remove os labels "0s, 5s, 10s..." */}
                  <XAxis
                    key="x-axis"
                    dataKey="time"
                    hide={true}
                  />
                  
                  <YAxis
                    key="y-axis"
                    type="number"
                    tick={{
                      fontSize: 9,
                      fill: "#6b7280",
                    }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 1000]}
                    ticks={[
                      100, 200, 300, 400, 500, 600, 700, 800,
                      900, 1000,
                    ]}
                    tickFormatter={(value) => `${value} ms`}
                    interval={0}
                    allowDecimals={false}
                  />

                  {/* Linhas sutis em TODOS os marcadores EXCETO 300ms */}
                  {[
                    100, 200, 400, 500, 600, 700, 800, 900,
                    1000,
                  ].map((value) => (
                    <ReferenceLine
                      key={`ref-line-${value}`}
                      y={value}
                      stroke="#e5e7eb"
                      strokeWidth={1}
                      opacity={0.5}
                      ifOverflow="extendDomain"
                    />
                  ))}

                  {/* Linha TRACEJADA de corte em 300ms */}
                  <ReferenceLine
                    key="reference-line-limit"
                    y={300}
                    stroke="#9ca3af"
                    strokeDasharray="5 5"
                    strokeWidth={1.5}
                    ifOverflow="extendDomain"
                  />

                  <Tooltip
                    key="tooltip"
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "11px",
                    }}
                    labelStyle={{
                      color: "#111827",
                    }}
                    formatter={(value: number) => [
                      `${Math.round(value)} ms`,
                      "Latência",
                    ]}
                  />
                  <Line
                    key="line"
                    type="monotone"
                    dataKey="latency"
                    stroke={isNormal ? "#16a34a" : "#dc2626"}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: isNormal ? "#16a34a" : "#dc2626",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 5. Dicas (apenas quando internet está lenta) */}
            {!isNormal && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <Text
                  variant="xs"
                  className="font-semibold text-red-900 mb-2"
                >
                  💡 Melhorar conexão
                </Text>
                <ul className="space-y-1">
                  <Text
                    as="li"
                    variant="xs"
                    className="text-red-800"
                  >
                    • Aproxime-se do roteador
                  </Text>
                  <Text
                    as="li"
                    variant="xs"
                    className="text-red-800"
                  >
                    • Use cabo Ethernet
                  </Text>
                  <Text
                    as="li"
                    variant="xs"
                    className="text-red-800"
                  >
                    • Feche programas não usados
                  </Text>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Tema Screen ---
  if (currentScreen === "tema") {
    return (
      <div className="w-80">
        <MenuHeader title="Tema" onBack={handleBack} />
        <div className="p-1">
          <MenuItem
            icon={Sun}
            label="Claro"
            onClick={() => {
              onThemeChange("light");
              handleBack();
            }}
            rightContent={
              theme === "light" ? (
                <Check className="w-4 h-4 text-brand-primary" />
              ) : null
            }
          />
          <MenuItem
            icon={Moon}
            label="Escuro"
            onClick={() => {
              onThemeChange("dark");
              handleBack();
            }}
            rightContent={
              theme === "dark" ? (
                <Check className="w-4 h-4 text-brand-primary" />
              ) : null
            }
          />
          <MenuItem
            icon={Monitor}
            label="Correspondente ao navegador"
            onClick={() => {
              onThemeChange("system");
              handleBack();
            }}
            rightContent={
              theme === "system" ? (
                <Check className="w-4 h-4 text-brand-primary" />
              ) : null
            }
          />
        </div>
      </div>
    );
  }

  // --- Tamanho de Fonte Screen ---
  if (currentScreen === "tamanho-fonte") {
    return (
      <div className="w-80">
        <MenuHeader
          title="Tamanho de Fonte"
          onBack={handleBack}
        />
        <div className="p-1">
          <MenuItem
            label="Pequeno"
            onClick={() => {
              onFontSizeChange("small");
              handleBack();
            }}
            rightContent={
              fontSize === "small" ? (
                <Check className="w-4 h-4 text-brand-primary" />
              ) : null
            }
          />
          <MenuItem
            label="Padrão"
            onClick={() => {
              onFontSizeChange("medium");
              handleBack();
            }}
            rightContent={
              fontSize === "medium" ? (
                <Check className="w-4 h-4 text-brand-primary" />
              ) : null
            }
          />
          <MenuItem
            label="Grande"
            onClick={() => {
              onFontSizeChange("large");
              handleBack();
            }}
            rightContent={
              fontSize === "large" ? (
                <Check className="w-4 h-4 text-brand-primary" />
              ) : null
            }
          />
        </div>
      </div>
    );
  }

  return null;
}

// --- UserMenu Wrapper with Dropdown ---

export default function UserMenuWrapper({
  agentStatus,
  setAgentStatus,
  statusOptions,
  currentStatus,
  theme,
  fontSize,
  toggleTheme,
  setTheme,
  setFontSize,
  handleNavigation,
}: UserMenuWrapperProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0 relative"
          title="Perfil"
        >
          <User className="size-4.5" />

          {/* Badge de Status */}
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
              agentStatus === "disponivel"
                ? "bg-green-500"
                : agentStatus === "pausa"
                  ? "bg-yellow-500"
                  : agentStatus === "almoco"
                    ? "bg-orange-500"
                    : agentStatus === "ausente"
                      ? "bg-gray-500"
                      : "bg-red-500"
            }`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-0">
        <UserMenuContent
          theme={theme}
          fontSize={fontSize}
          onThemeChange={(newTheme) => {
            setTheme(newTheme);
            setOpen(false);
          }}
          onFontSizeChange={(newSize) => {
            setFontSize(newSize);
            setOpen(false);
          }}
          onNavigate={handleNavigation}
          onLogout={() => console.log("Sair")}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}