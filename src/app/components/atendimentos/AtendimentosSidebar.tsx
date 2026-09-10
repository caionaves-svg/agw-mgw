import { ContactItem } from "./ContactItem";
import { AtendimentosHeader } from "./AtendimentosHeader";
import { SectionLabel } from "./SectionLabel";
import { Usuario, useData } from "../../contexts/DataContext";
import { useState, useMemo } from "react";
import { FilterPanel, FilterValues } from "./FilterPanel";
import { NewAtendimentoPanel } from "./NewAtendimentoPanel";


interface AtendimentosSidebarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterOpen: boolean;
  onFilterToggle: () => void;
  selectedFilter: string;
  filters: string[];
  onFilterSelect: (filter: string) => void;
  onNewAtendimento: () => void;
  atendimentosEmCurso: Usuario[];
  todosAtendimentos: Usuario[];
  selectedContact: Usuario | null;
  onContactClick: (contato: Usuario) => void;
  onContactClose: (id: string) => void;
  sortOrder: "desc" | "asc";
  onSortOrderChange: (order: "desc" | "asc") => void;
  // Novas props para filtros avançados
  showFilterPanel: boolean;
  setShowFilterPanel: (show: boolean) => void;
  activeFilters: FilterValues;
  setActiveFilters: (filters: FilterValues) => void;
  handleToggleFilterPanel: () => void;
  handleApplyFilters: (filters: FilterValues) => void;
  handleClearFilters: () => void;
  handleCloseFilterPanel: () => void;
  activeFiltersCount: number;
  // Novas props para novo atendimento
  showNewAtendimentoPanel: boolean;
  setShowNewAtendimentoPanel: (show: boolean) => void;
  handleToggleNewAtendimentoPanel: () => void;
  handleCloseNewAtendimentoPanel: () => void;
  // Pin state vindo do pai
  pinnedIds: Set<string>;
  togglePin: (id: string) => void;
}

