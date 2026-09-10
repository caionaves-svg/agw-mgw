import {
  useEditor,
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/core";
import { useEffect, useRef, useState } from "react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import FontFamily from "@tiptap/extension-font-family";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Undo,
  Redo,
  Code,
  Eye,
  Quote,
  Minus,
  Type,
  Upload,
  FileImage,
  Paperclip,
} from "lucide-react";

// ─── Cores predefinidas ───────────────────────────────────────────────────────
const PRESET_COLORS = [
  "#000000", "#374151", "#6b7280", "#9ca3af",
  "#ffffff", "#f9fafb", "#f3f4f6", "#e5e7eb",
  "#d4183d", "#ef4444", "#f97316", "#f59e0b",
  "#16a34a", "#22c55e", "#00bcf2", "#3b82f6",
  "#7850cb", "#8b5cf6", "#ec4899", "#162533",
];

// ─── Extensão de imagem redimensionável ──────────────────────────────────────
function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const [isResizing, setIsResizing] = useState(false);

  const currentWidth: number | null = node.attrs.width ?? null;

  const startResize = (e: React.MouseEvent, dir: "right" | "left") => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startX.current = e.clientX;
    startWidth.current = currentWidth ?? (imgRef.current?.offsetWidth ?? 300);

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX.current;
      const next = Math.max(60, startWidth.current + (dir === "right" ? delta : -delta));
      updateAttributes({ width: Math.round(next) });
    };

    const onUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <NodeViewWrapper
      className="inline-block relative my-1 align-top"
      style={{ userSelect: isResizing ? "none" : undefined }}
    >
      <img
        ref={imgRef}
        src={node.attrs.src}
        alt={node.attrs.alt ?? ""}
        style={{
          width: currentWidth ? `${currentWidth}px` : "auto",
          maxWidth: "100%",
          display: "block",
        }}
        className={`rounded transition-shadow ${
          selected ? "ring-2 ring-[#00bcf2] ring-offset-1 shadow-lg" : ""
        }`}
        draggable={false}
      />

      {/* Handles de resize — só visíveis quando selecionado */}
      {selected && (
        <>
          {/* Handle esquerda */}
          <div
            onMouseDown={(e) => startResize(e, "left")}
            className="absolute top-1/2 -left-2 -translate-y-1/2 w-3 h-8 bg-white border-2 border-[#00bcf2] rounded cursor-ew-resize z-20 flex items-center justify-center shadow"
          >
            <div className="w-0.5 h-3 bg-[#00bcf2] rounded" />
          </div>
          {/* Handle direita */}
          <div
            onMouseDown={(e) => startResize(e, "right")}
            className="absolute top-1/2 -right-2 -translate-y-1/2 w-3 h-8 bg-white border-2 border-[#00bcf2] rounded cursor-ew-resize z-20 flex items-center justify-center shadow"
          >
            <div className="w-0.5 h-3 bg-[#00bcf2] rounded" />
          </div>
          {/* Handle canto inferior direito */}
          <div
            onMouseDown={(e) => startResize(e, "right")}
            className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-[#00bcf2] rounded-sm cursor-se-resize z-20 shadow"
          />
          {/* Badge de tamanho */}
          <div className="absolute -top-6 left-0 bg-[#00bcf2] text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow whitespace-nowrap pointer-events-none">
            {currentWidth ? `${currentWidth}px` : "auto"}
          </div>
        </>
      )}
    </NodeViewWrapper>
  );
}

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => {
          const w = el.getAttribute("width") ?? el.style.width?.replace("px", "");
          return w ? parseInt(w, 10) : null;
        },
        renderHTML: (attrs) =>
          attrs.width ? { width: attrs.width, style: `width:${attrs.width}px;max-width:100%` } : {},
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

