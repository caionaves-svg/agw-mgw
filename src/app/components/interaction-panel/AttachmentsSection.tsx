import {
  X,
  Paperclip,
  Download,
  FileSpreadsheet,
  FileText,
  FolderArchive,
  Image,
  Music,
  Film,
} from "lucide-react";
import { DateDivider } from "./DateDivider";
import { Button } from "../ui/button";
import { SearchInput } from "../ui/search-input";
import { useState } from "react";

interface Anexo {
  id: string;
  nome: string;
  tamanho: string;
  tipo: "sheet" | "doc" | "zip" | "image" | "audio" | "video";
  data: string; // label do grupo
}

const MOCK: Anexo[] = [
  {
    id: "1",
    nome: "relatorio-mensal.xlsx",
    tamanho: "1.2 mb",
    tipo: "sheet",
    data: "Hoje",
  },
  {
    id: "2",
    nome: "contrato-servico.doc",
    tamanho: "1.2 mb",
    tipo: "doc",
    data: "Hoje",
  },
  {
    id: "3",
    nome: "documentos.zip",
    tamanho: "3.4 mb",
    tipo: "zip",
    data: "Hoje",
  },
  {
    id: "4",
    nome: "foto-comprovante.jpg",
    tamanho: "1.2 mb",
    tipo: "image",
    data: "04/03/2026",
  },
  {
    id: "5",
    nome: "audio-reuniao.mp3",
    tamanho: "1.2 mb",
    tipo: "audio",
    data: "04/03/2026",
  },
  {
    id: "6",
    nome: "gravacao-tela.mp4",
    tamanho: "1.2 mb",
    tipo: "video",
    data: "04/03/2026",
  },
];

const TIPO_CONFIG = {
  sheet: { Icon: FileSpreadsheet, color: "text-green-500" },
  doc: { Icon: FileText, color: "text-blue-500" },
  zip: { Icon: FolderArchive, color: "text-yellow-500" },
  image: { Icon: Image, color: "text-lime-500" },
  audio: { Icon: Music, color: "text-purple-500" },
  video: { Icon: Film, color: "text-rose-500" },
};

function AnexoRow({ anexo }: { anexo: Anexo }) {
  const { Icon, color } = TIPO_CONFIG[anexo.tipo];
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border last:border-0 group">
      {/* Ícone colorido */}
      <Icon
        className={`flex-shrink-0 w-8 h-8 ${color}`}
        strokeWidth={1.5}
      />

      {/* Nome e tamanho */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground font-medium truncate leading-tight">
          {anexo.nome}
        </p>
        <p className="text-xs text-muted-foreground font-light">
          {anexo.tamanho}
        </p>
      </div>

      {/* Download */}
      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0 w-8 h-8 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
        title="Baixar arquivo"
      >
        <Download className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

interface AttachmentsSectionProps {
  onClose?: () => void;
}

export function AttachmentsSection({
  onClose,
}: AttachmentsSectionProps) {
  const [query, setQuery] = useState("");

  const filtered = MOCK.filter((a) =>
    a.nome.toLowerCase().includes(query.toLowerCase()),
  );

  // Agrupar por data
  const grouped = filtered.reduce<Record<string, Anexo[]>>(
    (acc, a) => {
      if (!acc[a.data]) acc[a.data] = [];
      acc[a.data].push(a);
      return acc;
    },
    {},
  );

  return (
    <div className="bg-background rounded-xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between flex-shrink-0">
        <span className="text-base font-medium text-foreground">
          Anexos
        </span>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search + Anexar */}
      <div className="px-4 pb-3 flex items-center gap-2 flex-shrink-0">
        <div className="flex-1">
          <SearchInput
            placeholder="Buscar por..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            showIcon
          />
        </div>
        <Button
          variant="brand"
          size="sm"
          className="gap-1.5 flex-shrink-0"
        >
          <Paperclip className="w-3.5 h-3.5" />
          Anexar
        </Button>
      </div>

      {/* Lista agrupada por data */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
        {Object.entries(grouped).map(([data, anexos]) => (
          <div key={data}>
            <DateDivider label={data} />
            <div className="flex flex-col gap-2">
              {anexos.map((a) => (
                <div
                  key={a.id}
                  className="border border-border p-2 rounded-lg overflow-hidden"
                >
                  <AnexoRow anexo={a} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Nenhum anexo encontrado
          </div>
        )}
      </div>
    </div>
  );
}