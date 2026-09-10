import { useState } from "react";
import { Clock, ClipboardList, UserRound, X } from "lucide-react";
import { SearchInput } from "../ui/search-input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { DateDivider } from "./DateDivider";
import { HistoryFilterBar, type FilterFieldConfig } from "./HistoryFilterBar";

interface HistoricoEntry {
  id: string;
  date: string;
  time: string;
  situacao: string;
  descricao: string;
  usuario: string;
  canal: string;
  acao: string;
  questionario: string;
  comentario?: string;
}

const MOCK: HistoricoEntry[] = [
  {
    id: "1",
    date: "08/09/2026",
    time: "12:27:16",
    situacao: "Criação",
    descricao: "Caso foi criado por [muriel.machado].",
    usuario: "muriel.machado",
    canal: "E-mail",
    acao: "—",
    questionario: "—",
  },
  {
    id: "2",
    date: "08/09/2026",
    time: "12:27:17",
    situacao: "Designação de Lista de Casos",
    descricao: "Caso classificado na fila [SAC E-mail].",
    usuario: "muriel.machado",
    canal: "E-mail",
    acao: "—",
    questionario: "—",
  },
  {
    id: "3",
    date: "09/09/2026",
    time: "09:34:31",
    situacao: "Designação de Agente",
    descricao: "Agente [Marina Isabelly Francisca Nascimento] atribuído ao caso.",
    usuario: "default-user",
    canal: "E-mail",
    acao: "—",
    questionario: "—",
  },
  {
    id: "4",
    date: "09/09/2026",
    time: "09:34:31",
    situacao: "Atualização no Progresso",
    descricao: "Progresso do caso alterado para [Iniciado] por [default-user].",
    usuario: "default-user",
    canal: "E-mail",
    acao: "—",
    questionario: "—",
  },
  {
    id: "5",
    date: "09/09/2026",
    time: "09:34:31",
    situacao: "Encaminhamento",
    descricao:
      "Caso foi entregue para [Marina Isabelly Francisca Nascimento] pela regra [Regra de Assessoria de Investimentos].",
    usuario: "default-user",
    canal: "E-mail",
    acao: "—",
    questionario: "—",
  },
  {
    id: "6",
    date: "09/09/2026",
    time: "09:34:32",
    situacao: "Ação Executada",
    descricao:
      "Ação [StartCaseHandling] executada no caso por [marina_isabelly]. Status atual é [Aguardando Atendimento - Space].",
    usuario: "marina_isabelly",
    canal: "E-mail",
    acao: "StartCaseHandling",
    questionario: "—",
  },
  {
    id: "7",
    date: "09/09/2026",
    time: "09:34:32",
    situacao: "Atualização no Status",
    descricao: "Status do caso alterado para [Em Atendimento] por [marina_isabelly].",
    usuario: "marina_isabelly",
    canal: "E-mail",
    acao: "—",
    questionario: "—",
  },
  {
    id: "8",
    date: "09/09/2026",
    time: "09:40:12",
    situacao: "Ação Executada",
    descricao: "Ação [SendSatisfactionSurvey] executada no caso por [marina_isabelly].",
    usuario: "marina_isabelly",
    canal: "E-mail",
    acao: "SendSatisfactionSurvey",
    questionario: "Pesquisa de satisfação",
    comentario: "Exemplo ilustrativo — pra mostrar a ação \"Abrir questionário\".",
  },
];

// Timestamp para ordenação — combina data (dd/mm/aaaa) e hora (hh:mm:ss)
function parseDateTime(dateStr: string, timeStr: string): number {
  const [dd, mm, yyyy] = dateStr.split("/").map(Number);
  const [hh, min, ss] = timeStr.split(":").map(Number);
  return new Date(yyyy, mm - 1, dd, hh, min, ss).getTime();
}

// Resumo do estado atual do caso — não finge ter um histórico de versão por
// registro (o backend só guarda a versão vigente). N é a posição cronológica
// do último evento e a data/hora vêm do registro mais recente de todo o caso,
// independente de busca/filtro aplicado na lista abaixo.
const ULTIMA_MODIFICACAO = MOCK.reduce((latest, entry) =>
  parseDateTime(entry.date, entry.time) > parseDateTime(latest.date, latest.time)
    ? entry
    : latest,
);

// Rótulo do divider contabilizando o dia vigente — "Hoje", "Ontem" ou a data cheia
function diaLabelFromDate(dateStr: string): string {
  const [dd, mm, yyyy] = dateStr.split("/").map(Number);
  const dataEntrada = new Date(yyyy, mm - 1, dd);
  const hoje = new Date();
  const hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const diffDias = Math.round(
    (hojeSemHora.getTime() - dataEntrada.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDias === 0) return "Hoje";
  if (diffDias === 1) return "Ontem";
  return dateStr;
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <span className="font-light text-muted-foreground text-[10px] block mb-0.5 leading-none uppercase tracking-wide">
        {label}
      </span>
      <span className="text-xs text-foreground leading-snug block truncate">{value}</span>
    </div>
  );
}

interface Props {
  casoId: string;
  onClose?: () => void;
}

const uniqueValues = (values: string[]) =>
  Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));

