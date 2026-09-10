import { useState, useRef, useEffect } from "react";
import {
  Search,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Pin,
  X,
  Mail,
  Copy,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import svgPaths from "../imports/svg-urgeeeqm0w";
import { useData, Mensagem } from "../contexts/DataContext";
import EmailList from "./EmailList";
import EmailViewer from "./EmailViewer";
import ChatInput from "./ChatInput";
import { usePreferences } from "../contexts/PreferencesContext";
import { NewAchievementPictogram } from "./pictograms/NewAchievement";

// Backgrounds para dark e light mode (já com opacidade embutida nos PNGs)
// IMPORTANTE: Os assets estavam com nomenclatura invertida, corrigido abaixo
import bgPatternDark from "figma:asset/dae18cd761d363cc07e5aaeeb31d73481937cdc1.png";
import bgPatternLight from "figma:asset/3b9d618e90f32465a29764d581551d8daa37e59b.png";

// ========== IMPORTAR COMPONENTES MODULARES DE MENSAGEM ==========
import {
  BalloonMessage,
  ImageMessage,
  AudioMessage,
  FileMessage,
  LocationMessage,
  MessagePosition,
} from "./chat";

interface Atendimento {
  id: string;
  cliente: {
    nome: string;
    avatar: string;
  };
  status: string;
  tempoAtendimento: string;
  canal: string;
  atendente?: {
    nome: string;
    cor: string;
  };
  isEmCurso?: boolean; // Indica se está na seção "Atendimentos em Curso"
}

// Interface Mensagem agora vem do contexto

interface ChatPanelProps {
  atendimento?: Atendimento;
  isPinned?: boolean;
  onPin?: () => void;
  readOnly?: boolean;
}

// Função para gerar iniciais do nome
function getInitials(nome: string): string {
  return nome
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

// Função para gerar cor baseada no nome
function getAvatarColor(nome: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-teal-500",
  ];

  const hash = nome.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length];
}

const canais = [
  {
    id: "whatsapp",
    nome: "WhatsApp",
    icon: "whatsapp",
    ativo: true,
  },
  {
    id: "webchat",
    nome: "Webchat",
    icon: "webchat",
    ativo: false,
  },
  {
    id: "messenger",
    nome: "Messenger",
    icon: "messenger",
    ativo: false,
  },
  {
    id: "instagram",
    nome: "Instagram Direct",
    icon: "instagram",
    ativo: false,
  },
  {
    id: "telegram",
    nome: "Telegram",
    icon: "telegram",
    ativo: false,
  },
  { id: "email", nome: "E-mail", icon: "email", ativo: false },
  { id: "rcs", nome: "RCS", icon: "rcs", ativo: false },
];

// Mensagens agora vêm do contexto baseadas no usuário selecionado
const mensagensExemplo: Mensagem[] = [
  {
    id: "1",
    texto: "Olá, boa tarde!",
    remetente: "cliente",
    timestamp: "12:30",
  },
  {
    id: "2",
    texto:
      "Gostaria de saber quando será o meu atendimento agendado...",
    remetente: "cliente",
    timestamp: "12:30",
  },
  {
    id: "3",
    texto: "Você possui o protocolo do atendimento?",
    remetente: "atendente",
    timestamp: "12:31",
    status: "lido",
  },
  {
    id: "4",
    texto: "O protocolo que foi me passado é:\\n0021414",
    remetente: "cliente",
    timestamp: "12:32",
  },
  {
    id: "5",
    texto: "Por favor, aguarde um momento!",
    remetente: "atendente",
    timestamp: "12:33",
    status: "lido",
  },
  {
    id: "6",
    texto:
      "O seu atendimento está agendado para:\\n24/08/2023 às 14:30",
    remetente: "atendente",
    timestamp: "12:35",
    status: "enviado",
  },
];

