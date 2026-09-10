import { X, CheckCircle2, MessageSquare } from "lucide-react";
import { Button } from "../ui/button";

interface Resposta {
  pergunta: string;
  tipo: "escala" | "booleano" | "nps";
  valor: string;
  max?: number;
}

const ENQUETE = {
  titulo: "Avaliação do atendimento",
  notaGeral: 4.6,
  notaMax: 5,
  respondidaEm: "04/09/2026 09:31",
  canal: "Webchat",
  totalPerguntas: 3,
  respostas: [
    {
      pergunta: "Como você avalia o atendimento recebido?",
      tipo: "escala" as const,
      valor: "5",
      max: 5,
    },
    {
      pergunta: "Seu problema foi resolvido?",
      tipo: "booleano" as const,
      valor: "Sim",
    },
    {
      pergunta: "Qual a probabilidade de recomendar a empresa?",
      tipo: "nps" as const,
      valor: "9",
      max: 10,
    },
  ] satisfies Resposta[],
};

// ── Estrela com suporte a meia estrela ──────────────────────────────────────

function StarIcon({
  fill,
}: {
  fill: "full" | "half" | "empty";
}) {
  const id = `half-${Math.random().toString(36).slice(2)}`;
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      className="flex-shrink-0"
    >
      {fill === "half" && (
        <defs>
          <clipPath id={id}>
            <rect x="0" y="0" width="12" height="24" />
          </clipPath>
        </defs>
      )}
      {/* Fundo vazio */}
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-warning/40"
      />
      {/* Preenchimento */}
      {fill !== "empty" && (
        <polygon
          points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
          className="fill-warning text-warning"
          clipPath={fill === "half" ? `url(#${id})` : undefined}
        />
      )}
    </svg>
  );
}

function StarRow({ nota, max }: { nota: number; max: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const full = i < Math.floor(nota);
        const half =
          !full && i < Math.ceil(nota) && nota % 1 > 0;
        return (
          <StarIcon
            key={i}
            fill={full ? "full" : half ? "half" : "empty"}
          />
        );
      })}
    </div>
  );
}

// ── Arco SVG ─────────────────────────────────────────────────────────────────

function ScoreArc({
  nota,
  max,
  arcColor,
}: {
  nota: number;
  max: number;
  arcColor: string;
}) {
  const pct = nota / max;
  const size = 96;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const arcLen = circ * 0.667;
  const filled = arcLen * pct;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-[210deg]"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={`${arcLen} ${circ}`}
        strokeLinecap="round"
        className="text-border"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        className={`${arcColor} transition-all duration-700`}
      />
    </svg>
  );
}

function sentimentConfig(nota: number, max: number) {
  const pct = nota / max;
  if (pct >= 0.9)
    return {
      label: "Excelente",
      arc: "text-emerald-500",
      score: "text-emerald-600 dark:text-emerald-400",
    };
  if (pct >= 0.75)
    return {
      label: "Muito bom",
      arc: "text-blue-500",
      score: "text-blue-600 dark:text-blue-400",
    };
  if (pct >= 0.6)
    return {
      label: "Bom",
      arc: "text-warning",
      score: "text-yellow-600 dark:text-yellow-400",
    };
  if (pct >= 0.4)
    return {
      label: "Regular",
      arc: "text-orange-500",
      score: "text-orange-600 dark:text-orange-400",
    };
  return {
    label: "Ruim",
    arc: "text-red-500",
    score: "text-red-600 dark:text-red-400",
  };
}

// ── Cards de resposta ─────────────────────────────────────────────────────────

function RespostaEscala({
  pergunta,
  valor,
  max,
}: {
  pergunta: string;
  valor: string;
  max: number;
}) {
  const n = parseInt(valor);
  return (
    <div className="bg-background border border-border rounded-lg p-3 space-y-2">
      <span className="font-light text-muted-foreground text-xs block leading-none">
        {pergunta}
      </span>
      <div className="flex items-center justify-between gap-2">
        <StarRow nota={n} max={max} />
        <span className="font-medium text-xs text-foreground block tabular-nums leading-none">
          {valor}
          <span className="font-medium text-xs text-muted-foreground">
            {" "}
            de {max}
          </span>
        </span>
      </div>
    </div>
  );
}

