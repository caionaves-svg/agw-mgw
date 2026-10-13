import { ExternalLink } from "lucide-react";

/** Abre o detalhamento do caso em nova aba (página cheia do CasePreviewModal). */
export function openCaseInNewTab(casoId: string) {
  window.open(
    `${window.location.origin}/management/cases?caso=${casoId}`,
    "_blank",
    "noopener,noreferrer",
  );
}

interface CaseIdBadgeProps {
  casoId: string;
  className?: string;
}

/**
 * Badge de ID do caso (mesmo visual da lista de atendimentos). Em qualquer
 * lugar da plataforma, clicar nele abre o detalhamento do caso em nova aba.
 */
export default function CaseIdBadge({ casoId, className = "" }: CaseIdBadgeProps) {
  return (
    <span
      role="link"
      tabIndex={0}
      title="Abrir detalhamento do caso em nova aba"
      onClick={(e) => {
        // Não dispara o clique do item pai (ex.: selecionar o contato)
        e.stopPropagation();
        openCaseInNewTab(casoId);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          openCaseInNewTab(casoId);
        }
      }}
      className={`group/case inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded flex-shrink-0 cursor-pointer transition-colors hover:text-primary hover:bg-primary/10 ${className}`}
    >
      {casoId}
      <ExternalLink className="w-3 h-3 hidden group-hover/case:block" />
    </span>
  );
}
