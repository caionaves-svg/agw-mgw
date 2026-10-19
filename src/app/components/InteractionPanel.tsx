import { useState } from "react";
import { Resizable } from "re-resizable";
import {
  Info,
  Sparkles,
  Route,
  Star,
  MessageSquare,
  Paperclip,
  Zap,
  Activity,
  ClipboardList,
  History,
  BarChart2,
} from "lucide-react";
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
import { WizzInsightSection } from "./interaction-panel/WizzInsightSection";
import { NetworkMonitoringSection } from "./interaction-panel/NetworkMonitoringSection";


interface InteractionPanelProps {
  atendimento?: {
    id: string;
    cliente: {
      nome: string;
      avatar: string;
    };
    status: string;
    tempoAtendimento: string;
    canal: string;
    atendente?: {
      nome: string;
      cor: string;
    };
    isEmCurso?: boolean;
  };
}

export default function InteractionPanel({
  atendimento,
}: InteractionPanelProps) {
  // Estado para controlar qual seção está ativa (null = colapsado)
  const [activeSection, setActiveSection] = useState<
    string | null
  >(null);

  // Estado para lembrar da largura customizada pelo usuário
  const [customWidth, setCustomWidth] = useState<number>(464);

  // Seções disponíveis
  const sections = [
    { id: "info",              icon: Info,          title: "Informações" },
    { id: "comentarios",       icon: MessageSquare, title: "Comentários do caso" },
    { id: "anexos",            icon: Paperclip,     title: "Anexos" },
    { id: "historico-casos",   icon: ClipboardList, title: "Histórico de Casos" },
    { id: "historico-cliente", icon: History,       title: "Histórico do Cliente" },
    { id: "enquetes",          icon: BarChart2,     title: "Enquetes" },
    { id: "wizzinsight",       icon: Sparkles,      title: "Wizz Insight" },
    { id: "jornada",           icon: Route,         title: "Jornada do cliente" },
    { id: "experiencia",       icon: Star,          title: "Experiência" },
    { id: "monitoramento",     icon: Activity,      title: "Monitoramento de Internet" },
  ];

  // Função para toggle de seção
  const toggleSection = (sectionId: string) => {
    if (activeSection === sectionId) {
      // Se clicar na mesma seção, fecha
      setActiveSection(null);
    } else {
      // Se clicar em outra seção, abre ela
      setActiveSection(sectionId);
    }
  };

  // Verifica se está colapsado (nenhuma seção ativa)
  const isCollapsed = activeSection === null;

  return (
    <Resizable
      size={{
        width: isCollapsed ? 63 : customWidth,
        height: "100%",
      }}
      minWidth={isCollapsed ? 63 : 320}
      maxWidth={isCollapsed ? 63 : 800}
      enable={{
        top: false,
        right: false,
        bottom: false,
        left: !isCollapsed,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      onResizeStop={(e, direction, ref, d) => {
        // Salva a nova largura quando o usuário termina de redimensionar
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
      className="transition-all duration-300"
    >
      <div className="bg-gray-100 border-l border-gray-200 h-full flex flex-col w-full">
        {/* Conteúdo principal */}
        <div className="flex-1 flex overflow-hidden">
          {/* Painel de conteúdo - só aparece quando expandido */}
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden p-4">
              {activeSection === "info" && (
                <InformationSection
                  atendimento={atendimento}
                  onClose={() => setActiveSection(null)}
                />
              )}
              {activeSection === "jornada" && (
                <JourneySection
                  onClose={() => setActiveSection(null)}
                />
              )}
              {activeSection === "experiencia" && (
                <ExperienceSection
                  onClose={() => setActiveSection(null)}
                />
              )}
              {activeSection === "comentarios" && (
                <InternalCommentsSection
                  atendimento={atendimento}
                  onClose={() => setActiveSection(null)}
                />
              )}
              {activeSection === "anexos" && (
                <AttachmentsSection
                  onClose={() => setActiveSection(null)}
                />
              )}
              {activeSection === "historico-casos" && (
                <HistoricoCasosSection
                  casoId={atendimento?.id ?? "—"}
                  onClose={() => setActiveSection(null)}
                />
              )}
              {activeSection === "historico-cliente" && (
                <HistoricoClienteSection
                  onClose={() => setActiveSection(null)}
                />
              )}
              {activeSection === "enquetes" && (
                <EnquetesSection
                  onClose={() => setActiveSection(null)}
                />
              )}
              {activeSection === "acoes" && (
                <ActionsSection
                  onClose={() => setActiveSection(null)}
                />
              )}
              {activeSection === "wizzinsight" && (
                <WizzInsightSection
                  onClose={() => setActiveSection(null)}
                />
              )}
              {activeSection === "monitoramento" && (
                <NetworkMonitoringSection
                  onClose={() => setActiveSection(null)}
                />
              )}
            </div>
          )}

          {/* Barra de ícones à direita */}
          <div className="w-[63px] flex-shrink-0 border-l border-gray-200">
            <InteractionSidebarButtons
              sections={sections}
              activeSection={activeSection}
              actionSection={activeSection}
              onToggleSection={toggleSection}
            />
          </div>
        </div>
      </div>
    </Resizable>
  );
}