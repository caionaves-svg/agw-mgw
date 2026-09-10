interface QuotedMessagePreviewProps {
  autorNome: string;
  texto: string;
}

/**
 * Card de referência a uma mensagem/comentário anterior, exibido dentro
 * de um balão quando ele é uma resposta a outra mensagem.
 */
export function QuotedMessagePreview({
  autorNome,
  texto,
}: QuotedMessagePreviewProps) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border bg-background/60 px-2 py-1.5 mb-1.5">
      <div className="w-0.5 self-stretch rounded-full bg-primary shrink-0" />
      <div className="min-w-0">
        <div className="text-xs font-semibold text-foreground">{autorNome}</div>
        <div className="text-xs text-muted-foreground truncate">{texto}</div>
      </div>
    </div>
  );
}
