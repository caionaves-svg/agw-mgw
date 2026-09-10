import { Balloon, MessagePosition, Remetente } from "./Balloon";
import {
  Download,
  FileText,
  Sheet,
  Archive,
  File,
} from "lucide-react";

/**
 * FUNÇÃO: getFileIcon
 * Retorna o ícone apropriado baseado no tipo de arquivo
 */
function getFileIcon(tipo: string) {
  switch (tipo) {
    case "pdf":
      return <FileText className="w-8 h-8 text-red-600" />;
    case "doc":
    case "docx":
      return <FileText className="w-8 h-8 text-blue-600" />;
    case "xls":
    case "xlsx":
      return <Sheet className="w-8 h-8 text-green-600" />;
    case "zip":
      return <Archive className="w-8 h-8 text-orange-600" />;
    case "txt":
      return <File className="w-8 h-8 text-gray-600" />;
    default:
      return <File className="w-8 h-8 text-gray-600" />;
  }
}

/**
 * COMPONENTE: FileMessage
 *
 * Renderiza um balão com arquivo para download.
 *
 * @param mensagem - Objeto com dados da mensagem
 * @param position - Posição no grupo
 */
export interface FileMessageProps {
  mensagem: {
    id: string;
    texto: string;
    remetente: Remetente;
    timestamp: string;
    status?: string;
    arquivo?: {
      nome: string;
      tamanho: string;
      tipo: string;
      url?: string;
    };
  };
  position: MessagePosition;
}

export function FileMessage({
  mensagem,
  position,
}: FileMessageProps) {
  const isAtendente = mensagem.remetente === "atendente";

  const handleDownload = () => {
    if (mensagem.arquivo?.url) {
      window.open(mensagem.arquivo.url, "_blank");
    } else {
      console.log("Download:", mensagem.arquivo?.nome);
    }
  };

  return (
    <Balloon
      remetente={mensagem.remetente}
      position={position}
      timestamp={mensagem.timestamp}
      status={mensagem.status}
      innerClassName="overflow-hidden"
      footerClassName="px-3 pb-2" // Padding alinhado com conteúdo
    >
      {/* ========== CONTEÚDO DO ARQUIVO ========== */}
      <div className="p-3">
        <div className="flex items-center gap-3">
          {/* Ícone do arquivo */}
          <div className="flex-shrink-0">
            {getFileIcon(mensagem.arquivo?.tipo || "outros")}
          </div>

          {/* Informações do arquivo */}
          <div className="flex-1 min-w-0">
            <p
              className="font-medium text-foreground whitespace-pre-line truncate"
              style={{ fontSize: "var(--text-sm)" }}
            >
              {mensagem.arquivo?.nome}
            </p>
            <p
              className="text-muted-foreground"
              style={{ fontSize: "var(--text-xs)" }}
            >
              {mensagem.arquivo?.tamanho}
            </p>
          </div>

          {/* Botão de download */}
          <button
            onClick={handleDownload}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </Balloon>
  );
}