import { X, ArrowLeft, Info } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export interface FilterValues {
  periodo?: string;
  listaCasos?: string;
  cliente?: string;
  idCaso?: string;
  status?: string;
  tipoAtendimento?: string;
  canal?: string;
  assunto?: string;
  destinatario?: string;
}

interface FilterPanelProps {
  onClose: () => void;
  onApply: (filters: FilterValues) => void;
  onClear: () => void;
  initialValues?: FilterValues;
}

export function FilterPanel({
  onClose,
  onApply,
  onClear,
  initialValues = {},
}: FilterPanelProps) {
  const [filters, setFilters] =
    React.useState<FilterValues>(initialValues);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({});
    onClear();
  };

  const updateFilter = (
    key: keyof FilterValues,
    value: string,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-medium text-foreground">
            Configurações de filtro
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {/* Filtrar por período */}
        <div className="space-y-2">
          <Label
            htmlFor="periodo"
            className="text-sm font-medium"
          >
            Filtrar por período
          </Label>
          <Select
            value={filters.periodo}
            onValueChange={(value) =>
              updateFilter("periodo", value)
            }
          >
            <SelectTrigger id="periodo" className="w-full">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="ontem">Ontem</SelectItem>
              <SelectItem value="7dias">
                Últimos 7 dias
              </SelectItem>
              <SelectItem value="30dias">
                Últimos 30 dias
              </SelectItem>
              <SelectItem value="mes-atual">
                Mês atual
              </SelectItem>
              <SelectItem value="mes-anterior">
                Mês anterior
              </SelectItem>
              <SelectItem value="personalizado">
                Personalizado
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtrar por campos */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">
            Filtrar por campos
          </h3>

          {/* Lista de Casos */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="listaCasos" className="text-sm">
                Lista de Casos
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Filtre por casos específicos cadastrados
                      no sistema
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={filters.listaCasos}
              onValueChange={(value) =>
                updateFilter("listaCasos", value)
              }
            >
              <SelectTrigger id="listaCasos" className="w-full">
                <SelectValue placeholder="Selecionar a lista de caso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cancelamento">
                  Solicitação de Cancelamento
                </SelectItem>
                <SelectItem value="suporte-tecnico">
                  Suporte Técnico
                </SelectItem>
                <SelectItem value="financeiro">
                  Questões Financeiras
                </SelectItem>
                <SelectItem value="duvidas">
                  Dúvidas Gerais
                </SelectItem>
                <SelectItem value="reclamacao">
                  Reclamações
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="cliente" className="text-sm">
              Cliente
            </Label>
            <Select
              value={filters.cliente}
              onValueChange={(value) =>
                updateFilter("cliente", value)
              }
            >
              <SelectTrigger id="cliente" className="w-full">
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">
                  Todos os clientes
                </SelectItem>
                <SelectItem value="vip">
                  Clientes VIP
                </SelectItem>
                <SelectItem value="novos">
                  Clientes Novos
                </SelectItem>
                <SelectItem value="recorrentes">
                  Clientes Recorrentes
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ID do Caso */}
          <div className="space-y-2">
            <Label htmlFor="idCaso" className="text-sm">
              ID do Caso
            </Label>
            <Input
              id="idCaso"
              type="text"
              placeholder="Buscar por IDs"
              value={filters.idCaso || ""}
              onChange={(e) =>
                updateFilter("idCaso", e.target.value)
              }
              className="w-full"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm">
              Status
            </Label>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                updateFilter("status", value)
              }
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Selecione o Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aguardando">
                  Aguardando
                </SelectItem>
                <SelectItem value="em-atendimento">
                  Em Atendimento
                </SelectItem>
                <SelectItem value="finalizado">
                  Finalizado
                </SelectItem>
                <SelectItem value="fechado">Fechado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Atendimento */}
          <div className="space-y-2">
            <Label
              htmlFor="tipoAtendimento"
              className="text-sm"
            >
              Tipo de Atendimento
            </Label>
            <Select
              value={filters.tipoAtendimento}
              onValueChange={(value) =>
                updateFilter("tipoAtendimento", value)
              }
            >
              <SelectTrigger
                id="tipoAtendimento"
                className="w-full"
              >
                <SelectValue placeholder="Selecione o tipo de atendimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="suporte">Suporte</SelectItem>
                <SelectItem value="vendas">Vendas</SelectItem>
                <SelectItem value="financeiro">
                  Financeiro
                </SelectItem>
                <SelectItem value="reclamacao">
                  Reclamação
                </SelectItem>
                <SelectItem value="duvida">Dúvida</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Interações (Canal) */}
          <div className="space-y-2">
            <Label htmlFor="canal" className="text-sm">
              Interações
            </Label>
            <Select
              value={filters.canal}
              onValueChange={(value) =>
                updateFilter("canal", value)
              }
            >
              <SelectTrigger id="canal" className="w-full">
                <SelectValue placeholder="Selecione o canal das interações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">
                  WhatsApp
                </SelectItem>
                <SelectItem value="webchat">WebChat</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="messenger">
                  Messenger
                </SelectItem>
                <SelectItem value="instagram">
                  Instagram
                </SelectItem>
                <SelectItem value="telegram">
                  Telegram
                </SelectItem>
                <SelectItem value="rcs">RCS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assunto */}
          <div className="space-y-2">
            <Label htmlFor="assunto" className="text-sm">
              Assunto
            </Label>
            <Input
              id="assunto"
              type="text"
              placeholder="Buscar por assunto do email"
              value={filters.assunto || ""}
              onChange={(e) =>
                updateFilter("assunto", e.target.value)
              }
              className="w-full"
            />
          </div>

          {/* Destinatário */}
          <div className="space-y-2">
            <Label htmlFor="destinatario" className="text-sm">
              Destinatário
            </Label>
            <Input
              id="destinatario"
              type="text"
              placeholder="Buscar por destinatário do email"
              value={filters.destinatario || ""}
              onChange={(e) =>
                updateFilter("destinatario", e.target.value)
              }
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Footer - Actions */}
      <div className="flex items-center justify-between p-4 border-t border-border flex-shrink-0 gap-2">
        <Button
          variant="link"
          onClick={handleClear}
          className="text-primary p-0 h-auto"
        >
          Limpar Tudo
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="brand" onClick={handleApply}>
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper para contar filtros ativos
export function countActiveFilters(
  filters: FilterValues,
): number {
  return Object.values(filters).filter(
    (value) => value !== undefined && value !== "",
  ).length;
}

// Adicionar import do React no topo
import React from "react";