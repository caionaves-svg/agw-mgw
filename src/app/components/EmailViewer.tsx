import { useEffect, useState } from "react";
import {
  ChevronLeft,
  Reply,
  ReplyAll,
  Redo2,
  Download,
  Paperclip,
  FileText,
  ChevronDown,
  ChevronUp,
  Shield,
} from "lucide-react";
import { useData } from "../contexts/DataContext";
import { usePreferences } from "../contexts/PreferencesContext";
import { Button } from "./ui/button";
import EmailComposer from "./EmailComposer";

// Backgrounds para dark e light mode
import bgPatternDark from "figma:asset/dae18cd761d363cc07e5aaeeb31d73481937cdc1.png";
import bgPatternLight from "figma:asset/3b9d618e90f32465a29764d581551d8daa37e59b.png";

interface EmailViewerProps {
  emailId: string;
  onBack: () => void;
}

export default function EmailViewer({
  emailId,
  onBack,
}: EmailViewerProps) {
  const { getEmailById, markEmailAsRead } = useData();
  const { theme } = usePreferences();
  const email = getEmailById(emailId);
  const [isExpanded, setIsExpanded] = useState(false);
  const [composerMode, setComposerMode] = useState<
    "reply" | "reply-all" | "forward" | null
  >(null);

  // Escolher background baseado no tema
  const bgPattern =
    theme === "dark" ? bgPatternDark : bgPatternLight;

  // Função para formatar data no padrão: "30 de abr. de 2026, 13:42 (há x dias)"
  const formatarData = (timestamp: Date): string => {
    const meses = [
      "jan.",
      "fev.",
      "mar.",
      "abr.",
      "mai.",
      "jun.",
      "jul.",
      "ago.",
      "set.",
      "out.",
      "nov.",
      "dez.",
    ];

    const dia = timestamp.getDate();
    const mes = meses[timestamp.getMonth()];
    const ano = timestamp.getFullYear();
    const horas = String(timestamp.getHours()).padStart(2, "0");
    const minutos = String(timestamp.getMinutes()).padStart(
      2,
      "0",
    );

    // Calcular diferença em dias
    const hoje = new Date();
    const diferencaMs = hoje.getTime() - timestamp.getTime();
    const diferencaDias = Math.floor(
      diferencaMs / (1000 * 60 * 60 * 24),
    );

    let textoTempo = "";
    if (diferencaDias === 0) {
      textoTempo = "(hoje)";
    } else if (diferencaDias === 1) {
      textoTempo = "(há 1 dia)";
    } else if (diferencaDias > 1) {
      textoTempo = `(há ${diferencaDias} dias)`;
    }

    return `${dia} de ${mes} de ${ano}, ${horas}:${minutos} ${textoTempo}`;
  };

  useEffect(() => {
    if (email && !email.lido) {
      markEmailAsRead(emailId);
    }
  }, [email, emailId, markEmailAsRead]);

  const handleSendEmail = (emailData: any) => {
    console.log("Enviando email:", emailData);
    // TODO: Implementar lógica de envio
    setComposerMode(null);
  };

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <p className="text-muted-foreground">
          Email não encontrado
        </p>
      </div>
    );
  }

  // Se está no modo composer, mostrar apenas o composer
  if (composerMode) {
    return (
      <EmailComposer
        mode={composerMode}
        originalEmail={email}
        onClose={() => setComposerMode(null)}
        onSend={handleSendEmail}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header com ações - mesma altura do EmailList */}
      <div className="flex items-center justify-between px-2 py-1 bg-muted border-b border-border">
        {/* Lado esquerdo: Voltar */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </Button>

        {/* Lado direito: Ações */}
        <div className="flex items-center gap-2">
          {/* Encaminhar */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setComposerMode("forward")}
          >
            <Redo2 className="w-4 h-4" />
            Encaminhar
          </Button>

          {/* Responder todos */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setComposerMode("reply-all")}
          >
            <ReplyAll className="w-4 h-4" />
            Responder todos
          </Button>

          {/* Responder */}
          <Button
            variant="brand"
            size="sm"
            className="gap-2"
            onClick={() => setComposerMode("reply")}
          >
            <Reply className="w-4 h-4" />
            Responder
          </Button>
        </div>
      </div>

      {/* Conteúdo do email com background pattern */}
      <div
        className="flex-1 overflow-hidden flex flex-col"
        style={{
          backgroundColor: "var(--muted)",
          backgroundImage: `url(${bgPattern})`,
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
        }}
      >
        {/* Container centralizado com max-width 5xl e padding 40px, fill vertical */}
        <div className="flex flex-col items-center flex-1 overflow-y-auto w-full p-2">
          <div className="w-full max-w-5xl bg-background rounded-lg p-2 flex flex-col gap-2 flex-1 overflow-hidden">
            {/* Assunto */}
            <h1 className="text-lg font-semibold text-foreground">
              {email.assunto}
            </h1>

            {/* Informações do remetente */}
            <div className="bg-accent rounded-lg p-2 flex flex-col gap-1">
              {/* Linha 1: Remetente (nome + email) e Data */}
              <div className="flex items-center justify-between w-full">
                {/* Remetente: nome + email */}
                <div className="flex items-center gap-1">
                  <span className="font-medium text-base text-foreground">
                    {email.remetente.nome}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {email.remetente.email}
                  </span>
                </div>
                {/* Data */}
                <span className="text-xs text-muted-foreground text-right whitespace-nowrap">
                  {formatarData(email.timestamp)}
                </span>
              </div>

              {/* Linha 2: Responder a + Para (lado esquerdo) e Botão chevron (lado direito) */}
              <div className="flex items-end justify-between w-full">
                {/* Container dos campos "Responder a" e "Para" */}
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  {/* Responder a - Sempre visível */}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground h-[21px]">
                    <span className="font-medium">
                      Responder a:
                    </span>
                    <span>{email.remetente.email}</span>
                  </div>

                  {/* Para - Sempre visível */}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground h-[21px]">
                    <span className="font-medium">Para:</span>
                    <span>
                      {email.destinatarios
                        .map((d) => d.email)
                        .join(", ")}
                    </span>
                  </div>
                </div>

                {/* Botão para expandir/recolher - alinhado à direita */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 hover:bg-accent-foreground/10 rounded-full transition-colors shrink-0"
                  aria-label={
                    isExpanded
                      ? "Recolher detalhes"
                      : "Expandir detalhes"
                  }
                >
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>
              </div>

              {/* Campos expandidos - Detalhes adicionais */}
              {isExpanded && (
                <div className="flex flex-col gap-1 pt-2 border-t border-border/50">
                  {/* CC - se existir */}
                  {email.cc && email.cc.length > 0 && (
                    <div className="flex items-start gap-1 text-sm">
                      <span className="font-medium text-muted-foreground min-w-[120px]">
                        cc:
                      </span>
                      <span className="text-muted-foreground">
                        {email.cc
                          .map((d) => d.email)
                          .join(", ")}
                      </span>
                    </div>
                  )}

                  {/* Data detalhada */}
                  <div className="flex items-start gap-1 text-sm">
                    <span className="font-medium text-muted-foreground min-w-[120px]">
                      data:
                    </span>
                    <span className="text-muted-foreground">
                      {email.data}
                    </span>
                  </div>

                  {/* Assunto */}
                  <div className="flex items-start gap-1 text-sm">
                    <span className="font-medium text-muted-foreground min-w-[120px]">
                      assunto:
                    </span>
                    <span className="text-muted-foreground">
                      {email.assunto}
                    </span>
                  </div>

                  {/* Enviado por (SPF/DKIM) */}
                  <div className="flex items-start gap-1 text-sm">
                    <span className="font-medium text-muted-foreground min-w-[120px]">
                      enviado por:
                    </span>
                    <span className="text-muted-foreground">
                      {email.remetente.email.split("@")[1]}
                    </span>
                  </div>

                  {/* Assinado por (DKIM) */}
                  <div className="flex items-start gap-1 text-sm">
                    <span className="font-medium text-muted-foreground min-w-[120px]">
                      assinado por:
                    </span>
                    <span className="text-muted-foreground">
                      {email.remetente.email.split("@")[1]}
                    </span>
                  </div>

                  {/* Segurança/Criptografia */}
                  <div className="flex items-start gap-1 text-sm pt-2 border-t border-border/50">
                    <Shield className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-muted-foreground font-medium">
                        Segurança:
                      </span>
                      <span className="text-muted-foreground text-xs">
                        Criptografia padrão (TLS) • Saiba mais
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Anexos - Movido para antes do corpo */}
            {email.anexos && email.anexos.length > 0 && (
              <div className="border-t border-border pt-2 flex flex-col gap-2">
                {/* Header de anexos */}
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {email.anexos.length}{" "}
                    {email.anexos.length === 1
                      ? "anexo"
                      : "anexos"}
                  </span>
                </div>

                {/* Lista de anexos */}
                <div className="grid grid-cols-3 gap-2">
                  {email.anexos.map((anexo) => (
                    <div
                      key={anexo.id}
                      className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-accent/50 transition-colors min-w-0"
                    >
                      <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {anexo.nome}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {anexo.tamanho}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 rounded-full border border-border"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Corpo do email - Com scroll próprio */}
            <div className="flex flex-col gap-4 border-t border-border pt-4 flex-1 overflow-hidden">
              <div
                className="text-base text-foreground leading-6 overflow-y-auto custom-scrollbar pr-2"
                dangerouslySetInnerHTML={{
                  __html: email.corpo,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}