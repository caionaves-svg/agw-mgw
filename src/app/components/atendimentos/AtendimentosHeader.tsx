import { useState } from "react";
import {
  Filter,
  Plus,
  ArrowUpDown,
  X,
  LockKeyhole,
  LockKeyholeOpen,
  PanelLeftClose,
} from "lucide-react";
import { Button } from "../ui/button";
import { SearchInput } from "../ui/search-input";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../ui/tooltip";
import { FilterValues } from "./FilterPanel";
import { SmartFilterRow } from "./SmartFilterRow";

const QUICK_FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "nao-lidos", label: "Não lidos" },
  { id: "nao-respondido", label: "Não respondido" },
  { id: "aguardando", label: "Backlog" },
  { id: "em-atendimento", label: "Em atendimento" },
];

interface AtendimentosHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterOpen: boolean;
  onFilterToggle: () => void;
  selectedFilter: string;
  filters: string[];
  onFilterSelect: (filter: string) => void;
  onNewAtendimento: () => void;
  sortOrder: "desc" | "asc";
  onSortToggle: () => void;
  onAdvancedFilterToggle?: () => void;
  activeFiltersCount?: number;
  isFilterPanelOpen?: boolean;
  activeFilters?: FilterValues;
  onClearFilters?: () => void;
  onRemoveFilter?: (key: string) => void;
  filterCounts?: Record<string, number>;
  pinnedCount?: number;
  // Prop para avisar o componente pai que o botão foi clicado (se necessário)
  onToggleFreezeSort?: () => void;
  /** Recolhe a lista para o modo compacto (apenas ícones e avatares) */
  onCollapse?: () => void;
}

