import { useState, useRef, useEffect } from "react";
import { UserPlus, X, ChevronDown, Plus, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Contact {
  id: string;
  nome: string;
  documento: string;
  telefone?: string;
  email?: string;
}

interface ChangeContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactSelected: (contact: Contact) => void;
}

// Mock de contatos existentes (substituir por API real)
const MOCK_CONTACTS: Contact[] = [
  {
    id: "1",
    nome: "Maria Silva Santos",
    documento: "123.456.789-00",
    telefone: "(34) 9 9999-1111",
    email: "maria.silva@email.com",
  },
  {
    id: "2",
    nome: "João Pedro Oliveira",
    documento: "987.654.321-00",
    telefone: "(34) 9 8888-2222",
    email: "joao.pedro@email.com",
  },
  {
    id: "3",
    nome: "Ana Paula Costa",
    documento: "456.789.123-00",
    telefone: "(34) 9 7777-3333",
    email: "ana.costa@email.com",
  },
  {
    id: "4",
    nome: "Carlos Eduardo Ferreira",
    documento: "321.654.987-00",
    telefone: "(34) 9 6666-4444",
    email: "carlos.ferreira@email.com",
  },
  {
    id: "5",
    nome: "Juliana Almeida Rodrigues",
    documento: "789.123.456-00",
    telefone: "(34) 9 5555-5555",
    email: "juliana.almeida@email.com",
  },
];

const CONTACT_TYPES = [
  { value: "celular", label: "Celular" },
  { value: "telefone", label: "Telefone Fixo" },
  { value: "email", label: "E-mail" },
  { value: "whatsapp", label: "WhatsApp" },
];

