import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { notify } from "../components/ui/toast";
import { useLocation } from "react-router";
import { useSidePanel } from "./SidePanelContext";
import { findPlatformUser } from "../data/platformUsers";

// ============================================================================
// cVortex Collab — menções e conversas diretas entre usuários da plataforma.
// Ambiente SIMULADO: respostas automáticas, "digitando..." e eventos que
// chegam com o tempo. Substituir pelos eventos reais (websocket) depois.
// ============================================================================

export type CollabTab = "mencoes" | "diretas";

export interface CollabMention {
  id: string;
  autorId: string;
  casoId: string;
  clienteNome: string;
  /** HTML do comentário em que o usuário foi mencionado */
  html: string;
  createdAt: number;
  lida: boolean;
  /**
   * Fio de comentários internos do caso trazido para o drawer: contexto
   * anterior + o comentário da menção (id === mention.id) + respostas.
   */
  thread: DirectMessage[];
  /** Autor está digitando uma resposta no fio (simulado) */
  typing: boolean;
}

export interface DirectMessage {
  id: string;
  /** "me" = usuário logado; senão o id do usuário da plataforma */
  from: string;
  html?: string;
  audio?: { duracao: number };
  createdAt: number;
  /** No fio do caso: id do comentário respondido (monta a árvore de respostas) */
  respondendoA?: string;
}

export interface DirectConversation {
  userId: string;
  messages: DirectMessage[];
  unread: number;
  typing: boolean;
}

type View =
  | { type: "list" }
  | { type: "new" }
  | { type: "conversation"; userId: string }
  | { type: "mention"; mentionId: string };

/** Onde o Collab é exibido: no painel lateral (Atendimentos) ou em drawer */
export type CollabPlacement = "panel" | "drawer";

interface CollabContextType {
  isOpen: boolean;
  placement: CollabPlacement;
  open: (tab?: CollabTab) => void;
  close: () => void;
  toggle: () => void;
  tab: CollabTab;
  setTab: (tab: CollabTab) => void;
  view: View;
  setView: (view: View) => void;

  mentions: CollabMention[];
  conversations: DirectConversation[];
  unreadMentions: number;
  unreadDirects: number;
  totalUnread: number;

  markMentionRead: (id: string) => void;
  /** Abre o fio de comentários do caso dentro do drawer */
  openMention: (id: string) => void;
  /** Responde no fio do caso; sem `parentId`, responde ao comentário da menção */
  replyToMention: (
    id: string,
    content: { html?: string; audio?: { duracao: number } },
    parentId?: string,
  ) => void;
  openConversation: (userId: string) => void;
  sendDirect: (
    userId: string,
    content: { html?: string; audio?: { duracao: number } },
  ) => void;
}

const CollabContext = createContext<CollabContextType | undefined>(undefined);

/**
 * Abrir o Collab como seção do painel lateral em Atendimentos (em vez do
 * drawer). Desligado por enquanto: o drawer com overlay é usado em todas as páginas.
 */
const COLLAB_NO_PAINEL = false;

const MIN = 60_000;
const ME_MENTION = `<span class="text-primary font-medium">@Você</span>`;

const uid = () => Math.random().toString(36).slice(2, 10);

// Respostas automáticas por usuário (cicla pela lista)
const AUTO_REPLIES: Record<string, string[]> = {
  default: [
    "Boa! Vou dar uma olhada e te retorno.",
    "Perfeito, obrigado pelo aviso 👍",
    "Consegue me mandar o número do caso?",
    "Fechado. Qualquer coisa me marca no caso.",
  ],
  "u-marina": [
    "Ótimo, já registrei aqui na fila de cadastro.",
    "Se precisar de aprovação, me chama que eu libero.",
    "Perfeito. Qualquer coisa me marca no caso que eu entro direto.",
  ],
  "u-felipe": [
    "Tô em atendimento agora, mas já já vejo isso!",
    "Assumo sim, só finalizo esse aqui primeiro.",
  ],
};

function buildMention(m: {
  id: string;
  autorId: string;
  casoId: string;
  clienteNome: string;
  html: string;
  createdAt: number;
  contexto?: DirectMessage[];
}): CollabMention {
  return {
    ...m,
    lida: false,
    typing: false,
    thread: [
      ...(m.contexto ?? []),
      { id: m.id, from: m.autorId, html: m.html, createdAt: m.createdAt },
    ],
  };
}

