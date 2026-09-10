import {
  Search,
  X,
  Phone,
  Mail,
  MapPin,
  Copy,
  Check,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
  Headset,
} from "lucide-react";
import { SearchInput } from "../ui/search-input";
import { Button } from "../ui/button";
import { SLABadge } from "../SLABadge";
import { SLAItem } from "./SLAItem";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ChangeContactDialog } from "../atendimentos/ChangeContactDialog";

// ── KPI sub-components (only rendered in modal context) ──────────────

function KpiCard({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-background border border-border rounded-lg p-2.5 flex flex-col gap-1 min-w-0">
      <span className="font-light text-muted-foreground text-sm leading-tight truncate">
        {label}
      </span>
      <span
        className={`text-lg font-medium leading-snug tabular-nums ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </span>
      <span className="text-xs text-muted-foreground leading-tight truncate">{sub}</span>
    </div>
  );
}

function AssigneeCard({
  name,
  username,
}: {
  name: string;
  username: string;
}) {
  return (
    <div className="bg-background border border-border rounded-lg p-2.5 flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center flex-shrink-0">
        <Headset className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-light text-muted-foreground text-sm block leading-tight mb-0.5">
          Assinado para
        </span>
        <p className="text-sm text-foreground leading-tight truncate">{name}</p>
        <p className="text-xs text-muted-foreground truncate">{username}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────

interface InformationSectionProps {
  atendimento?: {
    cliente: {
      nome: string;
    };
    sla?: {
      tipo: string;
      status: "dentro-prazo" | "em-risco" | "estourado";
      prazo: string;
      tempoRestante: string;
      percentualDecorrido: number;
      metaMinutos: number;
      tempoDecorridoMinutos: number;
    };
    // Suporte a múltiplos SLAs
    slas?: Array<{
      nome: string; // Ex: "Validação de Protocolo", "Primeira Resposta"
      tipo: string;
      status: "dentro-prazo" | "em-risco" | "estourado";
      prazo: string;
      tempoRestante: string;
      percentualDecorrido: number;
      metaMinutos: number;
      tempoDecorridoMinutos: number;
    }>;
  };
  onClose?: () => void;
  showKpis?: boolean;
}

// Componente para campo interativo com ações
interface InteractiveFieldProps {
  label: string;
  value: string;
  type?: "phone" | "email" | "address" | "default";
  className?: string;
}

// Função helper para copiar texto com fallback
const copyToClipboard = async (
  text: string,
): Promise<boolean> => {
  // Método 1: Tenta API moderna do Clipboard
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    // Silenciosamente ignora erro e tenta fallback
  }

  // Método 2: Fallback usando execCommand (mais compatível)
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const result = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (result) {
      return true;
    }
  } catch (err) {
    // Ignora erro do fallback também
  }

  // Se ambos falharem, apenas retorna false sem logar
  return false;
};

function InteractiveField({
  label,
  value,
  type = "default",
  className = "",
}: InteractiveFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(value);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAction = () => {
    if (type === "phone") {
      console.log("Iniciar chamada para:", value);
      // Futura integração com sistema de chamadas
    } else if (type === "email") {
      console.log("Enviar email para:", value);
      // Futura integração com sistema de email
    } else if (type === "address") {
      console.log("Abrir mapa para:", value);
      // Futura integração com visualizador de mapas
    }
  };

  const getActionIcon = () => {
    if (type === "phone") return Phone;
    if (type === "email") return Mail;
    if (type === "address") return MapPin;
    return null;
  };

  const getActionLabel = () => {
    if (type === "phone") return "Ligar";
    if (type === "email") return "Enviar email";
    if (type === "address") return "Ver mapa";
    return "";
  };

  const ActionIcon = getActionIcon();
  const hasSpecialAction = type !== "default";

  return (
    <div className={className}>
      <span className="font-light text-muted-foreground text-sm block mb-1">
        {label}
      </span>
      <div className="group relative flex items-center gap-2 transition-all">
        {/* Texto */}
        <p
          className="text-foreground text-sm leading-tight truncate flex-1"
          title={value}
        >
          {value}
        </p>

        {/* Botões de ação */}
        <div className="flex items-center gap-1">
          {/* Botão de ação especial (apenas para phone, email, address) */}
          {hasSpecialAction && ActionIcon && (
            <button
              onClick={handleAction}
              className="p-1.5 rounded-md hover:bg-gray-200 transition-colors"
              title={getActionLabel()}
            >
              <ActionIcon className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}

          {/* Botão copiar (sempre presente) */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-gray-200 transition-colors"
            title={copied ? "Copiado!" : "Copiar"}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-gray-500" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function InformationSection({
  atendimento,
  onClose,
  showKpis = false,
}: InformationSectionProps) {
  const navigate = useNavigate();

  // Estado para controlar quais seções estão abertas (sempre abertas por padrão)
  const [openSections, setOpenSections] = useState<string[]>([
    "cliente",
    "atendimento",
  ]);

  // Estados para controlar os modais de edição
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] =
    useState(false);
  const [
    isEditAtendimentoDialogOpen,
    setIsEditAtendimentoDialogOpen,
  ] = useState(false);
  const [
    isChangeContactDialogOpen,
    setIsChangeContactDialogOpen,
  ] = useState(false);

  // Estados do formulário de cliente
  const [clientData, setClientData] = useState({
    nome: atendimento?.cliente.nome || "Sérgio Vieira",
    cpf: "012.478.254-55",
    emailPrincipal: "sergio.vieira@email.com",
    emailSecundario: "sergio.v@outlook.com",
    emailsAdicionais: [] as string[],
    telefonePrincipal: "(11) 99999-9999",
    telefoneSecundario: "(11) 98888-8888",
    telefonesAdicionais: [] as string[],
    dataNascimento: "15/03/1985",
    endereco:
      "Rua das Flores, 123 - Jardim Paulista - São Paulo, SP - CEP 01422-000",
    empresa: "Tech Solutions LTDA",
    cargo: "Gerente de TI",
  });

  // Estados do formulário de atendimento
  const [atendimentoData, setAtendimentoData] = useState({
    motivo: "Cancelamento",
    status: "Finalizado",
  });

  // Handlers para salvar as alterações
  const handleSaveClient = () => {
    console.log("Salvando dados do cliente:", clientData);
    // Aqui você faria a chamada à API para salvar os dados
    setIsEditClientDialogOpen(false);
  };

  const handleSaveAtendimento = () => {
    console.log(
      "Salvando dados do atendimento:",
      atendimentoData,
    );
    // Aqui você faria a chamada à API para salvar os dados
    setIsEditAtendimentoDialogOpen(false);
  };

  const handleContactSelected = (contact: {
    id: string;
    nome: string;
    documento: string;
    telefone?: string;
    email?: string;
  }) => {
    console.log("Novo contato selecionado:", contact);
    // Atualizar os dados do cliente com o novo contato
    setClientData({
      ...clientData,
      nome: contact.nome,
      cpf: contact.documento,
      telefonePrincipal:
        contact.telefone || clientData.telefonePrincipal,
      emailPrincipal:
        contact.email || clientData.emailPrincipal,
    });
    // Reabrir o modal de edição após selecionar contato
    setIsEditClientDialogOpen(true);
    // Aqui você faria a chamada à API para vincular o novo contato ao atendimento
  };

  // Handler para adicionar novo email
  const handleAddEmail = () => {
    setClientData({
      ...clientData,
      emailsAdicionais: [...clientData.emailsAdicionais, ""],
    });
  };

  // Handler para adicionar novo telefone
  const handleAddTelefone = () => {
    setClientData({
      ...clientData,
      telefonesAdicionais: [
        ...clientData.telefonesAdicionais,
        "",
      ],
    });
  };

  // Handler para remover email adicional
  const handleRemoveEmail = (index: number) => {
    setClientData({
      ...clientData,
      emailsAdicionais: clientData.emailsAdicionais.filter(
        (_, i) => i !== index,
      ),
    });
  };

  // Handler para remover telefone adicional
  const handleRemoveTelefone = (index: number) => {
    setClientData({
      ...clientData,
      telefonesAdicionais:
        clientData.telefonesAdicionais.filter(
          (_, i) => i !== index,
        ),
    });
  };

  // Handler para atualizar email adicional
  const handleUpdateEmail = (index: number, value: string) => {
    const newEmails = [...clientData.emailsAdicionais];
    newEmails[index] = value;
    setClientData({
      ...clientData,
      emailsAdicionais: newEmails,
    });
  };

  // Handler para atualizar telefone adicional
  const handleUpdateTelefone = (
    index: number,
    value: string,
  ) => {
    const newTelefones = [...clientData.telefonesAdicionais];
    newTelefones[index] = value;
    setClientData({
      ...clientData,
      telefonesAdicionais: newTelefones,
    });
  };

  // Handler para copiar valor
  const handleCopyValue = async (value: string) => {
    await copyToClipboard(value);
  };

  // Handler para ligar
  const handleCall = (phone: string) => {
    console.log("Ligar para:", phone);
    // Integração futura com sistema de telefonia
  };

  // Handler para enviar email
  const handleSendEmail = (email: string) => {
    console.log("Enviar email para:", email);
    window.location.href = `mailto:${email}`;
  };

  // Dados de SLAs - suporte a múltiplos SLAs ou mock padrão
  const slas = atendimento?.slas || [
    {
      nome: "Validação de Protocolo",
      tipo: "validacao",
      status: "concluido" as const,
      prazo: "24/08/2023 14:15",
      tempoRestante: "Concluído em 2min",
      percentualDecorrido: 100,
      metaMinutos: 60,
      tempoDecorridoMinutos: 2,
    },
    {
      nome: "Primeira Resposta",
      tipo: "primeira-resposta",
      status: "concluido" as const,
      prazo: "24/08/2023 14:30",
      tempoRestante: "Concluído em 5min",
      percentualDecorrido: 100,
      metaMinutos: 15,
      tempoDecorridoMinutos: 5,
    },
    {
      nome: "Resolução Final",
      tipo: "resolucao",
      status: "em-risco" as const,
      prazo: "24/08/2023 15:00",
      tempoRestante: "8m 12s restante",
      percentualDecorrido: 85,
      metaMinutos: 30,
      tempoDecorridoMinutos: 25,
    },
  ];

  // Função de ordenação por criticidade: vencido > vencendo > dentro do prazo > concluído
  const sortedSlas = [...slas].sort((a, b) => {
    const statusOrder = {
      estourado: 0,
      "em-risco": 1,
      "dentro-prazo": 2,
      concluido: 3,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="bg-background rounded-xl overflow-hidden h-full flex flex-col">
      {/* Header com título e botão close */}
      <div className="p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-foreground">
            Informações
          </span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      {/* Container principal com scroll */}
      <div className="flex-1 px-4 pb-2 overflow-y-auto custom-scrollbar">

        {/* ── Assinado para — só no modal ── */}
        {showKpis && (
          <div className="mb-3">
            <AssigneeCard name="Bruno Martins" username="bruno.martins" />
          </div>
        )}

        {/* Container de SLAs */}
        <div className="flex flex-col gap-2 mb-4">
          {sortedSlas.map((sla, index) => (
            <SLAItem
              key={`${sla.nome}-${index}`}
              nome={sla.nome}
              status={sla.status}
              tempoRestante={sla.tempoRestante}
              percentualDecorrido={sla.percentualDecorrido}
              isFirst={index === 0}
            />
          ))}
        </div>

        {/* ── KPIs — apenas na visualização do gestor (modal) ── */}
        {showKpis && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <KpiCard
              label="Tempo em Espera"
              value="04:12"
              sub="da fila até a designação"
            />
            <KpiCard
              label="Tempo Médio de Atendimento"
              value="11:38"
              sub="média · SAC WhatsApp"
              highlight
            />
            <KpiCard
              label="Em Atendimento"
              value="22:11"
              sub="desde a designação"
            />
            <KpiCard
              label="Interações"
              value="21"
              sub="12 chat · 4 whats · 2 email · 3 voz"
            />
          </div>
        )}

        {/* Campo de busca */}
        <div className="mb-2">
          <SearchInput
            placeholder="Buscar por dados..."
            className="border-border"
            showIcon={true}
          />
        </div>
        {/* Accordion com seções colapsáveis */}
        <Accordion
          type="multiple"
          defaultValue={["cliente", "atendimento"]}
          className="space-y-2"
        >
          {/* Seção 1: Dados do Cliente (em cima) - SEMPRE ABERTA */}
          <AccordionItem
            value="cliente"
            className="bg-background border border-border rounded-lg overflow-hidden"
          >
            <div className="relative">
              <AccordionTrigger className="px-2 py-2 hover:bg-muted hover:no-underline">
                <span
                  className="text-foreground font-medium leading-tight"
                  style={{ fontSize: "var(--text-sm)" }}
                >
                  Dados do Cliente
                </span>
              </AccordionTrigger>
              {/* Botão de editar posicionado absolutamente */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditClientDialogOpen(true);
                }}
                className="absolute right-10 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                title="Editar todos os dados"
              >
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <AccordionContent className="p-2">
              {/* Grid de informações */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Nome completo */}
                <InteractiveField
                  label="Nome completo"
                  value={
                    atendimento?.cliente.nome || "Sérgio Vieira"
                  }
                />

                {/* CPF */}
                <InteractiveField
                  label="CPF"
                  value="012.478.254-55"
                />

                {/* E-mail principal */}
                <InteractiveField
                  label="E-mail principal"
                  value="sergio.vieira@email.com"
                  type="email"
                />

                {/* E-mail secundário */}
                <InteractiveField
                  label="E-mail secundário"
                  value="sergio.v@outlook.com"
                  type="email"
                />

                {/* Telefone principal */}
                <InteractiveField
                  label="Telefone principal"
                  value="(11) 99999-9999"
                  type="phone"
                />

                {/* Telefone secundário */}
                <InteractiveField
                  label="Telefone secundário"
                  value="(11) 98888-8888"
                  type="phone"
                />

                {/* Data de nascimento */}
                <InteractiveField
                  label="Data de nascimento"
                  value="15/03/1985 (39 anos)"
                />

                {/* Cliente desde */}
                <InteractiveField
                  label="Cliente desde"
                  value="12/01/2020"
                />

                {/* Endereço */}
                <InteractiveField
                  label="Endereço"
                  value="Rua das Flores, 123 - Jardim Paulista - São Paulo, SP - CEP 01422-000"
                  type="address"
                  className="lg:col-span-2"
                />

                {/* Empresa */}
                <InteractiveField
                  label="Empresa"
                  value="Tech Solutions LTDA"
                />

                {/* Cargo */}
                <InteractiveField
                  label="Cargo"
                  value="Gerente de TI"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Seção 2: Dados do Atendimento (embaixo) */}
          <AccordionItem
            value="atendimento"
            className="bg-background border border-border rounded-lg overflow-hidden"
          >
            <div className="relative">
              <AccordionTrigger className="px-2 py-2 hover:bg-muted hover:no-underline">
                <span
                  className="text-foreground font-medium"
                  style={{ fontSize: "var(--text-sm)" }}
                >
                  Dados do Atendimento
                </span>
              </AccordionTrigger>
              {/* Botão de editar posicionado absolutamente - COMENTADO */}
              {/* <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditAtendimentoDialogOpen(true);
                }}
                className="absolute right-10 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                title="Editar todos os dados"
              >
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
              </button> */}
            </div>
            <AccordionContent className="p-2">
              {/* Grid de informações */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* ID do Caso - campo especial com chip */}
                <div>
                  <span className="font-light text-gray-600 text-sm block mb-1">
                    ID do Caso
                  </span>
                  <div className="group relative flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-lg px-1 py-1 transition-all border border-transparent hover:border-brand-primary/20 cursor-pointer">
                    <span className="font-normal text-gray-700 text-sm font-mono flex-1">
                      098765
                    </span>

                    {/* Botões de ação - depois do número: copiar, depois abrir */}
                    <div className="flex items-center gap-1">
                      {/* Botão copiar */}
                      <button
                        onClick={async () => {
                          await copyToClipboard("098765");
                        }}
                        className="p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                        title="Copiar"
                      >
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>

                      {/* Botão abrir caso */}
                      <button
                        onClick={() => {
                          navigate("/management/cases?caso=098765");
                        }}
                        className="p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                        title="Abrir caso"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Protocolo */}
                <InteractiveField
                  label="Protocolo"
                  value="ATD-2024-00123"
                />

                {/* Nome do usuário */}
                <InteractiveField
                  label="Nome do usuário"
                  value={
                    atendimento?.cliente.nome || "Sérgio Vieira"
                  }
                />

                {/* CPF */}
                <InteractiveField
                  label="CPF"
                  value="012.478.254-55"
                />

                {/* Atendente */}
                <InteractiveField
                  label="Atendente"
                  value="Maria Silva"
                />

                {/* Equipe */}
                <InteractiveField
                  label="Equipe"
                  value="Suporte Nível 1"
                />

                {/* Data de registro */}
                <InteractiveField
                  label="Data de registro"
                  value="24/08/2023 14:32"
                />

                {/* Tempo de atendimento */}
                <InteractiveField
                  label="Tempo de atendimento"
                  value="00:15:23"
                />

                {/* Motivo */}
                <InteractiveField
                  label="Motivo"
                  value="Cancelamento"
                />

                {/* Status */}
                <div>
                  <span className="font-light text-gray-600 text-sm block mb-1">
                    Status
                  </span>
                  <div className="flex items-center">
                    <span className="font-normal text-gray-700 text-sm bg-[#e9f3d4] text-[#6d9f10] px-2 py-0.5 rounded">
                      Finalizado
                    </span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Modal de Edição - Dados do Cliente */}
      <Dialog
        open={isEditClientDialogOpen}
        onOpenChange={setIsEditClientDialogOpen}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
            <DialogTitle>Editar Dados do Cliente</DialogTitle>
            <DialogDescription className="mb-2">
              Atualize as informações cadastrais do cliente.
            </DialogDescription>

            {/* Botão Trocar Contato - agora abaixo da descrição */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditClientDialogOpen(false);
                setIsChangeContactDialogOpen(true);
              }}
              className="flex items-center gap-2 w-fit rounded-full"
            >
              <Pencil className="w-4 h-4" />
              Trocar o Contato
            </Button>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Seção 1: DADOS BÁSICOS */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                Dados Básicos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome completo */}
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <div className="relative">
                    <Input
                      id="nome"
                      value={clientData.nome}
                      onChange={(e) =>
                        setClientData({
                          ...clientData,
                          nome: e.target.value,
                        })
                      }
                      className="pr-8"
                    />
                    {clientData.nome && (
                      <button
                        onClick={() =>
                          setClientData({
                            ...clientData,
                            nome: "",
                          })
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-200 transition-colors"
                        title="Limpar"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>

                {/* CPF */}
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <div className="relative">
                    <Input
                      id="cpf"
                      value={clientData.cpf}
                      onChange={(e) =>
                        setClientData({
                          ...clientData,
                          cpf: e.target.value,
                        })
                      }
                      className="pr-8"
                    />
                    {clientData.cpf && (
                      <button
                        onClick={() =>
                          setClientData({
                            ...clientData,
                            cpf: "",
                          })
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-200 transition-colors"
                        title="Limpar"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Separador */}
            <div className="border-t" />

            {/* Seção 2: E-MAILS */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                E-mails
              </h3>
              <div className="space-y-3">
                {/* E-mail principal */}
                <div className="space-y-2">
                  <Label htmlFor="emailPrincipal">
                    E-mail principal
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="emailPrincipal"
                      type="email"
                      value={clientData.emailPrincipal}
                      onChange={(e) =>
                        setClientData({
                          ...clientData,
                          emailPrincipal: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                    <button
                      onClick={() =>
                        handleSendEmail(
                          clientData.emailPrincipal,
                        )
                      }
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                      title="Enviar e-mail"
                    >
                      <Mail className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() =>
                        handleCopyValue(
                          clientData.emailPrincipal,
                        )
                      }
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                      title="Copiar"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* E-mail secundário */}
                <div className="space-y-2">
                  <Label htmlFor="emailSecundario">
                    E-mail secundário
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="emailSecundario"
                      type="email"
                      value={clientData.emailSecundario}
                      onChange={(e) =>
                        setClientData({
                          ...clientData,
                          emailSecundario: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                    <button
                      onClick={() =>
                        handleSendEmail(
                          clientData.emailSecundario,
                        )
                      }
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                      title="Enviar e-mail"
                    >
                      <Mail className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() =>
                        handleCopyValue(
                          clientData.emailSecundario,
                        )
                      }
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                      title="Copiar"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* E-mails adicionais */}
                {clientData.emailsAdicionais.map(
                  (email, index) => (
                    <div key={index} className="space-y-2">
                      <Label htmlFor={`emailAdicional${index}`}>
                        E-mail adicional {index + 1}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`emailAdicional${index}`}
                          type="email"
                          value={email}
                          onChange={(e) =>
                            handleUpdateEmail(
                              index,
                              e.target.value,
                            )
                          }
                          className="flex-1"
                          placeholder="email@exemplo.com"
                        />
                        <button
                          onClick={() => handleSendEmail(email)}
                          className={`p-2 rounded-md transition-colors ${
                            !email
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-gray-200"
                          }`}
                          title="Enviar e-mail"
                          disabled={!email}
                        >
                          <Mail className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleCopyValue(email)}
                          className={`p-2 rounded-md transition-colors ${
                            !email
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-gray-200"
                          }`}
                          title="Copiar"
                          disabled={!email}
                        >
                          <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveEmail(index)
                          }
                          className="p-2 rounded-full bg-destructive hover:bg-destructive/90 transition-colors"
                          title="Remover e-mail"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  ),
                )}

                {/* Botão para adicionar novo e-mail */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddEmail}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo e-mail
                </Button>
              </div>
            </div>

            {/* Separador */}
            <div className="border-t" />

            {/* Seção 3: TELEFONES */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                Telefones
              </h3>
              <div className="space-y-3">
                {/* Telefone principal */}
                <div className="space-y-2">
                  <Label htmlFor="telefonePrincipal">
                    Telefone principal
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="telefonePrincipal"
                      value={clientData.telefonePrincipal}
                      onChange={(e) =>
                        setClientData({
                          ...clientData,
                          telefonePrincipal: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                    <button
                      onClick={() =>
                        handleCall(clientData.telefonePrincipal)
                      }
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                      title="Ligar"
                    >
                      <Phone className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() =>
                        handleCopyValue(
                          clientData.telefonePrincipal,
                        )
                      }
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                      title="Copiar"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Telefone secundário */}
                <div className="space-y-2">
                  <Label htmlFor="telefoneSecundario">
                    Telefone secundário
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="telefoneSecundario"
                      value={clientData.telefoneSecundario}
                      onChange={(e) =>
                        setClientData({
                          ...clientData,
                          telefoneSecundario: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                    <button
                      onClick={() =>
                        handleCall(
                          clientData.telefoneSecundario,
                        )
                      }
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                      title="Ligar"
                    >
                      <Phone className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() =>
                        handleCopyValue(
                          clientData.telefoneSecundario,
                        )
                      }
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                      title="Copiar"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Telefones adicionais */}
                {clientData.telefonesAdicionais.map(
                  (telefone, index) => (
                    <div key={index} className="space-y-2">
                      <Label
                        htmlFor={`telefoneAdicional${index}`}
                      >
                        Telefone adicional {index + 1}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`telefoneAdicional${index}`}
                          value={telefone}
                          onChange={(e) =>
                            handleUpdateTelefone(
                              index,
                              e.target.value,
                            )
                          }
                          className="flex-1"
                          placeholder="(00) 0 0000-0000"
                        />
                        <button
                          onClick={() => handleCall(telefone)}
                          className={`p-2 rounded-md transition-colors ${
                            !telefone
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-gray-200"
                          }`}
                          title="Ligar"
                          disabled={!telefone}
                        >
                          <Phone className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() =>
                            handleCopyValue(telefone)
                          }
                          className={`p-2 rounded-md transition-colors ${
                            !telefone
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-gray-200"
                          }`}
                          title="Copiar"
                          disabled={!telefone}
                        >
                          <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveTelefone(index)
                          }
                          className="p-2 rounded-full bg-destructive hover:bg-destructive/90 transition-colors"
                          title="Remover telefone"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  ),
                )}

                {/* Botão para adicionar novo telefone */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddTelefone}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo telefone
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 border-t border-border px-6 py-4 bg-muted/30">
            <Button
              variant="outline"
              onClick={() => setIsEditClientDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="brand" onClick={handleSaveClient}>
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição - Dados do Atendimento */}
      <Dialog
        open={isEditAtendimentoDialogOpen}
        onOpenChange={setIsEditAtendimentoDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Editar Dados do Atendimento
            </DialogTitle>
            <DialogDescription>
              Atualize as informações do atendimento.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 py-4">
            {/* Motivo */}
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo</Label>
              <Input
                id="motivo"
                value={atendimentoData.motivo}
                onChange={(e) =>
                  setAtendimentoData({
                    ...atendimentoData,
                    motivo: e.target.value,
                  })
                }
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input
                id="status"
                value={atendimentoData.status}
                onChange={(e) =>
                  setAtendimentoData({
                    ...atendimentoData,
                    status: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setIsEditAtendimentoDialogOpen(false)
              }
            >
              Cancelar
            </Button>
            <Button
              variant="brand"
              onClick={handleSaveAtendimento}
            >
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Mudança de Contato */}
      <ChangeContactDialog
        open={isChangeContactDialogOpen}
        onOpenChange={setIsChangeContactDialogOpen}
        onContactSelected={handleContactSelected}
      />
    </div>
  );
}