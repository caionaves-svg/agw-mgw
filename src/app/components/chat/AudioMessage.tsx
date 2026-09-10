import { useState, useRef } from "react";
import { Balloon, MessagePosition, Remetente } from "./Balloon";
import {
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

/**
 * COMPONENTE: AudioMessage
 *
 * Renderiza um balão com player de áudio estilo WhatsApp.
 * Inclui forma de onda animada e transcrição colapsável opcional.
 *
 * ESPECIAL: Quando há transcrição, o footer (timestamp + status)
 * é exibido na mesma linha do botão de toggle da transcrição.
 *
 * @param mensagem - Objeto com dados da mensagem
 * @param position - Posição no grupo
 */
export interface AudioMessageProps {
  mensagem: {
    id: string;
    texto: string;
    remetente: Remetente;
    timestamp: string;
    status?: string;
    duracao?: string;
    transcricao?: string;
  };
  position: MessagePosition;
}

export function AudioMessage({
  mensagem,
  position,
}: AudioMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscription, setShowTranscription] =
    useState(false);
  const waveformRef = useRef<HTMLDivElement>(null);
  const isAtendente = mensagem.remetente === "atendente";

  // Número fixo de barras otimizado para largura w-96 (384px)
  const numBars = 50;

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    // AudioMessage usa largura responsiva para não ultrapassar o container
    <div
      className={`flex min-w-0 ${isAtendente ? "justify-end" : "justify-start"}`}
    >
      <div className="max-w-[85%] min-w-0 w-full">
        <Balloon
          remetente={mensagem.remetente}
          position={position}
          timestamp={mensagem.timestamp}
          status={mensagem.status}
          innerClassName="overflow-hidden"
          showFooter={!mensagem.transcricao} // ← Footer automático apenas SEM transcrição
          footerClassName="px-2 pb-2"
        >
          {/* ========== PLAYER DE ÁUDIO ========== */}
          <div className="p-2 flex items-center gap-2 min-w-0">
            {/* Botão Play/Pause */}
            <button
              onClick={togglePlay}
              className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isAtendente
                  ? "bg-primary hover:bg-primary/90"
                  : "bg-gray-200 hover:bg-gray-300"
              } transition-colors`}
            >
              {isPlaying ? (
                <Pause
                  className={`w-4 h-4 ${
                    isAtendente ? "text-white" : "text-gray-700"
                  }`}
                />
              ) : (
                <Play
                  className={`w-4 h-4 ${
                    isAtendente ? "text-white" : "text-gray-700"
                  } ml-0.5`}
                />
              )}
            </button>

            {/* Forma de onda (simulada) */}
            <div
              className="flex-1 flex items-center gap-0.5 h-8 min-w-0 overflow-hidden"
              ref={waveformRef}
            >
              {[...Array(numBars)].map((_, i) => {
                // Gerar padrão de alturas de forma cíclica
                const heightPatterns = [
                  4, 8, 12, 16, 14, 10, 8, 12, 16, 14, 12, 10,
                  14, 16, 12, 8, 10, 12, 8, 4,
                ];
                const playingPatterns = [
                  8, 14, 10, 18, 12, 16, 10, 14, 20, 16, 14, 12,
                  16, 18, 14, 10, 12, 14, 10, 6,
                ];

                const baseHeight =
                  heightPatterns[i % heightPatterns.length];
                const playingHeight =
                  playingPatterns[i % playingPatterns.length];

                return (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      isAtendente ? "bg-primary" : "bg-gray-400"
                    } ${isPlaying ? "animate-pulse" : ""}`}
                    style={{
                      height: `${isPlaying ? playingHeight : baseHeight}px`,
                      animationDelay: `${(i * 50) % 1000}ms`,
                      animationDuration: `${800 + (i % 3) * 200}ms`,
                    }}
                  />
                );
              })}
            </div>

            {/* Duração */}
            <span
              className="shrink-0 text-muted-foreground font-medium tabular-nums"
              style={{ fontSize: "var(--text-xs)" }}
            >
              {mensagem.duracao}
            </span>
          </div>

          {/* ========== TRANSCRIÇÃO (colapsável) ========== */}
          {mensagem.transcricao && (
            <div className="px-2 pb-2 border-t border-border/50">
              {/* Linha com botão toggle (esquerda) e timestamp/status (direita) - MESMA LINHA */}
              <div className="flex items-center justify-between py-1">
                {/* Botão toggle */}
                <button
                  onClick={() =>
                    setShowTranscription(!showTranscription)
                  }
                  className="flex items-center gap-1 text-primary hover:text-primary/90 transition-colors"
                >
                  {showTranscription ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                  <span
                    className="font-medium"
                    style={{ fontSize: "var(--text-xs)" }}
                  >
                    {showTranscription
                      ? "Ocultar transcrição"
                      : "Ver transcrição"}
                  </span>
                </button>

                {/* Timestamp e Status - INLINE na mesma linha */}
                <div className="flex items-center gap-1">
                  <span
                    className="text-muted-foreground"
                    style={{ fontSize: "var(--text-xs)" }}
                  >
                    {mensagem.timestamp}
                  </span>
                  {/* Status icons - mesma lógica do Balloon */}
                  {isAtendente &&
                    mensagem.status === "lido" && (
                      <svg
                        className="w-4 h-4 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 13l4 4L23 7"
                        />
                      </svg>
                    )}
                  {isAtendente &&
                    mensagem.status === "enviado" && (
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                </div>
              </div>

              {/* Texto da transcrição com animação */}
              {showTranscription && (
                <p
                  className="text-muted-foreground whitespace-pre-line animate-in fade-in slide-in-from-top-2 duration-200 mt-1"
                  style={{ fontSize: "var(--text-sm)" }}
                >
                  {mensagem.transcricao}
                </p>
              )}
            </div>
          )}
        </Balloon>
      </div>
    </div>
  );
}