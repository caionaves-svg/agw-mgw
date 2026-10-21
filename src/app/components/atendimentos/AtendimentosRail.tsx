import type { ReactNode } from "react";
import { Filter, PanelLeftOpen, Pin, Plus, Search } from "lucide-react";
import ChannelAvatar from "../ChannelAvatar";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Usuario, useData } from "../../contexts/DataContext";
import { ScrollArea } from "../ui/scroll-area";

/** Largura da lista de atendimentos recolhida */
export const RAIL_WIDTH = 64;

interface RailSection {
  id: string;
  label: string;
  contacts: Usuario[];
}

interface AtendimentosRailProps {
  sections: RailSection[];
  selectedId?: string;
  pinnedIds: Set<string>;
  activeFiltersCount: number;
  onExpand: () => void;
  onNewAtendimento: () => void;
  onOpenFilters: () => void;
  onContactClick: (contato: Usuario) => void;
}

function RailButton({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">
        <p className="text-xs font-medium">{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Lista de atendimentos recolhida: ações viram botões de ícone e cada
 * atendimento vira um avatar com o ícone do canal e o badge de não lidas.
 */
export function AtendimentosRail({
  sections,
  selectedId,
  pinnedIds,
  activeFiltersCount,
  onExpand,
  onNewAtendimento,
  onOpenFilters,
  onContactClick,
}: AtendimentosRailProps) {
  const { getUltimaMensagemByUsuarioId } = useData();

  return (
    <div className="h-full flex flex-col">
      {/* Ações */}
      <div className="flex flex-col items-center gap-2 border-b border-border py-4">
        <RailButton label="Expandir lista">
          <Button variant="outline" size="icon" onClick={onExpand} aria-label="Expandir lista">
            <PanelLeftOpen className="w-4 h-4" />
          </Button>
        </RailButton>
        <RailButton label="Novo atendimento">
          <Button
            variant="brand"
            size="icon"
            onClick={onNewAtendimento}
            className="text-white"
            aria-label="Novo atendimento"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </RailButton>
        <RailButton label="Buscar">
          <Button variant="outline" size="icon" onClick={onExpand} aria-label="Buscar">
            <Search className="w-4 h-4" />
          </Button>
        </RailButton>
        <RailButton label="Filtros avançados">
          <Button
            variant="outline"
            size="icon"
            active={activeFiltersCount > 0}
            onClick={onOpenFilters}
            className="relative"
            aria-label="Filtros avançados"
          >
            <Filter className="w-4 h-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-background border border-primary text-muted-foreground text-xs font-medium rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </RailButton>
      </div>

      {/* Atendimentos */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="pb-2">
        {sections
          .filter((s) => s.contacts.length > 0)
          .map((section) => (
            <div key={section.id}>
              {/* Divisor da seção com contagem */}
              <RailButton label={`${section.label} (${section.contacts.length})`}>
                <div className="flex items-center gap-1 px-2 pt-3 pb-1">
                  <span className="h-px flex-1 bg-border" />
                  <span
                    className="inline-flex items-center justify-center h-4 min-w-[18px] px-1 rounded-full bg-muted text-muted-foreground font-semibold"
                    style={{ fontSize: "10px" }}
                  >
                    {section.contacts.length > 99 ? "99+" : section.contacts.length}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>
              </RailButton>

              {section.contacts.map((contato) => {
                const isSelected = selectedId === contato.id;
                const naoLidas = contato.notificacoes ?? 0;
                return (
                  <Tooltip key={contato.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onContactClick(contato)}
                        aria-label={`${contato.nome} · ${contato.id}${naoLidas > 0 ? ` · ${naoLidas} não lidas` : ""}`}
                        aria-current={isSelected || undefined}
                        className={`relative mx-auto my-1 flex size-12 items-center justify-center rounded-xl transition-colors ${
                          isSelected ? "bg-muted" : "hover:bg-accent"
                        }`}
                      >
                        <ChannelAvatar nome={contato.nome} channel={contato.channel} size="md" />
                        {naoLidas > 0 && (
                          // Recolhido: só o indicador; a contagem fica no tooltip
                          <span className="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-destructive ring-2 ring-background" />
                        )}
                        {pinnedIds.has(contato.id) && (
                          <Pin className="absolute top-0.5 left-0.5 w-3 h-3 text-muted-foreground fill-muted-foreground" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-64 p-2">
                      <p className="text-xs font-medium">
                        {contato.nome} <span className="font-normal opacity-70">· {contato.id}</span>
                      </p>
                      {naoLidas > 0 && (
                        <p className="text-xs mt-0.5 font-medium">
                          {naoLidas} {naoLidas === 1 ? "mensagem não lida" : "mensagens não lidas"}
                        </p>
                      )}
                      <p className="text-xs mt-0.5 opacity-80 line-clamp-2">
                        {getUltimaMensagemByUsuarioId(contato.id)}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
