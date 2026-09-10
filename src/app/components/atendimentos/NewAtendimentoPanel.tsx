import { useState, useRef, useEffect } from "react";
import { UserPlus, X, ChevronDown, Plus, ArrowLeft, Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// ==========================================
// INTERFACES E TIPOS
// ==========================================

interface Contact {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  documento?: string;
}

// Dados mockados de contatos
const MOCK_CONTACTS: Contact[] = [
  {
    id: "1",
    nome: "Ana Silva",
    email: "ana.silva@email.com",
    telefone: "(11) 98765-4321",
    documento: "123.456.789-00",
  },
  {
    id: "2",
    nome: "Bruno Costa",
    email: "bruno.costa@email.com",
    telefone: "(21) 99876-5432",
    documento: "234.567.890-11",
  },
  {
    id: "3",
    nome: "Carla Mendes",
    email: "carla.mendes@email.com",
    telefone: "(31) 97654-3210",
    documento: "345.678.901-22",
  },
  {
    id: "4",
    nome: "Daniel Oliveira",
    email: "daniel.oliveira@email.com",
    telefone: "(41) 96543-2109",
    documento: "456.789.012-33",
  },
  {
    id: "5",
    nome: "Eduardo Ferreira",
    email: "eduardo.ferreira@email.com",
    telefone: "(51) 95432-1087",
    documento: "567.890.123-44",
  },
];

interface NewAtendimentoPanelProps {
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

// ==========================================
// DEFINIÇÃO DE TIPOS DE FORMULÁRIO
// ==========================================

interface FormularioConfig {
  id: string;
  nome: string;
  campos: {
    id: string;
    label: string;
    type:
      | "text"
      | "select"
      | "textarea"
      | "date"
      | "autocomplete-contact";
    required?: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
  }[];
}

const FORMULARIOS: FormularioConfig[] = [
  {
    id: "tecnico",
    nome: "Atendimento Técnico",
    campos: [
      {
        id: "tipoCaso",
        label: "Tipo do Caso",
        type: "select",
        required: true,
        options: [
          { value: "incidente", label: "Incidente" },
          {
            value: "requisicao",
            label: "Requisição de Serviço",
          },
          { value: "problema", label: "Problema" },
        ],
      },
      {
        id: "statusCaso",
        label: "Status do Caso",
        type: "select",
        required: true,
        options: [
          { value: "novo", label: "Novo" },
          { value: "em-andamento", label: "Em Andamento" },
          { value: "aguardando", label: "Aguardando Cliente" },
        ],
      },
      {
        id: "solicitante",
        label: "Solicitante",
        type: "autocomplete-contact",
        required: true,
        placeholder: "Selecione ou busque um contato...",
      },
      {
        id: "motivoAbertura",
        label: "Motivo da Abertura",
        type: "select",
        required: true,
        options: [
          {
            value: "equipamento",
            label: "Problema com Equipamento",
          },
          { value: "software", label: "Erro de Software" },
          { value: "acesso", label: "Problema de Acesso" },
          { value: "outro", label: "Outro" },
        ],
      },
      {
        id: "descricao",
        label: "Descrição do Problema",
        type: "textarea",
        required: true,
        placeholder:
          "Descreva o problema técnico em detalhes...",
      },
    ],
  },
  {
    id: "comercial",
    nome: "Atendimento Comercial",
    campos: [
      {
        id: "solicitante",
        label: "Solicitante",
        type: "autocomplete-contact",
        required: true,
        placeholder: "Selecione ou busque um contato...",
      },
      {
        id: "motivoContato",
        label: "Motivo do Contato",
        type: "select",
        required: true,
        options: [
          {
            value: "orcamento",
            label: "Solicitação de Orçamento",
          },
          { value: "proposta", label: "Proposta Comercial" },
          { value: "negociacao", label: "Negociação" },
          {
            value: "renovacao",
            label: "Renovação de Contrato",
          },
        ],
      },
      {
        id: "produto",
        label: "Produto/Serviço de Interesse",
        type: "select",
        required: false,
        options: [
          { value: "plano-basico", label: "Plano Básico" },
          { value: "plano-pro", label: "Plano Professional" },
          {
            value: "plano-enterprise",
            label: "Plano Enterprise",
          },
        ],
      },
      {
        id: "previsaoFechamento",
        label: "Previsão de Fechamento",
        type: "date",
        required: false,
      },
      {
        id: "observacoes",
        label: "Observações",
        type: "textarea",
        required: false,
        placeholder:
          "Informações adicionais sobre a oportunidade...",
      },
    ],
  },
  {
    id: "financeiro",
    nome: "Atendimento Financeiro",
    campos: [
      {
        id: "tipoSolicitacao",
        label: "Tipo de Solicitação",
        type: "select",
        required: true,
        options: [
          { value: "fatura", label: "Dúvida sobre Fatura" },
          {
            value: "pagamento",
            label: "Problema com Pagamento",
          },
          {
            value: "reembolso",
            label: "Solicitação de Reembolso",
          },
          {
            value: "negociacao",
            label: "Negociação de Débitos",
          },
        ],
      },
      {
        id: "solicitante",
        label: "Solicitante",
        type: "autocomplete-contact",
        required: true,
        placeholder: "Selecione ou busque um contato...",
      },
      {
        id: "numeroFatura",
        label: "Número da Fatura",
        type: "text",
        required: false,
        placeholder: "Ex: FAT-2025-001234",
      },
      {
        id: "valor",
        label: "Valor Relacionado",
        type: "text",
        required: false,
        placeholder: "R$ 0,00",
      },
      {
        id: "detalhes",
        label: "Detalhes",
        type: "textarea",
        required: true,
        placeholder: "Descreva a situação financeira...",
      },
    ],
  },
  {
    id: "suporte",
    nome: "Suporte Geral",
    campos: [
      {
        id: "categoria",
        label: "Categoria",
        type: "select",
        required: true,
        options: [
          { value: "duvida", label: "Dúvida" },
          { value: "orientacao", label: "Orientação" },
          { value: "reclamacao", label: "Reclamação" },
          { value: "elogio", label: "Elogio" },
        ],
      },
      {
        id: "solicitante",
        label: "Solicitante",
        type: "autocomplete-contact",
        required: true,
        placeholder: "Selecione ou busque um contato...",
      },
      {
        id: "assunto",
        label: "Assunto",
        type: "text",
        required: true,
        placeholder: "Título do atendimento",
      },
      {
        id: "descricao",
        label: "Descrição",
        type: "textarea",
        required: true,
        placeholder: "Descreva sua solicitação...",
      },
    ],
  },
];

// ==========================================
// COMPONENTE AUTOCOMPLETE CONTACT
// ==========================================

interface AutocompleteContactProps {
  value: string;
  onChange: (
    contactId: string,
    contact: Contact | null,
  ) => void;
  placeholder?: string;
  required?: boolean;
}

function AutocompleteContact({
  value,
  onChange,
  placeholder,
  required,
}: AutocompleteContactProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showNewContactForm, setShowNewContactForm] =
    useState(false);
  const [selectedContact, setSelectedContact] =
    useState<Contact | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Estados para novo contato - fixos
  const [newContactData, setNewContactData] = useState({
    nome: "",
    documento: "",
  });

  // Campos adicionais dinâmicos
  const [additionalFields, setAdditionalFields] = useState<
    { id: string; tipo: string; valor: string }[]
  >([]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, []);

  // Filtrar contatos
  const filteredContacts = MOCK_CONTACTS.filter(
    (contact) =>
      contact.nome
        .toLowerCase()
        .includes(inputValue.toLowerCase()) ||
      contact.email
        .toLowerCase()
        .includes(inputValue.toLowerCase()) ||
      contact.telefone
        .replace(/\D/g, "")
        .includes(inputValue.replace(/\D/g, "")) ||
      contact.documento
        ?.replace(/\D/g, "")
        .includes(inputValue.replace(/\D/g, "")),
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(val.length > 0);
    setShowNewContactForm(false);
    if (val.length === 0) {
      setSelectedContact(null);
      onChange("", null);
    }
  };

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setInputValue(contact.nome);
    setIsOpen(false);
    onChange(contact.id, contact);
  };

  const handleNewContact = () => {
    setShowNewContactForm(true);
    setIsOpen(false);
  };

  const handleSaveNewContact = () => {
    const newContact: Contact = {
      id: Date.now().toString(),
      ...newContactData,
    };
    setSelectedContact(newContact);
    setInputValue(newContact.nome);
    setShowNewContactForm(false);
    onChange(newContact.id, newContact);
    setNewContactData({
      nome: "",
      documento: "",
    });
  };

  const handleCancelNewContact = () => {
    setShowNewContactForm(false);
    setNewContactData({
      nome: "",
      documento: "",
    });
  };

  const handleInputClick = () => {
    if (!selectedContact) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={wrapperRef} className="relative space-y-2">
      {/* Input que muda conforme modo */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          {showNewContactForm ? (
            /* Input de texto normal para novo contato */
            <div className="space-y-1">
              <Label htmlFor="solicitanteNome" className="text-xs">
                Solicitante*
              </Label>
              <Input
                id="solicitanteNome"
                value={newContactData.nome}
                onChange={(e) =>
                  setNewContactData((prev) => ({
                    ...prev,
                    nome: e.target.value,
                  }))
                }
                placeholder="Digite nome completo"
                className="h-9"
              />
            </div>
          ) : (
            /* Input estilo Select normal */
            <div
              onClick={handleInputClick}
              className="relative h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-text hover:bg-accent/5 transition-colors"
            >
              <input
                value={inputValue}
                onChange={handleInputChange}
                placeholder={
                  placeholder || "Selecione ou busque..."
                }
                className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                onFocus={() =>
                  !selectedContact && setIsOpen(true)
                }
              />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          )}
        </div>

        {/* Botão que alterna entre Adicionar (+) e Fechar (X) */}
        <Button
          type="button"
          variant={showNewContactForm ? "ghost" : "brand"}
          size="sm"
          onClick={() => {
            if (showNewContactForm) {
              // Fechar formulário de novo contato
              handleCancelNewContact();
            } else {
              // Abrir formulário de novo contato
              handleNewContact();
            }
          }}
          className={showNewContactForm ? "h-9 px-3 flex-shrink-0 self-end" : "h-10 px-3 flex-shrink-0"}
          title={
            showNewContactForm
              ? "Fechar"
              : "Adicionar Novo Contato"
          }
        >
          {showNewContactForm ? (
            <X className="w-4 h-4" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Contato Selecionado - Card com Melhor Hierarquia */}
      {selectedContact && !showNewContactForm && (
        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <div className="flex gap-3">
            {/* Avatar Grande */}
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
                {selectedContact.nome
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            {/* Informações Estruturadas */}
            <div className="flex-1 min-w-0 space-y-1.5">
              {/* Nome em Destaque */}
              <h4 className="font-semibold text-sm text-foreground truncate">
                {selectedContact.nome}
              </h4>
              
              {/* Email */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Email:</span>
                <span className="text-xs text-foreground truncate">
                  {selectedContact.email}
                </span>
              </div>
              
              {/* Telefone */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Telefone:</span>
                <span className="text-xs text-foreground">
                  {selectedContact.telefone}
                </span>
              </div>
              
              {/* Documento (se existir) */}
              {selectedContact.documento && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Documento:</span>
                  <span className="text-xs text-foreground">
                    {selectedContact.documento}
                  </span>
                </div>
              )}
            </div>

            {/* Botão Editar/Trocar */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedContact(null);
                setInputValue("");
                onChange("", null);
              }}
              className="h-8 w-8 p-0 flex-shrink-0 self-start"
              title="Editar solicitante"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Dropdown de Resultados */}
      {isOpen && !showNewContactForm && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="p-3 text-center text-sm text-muted-foreground">
              Nenhum contato encontrado
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => handleSelectContact(contact)}
                className="w-full flex items-start gap-3 p-3 hover:bg-muted transition-colors text-left border-b border-border last:border-0"
              >
                {/* Avatar */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center border-2 border-white">
                  <span className="text-xs font-medium text-muted-foreground">
                    {contact.nome
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {contact.nome}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {contact.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {contact.telefone}
                    {contact.documento &&
                      ` • ${contact.documento}`}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Formulário de Novo Contato */}
      {showNewContactForm && (
        <div className="space-y-2">
          {/* Campo Documento */}
          <div className="space-y-1">
            <Label htmlFor="newDocumento" className="text-xs">
              Documento*
            </Label>
            <Input
              id="newDocumento"
              value={newContactData.documento}
              onChange={(e) =>
                setNewContactData((prev) => ({
                  ...prev,
                  documento: e.target.value,
                }))
              }
              placeholder="000.000.000-00"
              className="h-9"
            />
          </div>

          {/* Campos Adicionais Dinâmicos */}
          {additionalFields.map((field) => (
            <div key={field.id} className="flex gap-2">
              {/* Select Tipo */}
              <div className="w-1/3">
                <Select
                  value={field.tipo}
                  onValueChange={(value) => {
                    setAdditionalFields((prev) =>
                      prev.map((f) =>
                        f.id === field.id
                          ? { ...f, tipo: value }
                          : f
                      )
                    );
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="telefone-alternativo">
                      Telefone Alternativo
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Input Valor */}
              <div className="flex-1">
                <Input
                  value={field.valor}
                  onChange={(e) => {
                    setAdditionalFields((prev) =>
                      prev.map((f) =>
                        f.id === field.id
                          ? { ...f, valor: e.target.value }
                          : f
                      )
                    );
                  }}
                  placeholder="Valor"
                  className="h-9"
                />
              </div>

              {/* Botão Remover */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAdditionalFields((prev) =>
                    prev.filter((f) => f.id !== field.id)
                  );
                }}
                className="h-9 w-9 p-0 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {/* Botão Adicionar Mais Informação */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setAdditionalFields((prev) => [
                ...prev,
                {
                  id: Date.now().toString(),
                  tipo: "",
                  valor: "",
                },
              ]);
            }}
            className="w-full h-9 justify-start text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-4 h-4" />
            Adicionar mais informação
          </Button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export function NewAtendimentoPanel({
  onClose,
  onSubmit,
}: NewAtendimentoPanelProps) {
  const [formularioSelecionado, setFormularioSelecionado] =
    useState<string>("");
  const [formData, setFormData] = useState<Record<string, any>>(
    {},
  );

  // Encontrar formulário selecionado
  const formularioAtual = FORMULARIOS.find(
    (f) => f.id === formularioSelecionado,
  );

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleContactChange = (
    fieldId: string,
    contactId: string,
    contact: Contact | null,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: contactId,
      [`${fieldId}_data`]: contact,
    }));
  };

  const handleSubmit = () => {
    const data = {
      formulario: formularioSelecionado,
      campos: formData,
    };
    console.log("Criar caso com os dados:", data);
    if (onSubmit) {
      onSubmit(data);
    }
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFormularioSelecionado("");
    setFormData({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Validação do formulário
  const isFormValid = () => {
    if (!formularioSelecionado) return false;

    if (formularioAtual) {
      const camposObrigatorios = formularioAtual.campos.filter(
        (c) => c.required,
      );
      return camposObrigatorios.every((campo) => {
        const value = formData[campo.id];
        if (typeof value === "string") {
          return value.trim() !== "";
        }
        return (
          value !== undefined && value !== null && value !== ""
        );
      });
    }

    return false;
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* HEADER FIXO */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-base font-semibold text-foreground">
          Novo Atendimento
        </h2>
      </div>

      {/* CONTEÚDO SCROLLÁVEL */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="space-y-6 max-w-2xl">
          {/* INPUT GATILHO: Selecione o formulário */}
          <div className="space-y-2">
            <Label
              htmlFor="tipoFormulario"
              className="text-sm font-medium"
            >
              Selecione o formulário de atendimento*
            </Label>
            <Select
              value={formularioSelecionado}
              onValueChange={(value) => {
                setFormularioSelecionado(value);
                setFormData({}); // Limpa dados ao trocar formulário
              }}
            >
              <SelectTrigger
                id="tipoFormulario"
                className="h-10"
              >
                <SelectValue placeholder="Selecionar tipo de atendimento" />
              </SelectTrigger>
              <SelectContent>
                {FORMULARIOS.map((form) => (
                  <SelectItem key={form.id} value={form.id}>
                    {form.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* CAMPOS DINÂMICOS */}
          {formularioAtual && (
            <div className="space-y-4">
              {formularioAtual.campos.map((campo) => (
                <div key={campo.id} className="space-y-2">
                  <Label
                    htmlFor={campo.id}
                    className="text-sm font-medium"
                  >
                    {campo.label}
                    {campo.required && (
                      <span className="text-destructive ml-0.5">
                        *
                      </span>
                    )}
                  </Label>

                  {/* SELECT */}
                  {campo.type === "select" && (
                    <Select
                      value={formData[campo.id] || ""}
                      onValueChange={(value) =>
                        handleFieldChange(campo.id, value)
                      }
                    >
                      <SelectTrigger
                        id={campo.id}
                        className="h-10"
                      >
                        <SelectValue
                          placeholder={
                            campo.placeholder ||
                            `Selecionar ${campo.label.toLowerCase()}`
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {campo.options?.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* TEXT INPUT */}
                  {campo.type === "text" && (
                    <Input
                      id={campo.id}
                      value={formData[campo.id] || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          campo.id,
                          e.target.value,
                        )
                      }
                      placeholder={campo.placeholder}
                      className="h-10"
                    />
                  )}

                  {/* DATE INPUT */}
                  {campo.type === "date" && (
                    <Input
                      id={campo.id}
                      type="date"
                      value={formData[campo.id] || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          campo.id,
                          e.target.value,
                        )
                      }
                      className="h-10"
                    />
                  )}

                  {/* TEXTAREA */}
                  {campo.type === "textarea" && (
                    <Textarea
                      id={campo.id}
                      value={formData[campo.id] || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          campo.id,
                          e.target.value,
                        )
                      }
                      placeholder={campo.placeholder}
                      rows={4}
                      className="resize-none"
                    />
                  )}

                  {/* AUTOCOMPLETE CONTACT */}
                  {campo.type === "autocomplete-contact" && (
                    <AutocompleteContact
                      value={formData[campo.id] || ""}
                      onChange={(contactId, contact) =>
                        handleContactChange(
                          campo.id,
                          contactId,
                          contact,
                        )
                      }
                      placeholder={campo.placeholder}
                      required={campo.required}
                    />
                  )}
                </div>
              ))}

              <p className="text-xs text-muted-foreground pt-2">
                *Campos obrigatórios
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER FIXO */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border flex-shrink-0 bg-background">
        <Button variant="ghost" onClick={handleClose}>
          Cancelar
        </Button>
        <Button
          variant="brand"
          onClick={handleSubmit}
          disabled={!isFormValid()}
        >
          Criar Caso
        </Button>
      </div>
    </div>
  );
}