import {
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
  useEffect,
} from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "../ui/button";

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface SmartFilterRowProps {
  filters: FilterOption[];
  selectedFilter?: string;
  onFilterSelect?: (id: string) => void;
  onRemove?: (id: string) => void;
  /** Teto de chips visíveis; abaixo disso, o que não cabe vai para o "+N" */
  maxVisible?: number;
}

// Conteúdo do chip — o mesmo no chip real e no "fantasma" usado para medir
function ChipContent({ f, removable }: { f: FilterOption; removable: boolean }) {
  return (
    <>
      {f.label}
      {f.count !== undefined && (
        <span className="font-bold" style={{ fontSize: "inherit" }}>
          {f.count > 99 ? "99+" : f.count}
        </span>
      )}
      {removable && (
        <span className="rounded-sm p-0.5">
          <X className="w-3 h-3" />
        </span>
      )}
    </>
  );
}

export function SmartFilterRow({
  filters,
  selectedFilter,
  onFilterSelect,
  onRemove,
  maxVisible,
}: SmartFilterRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [visibleCount, setVisibleCount] = useState(
    filters.length,
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const calculate = useCallback(() => {
    const container = containerRef.current;
    const ghost = ghostRef.current;
    if (!container || !ghost) return;

    const availableW = container.getBoundingClientRect().width;
    const GAP = 6;
    const MORE_W = 56; // botão "+N ⌄"
    const chips = Array.from(ghost.children) as HTMLElement[];
    const limit = Math.min(maxVisible ?? chips.length, chips.length);
    let used = 0;
    let count = 0;

    for (let i = 0; i < limit; i++) {
      const chipW = chips[i].getBoundingClientRect().width;
      const spacer = i > 0 ? GAP : 0;
      // Reserva espaço para o "+N" se ainda sobrar filtro depois deste
      const reserve = i < chips.length - 1 ? GAP + MORE_W : 0;

      if (used + spacer + chipW + reserve <= availableW || i === 0) {
        used += spacer + chipW;
        count = i + 1;
      } else {
        break;
      }
    }

    setVisibleCount(count);
  }, [filters, maxVisible]);

  useLayoutEffect(() => {
    calculate();
  }, [calculate]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(calculate);
    ro.observe(el);
    return () => ro.disconnect();
  }, [calculate]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () =>
      document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const visible = filters.slice(0, visibleCount);
  const hidden = filters.slice(visibleCount);

  return (
    <>
      {/* Ghost invisível para medir larguras */}
      <div
        ref={ghostRef}
        aria-hidden="true"
        className="flex gap-1.5 fixed opacity-0 pointer-events-none"
        style={{ top: -9999, left: -9999 }}
      >
        {filters.map((f) => (
          <Button
            key={f.id}
            variant="outline"
            size="xs"
            className={`gap-1.5 ${onRemove ? "pr-1.5" : ""}`}
          >
            <ChipContent f={f} removable={!!onRemove} />
          </Button>
        ))}
      </div>

      {/* Container real — ocupa a largura disponível para medir o espaço */}
      <div
        ref={containerRef}
        className="flex flex-1 min-w-0 w-full gap-1.5 relative overflow-visible"
      >
        {visible.map((f) => (
          <Button
            key={f.id}
            variant="outline"
            size="xs"
            active={selectedFilter === f.id}
            onClick={() => onFilterSelect?.(f.id)}
            className={`gap-1.5 ${onRemove ? "pr-1.5" : ""}`}
          >
            {f.label}
            {f.count !== undefined && (
              <span className="font-bold" style={{ fontSize: "inherit" }}>
                {f.count > 99 ? "99+" : f.count}
              </span>
            )}
            {onRemove && (
              <span
                role="button"
                aria-label={`Remover ${f.label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(f.id);
                }}
                className="rounded-sm p-0.5 hover:bg-destructive/15 hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </span>
            )}
          </Button>
        ))}

        {hidden.length > 0 && (
          <div ref={dropdownRef} className="relative">
            <Button
              variant="outline"
              size="xs"
              active={
                dropdownOpen ||
                hidden.some((f) => f.id === selectedFilter)
              }
              onClick={() => setDropdownOpen((v) => !v)}
              className="gap-1"
            >
              +{hidden.length}
              <ChevronDown
                className="w-3 h-3 transition-transform"
                style={{
                  transform: dropdownOpen
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              />
            </Button>

            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-1.5 z-50 min-w-[200px] rounded-md border border-border bg-background shadow-md overflow-hidden">
                <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Mais filtros
                </p>
                {hidden.map((f) => (
                  <div
                    key={f.id}
                    className={[
                      "flex items-center justify-between gap-2 px-3 py-2 text-sm cursor-pointer transition-colors",
                      "hover:bg-accent",
                      selectedFilter === f.id
                        ? "font-medium text-foreground bg-accent/50"
                        : "text-muted-foreground",
                    ].join(" ")}
                    onClick={() => {
                      onFilterSelect?.(f.id);
                      setDropdownOpen(false);
                    }}
                  >
                    <span className="flex items-center gap-1.5">
                    {f.label}
                    {f.count !== undefined && (
                      <span className="font-bold">{f.count > 99 ? "99+" : f.count}</span>
                    )}
                  </span>
                    {onRemove && (
                      <span
                        role="button"
                        aria-label={`Remover ${f.label}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(f.id);
                          setDropdownOpen(false);
                        }}
                        className="rounded-sm p-0.5 hover:bg-destructive/15 hover:text-destructive transition-colors flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}