function CanalIcon({
  tipo,
  ativo,
}: {
  tipo: string;
  ativo?: boolean;
}) {
  switch (tipo) {
    case "whatsapp":
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 20 20"
        >
          <path d={svgPaths.p1396f400} fill="currentColor" />
        </svg>
      );
    case "webchat":
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 20 20"
        >
          <path d={svgPaths.p1f58c900} fill="currentColor" />
        </svg>
      );
    case "instagram":
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 20 20"
        >
          <path d={svgPaths.p185cc100} fill="currentColor" />
        </svg>
      );
    case "email":
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 20 20"
        >
          <path
            clipRule="evenodd"
            d={svgPaths.p1af1a500}
            fill="currentColor"
            fillRule="evenodd"
          />
        </svg>
      );
    case "messenger":
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 20 20"
        >
          <path
            clipRule="evenodd"
            d={svgPaths.pae5c6c0}
            fill="currentColor"
            fillRule="evenodd"
          />
        </svg>
      );
    case "telegram":
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 20 20"
        >
          <path d={svgPaths.p2e8fa900} fill="currentColor" />
        </svg>
      );
    case "rcs":
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 20 20"
        >
          <path
            clipRule="evenodd"
            d={svgPaths.p307b80}
            fill="currentColor"
            fillRule="evenodd"
          />
        </svg>
      );
    default:
      return <div className="w-5 h-5 bg-muted rounded-full" />;
  }
}

// Função para agrupar mensagens consecutivas do mesmo remetente
function groupMessages(mensagens: Mensagem[]) {
  const groups: { remetente: string; mensagens: Mensagem[] }[] =
    [];

  mensagens.forEach((mensagem) => {
    const lastGroup = groups[groups.length - 1];

    if (
      lastGroup &&
      lastGroup.remetente === mensagem.remetente
    ) {
      lastGroup.mensagens.push(mensagem);
    } else {
      groups.push({
        remetente: mensagem.remetente,
        mensagens: [mensagem],
      });
    }
  });

  return groups;
}

