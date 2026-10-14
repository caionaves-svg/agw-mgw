import { useState, useMemo, useEffect, useRef, Fragment } from "react";
import { useSearchParams } from "react-router";
import type { SLA, Tag } from "../contexts/DataContext";
import { useData, Usuario } from "../contexts/DataContext";
import { CasePreviewModal } from "../components/CasePreviewModal";
import { openCaseInNewTab } from "../components/CaseIdBadge";
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
  Search,
  SlidersHorizontal,
  PlusCircle,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

type TipoCasoVariant =
  "orange" | "green" | "yellow" | "purple" | "blue" | "info" | "gray";

// Chips de "Tipo de Caso" no padrão de produção: texto colorido sobre fundo claro
const TIPO_CASO_CLASSES: Record<TipoCasoVariant, string> = {
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300",
  green: "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-300",
  yellow: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  purple: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300",
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
  info: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
  gray: "bg-muted text-muted-foreground",
};

function getTipoCaso(channel: string): {
  label: string;
  variant: TipoCasoVariant;
} {
  switch (channel) {
    case "whatsapp":
      return { label: "SAC WhatsApp", variant: "orange" };
    case "email":
      return { label: "SAC E-mail", variant: "yellow" };
    case "instagram":
      return { label: "SAC Instagram", variant: "purple" };
    case "facebook":
      return { label: "SAC Facebook", variant: "blue" };
    case "telefone":
      return { label: "SAC Voz", variant: "green" };
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
      {/* ── Left Sidebar (padrão de produção) ───────────────────────────── */}
      <div
        className={`flex-shrink-0 bg-background flex flex-col transition-all duration-200 overflow-hidden ${
          sidebarOpen ? "w-44 border-r border-border" : "w-0"
        }`}
      >
        <nav className="flex-1 overflow-y-auto pt-3 pb-2">
          {NAV_SECTIONS.map((section) => {
            const collapsed = collapsedSections.has(section.id);
            return (
              <div key={section.id} className="mb-2">
                {/* Section header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <span>{section.label}</span>
                  {collapsed ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronUp className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Items */}
                {!collapsed && (
                  <div className="flex flex-col">
                    {section.items.map((item) => {
                      const isActive = activeNavItem === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveNavItem(item.id)}
                          className={`text-left text-sm pl-7 pr-3 py-2 leading-snug transition-colors relative ${
                            isActive
                              ? "text-primary before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-primary"
                              : "text-muted-foreground hover:text-foreground"
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
        <div className="flex items-start justify-between px-8 pt-4 pb-4 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-medium text-foreground leading-tight">
                Gestão de Casos
              </h1>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button aria-label="Ajuda">
                      <HelpCircle className="w-[18px] h-[18px] fill-[#1E88E5] text-white" />
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
            <p className="text-sm text-muted-foreground">
              Gerencie e acompanhe todos os casos de atendimento
            </p>
          </div>

          {/* Workspace selector */}
          <button className="flex items-center gap-6 text-xs text-foreground border border-border rounded px-2.5 h-9 hover:bg-muted transition-colors">
            Space Bank SAC
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* ── Body: card único (toolbar + tabela), como em produção ──────── */}
        <div className="flex-1 overflow-hidden flex flex-col px-8 pb-4 min-h-0">
          <div className="flex-1 flex flex-col min-h-0 bg-background border border-border rounded-lg overflow-hidden">
            {/* ── Toolbar ─────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 px-3 pt-3 pb-3 flex-shrink-0">
              {/* Linha 1: contagem + busca */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  Casos
                  <span className="w-px h-4 bg-border" />
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-normal">
                    {filteredCasos.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center h-8 w-56 border border-border rounded px-2 focus-within:border-primary transition-colors">
                    <input
                      placeholder="Busque por Casos..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(1);
                      }}
                      className="flex-1 min-w-0 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    <Search className="w-4 h-4 text-foreground/70 shrink-0" />
                  </div>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="p-1.5 rounded hover:bg-muted text-foreground/70 hover:text-foreground transition-colors">
                          <Columns3 className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs">Configurar colunas</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Linha 2: filtros + ações */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Saved filters preset */}
                  <button className="flex items-center gap-1.5 h-6 text-[11px] border border-primary text-foreground rounded-full px-2.5 hover:bg-primary/5 transition-colors">
                    <SlidersHorizontal className="w-3 h-3 text-primary" />
                    Meus Filtros
                    <ChevronDown className="w-3 h-3 text-primary" />
                  </button>

                  {/* Active filter chips */}
                  {chips.map((chip) => (
                    <div
                      key={chip.id}
                      className="flex items-center gap-1.5 h-6 text-[11px] border border-border rounded-full pl-2 pr-1 text-foreground"
                    >
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                      <span>{chip.label}</span>
                      <button
                        onClick={() =>
                          setChips((prev) =>
                            prev.filter((c) => c.id !== chip.id),
                          )
                        }
                        aria-label={`Remover ${chip.label}`}
                        className="hover:opacity-80"
                      >
                        <XCircle className="w-3.5 h-3.5 fill-muted-foreground text-background" />
                      </button>
                    </div>
                  ))}

                  {/* Add filter */}
                  <button className="flex items-center gap-1.5 h-6 text-[11px] font-medium bg-[#1E88E5] text-white rounded-full px-2.5 hover:bg-[#1E88E5]/90 transition-colors">
                    <PlusCircle className="w-3.5 h-3.5 fill-white text-[#1E88E5]" />
                    Adicionar Filtro
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <button className="text-xs text-primary hover:underline whitespace-nowrap">
                    Salvar Filtros
                  </button>
                  <button className="text-xs text-foreground hover:underline whitespace-nowrap">
                    Limpar Todos
                  </button>
                  <button className="flex items-center gap-1.5 h-8 px-4 rounded bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Aplicar
                  </button>
                </div>
              </div>
            </div>

            {/* ── Table ───────────────────────────────────────────────── */}
            <div className="overflow-auto flex-1 min-h-0">
              <table className="w-full border-collapse min-w-[1000px] text-[13px]">
                {/* Head */}
                <thead className="sticky top-0 z-10 bg-background">
                  <tr className="border-b border-border">
                    <th className="w-10 px-3 py-2.5 text-left">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el)
                            el.indeterminate =
                              someSelected && !allSelected;
                        }}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded-sm border-border accent-primary"
                      />
                    </th>

                    {(
                      [
                        { key: "id", label: "ID do Caso", sortable: true },
                        { key: "tipo", label: "Tipo de Caso", sortable: true },
                        { key: "pessoa", label: "Pessoa", sortable: true },
                        { key: "sla", label: "Indicador de SLA", sortable: true },
                        { key: null, label: "Lista de Casos", sortable: false },
                        { key: null, label: "Atribuído à", sortable: false },
                        { key: "atualizado", label: "Data de Atualização", sortable: true },
                        { key: null, label: "Interações", sortable: false },
                        { key: "status", label: "Status", sortable: true },
                      ] as {
                        key: SortKey | null;
                        label: string;
                        sortable: boolean;
                      }[]
                    ).map(({ key, label, sortable }) => (
                      <th
                        key={label}
                        className={`group/th px-3 py-2.5 text-left font-medium text-foreground whitespace-nowrap ${sortable ? "cursor-pointer select-none" : ""}`}
                        onClick={() => sortable && key && handleSort(key)}
                      >
                        <span className="flex items-center">
                          {label}
                          {/* Ordenação discreta: só aparece na coluna ativa ou no hover */}
                          {sortable && key && (
                            <span
                              className={
                                sortKey === key
                                  ? ""
                                  : "opacity-0 group-hover/th:opacity-100 transition-opacity"
                              }
                            >
                              <SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
                            </span>
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Body — linhas zebradas, como em produção */}
                <tbody>
                  {pagedCasos.map((u, rowIndex) => {
                    const tipo = getTipoCaso(u.channel);
                    const sla = getSlaDisplay(u.sla, u.id);
                    const lista = getListaCasos(u.channel, u.tags);
                    const dataStr = formatDataAtualizacao(u.id);
                    const interacoes = interacoesMap[u.id] ?? 0;
                    const isSel = selectedIds.has(u.id);

                    return (
                      <tr
                        key={u.id}
                        className={`group border-b border-border/60 transition-colors cursor-pointer ${
                          isSel
                            ? "bg-primary/10"
                            : rowIndex % 2 === 0
                              ? "bg-muted/70 hover:bg-accent"
                              : "bg-background hover:bg-accent"
                        }`}
                        onClick={() => toggleRow(u.id)}
                      >
                        {/* Checkbox */}
                        <td
                          className="px-3 py-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={() => toggleRow(u.id)}
                            className="w-4 h-4 rounded-sm border-border accent-primary"
                          />
                        </td>

                        {/* ID do Caso — sublinhado, com as ações de visualizar e abrir em nova aba */}
                        <td className="px-3 py-2">
                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => openCaseInNewTab(u.id)}
                              title="Abrir detalhamento do caso em nova aba"
                              className="text-foreground underline underline-offset-2 hover:text-primary tabular-nums"
                            >
                              {u.id}
                            </button>
                            <button
                              onClick={() => openPreview(u)}
                              title="Visualizar atendimento"
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openCaseInNewTab(u.id)}
                              title="Abrir em nova aba"
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Tipo de Caso */}
                        <td className="px-3 py-2">
                          <span
                            className={`inline-block rounded-sm px-1.5 py-0.5 whitespace-nowrap ${TIPO_CASO_CLASSES[tipo.variant]}`}
                          >
                            {tipo.label}
                          </span>
                        </td>

                        {/* Pessoa */}
                        <td className="px-3 py-2">
                          <span className="inline-block rounded-sm px-1.5 py-0.5 bg-muted text-muted-foreground max-w-[200px] truncate align-middle">
                            {u.nome}
                          </span>
                        </td>

                        {/* Indicador de SLA */}
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded px-1 py-0.5 text-[11px] tabular-nums ${
                              sla.type === "ok"
                                ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                                : sla.type === "breach"
                                  ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                                  : sla.type === "risk"
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                    : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {sla.type === "ok" && (
                              <CheckCircle2 className="w-3.5 h-3.5 fill-green-600 text-white dark:text-green-950" />
                            )}
                            {sla.type === "breach" && (
                              <XCircle className="w-3.5 h-3.5 fill-red-600 text-white dark:text-red-950" />
                            )}
                            {sla.type === "risk" && (
                              <AlertTriangle className="w-3.5 h-3.5 fill-amber-500 text-white dark:text-amber-950" />
                            )}
                            {sla.text}
                          </span>
                        </td>

                        {/* Lista de Casos */}
                        <td className="px-3 py-2 text-foreground/90">
                          {lista}
                        </td>

                        {/* Atribuído à */}
                        <td className="px-3 py-2">
                          {u.atendente && (
                            <span className="inline-block rounded-sm px-1.5 py-0.5 bg-muted text-muted-foreground max-w-[170px] truncate align-middle">
                              {u.atendente.nome}
                            </span>
                          )}
                        </td>

                        {/* Data de Atualização */}
                        <td className="px-3 py-2 text-foreground/90 whitespace-nowrap">
                          {dataStr}
                        </td>

                        {/* Interações */}
                        <td className="px-3 py-2">
                          {interacoes > 0 ? (
                            <span className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 bg-muted text-[11px] text-muted-foreground">
                              <ChannelIcon channel={u.channel} className="w-3 h-3 text-foreground/80" />
                              {interacoes}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-2">
                          {u.isEmCurso ? (
                            <span className="inline-block rounded-sm px-1.5 py-0.5 text-[11px] whitespace-nowrap bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
                              Em Atendimento
                            </span>
                          ) : (
                            <span className="inline-block rounded-sm px-1.5 py-0.5 text-[11px] whitespace-nowrap bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300">
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
                        Nenhum caso encontrado para os filtros aplicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ──────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border flex-shrink-0">
                <span className="text-xs text-muted-foreground">
                  {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, filteredCasos.length)} de{" "}
                  {filteredCasos.length}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {pageNumbers.map((p, idx) => (
                    <Fragment key={p}>
                      {idx > 0 && pageNumbers[idx - 1] !== p - 1 && (
                        <span className="px-1 text-muted-foreground text-xs">…</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={`min-w-[28px] h-7 px-2 rounded text-xs transition-colors ${
                          p === page
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {p}
                      </button>
                    </Fragment>
                  ))}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