export function AtendimentosHeader({
  searchTerm,
  onSearchChange,
  filterOpen,
  onFilterToggle,
  selectedFilter,
  filters,
  onFilterSelect,
  onNewAtendimento,
  sortOrder,
  onSortToggle,
  onAdvancedFilterToggle,
  activeFiltersCount = 0,
  isFilterPanelOpen = false,
  activeFilters = {},
  onClearFilters,
  onRemoveFilter,
  filterCounts = {},
  pinnedCount = 0,
  onToggleFreezeSort,
  onCollapse,
}: AtendimentosHeaderProps) {
  // 🟢 ESTADO LOCAL ADICIONADO: Controla o visual do cadeado direto aqui!
  const [isFrozen, setIsFrozen] = useState(false);

  // Injeta "Fixados" apenas quando há itens fixados
  const allFilters =
    pinnedCount > 0
      ? [...QUICK_FILTERS, { id: "fixados", label: "Fixados" }]
      : QUICK_FILTERS;

  const QUICK_FILTERS_WITH_COUNTS = allFilters.map((f) => ({
    ...f,
    count:
      f.id === "fixados" ? pinnedCount : filterCounts[f.id],
  }));
  const filterLabels: Record<string, string> = {
    periodo: "Filtrar período",
    listaCasos: "Lista de casos",
    cliente: "Cliente",
    idCaso: "ID do caso",
    status: "Status",
    tipoAtendimento: "Tipo",
    canal: "Canal",
    assunto: "Assunto",
    destinatario: "Destinatário",
  };

  const formatFilterDisplay = (
    key: string,
    value: any,
  ): string => {
    if (Array.isArray(value)) return `(${value.length})`;
    if (typeof value === "string" && value.includes(",")) {
      return `(${value.split(",").filter((v) => v.trim()).length})`;
    }
    if (key === "periodo") {
      const labels: Record<string, string> = {
        hoje: "Hoje",
        ontem: "Ontem",
        "7dias": "Últimos 7 dias",
        "30dias": "Últimos 30 dias",
        "mes-atual": "Mês atual",
        "mes-anterior": "Mês anterior",
        personalizado: "Personalizado",
      };
      return labels[value] || value;
    }
    return value;
  };

  const activeFilterBadges = Object.entries(activeFilters)
    .filter(
      ([_, value]) =>
        value &&
        (Array.isArray(value)
          ? value.length > 0
          : value.toString().length > 0),
    )
    .map(([key, value]) => ({
      key,
      label: filterLabels[key] || key,
      displayValue: formatFilterDisplay(key, value),
    }));

  return (
    <div className="bg-background border-b border-border p-4">
      {/* Título + Novo atendimento */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <h1 className="text-xl text-foreground truncate">
          Atendimentos
        </h1>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="brand"
            onClick={onNewAtendimento}
            className="text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Novo atendimento
          </Button>
          {onCollapse && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onCollapse}
                  aria-label="Recolher lista"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs font-medium">Recolher lista</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {/* Linha 1: Busca + Controles */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <SearchInput
              placeholder="Buscar Cliente ou ID do Atendimento..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              showIcon={true}
            />
          </div>

          <div className="flex gap-2">
            {/* 1. FILTROS AVANÇADOS */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Button
                    variant="outline"
                    active={
                      isFilterPanelOpen ||
                      activeFiltersCount > 0
                    }
                    onClick={onAdvancedFilterToggle}
                    className="relative"
                  >
                    <Filter className="w-4 h-4" />
                    {activeFiltersCount > 0 &&
                      !isFilterPanelOpen && (
                        <span className="absolute -top-0 -right-0.5 bg-background border border-primary text-muted-foreground text-xs font-medium rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                          {activeFiltersCount}
                        </span>
                      )}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="max-w-xs p-2"
              >
                <p className="font-bold">Filtros avançados</p>
                <p className="text-xs mt-0.5">
                  Abra o painel para segmentar suas conversas
                  por tags, canais, status específicos ou
                  responsáveis.
                </p>
              </TooltipContent>
            </Tooltip>

            {/* 2. NOVO ITEM: FIXAR ORDENAÇÃO (CONTROLADO DIRETAMENTE AQUI) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Button
                    variant="outline"
                    active={isFrozen}
                    onClick={() => {
                      setIsFrozen(!isFrozen); // Muda o estado visual na hora
                      onToggleFreezeSort?.(); // Dispara a função pro componente pai se existir
                    }}
                    className="relative"
                  >
                    {isFrozen ? (
                      <LockKeyhole className="w-4 h-4" />
                    ) : (
                      <LockKeyholeOpen className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="max-w-xs p-2"
              >
                <p className="font-bold">
                  Fixar ordenação automática
                </p>
                <p className="text-xs mt-0.5">
                  {isFrozen
                    ? "As conversas deixarão de ter suas posições fixas e voltarão a respeitar a ordenação assim que receberem novas interações."
                    : "Mantém as conversas na ordem atual que está na tela, impedindo que elas mudem de linha com novas mensagens. Isso não afeta o fluxo de novos atendimentos na distribuição do backlog, como também continuam indo para 'em atendimento' ao serem respondidas."}
                </p>
              </TooltipContent>
            </Tooltip>

            {/* 3. ORDENAÇÃO DINÂMICA */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={onSortToggle}
                    disabled={isFrozen} // 🟢 Fica desabilitado quando a tela está congelada
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="max-w-xs p-2"
              >
                {sortOrder === "desc" ? (
                  <>
                    <p className="font-bold">
                      Mudar para Mais Antigas primeiro
                    </p>
                    <p className="text-xs mt-0.5">
                      Reorganiza a lista para priorizar no topo
                      os clientes que estão esperando há mais
                      tempo na fila.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-bold">
                      Mudar para Mais Recentes primeiro
                    </p>
                    <p className="text-xs mt-0.5">
                      Reorganiza a lista para exibir no topo as
                      interações e mensagens que acabaram de
                      chegar.
                    </p>
                  </>
                )}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Linha 2: Filtros ativos OU Filtros rápidos */}
        {activeFiltersCount > 0 ? (
          <div className="flex items-center gap-1.5">
            {/* Limpar todos */}
            <Button
              variant="outline"
              size="xs"
              onClick={onClearFilters}
              className="gap-1.5 text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              Limpar
            </Button>

            {/* Badges com remoção individual + overflow +N */}
            <SmartFilterRow
              filters={activeFilterBadges.map((f) => ({
                id: f.key,
                label: `${f.label}: ${f.displayValue}`,
              }))}
              onRemove={(key) => onRemoveFilter?.(key)}
              maxVisible={1}
            />
          </div>
        ) : (
          /* Filtros rápidos com overflow +N */
          <SmartFilterRow
            filters={QUICK_FILTERS_WITH_COUNTS}
            selectedFilter={selectedFilter}
            onFilterSelect={onFilterSelect}
            maxVisible={3}
          />
        )}
      </div>
    </div>
  );
}