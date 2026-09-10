import { Button } from "./ui/button";
import { X, Send } from "lucide-react";
import { useSidePanel } from "../contexts/SidePanelContext";
import { Input } from "./ui/input";
import svgPaths from "../imports/svg-29fnrm3pjf";
import { useState, useRef, useEffect } from "react";

// Wizz Icon Component
function WizzIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 20 20"
    >
      <g>
        <path d={svgPaths.p16affa80} fill="currentColor" />
        <path d={svgPaths.p3c89d9f0} fill="currentColor" />
        <path
          clipRule="evenodd"
          d={svgPaths.p118e9ef0}
          fill="currentColor"
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export default function WizzPanel() {
  const { closePanel } = useSidePanel();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Olá! Eu sou o Wizz, sua inteligência artificial auxiliar. Como posso ajudar você hoje?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  // ========== INTEGRAÇÃO COM API REAL ==========
  // OPÇÃO 1: OpenAI (GPT-3.5/GPT-4)
  const callOpenAI = async (
    userMessage: string,
  ): Promise<string> => {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer YOUR_OPENAI_API_KEY_HERE`, // ⚠️ SUBSTITUIR pela sua chave
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo", // ou "gpt-4" para mais qualidade
            messages: [
              {
                role: "system",
                content:
                  "Você é o Wizz, um assistente de IA especializado em plataformas de saúde omnichannel. Ajude com informações sobre pacientes, agendamentos e atendimentos de forma clara e profissional.",
              },
              ...messages.map((msg) => ({
                role:
                  msg.sender === "user" ? "user" : "assistant",
                content: msg.text,
              })),
              {
                role: "user",
                content: userMessage,
              },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      return (
        data.choices[0]?.message?.content ||
        "Desculpe, não consegui processar sua mensagem."
      );
    } catch (error) {
      console.error("Erro ao chamar OpenAI:", error);
      return "Desculpe, estou com problemas de conexão. Tente novamente.";
    }
  };

  // OPÇÃO 2: Google Gemini (Gratuita)
  const callGemini = async (
    userMessage: string,
  ): Promise<string> => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=AIzaSyAIdoL_10S8lVAuS9Q2y4OfGGg7oFwSIqs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Você é o Wizz, um assistente de IA especializado em plataformas de saúde omnichannel. Responda de forma clara, profissional e útil.

Contexto da conversa:
${messages
  .slice(-5)
  .map(
    (msg) =>
      `${msg.sender === "user" ? "Usuário" : "Wizz"}: ${msg.text}`,
  )
  .join("\n")}

Pergunta do usuário: ${userMessage}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Detalhes do erro Gemini:", errorText);
        throw new Error(
          `Erro na API Gemini: ${response.status}`,
        );
      }

      const data = await response.json();
      const aiText =
        data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiText) {
        throw new Error("Resposta vazia da API");
      }

      return aiText;
    } catch (error) {
      console.error("Erro ao chamar Gemini:", error);
      // Lança o erro para ser tratado no handleSendMessage
      throw error;
    }
  };

  // Respostas automáticas simples da IA (FALLBACK - mantido para caso a API falhe)
  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (
      lowerMessage.includes("olá") ||
      lowerMessage.includes("oi")
    ) {
      return "Olá! Como posso ajudá-lo hoje?";
    }
    if (
      lowerMessage.includes("paciente") ||
      lowerMessage.includes("cliente")
    ) {
      return "Posso ajudar você com informações sobre pacientes. O que você gostaria de saber?";
    }
    if (
      lowerMessage.includes("agenda") ||
      lowerMessage.includes("consulta")
    ) {
      return "Para agendar ou verificar consultas, posso consultar a agenda. Você quer ver os próximos agendamentos?";
    }
    if (
      lowerMessage.includes("ajuda") ||
      lowerMessage.includes("help")
    ) {
      return "Estou aqui para ajudar! Posso fornecer informações sobre pacientes, agendamentos, histórico de atendimentos e muito mais.";
    }
    if (
      lowerMessage.includes("obrigado") ||
      lowerMessage.includes("valeu")
    ) {
      return "Por nada! Estou sempre à disposição. 😊";
    }

    return "Entendi sua pergunta. Como assistente da plataforma de saúde, posso ajudar com informações sobre pacientes, agendamentos e atendimentos. O que você precisa?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Adiciona mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      // ⚠️ ESCOLHA A API AQUI:
      // const aiResponseText = await callOpenAI(currentInput); // OpenAI
      // const aiResponseText = await callGemini(currentInput);    // Gemini - DESABILITADO (erro 404)
      const aiResponseText = getAIResponse(currentInput); // Fallback local (ATIVO)

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Erro ao processar resposta:", error);
      // Fallback para resposta local em caso de erro
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(currentInput),
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white border border-border rounded-[8px] overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="py-3 px-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center text-[#7850CB]">
            <WizzIcon className="size-5" />
          </div>
          <span className="font-semibold text-[16px]">
            Wizz AI
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={closePanel}
          className="h-6 w-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar bg-white">
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`bg-${message.sender === "user" ? "brand-primary" : "muted"} p-3 rounded-lg max-w-[85%] ${
                message.sender === "user"
                  ? "self-end"
                  : "self-start"
              }`}
            >
              <p
                className={`text-sm ${
                  message.sender === "user"
                    ? "text-white"
                    : "text-foreground"
                }`}
              >
                {message.text}
              </p>
            </div>
          ))}
          {isTyping && (
            <div className="bg-muted p-3 rounded-lg max-w-[85%] self-start">
              <p className="text-sm text-foreground">
                Digitando...
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-border bg-white">
        <div className="flex gap-2">
          <Input
            placeholder="Digite sua mensagem..."
            className="flex-1"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button
            size="icon"
            className="bg-brand-primary hover:bg-brand-primary/90"
            onClick={handleSendMessage}
          >
            <Send className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}