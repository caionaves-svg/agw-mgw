import {
  Star,
  X,
  TrendingUp,
  Smile,
  Zap,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { Button } from "../ui/button";

interface ExperienceSectionProps {
  onClose: () => void;
}

export function ExperienceSection({
  onClose,
}: ExperienceSectionProps) {
  return (
    <div className="bg-background rounded-xl overflow-hidden h-full flex flex-col">
      {/* Header com título e botão close */}
      <div className="p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-gray-900">
            Experiência
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 px-4 pb-2 overflow-y-auto custom-scrollbar">
        {/* Cards de Métricas - 3 cards horizontais */}
        <div className="grid grid-cols-3 gap-2">
          {/* NPS */}
          <div className="bg-muted border border-border rounded-xl p-2 flex flex-col items-center">
            <p className="text-xs text-muted-foreground mb-2">
              NPS
            </p>
            <p className="text-2xl font-bold text-foreground mb-2">
              8
            </p>
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-[4px]">
              Promotor
            </span>
          </div>

          {/* CSAT */}
          <div className="bg-muted border border-border rounded-xl p-2 flex flex-col items-center">
            <p className="text-xs text-muted-foreground mb-2">
              CSAT
            </p>
            <p className="text-2xl font-bold text-foreground mb-2">
              4.5
            </p>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4].map((star) => (
                <Star
                  key={star}
                  className="w-3 h-3 fill-yellow-400 text-yellow-400"
                />
              ))}
              <Star className="w-3 h-3 text-gray-300" />
            </div>
          </div>

          {/* CES */}
          <div className="bg-muted border border-border rounded-xl p-2 flex flex-col items-center">
            <p className="text-xs text-muted-foreground mb-2">
              CES
            </p>
            <p className="text-2xl font-bold text-foreground mb-2">
              2
            </p>
            <span className="bg-cyan-100 text-cyan-600 text-xs px-2 py-0.5 rounded-[4px]">
              Fácil
            </span>
          </div>
        </div>

        {/* Informações Detalhadas */}
        <div className="mt-4 space-y-2">
          {/* Avaliação geral */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Avaliação geral
            </span>
            <span className="text-sm font-medium text-gray-700">
              Muito satisfeito
            </span>
          </div>

          {/* Tempo de resposta */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Tempo de resposta
            </span>
            <span className="text-sm font-medium text-gray-700">
              Excelente
            </span>
          </div>

          {/* Facilidade de resolução */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Facilidade de resolução
            </span>
            <span className="text-sm font-medium text-gray-700">
              Muito fácil
            </span>
          </div>

          {/* Data da avaliação */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Data da avaliação
            </span>
            <span className="text-sm font-medium text-gray-700">
              24/08/2023
            </span>
          </div>
        </div>

        {/* Comentário do Cliente */}
        <div className="mt-4 space-y-2">
          <h2 className="font-semibold text-foreground">
            Comentário do Cliente
          </h2>
          <div className="bg-muted rounded-xl p-2">
            <p className="text-sm text-muted-foreground">
              "Atendimento rápido e eficiente. O atendente foi
              muito prestativo e resolveu minha questão
              rapidamente."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}