import { useState } from "react";
import { X, Merge, UserRound, Play } from "lucide-react";
import { SearchInput } from "../ui/search-input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { DateDivider } from "./DateDivider";
import { HistoryFilterBar, type FilterFieldConfig } from "./HistoryFilterBar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface Caso {
  id: string;
  numero: string;
  status: "em-atendimento" | "finalizado" | "aguardando";
  isAtual?: boolean;
  fila: string;
  assunto: string;
  criadoEm: string;
  fechadoEm: string | null;
  agente: string | null;
  atualizadoEm: string;
  mesAno: string;
}

const MOCK: Caso[] = [
  {
    id: "1",
    numero: "22910",
    status: "em-atendimento",
    isAtual: true,
    fila: "SAC WhatsApp",
    assunto: "Atendimento WebChat",
    criadoEm: "03/09/2026 11:20:00",
    fechadoEm: null,
    agente: "Bruno Martins",
    atualizadoEm: "04/09/2026 09:29:00",
    mesAno: "Setembro 2026",
  },
  {
    id: "2",
    numero: "22898",
    status: "finalizado",
    fila: "SAC WhatsApp",
    assunto: "Atendimento WebChat",
    criadoEm: "02/09/2026 11:02:00",
    fechadoEm: "03/09/2026 11:20:00",
    agente: null,
    atualizadoEm: "03/09/2026 11:20:00",
    mesAno: "Setembro 2026",
  },
  {
    id: "3",
    numero: "22897",
    status: "finalizado",
    fila: "SAC WhatsApp",
    assunto: "Caso Alterado por Fluxo",
    criadoEm: "02/09/2026 10:52:00",
    fechadoEm: "02/09/2026 11:02:00",
    agente: null,
    atualizadoEm: "02/09/2026 11:02:00",
    mesAno: "Setembro 2026",
  },
  {
    id: "4",
    numero: "21540",
    status: "finalizado",
    fila: "SAC Voz",
    assunto: "Reclamação sobre cobrança indevida",
    criadoEm: "28/08/2026 09:15:00",
    fechadoEm: "28/08/2026 09:48:00",
    agente: "cvortex.weverton",
    atualizadoEm: "28/08/2026 09:48:00",
    mesAno: "Agosto 2026",
  },
  {
    id: "5",
    numero: "19832",
    status: "finalizado",
    fila: "Suporte N1",
    assunto: "Dificuldade de acesso ao portal",
    criadoEm: "15/08/2026 14:30:00",
    fechadoEm: "15/08/2026 15:02:00",
    agente: "maria.silva",
    atualizadoEm: "15/08/2026 15:02:00",
    mesAno: "Agosto 2026",
  },
];

const STATUS_CONFIG = {
  "em-atendimento": {
    label: "Em atendimento",
    badgeVariant: "default" as const,
  },
  finalizado: {
    label: "Finalizado",
    badgeVariant: "success" as const,
  },
  aguardando: {
    label: "Aguardando",
    badgeVariant: "warning" as const,
  },
};

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <span className="font-light text-muted-foreground text-[10px] block mb-0.5 leading-none uppercase tracking-wide">
        {label}
      </span>
      <span className="text-xs text-foreground leading-snug block">
        {value}
      </span>
    </div>
  );
}

interface Props {
  onClose: () => void;
}

const uniqueValues = (values: string[]) =>
  Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));