function initialMentions(now: number): CollabMention[] {
  return [
    buildMention({
      id: "m-1",
      autorId: "u-marina",
      casoId: "156482",
      clienteNome: "Ricardo Pereira",
      html: `<p>${ME_MENTION} consegue validar o protocolo antes de alterar o cadastro?</p>`,
      createdAt: now - 2 * MIN,
      contexto: [
        { id: "m-1-a", from: "u-joao", html: "<p>Cliente pediu alteração de endereço e telefone no cadastro.</p>", createdAt: now - 9 * MIN },
        { id: "m-1-b", from: "u-marina", respondendoA: "m-1-a", html: "<p>Antes de alterar, precisamos confirmar o protocolo de identidade.</p>", createdAt: now - 4 * MIN },
      ],
    }),
    buildMention({
      id: "m-2",
      autorId: "u-felipe",
      casoId: "742130",
      clienteNome: "Ana Takahashi",
      html: `<p>${ME_MENTION} o cliente pediu retorno hoje, assume a fila de cadastro?</p>`,
      createdAt: now - 26 * MIN,
      contexto: [
        { id: "m-2-a", from: "u-felipe", html: "<p>Consulta confirmada para amanhã, mas o cadastro está com o CPF divergente.</p>", createdAt: now - 31 * MIN },
      ],
    }),
  ];
}

function initialConversations(now: number): DirectConversation[] {
  return [
    {
      userId: "u-marina",
      unread: 1,
      typing: false,
      messages: [
        {
          id: "d-1",
          from: "me",
          html: "<p>Marina, o caso do Ricardo Pereira precisa de validação de protocolo.</p>",
          createdAt: now - 12 * MIN,
        },
        {
          id: "d-2",
          from: "u-marina",
          html: "<p>Perfeito. Qualquer coisa me marca no caso que eu entro direto.</p>",
          createdAt: now - 8 * MIN,
        },
      ],
    },
  ];
}

export const stripHtml = (html = "") => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent ?? "").trim();
};

