import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SidePanelContentType =
  | 'wizz'
  | 'apps'
  | 'consultas'
  | 'info'
  | 'jornada'
  | 'experiencia'
  | 'comentarios'
  | 'faturamento'
  | 'anexos'
  | 'acoes'
  | 'historico-casos'
  | 'historico-cliente'
  | 'enquetes'
  | null;

// Seções que são "informativas" (podem coexistir com Ações)
const INFO_SECTIONS: SidePanelContentType[] = [
  'info',
  'jornada', 
  'experiencia',
  'consultas',
  'comentarios',
  'faturamento',
  'anexos'
];

interface SidePanelContextType {
  isOpen: boolean;
  contentType: SidePanelContentType;
  actionSection: SidePanelContentType; // Nova: seção de ações (sempre 'acoes' ou null)
  selectedAtendimento: any | null;
  openPanel: (type: SidePanelContentType, atendimento?: any) => void;
  closePanel: () => void;
  togglePanel: (type: SidePanelContentType, atendimento?: any) => void;
  setSelectedAtendimento: (atendimento: any | null) => void;
  isDualMode: boolean; // True quando há seção info + ações abertas
  selectAtendimentoAndOpen: (atendimento: any) => void; // Nova função para selecionar e abrir automaticamente
}

const SidePanelContext = createContext<SidePanelContextType | undefined>(undefined);

export function SidePanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false); // Inicia fechado
  const [contentType, setContentType] = useState<SidePanelContentType>(null); // Sem conteúdo inicial
  const [actionSection, setActionSection] = useState<SidePanelContentType>(null); // Sem ações inicial
  const [selectedAtendimento, setSelectedAtendimento] = useState<any | null>(null);

  const isDualMode = isOpen && 
    contentType && 
    INFO_SECTIONS.includes(contentType) && 
    actionSection === 'acoes';

  const openPanel = (type: SidePanelContentType, atendimento?: any) => {
    if (type) {
      if (type === 'acoes') {
        // Ações: adiciona como seção secundária se já tem uma info aberta
        setActionSection('acoes');
        if (!isOpen || !contentType || !INFO_SECTIONS.includes(contentType)) {
          // Se não tem nada aberto ou é seção global, abre só Ações
          setContentType('acoes');
        }
        setIsOpen(true);
      } else {
        // Seção informativa ou global
        setContentType(type);
        setIsOpen(true);
        // Mantém ações abertas se já estiver
        if (INFO_SECTIONS.includes(type) && actionSection === 'acoes') {
          // Mantém dual mode
        } else if (!INFO_SECTIONS.includes(type)) {
          // Seção global (wizz, apps) fecha ações
          setActionSection(null);
        }
      }
      
      if (atendimento !== undefined) {
        setSelectedAtendimento(atendimento);
      }
    }
  };

  const closePanel = () => {
    setIsOpen(false);
    setContentType(null);
    setActionSection(null);
  };

  const togglePanel = (type: SidePanelContentType, atendimento?: any) => {
    if (type === 'acoes') {
      // Toggle de Ações
      if (actionSection === 'acoes') {
        // Fecha ações
        setActionSection(null);
        // Se não tem outra seção aberta, fecha o painel
        if (!contentType || contentType === 'acoes') {
          setIsOpen(false);
          setContentType(null);
        }
      } else {
        // Abre ações
        openPanel('acoes', atendimento);
      }
    } else {
      // Toggle de seção informativa ou global
      if (isOpen && contentType === type) {
        // Fecha a seção, mas mantém ações se estiver aberta
        if (actionSection === 'acoes') {
          setContentType('acoes');
        } else {
          closePanel();
        }
      } else {
        openPanel(type, atendimento);
      }
    }
  };

  const selectAtendimentoAndOpen = (atendimento: any) => {
    setSelectedAtendimento(atendimento);
    // Abre automaticamente em modo dual: Informações + Ações
    setContentType('info');
    setActionSection('acoes');
    setIsOpen(true);
  };

  return (
    <SidePanelContext.Provider value={{ 
      isOpen, 
      contentType, 
      actionSection,
      selectedAtendimento,
      openPanel, 
      closePanel, 
      togglePanel,
      setSelectedAtendimento,
      isDualMode,
      selectAtendimentoAndOpen
    }}>
      {children}
    </SidePanelContext.Provider>
  );
}

export function useSidePanel() {
  const context = useContext(SidePanelContext);
  if (context === undefined) {
    throw new Error('useSidePanel must be used within a SidePanelProvider');
  }
  return context;
}