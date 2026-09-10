import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Paperclip,
  Smile,
  SendHorizontal,
  Mic,
  Bold,
  Italic,
  Link,
} from "lucide-react";
import { Button } from "../ui/button";

interface InternalCommentsSectionProps {
  onClose: () => void;
}

interface Comment {
  id: string;
  autor: string;
  timestamp: string;
  texto: string;
  respostas?: Comment[];
}

export function InternalCommentsSection({
  onClose,
}: InternalCommentsSectionProps) {
  const [comentarios, setComentarios] = useState<Comment[]>([
    {
      id: "1",
      autor: "Maria Silva",
      timestamp: "14:35",
      texto:
        "Cliente solicitou cancelamento de serviço. Protocolo de cancelamento iniciado.",
      respostas: [
        {
          id: "1-1",
          autor: "João Santos",
          timestamp: "14:40",
          texto:
            "Validado protocolo e enviado para financeiro.",
          respostas: [
            {
              id: "1-1-1",
              autor: "Maria Silva",
              timestamp: "14:45",
              texto: "Perfeito! Vou acompanhar o processo.",
            },
          ],
        },
      ],
    },
    {
      id: "2",
      autor: "Carlos Oliveira",
      timestamp: "15:20",
      texto:
        "Cliente está aguardando retorno sobre a contestação da fatura.",
      respostas: [
        {
          id: "2-1",
          autor: "Ana Costa",
          timestamp: "15:25",
          texto:
            "Já estou verificando com o financeiro. Retorno em breve.",
        },
      ],
    },
    {
      id: "3",
      autor: "Pedro Alves",
      timestamp: "16:10",
      texto:
        "Atendimento finalizado com sucesso. Cliente satisfeito com a resolução.",
    },
  ]);

  const [respondendoId, setRespondendoId] = useState<
    string | null
  >(null);
  const [textoResposta, setTextoResposta] = useState("");
  const [textoNovoComentario, setTextoNovoComentario] =
    useState("");
  const textareaRespostaRef = useRef<HTMLTextAreaElement>(null);
  const textareaNovoRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea de resposta
  useEffect(() => {
    if (textareaRespostaRef.current) {
      textareaRespostaRef.current.style.height = "40px";
      textareaRespostaRef.current.style.height =
        textareaRespostaRef.current.scrollHeight + "px";
    }
  }, [textoResposta]);

  // Auto-resize textarea novo comentário
  useEffect(() => {
    if (textareaNovoRef.current) {
      textareaNovoRef.current.style.height = "40px";
      textareaNovoRef.current.style.height =
        textareaNovoRef.current.scrollHeight + "px";
    }
  }, [textoNovoComentario]);

  const handleResponder = (comentarioId: string) => {
    setRespondendoId(comentarioId);
    setTextoResposta("");
  };

  const handleCancelarResposta = () => {
    setRespondendoId(null);
    setTextoResposta("");
  };

  const handleEnviarResposta = () => {
    if (!textoResposta.trim() || !respondendoId) return;

    // Lógica para adicionar resposta
    console.log(
      "Enviando resposta:",
      textoResposta,
      "para comentário:",
      respondendoId,
    );

    setRespondendoId(null);
    setTextoResposta("");
  };

  const handleEnviarNovoComentario = () => {
    if (!textoNovoComentario.trim()) return;

    const novoComentario: Comment = {
      id: Date.now().toString(),
      autor: "Você",
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      texto: textoNovoComentario,
    };

    setComentarios([...comentarios, novoComentario]);
    setTextoNovoComentario("");
  };

  const handleKeyPress = (
    e: React.KeyboardEvent,
    callback: () => void,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      callback();
    }
  };

  const renderComment = (
    comment: Comment,
    level: number = 0,
  ) => {
    const isRespondendo = respondendoId === comment.id;
    const marginLeft =
      level === 0 ? "" : level === 1 ? "ml-8" : "ml-16";
    const borderLeft =
      level > 0 ? "border-l-2 border-border pl-3" : "";

    return (
      <div key={comment.id} className={`${marginLeft}`}>
        <div className={`${borderLeft} py-2`}>
          {/* Header do comentário */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-foreground font-normal">
                {comment.autor}
              </span>
              <span className="text-sm text-muted-foreground">
                {comment.timestamp}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed break-words">
              {comment.texto}
            </p>
            {/* Botão Responder - apenas se não estiver no nível 2 */}
            {level < 2 && (
              <button
                onClick={() => handleResponder(comment.id)}
                className="text-sm text-brand-primary hover:underline mt-1"
              >
                Responder
              </button>
            )}
          </div>

          {/* Campo de resposta */}
          {isRespondendo && (
            <div className="mt-2 ml-10">
              <div className="bg-[#f0f2f5] rounded-[8px] p-2">
                <div className="flex items-end gap-2 bg-background rounded-[8px] shadow-sm px-3 py-2 border border-[#e6e6e6]">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="shrink-0 p-2"
                  >
                    <Paperclip className="w-5 h-5 text-[#465459]" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="lg"
                    className="shrink-0 p-2"
                  >
                    <Smile className="w-5 h-5 text-[#465459]" />
                  </Button>

                  <div className="flex-1 flex items-center">
                    <textarea
                      ref={textareaRespostaRef}
                      value={textoResposta}
                      onChange={(e) =>
                        setTextoResposta(e.target.value)
                      }
                      onKeyPress={(e) =>
                        handleKeyPress(e, handleEnviarResposta)
                      }
                      placeholder="Digite sua resposta..."
                      className="w-full resize-none h-10 min-h-10 bg-transparent border-0 px-2 py-2 text-sm text-[#465459] placeholder:text-[#a4a4a4] focus:outline-none focus:ring-0 transition-all duration-200 custom-scrollbar"
                      rows={1}
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelarResposta}
                    className="shrink-0 p-2 text-[#8f8f8f] hover:text-[#465459]"
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  <Button
                    variant={
                      textoResposta.trim() ? "brand" : "ghost"
                    }
                    size="lg"
                    className="shrink-0 p-2"
                    onClick={
                      textoResposta.trim()
                        ? handleEnviarResposta
                        : undefined
                    }
                  >
                    {textoResposta.trim() ? (
                      <SendHorizontal className="w-5 h-5 text-white" />
                    ) : (
                      <Mic className="w-5 h-5 text-[#465459]" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Renderizar respostas recursivamente */}
        {comment.respostas && comment.respostas.length > 0 && (
          <div>
            {comment.respostas.map((resposta) =>
              renderComment(resposta, level + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-background rounded-xl overflow-hidden h-full flex flex-col">
      {/* Header com título e botão close */}
      <div className="p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-foreground">
            Comentários internos
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Lista de comentários */}
      <div className="flex-1 px-4 pb-2 overflow-y-auto custom-scrollbar">
        <div className="space-y-4">
          {comentarios.map((comentario) =>
            renderComment(comentario),
          )}
        </div>
      </div>

      {/* Textarea flutuante para novo comentário */}
      <div className="flex-shrink-0 rounded-t-xl border-t border-border bg-background">
        <div className="flex flex-col">
          {/* Textarea em cima */}
          <div className="flex-1 rounded-top-3xl px-3 pt-3">
            <textarea
              ref={textareaNovoRef}
              value={textoNovoComentario}
              onChange={(e) =>
                setTextoNovoComentario(e.target.value)
              }
              onKeyPress={(e) =>
                handleKeyPress(e, handleEnviarNovoComentario)
              }
              placeholder="Adicionar comentário interno..."
              className="w-full resize-none h-6 max-h-10 bg-transparent border-0 px-0 py-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 transition-all duration-200 custom-scrollbar overflow-y-auto"
              rows={1}
              style={{ lineHeight: "20px" }}
            />
          </div>

          {/* Botões embaixo */}
          <div className="flex items-center justify-between px-3 pb-3 pt-2">
            {/* Botões de formatação à esquerda */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Emoji"
              >
                <Smile className="w-4 h-4 text-[#717182]" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Negrito"
              >
                <Bold className="w-4 h-4 text-[#717182]" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Itálico"
              >
                <Italic className="w-4 h-4 text-[#717182]" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Link"
              >
                <Link className="w-4 h-4 text-[#717182]" />
              </Button>
            </div>

            {/* Botão Enviar */}
            <Button
              variant={
                textoNovoComentario.trim() ? "brand" : "ghost"
              }
              size="sm"
              className="h-8 w-8 p-0"
              onClick={
                textoNovoComentario.trim()
                  ? handleEnviarNovoComentario
                  : undefined
              }
              disabled={!textoNovoComentario.trim()}
            >
              <SendHorizontal
                className={`w-4 h-4 ${textoNovoComentario.trim() ? "text-white" : "text-[#717182]"}`}
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}