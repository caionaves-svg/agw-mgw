import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

/**
 * Redimensionamento da lista com "arrastar para recolher":
 * - entre min e max, a largura acompanha o cursor;
 * - abaixo do mínimo (ou acima do máximo) há resistência elástica;
 * - passou do limiar, a intenção fica armada e só é aplicada ao soltar —
 *   antes disso, nada muda de estado e o usuário pode desistir voltando.
 * O mesmo vale no sentido inverso: arrastar a lista recolhida para expandir.
 */

/** Distância arrastada além do limite para armar recolher/expandir */
const ARM_DISTANCE = 96;

// Resistência elástica: cresce rápido no início e satura em `limit`
const rubber = (distance: number, limit: number) =>
  (1 - 1 / ((distance * 0.55) / limit + 1)) * limit;

export type DragIntent = "collapse" | "expand" | null;

interface Options {
  width: number;
  collapsed: boolean;
  min: number;
  max: number;
  railWidth: number;
  defaultWidth: number;
  onWidthChange: (width: number) => void;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function useSidebarResize({
  width,
  collapsed,
  min,
  max,
  railWidth,
  defaultWidth,
  onWidthChange,
  onCollapsedChange,
}: Options) {
  const start = useRef<{ x: number; width: number } | null>(null);
  const [drag, setDrag] = useState<{ raw: number } | null>(null);

  const restingWidth = collapsed ? railWidth : width;

  // Largura exibida durante o arraste + intenção armada
  let displayWidth = restingWidth;
  let intent: DragIntent = null;
  let progress = 0; // 0 → 1 até armar (para feedback progressivo)

  if (drag) {
    const { raw } = drag;
    if (collapsed) {
      const pulled = Math.max(0, raw - railWidth);
      displayWidth = railWidth + rubber(pulled, 160);
      progress = Math.min(pulled / ARM_DISTANCE, 1);
      if (pulled >= ARM_DISTANCE) intent = "expand";
    } else if (raw < min) {
      const pushed = min - raw;
      displayWidth = min - rubber(pushed, 160);
      progress = Math.min(pushed / ARM_DISTANCE, 1);
      if (pushed >= ARM_DISTANCE) intent = "collapse";
    } else if (raw > max) {
      displayWidth = max + rubber(raw - max, 32);
    } else {
      displayWidth = raw;
    }
  }

  const end = () => {
    if (!drag) return;
    if (intent === "collapse") onCollapsedChange(true);
    else if (intent === "expand") onCollapsedChange(false);
    else if (!collapsed) onWidthChange(Math.min(Math.max(drag.raw, min), max));
    start.current = null;
    setDrag(null);
    document.body.style.removeProperty("cursor");
    document.body.style.removeProperty("user-select");
  };

  const handleProps = {
    role: "separator",
    "aria-orientation": "vertical" as const,
    "aria-label": collapsed
      ? "Arraste para expandir a lista de atendimentos"
      : "Redimensionar lista de atendimentos",
    "aria-valuenow": Math.round(restingWidth),
    "aria-valuemin": collapsed ? railWidth : min,
    "aria-valuemax": collapsed ? railWidth : max,
    tabIndex: 0,
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      start.current = { x: e.clientX, width: restingWidth };
      setDrag({ raw: restingWidth });
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (!start.current) return;
      setDrag({ raw: start.current.width + e.clientX - start.current.x });
    },
    onPointerUp: end,
    onPointerCancel: end,
    onDoubleClick: () => (collapsed ? onCollapsedChange(false) : onWidthChange(defaultWidth)),
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      const step = e.shiftKey ? 64 : 16;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onCollapsedChange(!collapsed);
      } else if (!collapsed && e.key === "ArrowLeft") {
        e.preventDefault();
        onWidthChange(Math.max(width - step, min));
      } else if (!collapsed && e.key === "ArrowRight") {
        e.preventDefault();
        onWidthChange(Math.min(width + step, max));
      }
    },
  };

  return { displayWidth, isDragging: drag !== null, intent, progress, handleProps };
}