export function HistoricoClienteSection({ onClose }: Props) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(),
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedNums = MOCK.filter((c) =>
    selectedIds.has(c.id),
  ).map((c) => c.numero);
  const [primaryNum, ...restNums] = selectedNums;

  const filterFields: FilterFieldConfig[] = [
    {
      id: "usuario",
      label: "Usuário",
      options: uniqueValues(
        MOCK.map((c) => c.agente).filter((v): v is string => Boolean(v)),
      ).map((v) => ({ value: v, label: v })),
    },
    {
      id: "tipoCaso",
      label: "Tipo do Caso",
      options: uniqueValues(MOCK.map((c) => c.fila)).map((v) => ({
        value: v,
        label: v,
      })),
    },
    {
      id: "assunto",
      label: "Assunto",
      options: uniqueValues(MOCK.map((c) => c.assunto)).map((v) => ({
        value: v,
        label: v,
      })),
    },
    {
      id: "status",
      label: "Status",
      options: Object.entries(STATUS_CONFIG).map(([value, cfg]) => ({
        value,
        label: cfg.label,
      })),
    },
  ];

  const filtered = MOCK.filter((c) => {
    const matchesQuery =
      c.numero.includes(query) ||
      c.assunto.toLowerCase().includes(query.toLowerCase()) ||
      c.fila.toLowerCase().includes(query.toLowerCase()) ||
      (c.agente?.toLowerCase().includes(query.toLowerCase()) ?? false);
    if (!matchesQuery) return false;

    const usuarioSel = filters.usuario ?? [];
    if (usuarioSel.length && !usuarioSel.includes(c.agente ?? "")) return false;

    const tipoSel = filters.tipoCaso ?? [];
    if (tipoSel.length && !tipoSel.includes(c.fila)) return false;

    const assuntoSel = filters.assunto ?? [];
    if (assuntoSel.length && !assuntoSel.includes(c.assunto)) return false;

    const statusSel = filters.status ?? [];
    if (statusSel.length && !statusSel.includes(c.status)) return false;

    return true;
  });

  const grouped = filtered.reduce<Record<string, Caso[]>>(
    (acc, caso) => {
      if (!acc[caso.mesAno]) acc[caso.mesAno] = [];
      acc[caso.mesAno].push(caso);
      return acc;
    },
    {},
  );

  const canUnify = selectedIds.size >= 2;

  return (
    <div className="bg-background rounded-xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between flex-shrink-0">
        <div className="min-w-0">
          <span className="text-base font-medium text-foreground block leading-tight">
            Histórico do Cliente
          </span>
          <span className="text-xs text-muted-foreground">
            Bruno Martins · {MOCK.length} casos
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0 flex-shrink-0 mt-0.5"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Search + Unificar na mesma linha */}
      <div className="px-4 pb-3 flex-shrink-0 flex items-center gap-2">
        <div className="flex-1">
          <SearchInput
            placeholder="Buscar por caso, assunto..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            showIcon
          />
        </div>
        <Button
          variant={canUnify ? "brand" : "outline"}
          size="sm"
          className="gap-1.5 text-xs h-8 flex-shrink-0"
          disabled={!canUnify}
          title={
            canUnify
              ? `Unificar ${selectedIds.size} casos`
              : "Selecione 2 ou mais casos"
          }
          onClick={() => canUnify && setConfirmOpen(true)}
        >
          <Merge className="w-3.5 h-3.5" />
          {canUnify
            ? `Unificar (${selectedIds.size})`
            : "Unificar"}
        </Button>
      </div>

      {/* Filtros */}
      <div className="px-4 pb-3 flex-shrink-0">
        <HistoryFilterBar
          fields={filterFields}
          values={filters}
          onChange={(fieldId, vals) =>
            setFilters((prev) => ({ ...prev, [fieldId]: vals }))
          }
        />
      </div>

      {/* Timeline feed */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
        {Object.entries(grouped).map(([mesAno, casos]) => (
          <div key={mesAno}>
            <DateDivider label={mesAno} />

            <div className="relative">
              {/* Linha vertical — começa e termina no centro do primeiro/último dot */}
              <div className="absolute left-[9px] top-2.5 bottom-2.5 w-px bg-border" />

              <div className="flex flex-col gap-3">
                {casos.map((caso) => {
                  const st = STATUS_CONFIG[caso.status];
                  const isSelected = selectedIds.has(caso.id);

                  return (
                    <div
                      key={caso.id}
                      className="relative flex items-start gap-3"
                    >
                      {/* Dot — ancorado na primeira linha do card */}
                      <div
                        className={`relative z-10 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center shadow-sm mt-0.5 ${
                          caso.status === "em-atendimento"
                            ? "bg-primary"
                            : caso.status === "finalizado"
                              ? "bg-success"
                              : "bg-warning"
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full bg-white/80" />
                      </div>

                      {/* Card de conteúdo */}
                      <div
                        className={`flex-1 rounded-lg border p-3 transition-colors cursor-pointer ${
                          isSelected
                            ? "border-primary/40 bg-primary/5"
                            : "border-border bg-card hover:bg-accent/40"
                        }`}
                        onClick={() => toggleSelect(caso.id)}
                      >
                        {/* Linha 1: fila + status + número + ação */}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[11px] text-muted-foreground font-light">
                            {caso.fila}
                          </span>
                          <Badge
                            variant={st.badgeVariant}
                            size="sm"
                            shape="rounded"
                          >
                            {st.label}
                          </Badge>
                          <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono flex-shrink-0">
                            {caso.numero}
                          </span>
                          {caso.status !== "em-atendimento" && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-md flex-shrink-0"
                              title="Iniciar"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Play className="w-3 h-3" />
                            </Button>
                          )}
                        </div>

                        {/* Assunto */}
                        <p className="text-sm font-medium text-foreground leading-snug mb-2.5">
                          {caso.assunto}
                        </p>

                        {/* Datas — Criado / Fechado */}
                        <div className="grid grid-cols-2 gap-x-2 mb-2.5">
                          <Field
                            label="Criado"
                            value={caso.criadoEm}
                          />
                          <Field
                            label="Fechado"
                            value={caso.fechadoEm ?? "—"}
                          />
                        </div>

                        {/* Agente + Atualizado + Ação */}
                        <div className="flex items-center gap-1.5">
                          <UserRound className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs text-foreground truncate">
                            {caso.agente ?? "—"}
                          </span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            · Atualizado {caso.atualizadoEm}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Nenhum caso encontrado
          </div>
        )}
      </div>

      {/* Confirmação de unificação */}
      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
      >
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Merge className="w-4 h-4 text-primary" />
              Unificar atendimentos
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed">
              Você está unificando o atendimento{" "}
              <span className="font-semibold text-foreground font-mono">
                {primaryNum}
              </span>{" "}
              no{restNums.length > 1 ? "s" : ""} atendimento
              {restNums.length > 1 ? "s" : ""}{" "}
              <span className="font-semibold text-foreground font-mono">
                {restNums.join(", ")}
              </span>
              . Esta ação é permanente e não pode ser desfeita.
              Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-8">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="text-xs h-8 bg-primary hover:bg-primary/90"
              onClick={() => {
                setSelectedIds(new Set());
                setConfirmOpen(false);
              }}
            >
              Confirmar unificação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
