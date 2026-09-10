import { useState, useRef } from "react";
import {
  Zap,
  X,
  UserPlus,
  CheckCircle2,
  Clock,
  Forward,
  XCircle,
  FileText,
  Tag,
  AlertCircle,
  ChevronLeft,
  Search,
  GripVertical,
} from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SearchInput } from "../ui/search-input";

interface ActionsSectionProps {
  onClose: () => void;
}

type ActionType =
  | "transferir"
  | "finalizar"
  | "pausar"
  | "encaminhar"
  | "cancelar"
  | "criar-caso"
  | "adicionar-tag"
  | "escalar"
  | null;

interface Action {
  id: string;
  icon: any;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  hoverColor: string;
  priority: boolean;
}

export function ActionsSection({
  onClose,
}: ActionsSectionProps) {
  const [currentAction, setCurrentAction] =
    useState<ActionType>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedItem, setDraggedItem] = useState<string | null>(
    null,
  );
  const [dragOverItem, setDragOverItem] = useState<
    string | null
  >(null);
  const [formData, setFormData] = useState({
    atendente: "",
    equipe: "",
    motivo: "",
    observacao: "",
    tag: "",
    prioridade: "",
  });

  // Ações disponíveis com ordem customizável
  const [actions, setActions] = useState<Action[]>([
    {
      id: "transferir",
      icon: UserPlus,
      title: "Atribuir atendente",
      description: "Transferir para outro atendente ou equipe",
      color: "text-primary",
      bgColor: "bg-primary/20",
      hoverColor: "hover:bg-primary/25",
      priority: true,
    },
    {
      id: "finalizar",
      icon: CheckCircle2,
      title: "Finalizar atendimento",
      description: "Concluir e arquivar o atendimento",
      color: "text-success",
      bgColor: "bg-success/20",
      hoverColor: "hover:bg-success/25",
      priority: true,
    },
    {
      id: "encaminhar",
      icon: Forward,
      title: "Transferir",
      description: "Enviar para outro departamento",
      color: "text-warning",
      bgColor: "bg-warning/20",
      hoverColor: "hover:bg-warning/25",
      priority: true,
    },
    {
      id: "cancelar",
      icon: XCircle,
      title: "Cancelar atendimento",
      description: "Cancelar e descartar atendimento",
      color: "text-destructive",
      bgColor: "bg-destructive/20",
      hoverColor: "hover:bg-destructive/15",
      priority: true,
    },
    {
      id: "criar-caso",
      icon: FileText,
      title: "Criar caso",
      description: "Converter atendimento em caso",
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
      hoverColor: "hover:bg-muted",
      priority: false,
    },
    {
      id: "adicionar-tag",
      icon: Tag,
      title: "Adicionar tag",
      description: "Categorizar o atendimento",
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
      hoverColor: "hover:bg-muted",
      priority: false,
    },
    {
      id: "pausar",
      icon: Clock,
      title: "Agendar seguimento",
      description: "Colocar atendimento em espera",
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
      hoverColor: "hover:bg-muted",
      priority: false,
    },
    {
      id: "escalar",
      icon: AlertCircle,
      title: "Reportar problema",
      description: "Enviar para nível superior",
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
      hoverColor: "hover:bg-muted",
      priority: false,
    },
  ]);

  // Filtrar ações por busca
  const filteredActions = actions.filter(
    (action) =>
      action.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      action.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  // Drag & Drop handlers
  const handleDragStart = (
    e: React.DragEvent,
    actionId: string,
  ) => {
    setDraggedItem(actionId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (
    e: React.DragEvent,
    actionId: string,
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverItem(actionId);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();

    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const newActions = [...actions];
    const draggedIndex = newActions.findIndex(
      (a) => a.id === draggedItem,
    );
    const targetIndex = newActions.findIndex(
      (a) => a.id === targetId,
    );

    // Remove o item arrastado
    const [removed] = newActions.splice(draggedIndex, 1);
    // Insere na nova posição
    newActions.splice(targetIndex, 0, removed);

    setActions(newActions);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleActionClick = (actionId: string) => {
    setCurrentAction(actionId as ActionType);
  };

  const handleBack = () => {
    setCurrentAction(null);
    setFormData({
      atendente: "",
      equipe: "",
      motivo: "",
      observacao: "",
      tag: "",
      prioridade: "",
    });
  };

  const handleSubmit = () => {
    console.log("Ação executada:", currentAction, formData);
    handleBack();
  };

  // Obter título da ação atual
  const getActionTitle = () => {
    const action = actions.find((a) => a.id === currentAction);
    return action?.title || "Ação";
  };

  const renderFormContent = () => {
    switch (currentAction) {
      case "transferir":
        return (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Selecione o atendente ou equipe para transferir
                este atendimento
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="atendente">Atendente</Label>
              <Select
                value={formData.atendente}
                onValueChange={(value) =>
                  setFormData({ ...formData, atendente: value })
                }
              >
                <SelectTrigger id="atendente">
                  <SelectValue placeholder="Selecione um atendente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ana">Ana Silva</SelectItem>
                  <SelectItem value="carlos">
                    Carlos Santos
                  </SelectItem>
                  <SelectItem value="maria">
                    Maria Oliveira
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacao">
                Observação (opcional)
              </Label>
              <Textarea
                id="observacao"
                placeholder="Adicione uma observação sobre a transferência..."
                value={formData.observacao}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    observacao: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
          </div>
        );

      case "finalizar":
        return (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Confirme a finalização do atendimento e adicione
                observações finais
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivo">
                Motivo de finalização
              </Label>
              <Select
                value={formData.motivo}
                onValueChange={(value) =>
                  setFormData({ ...formData, motivo: value })
                }
              >
                <SelectTrigger id="motivo">
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resolvido">
                    Problema resolvido
                  </SelectItem>
                  <SelectItem value="informacao">
                    Informação fornecida
                  </SelectItem>
                  <SelectItem value="duplicado">
                    Atendimento duplicado
                  </SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacao-final">
                Observações finais (opcional)
              </Label>
              <Textarea
                id="observacao-final"
                placeholder="Adicione observações sobre o atendimento..."
                value={formData.observacao}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    observacao: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
          </div>
        );

      case "encaminhar":
        return (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Envie o atendimento para outro departamento
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="setor">Setor de destino</Label>
              <Select
                value={formData.equipe}
                onValueChange={(value) =>
                  setFormData({ ...formData, equipe: value })
                }
              >
                <SelectTrigger id="setor">
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financeiro">
                    Financeiro
                  </SelectItem>
                  <SelectItem value="tecnico">
                    Suporte Técnico
                  </SelectItem>
                  <SelectItem value="comercial">
                    Comercial
                  </SelectItem>
                  <SelectItem value="juridico">
                    Jurídico
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacao-encaminhar">
                Mensagem para o setor
              </Label>
              <Textarea
                id="observacao-encaminhar"
                placeholder="Explique o motivo do encaminhamento..."
                value={formData.observacao}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    observacao: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
          </div>
        );

      case "cancelar":
        return (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-destructive mb-3">
                Esta ação não pode ser desfeita. O atendimento
                será descartado.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivo-cancelar">
                Motivo do cancelamento
              </Label>
              <Select
                value={formData.motivo}
                onValueChange={(value) =>
                  setFormData({ ...formData, motivo: value })
                }
              >
                <SelectTrigger id="motivo-cancelar">
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="duplicado">
                    Duplicado
                  </SelectItem>
                  <SelectItem value="engano">Engano</SelectItem>
                  <SelectItem value="teste">Teste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacao-cancelar">
                Justificativa (obrigatória)
              </Label>
              <Textarea
                id="observacao-cancelar"
                placeholder="Justifique o cancelamento do atendimento..."
                value={formData.observacao}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    observacao: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
          </div>
        );

      case "criar-caso":
        return (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Converter este atendimento em um caso para
                acompanhamento
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prioridade">
                Prioridade do caso
              </Label>
              <Select
                value={formData.prioridade}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    prioridade: value,
                  })
                }
              >
                <SelectTrigger id="prioridade">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">
                    Urgente
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacao-caso">
                Descrição do caso (opcional)
              </Label>
              <Textarea
                id="observacao-caso"
                placeholder="Adicione detalhes sobre o caso..."
                value={formData.observacao}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    observacao: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
          </div>
        );

      case "adicionar-tag":
        return (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Categorize o atendimento com tags para melhor
                organização
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag">Tag</Label>
              <Select
                value={formData.tag}
                onValueChange={(value) =>
                  setFormData({ ...formData, tag: value })
                }
              >
                <SelectTrigger id="tag">
                  <SelectValue placeholder="Selecione uma tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgente">
                    Urgente
                  </SelectItem>
                  <SelectItem value="vip">
                    Cliente VIP
                  </SelectItem>
                  <SelectItem value="tecnico">
                    Técnico
                  </SelectItem>
                  <SelectItem value="comercial">
                    Comercial
                  </SelectItem>
                  <SelectItem value="financeiro">
                    Financeiro
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "pausar":
        return (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                O atendimento ficará em espera até ser retomado
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivo-pausa">
                Motivo da pausa
              </Label>
              <Select
                value={formData.motivo}
                onValueChange={(value) =>
                  setFormData({ ...formData, motivo: value })
                }
              >
                <SelectTrigger id="motivo-pausa">
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aguardando-cliente">
                    Aguardando resposta do cliente
                  </SelectItem>
                  <SelectItem value="aguardando-info">
                    Aguardando informações internas
                  </SelectItem>
                  <SelectItem value="pausa-tecnica">
                    Pausa técnica
                  </SelectItem>
                  <SelectItem value="outro">
                    Outro motivo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacao-pausa">
                Observação (opcional)
              </Label>
              <Textarea
                id="observacao-pausa"
                placeholder="Adicione detalhes sobre a pausa..."
                value={formData.observacao}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    observacao: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
          </div>
        );

      case "escalar":
        return (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Envie o atendimento para um nível superior de
                atendimento
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nivel">Nível de escalação</Label>
              <Select
                value={formData.equipe}
                onValueChange={(value) =>
                  setFormData({ ...formData, equipe: value })
                }
              >
                <SelectTrigger id="nivel">
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supervisor">
                    Supervisor
                  </SelectItem>
                  <SelectItem value="gerente">
                    Gerente
                  </SelectItem>
                  <SelectItem value="diretoria">
                    Diretoria
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivo-escalar">
                Motivo da escalação
              </Label>
              <Textarea
                id="motivo-escalar"
                placeholder="Explique por que este atendimento precisa ser escalado..."
                value={formData.observacao}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    observacao: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Botão de ação (texto muda conforme a ação)
  const getSubmitButtonText = () => {
    switch (currentAction) {
      case "transferir":
        return "Transferir agora";
      case "finalizar":
        return "Finalizar atendimento";
      case "encaminhar":
        return "Encaminhar agora";
      case "cancelar":
        return "Confirmar cancelamento";
      case "criar-caso":
        return "Criar caso";
      case "adicionar-tag":
        return "Adicionar tag";
      case "pausar":
        return "Pausar atendimento";
      case "escalar":
        return "Escalar agora";
      default:
        return "Confirmar";
    }
  };

  return (
    <div className="bg-background rounded-xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-foreground">
            {currentAction ? getActionTitle() : "Ações"}
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

      {/* Conteúdo - Lista de ações OU Formulário */}
      {!currentAction ? (
        <div className="flex-1 px-4 pb-2 overflow-y-auto custom-scrollbar">
          {/* Campo de busca */}
          <div className="mb-2">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar ação..."
            />
          </div>

          {/* Container único com todas as ações */}
          <div className="space-y-2">
            {filteredActions.map((action) => {
              const isDragging = draggedItem === action.id;
              const isDragOver = dragOverItem === action.id;

              return (
                <div
                  key={action.id}
                  draggable
                  onDragStart={(e) =>
                    handleDragStart(e, action.id)
                  }
                  onDragOver={(e) =>
                    handleDragOver(e, action.id)
                  }
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, action.id)}
                  onDragEnd={handleDragEnd}
                  className={`cursor-move transition-all ${isDragging ? "opacity-50 scale-95" : ""} ${
                    isDragOver
                      ? "border-t-2 border-brand-primary pt-1"
                      : ""
                  }`}
                >
                  <button
                    onClick={() => handleActionClick(action.id)}
                    className={`group w-full ${action.priority ? "p-2" : "p-2"} rounded-lg border border-border ${action.bgColor} ${action.hoverColor} transition-colors duration-200 text-left`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex-shrink-0 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-foreground font-medium leading-tight"
                          style={{ fontSize: "var(--text-sm)" }}
                        >
                          {action.title}
                        </div>
                        <div
                          className="text-muted-foreground mt-0.5"
                          style={{ fontSize: "var(--text-sm)" }}
                        >
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {/* Formulário */}
          <div className="flex-1 px-4 pb-2 overflow-y-auto custom-scrollbar">
            {renderFormContent()}
          </div>

          {/* Footer com botões */}
          <div className="px-3 py-3 border-t border-border flex items-center justify-end gap-2 flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleBack}
              size="sm"
            >
              Voltar
            </Button>
            <Button
              variant={
                currentAction === "cancelar"
                  ? "destructive"
                  : "brand"
              }
              onClick={handleSubmit}
              size="sm"
            >
              {getSubmitButtonText()}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}