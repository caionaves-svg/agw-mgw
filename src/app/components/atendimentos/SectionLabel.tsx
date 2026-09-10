import { ChevronDown, ChevronUp } from "lucide-react";

interface SectionLabelProps {
  label: string;
  count?: number;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function SectionLabel({
  label,
  count,
  isCollapsed = false,
  onToggle,
}: SectionLabelProps) {
  const Icon = isCollapsed ? ChevronUp : ChevronDown;

  return (
    <button
      onClick={onToggle}
      className="w-full mx-2 pl-2 pr-4 py-2 flex bg-gradient-to-t from-background via-background to-border/50 items-center justify-between hover:bg-muted transition-colors"
    >
      <div className="flex items-center gap-2">
        <p
          className="text-foreground font-medium"
          style={{ fontSize: "var(--text-sm)" }}
        >
          {label}
        </p>
        {count !== undefined && count > 0 && (
          <span className="inline-flex items-center justify-center h-4 min-w-[18px] px-1 rounded-full bg-brand-primary text-white font-semibold"
            style={{ fontSize: "10px" }}>
            {count > 99 ? "99+" : count}
          </span>
        )}
      </div>
      {onToggle && (
        <Icon className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );
}