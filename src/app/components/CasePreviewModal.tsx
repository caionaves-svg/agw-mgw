import { useEffect, useState } from "react";
import {
  X,
  Download,
  Info,
  Paperclip,
  ClipboardList,
  History,
  BarChart2,
  Lock,
  Copy,
  Check,
  ExternalLink,
  Clock,
  RefreshCw,
  CheckCircle2,
  RotateCcw,
  Pencil,
  Tag,
  UserMinus,
  UserPlus,
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

// Ações disponíveis no dropdown do header — ícone + label, igual aos menus do app
const CASE_ACTIONS = [
  { label: "Agendar Atendimento", icon: Clock },
  { label: "Alterar Status",      icon: RefreshCw },
  { label: "Finalizar Caso",      icon: CheckCircle2 },
  { label: "Reabrir Caso",        icon: RotateCcw },
  { label: "Editar Caso",         icon: Pencil },
  { label: "Reclassificar Caso",  icon: Tag },
  { label: "Remover Usuário",     icon: UserMinus },
  { label: "Delegar Caso",        icon: UserPlus },
];

interface CasePreviewModalProps {
  usuario: Usuario;
  onClose: () => void;
  /** true quando veio de um link direto (nova aba) — ocupa a página inteira,
   * sem backdrop/drawer nem o pill de link (você já está nessa URL). */
  fullPage?: boolean;
}

export function CasePreviewModal({
  usuario,
  onClose,
  fullPage = false,
}: CasePreviewModalProps) {
  const { selectAtendimentoAndOpen, selectedAtendimento } =
    useSidePanel();
  const [activeSection, setActiveSection] =
    useState<ModalSection>("info");
  const [visible, setVisible] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Link real do app — abrir essa URL reabre este mesmo caso (ver
  // CasosManagementPage: sincroniza o preview com ?caso= na URL).
  const caseLink = `${window.location.origin}/management/cases?caso=${usuario.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(caseLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Sem permissão de clipboard — ignora silenciosamente
    }
  };

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

  // Painéis não têm botão de fechar próprio neste fluxo — a única forma de sair
  // é pelo X do modal (header) ou Esc, então não passamos onClose às seções.
  const renderSection = (type: ModalSection) => {
    switch (type) {
      case "info":
        return (
          <InformationSection
            atendimento={selectedAtendimento}
            showKpis
          />
        );
      case "anexos":
        return <AttachmentsSection />;
      case "historico-casos":
        return <HistoricoCasosSection casoId={usuario.id} />;
      case "historico-cliente":
        return <HistoricoClienteSection />;
      case "enquetes":
        return <EnquetesSection />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col">
      {/* Backdrop — só no modo drawer (aberto por cima da tabela) */}
      {!fullPage && (
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
          onClick={onClose}
        />
      )}

      {/* Modal */}
      <div
        className={`relative flex flex-col h-full ${fullPage ? "" : "pointer-events-none pt-16"}`}
      >
        {/* Inner — drawer: card flutuante abaixo do header. Página cheia: preenche tudo. */}
        <div
          className={`flex flex-col bg-background overflow-hidden flex-1 ${
            fullPage
              ? ""
              : `pointer-events-auto transition-all duration-300 ease-out rounded-tl-xl rounded-tr-xl shadow-2xl ${
                  visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-6 opacity-0"
                }`
          }`}
        >
          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="relative flex items-center justify-between px-5 py-3 border-b border-border bg-card flex-shrink-0">
            {/* Left: case identity */}
            <h2 className="text-sm font-semibold text-foreground flex-shrink-0">
              {usuario.nome} - {usuario.id}
            </h2>

            {/* Center: link de visualização do caso — copiar e abrir.
                Some no modo página cheia: você já está nessa própria URL. */}
            {!fullPage && (
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1.5 max-w-[380px] pl-3 pr-1.5 py-1.5 rounded-full border border-border bg-muted text-xs text-muted-foreground">
              <Lock className="w-3 h-3 flex-shrink-0" />
              <span className="truncate font-mono">{caseLink}</span>
              <button
                onClick={handleCopyLink}
                className="flex-shrink-0 p-1 rounded-full hover:bg-accent hover:text-foreground transition-colors"
                title="Copiar link"
              >
                {linkCopied ? (
                  <Check className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={() =>
                  window.open(caseLink, "_blank", "noopener,noreferrer")
                }
                className="flex-shrink-0 p-1 rounded-full hover:bg-accent hover:text-foreground transition-colors"
                title="Abrir em nova aba"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
            )}

            {/* Right: actions */}
            <div className="flex items-center gap-3">
              {/* Action dropdown */}
              <Select>
                <SelectTrigger className="h-7 w-44 text-xs">
                  <SelectValue placeholder="Selecione uma ação" />
                </SelectTrigger>
                <SelectContent className="z-[300]">
                  {CASE_ACTIONS.map(({ label, icon: ActionIcon }) => (
                    <SelectItem key={label} value={label} className="text-xs">
                      <div className="flex items-center gap-2">
                        <ActionIcon className="w-3.5 h-3.5" />
                        {label}
                      </div>
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