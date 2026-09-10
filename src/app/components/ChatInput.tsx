import { useState, useRef, useEffect } from "react";
import {
  Smile,
  Plus,
  Mic,
  SendHorizontal,
  Sparkles,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  Image,
  Video,
  Music,
  FileType,
  Trash2,
  Pause,
  Play,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import AIEditingPanel from "./AIEditingPanel";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onSendAudio?: (duration: number) => void; // Callback para enviar áudio com duração em segundos
  onTypingChange?: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  showAttachments?: boolean;
  showEmoji?: boolean;
  showAI?: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  onSendAudio,
  onTypingChange,
  placeholder = "Digite uma mensagem...",
  disabled = false,
  showAttachments = true,
  showEmoji = true,
  showAI = true,
}: ChatInputProps) {
  const [isTyping, setIsTyping] = useState(false);
  const [aiAction, setAiAction] = useState<string | null>(null);
  const [originalTextForAI, setOriginalTextForAI] =
    useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Estados para gravação de áudio
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout>();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      // Se não há conteúdo, manter altura inicial (32px = h-8)
      if (!value.trim()) {
        textareaRef.current.style.height = "32px";
        textareaRef.current.style.overflowY = "hidden";
        return;
      }

      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = 18; // Altura da linha em px
      const padding = 16; // Padding total (8px top + 8px bottom)
      const minHeight = 32; // Altura mínima em px (h-8)
      const maxLines = 5;
      const maxHeight = lineHeight * maxLines + padding;

      // Calcula a altura final respeitando os limites mínimo e máximo
      const finalHeight = Math.max(
        minHeight,
        Math.min(scrollHeight, maxHeight),
      );

      textareaRef.current.style.height = `${finalHeight}px`;
      textareaRef.current.style.overflowY =
        scrollHeight > maxHeight ? "auto" : "hidden";
    }
  }, [value]);

  const handleTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Indicador de digitação
    if (newValue.trim() && !isTyping) {
      setIsTyping(true);
      onTypingChange?.(true);
    }

    // Clear timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Para de mostrar "digitando" após 3 segundos sem digitar
    if (newValue.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTypingChange?.(false);
      }, 3000);
    } else {
      setIsTyping(false);
      onTypingChange?.(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend();
      setIsTyping(false);
      onTypingChange?.(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleAIAction = (action: string) => {
    setAiAction(action);
    setOriginalTextForAI(value);
    // Aqui você pode chamar a API de IA
    // Por exemplo: onAIAction?.(action, value);
  };

  // Funções de gravação de áudio
  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);

    // Iniciar contador de tempo
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const pauseRecording = () => {
    setIsPaused(true);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    setIsPaused(false);
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const cancelRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };

  const sendRecording = () => {
    // Aqui você enviaria o áudio gravado
    console.log(`Enviando áudio de ${recordingTime} segundos`);
    if (onSendAudio) {
      onSendAudio(recordingTime);
    }

    // Resetar gravação
    cancelRecording();

    // ✅ RESET EXPLÍCITO da altura do textarea após enviar áudio
    if (textareaRef.current) {
      textareaRef.current.style.height = "32px";
      textareaRef.current.style.overflowY = "hidden";
    }
  };

  // Formatar tempo de gravação
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Limpar interval ao desmontar
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="p-2">
      {/* Painel de IA - aparece por cima quando ativo */}
      {aiAction && (
        <div className="bg-card rounded-3xl px-2 py-2 mb-2">
          <AIEditingPanel
            action={aiAction}
            originalText={originalTextForAI}
            onAccept={(newText) => {
              onChange(newText);
              setAiAction(null);
            }}
            onCancel={() => setAiAction(null)}
          />
        </div>
      )}

      {/* Input normal ou UI de gravação */}
      <div className="flex items-end gap-2 bg-card rounded-3xl px-2 py-2">
        <TooltipProvider>
          {!isRecording ? (
            <>
              {/* UI NORMAL - Quando não está gravando */}
              {/* Menu de anexos */}
              {showAttachments && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={disabled}
                          >
                            <Plus className="w-6 h-6" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Anexar arquivo</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-56"
                  >
                    <DropdownMenuItem
                      onClick={() =>
                        console.log("Enviar documento")
                      }
                    >
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      <span>Documento</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        console.log("Enviar imagem")
                      }
                    >
                      <Image className="w-4 h-4 mr-2 text-purple-600" />
                      <span>Imagens</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        console.log("Enviar vídeo")
                      }
                    >
                      <Video className="w-4 h-4 mr-2 text-red-600" />
                      <span>Vídeos</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        console.log("Enviar áudio")
                      }
                    >
                      <Music className="w-4 h-4 mr-2 text-green-600" />
                      <span>Áudios</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        console.log("Usar template")
                      }
                    >
                      <FileType className="w-4 h-4 mr-2 text-orange-600" />
                      <span>Templates</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Botão Emoji */}
              {showEmoji && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={disabled}
                    >
                      <Smile className="w-6 h-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Emoji</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Textarea */}
              <div className="flex-1 flex items-center">
                <textarea
                  ref={textareaRef}
                  value={value}
                  onChange={handleTextChange}
                  onKeyPress={handleKeyPress}
                  placeholder={placeholder}
                  disabled={disabled}
                  className="w-full resize-none h-8 min-h-8 bg-transparent border-0 px-2 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 transition-all duration-200 custom-scrollbar disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontSize: "var(--text-sm)" }}
                  rows={1}
                />
              </div>

              {/* Botão "Editar com IA" - aparece quando há texto digitado */}
              {showAI && value.trim() && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost-secondary"
                            size="icon"
                            className="transition-all animate-in fade-in zoom-in duration-200"
                            disabled={disabled}
                          >
                            <Sparkles className="w-6 h-6" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Editar com IA</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56"
                  >
                    <DropdownMenuItem
                      onClick={() => handleAIAction("melhorar")}
                    >
                      <Sparkles className="w-4 h-4 mr-2 text-secondary-500" />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          Melhorar escrita
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAIAction("corrigir")}
                    >
                      <CheckCheck className="w-4 h-4 mr-2 text-secondary-500" />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          Corrigir gramática
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleAIAction("formalizar")
                      }
                    >
                      <FileText className="w-4 h-4 mr-2 text-secondary-500" />
                      <span>Tornar mais formal</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleAIAction("casualizar")
                      }
                    >
                      <Smile className="w-4 h-4 mr-2 text-secondary-500" />
                      <span>Tornar mais casual</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAIAction("resumir")}
                    >
                      <ChevronDown className="w-4 h-4 mr-2 text-secondary-500" />
                      <span>Resumir texto</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAIAction("expandir")}
                    >
                      <ChevronUp className="w-4 h-4 mr-2 text-secondary-500" />
                      <span>Expandir texto</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Botão Enviar/Microfone */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={value.trim() ? "brand" : "ghost"}
                    size="icon"
                    onClick={
                      value.trim() ? handleSend : startRecording
                    }
                    disabled={disabled}
                  >
                    {value.trim() ? (
                      <SendHorizontal className="w-6 h-6" />
                    ) : (
                      <Mic className="w-6 h-6" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>
                    {value.trim()
                      ? "Enviar mensagem (Enter)"
                      : "Gravar áudio"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              {/* UI DE GRAVAÇÃO - Quando está gravando */}
              {/* Botão Lixeira */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={cancelRecording}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Cancelar gravação</p>
                </TooltipContent>
              </Tooltip>

              {/* Área central: Timer + Bullet + Waveform */}
              <div className="flex-1 flex items-center gap-2">
                {/* Timer com bullet piscando */}
                <div className="flex items-center gap-2">
                  {!isPaused && (
                    <div className="relative">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                      <div className="absolute inset-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping opacity-75" />
                    </div>
                  )}
                  {isPaused && (
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                  )}
                  <span
                    className="font-mono text-foreground font-medium min-w-[3rem]"
                    style={{ fontSize: "var(--text-sm)" }}
                  >
                    {formatTime(recordingTime)}
                  </span>
                </div>

                {/* Waveform animado */}
                <div className="flex-1 flex items-center gap-0.5 h-8">
                  {Array.from({ length: 120 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 bg-primary rounded-full transition-all ${
                        !isPaused ? "animate-pulse" : ""
                      }`}
                      style={{
                        height: `${Math.random() * 60 + 20}%`,
                        animationDelay: `${i * 50}ms`,
                        animationDuration: `${800 + Math.random() * 400}ms`,
                        opacity: isPaused ? 0.5 : 1,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Botão Pausar/Continuar */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={
                      isPaused
                        ? resumeRecording
                        : pauseRecording
                    }
                  >
                    {isPaused ? (
                      <Play className="w-5 h-5" />
                    ) : (
                      <Pause className="w-5 h-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>
                    {isPaused ? "Continuar gravando" : "Pausar"}
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Botão Enviar */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="brand"
                    size="icon"
                    onClick={sendRecording}
                  >
                    <SendHorizontal className="w-6 h-6" />
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
  );
}