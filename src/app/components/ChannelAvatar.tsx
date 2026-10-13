import { Avatar, AvatarFallback } from "./ui/avatar";
import svgPaths from "../imports/svg-puq4f9kx8l";

// Tipos de canal disponíveis
export type ChannelType =
  | "whatsapp"
  | "webchat"
  | "messenger"
  | "instagram"
  | "telegram"
  | "email"
  | "rcs";

// Função para renderizar ícones SVG customizados para cada canal
function getChannelIcon(channel: ChannelType, color: string = "white") {
  switch (channel) {
    case "whatsapp":
      return (
        <svg
          className="w-3 h-3"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 20 20"
        >
          <path d={svgPaths.p1396f400} fill={color} />
        </svg>
      );
    case "webchat":
      return (
        <svg
          className="w-3 h-3"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 20 20"
        >
          <path d={svgPaths.p1f58c900} fill={color} />
        </svg>
      );
    case "instagram":
      return (
        <svg
          className="w-3 h-3"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 20 20"
        >
          <circle cx="10" cy="10" r="3" fill={color} />
          <path d="M10 2C7.8 2 7.5 2 6.5 2.1C5.5 2.1 4.8 2.3 4.2 2.6C3.6 2.9 3.1 3.4 2.6 4.2C2.3 4.8 2.1 5.5 2.1 6.5C2 7.5 2 7.8 2 10C2 12.2 2 12.5 2.1 13.5C2.1 14.5 2.3 15.2 2.6 15.8C2.9 16.4 3.4 16.9 4.2 17.4C4.8 17.7 5.5 17.9 6.5 17.9C7.5 18 7.8 18 10 18C12.2 18 12.5 18 13.5 17.9C14.5 17.9 15.2 17.7 15.8 17.4C16.4 17.1 16.9 16.6 17.4 15.8C17.7 15.2 17.9 14.5 17.9 13.5C18 12.5 18 12.2 18 10C18 7.8 18 7.5 17.9 6.5C17.9 5.5 17.7 4.8 17.4 4.2C17.1 3.6 16.6 3.1 15.8 2.6C15.2 2.3 14.5 2.1 13.5 2.1C12.5 2 12.2 2 10 2Z" stroke={color} strokeWidth="0.5" fill="none" />
        </svg>
      );
    case "email":
      return (
        <svg
          className="w-3 h-3"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 20 20"
        >
          <path
            clipRule="evenodd"
            d={svgPaths.p1af1a500}
            fill={color}
            fillRule="evenodd"
          />
        </svg>
      );
    case "messenger":
      return (
        <svg
          className="w-3 h-3"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 20 20"
        >
          <path d="M10 2C5.6 2 2 5.3 2 9.4C2 11.4 2.9 13.2 4.4 14.4V18L7.7 16.2C8.4 16.4 9.2 16.5 10 16.5C14.4 16.5 18 13.2 18 9.4C18 5.3 14.4 2 10 2ZM11 11.8L8.9 9.6L4.8 11.8L9.4 6.9L11.5 9.1L15.6 6.9L11 11.8Z" fill={color} />
        </svg>
      );
    case "telegram":
      return (
        <svg
          className="w-3 h-3"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 20 20"
        >
          <path d="M2.1 9.2L16.9 3.6C17.7 3.3 18.4 3.8 18.1 5L15.3 16.7C15.1 17.5 14.6 17.7 14 17.4L10.5 14.8L8.6 16.6C8.4 16.8 8.2 17 7.8 17L8 13.4L14.8 7.4C15.1 7.1 14.7 6.9 14.3 7.2L5.9 12.3L2.5 11.2C1.7 11 1.7 10.4 2.7 10L2.1 9.2Z" fill={color} />
        </svg>
      );
    case "rcs":
      return (
        <svg
          className="w-3 h-3"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 20 20"
        >
          <path d="M4 4H16C17.1 4 18 4.9 18 6V14C18 15.1 17.1 16 16 16H6L2 18V6C2 4.9 2.9 4 4 4ZM7 9H9V11H7V9ZM11 9H13V11H11V9Z" fill={color} />
        </svg>
      );
    default:
      return null;
  }
}

// Mapeamento de cores para cada canal - cores específicas dos canais
const channelColors = {
  whatsapp: "bg-[#25D366]", // Verde WhatsApp oficial
  webchat: "bg-gray-500", // Cinza
  messenger: "bg-[#0084FF]", // Azul Messenger oficial
  instagram: "bg-[#E4405F]", // Roxo/Rosa Instagram oficial
  telegram: "bg-[#0088CC]", // Azul Telegram oficial
  email: "bg-[#34A853]", // Verde Email (Google)
  rcs: "bg-[#FFAB00]", // Amarelo/Laranja RCS
};

interface ChannelAvatarProps {
  nome: string;
  /** Sem canal, o badge não é exibido */
  channel?: ChannelType;
  /** "md": 36px (listas do Collab) · "sm": 28px (comentários internos) */
  size?: "default" | "md" | "sm";
  /** Cor do indicador de presença (canto inferior direito) */
  statusColor?: string;
  className?: string;
}

// Função para gerar iniciais do nome
function getInitials(nome: string): string {
  return nome
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

// Função para retornar cor neutra usando tokens do design system
function getAvatarColor(nome: string): string {
  return "bg-muted"; // Cinza claro do design system
}

export default function ChannelAvatar({
  nome,
  channel,
  size = "default",
  statusColor,
  className = "",
}: ChannelAvatarProps) {
  const sizeClasses = {
    default: { avatar: "w-12 h-12", text: "text-sm border-2 border-background" },
    md: { avatar: "w-9 h-9", text: "text-xs border border-background" },
    sm: { avatar: "w-7 h-7", text: "text-[10px] border border-background" },
  }[size];

  return (
    <div className={`relative h-fit w-fit ${className}`}>
      {/* Avatar principal */}
      <Avatar className={sizeClasses.avatar}>
        <AvatarFallback
          className={`${getAvatarColor(nome)} text-muted-foreground font-medium ${sizeClasses.text}`}
        >
          {getInitials(nome)}
        </AvatarFallback>
      </Avatar>

      {/* Indicador de presença no canto inferior direito */}
      {statusColor && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-background ${size === "default" ? "w-3.5 h-3.5" : "w-2.5 h-2.5"}`}
          style={{ backgroundColor: statusColor }}
        />
      )}

      {/* Ícone do canal no canto inferior direito */}
      {channel && (
        <div
          className={`absolute bottom-0 right-0 translate-x-0.5 translate-y-0.5 ${channelColors[channel]} rounded-full size-5 flex items-center justify-center border-2 border-background`}
        >
          {getChannelIcon(channel, "white")}
        </div>
      )}
    </div>
  );
}