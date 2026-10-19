import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { X, Info, Plus, ArrowLeft, MessageSquare, MessageSquareShare, AtSign, UserRound } from "lucide-react";
import { Button } from "../ui/button";
import { SearchInput } from "../ui/search-input";
import ChannelAvatar from "../ChannelAvatar";
import CaseIdBadge from "../CaseIdBadge";
import CommentInput from "../comments/CommentInput";
import CommentAudioPlayer from "../comments/CommentAudioPlayer";
import CommentThread, {
  CaseCommentsHeading,
  CommentVisibilityNote,
  ThreadComment,
  buildThreadTree,
  commentSnippet,
} from "../comments/CommentThread";
import {
  useCollab,
  stripHtml,
  CollabMention,
  DirectConversation,
  DirectMessage,
} from "../../contexts/CollabContext";
import {
  PlatformUser,
  STATUS_COLORS,
  STATUS_LABELS,
  findPlatformUser,
  isOffline,
  searchPlatformUsers,
} from "../../data/platformUsers";
import "../comments/comments.css";

// ─── Helpers de tempo ────────────────────────────────────────────────────────
function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

function tempoRelativo(ts: number, now: number) {
  const min = Math.floor((now - ts) / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

const hora = (ts: number) =>
  new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

// ─── Peças visuais ───────────────────────────────────────────────────────────
function PresenceAvatar({ user, size = "md" }: { user?: PlatformUser; size?: "md" | "sm" }) {
  return (
    <ChannelAvatar
      nome={user?.nome ?? "?"}
      size={size}
      statusColor={user ? STATUS_COLORS[user.status] : undefined}
      className={`shrink-0 ${user && isOffline(user) ? "opacity-60" : ""}`}
    />
  );
}

function TabButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="xs"
      active={active}
      onClick={onClick}
      className="gap-1.5"
    >
      {label}
      <span className="font-bold" style={{ fontSize: "inherit" }}>
        {count}
      </span>
    </Button>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[0, 150, 300].map((d) => (
        <span
          key={d}
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70 animate-bounce"
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </span>
  );
}

function MessageBubble({
  message,
  showAuthor = false,
  highlight = false,
}: {
  message: DirectMessage;
  /** Exibe o nome do autor (fio com vários participantes) */
  showAuthor?: boolean;
  /** Destaca o comentário em que o usuário foi mencionado */
  highlight?: boolean;
}) {
  const mine = message.from === "me";
  const autor = mine ? undefined : findPlatformUser(message.from);

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[90%] min-w-[90px] px-2.5 pt-1.5 pb-1 border text-foreground ${
          mine
            ? "rounded-md rounded-tr-sm bg-message-agent-bg border-message-agent-border"
            : "rounded-md rounded-tl-sm bg-background border-border"
        } ${highlight ? "!border-primary" : ""}`}
      >
        {showAuthor && autor && (
          <div className="flex items-center gap-1.5 text-xs font-medium mb-0.5" style={{ color: autor.cor }}>
            {autor.nome}
            {highlight && (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-normal text-primary">
                <AtSign className="w-3 h-3" />
                mencionou você
              </span>
            )}
          </div>
        )}
        {message.html && (
          <div className="cv-comment-rich" dangerouslySetInnerHTML={{ __html: message.html }} />
        )}
        {message.audio && (
          <div className="py-0.5">
            <CommentAudioPlayer duracao={message.audio.duracao} />
          </div>
        )}
        <div className="flex justify-end">
          <span className="text-muted-foreground/70" style={{ fontSize: "var(--text-xs)" }}>
            {hora(message.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

function TypingBubble({ nome }: { nome?: string }) {
  return (
    <div className="flex justify-start">
      <div className="rounded-md rounded-tl-sm bg-background border border-border px-3 py-2">
        {nome && <div className="text-xs text-muted-foreground mb-1">{nome}</div>}
        <TypingDots />
      </div>
    </div>
  );
}

// ─── Item de lista (mesma anatomia do ContactItem da lista de atendimentos) ──
function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <div className="bg-destructive text-destructive-foreground text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
      {count > 9 ? "9+" : count}
    </div>
  );
}

function CollabListItem({
  user,
  badge,
  time,
  unread = 0,
  preview,
  previewMuted = false,
  meta,
  onClick,
  title,
}: {
  user?: PlatformUser;
  /** Ex.: badge de ID do caso ao lado do nome */
  badge?: React.ReactNode;
  time?: string;
  unread?: number;
  /** Linha 2 — última mensagem (text-sm) */
  preview: React.ReactNode;
  /** Mensagem já lida: tom mais claro, como na lista de atendimentos */
  previewMuted?: boolean;
  /** Linha 3 — informação de apoio (text-xs, como o atendente na lista) */
  meta?: React.ReactNode;
  onClick: () => void;
  title?: string;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      title={title}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
      className="group flex items-center gap-3 p-2 cursor-pointer rounded-xl transition-colors m-1 relative hover:bg-accent"
    >
      <div className="flex-shrink-0">
        <ChannelAvatar
          nome={user?.nome ?? "?"}
          statusColor={user ? STATUS_COLORS[user.status] : undefined}
          className={user && isOffline(user) ? "opacity-60" : ""}
        />
      </div>

      <div className="flex-1 min-w-1">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground font-medium leading-tight flex items-center gap-2 min-w-0">
            <span className="truncate" style={{ fontSize: "var(--text-sm)" }}>
              {user?.nome}
            </span>
            {badge}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            {time && <span className="text-xs text-muted-foreground/70">{time}</span>}
            <UnreadBadge count={unread} />
          </div>
        </div>

        <p
          className={`text-sm truncate ${previewMuted ? "text-muted-foreground/70" : "text-muted-foreground"}`}
        >
          {preview}
        </p>

        {meta && <div className="flex items-center gap-1 mt-1 text-xs min-w-0">{meta}</div>}
      </div>
    </div>
  );
}

// ─── Aba Menções ─────────────────────────────────────────────────────────────
function MentionItem({ mention, now }: { mention: CollabMention; now: number }) {
  const { openMention } = useCollab();
  const autor = findPlatformUser(mention.autorId);
  const mentionIndex = mention.thread.findIndex((m) => m.id === mention.id);
  const respostas = mention.thread.length - mentionIndex - 1;

  return (
    <CollabListItem
      user={autor}
      title="Ver conversa do caso"
      onClick={() => openMention(mention.id)}
      badge={<CaseIdBadge casoId={mention.casoId} clienteNome={mention.clienteNome} />}
      time={tempoRelativo(mention.createdAt, now)}
      unread={mention.lida ? 0 : 1}
      previewMuted={mention.lida}
      preview={
        mention.typing ? (
          <span className="text-primary">digitando…</span>
        ) : (
          stripHtml(mention.html)
        )
      }
      meta={
        <>
          <UserRound className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground truncate">{mention.clienteNome}</span>
          {respostas > 0 && (
            <span className="flex items-center gap-1 text-primary flex-shrink-0 ml-1">
              <MessageSquare className="w-3 h-3" />
              {respostas} {respostas === 1 ? "resposta" : "respostas"}
            </span>
          )}
        </>
      }
    />
  );
}

function MentionsTab() {
  const { mentions } = useCollab();
  const now = useNow();

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="mx-4 mb-1 flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
        <Info className="w-4 h-4 shrink-0 mt-px" />
        <p>
          As menções ficam disponíveis enquanto o atendimento está ativo. Ao
          finalizar o caso ou transferi-lo para outra unidade de negócio, elas
          são arquivadas junto ao histórico e saem desta lista.
        </p>
      </div>

      {mentions.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          Nenhuma menção por aqui.
        </p>
      ) : (
        <div className="px-2 pb-2">
          {mentions.map((m) => (
            <MentionItem key={m.id} mention={m} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Aba Diretas ─────────────────────────────────────────────────────────────
function lastPreview(c: DirectConversation) {
  const last = c.messages[c.messages.length - 1];
  if (!last) return "";
  const text = last.audio ? "🎤 Áudio" : stripHtml(last.html);
  return last.from === "me" ? `Você: ${text}` : text;
}

function DirectsTab() {
  const { conversations, setView, openConversation } = useCollab();

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="px-4 pb-1">
        <Button
          onClick={() => setView({ type: "new" })}
          className="w-full"
        >
          <Plus className="w-4 h-4" />
          Iniciar uma conversa
        </Button>
      </div>

      {conversations.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          Nenhuma conversa ainda.
        </p>
      ) : (
        <div className="px-2 pb-2">
          {conversations.map((c) => {
            const user = findPlatformUser(c.userId);
            const last = c.messages[c.messages.length - 1];
            return (
              <CollabListItem
                key={c.userId}
                user={user}
                onClick={() => openConversation(c.userId)}
                time={last ? hora(last.createdAt) : undefined}
                unread={c.unread}
                previewMuted={c.unread === 0}
                preview={
                  c.typing ? (
                    <span className="text-primary">digitando…</span>
                  ) : (
                    lastPreview(c)
                  )
                }
                meta={
                  user && (
                    <>
                      <span style={{ color: STATUS_COLORS[user.status] }} className="flex-shrink-0">
                        {STATUS_LABELS[user.status]}
                      </span>
                      <span className="text-muted-foreground truncate">
                        · {user.cargo} · {user.equipe}
                      </span>
                    </>
                  )
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Nova conversa (seletor de usuários) ─────────────────────────────────────
function NewConversationView() {
  const { openConversation } = useCollab();
  const [query, setQuery] = useState("");
  const users = searchPlatformUsers(query);
  const firstOffline = users.findIndex(isOffline);
  const onlineCount = firstOffline === -1 ? users.length : firstOffline;

  const header = (label: string, count: number) => (
    <div className="flex items-center gap-2 px-4 pt-3 pb-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-[11px] text-muted-foreground/70">{count}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-4 pt-3 pb-1">
        <SearchInput
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome, e-mail ou equipe"
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-2">
        {users.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            Nenhum usuário encontrado.
          </p>
        )}
        {users.map((u, i) => {
          const offline = isOffline(u);
          return (
            <div key={u.id}>
              {i === 0 && onlineCount > 0 && header("Online", onlineCount)}
              {i === firstOffline && header("Offline", users.length - onlineCount)}
              <button
                type="button"
                onClick={() => openConversation(u.id)}
                className="w-[calc(100%-0.5rem)] text-left flex items-center gap-3 p-2 m-1 rounded-xl hover:bg-accent transition-colors"
              >
                <PresenceAvatar user={u} />
                <div className="min-w-0 flex-1">
                  <div className={`text-sm truncate ${offline ? "text-muted-foreground" : "text-foreground"}`}>
                    {u.nome}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {u.cargo} · {u.equipe}
                  </div>
                </div>
                {u.status !== "online" && !offline && (
                  <span className="text-[11px] shrink-0" style={{ color: STATUS_COLORS[u.status] }}>
                    {STATUS_LABELS[u.status]}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Conversa direta ─────────────────────────────────────────────────────────
function ConversationView({ userId }: { userId: string }) {
  const { conversations, sendDirect } = useCollab();
  const user = findPlatformUser(userId);
  const conversation = conversations.find((c) => c.userId === userId);
  const messages = conversation?.messages ?? [];
  const listRef = useRef<HTMLDivElement>(null);
  const primeiroNome = user?.nome.split(" ")[0] ?? "";

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, conversation?.typing]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div ref={listRef} className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-1.5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center text-center gap-2 py-10 text-muted-foreground">
            <MessageSquare className="w-8 h-8 opacity-50" />
            <p className="text-sm">
              Comece a conversa com {primeiroNome}.
              {user && isOffline(user) && (
                <>
                  <br />
                  {primeiroNome} está offline e verá a mensagem ao entrar.
                </>
              )}
            </p>
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {conversation?.typing && <TypingBubble />}
      </div>

      <div className="flex-shrink-0">
        <CommentInput
          size="sm"
          showAI={false}
          placeholder={`Mensagem para ${primeiroNome}...`}
          onSend={({ html }) => sendDirect(userId, { html })}
          onSendAudio={(duracao) => sendDirect(userId, { audio: { duracao } })}
        />
      </div>
    </div>
  );
}

// ─── Fio de comentários do caso (menção) ─────────────────────────────────────
function MentionThreadView({ mentionId }: { mentionId: string }) {
  const { mentions, replyToMention } = useCollab();
  const mention = mentions.find((m) => m.id === mentionId);
  const listRef = useRef<HTMLDivElement>(null);
  const autor = mention ? findPlatformUser(mention.autorId) : undefined;
  const [respondendoId, setRespondendoId] = useState<string | null>(null);

  useEffect(() => {
    // Acompanha novas mensagens no fim do fio
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [mention?.thread.length, mention?.typing]);

  if (!mention) return null;

  // Mesmo modelo dos Comentários internos: árvore de respostas
  const comments = buildThreadTree(mention.thread, (m): ThreadComment => {
    const mine = m.from === "me";
    return {
      id: m.id,
      autorId: mine ? undefined : m.from,
      autorNome: mine ? "Você" : findPlatformUser(m.from)?.nome ?? "Usuário",
      isMine: mine,
      timestamp: hora(m.createdAt),
      html: m.html,
      audio: m.audio,
    };
  });
  const respondido = respondendoId ? mention.thread.find((m) => m.id === respondendoId) : undefined;
  const respondidoNome = respondido
    ? respondido.from === "me" ? "Você" : findPlatformUser(respondido.from)?.nome ?? "Usuário"
    : "";

  const enviar = (content: { html?: string; audio?: { duracao: number } }) => {
    replyToMention(mention.id, content, respondendoId ?? undefined);
    setRespondendoId(null);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div ref={listRef} className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2">
        <CommentThread
          comments={comments}
          mencaoId={mention.id}
          respondendoId={respondendoId}
          onReply={(c) => setRespondendoId(c.id)}
        />
        {mention.typing && (
          <div className="flex items-center gap-2 px-1 pt-2 text-xs text-muted-foreground">
            <TypingDots />
            {autor?.nome} está digitando…
          </div>
        )}
      </div>

      <div className="flex-shrink-0">
        <CommentVisibilityNote />
        <CommentInput
          size="sm"
          showAI={false}
          replyingTo={
            respondido && { autorNome: respondidoNome, snippet: commentSnippet(respondido) }
          }
          onCancelReply={() => setRespondendoId(null)}
          placeholder={
            respondido ? `Responder ${respondidoNome}...` : `Responder ${autor?.nome ?? ""}...`
          }
          onSend={({ html }) => enviar({ html })}
          onSendAudio={(duracao) => enviar({ audio: { duracao } })}
        />
      </div>
    </div>
  );
}

// ─── Painel ──────────────────────────────────────────────────────────────────
/** Conteúdo do Collab (header + telas) — usado no drawer e no painel lateral */
function CollabContent() {
  const navigate = useNavigate();
  const {
    isOpen,
    placement,
    close,
    tab,
    setTab,
    view,
    setView,
    mentions,
    conversations,
  } = useCollab();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      // Esc em subtelas volta para a lista; na lista fecha o painel
      if (view.type !== "list") setView({ type: "list" });
      else close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, view, close, setView]);

  const conversationUser =
    view.type === "conversation" ? findPlatformUser(view.userId) : undefined;
  const threadMention =
    view.type === "mention" ? mentions.find((m) => m.id === view.mentionId) : undefined;

  // No painel lateral o Collab continua aberto e só o chat do centro troca
  const irParaAtendimento = (casoId: string) => {
    if (placement === "drawer") close();
    navigate("/atendimentos", {
      state: { abrirCaso: casoId, manterCollab: placement === "panel" },
    });
  };
  const conversationTyping =
    view.type === "conversation" &&
    conversations.find((c) => c.userId === view.userId)?.typing;

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 min-h-14 flex-shrink-0">
        {view.type !== "list" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView({ type: "list" })}
            className="h-8 w-8 p-0 -ml-1"
            title="Voltar"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}

        {view.type === "mention" && threadMention ? (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="min-w-0 flex-1">
              <CaseCommentsHeading
                casoId={threadMention.casoId}
                clienteNome={threadMention.clienteNome}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => irParaAtendimento(threadMention.casoId)}
              className="h-8 w-8 p-0"
              title="Ir para o atendimento"
            >
              <MessageSquareShare className="w-4 h-4" />
            </Button>
          </div>
        ) : view.type === "conversation" ? (
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <PresenceAvatar user={conversationUser} />
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {conversationUser?.nome}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {conversationTyping ? (
                  <span className="text-primary">digitando…</span>
                ) : conversationUser ? (
                  <>
                    <span style={{ color: STATUS_COLORS[conversationUser.status] }}>
                      {STATUS_LABELS[conversationUser.status]}
                    </span>{" "}
                    · {conversationUser.cargo} · {conversationUser.equipe}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-medium text-foreground leading-tight">
              {view.type === "new" ? "Nova conversa" : "cVortex Collab"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {view.type === "new"
                ? "Escolha com quem conversar"
                : "Menções e conversas diretas"}
            </p>
          </div>
        )}

        <Button variant="ghost" size="sm" onClick={close} className="h-8 w-8 p-0" title="Fechar (Esc)">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {view.type === "list" && (
        <>
          <div className="flex items-center gap-1.5 px-4 py-3">
            <TabButton
              active={tab === "mencoes"}
              label="Menções"
              count={mentions.length}
              onClick={() => setTab("mencoes")}
            />
            <TabButton
              active={tab === "diretas"}
              label="Diretas"
              count={conversations.length}
              onClick={() => setTab("diretas")}
            />
          </div>
          {tab === "mencoes" ? <MentionsTab /> : <DirectsTab />}
        </>
      )}

      {view.type === "new" && <NewConversationView />}
      {view.type === "conversation" && <ConversationView userId={view.userId} />}
      {view.type === "mention" && <MentionThreadView mentionId={view.mentionId} />}
    </>
  );
}

/** Collab como seção do painel lateral (Atendimentos) — mesmo card das demais seções */
export function CollabSection() {
  return (
    <div className="bg-background rounded-xl overflow-hidden h-full flex flex-col" aria-label="cVortex Collab">
      <CollabContent />
    </div>
  );
}

/** Collab em drawer com overlay — páginas sem painel lateral */
export default function CollabPanel() {
  const { isOpen, placement, close } = useCollab();
  if (placement !== "drawer" || !isOpen) return null;

  return (
    <>
      {/* Overlay — abaixo do header, para o botão do Collab continuar acessível */}
      <div
        className="fixed inset-0 z-50 bg-black/45 animate-in fade-in duration-200"
        onClick={close}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        className="fixed inset-y-0 right-0 rounded-l-lg z-50 w-120 max-w-full flex flex-col bg-background border-l border-border shadow-lg animate-in slide-in-from-right duration-200"
        aria-label="cVortex Collab"
      >
        <CollabContent />
      </aside>
    </>
  );
}