export default function ChatPanel({
  atendimento,
  isPinned = false,
  onPin,
  readOnly = false,
}: ChatPanelProps) {
  const { getMensagensByUsuarioId, addMensagem } = useData();
  const { theme } = usePreferences();
  const [mensagemTexto, setMensagemTexto] = useState("");
  const [canalAtivo, setCanalAtivo] = useState("whatsapp");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Estados para email
  const [selectedEmailId, setSelectedEmailId] = useState<
    string | null
  >(null);

  // Estados para navegação de canais
  const [scrollPosition, setScrollPosition] = useState(0);
  const canaisContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Estados para modal de edição do cliente
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] =
    useState(false);
  const [clientData, setClientData] = useState({
    nome: "",
    cpf: "",
    emailPrincipal: "",
    emailSecundario: "",
    emailsAdicionais: [] as string[],
    telefonePrincipal: "",
    telefoneSecundario: "",
    telefonesAdicionais: [] as string[],
  });

  // Atualizar estados dos botões de navegação
  const updateScrollButtons = () => {
    if (canaisContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        canaisContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(
        scrollLeft + clientWidth < scrollWidth - 10,
      );
    }
  };

  // Verificar se precisa mostrar botões de navegação ao montar
  useEffect(() => {
    updateScrollButtons();

    // Adicionar listener de resize para atualizar botões
    const handleResize = () => updateScrollButtons();
    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener("resize", handleResize);
  }, []);

  // Funções de navegação
  const scrollLeft = () => {
    if (canaisContainerRef.current) {
      canaisContainerRef.current.scrollBy({
        left: -200,
        behavior: "smooth",
      });
      setTimeout(updateScrollButtons, 300);
    }
  };

  const scrollRight = () => {
    if (canaisContainerRef.current) {
      canaisContainerRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
      setTimeout(updateScrollButtons, 300);
    }
  };

  // Buscar mensagens do usuário selecionado
  const mensagensUsuario = atendimento
    ? getMensagensByUsuarioId(atendimento.id)
    : [];

  // Verificar se está aguardando atendimento (não está em curso)
  const isAguardandoAtendimento = atendimento
    ? !atendimento.isEmCurso
    : false;

  const handleEnviarMensagem = () => {
    if (mensagemTexto.trim() && atendimento) {
      // Adicionar mensagem ao contexto
      addMensagem(atendimento.id, {
        texto: mensagemTexto,
        remetente: "atendente",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "enviado",
      });

      setMensagemTexto("");
    }
  };

  const handleEnviarAudio = (durationInSeconds: number) => {
    if (atendimento) {
      // Formatar duração para MM:SS
      const mins = Math.floor(durationInSeconds / 60);
      const secs = durationInSeconds % 60;
      const formattedDuration = `${mins}:${secs.toString().padStart(2, "0")}`;

      // Simulação de transcrição (em produção, viria de API de Speech-to-Text)
      const transcricaoSimulada =
        "Olá, estou enviando este áudio para confirmar o agendamento da consulta para amanhã às 14h30. Por favor, confirme se está tudo certo. Obrigado!";

      // Adicionar mensagem de áudio ao contexto
      addMensagem(atendimento.id, {
        texto: "Áudio",
        remetente: "atendente",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "enviado",
        tipo: "audio",
        duracao: formattedDuration,
        transcricao: transcricaoSimulada, // ← Transcrição automática
      });

      // Limpar textarea após enviar áudio
      setMensagemTexto("");
    }
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const value = e.target.value;
    setMensagemTexto(value);

    // Indicador de digitação
    if (value.trim() && !isTyping) {
      setIsTyping(true);
    }

    // Clear timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Para de mostrar "digitando" após 3 segundos sem digitar
    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    } else {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnviarMensagem();
    }
  };

  // Handlers para modal de edição do cliente
  const handleSaveClient = () => {
    console.log("Salvando dados do cliente:", clientData);
    setIsEditClientDialogOpen(false);
  };

  const handleCall = (phoneNumber: string) => {
    console.log("Iniciando ligação para:", phoneNumber);
  };

  const handleSendEmail = (email: string) => {
    console.log("Enviando e-mail para:", email);
  };

  const handleCopyValue = (value: string) => {
    navigator.clipboard.writeText(value);
    console.log("Valor copiado:", value);
  };

  const handleAddEmail = () => {
    setClientData({
      ...clientData,
      emailsAdicionais: [...clientData.emailsAdicionais, ""],
    });
  };

  const handleUpdateEmail = (index: number, value: string) => {
    const newEmails = [...clientData.emailsAdicionais];
    newEmails[index] = value;
    setClientData({
      ...clientData,
      emailsAdicionais: newEmails,
    });
  };

  const handleRemoveEmail = (index: number) => {
    const newEmails = clientData.emailsAdicionais.filter(
      (_, i) => i !== index,
    );
    setClientData({
      ...clientData,
      emailsAdicionais: newEmails,
    });
  };

  const handleAddTelefone = () => {
    setClientData({
      ...clientData,
      telefonesAdicionais: [
        ...clientData.telefonesAdicionais,
        "",
      ],
    });
  };

  const handleUpdateTelefone = (
    index: number,
    value: string,
  ) => {
    const newTelefones = [...clientData.telefonesAdicionais];
    newTelefones[index] = value;
    setClientData({
      ...clientData,
      telefonesAdicionais: newTelefones,
    });
  };

  const handleRemoveTelefone = (index: number) => {
    const newTelefones = clientData.telefonesAdicionais.filter(
      (_, i) => i !== index,
    );
    setClientData({
      ...clientData,
      telefonesAdicionais: newTelefones,
    });
  };

  // Inicializar dados do cliente quando atendimento muda
  useEffect(() => {
    if (atendimento) {
      setClientData({
        nome: atendimento.cliente.nome,
        cpf: "",
        emailPrincipal: "",
        emailSecundario: "",
        emailsAdicionais: [],
        telefonePrincipal: "",
        telefoneSecundario: "",
        telefonesAdicionais: [],
      });
    }
  }, [atendimento]);

  // Escolher background baseado no tema (usado tanto no empty state quanto no chat)
  const bgPattern =
    theme === "dark" ? bgPatternDark : bgPatternLight;

  if (!atendimento) {
    // Debug: verificar se as imagens estão carregando
    console.log("Theme:", theme);
    console.log("Background Dark URL:", bgPatternDark);
    console.log("Background Light URL:", bgPatternLight);
    console.log("Selected Pattern:", bgPattern);

    return (
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden relative">
        {/* Camada de fundo com pattern e opacidade */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "var(--muted)",
            backgroundImage: `url(${bgPattern})`,
            backgroundRepeat: "repeat",
            backgroundSize: "auto",
          }}
        />

        {/* Conteúdo do empty state - SEM opacidade herdada */}
        <div className="text-center relative">
          <NewAchievementPictogram className="w-38 h-38 mx-auto text-muted-foreground mb-8" />
          <h2 className="text-xl text-foreground">
            Tudo certo? Você acabou de conectar
          </h2>
          <p className="text-muted-foreground text-base">
            Para iniciar o atendimento clique em um usuário da
            sua lista para iniciar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col h-full justify-center"
      style={{
        backgroundColor: "var(--muted)",
        backgroundImage: `url(${bgPattern})`,
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
      }}
    >
      {/* Container centralizado com largura máxima */}
      <div className="w-full mx-auto flex flex-col h-full">
        {/* Header */}
        <div className="bg-muted border-b border-border px-2 py-1 @container">
          {/* Layout responsivo baseado no tamanho do container */}
          <div className="flex flex-col gap-2 @[600px]:flex-row @[600px]:items-center @[600px]:justify-between @[600px]:gap-0">
            {/* Linha 1: Avatar, Nome/Status e Ícones de Ação */}
            <div className="flex items-center justify-between w-full @[600px]:w-auto @[600px]:flex-1">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar className="w-[42px] h-[42px] shrink-0">
                  <AvatarFallback
                    className="bg-muted text-muted-foreground border border-border font-medium"
                    style={{ fontSize: "var(--text-lg)" }}
                  >
                    {getInitials(atendimento.cliente.nome)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3
                    className="font-semibold text-foreground leading-tight truncate"
                    style={{ fontSize: "var(--text-base)" }}
                  >
                    {atendimento.cliente.nome}
                  </h3>
                  <div
                    className="font-medium text-muted-foreground truncate"
                    style={{ fontSize: "var(--text-xs)" }}
                  >
                    {atendimento.isEmCurso ? (
                      // Contatos em "Atendimentos em Curso" sempre mostram "Em atendimentos"
                      <span className="text-primary">
                        Em atendimentos
                      </span>
                    ) : // Contatos em "Todos os Atendimentos" seguem a lógica do atendente
                    atendimento.atendente ? (
                      <span className="text-primary">
                        Em atendimentos
                      </span>
                    ) : (
                      <span className="text-warning">
                        Aguardando atendimento
                      </span>
                    )}
                    <span>
                      {" "}
                      - {atendimento.tempoAtendimento}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ícones de ação à direita */}
              <div className="flex items-center gap-1 shrink-0 ml-3">
                {onPin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={onPin}
                    title={isPinned ? "Desafixar conversa" : "Fixar conversa"}
                  >
                    <Pin className={`w-5 h-5 transition-colors ${isPinned ? "fill-brand-primary text-brand-primary" : ""}`} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  onClick={() => setIsEditClientDialogOpen(true)}
                  title="Editar dados do cliente"
                >
                  <Pencil className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                >
                  <Phone className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Divisor vertical (visível apenas >= 600px) */}
            <div className="hidden @[600px]:block h-6 w-px bg-border mx-2" />

            {/* Linha 2: Botões dos Canais com navegação */}
            <div className="relative flex items-center @[600px]:gap-2">
              {/* Botão Esquerda */}
              {canScrollLeft && (
                <button
                  onClick={scrollLeft}
                  className="absolute left-0 z-10 w-6 h-8 bg-card/95 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-muted transition-colors shadow-sm border border-border"
                  aria-label="Navegar para esquerda"
                >
                  <ChevronLeft className="w-4 h-4 text-foreground" />
                </button>
              )}

              {/* Container dos canais com scroll oculto */}
              <div
                ref={canaisContainerRef}
                onScroll={updateScrollButtons}
                className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {canais.map((canal) => (
                  <Button
                    key={canal.id}
                    variant="ghost"
                    size={
                      canal.id === canalAtivo ? "sm" : "icon"
                    }
                    active={canal.id === canalAtivo}
                    onClick={() => setCanalAtivo(canal.id)}
                    className={`${
                      canal.id === canalAtivo
                        ? "hidden @[380px]:flex"
                        : "size-8"
                    }`}
                    title={canal.nome}
                  >
                    <CanalIcon
                      tipo={canal.icon}
                      ativo={canal.id === canalAtivo}
                    />
                    {canal.id === canalAtivo && (
                      <span
                        className="font-medium whitespace-nowrap"
                        style={{ fontSize: "var(--text-sm)" }}
                      >
                        {canal.nome}
                      </span>
                    )}
                  </Button>
                ))}
              </div>

              {/* Botão Direita */}
              {canScrollRight && (
                <button
                  onClick={scrollRight}
                  className="absolute right-0 z-10 w-6 h-8 bg-card/95 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-muted transition-colors shadow-sm border border-border"
                  aria-label="Navegar para direita"
                >
                  <ChevronRight className="w-4 h-4 text-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Área de conteúdo principal - Email ou Mensagens */}
        {canalAtivo === "email" ? (
          // Modo Email: mostrar lista ou visualizador
          selectedEmailId ? (
            <EmailViewer
              emailId={selectedEmailId}
              onBack={() => setSelectedEmailId(null)}
            />
          ) : (
            <EmailList
              onEmailSelect={(id) => setSelectedEmailId(id)}
            />
          )
        ) : (
          // Modo Chat: mostrar mensagens normais
          <>
            {/* Área de mensagens com largura máxima de 600px */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="w-full mx-auto p-2 overflow-hidden min-w-0">
                {/* Indicador de data com divider */}
                <div className="flex items-center justify-center my-4 relative">
                  {/* Divider horizontal */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>

                  {/* Indicador TODAY sobreposto */}
                  <div className="relative bg-card px-4 py-1 rounded-full border border-border">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span
                        className="text-muted-foreground"
                        style={{ fontSize: "var(--text-xs)" }}
                      >
                        Hoje
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mensagens */}
                <div className="space-y-4">
                  {groupMessages(mensagensUsuario).map(
                    (group, groupIndex) => (
                      <div
                        key={`group-${groupIndex}`}
                        className="space-y-0.5"
                      >
                        {group.mensagens.map(
                          (mensagem, messageIndex) => {
                            let position: MessagePosition =
                              "single";

                            if (group.mensagens.length > 1) {
                              if (messageIndex === 0)
                                position = "first";
                              else if (
                                messageIndex ===
                                group.mensagens.length - 1
                              )
                                position = "last";
                              else position = "middle";
                            }

                            if (mensagem.tipo === "imagem") {
                              return (
                                <ImageMessage
                                  key={mensagem.id}
                                  mensagem={mensagem}
                                  position={position}
                                />
                              );
                            } else if (
                              mensagem.tipo === "localizacao"
                            ) {
                              return (
                                <LocationMessage
                                  key={mensagem.id}
                                  mensagem={mensagem}
                                  position={position}
                                />
                              );
                            } else if (
                              mensagem.tipo === "arquivo"
                            ) {
                              return (
                                <FileMessage
                                  key={mensagem.id}
                                  mensagem={mensagem}
                                  position={position}
                                />
                              );
                            } else if (
                              mensagem.tipo === "audio"
                            ) {
                              return (
                                <AudioMessage
                                  key={mensagem.id}
                                  mensagem={mensagem}
                                  position={position}
                                />
                              );
                            } else {
                              return (
                                <BalloonMessage
                                  key={mensagem.id}
                                  mensagem={mensagem}
                                  position={position}
                                  nomeCliente={
                                    atendimento?.cliente.nome
                                  }
                                />
                              );
                            }
                          },
                        )}
                      </div>
                    ),
                  )}
                </div>

                {/* Indicador de digitação */}
                {isTyping && (
                  <div className="flex justify-start mb-4">
                    <div className="max-w-[70%] mr-16">
                      <div
                        className="font-bold text-foreground mb-1"
                        style={{ fontSize: "var(--text-xs)" }}
                      >
                        {atendimento?.cliente.nome || "Cliente"}
                      </div>
                      <div className="bg-card rounded-md p-3 shadow-sm">
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div
                              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                              style={{
                                animationDelay: "150ms",
                              }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                              style={{
                                animationDelay: "300ms",
                              }}
                            ></div>
                          </div>
                          <span
                            className="text-muted-foreground ml-2"
                            style={{
                              fontSize: "var(--text-xs)",
                            }}
                          >
                            digitando...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input de mensagem */}
            {!readOnly && (
              <ChatInput
                value={mensagemTexto}
                onChange={setMensagemTexto}
                onSend={handleEnviarMensagem}
                onTypingChange={setIsTyping}
                onSendAudio={handleEnviarAudio}
              />
            )}
            {readOnly && (
              <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-border bg-muted/40">
                <span className="text-xs text-muted-foreground italic">
                  Modo visualização — apenas leitura
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Edição - Dados do Cliente */}
      <Dialog
        open={isEditClientDialogOpen}
        onOpenChange={setIsEditClientDialogOpen}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
            <DialogTitle>Editar Dados do Cliente</DialogTitle>
            <DialogDescription className="mb-2">
              Atualize as informações cadastrais do cliente.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Seção 1: DADOS BÁSICOS */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                Dados Básicos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome completo */}
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <div className="relative">
                    <Input
                      id="nome"
                      value={clientData.nome}
                      onChange={(e) =>
                        setClientData({
                          ...clientData,
                          nome: e.target.value,
                        })
                      }
                      className="pr-8"
                    />
                    {clientData.nome && (
                      <button
                        onClick={() =>
                          setClientData({
                            ...clientData,
                            nome: "",
                          })
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-200 transition-colors"
                        title="Limpar"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>

                {/* CPF */}
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <div className="relative">
                    <Input
                      id="cpf"
                      value={clientData.cpf}
                      onChange={(e) =>
                        setClientData({
                          ...clientData,
                          cpf: e.target.value,
                        })
                      }
                      className="pr-8"
                    />
                    {clientData.cpf && (
                      <button
                        onClick={() =>
                          setClientData({
                            ...clientData,
                            cpf: "",
                          })
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-200 transition-colors"
                        title="Limpar"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Separador */}
            <div className="border-t" />

            {/* Seção 2: E-MAILS */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                E-mails
              </h3>
              <div className="space-y-3">
                {/* E-mail principal */}
                <div className="space-y-2">
                  <Label htmlFor="emailPrincipal">
                    E-mail principal
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="emailPrincipal"
                      type="email"
                      value={clientData.emailPrincipal}
                      onChange={(e) =>
                        setClientData({
                          ...clientData,
                          emailPrincipal: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                    <button
                      onClick={() =>
                        handleSendEmail(
                          clientData.emailPrincipal,
                        )
                      }
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                      title="Enviar e-mail"
                    >
                      <Mail className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() =>
                        handleCopyValue(
                          clientData.emailPrincipal,
                        )
                      }
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                      title="Copiar"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* E-mail secundário */}
                <div className="space-y-2">
                  <Label htmlFor="emailSecundario">
                    E-mail secundário
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="emailSecundario"
                      type="email"
                      value={clientData.emailSecundario}
                      onChange={(e) =>
                        setClientData({
                          ...clientData,
                          emailSecundario: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                    <button
                      onClick={() =>
                        handleSendEmail(
                          clientData.emailSecundario,
                        )
                      }
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                      title="Enviar e-mail"
                    >
                      <Mail className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() =>
                        handleCopyValue(
                          clientData.emailSecundario,
                        )
                      }
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                      title="Copiar"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* E-mails adicionais */}
                {clientData.emailsAdicionais.map(
                  (email, index) => (
                    <div key={index} className="space-y-2">
                      <Label htmlFor={`emailAdicional${index}`}>
                        E-mail adicional {index + 1}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`emailAdicional${index}`}
                          type="email"
                          value={email}
                          onChange={(e) =>
                            handleUpdateEmail(
                              index,
                              e.target.value,
                            )
                          }
                          className="flex-1"
                          placeholder="email@exemplo.com"
                        />
                        <button
                          onClick={() => handleSendEmail(email)}
                          className={`p-2 rounded-md transition-colors ${
                            !email
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-gray-200"
                          }`}
                          title="Enviar e-mail"
                          disabled={!email}
                        >
                          <Mail className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleCopyValue(email)}
                          className={`p-2 rounded-md transition-colors ${
                            !email
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-gray-200"
                          }`}
                          title="Copiar"
                          disabled={!email}
                        >
                          <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveEmail(index)
                          }
                          className="p-2 rounded-full bg-destructive hover:bg-destructive/90 transition-colors"
                          title="Remover e-mail"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  ),
                )}

                {/* Botão para adicionar novo e-mail */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddEmail}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo e-mail
                </Button>
              </div>
            </div>

            {/* Separador */}
            <div className="border-t" />

            {/* Seção 3: TELEFONES */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                Telefones
              </h3>
              <div className="space-y-3">
                {/* Telefone principal */}
                <div className="space-y-2">
                  <Label htmlFor="telefonePrincipal">
                    Telefone principal
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="telefonePrincipal"
                      value={clientData.telefonePrincipal}
                      onChange={(e) =>
                        setClientData({
                          ...clientData,
                          telefonePrincipal: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                    <button
                      onClick={() =>
                        handleCall(clientData.telefonePrincipal)
                      }
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                      title="Ligar"
                    >
                      <Phone className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() =>
                        handleCopyValue(
                          clientData.telefonePrincipal,
                        )
                      }
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                      title="Copiar"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Telefone secundário */}
                <div className="space-y-2">
                  <Label htmlFor="telefoneSecundario">
                    Telefone secundário
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="telefoneSecundario"
                      value={clientData.telefoneSecundario}
                      onChange={(e) =>
                        setClientData({
                          ...clientData,
                          telefoneSecundario: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                    <button
                      onClick={() =>
                        handleCall(
                          clientData.telefoneSecundario,
                        )
                      }
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                      title="Ligar"
                    >
                      <Phone className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() =>
                        handleCopyValue(
                          clientData.telefoneSecundario,
                        )
                      }
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                      title="Copiar"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Telefones adicionais */}
                {clientData.telefonesAdicionais.map(
                  (telefone, index) => (
                    <div key={index} className="space-y-2">
                      <Label
                        htmlFor={`telefoneAdicional${index}`}
                      >
                        Telefone adicional {index + 1}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`telefoneAdicional${index}`}
                          value={telefone}
                          onChange={(e) =>
                            handleUpdateTelefone(
                              index,
                              e.target.value,
                            )
                          }
                          className="flex-1"
                          placeholder="(00) 0 0000-0000"
                        />
                        <button
                          onClick={() => handleCall(telefone)}
                          className={`p-2 rounded-md transition-colors ${
                            !telefone
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-gray-200"
                          }`}
                          title="Ligar"
                          disabled={!telefone}
                        >
                          <Phone className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() =>
                            handleCopyValue(telefone)
                          }
                          className={`p-2 rounded-md transition-colors ${
                            !telefone
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-gray-200"
                          }`}
                          title="Copiar"
                          disabled={!telefone}
                        >
                          <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveTelefone(index)
                          }
                          className="p-2 rounded-full bg-destructive hover:bg-destructive/90 transition-colors"
                          title="Remover telefone"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  ),
                )}

                {/* Botão para adicionar novo telefone */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddTelefone}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo telefone
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 border-t border-border px-6 py-4 bg-muted/30">
            <Button
              variant="outline"
              onClick={() => setIsEditClientDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="brand" onClick={handleSaveClient}>
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}