import { Zap, X } from "lucide-react";
import { Button } from "../ui/button";

interface JourneySectionProps {
  onClose: () => void;
}

export function JourneySection({
  onClose,
}: JourneySectionProps) {
  return (
    <div className="bg-background rounded-xl overflow-hidden h-full flex flex-col">
      {/* Header com título e botão close */}
      <div className="p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-foreground">
            Jornada do cliente
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
        <div className="space-y-0">
          {/* Item 1 */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-2.5 h-2.5 bg-[#4fc4a8] rounded-full mt-1"></div>
              <div className="w-0.25 flex-1 bg-gradient-to-b from-[#e5e5e5] to-white my-1"></div>
            </div>
            <div className="flex-1 pb-2">
              <div className="flex justify-between items-start">
                <span className="text-sm font-normal text-gray-700">
                  Atendimento iniciado
                </span>
                <span className="text-xs text-gray-400">
                  14:32
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Cliente conectado via WhatsApp
              </p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-2.5 h-2.5 bg-[#4fc4a8] rounded-full mt-1"></div>
              <div className="w-0.25 flex-1 bg-gradient-to-b from-[#e5e5e5] to-white my-1"></div>
            </div>
            <div className="flex-1 pb-2">
              <div className="flex justify-between items-start">
                <span className="text-sm font-normal text-gray-700">
                  Transferido para atendente
                </span>
                <span className="text-xs text-gray-400">
                  14:35
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Atendente: Maria Silva
              </p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-2.5 h-2.5 bg-[#4fc4a8] rounded-full mt-1"></div>
              <div className="w-0.25 flex-1 bg-gradient-to-b from-[#e5e5e5] to-white my-1"></div>
            </div>
            <div className="flex-1 pb-2">
              <div className="flex justify-between items-start">
                <span className="text-sm font-normal text-gray-700">
                  SLA - Primeira Resposta
                </span>
                <span className="text-xs text-gray-400">
                  14:37
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Respondido em 5 minutos (Meta: 60 min)
              </p>
            </div>
          </div>

          {/* Item 4 - Último (sem linha) */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-2.5 h-2.5 bg-[#db9114] rounded-full mt-1"></div>
            </div>
            <div className="flex-1 pb-2">
              <div className="flex justify-between items-start">
                <span className="text-sm font-normal text-gray-700">
                  Aguardando protocolo
                </span>
                <span className="text-xs text-gray-400">
                  14:38
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Cliente solicitou cancelamento
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}