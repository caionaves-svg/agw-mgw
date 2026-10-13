import { useEffect, useMemo, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import type { SuggestionProps } from "@tiptap/suggestion";
import {
  Smile,
  Plus,
  AtSign,
  SendHorizontal,
  Sparkles,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  Image,
  X,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Mic,
  Trash2,
  Pause,
  Play,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import AIEditingPanel from "../AIEditingPanel";
import MentionList from "./MentionList";
import { ReplyPreviewBar, ReplyTarget } from "../chat/ReplyPreviewBar";
import {
  PLATFORM_USERS,
  PlatformUser,
  searchPlatformUsers,
} from "../../data/platformUsers";
import "./comments.css";

export interface CommentPayload {
  html: string;
  text: string;
  mentions: PlatformUser[];
}

interface CommentInputProps {
  onSend: (payload: CommentPayload) => void;
  /** Habilita gravação de áudio (como no ChatInput); recebe a duração em segundos */
  onSendAudio?: (duration: number) => void;
  onCancel?: () => void;
  /** Comentário sendo respondido: exibe a faixa de resposta dentro do input (estilo WhatsApp) */
  replyingTo?: ReplyTarget | null;
  onCancelReply?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  showAI?: boolean;
  /** Variante enxuta (respostas): sem menu de anexos e sem IA */
  compact?: boolean;
  /** "sm": botões, ícones e texto menores (painéis laterais) */
  size?: "default" | "sm";
}

interface MentionState {
  items: PlatformUser[];
  rect: DOMRect | null;
  command: SuggestionProps<PlatformUser>["command"];
}

const EMOJIS = [
  "😀", "😂", "😊", "😍", "🤔", "😅", "😢", "😡",
  "👍", "👎", "👏", "🙏", "💪", "👀", "🎉", "🔥",
  "✅", "❌", "⚠️", "❗", "⏳", "📌", "📎", "💡",
];

const AI_ACTIONS = [
  { id: "melhorar", label: "Melhorar escrita", icon: Sparkles },
  { id: "corrigir", label: "Corrigir gramática", icon: CheckCheck },
  { id: "formalizar", label: "Tornar mais formal", icon: FileText },
  { id: "casualizar", label: "Tornar mais casual", icon: Smile },
  { id: "resumir", label: "Resumir texto", icon: ChevronDown },
  { id: "expandir", label: "Expandir texto", icon: ChevronUp },
];

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function getMentions(editor: Editor): PlatformUser[] {
  const ids = new Set<string>();
  editor.state.doc.descendants((node) => {
    if (node.type.name === "mention" && node.attrs.id) ids.add(node.attrs.id);
  });
  return PLATFORM_USERS.filter((u) => ids.has(u.id));
}

function FormatButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`h-7 w-7 flex items-center justify-center rounded-full transition-colors ${
        active
          ? "bg-primary text-white"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

// Input de comentário interno: mesma UI do ChatInput dos canais, com
// rich text (negrito, itálico, tachado, código) e menção de usuários (@).
export default function CommentInput({
  onSend,
  onSendAudio,
  onCancel,
  replyingTo,
  onCancelReply,
  placeholder = "Comentar... use @ para mencionar",
  autoFocus = false,
  showAI = true,
  compact = false,
  size = "default",
}: CommentInputProps) {
  const sm = size === "sm";
  const btn = sm ? "size-7" : undefined;
  const ic = sm ? "w-4 h-4" : "w-6 h-6";
  const ic2 = sm ? "w-4 h-4" : "w-5 h-5";

  const [hasContent, setHasContent] = useState(false);
  const [aiAction, setAiAction] = useState<string | null>(null);
  const [originalTextForAI, setOriginalTextForAI] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);

  // Gravação de áudio (mesmo comportamento do ChatInput)
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval>>();

  const startTimer = () => {
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };
  const stopTimer = () => {
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
  };

  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);
    startTimer();
  };
  const pauseRecording = () => {
    setIsPaused(true);
    stopTimer();
  };
  const resumeRecording = () => {
    setIsPaused(false);
    startTimer();
  };
  const cancelRecording = () => {
    stopTimer();
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
  };
  const sendRecording = () => {
    onSendAudio?.(recordingTime);
    cancelRecording();
  };

  useEffect(() => stopTimer, []);

  const canRecord = !!onSendAudio;
  // Alturas fixas por gravação, para a onda não "pular" a cada segundo
  const waveform = useMemo(
    () => Array.from({ length: sm ? 40 : 80 }, () => Math.random() * 60 + 20),
    [isRecording, sm],
  );

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  // Estado do popup de menção. Refs espelham o estado porque os callbacks
  // do Tiptap são criados uma única vez junto com o editor.
  const [mention, setMentionState] = useState<MentionState | null>(null);
  const [selectedIndex, setSelectedIndexState] = useState(0);
  const mentionRef = useRef<MentionState | null>(null);
  const selectedIndexRef = useRef(0);
  const sendRef = useRef<() => void>(() => {});
  const escapeRef = useRef<(() => void) | undefined>();
  const placeholderRef = useRef(placeholder);
  placeholderRef.current = placeholder;
  escapeRef.current = replyingTo ? onCancelReply : onCancel;

  const setMention = (m: MentionState | null) => {
    mentionRef.current = m;
    setMentionState(m);
  };
  const setSelectedIndex = (i: number) => {
    selectedIndexRef.current = i;
    setSelectedIndexState(i);
  };

  const selectUser = (user: PlatformUser) => {
    mentionRef.current?.command({ id: user.id, label: user.nome });
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        link: { openOnClick: false, autolink: true },
      }),
      Placeholder.configure({ placeholder: () => placeholderRef.current }),
      Mention.configure({
        HTMLAttributes: { class: "cv-mention" },
        renderText: ({ node }) => `@${node.attrs.label ?? node.attrs.id}`,
        suggestion: {
          char: "@",
          items: ({ query }) => searchPlatformUsers(query),
          render: () => {
            const sync = (props: SuggestionProps<PlatformUser>) =>
              setMention({
                items: props.items,
                rect: props.clientRect?.() ?? null,
                command: props.command,
              });
            return {
              onStart: (props) => {
                setSelectedIndex(0);
                sync(props);
              },
              onUpdate: (props) => {
                setSelectedIndex(0);
                sync(props);
              },
              onExit: () => setMention(null),
              onKeyDown: ({ event }) => {
                const m = mentionRef.current;
                if (!m) return false;
                if (event.key === "Escape") {
                  setMention(null);
                  return true;
                }
                if (!m.items.length) return false;
                if (event.key === "ArrowDown") {
                  setSelectedIndex((selectedIndexRef.current + 1) % m.items.length);
                  return true;
                }
                if (event.key === "ArrowUp") {
                  setSelectedIndex(
                    (selectedIndexRef.current - 1 + m.items.length) % m.items.length,
                  );
                  return true;
                }
                if (event.key === "Enter" || event.key === "Tab") {
                  const user = m.items[selectedIndexRef.current];
                  if (user) m.command({ id: user.id, label: user.nome });
                  return true;
                }
                return false;
              },
            };
          },
        },
      }),
    ],
    autofocus: autoFocus ? "end" : false,
    editorProps: {
      attributes: { class: "cv-comment-rich" },
      handleKeyDown: (_view, event) => {
        // Com o popup de menção aberto, o plugin de sugestão trata as teclas
        if (mentionRef.current) return false;
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          sendRef.current();
          return true;
        }
        if (event.key === "Escape" && escapeRef.current) {
          escapeRef.current();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => setHasContent(!editor.isEmpty),
  });

  const handleSend = () => {
    if (!editor || editor.isEmpty) return;
    onSend({
      html: editor.getHTML(),
      text: editor.getText().trim(),
      mentions: getMentions(editor),
    });
    editor.commands.clearContent(true);
    setHasContent(false);
  };
  sendRef.current = handleSend;

  // Ao escolher um comentário para responder, foca o editor
  useEffect(() => {
    if (!editor) return;
    // Força redesenhar o placeholder (lido de ref)
    editor.view.dispatch(editor.state.tr);
    if (replyingTo) editor.commands.focus("end");
  }, [replyingTo, placeholder, editor]);

  // Fecha o popup se o componente desmontar com ele aberto
  useEffect(() => () => setMention(null), []);

  const insertMentionTrigger = () => {
    if (!editor) return;
    const { from } = editor.state.selection;
    const prev = from > 1 ? editor.state.doc.textBetween(from - 1, from) : "";
    editor
      .chain()
      .focus()
      .insertContent(prev && !/\s/.test(prev) ? " @" : "@")
      .run();
  };

  const insertEmoji = (emoji: string) => {
    editor?.chain().focus().insertContent(emoji).run();
    setEmojiOpen(false);
  };

  const handleAIAction = (action: string) => {
    if (!editor) return;
    setAiAction(action);
    setOriginalTextForAI(editor.getText());
  };

  const handleAIAccept = (newText: string) => {
    if (editor) {
      const html = newText
        .split("\n")
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join("");
      editor.commands.setContent(html, { emitUpdate: true });
      editor.commands.focus("end");
    }
    setAiAction(null);
  };

  return (
    <div className={compact ? "" : sm ? "p-1.5" : "p-2"}>
      {/* Painel de IA - aparece por cima quando ativo */}
      {aiAction && (
        <div className="bg-card rounded-3xl px-2 py-2 mb-2 border border-border">
          <AIEditingPanel
            action={aiAction}
            originalText={originalTextForAI}
            onAccept={handleAIAccept}
            onCancel={() => setAiAction(null)}
          />
        </div>
      )}

      <div
        className={`flex flex-col bg-card border border-border focus-within:border-primary/50 transition-colors ${
          sm ? "rounded-2xl" : "rounded-3xl"
        }`}
      >
        {/* Faixa de resposta (estilo WhatsApp) */}
        {replyingTo && !isRecording && (
          <div className={sm ? "px-1.5 pt-1.5 -mb-1" : "px-2 pt-2 -mb-1"}>
            <ReplyPreviewBar replyingTo={replyingTo} onCancel={onCancelReply} />
          </div>
        )}

        <div className={`flex items-end ${sm ? "gap-0.5 px-1 py-1" : "gap-1 px-2 py-2"}`}>
        <TooltipProvider>
          {!isRecording ? (
            <>
          {/* Menu de anexos / ações */}
          {!compact && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className={btn}>
                      <Plus className={ic} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Anexar</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={insertMentionTrigger}>
                <AtSign className="w-4 h-4 mr-2 text-primary" />
                <span>Mencionar usuário</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => console.log("Anexar documento")}>
                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                <span>Documento</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log("Anexar imagem")}>
                <Image className="w-4 h-4 mr-2 text-purple-600" />
                <span>Imagens</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          )}

          {/* Emoji */}
          <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
            <PopoverTrigger asChild>
              <div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className={btn}>
                      <Smile className={ic} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Emoji</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="start"
              className="w-auto p-2 rounded-xl"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="grid grid-cols-8 gap-0.5">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="w-8 h-8 rounded-md text-lg hover:bg-muted transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Editor */}
          <div className={`flex-1 min-w-0 self-center cv-comment-editor ${sm ? "cv-comment-editor--sm" : ""}`}>
            <EditorContent editor={editor} />
          </div>

          {/* Toolbar de formatação ao selecionar texto */}
          {editor && (
            <BubbleMenu
              editor={editor}
              options={{ placement: "top", strategy: "fixed" }}
              appendTo={() => document.body}
              className="z-[100] flex items-center gap-0.5 bg-popover border border-border rounded-full shadow-lg p-1"
            >
              <FormatButton
                title="Negrito (Ctrl+B)"
                active={editor.isActive("bold")}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <Bold className="w-3.5 h-3.5" />
              </FormatButton>
              <FormatButton
                title="Itálico (Ctrl+I)"
                active={editor.isActive("italic")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <Italic className="w-3.5 h-3.5" />
              </FormatButton>
              <FormatButton
                title="Tachado (Ctrl+Shift+S)"
                active={editor.isActive("strike")}
                onClick={() => editor.chain().focus().toggleStrike().run()}
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </FormatButton>
              <FormatButton
                title="Código (Ctrl+E)"
                active={editor.isActive("code")}
                onClick={() => editor.chain().focus().toggleCode().run()}
              >
                <Code className="w-3.5 h-3.5" />
              </FormatButton>
            </BubbleMenu>
          )}

          {/* Editar com IA */}
          {showAI && !compact && hasContent && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost-secondary"
                        size="icon"
                        className={`transition-all animate-in fade-in zoom-in duration-200 ${btn ?? ""}`}
                      >
                        <Sparkles className={ic} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Editar com IA</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {AI_ACTIONS.map(({ id, label, icon: Icon }) => (
                  <DropdownMenuItem key={id} onClick={() => handleAIAction(id)}>
                    <Icon className="w-4 h-4 mr-2 text-secondary-500" />
                    <span>{label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Cancelar (respostas) */}
          {onCancel && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className={btn} onClick={onCancel}>
                  <X className={ic2} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Cancelar (Esc)</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Enviar / Microfone */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={hasContent ? "brand" : "ghost"}
                size="icon"
                className={btn}
                onClick={hasContent ? handleSend : canRecord ? startRecording : undefined}
                disabled={!hasContent && !canRecord}
              >
                {hasContent || !canRecord ? (
                  <SendHorizontal className={ic} />
                ) : (
                  <Mic className={ic} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>
                {hasContent || !canRecord
                  ? "Enviar comentário (Enter)"
                  : "Gravar áudio"}
              </p>
            </TooltipContent>
          </Tooltip>
            </>
          ) : (
            <>
              {/* UI DE GRAVAÇÃO */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={cancelRecording}
                    className={`text-destructive hover:text-destructive hover:bg-destructive/10 ${btn ?? ""}`}
                  >
                    <Trash2 className={ic2} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Cancelar gravação</p>
                </TooltipContent>
              </Tooltip>

              <div className={`flex-1 min-w-0 flex items-center gap-2 self-center ${sm ? "h-7" : "h-9"}`}>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className={`w-2.5 h-2.5 bg-red-500 rounded-full ${isPaused ? "" : "animate-pulse"}`} />
                    {!isPaused && (
                      <div className="absolute inset-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping opacity-75" />
                    )}
                  </div>
                  <span
                    className="font-mono text-foreground font-medium"
                    style={{ fontSize: sm ? 13 : "var(--text-sm)" }}
                  >
                    {formatTime(recordingTime)}
                  </span>
                </div>

                {/* Waveform animado */}
                <div className={`flex-1 min-w-0 flex items-center gap-0.5 ${sm ? "h-6" : "h-8"}`}>
                  {waveform.map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 bg-primary rounded-full ${isPaused ? "" : "animate-pulse"}`}
                      style={{
                        height: `${h}%`,
                        animationDelay: `${i * 50}ms`,
                        opacity: isPaused ? 0.5 : 1,
                      }}
                    />
                  ))}
                </div>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={btn}
                    onClick={isPaused ? resumeRecording : pauseRecording}
                  >
                    {isPaused ? <Play className={ic2} /> : <Pause className={ic2} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{isPaused ? "Continuar gravando" : "Pausar"}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="brand" size="icon" className={btn} onClick={sendRecording}>
                    <SendHorizontal className={ic} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Enviar áudio</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </TooltipProvider>
        </div>
      </div>

      {mention && (
        <MentionList
          items={mention.items}
          selectedIndex={selectedIndex}
          rect={mention.rect}
          onSelect={selectUser}
          onHover={setSelectedIndex}
        />
      )}
    </div>
  );
}
