import { useState, useMemo, useEffect, useRef, Fragment } from "react";
import { useSearchParams } from "react-router";
import type { SLA, Tag } from "../contexts/DataContext";
import { useData, Usuario } from "../contexts/DataContext";
import { CasePreviewModal } from "../components/CasePreviewModal";
import { openCaseInNewTab } from "../components/CaseIdBadge";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { SearchInput } from "../components/ui/search-input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Eye,
  ExternalLink,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Phone,
  Mail,
  HelpCircle,
  Columns3,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MessageCircle,
  AlignJustify,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

type TipoCasoVariant =
  "green" | "yellow" | "purple" | "blue" | "info" | "gray";

function getTipoCaso(channel: string): {
  label: string;
  variant: TipoCasoVariant;
} {
  switch (channel) {
    case "whatsapp":
      return { label: "SAC WhatsApp", variant: "green" };
    case "email":
      return { label: "SAC E-mail", variant: "yellow" };
    case "instagram":
      return { label: "SAC Instagram", variant: "purple" };
    case "facebook":
      return { label: "SAC Facebook", variant: "blue" };
    case "telefone":
      return { label: "SAC Voz", variant: "info" };
    default:
      return { label: "Tipo Temporário", variant: "gray" };
  }
}

function getListaCasos(channel: string, tags?: Tag[]): string {
  if (channel === "email") return "SAC E-mail";
  if (tags && tags.length > 0) return tags[0].label;
  if (channel === "whatsapp") return "";
  return "Lista de Caso Temporário";
}

const MAPA_TEMPOS: Record<string, number> = {
  "156482": 1,
  "742130": 15,
  "324567": 45,
  "987654": 90,
  "654321": 180,
  "789012": 360,
  "234567": 720,
  "345678": 1440,
  "456789": 2880,
  "567890": 4320,
  "123890": 20160,
  "890123": 30240,
  "901234": 43200,
};

function getMinutosAtras(id: string): number {
  return MAPA_TEMPOS[id] ?? ((parseInt(id, 10) * 7) % 120) + 1;
}

