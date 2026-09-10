import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Paperclip,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  FileImage,
  File,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
  LayoutTemplate,
} from "lucide-react";
import RichEmailEditor from "./RichEmailEditor";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { usePreferences } from "../contexts/PreferencesContext";

import bgPatternDark from "figma:asset/dae18cd761d363cc07e5aaeeb31d73481937cdc1.png";
import bgPatternLight from "figma:asset/3b9d618e90f32465a29764d581551d8daa37e59b.png";

// ─── Templates HTML ───────────────────────────────────────────────────────────
const EMAIL_TEMPLATES = [
  {
    id: "boas-vindas",
    nome: "Boas-vindas",
    descricao: "Apresentação inicial com imagem de cabeçalho",
    thumbnail: "👋",
    corpo: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
  <div style="background:linear-gradient(135deg,#00bcf2,#007191);padding:40px 32px;text-align:center;border-radius:8px 8px 0 0">
    <h1 style="color:#ffffff;font-size:28px;margin:0;font-weight:700">Bem-vindo(a)! 👋</h1>
    <p style="color:rgba(255,255,255,0.85);font-size:15px;margin:12px 0 0">Estamos felizes em ter você conosco</p>
  </div>
  <div style="padding:32px;background:#ffffff">
    <p style="color:#374151;font-size:15px;line-height:1.7">Olá,</p>
    <p style="color:#374151;font-size:15px;line-height:1.7">
      Seja muito bem-vindo(a)! Nossa equipe está pronta para oferecer o melhor atendimento possível.
    </p>
    <div style="background:#f0f9ff;border-left:4px solid #00bcf2;padding:16px 20px;margin:24px 0;border-radius:0 8px 8px 0">
      <p style="color:#007191;font-size:14px;margin:0;font-weight:600">💡 Próximos passos</p>
      <p style="color:#374151;font-size:14px;margin:8px 0 0;line-height:1.6">Entre em contato a qualquer momento — estamos aqui para ajudar.</p>
    </div>
    <a href="#" style="display:inline-block;background:#00bcf2;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;margin-top:8px">Acessar Portal →</a>
  </div>
  <div style="background:#f9fafb;padding:20px 32px;text-align:center;border-radius:0 0 8px 8px;border-top:1px solid #e5e7eb">
    <p style="color:#9ca3af;font-size:12px;margin:0">© 2025 Empresa · Todos os direitos reservados</p>
  </div>
</div>`,
  },
  {
    id: "proposta",
    nome: "Proposta Comercial",
    descricao: "Template com tabela de preços e CTA",
    thumbnail: "📋",
    corpo: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
  <div style="background:#162533;padding:28px 32px;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:space-between">
    <h2 style="color:#ffffff;margin:0;font-size:20px">Proposta Comercial</h2>
    <span style="background:#00bcf2;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600">EXCLUSIVA</span>
  </div>
  <div style="padding:32px">
    <p style="color:#374151;font-size:15px;line-height:1.7">Olá,</p>
    <p style="color:#374151;font-size:15px;line-height:1.7">Preparamos uma proposta personalizada especialmente para você:</p>
    <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px">
      <thead>
        <tr style="background:#f3f4f6">
          <th style="padding:12px 16px;text-align:left;color:#374151;font-weight:600;border-bottom:2px solid #e5e7eb">Serviço</th>
          <th style="padding:12px 16px;text-align:right;color:#374151;font-weight:600;border-bottom:2px solid #e5e7eb">Valor</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style="padding:12px 16px;border-bottom:1px solid #f3f4f6;color:#374151">Plano Básico</td><td style="padding:12px 16px;border-bottom:1px solid #f3f4f6;color:#374151;text-align:right">R$ 299/mês</td></tr>
        <tr style="background:#f9fafb"><td style="padding:12px 16px;border-bottom:1px solid #f3f4f6;color:#374151">Suporte Premium</td><td style="padding:12px 16px;border-bottom:1px solid #f3f4f6;color:#374151;text-align:right">R$ 149/mês</td></tr>
        <tr><td style="padding:12px 16px;color:#374151;font-weight:600">Total</td><td style="padding:12px 16px;color:#00bcf2;text-align:right;font-weight:700;font-size:16px">R$ 448/mês</td></tr>
      </tbody>
    </table>
    <a href="#" style="display:inline-block;background:#00bcf2;color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:700;font-size:15px">Aceitar Proposta</a>
  </div>
  <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-radius:0 0 8px 8px;border-top:1px solid #e5e7eb">
    <p style="color:#9ca3af;font-size:12px;margin:0">Proposta válida por 7 dias · Entre em contato para dúvidas</p>
  </div>
</div>`,
  },
  {
    id: "suporte",
    nome: "Suporte Técnico",
    descricao: "Resposta de ticket com status e próximos passos",
    thumbnail: "🛠️",
    corpo: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
  <div style="background:#ffffff;padding:24px 32px;border-bottom:3px solid #00bcf2">
    <p style="color:#9ca3af;font-size:12px;margin:0 0 4px">TICKET #00842 · EM ANDAMENTO</p>
    <h2 style="color:#162533;margin:0;font-size:20px">Atualização do seu chamado</h2>
  </div>
  <div style="padding:32px">
    <p style="color:#374151;font-size:15px;line-height:1.7">Olá,</p>
    <p style="color:#374151;font-size:15px;line-height:1.7">Nossa equipe de suporte recebeu seu chamado e já está trabalhando na solução.</p>
    <div style="display:flex;gap:12px;margin:24px 0">
      <div style="flex:1;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;text-align:center">
        <p style="color:#16a34a;font-size:12px;font-weight:600;margin:0 0 4px">STATUS</p>
        <p style="color:#166534;font-size:14px;font-weight:700;margin:0">Em análise</p>
      </div>
      <div style="flex:1;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;text-align:center">
        <p style="color:#3b82f6;font-size:12px;font-weight:600;margin:0 0 4px">PREVISÃO</p>
        <p style="color:#1d4ed8;font-size:14px;font-weight:700;margin:0">Até 48h</p>
      </div>
      <div style="flex:1;background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:16px;text-align:center">
        <p style="color:#d97706;font-size:12px;font-weight:600;margin:0 0 4px">PRIORIDADE</p>
        <p style="color:#92400e;font-size:14px;font-weight:700;margin:0">Normal</p>
      </div>
    </div>
    <p style="color:#374151;font-size:14px;line-height:1.7">Você será notificado assim que houver uma atualização. Se precisar de informações adicionais, responda este e-mail.</p>
  </div>
  <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-radius:0 0 8px 8px;border-top:1px solid #e5e7eb">
    <p style="color:#9ca3af;font-size:12px;margin:0">Equipe de Suporte · suporte@empresa.com.br</p>
  </div>
</div>`,
  },
];

// ─── Utilitários de anexo ─────────────────────────────────────────────────────
function getFileIcon(file: File) {
  const type = file.type;
  if (type.startsWith("image/")) return FileImage;
  if (type.includes("spreadsheet") || type.includes("excel") || file.name.match(/\.(xlsx?|csv)$/i)) return FileSpreadsheet;
  return FileText;
}

function getFileColor(file: File) {
  const type = file.type;
  if (type.startsWith("image/")) return "text-purple-500";
  if (type.includes("pdf")) return "text-red-500";
  if (type.includes("spreadsheet") || type.includes("excel") || file.name.match(/\.(xlsx?|csv)$/i)) return "text-green-600";
  return "text-blue-500";
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Preview de anexo ────────────────────────────────────────────────────────
function AnexoPreviewModal({ file, onClose }: { file: File; onClose: () => void }) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const isImage = file.type.startsWith("image/");
  const Icon = getFileIcon(file);
  const iconColor = getFileColor(file);

  useEffect(() => {
    if (!isImage) return;
    const reader = new FileReader();
    reader.onload = () => setImgSrc(reader.result as string);
    reader.readAsDataURL(file);
  }, [file]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col"
        style={{ maxWidth: isImage ? "80vw" : 400, maxHeight: "85vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
            <span className="text-[13px] font-medium text-foreground truncate">{file.name}</span>
            <span className="text-[11px] text-muted-foreground flex-shrink-0">{formatFileSize(file.size)}</span>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0 ml-3">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Conteúdo */}
        {isImage ? (
          <div className="flex-1 overflow-auto bg-[#1a1a1a] flex items-center justify-center p-4">
            {imgSrc
              ? <img src={imgSrc} alt={file.name} className="max-w-full max-h-full object-contain rounded-lg shadow-xl" />
              : <Loader2 className="w-8 h-8 text-white/40 animate-spin" />}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 p-10 bg-muted/30">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center shadow-inner">
              <Icon className={`w-10 h-10 ${iconColor}`} />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-semibold text-foreground">{file.name}</p>
              <p className="text-[12px] text-muted-foreground mt-1">{formatFileSize(file.size)}</p>
              <p className="text-[11px] text-muted-foreground/60 mt-3">
                Pré-visualização não disponível para este tipo de arquivo
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Card de anexo com animação ───────────────────────────────────────────────
function AnexoCard({
  file,
  onRemove,
  isNew,
}: {
  file: File;
  onRemove: () => void;
  isNew: boolean;
}) {
  const [uploading, setUploading] = useState(isNew);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const Icon = getFileIcon(file);
  const iconColor = getFileColor(file);

  useEffect(() => {
    if (!isNew) { setUploading(false); setDone(true); setProgress(100); return; }
    const duration = 1200 + Math.random() * 600;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(p);
      if (p < 100) requestAnimationFrame(tick);
      else { setUploading(false); setDone(true); }
    };
    requestAnimationFrame(tick);
  }, []);

  return (
    <>
      {showPreview && <AnexoPreviewModal file={file} onClose={() => setShowPreview(false)} />}
      <div
        onClick={() => done && setShowPreview(true)}
        className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-300 ${
          done ? "border-border bg-background hover:bg-muted/40 cursor-pointer" : "border-[#00bcf2]/40 bg-[#e6f7fd]/30 cursor-default"
        } ${isNew ? "animate-in slide-in-from-bottom-2 fade-in duration-300" : ""}`}
      >
      {/* Ícone */}
      <div className={`relative w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${done ? "bg-muted" : "bg-[#e6f7fd]"}`}>
        <Icon className={`w-5 h-5 ${done ? iconColor : "text-[#00bcf2]"}`} />
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-9 h-9 text-[#00bcf2] absolute animate-spin opacity-30" strokeWidth={1} />
          </div>
        )}
        {done && isNew && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center animate-in zoom-in duration-200">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground truncate">{file.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[11px] text-muted-foreground">{formatFileSize(file.size)}</p>
          {uploading && (
            <>
              <div className="flex-1 max-w-[80px] h-1 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-[#00bcf2] rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[10px] text-[#00bcf2] font-medium">{progress}%</span>
            </>
          )}
          {done && <span className="text-[10px] text-muted-foreground">Clique para visualizar</span>}
        </div>
      </div>

      {/* Remover */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      </div>
    </>
  );
}

// ─── Modal de preview de template ────────────────────────────────────────────
function TemplatePreviewModal({
  template,
  onUse,
  onClose,
}: {
  template: typeof EMAIL_TEMPLATES[0];
  onUse: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">{template.nome}</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">{template.descricao}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-hidden bg-muted/30 p-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full">
            <iframe
              srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:20px;font-family:Arial,sans-serif;background:#f3f4f6}*{box-sizing:border-box}</style></head><body>${template.corpo}</body></html>`}
              className="w-full h-full min-h-[400px] border-0"
              sandbox="allow-same-origin"
              title={`Preview: ${template.nome}`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="brand" size="sm" onClick={onUse}>
            Usar este template
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface EmailComposerProps {
  mode: "reply" | "reply-all" | "forward";
  originalEmail: {
    assunto: string;
    remetente: { nome: string; email: string };
    destinatarios: Array<{ nome: string; email: string }>;
    cc?: Array<{ nome: string; email: string }>;
    corpo: string;
    data: string;
  };
  onClose: () => void;
  onSend: (emailData: any) => void;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function EmailComposer({ mode, originalEmail, onClose, onSend }: EmailComposerProps) {
  const { theme } = usePreferences();
  const [para, setPara] = useState<string[]>(
    mode === "reply" ? [originalEmail.remetente.email]
    : mode === "reply-all" ? [originalEmail.remetente.email, ...originalEmail.destinatarios.map((d) => d.email)]
    : [],
  );
  const [showCC, setShowCC] = useState(false);
  const [cc, setCC] = useState<string[]>(mode === "reply-all" && originalEmail.cc ? originalEmail.cc.map((d) => d.email) : []);
  const [assunto, setAssunto] = useState(mode === "forward" ? `Enc: ${originalEmail.assunto}` : `Re: ${originalEmail.assunto}`);
  const [corpo, setCorpo] = useState("");
  const [showOriginal, setShowOriginal] = useState(false);
  const [anexos, setAnexos] = useState<{ file: File; isNew: boolean }[]>([]);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<typeof EMAIL_TEMPLATES[0] | null>(null);
  const [showSendPreview, setShowSendPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgPattern = theme === "dark" ? bgPatternDark : bgPatternLight;

  const getModeLabel = () =>
    mode === "reply" ? "Responder" : mode === "reply-all" ? "Responder a todos" : "Encaminhar";

  const handleRemoveRecipient = (email: string, type: "para" | "cc") => {
    if (type === "para") setPara(para.filter((e) => e !== email));
    else setCC(cc.filter((e) => e !== email));
  };

  const handleAddRecipient = (email: string, type: "para" | "cc") => {
    if (!email.trim()) return;
    if (type === "para" && !para.includes(email)) setPara([...para, email]);
    else if (type === "cc" && !cc.includes(email)) setCC([...cc, email]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f) => ({ file: f, isNew: true }));
      setAnexos((prev) => [...prev, ...newFiles]);
    }
    e.target.value = "";
  };

  const handleAttachFromEditor = (files: File[]) => {
    const newFiles = files.map((f) => ({ file: f, isNew: true }));
    setAnexos((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveAnexo = (index: number) =>
    setAnexos((prev) => prev.filter((_, i) => i !== index));

  const handleTemplateSelect = (corpo: string) => {
    setCorpo(corpo);
    setShowTemplateMenu(false);
    setPreviewTemplate(null);
  };

  const handleSend = () => {
    onSend({ para, cc, assunto, corpo, anexos: anexos.map((a) => a.file) });
  };

  // HTML completo do e-mail para o preview de envio
  const buildSendPreviewHtml = () => `
    <!DOCTYPE html><html><head><meta charset="utf-8">
    <style>body{margin:0;padding:20px;font-family:Arial,sans-serif;background:#f3f4f6}*{box-sizing:border-box}</style>
    </head><body>
    <div style="max-width:660px;margin:0 auto">
      <div style="background:#fff;border-radius:8px;padding:20px 24px;border:1px solid #e5e7eb;margin-bottom:12px;font-size:13px;color:#374151">
        <div style="display:flex;gap:8px;margin-bottom:6px"><strong style="min-width:50px">De:</strong><span>Atendente &lt;atendente@empresa.com.br&gt;</span></div>
        <div style="display:flex;gap:8px;margin-bottom:6px"><strong style="min-width:50px">Para:</strong><span>${para.join(", ")}</span></div>
        ${cc.length ? `<div style="display:flex;gap:8px;margin-bottom:6px"><strong style="min-width:50px">CC:</strong><span>${cc.join(", ")}</span></div>` : ""}
        <div style="display:flex;gap:8px"><strong style="min-width:50px">Assunto:</strong><span>${assunto}</span></div>
      </div>
      <div style="background:#fff;border-radius:8px;border:1px solid #e5e7eb;overflow:hidden">
        <div style="padding:24px">${corpo || "<p style='color:#9ca3af'>Sem conteúdo</p>"}</div>
        ${anexos.length ? `
        <div style="border-top:1px solid #e5e7eb;padding:16px 24px;background:#f9fafb">
          <p style="color:#6b7280;font-size:12px;margin:0 0 10px;font-weight:600">${anexos.length} ANEXO${anexos.length > 1 ? "S" : ""}</p>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${anexos.map((a) => `<div style="display:flex;align-items:center;gap:6px;background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:6px 10px;font-size:12px;color:#374151">📎 ${a.file.name}</div>`).join("")}
          </div>
        </div>` : ""}
      </div>
    </div>
    </body></html>`;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 bg-card border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="w-8 h-8 p-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-[14px] font-semibold text-foreground">{getModeLabel()}</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-[12px]"
          onClick={() => setShowSendPreview(true)}
        >
          <Eye className="w-3.5 h-3.5" />
          Pré-visualizar
        </Button>
      </div>

      {/* Conteúdo */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar"
        style={{ backgroundColor: "var(--muted)", backgroundImage: `url(${bgPattern})`, backgroundRepeat: "repeat", backgroundSize: "auto" }}
      >
        <div className="flex flex-col items-center min-h-full w-full p-2">
          <div className="w-full max-w-5xl bg-background rounded-lg p-3 flex flex-col gap-3 flex-1">

            {/* Campos */}
            <div className="flex flex-col gap-2">
              {/* Para */}
              <div className="flex items-start gap-2">
                <Label className="text-[12px] text-muted-foreground min-w-[60px] pt-1.5">Para:</Label>
                <div className="flex-1 flex flex-wrap gap-1.5 items-center">
                  {para.map((email) => (
                    <Badge key={email} variant="outline" className="gap-1 pl-2 pr-1 h-6 bg-muted/50 text-[11px]">
                      {email}
                      <button onClick={() => handleRemoveRecipient(email, "para")} className="hover:bg-accent rounded-full p-0.5 transition-colors">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </Badge>
                  ))}
                  <Input type="email" placeholder="Adicionar destinatário"
                    className="flex-1 min-w-[160px] border-none shadow-none focus-visible:ring-0 h-6 px-0 text-[13px]"
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); handleAddRecipient(e.currentTarget.value, "para"); e.currentTarget.value = ""; } }}
                  />
                  {!showCC && <Button variant="ghost" size="xs" onClick={() => setShowCC(true)} className="h-6 text-[11px]">CC</Button>}
                </div>
              </div>

              {/* CC */}
              {showCC && (
                <div className="flex items-start gap-2">
                  <Label className="text-[12px] text-muted-foreground min-w-[60px] pt-1.5">CC:</Label>
                  <div className="flex-1 flex flex-wrap gap-1.5 items-center">
                    {cc.map((email) => (
                      <Badge key={email} variant="outline" className="gap-1 pl-2 pr-1 h-6 bg-muted/50 text-[11px]">
                        {email}
                        <button onClick={() => handleRemoveRecipient(email, "cc")} className="hover:bg-accent rounded-full p-0.5 transition-colors">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </Badge>
                    ))}
                    <Input type="email" placeholder="Adicionar CC"
                      className="flex-1 min-w-[160px] border-none shadow-none focus-visible:ring-0 h-6 px-0 text-[13px]"
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); handleAddRecipient(e.currentTarget.value, "cc"); e.currentTarget.value = ""; } }}
                    />
                  </div>
                </div>
              )}

              {/* Assunto */}
              <div className="flex items-center gap-2">
                <Label className="text-[12px] text-muted-foreground min-w-[60px]">Assunto:</Label>
                <Input type="text" value={assunto} onChange={(e) => setAssunto(e.target.value)}
                  className="flex-1 border-none shadow-none focus-visible:ring-0 h-7 px-0 text-[13px]" />
              </div>

              {/* E-mail original */}
              <button onClick={() => setShowOriginal(!showOriginal)}
                className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors self-start">
                {showOriginal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                Visualizar e-mail original
              </button>
              {showOriginal && (
                <div className="border border-border rounded-lg p-3 bg-background text-[13px]">
                  <div className="flex flex-col gap-1 mb-2 text-[12px]">
                    <div><span className="font-medium">De:</span> {originalEmail.remetente.nome} &lt;{originalEmail.remetente.email}&gt;</div>
                    <div><span className="font-medium">Data:</span> {originalEmail.data}</div>
                    <div><span className="font-medium">Assunto:</span> {originalEmail.assunto}</div>
                  </div>
                  <div className="text-muted-foreground prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: originalEmail.corpo }} />
                </div>
              )}
            </div>

            <div className="border-t border-border" />

            {/* Editor */}
            <RichEmailEditor
              value={corpo}
              onChange={setCorpo}
              onAttach={handleAttachFromEditor}
              placeholder="Digite sua mensagem ou cole um HTML aqui..."
              minHeight={0}
              className="flex-1"
            />

            {/* Anexos */}
            {anexos.length > 0 && (
              <div className="border-t border-border pt-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[12px] text-muted-foreground font-medium">
                    {anexos.length} {anexos.length === 1 ? "anexo" : "anexos"}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {anexos.map((a, index) => (
                    <AnexoCard
                      key={`${a.file.name}-${index}`}
                      file={a.file}
                      onRemove={() => handleRemoveAnexo(index)}
                      isNew={a.isNew}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-1.5">
                {/* Templates */}
                <div className="relative">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-[12px]"
                    onClick={() => setShowTemplateMenu(!showTemplateMenu)}>
                    <LayoutTemplate className="w-3.5 h-3.5" />
                    Templates
                  </Button>
                  {showTemplateMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-72 bg-background border border-border rounded-xl shadow-xl overflow-hidden z-20">
                      <div className="px-3 py-2.5 border-b border-border">
                        <span className="text-[13px] font-semibold text-foreground">Escolher template</span>
                      </div>
                      <div className="p-2 flex flex-col gap-1">
                        {EMAIL_TEMPLATES.map((tpl) => (
                          <div key={tpl.id}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors cursor-pointer group"
                            onClick={() => { setPreviewTemplate(tpl); setShowTemplateMenu(false); }}
                          >
                            <span className="text-2xl flex-shrink-0">{tpl.thumbnail}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-foreground">{tpl.nome}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{tpl.descricao}</p>
                            </div>
                            <span className="text-[10px] text-[#00bcf2] opacity-0 group-hover:opacity-100 transition-opacity font-medium flex-shrink-0">Preview →</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Anexar */}
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
                <Button variant="ghost" size="sm" className="gap-1.5 text-[12px]"
                  onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="w-3.5 h-3.5" />
                  Anexar
                </Button>
              </div>

              <Button variant="brand" size="sm" onClick={handleSend}
                disabled={para.length === 0 || !assunto.trim()}>
                {mode === "forward" ? "Encaminhar" : "Responder"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Preview de template */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onUse={() => handleTemplateSelect(previewTemplate.corpo)}
          onClose={() => setPreviewTemplate(null)}
        />
      )}

      {/* Modal: Pré-visualizar envio */}
      {showSendPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSendPreview(false)} />
          <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
              <div>
                <h3 className="text-[15px] font-semibold text-foreground">Pré-visualização do e-mail</h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">Como o destinatário vai ver</p>
              </div>
              <button onClick={() => setShowSendPreview(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden bg-[#f3f4f6] p-4">
              <iframe
                srcDoc={buildSendPreviewHtml()}
                className="w-full h-full min-h-[420px] border-0 rounded-xl"
                sandbox="allow-same-origin"
                title="Pré-visualização do e-mail"
              />
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={() => setShowSendPreview(false)}>Fechar</Button>
              <Button variant="brand" size="sm" onClick={() => { setShowSendPreview(false); handleSend(); }}
                disabled={para.length === 0 || !assunto.trim()}>
                {mode === "forward" ? "Encaminhar" : "Enviar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
