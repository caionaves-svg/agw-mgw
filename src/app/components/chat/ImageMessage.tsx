import { Balloon, MessagePosition, Remetente } from "./Balloon";

/**
 * COMPONENTE: ImageMessage
 *
 * Renderiza um balão com imagem e legenda opcional.
 *
 * @param mensagem - Objeto com dados da mensagem
 * @param position - Posição no grupo
 */
export interface ImageMessageProps {
  mensagem: {
    id: string;
    texto: string;
    remetente: Remetente;
    timestamp: string;
    status?: string;
    imagemUrl?: string;
    imagemLegenda?: string;
  };
  position: MessagePosition;
}

export function ImageMessage({
  mensagem,
  position,
}: ImageMessageProps) {
  const isAtendente = mensagem.remetente === "atendente";

  return (
    <Balloon
      remetente={mensagem.remetente}
      position={position}
      timestamp={mensagem.timestamp}
      status={mensagem.status}
      innerClassName="overflow-hidden"
      footerClassName="px-2 pb-2" // Padding padrão para footer
    >
      {/* ========== IMAGEM ========== */}
      <img
        src={mensagem.imagemUrl}
        alt={mensagem.imagemLegenda || mensagem.texto}
        className="w-full h-auto object-cover max-h-96"
      />

      {/* ========== LEGENDA (se houver) ========== */}
      {mensagem.imagemLegenda && (
        <div className="p-2">
          <p
            className="text-muted-foreground whitespace-pre-line"
            style={{ fontSize: "var(--text-sm)" }}
          >
            {mensagem.imagemLegenda}
          </p>
        </div>
      )}
    </Balloon>
  );
}