function formatDataAtualizacao(id: string): string {
  const mins = getMinutosAtras(id);
  const d = new Date(Date.now() - mins * 60_000);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} - ${hh}:${mi}`;
}

type SlaType = "ok" | "breach" | "risk" | "none";

function getSlaDisplay(
  sla?: SLA,
  id?: string,
): { text: string; type: SlaType } {
  if (sla) {
    const t = sla.tempoRestante;
    if (sla.status === "dentro-prazo")
      return { text: `+${t}`, type: "ok" };
    if (sla.status === "em-risco")
      return { text: t, type: "risk" };
    return { text: `-${t}`, type: "breach" };
  }
  const mins = getMinutosAtras(id ?? "0");
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return mins < 30
    ? { text: `+${h}:${m}`, type: "ok" }
    : { text: `-${h}:${m}`, type: "breach" };
}

function ChannelIcon({
  channel,
  className = "w-3.5 h-3.5",
}: {
  channel: string;
  className?: string;
}) {
  switch (channel) {
    case "whatsapp":
      return <MessageSquare className={className} />;
    case "email":
      return <Mail className={className} />;
    case "telefone":
      return <Phone className={className} />;
    default:
      return <MessageCircle className={className} />;
  }
}

type SortKey =
  "id" | "tipo" | "pessoa" | "sla" | "atualizado" | "status";
type SortDir = "asc" | "desc";

function SortIcon({
  col,
  sortKey,
  sortDir,
}: {
  col: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
}) {
  if (sortKey !== col)
    return (
      <ArrowUpDown className="w-3 h-3 text-muted-foreground/40 ml-1 flex-shrink-0" />
    );
  return sortDir === "desc" ? (
    <ArrowDown className="w-3 h-3 text-primary ml-1 flex-shrink-0" />
  ) : (
    <ArrowUp className="w-3 h-3 text-primary ml-1 flex-shrink-0" />
  );
}

// ─── sidebar nav data ───────────────────────────────────────────────────────

const NAV_SECTIONS = [
  {
    id: "monitoramento",
    label: "Monitoramento",
    items: [
      { id: "geral", label: "Geral" },
      { id: "chat", label: "Chat" },
      { id: "voz", label: "Voz" },
      { id: "canais-voz", label: "Canais de Voz" },
      { id: "offline", label: "Offline" },
      { id: "agentes", label: "Agentes" },
    ],
  },
  {
    id: "gestao",
    label: "Gestão",
    items: [
      { id: "pesquisa-casos", label: "Pesquisa de Casos" },
      { id: "pesquisa-emails", label: "Pesquisa de E-Mails" },
    ],
  },
  {
    id: "relatorios",
    label: "Relatórios",
    items: [
      { id: "rel-chat", label: "Chat" },
      { id: "rel-voz", label: "Voz" },
      { id: "rel-offline", label: "Offline" },
    ],
  },
];

// ─── component ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

export default function CasosManagementPage() {
  const { usuarios, conversas } = useData();

  // sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<
    Set<string>
  >(new Set());
  const [activeNavItem, setActiveNavItem] =
    useState("pesquisa-casos");

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // preview modal state — sincronizado com ?caso= na URL, pra permitir link
  // direto (copiar/abrir em nova aba reabre o mesmo caso)
  const [searchParams, setSearchParams] = useSearchParams();
  const [previewUsuario, setPreviewUsuario] =
    useState<Usuario | null>(null);
  // true só quando o preview veio de carregar a URL direto (link/nova aba) —
  // nesse caso o conteúdo deve ocupar a página inteira, sem o drawer/backdrop
  // nem o pill de link (você já está nessa própria URL).
  const [isDeepLink, setIsDeepLink] = useState(false);
  const initialUrlCheckedRef = useRef(false);

  const openPreview = (u: Usuario) => {
    setIsDeepLink(false);
    setPreviewUsuario(u);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("caso", u.id);
        return next;
      },
      { replace: true },
    );
  };

  const closePreview = () => {
    setPreviewUsuario(null);
    setIsDeepLink(false);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("caso");
        return next;
      },
      { replace: true },
    );
  };

  // Abriu com ?caso=ID na URL (link direto) — reabre o preview desse caso,
  // em página cheia. Só roda uma vez, na carga inicial.
  useEffect(() => {
    if (initialUrlCheckedRef.current) return;
    const casoId = searchParams.get("caso");
    if (casoId) {
      const usuario = usuarios.find((u) => u.id === casoId);
      if (usuario) {
        setPreviewUsuario(usuario);
        setIsDeepLink(true);
      }
    }
    initialUrlCheckedRef.current = true;
  }, [usuarios]);

  // table state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(),
  );
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [chips, setChips] = useState([
    { id: "periodo", label: "Criado em(Últimos 30 dias)" },
    { id: "atribuido", label: "Atribuído à" },
    { id: "status", label: "Status do Caso" },
  ]);

  const interacoesMap = useMemo(() => {
    const map: Record<string, number> = {};
    conversas.forEach((h) => {
      map[h.usuarioId] = h.mensagens.length;
    });
    return map;
  }, [conversas]);

  const filteredCasos = useMemo(() => {
    let list = [...usuarios];
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      list = list.filter(
        (u) =>
          u.nome.toLowerCase().includes(t) ||
          u.id.includes(t) ||
          (u.atendente?.nome ?? "").toLowerCase().includes(t),
      );
    }
    list.sort((a, b) => {
      const dir = sortDir === "desc" ? -1 : 1;
      switch (sortKey) {
        case "id":
          return (
            dir * (parseInt(b.id, 10) - parseInt(a.id, 10))
          );
        case "pessoa":
          return dir * a.nome.localeCompare(b.nome);
        case "status":
          return (
            dir *
            ((a.isEmCurso ? 1 : 0) - (b.isEmCurso ? 1 : 0))
          );
        case "atualizado":
          return (
            dir *
            (getMinutosAtras(a.id) - getMinutosAtras(b.id))
          );
        default:
          return 0;
      }
    });
    return list;
  }, [usuarios, searchTerm, sortKey, sortDir]);

  const totalPages = Math.ceil(
    filteredCasos.length / PAGE_SIZE,
  );
  const pagedCasos = filteredCasos.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const allSelected =
    pagedCasos.length > 0 &&
    pagedCasos.every((u) => selectedIds.has(u.id));
  const someSelected = pagedCasos.some((u) =>
    selectedIds.has(u.id),
  );

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pagedCasos.forEach((u) => next.delete(u.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pagedCasos.forEach((u) => next.add(u.id));
        return next;
      });
    }
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key)
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  // Pagination page numbers with ellipsis
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, i) => i + 1,
  ).filter(
    (p) =>
      p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <div className="h-full flex flex-row bg-background overflow-hidden relative">
      {/* ── Left Sidebar ────────────────────────────────────────────────── */}
      <div
        className={`flex-shrink-0 bg-background flex flex-col transition-all duration-200 overflow-hidden ${
          sidebarOpen ? "w-44 border-r border-border" : "w-0"
        }`}
      >
        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto pt-4 pb-1">
          {NAV_SECTIONS.map((section) => {
            const collapsed = collapsedSections.has(section.id);
            return (
              <div key={section.id} className="mb-1">
                {/* Section header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  <span>{section.label}</span>
                  {collapsed ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronUp className="w-3 h-3" />
                  )}
                </button>

                {/* Items */}
                {!collapsed && (
                  <div className="flex flex-col">
                    {section.items.map((item) => {
                      const isActive =
                        activeNavItem === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() =>
                            setActiveNavItem(item.id)
                          }
                          className={`text-left text-xs px-4 py-1.5 transition-colors relative ${
                            isActive
                              ? "text-primary font-semibold before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-primary before:rounded-r"
                              : "text-foreground hover:text-primary hover:bg-muted/50"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Botão flutuante de recolher/expandir — fica sobre a linha divisória
          entre a sidebar e o conteúdo principal */}
      <button
        onClick={() => setSidebarOpen((v) => !v)}
        className="absolute top-4 z-20 flex items-center justify-center w-6 h-6 rounded-full border border-border bg-background shadow-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-[left] duration-200"
        style={
          sidebarOpen
            ? { left: "11rem", transform: "translateX(-50%)" }
            : { left: "0.5rem" }
        }
        title={sidebarOpen ? "Recolher menu" : "Expandir menu"}
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">
                Gestão de Casos
              </h1>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button>
                      <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="text-xs max-w-[200px]">
                      Visualize e gerencie todos os casos de
                      atendimento em uma visão unificada.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gerencie e acompanhe todos os casos de atendimento
            </p>
          </div>

          {/* Workspace selector */}
          <button className="flex items-center gap-2 text-sm text-foreground border border-border rounded-lg px-3 py-2 hover:bg-muted transition-colors">
            Space Bank SAC
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden flex flex-col px-6 py-4 gap-3 min-h-0">
          {/* ── Toolbar ─────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-2.5 flex-shrink-0">
            {/* Linha 1: contagem + busca */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Casos
                <span className="text-muted-foreground font-normal">
                  {filteredCasos.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <SearchInput
                  placeholder="Busque por Casos..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  showIcon
                  className="w-52"
                />
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Columns3 className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">
                        Configurar colunas
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Linha 2: filtros + ações */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Saved filters preset */}
                <button className="flex items-center gap-1.5 text-xs border border-primary/40 text-primary rounded-full px-3 py-1 hover:bg-primary/5 transition-colors">
                  <AlignJustify className="w-3 h-3" />
                  Meus Filtros
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Active filter chips */}
                {chips.map((chip) => (
                  <div
                    key={chip.id}
                    className="flex items-center gap-1.5 text-xs border border-border rounded-full px-2.5 py-1 text-foreground"
                  >
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    <span>{chip.label}</span>
                    <button
                      onClick={() =>
                        setChips((prev) =>
                          prev.filter((c) => c.id !== chip.id),
                        )
                      }
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Add filter */}
                <button className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground rounded-full px-3 py-1 hover:bg-primary/90 transition-colors">
                  <Plus className="w-3 h-3" />
                  Adicionar Filtro
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button className="text-xs text-primary hover:underline whitespace-nowrap">
                  Salvar Filtros
                </button>
                <button className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap">
                  Limpar Todos
                </button>
                <Button
                  variant="brand"
                  size="sm"
                  className="gap-1.5 text-xs"
                >
                  <RefreshCw className="w-3 h-3" />
                  Aplicar
                </Button>
              </div>
            </div>
          </div>

          {/* ── Table ───────────────────────────────────────────────────── */}
          <div className="flex-1 border border-border rounded-xl overflow-hidden flex flex-col min-h-0">
            <div className="overflow-auto flex-1">
              <table className="w-full text-sm border-collapse min-w-[900px]">
                {/* Head */}
                <thead className="sticky top-0 z-10">
                  <tr className="bg-muted border-b border-border">
                    <th className="w-10 px-3 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el)
                            el.indeterminate =
                              someSelected && !allSelected;
                        }}
                        onChange={toggleAll}
                        className="rounded border-border accent-primary"
                      />
                    </th>

                    {(
                      [
                        {
                          key: "id",
                          label: "ID do Caso",
                          sortable: true,
                        },
                        {
                          key: "tipo",
                          label: "Tipo de Caso",
                          sortable: true,
                        },
                        {
                          key: "pessoa",
                          label: "Pessoa",
                          sortable: true,
                        },
                        {
                          key: "sla",
                          label: "Indicador de SLA",
                          sortable: true,
                        },
                        {
                          key: null,
                          label: "Lista de Casos",
                          sortable: false,
                        },
                        {
                          key: null,
                          label: "Atribuído à",
                          sortable: false,
                        },
                        {
                          key: "atualizado",
                          label: "Data de Atualização",
                          sortable: true,
                        },
                        {
                          key: null,
                          label: "Interações",
                          sortable: false,
                        },
                        {
                          key: "status",
                          label: "Status",
                          sortable: true,
                        },
                      ] as {
                        key: SortKey | null;
                        label: string;
                        sortable: boolean;
                      }[]
                    ).map(({ key, label, sortable }) => (
                      <th
                        key={label}
                        className={`px-3 py-3 text-left font-medium text-muted-foreground text-xs whitespace-nowrap ${sortable ? "cursor-pointer select-none hover:text-foreground" : ""}`}
                        onClick={() =>
                          sortable && key && handleSort(key)
                        }
                      >
                        <span className="flex items-center">
                          {label}
                          {sortable && key && (
                            <SortIcon
                              col={key}
                              sortKey={sortKey}
                              sortDir={sortDir}
                            />
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Body */}
                <tbody className="bg-card divide-y divide-border">
                  {pagedCasos.map((u) => {
                    const tipo = getTipoCaso(u.channel);
                    const sla = getSlaDisplay(u.sla, u.id);
                    const lista = getListaCasos(
                      u.channel,
                      u.tags,
                    );
                    const dataStr = formatDataAtualizacao(u.id);
                    const interacoes = interacoesMap[u.id] ?? 0;
                    const isSel = selectedIds.has(u.id);

                    return (
                      <tr
                        key={u.id}
                        className={`group transition-colors cursor-pointer ${isSel ? "bg-primary/5" : "hover:bg-accent/60"}`}
                        onClick={() => toggleRow(u.id)}
                      >
                        {/* Checkbox */}
                        <td
                          className="px-3 py-2.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={() => toggleRow(u.id)}
                            className="rounded border-border accent-primary"
                          />
                        </td>

                        {/* ID do Caso */}
                        <td className="px-3 py-2.5">
                          <div
                            className="flex items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <TooltipProvider
                              delayDuration={300}
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() =>
                                      openPreview(u)
                                    }
                                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  <p className="text-xs">
                                    Visualizar atendimento
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider
                              delayDuration={300}
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => openCaseInNewTab(u.id)}
                                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  <p className="text-xs">
                                    Abrir em nova aba
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <button
                              onClick={() => openCaseInNewTab(u.id)}
                              title="Abrir detalhamento do caso em nova aba"
                              className="text-primary hover:underline font-medium text-xs tabular-nums"
                            >
                              {u.id}
                            </button>
                          </div>
                        </td>

                        {/* Tipo de Caso */}
                        <td className="px-3 py-2.5">
                          <Badge
                            variant={tipo.variant as any}
                            size="sm"
                            shape="rounded"
                          >
                            {tipo.label}
                          </Badge>
                        </td>

                        {/* Pessoa */}
                        <td className="px-3 py-2.5">
                          <span className="inline-block text-xs text-foreground bg-muted border border-border rounded-md px-2 py-0.5 max-w-[160px] truncate">
                            {u.nome}
                          </span>
                        </td>

                        {/* Indicador de SLA */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            {sla.type === "ok" && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0" />
                            )}
                            {sla.type === "breach" && (
                              <XCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                            )}
                            {sla.type === "risk" && (
                              <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0" />
                            )}
                            <span
                              className={`text-xs font-medium tabular-nums ${
                                sla.type === "ok"
                                  ? "text-success"
                                  : sla.type === "breach"
                                    ? "text-destructive"
                                    : sla.type === "risk"
                                      ? "text-warning"
                                      : "text-muted-foreground"
                              }`}
                            >
                              {sla.text}
                            </span>
                          </div>
                        </td>

                        {/* Lista de Casos */}
                        <td className="px-3 py-2.5">
                          <span className="text-xs text-foreground">
                            {lista || (
                              <span className="text-muted-foreground">
                                —
                              </span>
                            )}
                          </span>
                        </td>

                        {/* Atribuído à */}
                        <td className="px-3 py-2.5">
                          {u.atendente ? (
                            <span className="inline-block text-xs bg-muted border border-border rounded-md px-2 py-0.5 max-w-[130px] truncate">
                              {u.atendente.nome}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          )}
                        </td>

                        {/* Data de Atualização */}
                        <td className="px-3 py-2.5">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {dataStr}
                          </span>
                        </td>

                        {/* Interações */}
                        <td className="px-3 py-2.5">
                          {interacoes > 0 ? (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted border border-border rounded-md px-2 py-0.5 w-fit">
                              <ChannelIcon
                                channel={u.channel}
                                className="w-3 h-3"
                              />
                              <span className="font-medium">
                                {interacoes}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-2.5">
                          {u.isEmCurso ? (
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5 whitespace-nowrap dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400">
                              Em Atendimento
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-0.5 whitespace-nowrap dark:bg-orange-950/30 dark:border-orange-800 dark:text-orange-400">
                              Aguardando Atendimento
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {pagedCasos.length === 0 && (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-16 text-center text-muted-foreground text-sm"
                      >
                        Nenhum caso encontrado para os filtros
                        aplicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ──────────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30 flex-shrink-0">
                <span className="text-xs text-muted-foreground">
                  {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(
                    page * PAGE_SIZE,
                    filteredCasos.length,
                  )}{" "}
                  de {filteredCasos.length} casos
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setPage((p) => Math.max(1, p - 1))
                    }
                    disabled={page === 1}
                    className="p-1.5 rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {pageNumbers.map((p, idx) => (
                    <Fragment key={p}>
                      {idx > 0 &&
                        pageNumbers[idx - 1] !== p - 1 && (
                          <span className="px-1 text-muted-foreground text-xs">
                            …
                          </span>
                        )}
                      <button
                        onClick={() => setPage(p)}
                        className={`min-w-[28px] h-7 px-2 rounded text-xs font-medium transition-colors ${
                          p === page
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {p}
                      </button>
                    </Fragment>
                  ))}

                  <button
                    onClick={() =>
                      setPage((p) =>
                        Math.min(totalPages, p + 1),
                      )
                    }
                    disabled={page === totalPages}
                    className="p-1.5 rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* end main content */}

      {/* ── Case Preview Modal ──────────────────────────────────────────── */}
      {previewUsuario && (
        <CasePreviewModal
          usuario={previewUsuario}
          onClose={closePreview}
          fullPage={isDeepLink}
        />
      )}
    </div>
  );
}