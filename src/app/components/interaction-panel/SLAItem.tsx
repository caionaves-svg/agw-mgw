import { Check } from "lucide-react";

interface SLAItemProps {
  nome: string;
  status: "dentro-prazo" | "em-risco" | "estourado" | "concluido";
  tempoRestante: string;
  percentualDecorrido: number;
  isFirst?: boolean;
}

export function SLAItem({
  nome,
  status,
  tempoRestante,
  percentualDecorrido,
  isFirst = false,
}: SLAItemProps) {
  // Configurações de cor e label baseadas no status
  // Usando apenas tokens do design system global
  const statusConfig = {
    "dentro-prazo": {
      cardBg: "bg-success/10",
      badgeBg: "bg-background",
      badgeText: "text-success",
      badgeLabel: "No Prazo",
      barColor: "bg-success",
      timeLabel: "restante",
      showCheck: false,
    },
    "em-risco": {
      cardBg: "bg-warning/10",
      badgeBg: "bg-background",
      badgeText: "text-warning",
      badgeLabel: "Vencendo",
      barColor: "bg-warning",
      timeLabel: "restante",
      showCheck: false,
    },
    estourado: {
      cardBg: "bg-destructive/10",
      badgeBg: "bg-background",
      badgeText: "text-destructive",
      badgeLabel: "Vencido",
      barColor: "bg-destructive",
      timeLabel: "excedida",
      showCheck: false,
    },
    concluido: {
      cardBg: "bg-success/10",
      badgeBg: "bg-success",
      badgeText: "text-white",
      badgeLabel: "Concluído",
      barColor: "bg-success",
      timeLabel: "em",
      showCheck: true,
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`flex flex-col gap-2 ${config.cardBg} rounded-lg p-2`}
    >
      {/* Linha principal: Nome + Badge + Tempo */}
      <div className="flex items-center justify-between">
        {/* Nome + Badge */}
        <div className="flex items-center gap-2">
          {config.showCheck && (
            <Check className="w-4 h-4 text-success flex-shrink-0" />
          )}
          <p
            className="text-foreground font-medium truncate flex-1"
            style={{ fontSize: "var(--text-sm)" }}
          >
            {nome}
          </p>
          <span
            className={`${config.badgeBg} ${config.badgeText} px-1.5 py-0.5 rounded flex items-center gap-1`}
            style={{ fontSize: "var(--text-xs)" }}
          >
            {config.showCheck && (
              <Check className="w-3 h-3" />
            )}
            {config.badgeLabel}
          </span>
        </div>

        {/* Tempo restante/excedida/concluído - em uma linha */}
        <p
          className="text-xs text-muted-foreground font-mono tracking-tight backgroundspace-nowrap"
          style={{ fontSize: "var(--text-xs)" }}
        >
          {tempoRestante}
        </p>
      </div>

      {/* Barra de progresso */}
      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
        <div
          className={`h-full ${config.barColor} transition-all duration-300`}
          style={{
            width: `${Math.min(percentualDecorrido, 100)}%`,
          }}
        />
      </div>
    </div>
  );
}