// ─── Sub-componentes de toolbar ───────────────────────────────────────────────
function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`h-7 w-7 flex items-center justify-center rounded text-[12px] transition-colors flex-shrink-0 ${
        active
          ? "bg-[#00bcf2] text-white"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  );
}

function ToolbarSep() {
  return <div className="w-px h-5 bg-border mx-0.5 flex-shrink-0" />;
}

// ─── Utilitário: ler arquivo como base64 ─────────────────────────────────────
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface RichEmailEditorProps {
  value: string;
  onChange: (html: string) => void;
  onAttach?: (files: File[]) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function RichEmailEditor({
  value,
  onChange,
  onAttach,
  placeholder = "Digite sua mensagem...",
  minHeight = 0,
  className = "",
}: RichEmailEditorProps) {
  const [mode, setMode] = useState<"visual" | "html" | "preview">("visual");
  const [htmlSource, setHtmlSource] = useState(value);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragHasImage, setDragHasImage] = useState(false);
  const [dragZone, setDragZone] = useState<"attach" | "insert" | null>(null);
  const dragCounter = useRef(0);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, underline: false, link: false }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-[#00bcf2] underline" } }),
      ResizableImage.configure({ allowBase64: true }),
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlSource(html);
      onChange(html);
    },
    editorProps: { attributes: { class: "focus:outline-none" } },
  });

  // Sincronizar valor externo
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
      setHtmlSource(value || "");
    }
  }, [value]);

  const handleModeChange = (next: "visual" | "html" | "preview") => {
    if (mode === "html" && editor) {
      editor.commands.setContent(htmlSource, false);
      onChange(htmlSource);
    }
    setMode(next);
    setShowColorPicker(false);
  };

  const handleInsertLink = () => {
    if (!editor || !linkUrl) return;
    editor.chain().focus().setLink({ href: linkUrl }).run();
    setLinkUrl("");
    setShowLinkDialog(false);
  };

  const handleInsertTable = (rows: number, cols: number) => {
    editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setShowTableMenu(false);
  };

  // Inserir imagem de arquivo
  const insertImageFile = async (file: File) => {
    if (!editor || !file.type.startsWith("image/")) return;
    const dataUrl = await readFileAsDataURL(file);
    editor.chain().focus().setImage({ src: dataUrl }).run();
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const f of files) await insertImageFile(f);
    e.target.value = "";
  };

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    const hasImage = Array.from(e.dataTransfer.items).some(
      (item) => item.kind === "file" && item.type.startsWith("image/")
    );
    setDragHasImage(hasImage);
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
      setDragZone(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  // Drop nas zonas específicas
  const handleDropZone = async (e: React.DragEvent, zone: "attach" | "insert") => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    setDragZone(null);

    const files = Array.from(e.dataTransfer.files);

    if (zone === "insert") {
      const images = files.filter((f) => f.type.startsWith("image/"));
      for (const img of images) await insertImageFile(img);
    } else {
      if (onAttach) onAttach(files);
    }
  };

  // Drop fora das zonas (fallback)
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    setDragZone(null);
  };

  const closeDropdowns = () => {
    setShowColorPicker(false);
    setShowLinkDialog(false);
    setShowTableMenu(false);
  };

  const currentHeading = editor?.isActive("heading", { level: 1 })
    ? "Título 1"
    : editor?.isActive("heading", { level: 2 })
    ? "Título 2"
    : editor?.isActive("heading", { level: 3 })
    ? "Título 3"
    : "Normal";

  return (
    <div
      className={`flex flex-col border border-border rounded-lg overflow-hidden bg-background ${className}`}
    >
      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30 flex-shrink-0">

        {/* Toggle Editor / HTML / Preview */}
        <div className="flex items-center bg-muted rounded p-0.5 mr-1">
          {(["visual", "html", "preview"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleModeChange(m)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors ${
                mode === m ? "bg-background shadow-sm text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "visual" && <Type className="w-3 h-3" />}
              {m === "html" && <Code className="w-3 h-3" />}
              {m === "preview" && <Eye className="w-3 h-3" />}
              {m === "visual" ? "Editor" : m === "html" ? "HTML" : "Preview"}
            </button>
          ))}
        </div>

        {mode === "visual" && editor && (
          <>
            <ToolbarSep />

            {/* Heading */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1 h-7 px-2 rounded text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <span className="w-14 text-left">{currentHeading}</span>
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <div className="absolute top-8 left-0 bg-background border border-border rounded-lg shadow-lg z-50 w-32 overflow-hidden opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
                {[{ label: "Normal", v: 0 }, { label: "Título 1", v: 1 }, { label: "Título 2", v: 2 }, { label: "Título 3", v: 3 }].map((h) => (
                  <button key={h.v} type="button"
                    onClick={() => h.v === 0 ? editor.chain().focus().setParagraph().run() : editor.chain().focus().setHeading({ level: h.v as 1|2|3 }).run()}
                    className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-muted transition-colors"
                  >{h.label}</button>
                ))}
              </div>
            </div>

            <ToolbarSep />

            {/* Formatação */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Negrito (Ctrl+B)"><Bold className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Itálico (Ctrl+I)"><Italic className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Sublinhado (Ctrl+U)"><UnderlineIcon className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Tachado"><Strikethrough className="w-3.5 h-3.5" /></ToolbarButton>

            <ToolbarSep />

            {/* Alinhamento */}
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Esquerda"><AlignLeft className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Centro"><AlignCenter className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Direita"><AlignRight className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justificar"><AlignJustify className="w-3.5 h-3.5" /></ToolbarButton>

            <ToolbarSep />

            {/* Listas */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Lista com marcadores"><List className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Lista numerada"><ListOrdered className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Citação"><Quote className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Divisória"><Minus className="w-3.5 h-3.5" /></ToolbarButton>

            <ToolbarSep />

            {/* Cor do texto */}
            <div className="relative">
              <button type="button" title="Cor do texto"
                onClick={() => { setShowColorPicker(!showColorPicker); setShowLinkDialog(false); setShowTableMenu(false); }}
                className="h-7 w-7 flex flex-col items-center justify-center rounded hover:bg-muted transition-colors gap-0.5"
              >
                <span className="text-[11px] font-bold text-foreground leading-none">A</span>
                <span className="h-1 w-4 rounded-sm" style={{ backgroundColor: editor.getAttributes("textStyle").color || "#000000" }} />
              </button>
              {showColorPicker && (
                <div className="absolute top-8 left-0 bg-background border border-border rounded-lg shadow-lg z-50 p-2 w-[152px]">
                  <p className="text-[10px] text-muted-foreground mb-1.5">Cor do texto</p>
                  <div className="grid grid-cols-5 gap-1">
                    {PRESET_COLORS.map((c) => (
                      <button key={c} type="button" title={c}
                        onClick={() => { editor.chain().focus().setColor(c).run(); setShowColorPicker(false); }}
                        className="w-5 h-5 rounded-sm border border-border hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <button type="button" onClick={() => { editor.chain().focus().unsetColor().run(); setShowColorPicker(false); }}
                    className="mt-2 w-full text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                    Remover cor
                  </button>
                </div>
              )}
            </div>

            <ToolbarSep />

            {/* Link */}
            <div className="relative">
              <ToolbarButton
                onClick={() => {
                  if (editor.isActive("link")) { editor.chain().focus().unsetLink().run(); return; }
                  setLinkUrl(editor.getAttributes("link").href || "");
                  setShowLinkDialog(!showLinkDialog);
                  setShowColorPicker(false);
                  setShowTableMenu(false);
                }}
                active={editor.isActive("link")} title="Inserir link"
              >
                <LinkIcon className="w-3.5 h-3.5" />
              </ToolbarButton>
              {showLinkDialog && (
                <div className="absolute top-8 left-0 bg-background border border-border rounded-lg shadow-lg z-50 p-3 w-64">
                  <p className="text-[11px] font-medium mb-2">Inserir link</p>
                  <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-[12px] border border-border rounded px-2 py-1.5 bg-background mb-2 outline-none focus:border-[#00bcf2]"
                    onKeyDown={(e) => { if (e.key === "Enter") handleInsertLink(); if (e.key === "Escape") setShowLinkDialog(false); }}
                    autoFocus
                  />
                  <div className="flex gap-1.5">
                    <button type="button" onClick={handleInsertLink} className="flex-1 text-[11px] bg-[#00bcf2] text-white rounded py-1 hover:opacity-90">Inserir</button>
                    <button type="button" onClick={() => setShowLinkDialog(false)} className="flex-1 text-[11px] border border-border rounded py-1 hover:bg-muted">Cancelar</button>
                  </div>
                </div>
              )}
            </div>

            {/* Upload de imagem */}
            <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageFileChange} />
            <ToolbarButton onClick={() => imageInputRef.current?.click()} active={false} title="Inserir imagem do computador">
              <FileImage className="w-3.5 h-3.5" />
            </ToolbarButton>

            {/* Tabela */}
            <div className="relative">
              <ToolbarButton onClick={() => { setShowTableMenu(!showTableMenu); setShowColorPicker(false); setShowLinkDialog(false); }} active={editor.isActive("table")} title="Inserir tabela">
                <TableIcon className="w-3.5 h-3.5" />
              </ToolbarButton>
              {showTableMenu && (
                <div className="absolute top-8 left-0 bg-background border border-border rounded-lg shadow-lg z-50 p-3 w-44">
                  <p className="text-[11px] font-semibold mb-2">Nova tabela</p>
                  <div className="flex flex-col gap-1 mb-2">
                    {[2, 3, 4, 5].map((r) => [2, 3, 4].map((c) => (
                      <button key={`${r}x${c}`} type="button" onClick={() => handleInsertTable(r, c)}
                        className="text-left text-[11px] px-2 py-1 hover:bg-muted rounded transition-colors">
                        {r} × {c} colunas
                      </button>
                    )))}
                  </div>
                  {editor.isActive("table") && (
                    <div className="border-t border-border pt-2 flex flex-col gap-1">
                      <button type="button" onClick={() => { editor.chain().focus().addRowAfter().run(); setShowTableMenu(false); }} className="text-left text-[11px] px-2 py-1 hover:bg-muted rounded">+ Linha abaixo</button>
                      <button type="button" onClick={() => { editor.chain().focus().addColumnAfter().run(); setShowTableMenu(false); }} className="text-left text-[11px] px-2 py-1 hover:bg-muted rounded">+ Coluna à direita</button>
                      <button type="button" onClick={() => { editor.chain().focus().deleteRow().run(); setShowTableMenu(false); }} className="text-left text-[11px] px-2 py-1 hover:bg-muted rounded text-red-500">− Remover linha</button>
                      <button type="button" onClick={() => { editor.chain().focus().deleteColumn().run(); setShowTableMenu(false); }} className="text-left text-[11px] px-2 py-1 hover:bg-muted rounded text-red-500">− Remover coluna</button>
                      <button type="button" onClick={() => { editor.chain().focus().deleteTable().run(); setShowTableMenu(false); }} className="text-left text-[11px] px-2 py-1 hover:bg-muted rounded text-red-600 font-medium">✕ Excluir tabela</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <ToolbarSep />

            {/* Undo / Redo */}
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Desfazer (Ctrl+Z)"><Undo className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Refazer (Ctrl+Y)"><Redo className="w-3.5 h-3.5" /></ToolbarButton>
          </>
        )}
      </div>

      {/* ── Área do editor com drag & drop ───────────────────────────────────── */}
      <div
        className="relative flex-1"
        style={{ minHeight: minHeight || 240 }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Editor visual */}
        {mode === "visual" && (
          <EditorContent
            editor={editor}
            className="h-full"
            style={{ minHeight: minHeight || 240 }}
            onClick={closeDropdowns}
          />
        )}

        {/* HTML source */}
        {mode === "html" && (
          <textarea
            value={htmlSource}
            onChange={(e) => setHtmlSource(e.target.value)}
            className="w-full h-full p-3 font-mono text-[12px] bg-background text-foreground resize-none outline-none"
            style={{ minHeight: minHeight || 240 }}
            spellCheck={false}
          />
        )}

        {/* Preview iframe */}
        {mode === "preview" && (
          <iframe
            srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:20px;font-family:Arial,sans-serif;font-size:14px;line-height:1.6}table{border-collapse:collapse;width:100%}td,th{border:1px solid #e5e7eb;padding:8px 12px}img{max-width:100%;height:auto}a{color:#00bcf2}</style></head><body>${htmlSource}</body></html>`}
            className="w-full border-0"
            style={{ minHeight: minHeight || 240, height: "100%" }}
            sandbox="allow-same-origin"
            title="Preview do e-mail"
          />
        )}

        {/* ── Overlay duas zonas estilo Outlook ─────────────────────────── */}
        {isDragging && (
          <div className="absolute inset-0 z-30 flex items-stretch p-4 gap-3">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#001318]/40 backdrop-blur-[2px]" />

            {/* ── Zona esquerda: Anexar ── */}
            <div
              className={`relative flex-1 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-copy transition-all duration-150 ${
                dragZone === "attach"
                  ? "border-[#00bcf2] bg-[#00bcf2]/15 scale-[1.01]"
                  : "border-white/40 bg-white/8 hover:border-[#00bcf2]/60"
              }`}
              onDragEnter={() => setDragZone("attach")}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => handleDropZone(e, "attach")}
            >
              {/* Ícone */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                dragZone === "attach" ? "bg-[#00bcf2] shadow-lg shadow-[#00bcf2]/40" : "bg-white/15"
              }`}>
                <Paperclip className={`w-7 h-7 transition-colors ${dragZone === "attach" ? "text-white" : "text-white/70"}`} strokeWidth={1.5} />
              </div>

              {/* Texto */}
              <div className="text-center px-4">
                <p className={`text-[15px] font-semibold transition-colors ${dragZone === "attach" ? "text-white" : "text-white/80"}`}>
                  Anexar ao e-mail
                </p>
                <p className="text-[12px] text-white/50 mt-1">
                  O arquivo aparece como anexo
                </p>
              </div>

              {/* Tipos suportados */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 px-4">
                {["PDF", "DOCX", "XLSX", "PNG", "JPG", "ZIP", "+ outros"].map((t) => (
                  <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/20">{t}</span>
                ))}
              </div>

              {/* Indicador de ativo */}
              {dragZone === "attach" && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12l7 7 7-7"/>
                  </svg>
                </div>
              )}
            </div>

            {/* ── Divisor central ── */}
            <div className="relative flex items-center justify-center flex-shrink-0 w-8">
              <div className="absolute inset-y-4 w-px bg-white/20" />
              <div className="relative bg-white/10 text-white/50 text-[11px] font-medium px-2 py-1 rounded-full border border-white/20 z-10">
                ou
              </div>
            </div>

            {/* ── Zona direita: Inserir no corpo ── */}
            <div
              className={`relative flex-1 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed transition-all duration-150 ${
                !dragHasImage
                  ? "border-white/20 bg-white/5 opacity-50 cursor-not-allowed"
                  : dragZone === "insert"
                  ? "border-[#00bcf2] bg-[#00bcf2]/15 scale-[1.01] cursor-copy"
                  : "border-white/40 bg-white/8 hover:border-[#00bcf2]/60 cursor-copy"
              }`}
              onDragEnter={() => dragHasImage && setDragZone("insert")}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => dragHasImage ? handleDropZone(e, "insert") : e.preventDefault()}
            >
              {/* Ícone */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                dragZone === "insert" && dragHasImage ? "bg-[#00bcf2] shadow-lg shadow-[#00bcf2]/40" : "bg-white/15"
              }`}>
                <FileImage className={`w-7 h-7 transition-colors ${dragZone === "insert" && dragHasImage ? "text-white" : "text-white/70"}`} strokeWidth={1.5} />
              </div>

              {/* Texto */}
              <div className="text-center px-4">
                <p className={`text-[15px] font-semibold transition-colors ${dragZone === "insert" && dragHasImage ? "text-white" : "text-white/80"}`}>
                  Inserir no corpo
                </p>
                <p className="text-[12px] mt-1 text-white/50">
                  {dragHasImage ? "A imagem aparece inline no e-mail" : "Apenas imagens podem ser inseridas"}
                </p>
              </div>

              {/* Tipos suportados */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 px-4">
                {["PNG", "JPG", "GIF", "WEBP", "SVG"].map((t) => (
                  <span key={t} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                    dragHasImage ? "bg-white/10 text-white/60 border-white/20" : "bg-white/5 text-white/30 border-white/10"
                  }`}>{t}</span>
                ))}
              </div>

              {/* Badge: somente imagens */}
              {!dragHasImage && (
                <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5">
                  <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
                  </svg>
                  <span className="text-[11px] text-white/40">Somente imagens</span>
                </div>
              )}

              {/* Indicador de ativo */}
              {dragZone === "insert" && dragHasImage && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12l7 7 7-7"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Estilos Tiptap */}
      <style>{`
        .tiptap { padding: 14px 16px; outline: none; font-size: 14px; line-height: 1.65; color: var(--foreground); }
        .tiptap p { margin: 0 0 0.75em; }
        .tiptap p:last-child { margin-bottom: 0; }
        .tiptap h1 { font-size: 1.5em; font-weight: 700; margin: 0.75em 0 0.4em; }
        .tiptap h2 { font-size: 1.25em; font-weight: 600; margin: 0.75em 0 0.4em; }
        .tiptap h3 { font-size: 1.1em; font-weight: 600; margin: 0.75em 0 0.4em; }
        .tiptap ul { list-style-type: disc; padding-left: 1.5em; margin: 0.5em 0; }
        .tiptap ol { list-style-type: decimal; padding-left: 1.5em; margin: 0.5em 0; }
        .tiptap li { margin: 0.2em 0; }
        .tiptap blockquote { border-left: 3px solid #00bcf2; padding-left: 1em; color: var(--muted-foreground); margin: 0.75em 0; background: #e6f7fd20; border-radius: 0 4px 4px 0; }
        .tiptap hr { border: none; border-top: 1px solid var(--border); margin: 1.25em 0; }
        .tiptap table { width: 100%; border-collapse: collapse; margin: 0.75em 0; font-size: 0.9em; }
        .tiptap th { background: var(--muted); font-weight: 600; text-align: left; padding: 8px 12px; border: 1px solid var(--border); }
        .tiptap td { padding: 8px 12px; border: 1px solid var(--border); }
        .tiptap .selectedCell { background: #e6f7fd; }
        .tiptap p.is-editor-empty:first-child::before { color: var(--muted-foreground); content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
        .tiptap code { background: var(--muted); border-radius: 3px; padding: 2px 5px; font-size: 0.875em; font-family: monospace; }
        .tiptap pre { background: var(--muted); padding: 12px 16px; border-radius: 6px; overflow-x: auto; }
        .tiptap a { color: #00bcf2; text-decoration: underline; }
        .tiptap img { max-width: 100%; height: auto; }
      `}</style>
    </div>
  );
}
