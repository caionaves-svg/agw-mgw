import { useState } from "react";
import { ClipboardList, Mail, MessageSquare, Phone, UserRound, X } from "lucide-react";
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
  versao: string;
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
    versao: "v1",
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
    versao: "v2",
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
    versao: "v3",
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
    versao: "v4",
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
    versao: "v5",
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
    versao: "v6",
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
    versao: "v7",
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
    versao: "v8",
    descricao: "Ação [SendSatisfactionSurvey] executada no caso por [marina_isabelly].",
    usuario: "marina_isabelly",
    canal: "E-mail",
    acao: "SendSatisfactionSurvey",
    questionario: "Pesquisa de satisfação",
    comentario: "Exemplo ilustrativo — pra mostrar a ação \"Abrir questionário\".",
  },
];

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function mesAnoFromDate(dateStr: string): string {
  const [, mm, yyyy] = dateStr.split("/");
  return `${MESES[Number(mm) - 1]} ${yyyy}`;
}

// Cores oficiais por canal — mesmas usadas em ChannelAvatar.tsx / GerenciamentoCanais.tsx
const CANAL_CONFIG: Record<string, { Icon: React.ElementType; color: string }> = {
  whatsapp: { Icon: MessageSquare, color: "#25D366" },
  webchat: { Icon: MessageSquare, color: "#6B7280" },
  messenger: { Icon: MessageSquare, color: "#0084FF" },
  instagram: { Icon: MessageSquare, color: "#E4405F" },
  telegram: { Icon: MessageSquare, color: "#0088CC" },
  email: { Icon: Mail, color: "#34A853" },
  voz: { Icon: Phone, color: "#3B82F6" },
  rcs: { Icon: MessageSquare, color: "#FFAB00" },
};

function canalConfig(canal: string) {
  const key = canal.toLowerCase().replace(/[^a-z]/g, "");
  return CANAL_CONFIG[key] ?? { Icon: MessageSquare, color: "#6B7280" };
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
  onClose: () => void;
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

  // Agrupar por mês — mesmo padrão do Histórico do Cliente
  const grouped = filtered.reduce<Record<string, HistoricoEntry[]>>(
    (acc, entry) => {
      const mesAno = mesAnoFromDate(entry.date);
      if (!acc[mesAno]) acc[mesAno] = [];
      acc[mesAno].push(entry);
      return acc;
    },
    {},
  );

  return (
    <div className="bg-background rounded-xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between flex-shrink-0">
        <div className="min-w-0">
          <span className="text-base font-medium text-foreground block leading-tight">
            Histórico de Casos
          </span>
          <span className="text-xs text-muted-foreground">
            caso {casoId} · {MOCK.length} registros
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0 flex-shrink-0">
          <X className="w-4 h-4" />
        </Button>
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
        {Object.entries(grouped).map(([mesAno, entries]) => (
          <div key={mesAno}>
            <DateDivider label={mesAno} />

            {/* Entries for this month */}
            <div className="relative">
              {/* Linha vertical — do centro do 1º ao centro do último dot */}
              <div className="absolute left-[9px] top-2.5 bottom-2.5 w-px bg-border" />

              <div className="flex flex-col gap-3">
                {entries.map((entry) => {
                  const { Icon: ChanIcon, color } = canalConfig(entry.canal);
                  const hasQuestionario =
                    entry.questionario &&
                    entry.questionario !== "—" &&
                    entry.questionario !== "Não aplicado";

                  return (
                    <div key={entry.id} className="relative flex items-start gap-3">
                      {/* Dot — cor e ícone do canal de origem */}
                      <div
                        className="relative z-10 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center shadow-sm mt-0.5"
                        style={{ backgroundColor: color }}
                        title={entry.canal}
                      >
                        <ChanIcon className="w-2.5 h-2.5 text-white" />
                      </div>

                      {/* Card de conteúdo */}
                      <div className="flex-1 min-w-0 rounded-lg border border-border bg-card p-3">
                        {/* Linha 1: canal + situação + versão + ação */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                          <span className="text-[11px] text-muted-foreground font-light">
                            {entry.canal}
                          </span>
                          <Badge variant="default" size="sm" shape="rounded">
                            {entry.situacao}
                          </Badge>
                          <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono flex-shrink-0">
                            {entry.versao}
                          </span>
                          {hasQuestionario && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-md flex-shrink-0"
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