export function HistoricoCasosSection({ casoId, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  const filterFields: FilterFieldConfig[] = [
    {
      id: "usuario",
      label: "Usuário",
      options: uniqueValues(MOCK.map((e) => e.usuario)).map((v) => ({
        value: v,
        label: v,
      })),
    },
    {
      id: "comentario",
      label: "Comentário",
      mode: "single",
      options: [
        { value: "sim", label: "Sim" },
        { value: "nao", label: "Não" },
      ],
    },
    {
      id: "canal",
      label: "Canal",
      options: uniqueValues(MOCK.map((e) => e.canal)).map((v) => ({
        value: v,
        label: v,
      })),
    },
    {
      id: "acao",
      label: "Ação",
      options: uniqueValues(MOCK.map((e) => e.acao)).map((v) => ({
        value: v,
        label: v,
      })),
    },
  ];

  const filtered = MOCK.filter((e) => {
    const matchesQuery =
      e.descricao.toLowerCase().includes(query.toLowerCase()) ||
      e.usuario.toLowerCase().includes(query.toLowerCase()) ||
      e.situacao.toLowerCase().includes(query.toLowerCase());
    if (!matchesQuery) return false;

    const usuarioSel = filters.usuario ?? [];
    if (usuarioSel.length && !usuarioSel.includes(e.usuario)) return false;

    const canalSel = filters.canal ?? [];
    if (canalSel.length && !canalSel.includes(e.canal)) return false;

    const acaoSel = filters.acao ?? [];
    if (acaoSel.length && !acaoSel.includes(e.acao)) return false;

    const comentarioSel = filters.comentario ?? [];
    if (comentarioSel.length) {
      const querTemComentario = comentarioSel[0] === "sim";
      if (Boolean(e.comentario) !== querTemComentario) return false;
    }

    return true;
  });

  // Ordena do mais recente para o mais antigo antes de agrupar
  const ordenados = [...filtered].sort(
    (a, b) => parseDateTime(b.date, b.time) - parseDateTime(a.date, a.time),
  );

  // Agrupar por dia — divider contabiliza o dia vigente (Hoje/Ontem)
  const grouped = ordenados.reduce<Record<string, HistoricoEntry[]>>(
    (acc, entry) => {
      const dia = diaLabelFromDate(entry.date);
      if (!acc[dia]) acc[dia] = [];
      acc[dia].push(entry);
      return acc;
    },
    {},
  );

  return (
    <div className="bg-background rounded-xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between flex-shrink-0">
        <div className="min-w-0">
          <span className="text-base font-medium text-foreground block leading-tight mb-2">
            Histórico de Casos
          </span>
          <Badge variant="default" shape="full" size="md" className="gap-1.5 font-normal">
            <Clock className="w-3 h-3" />
            Modificação v{MOCK.length - 1} · atualizado em {ULTIMA_MODIFICACAO.date}{" "}
            {ULTIMA_MODIFICACAO.time}
          </Badge>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0 flex-shrink-0">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="px-4 pb-3 flex-shrink-0">
        <SearchInput
          placeholder="Buscar no histórico..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          showIcon
        />
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
        {Object.entries(grouped).map(([dia, entries]) => (
          <div key={dia}>
            <DateDivider label={dia} />

            {/* Entries for this day */}
            <div>
              <div className="flex flex-col gap-3">
                {entries.map((entry) => {
                  const hasQuestionario =
                    entry.questionario &&
                    entry.questionario !== "—" &&
                    entry.questionario !== "Não aplicado";

                  return (
                    <div
                      key={entry.id}
                      className="rounded-lg border border-border bg-card p-3"
                    >
                      {/* Linha 1: canal + situação + ação */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                        <span className="text-[11px] text-muted-foreground font-light">
                          {entry.canal}
                        </span>
                        <Badge variant="default" size="sm" shape="rounded">
                          {entry.situacao}
                        </Badge>
                        {hasQuestionario && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="ml-auto h-6 w-6 rounded-md flex-shrink-0"
                            title={`Abrir questionário: ${entry.questionario}`}
                          >
                            <ClipboardList className="w-3 h-3" />
                          </Button>
                        )}
                      </div>

                      {/* Descrição */}
                      <p className="text-sm font-medium text-foreground leading-snug mb-2.5">
                        {entry.descricao}
                      </p>

                      {/* Meta grid */}
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-2.5">
                        <MetaField label="Ação" value={entry.acao} />
                        {entry.questionario === "Não aplicado" && (
                          <MetaField label="Questionário" value={entry.questionario} />
                        )}
                      </div>

                      {/* Usuário + hora */}
                      <div className="flex items-center gap-1.5">
                        <UserRound className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-foreground truncate">
                          {entry.usuario}
                        </span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          · {entry.date} {entry.time}
                        </span>
                      </div>

                      {/* Comentário */}
                      {entry.comentario && (
                        <div className="mt-2 pl-2 border-l-2 border-border">
                          <span className="font-light text-muted-foreground text-xs block mb-0.5">
                            Comentário
                          </span>
                          <p className="text-xs text-foreground leading-snug">
                            {entry.comentario}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Nenhum registro encontrado
          </div>
        )}
      </div>
    </div>
  );
}
