import { useState } from "react";
import {
  Phone,
  Users,
  Clock,
  PhoneForwarded,
  PauseCircle,
  LogOut,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { Text } from "../ui/text";

// --- Types ---

type MenuScreen =
  | "main"
  | "ligar-interno"
  | "alterar-linha"
  | "transferir";

export interface WebPhoneMenuProps {
  onClose?: () => void;
  onLogout?: () => void;
}

// --- Sub-components ---

interface MenuHeaderProps {
  title: string;
  onBack: () => void;
}

function MenuHeader({ title, onBack }: MenuHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
      <button
        onClick={onBack}
        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <Text as="h3" variant="sm" className="font-semibold">
        {title}
      </Text>
    </div>
  );
}

interface MenuItemProps {
  icon?: React.ElementType;
  label: string;
  onClick?: () => void;
  hasArrow?: boolean;
  isDestructive?: boolean;
  rightContent?: React.ReactNode;
  description?: string;
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  hasArrow = false,
  isDestructive = false,
  rightContent,
  description,
}: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-muted transition-colors ${
        isDestructive ? "text-red-600 hover:bg-red-50" : ""
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <div className="flex-1 text-left">
        <Text as="span" variant="sm">
          {label}
        </Text>
        {description && (
          <Text as="p" variant="xs" className="text-muted-foreground">
            {description}
          </Text>
        )}
      </div>
      {rightContent}
      {hasArrow && (
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );
}

interface SectionHeaderProps {
  title: string;
}

function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="px-3 py-1.5">
      <Text
        as="span"
        variant="xs"
        className="font-semibold text-muted-foreground uppercase tracking-wide"
      >
        {title}
      </Text>
    </div>
  );
}

// --- WebPhone Menu Content ---

export default function WebPhoneMenu({
  onClose,
  onLogout,
}: WebPhoneMenuProps) {
  const [currentScreen, setCurrentScreen] = useState<MenuScreen>("main");

  const handleBack = () => {
    setCurrentScreen("main");
  };

  const handleAction = (action: string) => {
    console.log(`WebPhone ação: ${action}`);
    onClose?.();
  };

  // --- Main Screen ---
  if (currentScreen === "main") {
    return (
      <div className="w-80">
        {/* Seção CHAMADAS */}
        <div className="p-1">
          <SectionHeader title="Chamadas" />
          <MenuItem
            icon={Users}
            label="Ligar para um agente interno"
            hasArrow
            onClick={() => setCurrentScreen("ligar-interno")}
          />
          <MenuItem
            icon={Phone}
            label="Alterar linha do atendimento"
            hasArrow
            onClick={() => setCurrentScreen("alterar-linha")}
          />
          <MenuItem
            icon={Clock}
            label="Colocar em espera"
            onClick={() => handleAction("colocar-em-espera")}
          />
          <MenuItem
            icon={PhoneForwarded}
            label="Transferir ligação / conferência"
            hasArrow
            onClick={() => setCurrentScreen("transferir")}
          />
        </div>

        <div className="h-px bg-border" />

        {/* Seção STATUS */}
        <div className="p-1">
          <SectionHeader title="Status" />
          <MenuItem
            icon={PauseCircle}
            label="Pausar recebimentos de chamadas"
            description="Você não receberá novas chamadas"
            onClick={() => handleAction("pausar-chamadas")}
          />
        </div>

        <div className="h-px bg-border" />

        {/* Seção SISTEMA */}
        <div className="p-1">
          <MenuItem
            icon={LogOut}
            label="Deslogar webphone"
            isDestructive
            onClick={onLogout}
          />
        </div>
      </div>
    );
  }

  // --- Ligar para Interno Screen ---
  if (currentScreen === "ligar-interno") {
    return (
      <div className="w-80">
        <MenuHeader
          title="Ligar para agente interno"
          onBack={handleBack}
        />
        <div className="p-3">
          <Text variant="sm" className="text-muted-foreground mb-3">
            Selecione um agente para ligar:
          </Text>
          
          <div className="space-y-1">
            <MenuItem
              label="Carlos Silva"
              description="Ramal 101 • Disponível"
              onClick={() => handleAction("ligar-para-carlos")}
            />
            <MenuItem
              label="Ana Costa"
              description="Ramal 102 • Em atendimento"
              onClick={() => handleAction("ligar-para-ana")}
            />
            <MenuItem
              label="Roberto Santos"
              description="Ramal 103 • Disponível"
              onClick={() => handleAction("ligar-para-roberto")}
            />
            <MenuItem
              label="Juliana Oliveira"
              description="Ramal 104 • Em pausa"
              onClick={() => handleAction("ligar-para-juliana")}
            />
          </div>
        </div>
      </div>
    );
  }

  // --- Alterar Linha Screen ---
  if (currentScreen === "alterar-linha") {
    return (
      <div className="w-80">
        <MenuHeader
          title="Alterar linha do atendimento"
          onBack={handleBack}
        />
        <div className="p-3">
          <Text variant="sm" className="text-muted-foreground mb-3">
            Selecione a linha para este atendimento:
          </Text>
          
          <div className="space-y-1">
            <MenuItem
              label="Linha Suporte"
              description="+55 (34) 3333-1001"
              onClick={() => handleAction("linha-suporte")}
            />
            <MenuItem
              label="Linha Vendas"
              description="+55 (34) 3333-1002"
              onClick={() => handleAction("linha-vendas")}
            />
            <MenuItem
              label="Linha Financeiro"
              description="+55 (34) 3333-1003"
              onClick={() => handleAction("linha-financeiro")}
            />
            <MenuItem
              label="Linha Geral"
              description="+55 (34) 3333-1000"
              onClick={() => handleAction("linha-geral")}
            />
          </div>
        </div>
      </div>
    );
  }

  // --- Transferir/Conferência Screen ---
  if (currentScreen === "transferir") {
    return (
      <div className="w-80">
        <MenuHeader
          title="Transferir / Conferência"
          onBack={handleBack}
        />
        <div className="p-1">
          <SectionHeader title="Tipo de transferência" />
          <MenuItem
            label="Transferência direta"
            description="Transfere sem consultar o agente"
            onClick={() => handleAction("transferencia-direta")}
          />
          <MenuItem
            label="Transferência consultada"
            description="Consulta o agente antes de transferir"
            onClick={() => handleAction("transferencia-consultada")}
          />
          <MenuItem
            label="Criar conferência"
            description="Adiciona outro participante na chamada"
            onClick={() => handleAction("criar-conferencia")}
          />
        </div>

        <div className="h-px bg-border" />

        <div className="p-1">
          <SectionHeader title="Destino" />
          <MenuItem
            label="Transferir para agente"
            hasArrow
            onClick={() => setCurrentScreen("ligar-interno")}
          />
          <MenuItem
            label="Transferir para número externo"
            onClick={() => handleAction("transferir-externo")}
          />
        </div>
      </div>
    );
  }

  return null;
}
