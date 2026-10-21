import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import type { useCollapsibleResize } from "./useCollapsibleResize";

type ResizeState = ReturnType<typeof useCollapsibleResize>;

interface CollapsibleResizeEdgeProps extends Pick<ResizeState, "intent" | "isDragging" | "handleProps"> {
  edge: "left" | "right";
  collapsed: boolean;
  /** Texto do sinalizador ao armar o recolher (ex.: "Solte para recolher") */
  collapseLabel?: string;
}

/**
 * Alça de arraste + sinalizador "Solte para…" usados pelos painéis laterais
 * recolhíveis. Deve ficar dentro de um container `relative` do painel.
 */
export function CollapsibleResizeEdge({
  edge,
  collapsed,
  intent,
  isDragging,
  handleProps,
  collapseLabel = "Solte para recolher",
}: CollapsibleResizeEdgeProps) {
  // Ícones apontam na direção do movimento: painel à esquerda recolhe para a esquerda
  const CollapseIcon = edge === "right" ? PanelLeftClose : PanelRightClose;
  const ExpandIcon = edge === "right" ? PanelLeftOpen : PanelRightOpen;

  return (
    <>
      {/* Sinalizador ao armar: a mudança só acontece quando o usuário soltar */}
      <div
        aria-hidden={!intent}
        className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center transition-all duration-200 ${
          intent ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {intent === "collapse" ? (
          <div className="flex items-center gap-2 rounded-full bg-popover border border-border px-3 py-2 text-sm font-medium text-foreground shadow-lg">
            <CollapseIcon className="w-4 h-4 text-primary" />
            {collapseLabel}
          </div>
        ) : (
          <div className="flex size-10 items-center justify-center rounded-full bg-popover border border-border shadow-lg">
            <ExpandIcon className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>

      {/* Alça de arraste na borda */}
      <div
        {...handleProps}
        title={
          collapsed
            ? "Arraste para expandir · duplo clique para expandir"
            : "Arraste para redimensionar ou recolher · duplo clique para restaurar"
        }
        className={`group/handle absolute inset-y-0 z-20 w-3 cursor-col-resize outline-none ${
          edge === "right" ? "-right-1.5" : "-left-1.5"
        }`}
      >
        <span
          className={`absolute inset-y-0 left-1/2 -translate-x-1/2 transition-all duration-150 ${
            intent
              ? "w-0.5 bg-primary"
              : isDragging
                ? "w-0.5 bg-primary/60"
                : "w-px bg-transparent group-hover/handle:w-0.5 group-hover/handle:bg-primary/40 group-focus-visible/handle:w-0.5 group-focus-visible/handle:bg-primary/60"
          }`}
        />
      </div>
    </>
  );
}