export function ChangeContactDialog({
  open,
  onOpenChange,
  onContactSelected,
}: ChangeContactDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNewContactForm, setShowNewContactForm] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Estados para novo contato
  const [newContactData, setNewContactData] = useState({
    nome: "",
    documento: "",
  });

  // Campos de contato dinâmicos (grid 2 colunas)
  const [contactFields, setContactFields] = useState<
    { id: string; tipo: string; valor: string }[]
  >([{ id: "1", tipo: "", valor: "" }]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrar contatos
  const filteredContacts = MOCK_CONTACTS.filter(
    (contact) =>
      contact.nome.toLowerCase().includes(inputValue.toLowerCase()) ||
      contact.documento.replace(/\D/g, "").includes(inputValue.replace(/\D/g, "")) ||
      contact.telefone?.replace(/\D/g, "").includes(inputValue.replace(/\D/g, "")) ||
      contact.email?.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsDropdownOpen(val.length > 0);
    if (val.length === 0) {
      setSelectedContact(null);
    }
  };

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setInputValue(contact.nome);
    setIsDropdownOpen(false);
  };

  const handleNewContact = () => {
    setShowNewContactForm(true);
    setIsDropdownOpen(false);
  };

  const handleCancelNewContact = () => {
    setShowNewContactForm(false);
    setNewContactData({ nome: "", documento: "" });
    setContactFields([{ id: "1", tipo: "", valor: "" }]);
  };

  const handleAddContactField = () => {
    setContactFields((prev) => [
      ...prev,
      { id: Date.now().toString(), tipo: "", valor: "" },
    ]);
  };

  const handleRemoveContactField = (id: string) => {
    setContactFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpdateContactField = (
    id: string,
    field: "tipo" | "valor",
    value: string,
  ) => {
    setContactFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    );
  };

  const handleTrocarContato = () => {
    if (showNewContactForm) {
      // Criar novo contato
      const telefone = contactFields.find(
        (f) => f.tipo === "celular" || f.tipo === "telefone",
      )?.valor;
      const email = contactFields.find((f) => f.tipo === "email")?.valor;

      const newContact: Contact = {
        id: Date.now().toString(),
        nome: newContactData.nome,
        documento: newContactData.documento,
        telefone,
        email,
      };

      onContactSelected(newContact);
    } else if (selectedContact) {
      // Contato existente selecionado
      onContactSelected(selectedContact);
    }

    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    setInputValue("");
    setSelectedContact(null);
    setShowNewContactForm(false);
    setNewContactData({ nome: "", documento: "" });
    setContactFields([{ id: "1", tipo: "", valor: "" }]);
  };

  const isFormValid = () => {
    if (showNewContactForm) {
      // Validar formulário de novo contato
      return (
        newContactData.nome.trim().length > 0 &&
        newContactData.documento.replace(/\D/g, "").length >= 11 &&
        contactFields.some((f) => f.tipo && f.valor.trim())
      );
    }
    // Validar seleção de contato existente
    return selectedContact !== null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          {showNewContactForm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelNewContact}
              className="absolute left-4 top-4 h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <DialogTitle>Trocar o Contato</DialogTitle>
          <DialogDescription>
            Selecione um contato existente ou crie um novo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!showNewContactForm ? (
            /* Modo de Busca/Seleção */
            <div ref={wrapperRef} className="relative space-y-4">
              {/* Input estilo Select com Autocomplete */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <div
                    onClick={() =>
                      !selectedContact && setIsDropdownOpen(true)
                    }
                    className="relative h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-text hover:bg-accent/5 transition-colors"
                  >
                    <input
                      value={inputValue}
                      onChange={handleInputChange}
                      placeholder="Selecione um contato existente ou crie um novo"
                      className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Botão Novo */}
                <Button
                  type="button"
                  variant="brand"
                  size="sm"
                  onClick={handleNewContact}
                  className="h-10 px-3 flex-shrink-0"
                  title="Adicionar Novo Contato"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>

              {/* Dropdown de Resultados */}
              {isDropdownOpen && (
                <div className="absolute z-50 w-[calc(100%-56px)] mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
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
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                            {contact.nome
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {contact.nome}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            CPF: {contact.documento}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {contact.telefone}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Card do Contato Selecionado */}
              {selectedContact && (
                <div className="bg-muted/30 border border-border rounded-lg p-4 relative">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-14 h-14 flex-shrink-0">
                      <AvatarFallback className="bg-muted text-muted-foreground font-medium text-lg">
                        {selectedContact.nome
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1 pt-0.5">
                      <p className="font-semibold text-foreground text-lg">
                        {selectedContact.nome}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedContact.documento}
                      </p>
                      {selectedContact.email && (
                        <p className="text-sm text-muted-foreground">
                          {selectedContact.email}
                        </p>
                      )}
                      {selectedContact.telefone && (
                        <p className="text-sm text-muted-foreground">
                          {selectedContact.telefone}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedContact(null);
                        setInputValue("");
                      }}
                      className="absolute top-3 right-3 h-8 w-8 p-0 hover:bg-muted"
                      title="Remover seleção"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Modo de Criação de Novo Contato */
            <div className="space-y-4">
              {/* Nome Completo */}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <div className="relative">
                  <Input
                    id="nome"
                    value={newContactData.nome}
                    onChange={(e) =>
                      setNewContactData((prev) => ({
                        ...prev,
                        nome: e.target.value,
                      }))
                    }
                    placeholder="Digite o nome completo"
                    className="pr-8"
                  />
                  {newContactData.nome && (
                    <button
                      onClick={() =>
                        setNewContactData((prev) => ({
                          ...prev,
                          nome: "",
                        }))
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-200 transition-colors"
                      title="Limpar"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>

              {/* Documento */}
              <div className="space-y-2">
                <Label htmlFor="documento">Documento*</Label>
                <Input
                  id="documento"
                  value={newContactData.documento}
                  onChange={(e) =>
                    setNewContactData((prev) => ({
                      ...prev,
                      documento: e.target.value,
                    }))
                  }
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>

              {/* Separador Contato */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Contato
                  </span>
                </div>
              </div>

              {/* Campos de Contato em Grid 2 Colunas */}
              <div className="space-y-3">
                {contactFields.map((field, index) => (
                  <div key={field.id} className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Coluna 1: Select Tipo */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          Contato*
                          <span className="text-muted-foreground" title="Selecione o tipo de contato">ⓘ</span>
                        </Label>
                        <Select
                          value={field.tipo}
                          onValueChange={(value) =>
                            handleUpdateContactField(
                              field.id,
                              "tipo",
                              value,
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {CONTACT_TYPES.map((type) => (
                              <SelectItem
                                key={type.value}
                                value={type.value}
                              >
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Coluna 2: Input Valor */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          Contato*
                          <span className="text-muted-foreground" title="Digite o contato">ⓘ</span>
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            value={field.valor}
                            onChange={(e) =>
                              handleUpdateContactField(
                                field.id,
                                "valor",
                                e.target.value,
                              )
                            }
                            placeholder="Digite o contato"
                            className="flex-1"
                          />
                          {contactFields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemoveContactField(field.id)
                              }
                              className="h-10 w-10 p-0 flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Botão Adicionar Contato */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddContactField}
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar contato
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-full"
          >
            Cancelar
          </Button>
          <Button
            variant="brand"
            onClick={handleTrocarContato}
            disabled={!isFormValid()}
            className="rounded-full"
          >
            Trocar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