export function CollabProvider({ children }: { children: ReactNode }) {
  // Em Atendimentos o Collab vive no painel lateral (estado do SidePanel);
  // nas demais páginas, num drawer com overlay (estado local).
  const location = useLocation();
  const sidePanel = useSidePanel();
  const placement: CollabPlacement =
    COLLAB_NO_PAINEL && location.pathname === "/atendimentos" ? "panel" : "drawer";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isOpen =
    placement === "panel"
      ? sidePanel.isOpen && sidePanel.contentType === "collab"
      : drawerOpen;

  // Ref para timers/toasts antigos sempre usarem o destino atual
  const setIsOpenRef = useRef<(v: boolean) => void>(() => {});
  setIsOpenRef.current = (v: boolean) => {
    if (placement === "panel") {
      if (v && !isOpen) sidePanel.openCollab();
      if (!v && isOpen) sidePanel.closeCollab();
    } else {
      setDrawerOpen(v);
    }
  };
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const setIsOpen = useCallback((v: boolean) => setIsOpenRef.current(v), []);
  const [tab, setTab] = useState<CollabTab>("mencoes");
  const [view, setView] = useState<View>({ type: "list" });
  const [mentions, setMentions] = useState<CollabMention[]>(() =>
    initialMentions(Date.now()),
  );
  const [conversations, setConversations] = useState<DirectConversation[]>(
    () => initialConversations(Date.now()),
  );

  // Refs para os timers da simulação saberem o que está visível agora
  const mentionsRef = useRef(mentions);
  mentionsRef.current = mentions;
  const visibleRef = useRef({ isOpen, view });
  visibleRef.current = { isOpen, view };
  const replyIndexRef = useRef<Record<string, number>>({});
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  };
  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const isConversationVisible = (userId: string) => {
    const { isOpen, view } = visibleRef.current;
    return isOpen && view.type === "conversation" && view.userId === userId;
  };

  const updateConversation = (
    userId: string,
    fn: (c: DirectConversation) => DirectConversation,
  ) =>
    setConversations((prev) => {
      const existing = prev.find((c) => c.userId === userId);
      const base = existing ?? { userId, messages: [], unread: 0, typing: false };
      const next = fn(base);
      return [next, ...prev.filter((c) => c.userId !== userId)];
    });

  const open = useCallback((t?: CollabTab) => {
    if (t) setTab(t);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(!isOpenRef.current), []);

  const openConversation = (userId: string) => {
    setTab("diretas");
    setView({ type: "conversation", userId });
    setIsOpen(true);
    setConversations((prev) =>
      prev.map((c) => (c.userId === userId ? { ...c, unread: 0 } : c)),
    );
  };

  // Mensagem recebida (simulada): conta como não lida e avisa se não estiver visível
  const receiveDirect = (userId: string, html: string) => {
    const visible = isConversationVisible(userId);
    updateConversation(userId, (c) => ({
      ...c,
      typing: false,
      unread: visible ? 0 : c.unread + 1,
      messages: [
        ...c.messages,
        { id: uid(), from: userId, html: `<p>${html}</p>`, createdAt: Date.now() },
      ],
    }));
    if (!visible) {
      const user = findPlatformUser(userId);
      notify({
        title: user?.nome ?? "Nova mensagem",
        variant: "info",
        description: html.length > 80 ? html.slice(0, 80) + "…" : html,
        action: { label: "Abrir", onClick: () => openConversation(userId) },
      });
    }
  };

  const sendDirect: CollabContextType["sendDirect"] = (userId, content) => {
    updateConversation(userId, (c) => ({
      ...c,
      unread: 0,
      messages: [
        ...c.messages,
        { id: uid(), from: "me", ...content, createdAt: Date.now() },
      ],
    }));

    // Simulação de resposta: offline não responde; ocupado demora mais
    const user = findPlatformUser(userId);
    if (!user || user.status === "offline") return;
    const slow = user.status === "ocupado" || user.status === "ausente";
    const replies = AUTO_REPLIES[userId] ?? AUTO_REPLIES.default;
    const idx = replyIndexRef.current[userId] ?? 0;
    replyIndexRef.current[userId] = idx + 1;

    later(
      () => updateConversation(userId, (c) => ({ ...c, typing: true })),
      slow ? 2500 : 900,
    );
    later(
      () => receiveDirect(userId, replies[idx % replies.length]),
      (slow ? 2500 : 900) + 1800 + Math.random() * 1200,
    );
  };

  const markMentionRead = (id: string) =>
    setMentions((prev) => prev.map((m) => (m.id === id ? { ...m, lida: true } : m)));

  const updateMention = (id: string, fn: (m: CollabMention) => CollabMention) =>
    setMentions((prev) => prev.map((m) => (m.id === id ? fn(m) : m)));

  const openMention = (id: string) => {
    markMentionRead(id);
    setTab("mencoes");
    setView({ type: "mention", mentionId: id });
    setIsOpen(true);
  };

  // Resposta no fio do caso: autor da menção responde (simulado)
  const replyToMention: CollabContextType["replyToMention"] = (id, content, parentId) => {
    const autorId = mentionsRef.current.find((m) => m.id === id)?.autorId ?? "";
    const respondendoA = parentId ?? id;
    updateMention(id, (m) => ({
      ...m,
      thread: [...m.thread, { id: uid(), from: "me", respondendoA, ...content, createdAt: Date.now() }],
    }));

    const user = findPlatformUser(autorId);
    if (!user || user.status === "offline") return;
    const slow = user.status === "ocupado" || user.status === "ausente";
    const replies = AUTO_REPLIES[autorId] ?? AUTO_REPLIES.default;
    const key = `mention:${id}`;
    const idx = replyIndexRef.current[key] ?? 0;
    replyIndexRef.current[key] = idx + 1;
    const typingAt = slow ? 2500 : 900;

    later(() => updateMention(id, (m) => ({ ...m, typing: true })), typingAt);
    later(() => {
      const { isOpen, view } = visibleRef.current;
      const visible = isOpen && view.type === "mention" && view.mentionId === id;
      const html = replies[idx % replies.length];
      updateMention(id, (m) => ({
        ...m,
        typing: false,
        lida: visible ? m.lida : false,
        thread: [...m.thread, { id: uid(), from: autorId, respondendoA, html: `<p>${html}</p>`, createdAt: Date.now() }],
      }));
      if (!visible) {
        notify({
          title: `${user.nome} respondeu no caso`,
          variant: "info",
          description: html,
          action: { label: "Ver", onClick: () => openMention(id) },
        });
      }
    }, typingAt + 1800 + Math.random() * 1200);
  };

  // Eventos que chegam com o tempo, para simular o ambiente ao vivo
  useEffect(() => {
    later(() => {
      const now = Date.now();
      const mention = buildMention({
        id: uid(),
        autorId: "u-juliana",
        casoId: "923647",
        clienteNome: "Beatriz Fernandes",
        html: `<p>${ME_MENTION} o pedido do exame já foi liberado? A cliente está aguardando.</p>`,
        createdAt: now,
        contexto: [
          { id: uid(), from: "u-juliana", html: "<p>Cliente enviou o pedido médico em anexo no chat.</p>", createdAt: now - 3 * MIN },
        ],
      });
      setMentions((prev) => [mention, ...prev]);
      const { isOpen } = visibleRef.current;
      if (!isOpen) {
        notify({
          title: "Juliana Mendes mencionou você",
          variant: "info",
          description: "Caso 923647 · Beatriz Fernandes",
          action: { label: "Ver", onClick: () => openMention(mention.id) },
        });
      }
    }, 20_000);

    later(() => {
      updateConversation("u-fernanda", (c) => ({ ...c, typing: true }));
    }, 40_000);
    later(() => {
      receiveDirect("u-fernanda", "Oi! Tem um minuto pra me ajudar com um caso de contestação?");
    }, 43_000);
  }, []);

  const unreadMentions = mentions.filter((m) => !m.lida).length;
  const unreadDirects = conversations.reduce((acc, c) => acc + c.unread, 0);

  return (
    <CollabContext.Provider
      value={{
        isOpen,
        placement,
        open,
        close,
        toggle,
        tab,
        setTab,
        view,
        setView,
        mentions,
        conversations,
        unreadMentions,
        unreadDirects,
        totalUnread: unreadMentions + unreadDirects,
        markMentionRead,
        openMention,
        replyToMention,
        openConversation,
        sendDirect,
      }}
    >
      {children}
    </CollabContext.Provider>
  );
}

export function useCollab() {
  const ctx = useContext(CollabContext);
  if (!ctx) throw new Error("useCollab must be used within a CollabProvider");
  return ctx;
}
