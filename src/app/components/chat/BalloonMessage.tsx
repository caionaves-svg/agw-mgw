import { Balloon, MessagePosition, Remetente } from "./Balloon";
import { QuotedMessagePreview } from "./QuotedMessagePreview";

/**
 * COMPONENTE: BalloonMessage
 *
 * Renderiza um balão de mensagem de texto simples.
 *
 * RECURSOS:
 * - Usa o componente base Balloon para layout/cores/footer
 * - Suporta quebras de linha (whitespace-pre-line)
 * - Timestamp e status gerenciados automaticamente pelo Balloon
 *
 * @param mensagem - Objeto com dados da mensagem
 * @param position - Posição no grupo
 */
export interface BalloonMessageProps {
  mensagem: {
    id: string;
    texto: string;
    remetente: Remetente;
    timestamp: string;
    status?: string;
    reactions?: { emoji: string; count: number; users: string[] }[];
    respondendoA?: { autorNome: string; texto: string };
  };
  position: MessagePosition;
  nomeCliente?: string; // Compatibilidade com uso antigo
  onReaction?: (emoji: string) => void;
  onReply?: () => void;
  onForward?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onFavorite?: () => void;
}

export function BalloonMessage({
  mensagem,
  position,
  onReaction,
  onReply,
  onForward,
  onCopy,
  onDelete,
  onFavorite,
}: BalloonMessageProps) {
  return (
    <Balloon
      remetente={mensagem.remetente}
      position={position}
      timestamp={mensagem.timestamp}
      status={mensagem.status}
      reactions={mensagem.reactions}
      onReaction={onReaction}
      onReply={onReply}
      onForward={onForward}
      onCopy={onCopy}
      onDelete={onDelete}
      onFavorite={onFavorite}
      innerClassName="p-2"
      footerClassName="mt-2" // Footer sem padding lateral (já tem p-2 no container)
    >
      {/* ========== TEXTO DA MENSAGEM ========== */}
      {/*
        font-medium: Peso médio (500)
        leading-[1.3]: Espaçamento entre linhas reduzido
        whitespace-pre-line: Preserva quebras de linha (\n)
        fontSize: Usa variável CSS para acessibilidade
      */}
      {mensagem.respondendoA && (
        <QuotedMessagePreview
          autorNome={mensagem.respondendoA.autorNome}
          texto={mensagem.respondendoA.texto}
        />
      )}
      <div
        className="text-muted-foreground whitespace-pre-line"
        style={{ fontSize: "var(--text-sm)" }}
      >
        {mensagem.texto}
      </div>
    </Balloon>
  );
}