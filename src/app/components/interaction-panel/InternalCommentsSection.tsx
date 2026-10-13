import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import CommentInput, { CommentPayload } from "../comments/CommentInput";
import CommentThread, {
  CaseCommentsHeading,
  CommentVisibilityNote,
  ThreadComment,
  commentSnippet,
  findThreadComment,
} from "../comments/CommentThread";
import "../comments/comments.css";

interface InternalCommentsSectionProps {
  onClose: () => void;
  /** Atendimento/caso a que os comentários pertencem */
  atendimento?: { id: string; cliente?: { nome: string } } | null;
}

const mention = (id: string, label: string) =>
  `<span data-type="mention" data-id="${id}" data-label="${label}" class="cv-mention">@${label}</span>`;

const comentario = (
  c: Omit<ThreadComment, "isMine"> & { isMine?: boolean },
): ThreadComment => ({ isMine: false, ...c });

function addReply(list: ThreadComment[], parentId: string, reply: ThreadComment): ThreadComment[] {
  return list.map((c) =>
    c.id === parentId
      ? { ...c, respostas: [...(c.respostas ?? []), reply] }
      : c.respostas
        ? { ...c, respostas: addReply(c.respostas, parentId, reply) }
        : c,
  );
}

export function InternalCommentsSection({
  onClose,
  atendimento,
}: InternalCommentsSectionProps) {
  const [comentarios, setComentarios] = useState<ThreadComment[]>([
    comentario({
      id: "1",
      autorNome: "Maria Silva",
      timestamp: "14:35",
      html: "<p>Cliente solicitou cancelamento de serviço. Protocolo de cancelamento iniciado.</p>",
      respostas: [
        comentario({
          id: "1-1",
          autorNome: "João Santos",
          timestamp: "14:40",
          html: `<p>Validado protocolo e enviado para financeiro. ${mention("u-maria", "Maria Silva")} acompanha por aqui?</p>`,
          respostas: [
            comentario({
              id: "1-1-1",
              autorNome: "Maria Silva",
              timestamp: "14:45",
              html: "<p>Perfeito! Vou acompanhar o processo.</p>",
            }),
          ],
        }),
      ],
    }),
    comentario({
      id: "2",
      autorNome: "Carlos Oliveira",
      timestamp: "15:20",
      html: `<p>Cliente está aguardando retorno sobre a contestação da fatura. ${mention("u-ana", "Ana Costa")} consegue priorizar?</p>`,
      respostas: [
        comentario({
          id: "2-1",
          autorNome: "Ana Costa",
          timestamp: "15:25",
          html: "<p>Já estou verificando com o financeiro. Retorno em <strong>breve</strong>.</p>",
        }),
      ],
    }),
    comentario({
      id: "3",
      autorNome: "Pedro Alves",
      timestamp: "16:10",
      html: "<p>Atendimento finalizado com sucesso. Cliente satisfeito com a resolução.</p>",
    }),
  ]);

  const [respondendoId, setRespondendoId] = useState<string | null>(null);
  const [destaqueId, setDestaqueId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const scrollToBottomRef = useRef(false);

  useEffect(() => {
    if (scrollToBottomRef.current && listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      scrollToBottomRef.current = false;
    }
  }, [comentarios]);

  // Leva a resposta recém-criada para a área visível e destaca por instantes
  useEffect(() => {
    if (!destaqueId) return;
    listRef.current
      ?.querySelector(`[data-comment-id="${destaqueId}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const t = setTimeout(() => setDestaqueId(null), 1500);
    return () => clearTimeout(t);
  }, [destaqueId]);

  const criarComentario = (
    conteudo: Pick<ThreadComment, "html" | "audio" | "mencionados">,
  ): ThreadComment => ({
    id: Date.now().toString(),
    autorNome: "Você",
    isMine: true,
    timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    ...conteudo,
  });

  const fromPayload = ({ html, mentions }: CommentPayload) =>
    criarComentario({ html, mencionados: mentions.length ? mentions : undefined });

  // Envia como resposta (se houver um comentário selecionado) ou como novo
  const enviar = (novo: ThreadComment) => {
    if (respondendoId) {
      setComentarios((prev) => addReply(prev, respondendoId, novo));
      setRespondendoId(null);
      setDestaqueId(novo.id);
    } else {
      scrollToBottomRef.current = true;
      setComentarios((prev) => [...prev, novo]);
    }
  };

  const comentarioRespondido = respondendoId
    ? findThreadComment(comentarios, respondendoId)
    : undefined;

  return (
    <div className="bg-background rounded-xl overflow-hidden h-full flex flex-col">
      {/* Header: de qual caso são estes comentários */}
      <div className="px-4 py-3 flex items-start justify-between gap-2 flex-shrink-0">
        <CaseCommentsHeading
          casoId={atendimento?.id}
          clienteNome={atendimento?.cliente?.nome}
        />
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0 shrink-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Fio de comentários */}
      <div ref={listRef} className="flex-1 px-3 py-2 overflow-y-auto custom-scrollbar">
        <CommentThread
          comments={comentarios}
          respondendoId={respondendoId}
          destaqueId={destaqueId}
          onReply={(c) => setRespondendoId(c.id)}
        />
      </div>

      {/* Visibilidade + input (mesma UI do input dos canais) */}
      <div className="flex-shrink-0">
        <CommentVisibilityNote />
        <CommentInput
          size="sm"
          showAI={false}
          replyingTo={
            comentarioRespondido && {
              autorNome: comentarioRespondido.autorNome,
              snippet: commentSnippet(comentarioRespondido),
            }
          }
          onCancelReply={() => setRespondendoId(null)}
          placeholder={
            comentarioRespondido ? `Responder ${comentarioRespondido.autorNome}...` : undefined
          }
          onSend={(payload) => enviar(fromPayload(payload))}
          onSendAudio={(duracao) => enviar(criarComentario({ audio: { duracao } }))}
        />
      </div>
    </div>
  );
}
