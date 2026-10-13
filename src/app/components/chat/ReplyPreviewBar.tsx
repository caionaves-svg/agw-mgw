import { X } from "lucide-react";

export interface ReplyTarget {
  autorNome: string;
  snippet: string;
}

interface ReplyPreviewBarProps {
  replyingTo: ReplyTarget;
  onCancel?: () => void;
}

/**
 * Faixa exibida dentro do próprio container do composer (acima da linha de
 * digitação) quando o usuário está respondendo a uma mensagem/comentário
 * específico, com opção de cancelar a resposta.
 */
export function ReplyPreviewBar({
  replyingTo,
  onCancel,
}: ReplyPreviewBarProps) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-border bg-background px-2 py-2 mb-2">
      <div className="w-px self-stretch bg-primary shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-foreground">
          {replyingTo.autorNome}
        </div>
        <div className="text-sm text-muted-foreground truncate">
          {replyingTo.snippet}
        </div>
      </div>
      <button
        onClick={onCancel}
        className="shrink-0 p-1 text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
