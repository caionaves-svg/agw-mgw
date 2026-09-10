import { useState, useEffect } from "react";
import { AtendimentosSidebar } from "../components/atendimentos/AtendimentosSidebar";
import ChatPanel from "../components/ChatPanel";
import { useData, Usuario } from "../contexts/DataContext";
import { useSidePanel } from "../contexts/SidePanelContext";
import {
  FilterValues,
  countActiveFilters,
} from "../components/atendimentos/FilterPanel";

// Função para ordenar atendimentos em curso
function sortAtendimentosEmCurso(contatos: Usuario[]): Usuario[] {
  return [...contatos].sort((a, b) => {
    // Primeiro critério: status (não lidas primeiro)
    const aIsUnread = a.status === "nao-lida";
    const bIsUnread = b.status === "nao-lida";

    if (aIsUnread && !bIsUnread) return -1;
    if (!aIsUnread && bIsUnread) return 1;

    // Se ambos têm o mesmo status, manter ordem original
    return 0;
  });
}

// Função para ordenar todos os atendimentos
function sortTodosAtendimentos(contatos: Usuario[]): Usuario[] {
  return [...contatos].sort((a, b) => {
    // Primeiro critério: presença de atendente (sem atendente primeiro)
    const aHasAttendant = !!a.atendente;
    const bHasAttendant = !!b.atendente;

    if (!aHasAttendant && bHasAttendant) return -1;
    if (aHasAttendant && !bHasAttendant) return 1;

    // Segundo critério: status (não lidas primeiro)
    const aIsUnread = a.status === "nao-lida";
    const bIsUnread = b.status === "nao-lida";

    if (aIsUnread && !bIsUnread) return -1;
    if (!aIsUnread && bIsUnread) return 1;

    // Se ambos têm o mesmo status e presença de atendente, manter ordem original
    return 0;
  });
}

