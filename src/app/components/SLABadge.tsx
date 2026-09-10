import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { SLA } from "../contexts/DataContext";

interface SLABadgeProps {
  status: SLA['status'];
  compact?: boolean;
}

export function SLABadge({ status, compact = false }: SLABadgeProps) {
  const configs = {
    'dentro-prazo': {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: 'Dentro do Prazo',
      compactLabel: 'OK',
      icon: CheckCircle
    },
    'em-risco': {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      label: 'SLA em Risco',
      compactLabel: 'Risco',
      icon: Clock
    },
    'estourado': {
      bg: 'bg-red-100',
      text: 'text-red-700',
      label: 'SLA Estourado',
      compactLabel: 'Estourado',
      icon: AlertCircle
    }
  };

  const config = configs[status];
  const Icon = config.icon;
  const label = compact ? config.compactLabel : config.label;

  return (
    <span className={`${config.bg} ${config.text} text-[11px] px-2 py-0.5 rounded-[4px] flex items-center gap-1 w-fit`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