function RespostaBooleano({
  pergunta,
  valor,
}: {
  pergunta: string;
  valor: string;
}) {
  const positivo = valor.toLowerCase() === "sim";
  return (
    <div className="bg-background border border-border rounded-lg p-3 space-y-2">
      <span className="font-light text-muted-foreground text-xs block leading-none">
        {pergunta}
      </span>
      <div className="flex items-center gap-1.5">
        <CheckCircle2
          className={`w-3.5 h-3.5 flex-shrink-0 ${positivo ? "text-emerald-500" : "text-red-400"}`}
        />
        <span className="text-xs font-medium text-foreground leading-none">
          {valor}
        </span>
      </div>
    </div>
  );
}

function RespostaNPS({
  pergunta,
  valor,
  max,
}: {
  pergunta: string;
  valor: string;
  max: number;
}) {
  const n = parseInt(valor);
  return (
    <div className="bg-background border border-border rounded-lg p-3 space-y-2">
      <span className="font-light text-muted-foreground text-xs block leading-none">
        {pergunta}
      </span>
      <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-colors ${i < n ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground font-light">
          0
        </span>
        <span className="text-sm font-medium text-foreground tabular-nums leading-none">
          {valor}
          <span className="text-xs font-light text-muted-foreground">
            {" "}
            de {max}
          </span>
        </span>
        <span className="text-[10px] text-muted-foreground font-light">
          {max}
        </span>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
}

export function EnquetesSection({ onClose }: Props) {
  const {
    notaGeral,
    notaMax,
    respondidaEm,
    canal,
    totalPerguntas,
    respostas,
    titulo,
  } = ENQUETE;

  return (
    <div className="bg-background rounded-xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between flex-shrink-0">
        <div className="min-w-0">
          <span className="text-base font-medium text-foreground block leading-tight">
            Enquete
          </span>
          <span className="text-xs text-muted-foreground font-light">
            {titulo}
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

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4 space-y-4">
        {/* Hero score */}
        {(() => {
          const cfg = sentimentConfig(notaGeral, notaMax);
          return (
            <div className="pb-4 border-b border-border">
              {/* Arco centralizado */}
              <div className="flex flex-col items-center gap-1 mb-3">
                <div className="relative w-24 h-24">
                  <ScoreArc
                    nota={notaGeral}
                    max={notaMax}
                    arcColor={cfg.arc}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className={`text-2xl font-semibold leading-none tabular-nums ${cfg.score}`}
                    >
                      {notaGeral.toFixed(1).replace(".", ",")}
                    </span>
                    <span className="text-[10px] font-light text-muted-foreground mt-0.5">
                      Nota geral
                    </span>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium ${cfg.score}`}
                >
                  {cfg.label}
                </span>
              </div>

              {/* Meta info */}
              <div className="flex flex-col items-center gap-1">
                <div className="text-center">
                  <span className="font-light text-muted-foreground text-xs">
                    Respondida em{" "}
                  </span>
                  <span className="text-xs text-foreground">
                    {respondidaEm}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground bg-muted border border-border rounded-full px-2 py-0.5 font-light">
                    {canal}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-light">
                    {totalPerguntas} de {totalPerguntas}{" "}
                    perguntas
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Perguntas */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-light text-muted-foreground text-xs">
              Respostas
            </span>
          </div>
          <div className="space-y-2">
            {respostas.map((r, i) => {
              if (r.tipo === "escala")
                return (
                  <RespostaEscala
                    key={i}
                    pergunta={r.pergunta}
                    valor={r.valor}
                    max={r.max!}
                  />
                );
              if (r.tipo === "booleano")
                return (
                  <RespostaBooleano
                    key={i}
                    pergunta={r.pergunta}
                    valor={r.valor}
                  />
                );
              if (r.tipo === "nps")
                return (
                  <RespostaNPS
                    key={i}
                    pergunta={r.pergunta}
                    valor={r.valor}
                    max={r.max!}
                  />
                );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}