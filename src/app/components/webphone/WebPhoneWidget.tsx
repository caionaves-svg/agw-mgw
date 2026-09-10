import { Phone, Mic, MicOff, PhoneOff, MoreVertical, Grip, X } from "lucide-react";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { Input } from "../ui/input";
import SpectrumIcon from "../SpectrumIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import WebPhoneMenu from "./WebPhoneMenu";
import { useState } from "react";

// ==========================================
// TIPOS E INTERFACES
// ==========================================

export type WebPhoneState =
  | "login" // Login inicial
  | "idle" // Pronto para ligar (sem número)
  | "ready" // Pronto para ligar (com número)
  | "auto-answer-countdown" // Contagem regressiva para atender automaticamente
  | "outgoing" // Ligando (fazendo chamada)
  | "incoming" // Recebendo chamada
  | "in-call"; // Em chamada ativa

export interface WebPhoneWidgetProps {
  state: WebPhoneState;
  phoneNumber?: string;
  timer?: string; // "00:10" ou "00:00:04"
  onLogin?: () => void;
  onCall?: () => void;
  onAnswer?: () => void;
  onHangup?: () => void;
  onMute?: () => void;
  onDialpad?: () => void;
  onMore?: () => void;
  hasMicrophonePermission?: boolean;
  onRequestMicPermission?: () => void;
  onPhoneNumberChange?: (value: string) => void; // Nova prop para mudança de número
  isMuted?: boolean; // Estado de mute
}

// ==========================================
// COMPONENTES DE ESTADO
// ==========================================

// Estado: Login
function LoginState({ onLogin, hasMicrophonePermission, onRequestMicPermission }: Pick<WebPhoneWidgetProps, "onLogin" | "hasMicrophonePermission" | "onRequestMicPermission">) {
  return (
    <div className="bg-muted py-2 pl-4 pr-2 rounded-full flex items-center gap-3 shrink-0 h-11">
      {/* Ícone + Texto */}
      <div className="flex items-center gap-2">
        <Phone className="size-4 text-muted-foreground" />
        <Text variant="sm" className="text-muted-foreground whitespace-nowrap">
          Faça login para atendimentos de voz
        </Text>
      </div>

      {/* Botão Acessar */}
      <Button onClick={onLogin} variant="brand" size="sm" className="h-7 px-3">
        Acessar
      </Button>

      {/* Ícone de microfone bloqueado (condicional) */}
      {hasMicrophonePermission === false && onRequestMicPermission && (
        <button
          onClick={onRequestMicPermission}
          className="relative flex items-center justify-center"
          title="Permissão de microfone necessária"
        >
          <div className="flex items-center justify-center size-8 rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors">
            <Mic className="size-4 text-destructive" />
          </div>
        </button>
      )}
    </div>
  );
}

