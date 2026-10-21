import { useState } from "react";
import { Resizable } from "re-resizable";
import { useLocation } from "react-router";
import {
  useSidePanel,
  SidePanelContentType,
} from "../contexts/SidePanelContext";
import WizzPanel from "./WizzPanel";
import AppsPanel from "./AppsPanel";
import { InformationSection } from "./interaction-panel/InformationSection";
import { JourneySection } from "./interaction-panel/JourneySection";
import { ExperienceSection } from "./interaction-panel/ExperienceSection";
import { InternalCommentsSection } from "./interaction-panel/InternalCommentsSection";
import { AttachmentsSection } from "./interaction-panel/AttachmentsSection";
import { ActionsSection } from "./interaction-panel/ActionsSection";
import { HistoricoCasosSection } from "./interaction-panel/HistoricoCasosSection";
import { HistoricoClienteSection } from "./interaction-panel/HistoricoClienteSection";
import { EnquetesSection } from "./interaction-panel/EnquetesSection";
import { InteractionSidebarButtons } from "./interaction-panel/InteractionSidebarButtons";
import { CollabSection } from "./collab/CollabPanel";
import {
  Info,
  Star,
  MessageSquare,
  Paperclip,
  Route,
  ClipboardList,
  History,
  BarChart2,
} from "lucide-react";

export default function GlobalRightPanel() {
  const {
    isOpen,
    contentType,
    actionSection,
    selectedAtendimento,
    togglePanel,
    closePanel,
    isDualMode,
  } = useSidePanel();
  const [customWidth, setCustomWidth] = useState(464);
  const location = useLocation();

  // Verifica se está na tela de atendimentos (aceita barra final: /atendimentos/)
  const isAtendimentosPage =
    location.pathname.replace(/\/+$/, "") === "/atendimentos";

  // Seções disponíveis para o InteractionPanel
  const sections = [
    { id: "info",              icon: Info,          title: "Informações" },
    { id: "comentarios",       icon: MessageSquare, title: "Comentários do caso" },
    { id: "anexos",            icon: Paperclip,     title: "Anexos" },
    { id: "historico-casos",   icon: ClipboardList, title: "Histórico de Casos" },
    { id: "historico-cliente", icon: History,       title: "Histórico do Cliente" },
    { id: "enquetes",          icon: BarChart2,     title: "Enquetes" },
  ];

  // Define se o painel está colapsado (apenas barra de ícones visível)
  const isCollapsed = !isOpen;

  // Só renderiza na página de atendimentos
  if (!isAtendimentosPage) return null;

  // Se estiver na página de atendimentos mas sem atendimento selecionado e fechado, não renderiza
  if (!selectedAtendimento && !isOpen) return null;

  // Função para renderizar conteúdo da seção
  const renderSectionContent = (type: SidePanelContentType) => {
    switch (type) {
      case "wizz":
        return <WizzPanel />;
      case "apps":
        return <AppsPanel />;
      case "info":
        return (
          <InformationSection
            atendimento={selectedAtendimento}
            onClose={() => togglePanel("info")}
          />
        );
      case "jornada":
        return (
          <JourneySection
            onClose={() => togglePanel("jornada")}
          />
        );
      case "experiencia":
        return (
          <ExperienceSection
            onClose={() => togglePanel("experiencia")}
          />
        );
      case "comentarios":
        return (
          <InternalCommentsSection
            atendimento={selectedAtendimento}
            onClose={() => togglePanel("comentarios")}
          />
        );
      case "anexos":
        return (
          <AttachmentsSection
            onClose={() => togglePanel("anexos")}
          />
        );
      case "historico-casos":
        return (
          <HistoricoCasosSection
            casoId={selectedAtendimento?.id ?? "—"}
            onClose={() => togglePanel("historico-casos")}
          />
        );
      case "historico-cliente":
        return (
          <HistoricoClienteSection
            onClose={() => togglePanel("historico-cliente")}
          />
        );
      case "enquetes":
        return (
          <EnquetesSection
            onClose={() => togglePanel("enquetes")}
          />
        );
      case "collab":
        return <CollabSection />;
      case "acoes":
        return (
          <ActionsSection
            onClose={() => togglePanel("acoes")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Resizable
      size={{
        width: isCollapsed ? 56 : customWidth,
        height: "100%",
      }}
      minWidth={isCollapsed ? 56 : 420}
      maxWidth={isCollapsed ? 56 : 800}
      enable={{
        left: !isCollapsed,
        top: false,
        right: false,
        bottom: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      onResizeStop={(e, direction, ref, d) => {
        if (!isCollapsed) {
          setCustomWidth(customWidth + d.width);
        }
      }}
      handleStyles={{
        left: {
          width: "4px",
          left: "0",
          cursor: "col-resize",
          backgroundColor: "transparent",
          transition: "background-color 0.2s",
        },
      }}
      handleClasses={{
        left: "hover:bg-brand-primary/20",
      }}
      className="transition-all duration-300 flex-shrink-0"
    >
      <div className="bg-muted border-l border-border h-full flex flex-col w-full">
        {/* Conteúdo principal */}
        <div className="flex-1 flex overflow-hidden gap-0 p-0">
          {/* Barra de ícones à esquerda - só aparece na página de atendimentos */}
          {isAtendimentosPage && selectedAtendimento && (
            <div className="w-14 flex-shrink-0">
              <InteractionSidebarButtons
                sections={sections}
                activeSection={contentType}
                actionSection={actionSection}
                onToggleSection={(sectionId) =>
                  togglePanel(
                    sectionId as any,
                    selectedAtendimento,
                  )
                }
              />
            </div>
          )}

          {/* Painel de conteúdo - só aparece quando expandido */}
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden flex flex-col">
              {isDualMode ? (
                // Modo Dual: Info em cima + Ações em baixo
                <>
                  {/* Seção informativa (55% da altura) */}
                  <div className="flex-[55] overflow-hidden pr-2 pt-2 pb-2">
                    {renderSectionContent(contentType)}
                  </div>

                  {/* Seção de ações (45% da altura) */}
                  <div className="flex-[45] overflow-hidden pr-2 pb-2">
                    {renderSectionContent(actionSection)}
                  </div>
                </>
              ) : (
                // Modo Single: Uma seção ocupa 100%
                <div className="flex-1 overflow-hidden pr-2 py-2">
                  {renderSectionContent(contentType)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Resizable>
  );
}