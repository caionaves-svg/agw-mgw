import { useCall } from "../contexts/CallContext";
import WebPhoneWidget, {
  WebPhoneState,
} from "./webphone/WebPhoneWidget";
import svgPaths from "../imports/svg-29fnrm3pjf";
import Logo1 from "../imports/svg-i359l5rvn1";
import { Separator } from "./ui/separator";
import { usePreferences } from "../contexts/PreferencesContext";
import { useSidePanel } from "../contexts/SidePanelContext";
import UserMenu from "./UserMenu";
import { Link, useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import {
  ChevronDown,
  CircleHelp,
  Circle,
  Coffee,
  UtensilsCrossed,
  Clock,
  LogOut as LogOutIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Text } from "./ui/text";

// --- Helpers & Types ---

type FontSizePreference = "small" | "medium" | "large";

type AgentStatus =
  | "disponivel"
  | "pausa"
  | "almoco"
  | "ausente"
  | "offline";

interface StatusOption {
  value: AgentStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

interface ProfileOption {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  color: string;
  bgColor: string;
}

interface FontSizeOption {
  value: FontSizePreference;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

// --- Sub-components ---

function WizzIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 20 20"
    >
      <g>
        <path d={svgPaths.p16affa80} fill="currentColor" />
        <path d={svgPaths.p3c89d9f0} fill="currentColor" />
        <path
          clipRule="evenodd"
          d={svgPaths.p118e9ef0}
          fill="currentColor"
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}

function HeaderLogo() {
  return (
    <div className="flex items-center gap-0.5">
      <div className="h-8 overflow-clip relative shrink-0 w-26">
        <div className="absolute bottom-[3.13%] left-0 right-[0.96%] top-[6.25%]">
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 103 29"
          >
            <g id="logo">
              <path
                clipRule="evenodd"
                d={Logo1.p3d076880}
                fill="var(--fill-0, #00BCF2)"
                fillRule="evenodd"
              />
              <path
                clipRule="evenodd"
                d={Logo1.p3555a100}
                fill="var(--fill-0, #00BCF2)"
                fillRule="evenodd"
              />
              <path
                clipRule="evenodd"
                d={Logo1.p2968c500}
                fill="var(--fill-0, #465459)"
                fillRule="evenodd"
              />
              <path
                clipRule="evenodd"
                d={Logo1.p263c4500}
                fill="var(--fill-0, #465459)"
                fillRule="evenodd"
              />
              <path
                clipRule="evenodd"
                d={Logo1.pdb79e80}
                fill="var(--fill-0, #465459)"
                fillRule="evenodd"
              />
              <path
                clipRule="evenodd"
                d={Logo1.p240ede00}
                fill="var(--fill-0, #465459)"
                fillRule="evenodd"
              />
              <path
                clipRule="evenodd"
                d={Logo1.p8377200}
                fill="var(--fill-0, #465459)"
                fillRule="evenodd"
              />
              <path
                clipRule="evenodd"
                d={Logo1.p2504d980}
                fill="var(--fill-0, #465459)"
                fillRule="evenodd"
              />
              <path
                clipRule="evenodd"
                d={Logo1.p2f49f580}
                fill="var(--fill-0, #465459)"
                fillRule="evenodd"
              />
              <path
                clipRule="evenodd"
                d={Logo1.pa309400}
                fill="var(--fill-0, #465459)"
                fillRule="evenodd"
              />
            </g>
          </svg>
        </div>
      </div>
      <span
        className="text-primary mb-0.5"
        style={{ fontFamily: "Manrope", fontSize: "20px" }}
      >
        beta
      </span>
    </div>
  );
}

interface NavItemProps {
  label: string;
  isActive?: boolean;
  to?: string;
  hasDropdown?: boolean;
  onClick?: () => void;
}

function NavItem({
  label,
  isActive = false,
  to,
  hasDropdown = false,
  onClick,
}: NavItemProps) {
  const content = (
    <div
      className={`box-border content-stretch flex gap-1 items-center justify-center px-4 py-4 relative shrink-0 cursor-pointer transition-colors duration-200 h-16 border-b-2 ${
        isActive
          ? "border-brand-primary"
          : "border-transparent hover:bg-muted/50"
      }`}
    >
      <Text
        as="span"
        variant="sm"
        className={`leading-tight relative shrink-0 text-nowrap whitespace-pre ${
          isActive
            ? "text-brand-primary"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {label}
      </Text>
      {hasDropdown && (
        <ChevronDown
          className={`size-4.5 ${
            isActive
              ? "stroke-brand-primary"
              : "stroke-muted-foreground"
          }`}
          strokeWidth="2"
        />
      )}
    </div>
  );

  if (to && !hasDropdown) {
    return <Link to={to}>{content}</Link>;
  }

  return <div onClick={onClick}>{content}</div>;
}

interface IconButtonProps {
  icon: React.ElementType;
  onClick?: () => void;
  title: string;
  className?: string;
  iconClassName?: string;
  isActive?: boolean;
}

function IconButton({
  icon: Icon,
  onClick,
  title,
  className = "",
  iconClassName = "text-gray-500",
  isActive = false,
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`box-border content-stretch flex items-center justify-center p-3 rounded-full shrink-0 transition-colors ${
        isActive
          ? "bg-brand-primary"
          : "bg-muted hover:bg-gray-200"
      } ${className}`}
      title={title}
    >
      <Icon
        className={`size-4.5 ${
          isActive ? "text-white" : iconClassName
        }`}
      />
    </button>
  );
}

// --- Main Component ---

export default function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    callState,
    webPhoneState,
    startCall,
    endCall,
    loginWebPhone,
    checkMicrophonePermission,
  } = useCall();
  const {
    theme,
    fontSize,
    toggleTheme,
    setTheme,
    setFontSize,
  } = usePreferences();
  const { togglePanel, contentType, isOpen } = useSidePanel();

  const [showCallDialog, setShowCallDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<
    string | null
  >(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Estado do agente
  const [agentStatus, setAgentStatus] =
    useState<AgentStatus>("disponivel");

  // Estado para navegação em níveis no menu do usuário
  const [userMenuScreen, setUserMenuScreen] = useState<
    | "main"
    | "solicitar-pausa"
    | "relatorio-desempenho"
    | "tema"
    | "tamanho-fonte"
  >("main");

  // Estados do WebPhone Widget
  const [webPhoneWidgetState, setWebPhoneWidgetState] =
    useState<WebPhoneState>("login");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isMuted, setIsMuted] = useState(false);

  // Opções de status
  const statusOptions: StatusOption[] = [
    {
      value: "disponivel",
      label: "Disponível",
      icon: Circle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      value: "pausa",
      label: "Em Pausa",
      icon: Coffee,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      value: "almoco",
      label: "Almoço",
      icon: UtensilsCrossed,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      value: "ausente",
      label: "Ausente",
      icon: Clock,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
    {
      value: "offline",
      label: "Offline",
      icon: LogOutIcon,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  // Obter status atual
  const currentStatus = statusOptions.find(
    (s) => s.value === agentStatus,
  )!;

  // Timer da chamada
  const [callTimer, setCallTimer] = useState(0);

  // Atualizar timer a cada segundo quando há chamada ativa
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (callState.isActive) {
      interval = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState.isActive]);

  // Formatar tempo (00:00:44)
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Mapear rotas para determinar item ativo
  const getActiveItem = (pathname: string) => {
    if (pathname.includes("/atendimentos") || pathname === "/")
      return "atendimento";
    if (
      pathname.includes("/casos") ||
      pathname.includes("/usuarios")
    )
      return "gerenciamento";
    if (
      pathname.includes("/configuracoes") ||
      pathname.includes("/estrutura")
    )
      return "configuracoes";
    if (
      pathname.includes("/relatorios") ||
      pathname.includes("/analytics")
    )
      return "analitico";
    if (
      pathname.includes("/ajuda") ||
      pathname.includes("/perfil")
    )
      return "outros";
    return "atendimento";
  };

  const activeItem = getActiveItem(location.pathname);
  const isAtendimento = activeItem === "atendimento";

  // Iniciar chamada automaticamente ao entrar em Atendimentos (Simulação)
  // Não iniciar se estiver navegando para fora ou se não estiver logado no WebPhone
  useEffect(() => {
    if (
      isAtendimento &&
      !callState.isActive &&
      !isNavigating &&
      webPhoneState.isLoggedIn
    ) {
      startCall("+55 (34) 9 9999-9999");
    }
  }, [
    isAtendimento,
    callState.isActive,
    startCall,
    isNavigating,
    webPhoneState.isLoggedIn,
  ]);

  // Handle navigation com verificação de chamada
  const handleNavigation = (path: string) => {
    if (
      callState.isActive &&
      isAtendimento &&
      path !== "/atendimentos"
    ) {
      setPendingNavigation(path);
      setShowCallDialog(true);
    } else {
      navigate(path);
    }
  };

  // Confirm navigation e encerrar chamada
  const handleConfirmNavigation = () => {
    if (pendingNavigation) {
      setIsNavigating(true);
      endCall();
      setTimeout(() => {
        navigate(pendingNavigation);
        setPendingNavigation(null);
        setShowCallDialog(false);
        setIsNavigating(false);
      }, 100);
    }
  };

  // Cancel navigation
  const handleCancelNavigation = () => {
    setPendingNavigation(null);
    setShowCallDialog(false);
  };

  // Handlers do WebPhone Widget
  const handleWebPhoneLogin = async () => {
    await checkMicrophonePermission();
    loginWebPhone();
    setWebPhoneWidgetState("idle");
  };

  const handleWebPhoneCall = () => {
    if (phoneNumber) {
      startCall(phoneNumber);
      setWebPhoneWidgetState("outgoing");
      // Simula atendimento após 3 segundos
      setTimeout(() => {
        setWebPhoneWidgetState("in-call");
      }, 3000);
    }
  };

  const handleWebPhoneHangup = () => {
    endCall();
    setWebPhoneWidgetState("idle");
    setPhoneNumber("");
    setIsMuted(false);
  };

  const handleWebPhoneMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
  };

  const handleRequestMicPermission = async () => {
    await checkMicrophonePermission();
  };

  return (
    <>
      <header className="bg-background relative h-16 w-full border-b border-border z-50">
        <nav className="flex flex-row items-center justify-between px-4 h-full w-full">
          {/* Lado Esquerdo - Logo + Menu */}
          <div className="flex items-center gap-1.5">
            {/* Logo */}
            <Link to="/atendimentos" className="flex-shrink-0">
              <HeaderLogo />
            </Link>

            {/* Divisor */}
            <div
              className="h-6 w-px bg-border mx-2"
              role="separator"
              aria-orientation="vertical"
            />

            {/* Call Widget ou Login do WebPhone */}
            {isAtendimento && (
              <WebPhoneWidget
                state={webPhoneWidgetState}
                phoneNumber={phoneNumber}
                timer={formatTime(callTimer)}
                onLogin={handleWebPhoneLogin}
                onCall={handleWebPhoneCall}
                onHangup={handleWebPhoneHangup}
                onMute={handleWebPhoneMute}
                onDialpad={() => console.log("Dialpad clicked")}
                onPhoneNumberChange={handlePhoneNumberChange}
                hasMicrophonePermission={
                  webPhoneState.hasMicrophonePermission ||
                  undefined
                }
                onRequestMicPermission={
                  handleRequestMicPermission
                }
                isMuted={isMuted}
              />
            )}

            {/* Menu Principal */}
            <ul className="flex items-center gap-1">
              {/* Menu de navegação - oculto na página de Atendimentos */}
              {!isAtendimento && (
                <>
                  <li>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div>
                          <NavItem
                            label="Gerenciamento"
                            isActive={
                              activeItem === "gerenciamento"
                            }
                            hasDropdown
                          />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-56"
                      >
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                        >
                          Overview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Atendimento
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Atendentes
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Canais
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          SLA e Metas
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>


                  <li>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div>
                          <NavItem
                            label="Configurações"
                            isActive={
                              activeItem === "configuracoes"
                            }
                            hasDropdown
                          />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-[780px] p-4"
                      >
                        <div className="grid grid-cols-3 gap-6">
                          {/* Coluna 1: Geral + Customer Service (parte 1) */}
                          <div className="space-y-4">
                            {/* Geral */}
                            <div>
                              <div className="px-2 py-1.5 mb-1">
                                <Text
                                  as="span"
                                  variant="xs"
                                  className="font-semibold text-muted-foreground uppercase tracking-wide"
                                >
                                  Geral
                                </Text>
                              </div>
                              <div className="space-y-0.5">
                                <DropdownMenuItem>
                                  Pessoa
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Empresa
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Unidade de Negócio
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Integrações
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Usuários
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Perfil do Usuário
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Permissões
                                </DropdownMenuItem>
                              </div>
                            </div>

                            {/* Customer Service - Parte 1 */}
                            <div>
                              <div className="px-2 py-1.5 mb-1">
                                <Text
                                  as="span"
                                  variant="xs"
                                  className="font-semibold text-muted-foreground uppercase tracking-wide"
                                >
                                  Customer Service
                                </Text>
                              </div>
                              <div className="space-y-0.5">
                                <DropdownMenuItem>
                                  Status do Agente
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  App Studio
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Origem de Caso
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Formulário de Caso
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Status de Caso
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Tipos de Caso
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Ações de Caso
                                </DropdownMenuItem>
                              </div>
                            </div>
                          </div>

                          {/* Coluna 2: Customer Service (parte 2) + Workflow Studio */}
                          <div className="space-y-4">
                            {/* Customer Service - Parte 2 (continuação) */}
                            <div>
                              <div className="px-2 py-1.5 mb-1 opacity-0">
                                <Text
                                  as="span"
                                  variant="xs"
                                  className="font-semibold text-muted-foreground uppercase tracking-wide"
                                >
                                  Placeholder
                                </Text>
                              </div>
                              <div className="space-y-0.5">
                                <DropdownMenuItem>
                                  Razão de Caso
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Regras de Distribuição
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Mailing
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Equipes
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Lista de Casos
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Formulários de Ações
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Questionários
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Enquetes
                                </DropdownMenuItem>
                              </div>
                            </div>

                            {/* Workflow Studio */}
                            <div>
                              <div className="px-2 py-1.5 mb-1">
                                <Text
                                  as="span"
                                  variant="xs"
                                  className="font-semibold text-muted-foreground uppercase tracking-wide"
                                >
                                  Workflow Studio
                                </Text>
                              </div>
                              <div className="space-y-0.5">
                                <DropdownMenuItem>
                                  Fluxos do Atendimento Humano
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Automações Inteligentes
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Atendimento Digital (Chatbot e
                                  IA)
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Atendimento Voz (beta)
                                </DropdownMenuItem>
                              </div>
                            </div>
                          </div>

                          {/* Coluna 3: Data Modeler, SLA, Conversação, Customizações */}
                          <div className="space-y-4">
                            {/* Data Modeler */}
                            <div>
                              <div className="px-2 py-1.5 mb-1">
                                <Text
                                  as="span"
                                  variant="xs"
                                  className="font-semibold text-muted-foreground uppercase tracking-wide"
                                >
                                  Data Modeler
                                </Text>
                              </div>
                              <div className="space-y-0.5">
                                <DropdownMenuItem>
                                  Gerenciador de Entidades
                                </DropdownMenuItem>
                              </div>
                            </div>

                            {/* SLA */}
                            <div>
                              <div className="px-2 py-1.5 mb-1">
                                <Text
                                  as="span"
                                  variant="xs"
                                  className="font-semibold text-muted-foreground uppercase tracking-wide"
                                >
                                  SLA
                                </Text>
                              </div>
                              <div className="space-y-0.5">
                                <DropdownMenuItem>
                                  Políticas de SLA
                                </DropdownMenuItem>
                              </div>
                            </div>

                            {/* Conversação */}
                            <div>
                              <div className="px-2 py-1.5 mb-1">
                                <Text
                                  as="span"
                                  variant="xs"
                                  className="font-semibold text-muted-foreground uppercase tracking-wide"
                                >
                                  Conversação
                                </Text>
                              </div>
                              <div className="space-y-0.5">
                                <DropdownMenuItem>
                                  Contas
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Canais
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Lista de Bloqueios
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Templates
                                </DropdownMenuItem>
                              </div>
                            </div>

                            {/* Customizações */}
                            <div>
                              <div className="px-2 py-1.5 mb-1">
                                <Text
                                  as="span"
                                  variant="xs"
                                  className="font-semibold text-muted-foreground uppercase tracking-wide"
                                >
                                  Customizações
                                </Text>
                              </div>
                              <div className="space-y-0.5">
                                <DropdownMenuItem>
                                  Aparência
                                </DropdownMenuItem>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>

                  <li>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div>
                          <NavItem
                            label="Analítico"
                            isActive={
                              activeItem === "analitico"
                            }
                            hasDropdown
                          />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-48"
                      >
                        <DropdownMenuItem>
                          Relatórios
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Analytics
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Lado Direito - Ações + Perfil */}
          <div className="flex items-center gap-1.5">
            {/* Botão Ajuda */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigation("/ajuda")}
              title="Ajuda"
              className="h-9 w-9 p-0"
            >
              <CircleHelp className="size-4.5" />
            </Button>

            {/* Wizz Icon Customizado - COMENTADO */}
            {/* <button
              onClick={() => togglePanel("wizz")}
              className={`box-border content-stretch flex items-center justify-center p-3 rounded-xl shrink-0 transition-colors ${
                isOpen && contentType === "wizz"
                  ? "bg-gradient-to-br from-[#7850CB] to-[#C44F8E]"
                  : "bg-muted hover:bg-gray-200"
              }`}
              title="Wizz - Chat de IA"
            >
              <WizzIcon
                className={`size-5 ${
                  isOpen && contentType === "wizz"
                    ? "text-white"
                    : "text-muted-foreground"
                }`}
              />
            </button> */}

            {/* Botão de Apps - COMENTADO */}
            {/* <IconButton
              icon={LayoutGrid}
              onClick={() => togglePanel("apps")}
              title="Aplicativos"
              className={
                isOpen && contentType === "apps"
                  ? "bg-gradient-to-br from-[#00BCF2] to-[#4FC4A8] text-white hover:from-[#00BCF2] hover:to-[#4FC4A8]"
                  : ""
              }
              iconClassName={
                isOpen && contentType === "apps"
                  ? "text-white"
                  : "text-muted-foreground"
              }
            /> */}

            {/* Divisor */}
            <div
              className="h-6 w-px bg-border mx-2"
              role="separator"
              aria-orientation="vertical"
            />

            {/* Menu de Usuário */}
            <UserMenu
              agentStatus={agentStatus}
              setAgentStatus={setAgentStatus}
              statusOptions={statusOptions}
              currentStatus={currentStatus}
              theme={theme}
              fontSize={fontSize}
              toggleTheme={toggleTheme}
              setTheme={setTheme}
              setFontSize={setFontSize}
              handleNavigation={handleNavigation}
            />
          </div>
        </nav>
      </header>

      {/* Dialog de confirmação de saída */}
      {showCallDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="font-semibold mb-2">
              Atendimentos em curso
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Você possui atendimentos ativos. Deseja finalizar
              os atendimentos e sair desta página?
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleCancelNavigation}
              >
                Permanecer na página
              </Button>
              <Button
                onClick={handleConfirmNavigation}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Finalizar atendimentos
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}