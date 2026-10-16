import { useCaseModal } from "../contexts/CaseModalContext";

/**
 * Abre o detalhamento do caso em nova aba (página cheia do CasePreviewModal).
 * Uso restrito à página de gerenciamento (/management/cases).
 */
export function openCaseInNewTab(casoId: string) {
  window.open(
    `${window.location.origin}/management/cases?caso=${casoId}`,
    "_blank",
    "noopener,noreferrer",
  );
}

interface CaseIdBadgeProps {
  casoId: string;
  clienteNome?: string;
  className?: string;
}

/**
 * Badge de ID do caso (mesmo visual da lista de atendimentos). Clicar nele
 * abre a modal "Dados do Caso" (temporariamente, a modal da plataforma atual).
 */
export default function CaseIdBadge({ casoId, clienteNome, className = "" }: CaseIdBadgeProps) {
  const { openCaseModal } = useCaseModal();
  const open = () => openCaseModal(casoId, clienteNome);

  return (
    <span
      role="button"
      tabIndex={0}
      title="Ver dados do caso"
      onClick={(e) => {
        // Não dispara o clique do item pai (ex.: selecionar o contato)
        e.stopPropagation();
        open();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          open();
        }
      }}
      className={`inline-flex items-center text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded flex-shrink-0 cursor-pointer transition-colors hover:text-primary hover:bg-primary/10 ${className}`}
    >
      {casoId}
    </span>
  );
}