// Estado: Idle (sem número)
function IdleState({ onDialpad, phoneNumber, onPhoneNumberChange, onCall }: Pick<WebPhoneWidgetProps, "onDialpad" | "phoneNumber" | "onPhoneNumberChange" | "onCall">) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [keypadOpen, setKeypadOpen] = useState(false);

  // Função para formatar número de telefone no padrão brasileiro
  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");
    
    // Formata no padrão brasileiro
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 9) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onPhoneNumberChange?.(formatted);
  };

  // Função para adicionar dígito ao número
  const handleKeypadInput = (digit: string) => {
    const currentNumbers = (phoneNumber || "").replace(/\D/g, "");
    const newNumber = currentNumbers + digit;
    const formatted = formatPhoneNumber(newNumber);
    onPhoneNumberChange?.(formatted);
  };

  // Função para remover último dígito
  const handleBackspace = () => {
    const currentNumbers = (phoneNumber || "").replace(/\D/g, "");
    const newNumber = currentNumbers.slice(0, -1);
    const formatted = formatPhoneNumber(newNumber);
    onPhoneNumberChange?.(formatted);
  };

  // Função para ligar do keypad
  const handleKeypadCall = () => {
    if (hasNumber) {
      setKeypadOpen(false);
      onCall?.();
    }
  };

  const hasNumber = phoneNumber && phoneNumber.replace(/\D/g, "").length >= 10;

  return (
    <div className="bg-muted px-2 py-2 rounded-full flex items-center gap-2 shrink-0 h-11">
      {/* Input de número */}
      <div className="pl-2 flex-1">
        <Input
          type="tel"
          value={phoneNumber || ""}
          onChange={handleInputChange}
          placeholder="Insira um número"
          className="h-7 border-0 bg-transparent px-0 text-sm text-muted-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-0"
          maxLength={19} // (34) 9 9999-9999
        />
      </div>

      {/* Botões */}
      <div className="flex items-center gap-[3.5px]">
        {/* Botão Keypad (Grip) */}
        <Popover open={keypadOpen} onOpenChange={setKeypadOpen}>
          <PopoverTrigger asChild>
            <button
              className="bg-card border border-card rounded-full p-[9px] flex items-center justify-center hover:bg-muted transition-colors"
              title="Teclado numérico"
            >
              <Grip className="size-3.5 text-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent 
            align="end" 
            side="top"
            className="w-[200px] p-4"
          >
            {/* Grid de números */}
            <div className="space-y-3">
              {/* Linha 1-2-3 */}
              <div className="grid grid-cols-3 gap-3">
                {["1", "2", "3"].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleKeypadInput(num)}
                    className="h-12 bg-card border border-card rounded-full flex items-center justify-center text-lg font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Linha 4-5-6 */}
              <div className="grid grid-cols-3 gap-3">
                {["4", "5", "6"].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleKeypadInput(num)}
                    className="h-12 bg-card border border-card rounded-full flex items-center justify-center text-lg font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Linha 7-8-9 */}
              <div className="grid grid-cols-3 gap-3">
                {["7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleKeypadInput(num)}
                    className="h-12 bg-card border border-card rounded-full flex items-center justify-center text-lg font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Linha *-0-# */}
              <div className="grid grid-cols-3 gap-3">
                {["*", "0", "#"].map((char) => (
                  <button
                    key={char}
                    onClick={() => handleKeypadInput(char)}
                    className="h-12 bg-card border border-card rounded-full flex items-center justify-center text-lg font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    {char}
                  </button>
                ))}
              </div>

              {/* Linha + (centralizado) */}
              <div className="flex justify-center">
                <button
                  onClick={() => handleKeypadInput("+")}
                  className="w-16 h-12 bg-card border border-card rounded-full flex items-center justify-center text-lg font-medium text-foreground hover:bg-muted transition-colors"
                >
                  +
                </button>
              </div>

              {/* Botões de ação */}
              <div className="flex items-center justify-center gap-3 pt-2">
                {/* Botão Ligar (verde) */}
                <button
                  onClick={handleKeypadCall}
                  disabled={!hasNumber}
                  className={`rounded-full p-3 flex items-center justify-center transition-colors ${
                    hasNumber
                      ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                      : "bg-green-600/40 cursor-not-allowed"
                  }`}
                  title={hasNumber ? "Ligar" : "Insira um número primeiro"}
                >
                  <Phone className="size-5 text-white" />
                </button>

                {/* Botão Backspace (cinza) - só aparece se tem número */}
                {phoneNumber && phoneNumber.replace(/\D/g, "").length > 0 && (
                  <button
                    onClick={handleBackspace}
                    className="rounded-full p-3 flex items-center justify-center bg-card border border-card hover:bg-muted transition-colors"
                    title="Apagar último dígito"
                  >
                    <X className="size-5 text-foreground" />
                  </button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Botão Call (ativo quando tem número válido) */}
        <button
          onClick={hasNumber ? onCall : undefined}
          disabled={!hasNumber}
          className={`rounded-full p-2 flex items-center justify-center transition-colors ${
            hasNumber
              ? "bg-green-600 hover:bg-green-700 cursor-pointer"
              : "bg-green-600/60 opacity-60 cursor-not-allowed"
          }`}
          title={hasNumber ? "Ligar" : "Insira um número primeiro"}
        >
          <Phone className="size-4 text-white" />
        </button>

        {/* Menu Dropdown */}
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className="bg-card border border-card rounded-full p-[9px] flex items-center justify-center hover:bg-muted transition-colors"
              title="Opções do WebPhone"
            >
              <MoreVertical className="size-3.5 text-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="p-0">
            <WebPhoneMenu
              onClose={() => setMenuOpen(false)}
              onLogout={() => {
                console.log("Deslogar WebPhone");
                setMenuOpen(false);
              }}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Estado: Ready (com número)
function ReadyState({ phoneNumber, onCall, onDialpad }: Pick<WebPhoneWidgetProps, "phoneNumber" | "onCall" | "onDialpad">) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-muted px-2 py-2 rounded-full flex items-center gap-2 shrink-0 h-11">
      {/* Número de telefone */}
      <div className="pl-2">
        <Text variant="sm" className="text-muted-foreground">
          {phoneNumber || "+55 (34) 9 9999-9999"}
        </Text>
      </div>

      {/* Botões */}
      <div className="flex items-center gap-[3.5px]">
        {/* Botão Call (ativo) */}
        <button
          onClick={onCall}
          className="bg-green-600 rounded-full p-2 flex items-center justify-center hover:bg-green-700 transition-colors"
          title="Ligar"
        >
          <Phone className="size-4 text-white" />
        </button>

        {/* Menu Dropdown */}
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className="bg-card border border-card rounded-full p-[9px] flex items-center justify-center hover:bg-muted transition-colors"
              title="Opções do WebPhone"
            >
              <MoreVertical className="size-3.5 text-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="p-0">
            <WebPhoneMenu
              onClose={() => setMenuOpen(false)}
              onLogout={() => {
                console.log("Deslogar WebPhone");
                setMenuOpen(false);
              }}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Estado: Auto-answer Countdown
function AutoAnswerState({ timer }: Pick<WebPhoneWidgetProps, "timer">) {
  return (
    <div className="bg-muted px-2 py-2 rounded-full flex items-center shrink-0 h-11">
      <div className="flex items-center gap-2 pl-2">
        <Phone className="size-4 text-muted-foreground" />
        <Text variant="sm" className="text-muted-foreground">
          Atendendo a chamada em:{" "}
        </Text>
        <Text variant="sm" className="text-brand-primary font-bold pr-2">
          {timer || "00:10"}
        </Text>
      </div>
    </div>
  );
}

// Estado: Outgoing (ligando)
function OutgoingState({ onHangup, onMute, onDialpad }: Pick<WebPhoneWidgetProps, "onHangup" | "onMute" | "onDialpad">) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-muted px-2 py-2 rounded-full flex items-center gap-2 shrink-0 h-11">
      {/* Info da chamada */}
      <div className="flex items-center gap-1 pl-2">
        <SpectrumIcon size={16} color="#00BCF2" />
        <Text variant="sm" className="text-muted-foreground">
          Chamando...
        </Text>
      </div>

      {/* Botões */}
      <div className="flex items-center gap-[3.5px]">
        {/* Desligar */}
        <button
          onClick={onHangup}
          className="bg-destructive rounded-full p-2 flex items-center justify-center hover:opacity-90 transition-opacity"
          title="Desligar"
        >
          <PhoneOff className="size-3.5 text-white" />
        </button>

        {/* Mute */}
        <button
          onClick={onMute}
          className="bg-card border border-card rounded-full p-[9px] flex items-center justify-center hover:bg-muted transition-colors"
          title="Mutar"
        >
          <Mic className="size-3.5 text-foreground" />
        </button>

        {/* Menu Dropdown */}
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className="bg-card border border-card rounded-full p-[9px] flex items-center justify-center hover:bg-muted transition-colors"
              title="Opções do WebPhone"
            >
              <MoreVertical className="size-3.5 text-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="p-0">
            <WebPhoneMenu
              onClose={() => setMenuOpen(false)}
              onLogout={() => {
                console.log("Deslogar WebPhone");
                setMenuOpen(false);
              }}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Estado: Incoming (recebendo chamada)
function IncomingState({ phoneNumber, onAnswer, onHangup }: Pick<WebPhoneWidgetProps, "phoneNumber" | "onAnswer" | "onHangup">) {
  return (
    <div className="bg-muted px-2 py-2 rounded-full flex items-center shrink-0 h-11">
      <div className="flex items-center gap-2 pl-2">
        <Phone className="size-4 text-muted-foreground" />
        
        {/* Info da chamada */}
        <div className="flex flex-col">
          <Text variant="xs" className="text-muted-foreground leading-tight">
            Recebendo chamada...
          </Text>
          <Text variant="sm" className="text-muted-foreground leading-tight">
            {phoneNumber || "+55 (34) 9 9999-9999"}
          </Text>
        </div>

        {/* Botões */}
        <div className="flex items-center gap-[3.5px] ml-2">
          {/* Atender */}
          <button
            onClick={onAnswer}
            className="bg-green-600 rounded-full p-2 flex items-center justify-center hover:bg-green-700 transition-colors"
            title="Atender"
          >
            <Phone className="size-4 text-white" />
          </button>

          {/* Recusar */}
          <button
            onClick={onHangup}
            className="bg-destructive rounded-full p-2 flex items-center justify-center hover:opacity-90 transition-opacity"
            title="Recusar"
          >
            <PhoneOff className="size-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Estado: In Call (em chamada)
function InCallState({ timer, phoneNumber, onHangup, onMute, onDialpad, isMuted }: Pick<WebPhoneWidgetProps, "timer" | "phoneNumber" | "onHangup" | "onMute" | "onDialpad" | "isMuted">) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-muted px-2 py-2 rounded-full flex items-center gap-2 shrink-0 h-11">
      {/* Info da chamada */}
      <div className="flex items-center gap-2 pl-2">
        <SpectrumIcon size={16} color="#00BCF2" />
        <Text variant="sm" className="text-muted-foreground">
          {timer || "00:00:04"}
        </Text>
        <Text variant="sm" className="text-muted-foreground opacity-80">
          {phoneNumber || "+55 (34) 9 9999-9999"}
        </Text>
      </div>

      {/* Botões */}
      <div className="flex items-center gap-[3.5px]">
        {/* Desligar */}
        <button
          onClick={onHangup}
          className="bg-destructive rounded-full p-2 flex items-center justify-center hover:opacity-90 transition-opacity"
          title="Desligar"
        >
          <PhoneOff className="size-3.5 text-white" />
        </button>

        {/* Mute */}
        <button
          onClick={onMute}
          className="bg-card border border-card rounded-full p-[9px] flex items-center justify-center hover:bg-muted transition-colors"
          title="Mutar"
        >
          {isMuted ? <MicOff className="size-3.5 text-foreground" /> : <Mic className="size-3.5 text-foreground" />}
        </button>

        {/* Menu Dropdown */}
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className="bg-card border border-card rounded-full p-[9px] flex items-center justify-center hover:bg-muted transition-colors"
              title="Opções do WebPhone"
            >
              <MoreVertical className="size-3.5 text-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="p-0">
            <WebPhoneMenu
              onClose={() => setMenuOpen(false)}
              onLogout={() => {
                console.log("Deslogar WebPhone");
                setMenuOpen(false);
              }}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function WebPhoneWidget(props: WebPhoneWidgetProps) {
  const { state } = props;

  switch (state) {
    case "login":
      return <LoginState {...props} />;
    case "idle":
      return <IdleState {...props} />;
    case "ready":
      return <ReadyState {...props} />;
    case "auto-answer-countdown":
      return <AutoAnswerState {...props} />;
    case "outgoing":
      return <OutgoingState {...props} />;
    case "incoming":
      return <IncomingState {...props} />;
    case "in-call":
      return <InCallState {...props} />;
    default:
      return <LoginState {...props} />;
  }
}