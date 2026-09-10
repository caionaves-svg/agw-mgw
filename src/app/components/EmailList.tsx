import { useState } from "react";
import {
  Mail,
  Paperclip,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useData, Email } from "../contexts/DataContext";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { usePreferences } from "../contexts/PreferencesContext";

// Backgrounds para dark e light mode
import bgPatternDark from "figma:asset/dae18cd761d363cc07e5aaeeb31d73481937cdc1.png";
import bgPatternLight from "figma:asset/3b9d618e90f32465a29764d581551d8daa37e59b.png";

interface EmailListProps {
  onEmailSelect: (emailId: string) => void;
}

export default function EmailList({
  onEmailSelect,
}: EmailListProps) {
  const { emails } = useData();
  const { theme } = usePreferences();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Escolher background baseado no tema
  const bgPattern =
    theme === "dark" ? bgPatternDark : bgPatternLight;

  // Ordenar por data (mais recentes primeiro)
  const emailsOrdenados = [...emails].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  );

  // Calcular paginação
  const totalItems = emailsOrdenados.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    totalItems,
  );
  const emailsPaginados = emailsOrdenados.slice(
    startIndex,
    endIndex,
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset para primeira página
  };

  return (
    <div className="flex flex-col h-full">
      {/* Barra de Ações Superior - padding de 16px */}
      <div className="flex items-center justify-between px-2 py-1  bg-muted border-b border-border">
        {/* Botão Criar E-Mail */}
        <Button variant="brand" className="gap-2">
          <Mail className="w-4 h-4" />
          Criar E-Mail
        </Button>

        {/* Controles de Paginação */}
        <div className="flex items-center gap-4">
          {/* Linhas por página */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Linhas por página
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Indicador de página */}
          <span className="text-sm text-muted-foreground">
            {startIndex + 1}-{endIndex} de {totalItems}
          </span>

          {/* Navegação */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextPage}
              disabled={
                currentPage === totalPages || totalItems === 0
              }
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de emails - centralizada com padding de 40px horizontal */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar"
        style={{
          backgroundColor: "var(--muted)",
          backgroundImage: `url(${bgPattern})`,
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
        }}
      >
        {emailsPaginados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground mb-1 font-medium">
              Nenhum email encontrado
            </p>
            <p className="text-muted-foreground text-sm">
              Não há emails para exibir no momento
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {emailsPaginados.map((email) => (
              <EmailItem
                key={email.id}
                email={email}
                onClick={() => onEmailSelect(email.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface EmailItemProps {
  email: Email;
  onClick: () => void;
}

function EmailItem({ email, onClick }: EmailItemProps) {
  // Determinar direção do email (recebido ou enviado)
  const direcao = email.remetente.nome.includes("@")
    ? "recebido"
    : "recebido";

  // Background baseado no estado de leitura
  // Lido: bg-muted com hover bg-accent
  // Novo: bg-background com hover bg-accent
  const bgClass = email.lido ? "bg-muted" : "bg-background";
  const hoverClass = "hover:bg-accent";

  return (
    <div
      onClick={onClick}
      className={`w-full border-b border-border ${bgClass} ${hoverClass} cursor-pointer transition-colors`}
    >
      {/* Container centralizado com largura máxima de 920px e padding horizontal de 40px */}
      <div className="flex flex-col items-center w-full">
        <div className="w-full max-w-[920px] px-2 py-2 flex flex-col gap-1">
          {/* Header: Tags de Status + Data + Anexo */}
          <div className="flex items-center justify-between gap-3 h-6">
            {/* Tags de Status */}
            <div className="flex items-center gap-2">
              {/* Tag Recebido/Enviado */}
              <Badge
                variant="outline"
                className="bg-muted/50 text-muted-foreground border-border text-xs h-5"
              >
                {direcao === "recebido"
                  ? "Recebido"
                  : "Enviado"}
              </Badge>

              {/* Tag Novo/Lido */}
              {!email.lido ? (
                <Badge
                  variant="outline"
                  className="bg-pink-50 text-pink-700 border-pink-200 text-xs h-5"
                >
                  Novo
                </Badge>
              ) : (
                <Badge
                  variant="success"
                  className="text-xs h-5"
                >
                  Lido
                </Badge>
              )}
            </div>

            {/* Data e Anexo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {email.data}
              </span>
              {email.anexos && email.anexos.length > 0 && (
                <Paperclip className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Assunto (Título Principal) */}
          <h3
            className={`text-base leading-6 ${
              email.lido
                ? "font-normal text-muted-foreground"
                : "font-semibold text-foreground"
            }`}
          >
            {email.assunto}
          </h3>

          {/* Preview do Conteúdo */}
          <p className="text-sm text-muted-foreground leading-5 line-clamp-1">
            {email.preview}
          </p>
        </div>
      </div>
    </div>
  );
}