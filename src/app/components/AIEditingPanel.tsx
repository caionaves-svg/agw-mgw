import { useState, useEffect } from "react";
import { RotateCw, X } from "lucide-react";
import { Button } from "./ui/button";

interface AIEditingPanelProps {
  originalText: string;
  action: string;
  onAccept: (editedText: string) => void;
  onCancel: () => void;
}

export default function AIEditingPanel({
  originalText,
  action,
  onAccept,
  onCancel,
}: AIEditingPanelProps) {
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(true);

  // Simula a geração de texto pela IA
  useEffect(() => {
    const simulateAI = () => {
      let result = originalText;

      switch (action) {
        case "melhorar":
          result = `${originalText}\n\nGostaria de adicionar que estou à disposição para esclarecer quaisquer dúvidas adicionais.`;
          break;
        case "corrigir":
          result = originalText.replace(/vc/gi, "você");
          break;
        case "formalizar":
          result = originalText
            .replace(/oi/gi, "Prezado(a)")
            .replace(/obrigado/gi, "agradeço");
          break;
        case "casualizar":
          result = originalText
            .replace(/Prezado/gi, "Oi")
            .replace(/agradeço/gi, "obrigado");
          break;
        case "resumir":
          const words = originalText.split(" ");
          result =
            words
              .slice(0, Math.ceil(words.length / 2))
              .join(" ") + "...";
          break;
        case "expandir":
          result = `${originalText}\n\nPara fornecer mais contexto: gostaria de elaborar melhor sobre este assunto e garantir que todas as informações necessárias sejam transmitidas de forma clara e objetiva.`;
          break;
        default:
          result = originalText;
      }

      return result;
    };

    setTimeout(() => {
      const generated = simulateAI();
      setGeneratedText(generated);
      setIsGenerating(false);
    }, 800);
  }, [originalText, action]);

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 800);
  };

  const getActionLabel = () => {
    const labels: Record<string, string> = {
      melhorar: "Melhorado",
      corrigir: "Corrigido",
      formalizar: "Formalizado",
      casualizar: "Casualizado",
      resumir: "Resumido",
      expandir: "Expandido",
    };
    return labels[action] || "Editado";
  };

  return (
    <div className="flex-1 flex items-end gap-3 pl-2">
      {/* Texto gerado */}
      <div className="flex-1 min-w-0">
        <div className="mb-1">
          <span
            className="text-secondary-600 font-medium"
            style={{ fontSize: "var(--text-sm)" }}
          >
            {getActionLabel()} pela IA
          </span>
        </div>
        {isGenerating ? (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div
                className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
            <span
              className="text-muted-foreground"
              style={{ fontSize: "var(--text-sm)" }}
            >
              Gerando...
            </span>
          </div>
        ) : (
          <p
            className="text-muted-foreground line-clamp-3"
            style={{ fontSize: "var(--text-sm)" }}
          >
            {generatedText}
          </p>
        )}
      </div>

      {/* Botões de ação - todos juntos, alinhados na base */}
      {!isGenerating && (
        <div className="flex items-center gap-1 shrink-0 pb-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRegenerate}
            className="h-8 w-8"
            title="Regenerar"
          >
            <RotateCw className="w-4 h-4" />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onAccept(generatedText)}
            className="h-8 px-4"
          >
            <span style={{ fontSize: "var(--text-sm)" }}>
              OK
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}