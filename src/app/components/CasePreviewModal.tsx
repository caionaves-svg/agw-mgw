import { useEffect, useState } from "react";
import {
  X,
  Download,
  Info,
  Paperclip,
  ClipboardList,
  History,
  BarChart2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useSidePanel } from "../contexts/SidePanelContext";
import { InteractionSidebarButtons } from "./interaction-panel/InteractionSidebarButtons";
import { InformationSection } from "./interaction-panel/InformationSection";
import { AttachmentsSection } from "./interaction-panel/AttachmentsSection";
import { HistoricoCasosSection } from "./interaction-panel/HistoricoCasosSection";
import { HistoricoClienteSection } from "./interaction-panel/HistoricoClienteSection";
import { EnquetesSection } from "./interaction-panel/EnquetesSection";
import ChatPanel from "./ChatPanel";
import { Usuario } from "../contexts/DataContext";

type ModalSection = "info" | "anexos" | "historico-casos" | "historico-cliente" | "enquetes";

// Seções disponíveis no painel lateral do modal
const SECTIONS = [
  { id: "info",              icon: Info,          title: "Informações" },
  { id: "anexos",            icon: Paperclip,     title: "Anexos" },
  { id: "historico-casos",   icon: ClipboardList, title: "Histórico de Casos" },
  { id: "historico-cliente", icon: History,       title: "Histórico do Cliente" },
  { id: "enquetes",          icon: BarChart2,     title: "Enquetes" },
];

interface CasePreviewModalProps {
  usuario: Usuario;
  onClose: () => void;
}

export function CasePreviewModal({
  usuario,
  onClose,
}: CasePreviewModalProps) {
  const { selectAtendimentoAndOpen, selectedAtendimento } =
    useSidePanel();
  const [activeSection, setActiveSection] =
    useState<ModalSection>("info");
  const [visible, setVisible] = useState(false);

  // Trigger entrance animation on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Seta o atendimento no contexto global para que as seções recebam os dados
  useEffect(() => {
    selectAtendimentoAndOpen({
      id: usuario.id,
      cliente: { nome: usuario.nome, avatar: usuario.avatar },
      status: usuario.isEmCurso
        ? "Em atendimento"
        : "Aguardando Atendimento",
      tempoAtendimento: "00:00:00",
      canal: usuario.channel as any,
      atendente: usuario.atendente,
      isEmCurso: usuario.isEmCurso,
    });
  }, [usuario.id]);

  // Fecha ao pressionar Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () =>
      document.removeEventListener("keydown", handler);
  }, [onClose]);

  const atendimento = {
    id: usuario.id,
    cliente: { nome: usuario.nome, avatar: usuario.avatar },
    status: usuario.isEmCurso
      ? "Em atendimento"
      : "Aguardando Atendimento",
    tempoAtendimento: "00:00:00",
    canal: usuario.channel as any,
    atendente: usuario.atendente,
    isEmCurso: usuario.isEmCurso,
  };

  const noop = () => {};

  const renderSection = (type: ModalSection) => {
    switch (type) {
      case "info":
        return (
          <InformationSection
            atendimento={selectedAtendimento}
            onClose={noop}
            showKpis
          />
        );
      case "anexos":
        return <AttachmentsSection onClose={noop} />;
      case "historico-casos":
        return <HistoricoCasosSection casoId={usuario.id} onClose={noop} />;
      case "historico-cliente":
        return <HistoricoClienteSection onClose={noop} />;
      case "enquetes":
        return <EnquetesSection onClose={noop} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative flex flex-col h-full pointer-events-none pt-16">
        {/* Inner — card starts below the app header, full width */}
        <div
          className={`flex flex-col bg-background pointer-events-auto transition-all duration-300 ease-out flex-1 rounded-tl-xl rounded-tr-xl overflow-hidden shadow-2xl ${
            visible
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card flex-shrink-0">
            {/* Left: case identity */}
            <h2 className="text-sm font-semibold text-foreground">
              {usuario.nome}
              <span className="font-mono font-normal text-muted-foreground ml-1.5">
                - {usuario.id}
              </span>
            </h2>

            {/* Right: actions */}
            <div className="flex items-center gap-3">
              {/* Action dropdown */}
              <Select>
                <SelectTrigger className="h-7 w-44 text-xs">
                  <SelectValue placeholder="Selecione uma ação" />
                </SelectTrigger>
                <SelectContent className="z-[300]">
                  {[
                    "Agendar Atendimento",
                    "Alterar Status",
                    "Finalizar Caso",
                    "Reabrir Caso",
                    "Editar Caso",
                    "Reclassificar Caso",
                    "Remover Usuário",
                    "Delegar Caso",
                  ].map((action) => (
                    <SelectItem key={action} value={action} className="text-xs">
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Exportar */}
              <button className="flex items-center gap-1.5 text-xs text-foreground border border-border rounded-full px-3 py-1.5 hover:bg-muted transition-colors">
                <Download className="w-3 h-3 text-muted-foreground" />
                Exportar
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Fechar visualização (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── Body ────────────────────────────────────────────────────── */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Left: Interaction Panel ──────────────────────────────────── */}
            <div className="w-[35%] flex-shrink-0 border-r border-border bg-muted flex overflow-hidden">
              {/* Icon sidebar */}
              <div className="w-14 flex-shrink-0">
                <InteractionSidebarButtons
                  sections={SECTIONS}
                  activeSection={activeSection}
                  onToggleSection={(id) =>
                    setActiveSection(id as ModalSection)
                  }
                  hideActions
                />
              </div>

              {/* Section content */}
              <div className="flex-1 overflow-hidden py-2 pr-2">
                {renderSection(activeSection)}
              </div>
            </div>

            {/* Right: Chat read-only ────────────────────────────────────── */}
            <div className="w-[65%] overflow-hidden min-w-0">
              <ChatPanel atendimento={atendimento} readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}