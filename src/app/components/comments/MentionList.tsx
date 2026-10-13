import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AtSign } from "lucide-react";
import ChannelAvatar from "../ChannelAvatar";
import {
  PlatformUser,
  STATUS_COLORS,
  STATUS_LABELS,
  isOffline,
} from "../../data/platformUsers";

interface MentionListProps {
  /** Já ordenados: disponíveis primeiro, offline no fim */
  items: PlatformUser[];
  selectedIndex: number;
  rect: DOMRect | null;
  onSelect: (user: PlatformUser) => void;
  onHover: (index: number) => void;
}

const POPUP_WIDTH = 280;

function GroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 px-3 pt-2 pb-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-[11px] text-muted-foreground/70">{count}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// Popup de sugestões de menção, posicionado acima do cursor (o input
// de comentários fica no rodapé do painel).
export default function MentionList({
  items,
  selectedIndex,
  rect,
  onSelect,
  onHover,
}: MentionListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // No primeiro item volta ao topo para mostrar o cabeçalho do grupo
    if (selectedIndex === 0) {
      listRef.current?.scrollTo({ top: 0 });
      return;
    }
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex, items]);

  if (!rect) return null;

  const left = Math.max(
    8,
    Math.min(rect.left, window.innerWidth - POPUP_WIDTH - 8),
  );
  const bottom = window.innerHeight - rect.top + 6;

  const firstOfflineIndex = items.findIndex(isOffline);
  const onlineCount = firstOfflineIndex === -1 ? items.length : firstOfflineIndex;
  const offlineCount = items.length - onlineCount;

  return createPortal(
    <div
      className="fixed z-[100] bg-popover text-popover-foreground border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      style={{ left, bottom, width: POPUP_WIDTH }}
      // Evita que o editor perca o foco ao clicar no popup
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1 text-xs text-muted-foreground">
        <AtSign className="w-3.5 h-3.5" />
        Mencionar usuário
      </div>

      {items.length === 0 ? (
        <div className="px-3 pb-3 pt-1 text-sm text-muted-foreground">
          Nenhum usuário encontrado
        </div>
      ) : (
        <div
          ref={listRef}
          className="max-h-72 overflow-y-auto custom-scrollbar pb-1.5"
          role="listbox"
        >
          {items.map((user, index) => {
            const offline = isOffline(user);
            return (
              <div key={user.id}>
                {index === 0 && onlineCount > 0 && (
                  <GroupHeader label="Online" count={onlineCount} />
                )}
                {index === firstOfflineIndex && (
                  <GroupHeader label="Offline" count={offlineCount} />
                )}

                <button
                  type="button"
                  data-index={index}
                  role="option"
                  aria-selected={index === selectedIndex}
                  onMouseEnter={() => onHover(index)}
                  onClick={() => onSelect(user)}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition-colors ${
                    index === selectedIndex ? "bg-muted" : ""
                  }`}
                >
                  <ChannelAvatar
                    nome={user.nome}
                    size="sm"
                    statusColor={STATUS_COLORS[user.status]}
                    className={`shrink-0 ${offline ? "opacity-60" : ""}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-sm truncate ${
                        offline ? "text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {user.nome}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {user.cargo} · {user.equipe}
                    </div>
                  </div>
                  {/* Status em texto (só para quem não está simplesmente online) */}
                  {user.status !== "online" && !offline && (
                    <span
                      className="flex items-center gap-1 text-[11px] shrink-0"
                      style={{ color: STATUS_COLORS[user.status] }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[user.status] }}
                      />
                      {STATUS_LABELS[user.status]}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-3 px-3 py-1.5 border-t border-border text-[11px] text-muted-foreground">
        <span>↑↓ navegar</span>
        <span>↵ selecionar</span>
        <span>esc fechar</span>
      </div>
    </div>,
    document.body,
  );
}