export default function AtendimentosPage() {
  const dataContext = useData();
  const { usuarios } = dataContext;
  const { selectAtendimentoAndOpen, selectedAtendimento: contextSelectedAtendimento } = useSidePanel();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("todos"); // Filtro por tag
  const [selectedContact, setSelectedContact] = useState<Usuario | null>(null);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc"); // desc = mais recente primeiro
  
  // Novos estados para filtros avançados
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterValues>({});

  // Novos estados para novo atendimento
  const [showNewAtendimentoPanel, setShowNewAtendimentoPanel] = useState(false);

  // Estado de pins — compartilhado entre sidebar e chat panel
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const togglePin = (id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filters = ["Todas", "Não Lidas", "Sem atendentes"];

  // Separar usuários em atendimentos em curso e todos os atendimentos
  const atendimentosEmCurso = usuarios.filter(
    (user) => user.isEmCurso,
  );
  const todosAtendimentos = usuarios.filter(
    (user) => !user.isEmCurso,
  );

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    setFilterOpen(false);
  };

  const handleNewAtendimento = () => {
    setShowNewAtendimentoPanel(true);
  };

  const handleContactClick = (contato: Usuario) => {
    // Se o atendimento está aguardando (não está em curso), assume automaticamente
    if (!contato.isEmCurso) {
      dataContext.assumirAtendimento(contato.id);
    }
    
    setSelectedContact(contato);
    console.log("Abrir conversa com:", contato.nome);
  };

  const handleContactClose = (id: string) => {
    // Remove o contato da lista
    dataContext.removeUsuario(id);
    
    // Se o contato fechado estava selecionado, limpar seleção
    if (selectedContact?.id === id) {
      setSelectedContact(null);
    }
  };

  // Handlers para filtros avançados
  const handleToggleFilterPanel = () => {
    setShowFilterPanel(!showFilterPanel);
    // Fecha o painel de novo atendimento se estiver aberto
    if (showNewAtendimentoPanel) {
      setShowNewAtendimentoPanel(false);
    }
  };

  const handleApplyFilters = (filters: FilterValues) => {
    setActiveFilters(filters);
    setShowFilterPanel(false);
    console.log("Filtros aplicados:", filters);
    // TODO: Implementar lógica de filtragem dos atendimentos
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    console.log("Filtros limpos");
  };

  const handleCloseFilterPanel = () => {
    setShowFilterPanel(false);
  };

  // Handlers para novo atendimento
  const handleToggleNewAtendimentoPanel = () => {
    setShowNewAtendimentoPanel(!showNewAtendimentoPanel);
    // Fecha o painel de filtros se estiver aberto
    if (showFilterPanel) {
      setShowFilterPanel(false);
    }
  };

  const handleCloseNewAtendimentoPanel = () => {
    setShowNewAtendimentoPanel(false);
  };

  // Contar filtros ativos
  const activeFiltersCount = countActiveFilters(activeFilters);

  // Aplicar ordenação às listas
  const sortedAtendimentosEmCurso = sortAtendimentosEmCurso(
    atendimentosEmCurso,
  );
  const sortedTodosAtendimentos = sortTodosAtendimentos(
    todosAtendimentos,
  );

  // Verificar se o contato selecionado está em "Atendimentos em Curso"
  const isEmCurso = selectedContact
    ? sortedAtendimentosEmCurso.some(
        (contato) => contato.id === selectedContact.id,
      )
    : false;

  // Converter dados para o formato do ChatPanel
  const selectedAtendimento = selectedContact
    ? {
        id: selectedContact.id,
        cliente: {
          nome: selectedContact.nome,
          avatar: selectedContact.avatar,
        },
        status: "Em atendimento",
        tempoAtendimento: "00:00:00",
        canal: "whatsapp",
        atendente: selectedContact.atendente,
        isEmCurso: isEmCurso,
      }
    : undefined;

  // Sincronizar atendimento selecionado com o contexto global
  useEffect(() => {
    if (selectedAtendimento) {
      // Só abre automaticamente se for um atendimento DIFERENTE do atual
      // Isso preserva a liberdade do usuário de fechar/alternar seções
      const isDifferentAtendimento = 
        !contextSelectedAtendimento || 
        contextSelectedAtendimento.id !== selectedAtendimento.id;
      
      if (isDifferentAtendimento) {
        selectAtendimentoAndOpen(selectedAtendimento);
      }
    }
  }, [selectedAtendimento?.id]); // Apenas quando o ID muda

  return (
    <div className="flex-1 bg-white h-full flex overflow-hidden">
      {/* Sidebar com lista de atendimentos */}
      <AtendimentosSidebar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterOpen={filterOpen}
        onFilterToggle={() => setFilterOpen(!filterOpen)}
        selectedFilter={selectedFilter}
        filters={filters}
        onFilterSelect={handleFilterSelect}
        onNewAtendimento={handleNewAtendimento}
        atendimentosEmCurso={sortedAtendimentosEmCurso}
        todosAtendimentos={sortedTodosAtendimentos}
        selectedContact={selectedContact}
        onContactClick={handleContactClick}
        onContactClose={handleContactClose}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        showFilterPanel={showFilterPanel}
        setShowFilterPanel={setShowFilterPanel}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
        handleToggleFilterPanel={handleToggleFilterPanel}
        handleApplyFilters={handleApplyFilters}
        handleClearFilters={handleClearFilters}
        handleCloseFilterPanel={handleCloseFilterPanel}
        activeFiltersCount={activeFiltersCount}
        showNewAtendimentoPanel={showNewAtendimentoPanel}
        setShowNewAtendimentoPanel={setShowNewAtendimentoPanel}
        handleToggleNewAtendimentoPanel={handleToggleNewAtendimentoPanel}
        handleCloseNewAtendimentoPanel={handleCloseNewAtendimentoPanel}
        pinnedIds={pinnedIds}
        togglePin={togglePin}
      />

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatPanel
          atendimento={selectedAtendimento}
          isPinned={selectedContact ? pinnedIds.has(selectedContact.id) : false}
          onPin={selectedContact ? () => togglePin(selectedContact.id) : undefined}
        />
      </div>
    </div>
  );
}