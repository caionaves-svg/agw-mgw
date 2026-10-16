import { AtSign, Bell, Lock } from "lucide-react";
import CommentAudioPlayer from "./CommentAudioPlayer";
import CaseIdBadge from "../CaseIdBadge";
import { PlatformUser, findPlatformUser, findPlatformUserByName } from "../../data/platformUsers";
import "./comments.css";

// ============================================================================
// Modelo único de comentários internos de um caso. Usado no painel de
// Comentários internos e no fio do caso dentro do cVortex Collab, para que
// as mensagens tenham sempre a mesma aparência, contexto e visibilidade.
// ============================================================================

export interface ThreadComment {
  id: string;
  /** Id do usuário da plataforma (se conhecido) */
  autorId?: string;
  autorNome: string;
  isMine: boolean;
  timestamp: string;
  html?: string;
  audio?: { duracao: number };
  mencionados?: PlatformUser[];
  respostas?: ThreadComment[];
}

/** Função exibida ao lado do nome (ex.: "Supervisora") */
export const CURRENT_USER_ROLE = "Atendente";

function autorInfo(c: ThreadComment) {
  const user = c.autorId ? findPlatformUser(c.autorId) : findPlatformUserByName(c.autorNome);
  return {
    cor: c.isMine ? undefined : user?.cor,
    cargo: c.isMine ? CURRENT_USER_ROLE : user?.cargo,
  };
}

const formatDuracao = (s: number) =>
  `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

export function commentSnippet(c: Pick<ThreadComment, "html" | "audio">) {
  if (c.audio) return `🎤 Áudio (${formatDuracao(c.audio.duracao)})`;
  const div = document.createElement("div");
  div.innerHTML = c.html ?? "";
  return div.textContent ?? "";
}

export function findThreadComment(list: ThreadComment[], id: string): ThreadComment | undefined {
  for (const c of list) {
    if (c.id === id) return c;
    const found = c.respostas && findThreadComment(c.respostas, id);
    if (found) return found;
  }
}

/** Monta a árvore a partir de uma lista plana com referência ao comentário pai */
export function buildThreadTree<T extends { id: string; respondendoA?: string }>(
  items: T[],
  toComment: (item: T) => ThreadComment,
): ThreadComment[] {
  const nodes = new Map<string, ThreadComment>();
  const roots: ThreadComment[] = [];
  for (const item of items) nodes.set(item.id, { ...toComment(item), respostas: [] });
  for (const item of items) {
    const node = nodes.get(item.id)!;
    const parent = item.respondendoA ? nodes.get(item.respondendoA) : undefined;
    if (parent) parent.respostas!.push(node);
    else roots.push(node);
  }
  return roots;
}

// ─── Cabeçalho: de qual caso são estes comentários ──────────────────────────
export function CaseCommentsHeading({
  casoId,
  clienteNome,
  extra,
}: {
  casoId?: string;
  clienteNome?: string;
  /** Informação complementar (ex.: "Menção de Marina Costa") */
  extra?: string;
}) {
  return (
    <div className="min-w-0">
      <h2 className="text-base font-medium text-foreground leading-tight">
        Comentários internos
      </h2>
      {(casoId || clienteNome) && (
        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground min-w-0">
          {casoId && <CaseIdBadge casoId={casoId} clienteNome={clienteNome} />}
          {clienteNome && <span className="truncate">{clienteNome}</span>}
          {extra && <span className="truncate">· {extra}</span>}
        </div>
      )}
    </div>
  );
}

// ─── Aviso de visibilidade (sempre acima do input) ──────────────────────────
export function CommentVisibilityNote() {
  return (
    <div className="flex items-center justify-center gap-1.5 px-3 pt-2 text-[11px] text-muted-foreground">
      <Lock className="w-3 h-3 shrink-0" />
      <span>Visível para a equipe da unidade de negócio · o cliente não vê</span>
    </div>
  );
}

// ─── Fio de comentários ─────────────────────────────────────────────────────
interface CommentThreadProps {
  comments: ThreadComment[];
  onReply: (comment: ThreadComment) => void;
  /** Comentário selecionado para resposta (borda destacada) */
  respondendoId?: string | null;
  /** Comentário destacado temporariamente (ex.: recém-enviado) */
  destaqueId?: string | null;
  /** Comentário em que o usuário foi mencionado */
  mencaoId?: string;
  /** Profundidade máxima com "Responder" (0 = só raiz) */
  maxReplyLevel?: number;
}

export default function CommentThread({
  comments,
  onReply,
  respondendoId,
  destaqueId,
  mencaoId,
  maxReplyLevel = 1,
}: CommentThreadProps) {
  const renderComment = (comment: ThreadComment, level: number) => {
    const { cor, cargo } = autorInfo(comment);
    const ativo = respondendoId === comment.id || destaqueId === comment.id || mencaoId === comment.id;
    const podeResponder = level <= maxReplyLevel;

    return (
      <div key={comment.id}>
        <div className="py-1">
          {/* Todos alinhados à esquerda — inclusive os seus */}
          <div className="min-w-0 max-w-[90%] flex flex-col items-start">
            <div
              data-comment-id={comment.id}
              className={`min-w-[120px] max-w-full px-2.5 pt-1.5 pb-1 border rounded-md rounded-tl-sm text-foreground transition-colors duration-300 ${
                comment.isMine
                  ? "bg-message-agent-bg border-message-agent-border"
                  : "bg-background border-border"
              } ${ativo ? "!border-primary" : ""}`}
            >
              {/* Autor · função */}
              <div className="flex items-center gap-1 text-xs mb-0.5 min-w-0">
                <span
                  className={`font-medium truncate ${comment.isMine ? "text-primary" : ""}`}
                  style={cor ? { color: cor } : undefined}
                >
                  {comment.autorNome}
                </span>
                {cargo && <span className="text-muted-foreground truncate">· {cargo}</span>}
                {mencaoId === comment.id && (
                  <span className="inline-flex items-center gap-0.5 text-primary flex-shrink-0 ml-1">
                    <AtSign className="w-3 h-3" />
                    mencionou você
                  </span>
                )}
              </div>

              {comment.html && (
                <div
                  className="cv-comment-rich"
                  dangerouslySetInnerHTML={{ __html: comment.html }}
                />
              )}

              {comment.audio && (
                <div className="py-0.5">
                  <CommentAudioPlayer duracao={comment.audio.duracao} />
                </div>
              )}

              <div className="flex justify-end">
                <span className="text-muted-foreground/70" style={{ fontSize: "var(--text-xs)" }}>
                  {comment.timestamp}
                </span>
              </div>
            </div>

            {/* Meta: notificados + responder */}
            {(comment.mencionados || podeResponder) && (
              <div className="flex items-center gap-2 mt-0.5 px-1 text-xs text-muted-foreground max-w-full">
                {comment.mencionados && (
                  <span className="flex items-center gap-1 min-w-0">
                    <Bell className="w-3 h-3 shrink-0" />
                    <span className="truncate">
                      {comment.mencionados.map((u) => u.nome).join(", ")}
                    </span>
                  </span>
                )}
                {podeResponder && (
                  <button
                    onClick={() => onReply(comment)}
                    className="text-primary hover:underline shrink-0"
                  >
                    Responder
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Respostas: uma linha de 1px por nível, recuo mínimo */}
        {comment.respostas && comment.respostas.length > 0 && (
          <div className="ml-1.5 pl-2 border-l border-border">
            {comment.respostas.map((r) => renderComment(r, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return <div className="space-y-1.5">{comments.map((c) => renderComment(c, 0))}</div>;
}
