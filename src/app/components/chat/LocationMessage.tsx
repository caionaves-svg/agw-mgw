import { Balloon, MessagePosition, Remetente } from "./Balloon";
import { MapPin } from "lucide-react";

/**
 * COMPONENTE: LocationMessage
 *
 * Renderiza um balão com localização (mapa + endereço).
 *
 * @param mensagem - Objeto com dados da mensagem
 * @param position - Posição no grupo
 */
export interface LocationMessageProps {
  mensagem: {
    id: string;
    texto: string;
    remetente: Remetente;
    timestamp: string;
    status?: string;
    localizacao?: {
      latitude: number;
      longitude: number;
      nome?: string;
      endereco?: string;
    };
  };
  position: MessagePosition;
}

export function LocationMessage({
  mensagem,
  position,
}: LocationMessageProps) {
  const isAtendente = mensagem.remetente === "atendente";

  const handleOpenMap = () => {
    if (mensagem.localizacao) {
      const url = `https://www.google.com/maps?q=${mensagem.localizacao.latitude},${mensagem.localizacao.longitude}`;
      window.open(url, "_blank");
    }
  };

  return (
    <Balloon
      remetente={mensagem.remetente}
      position={position}
      timestamp={mensagem.timestamp}
      status={mensagem.status}
      innerClassName="overflow-hidden"
      footerClassName="px-2 pb-2" // Padding padrão
    >
      {/* ========== MAPA ESTÁTICO ========== */}
      <div className="relative w-full h-48 bg-gray-200">
        {/* Imagem de mapa estático do Google Maps */}
        <img
          src={`https://maps.googleapis.com/maps/api/staticmap?center=${mensagem.localizacao?.latitude},${mensagem.localizacao?.longitude}&zoom=15&size=400x300&markers=color:red%7C${mensagem.localizacao?.latitude},${mensagem.localizacao?.longitude}&key=YOUR_API_KEY`}
          alt="Mapa"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback: mostrar mapa cinza com ícone
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement!.classList.add(
              "flex",
              "items-center",
              "justify-center",
            );
          }}
        />

        {/* Ícone de pin no centro (fallback) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <MapPin className="w-12 h-12 text-red-500 drop-shadow-lg" />
        </div>
      </div>

      {/* ========== INFORMAÇÕES DA LOCALIZAÇÃO ========== */}
      <div className="p-2">
        {mensagem.localizacao?.nome && (
          <p
            className="font-medium text-foreground mb-1"
            style={{ fontSize: "var(--text-sm)" }}
          >
            {mensagem.localizacao.nome}
          </p>
        )}
        <p
          className="text-muted-foreground whitespace-pre-line mb-2"
          style={{ fontSize: "var(--text-xs)" }}
        >
          {mensagem.localizacao?.endereco}
        </p>
      </div>
    </Balloon>
  );
}