export function AtendimentosSidebar({
  searchTerm,
  onSearchChange,
  filterOpen,
  onFilterToggle,
  selectedFilter,
  filters,
  onFilterSelect,
  onNewAtendimento,
  atendimentosEmCurso,
  todosAtendimentos,
  selectedContact,
  onContactClick,
  onContactClose,
  sortOrder,
  onSortOrderChange,
  showFilterPanel,
  setShowFilterPanel,
  activeFilters,
  setActiveFilters,
  handleToggleFilterPanel,
  handleApplyFilters,
  handleClearFilters,
  handleCloseFilterPanel,
  activeFiltersCount,
  showNewAtendimentoPanel,
  setShowNewAtendimentoPanel,
  handleToggleNewAtendimentoPanel,
  handleCloseNewAtendimentoPanel,
  pinnedIds,
  togglePin,
}: AtendimentosSidebarProps) {
  const { conversas } = useData();

  const [emAtendimentoCollapsed, setEmAtendimentoCollapsed] = useState(false);
  const [aguardandoCollapsed, setAguardandoCollapsed] = useState(false);

  const sortWithPins = (contacts: Usuario[]) => [
    ...contacts.filter((c) => pinnedIds.has(c.id)),
    ...contacts.filter((c) => !pinnedIds.has(c.id)),
  ];

  // Mapa: usuarioId → remetente da última mensagem
  const ultimoRemetenteMap = useMemo(() => {
    const map: Record<string, "atendente" | "cliente"> = {};
    conversas?.forEach((conv) => {
      const msgs = conv.mensagens || [];
      if (msgs.length > 0) {
        map[conv.usuarioId] = msgs[msgs.length - 1].remetente as "atendente" | "cliente";
      }
    });
    return map;
  }, [conversas]);

  const allContacts = [...atendimentosEmCurso, ...todosAtendimentos];
  const emAtendimentoAgora = allContacts.filter((c) => c.isEmCurso);
  const aguardandoAtendimento = allContacts.filter((c) => !c.isEmCurso);

  // ── Lógica de filtro real ──────────────────────────────────────────────────
  const filteredContacts = useMemo(() => {
    switch (selectedFilter) {
      case "todos":
        return allContacts;

      case "nao-lidos":
        return allContacts.filter(
          (c) => (c.notificacoes ?? 0) > 0 || c.status !== "lida",
        );

      case "nao-respondido":
        return allContacts.filter(
          (c) => ultimoRemetenteMap[c.id] === "cliente",
        );

      case "fixados":
        return allContacts.filter((c) => pinnedIds.has(c.id));

      case "aguardando":
        return allContacts.filter((c) => !c.isEmCurso);

      case "em-atendimento":
        return allContacts.filter((c) => c.isEmCurso);

      default:
        // Filtro por tag (filtros customizados)
        return allContacts.filter((c) =>
          c.tags?.some(
            (tag) => tag.label.toLowerCase() === selectedFilter.toLowerCase(),
          ),
        );
    }
  }, [selectedFilter, allContacts, ultimoRemetenteMap]);

  // Counts para badges dos filtros
  const naoLidosCount = allContacts.filter(
    (c) => (c.notificacoes ?? 0) > 0 || c.status !== "lida",
  ).length;
  const naoRespondidoCount = allContacts.filter(
    (c) => ultimoRemetenteMap[c.id] === "cliente",
  ).length;

  const handleSortToggle = () => {
    onSortOrderChange(sortOrder === "desc" ? "asc" : "desc");
  };

  // Ordenar e separar em grupos
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    const timeA = a.lastMessageTimestamp || 0;
    const timeB = b.lastMessageTimestamp || 0;
    return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
  });

  const emAtendimentoSorted = sortedContacts.filter((c) => c.isEmCurso);
  const aguardandoSorted = sortedContacts.filter((c) => !c.isEmCurso);

  return (
    <div className="bg-background w-98 flex flex-col border-r border-border overflow-hidden">
      {/* Header */}
      <AtendimentosHeader
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        filterOpen={filterOpen}
        onFilterToggle={onFilterToggle}
        selectedFilter={selectedFilter}
        filters={filters}
        onFilterSelect={onFilterSelect}
        onNewAtendimento={handleToggleNewAtendimentoPanel}
        sortOrder={sortOrder}
        onSortToggle={handleSortToggle}
        onAdvancedFilterToggle={handleToggleFilterPanel}
        activeFiltersCount={activeFiltersCount}
        isFilterPanelOpen={showFilterPanel}
        activeFilters={activeFilters}
        onClearFilters={handleClearFilters}
        filterCounts={{
          todos: allContacts.length,
          "nao-lidos": naoLidosCount,
          "nao-respondido": naoRespondidoCount,
          aguardando: aguardandoAtendimento.length,
          "em-atendimento": emAtendimentoAgora.length,
        }}
        pinnedCount={pinnedIds.size}
      />

      {/* Container com transição entre lista, filtros e novo atendimento */}
      <div className="flex-1 relative overflow-hidden">
        {/* Lista de atendimentos */}
        <div
          className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
            showFilterPanel
              ? "-translate-x-full"
              : showNewAtendimentoPanel
                ? "-translate-x-full"
                : "translate-x-0"
          }`}
        >
          <div className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
            {/* Seção: Em Atendimento Agora */}
            {emAtendimentoSorted.length > 0 && (
              <>
                <SectionLabel
                  label="Em Atendimento"
                  count={emAtendimentoSorted.length}
                  isCollapsed={emAtendimentoCollapsed}
                  onToggle={() =>
                    setEmAtendimentoCollapsed(
                      !emAtendimentoCollapsed,
                    )
                  }
                />
                {!emAtendimentoCollapsed &&
                  sortWithPins(emAtendimentoSorted).map((contato) => (
                    <ContactItem
                      key={contato.id}
                      contato={contato}
                      onClick={() => onContactClick(contato)}
                      isSelected={selectedContact?.id === contato.id}
                      onClose={() => onContactClose(contato.id)}
                      isEmAtendimento={true}
                      isPinned={pinnedIds.has(contato.id)}
                      onPin={togglePin}
                    />
                  ))}
              </>
            )}

            {/* Seção: Aguardando Atendimento */}
            {aguardandoSorted.length > 0 && (
              <>
                <SectionLabel
                  label="Backlog"
                  count={aguardandoSorted.length}
                  isCollapsed={aguardandoCollapsed}
                  onToggle={() =>
                    setAguardandoCollapsed(!aguardandoCollapsed)
                  }
                />
                {!aguardandoCollapsed &&
                  sortWithPins(aguardandoSorted).map((contato) => (
                    <ContactItem
                      key={contato.id}
                      contato={contato}
                      onClick={() => onContactClick(contato)}
                      isSelected={selectedContact?.id === contato.id}
                      onClose={() => onContactClose(contato.id)}
                      isPinned={pinnedIds.has(contato.id)}
                      onPin={togglePin}
                    />
                  ))}
              </>
            )}
          </div>
        </div>

        {/* Painel de filtros */}
        <div
          className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
            showFilterPanel
              ? "translate-x-0"
              : "translate-x-full"
          }`}
        >
          {showFilterPanel && (
            <FilterPanel
              onClose={handleCloseFilterPanel}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
              initialValues={activeFilters}
            />
          )}
        </div>

        {/* Painel de novo atendimento */}
        <div
          className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
            showNewAtendimentoPanel
              ? "translate-x-0"
              : "translate-x-full"
          }`}
        >
          {showNewAtendimentoPanel && (
            <NewAtendimentoPanel
              onClose={handleCloseNewAtendimentoPanel}
              onSubmit={(data) => {
                console.log("Novo atendimento criado:", data);
                handleCloseNewAtendimentoPanel();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}