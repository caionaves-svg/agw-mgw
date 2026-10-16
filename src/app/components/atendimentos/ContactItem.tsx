import {
  Check,
  Headset,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Pin,
  PinOff,
} from "lucide-react";
import ChannelAvatar from "../ChannelAvatar";
import CaseIdBadge from "../CaseIdBadge";
import { useData, Usuario } from "../../contexts/DataContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Badge } from "../ui/badge";

interface ContactItemProps {
  contato: Usuario;
  onClick?: () => void;
  isSelected?: boolean;
  onClose?: (id: string) => void;
  isEmAtendimento?: boolean;
  isPinned?: boolean;
  onPin?: (id: string) => void;
}

export function ContactItem({
  contato,
  onClick,
  isSelected,
  onClose,
  isEmAtendimento,
  isPinned = false,
  onPin,
}: ContactItemProps) {
  const dataContext = useData();

  // Detectar se a última mensagem foi enviada ou recebida
  const historicoConversa = dataContext?.conversas?.find(
    (h) => h.usuarioId === contato.id,
  );
  const mensagens = historicoConversa?.mensagens || [];
  const ultimaMensagem = mensagens[mensagens.length - 1];

  // Balão azul = atendente = Enviada (↗)
  // Balão branco = cliente = Recebida (↘)
  const isEnviada = ultimaMensagem?.remetente === "atendente";

  // Gerar horário mockado baseado no ID (para consistência)
  const gerarHorarioMock = () => {
    const agora = new Date();

    // Mapeamento de IDs específicos para tempos específicos
    const mapaTempos: Record<string, number> = {
      "156482": 1, // Ricardo Pereira - há 1min
      "742130": 15, // Ana Takahashi - há 15min
      "324567": 45, // há 45min
      "987654": 90, // há 1h30min (90min = 1h)
      "654321": 180, // há 3h
      "789012": 360, // há 6h
      "234567": 720, // há 12h
      "345678": 1440, // há 1d (1440min = 24h)
      "456789": 2880, // há 2d
      "567890": 4320, // há 3d
      "123890": 20160, // Fernando Costa - há 2sem (14 dias = 20160min)
      "890123": 30240, // há 3sem
      "901234": 43200, // há 1m (30 dias)
    };

    // Pegar tempo do mapa ou calcular um padrão
    let minutosAtras = mapaTempos[contato.id];

    if (!minutosAtras) {
      // Fallback: usar ID para gerar tempo variado (entre 1 e 120 minutos)
      const idNum = parseInt(contato.id) || 1;
      minutosAtras = ((idNum * 7) % 120) + 1;
    }

    const horarioMensagem = new Date(
      agora.getTime() - minutosAtras * 60000,
    );
    return { horarioMensagem, minutosAtras };
  };

  const { horarioMensagem, minutosAtras } = gerarHorarioMock();

  // Formatar tempo relativo
  const formatarTempoRelativo = (minutos: number) => {
    if (minutos < 1) return "há 1s";
    if (minutos < 60) return `há ${minutos}min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `há ${horas}h`;
    const dias = Math.floor(horas / 24);
    if (dias === 1) return "há 1d";
    if (dias < 7) return `há ${dias}d`;
    const semanas = Math.floor(dias / 7);
    if (semanas === 1) return "há 1sem";
    if (semanas < 4) return `há ${semanas}sem`;
    const meses = Math.floor(dias / 30);
    return `há ${meses}m`;
  };

  // Formatar horário completo para tooltip
  const formatarHorarioCompleto = () => {
    const horas = horarioMensagem.getHours();
    const minutos = horarioMensagem.getMinutes();
    const horarioFormatado = `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;

    const direcao = isEnviada ? "Enviado" : "Recebido";
    const tempoRelativo = formatarTempoRelativo(minutosAtras);
    return `${direcao} ${tempoRelativo}. Hoje às ${horarioFormatado}`;
  };

  const tempoRelativo = formatarTempoRelativo(minutosAtras);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o click abra o chat
    if (onClose) {
      onClose(contato.id);
    }
  };

  // Mapeia cores das tags para variantes do Badge
  const getTagVariant = (tag: {
    label: string;
    color: string;
    textColor: string;
  }):
    | "default"
    | "gray"
    | "red"
    | "yellow"
    | "green"
    | "blue"
    | "indigo"
    | "purple"
    | "pink"
    | "success"
    | "warning"
    | "destructive"
    | "info" => {
    // Mapeamento por label (mais preciso)
    const labelMap: Record<string, any> = {
      Urgente: "destructive",
      Reclamação: "destructive",
      Confirmado: "success",
      VIP: "purple",
      Atualização: "warning",
      Pendente: "yellow",
      Novo: "blue",
      Resolvido: "green",
    };

    if (labelMap[tag.label]) {
      return labelMap[tag.label];
    }

    // Fallback: mapear por cor (caso não tenha label conhecido)
    const colorLower = tag.color.toLowerCase();
    if (
      colorLower.includes("#fee2e2") ||
      colorLower.includes("red")
    )
      return "red";
    if (
      colorLower.includes("#d1fae5") ||
      colorLower.includes("green")
    )
      return "green";
    if (
      colorLower.includes("#fef3c7") ||
      colorLower.includes("yellow")
    )
      return "yellow";
    if (
      colorLower.includes("#e0e7ff") ||
      colorLower.includes("purple") ||
      colorLower.includes("indigo")
    )
      return "purple";
    if (
      colorLower.includes("#dbeafe") ||
      colorLower.includes("blue")
    )
      return "blue";

    return "default";
  };

  return (
    <div
      className={`group flex items-center gap-3 p-2 cursor-pointer rounded-xl transition-colors m-1 relative ${
        isSelected
          ? "bg-muted border-border"
          : "hover:bg-accent"
      }`}
      onClick={onClick}
    >
      {/* Avatar com canal */}
      <div className="flex-shrink-0">
        <ChannelAvatar
          nome={contato.nome}
          channel={contato.channel}
        />
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 min-w-1">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground font-medium leading-tight flex items-center gap-2">
            <span
              className="truncate"
              style={{ fontSize: "var(--text-sm)" }}
            >
              {contato.nome}
            </span>
            <CaseIdBadge casoId={contato.id} clienteNome={contato.nome} />
          </h3>
          <div className="flex items-center gap-2">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
                    {isEnviada ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {tempoRelativo}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p className="text-xs">
                    {formatarHorarioCompleto()}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {contato.notificacoes && (
              <div className="bg-destructive text-destructive-foreground text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
                {contato.notificacoes > 9
                  ? "9+"
                  : contato.notificacoes}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p
            className={`text-sm truncate ${contato.status === "lida" ? "text-muted-foreground/70" : "text-muted-foreground"}`}
          >
            {dataContext.getUltimaMensagemByUsuarioId(
              contato.id,
            )}
          </p>
          {contato.status === "lida" && (
            <Check className="w-4 h-4 text-primary flex-shrink-0 ml-2" />
          )}
        </div>

        {/* Atendente */}
        {contato.atendente && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center gap-1">
              <Headset
                className="w-3 h-3"
                style={{ color: contato.atendente.cor }}
              />
            </div>
            <span
              className="text-xs"
              style={{ color: contato.atendente.cor }}
            >
              {contato.atendente.nome}
            </span>
          </div>
        )}

        {/* Tags */}
        <div className="flex items-center gap-1 mt-1">
          {contato.tags && contato.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {contato.tags.slice(0, 2).map((tag, index) => (
                <Badge
                  key={index}
                  variant={getTagVariant(tag)}
                  size="sm"
                  shape="rounded"
                >
                  {tag.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ações no hover — animação de largura para não ocupar espaço quando oculto */}
      <div className="flex items-center flex-shrink-0">
        {/* Pin — largura 0 quando não fixado, expande no hover; sempre visível quando fixado */}
        {onPin && (
          <TooltipProvider delayDuration={400}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPin(contato.id);
                  }}
                  className={`overflow-hidden rounded-lg transition-all duration-200 flex items-center justify-center ${
                    isPinned
                      ? "w-6 h-6 p-1 text-muted-foreground hover:bg-muted"
                      : "w-0 h-6 p-0 opacity-0 group-hover:w-6 group-hover:p-1 group-hover:opacity-100 text-muted-foreground hover:bg-muted hover:text-brand-primary"
                  }`}
                >
                  {isPinned ? (
                    <PinOff className="w-3.5 h-3.5 flex-shrink-0" />
                  ) : (
                    <Pin className="w-3.5 h-3.5 flex-shrink-0" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs font-medium">
                  {isPinned ? "Desafixar conversa" : "Fixar conversa"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Devolver ao Backlog — só em Em Atendimento, sempre via animação de largura */}
        {isEmAtendimento && (
          <TooltipProvider delayDuration={400}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleClose}
                  className="w-0 h-6 p-0 overflow-hidden opacity-0 group-hover:w-6 group-hover:p-1 group-hover:opacity-100 rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive transition-all duration-200 flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5 flex-shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs font-medium">Devolver ao Backlog</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}