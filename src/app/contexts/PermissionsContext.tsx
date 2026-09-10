import { createContext, useContext, ReactNode, useState, useEffect } from "react";

// ============================================
// TIPOS E DEFINIÇÕES
// ============================================

/**
 * Módulos disponíveis na plataforma
 */
export type Module =
  | "atendimentos"
  | "casos"
  | "usuarios"
  | "relatorios"
  | "analytics"
  | "configuracoes"
  | "ajuda";

/**
 * Ações possíveis em cada módulo
 */
export type Action = "view" | "create" | "edit" | "delete" | "export" | "manage";

/**
 * Papel/Função do usuário na plataforma
 */
export type UserRole =
  | "super_admin"      // Acesso total
  | "admin"            // Acesso à maioria das funções
  | "supervisor"       // Gerenciamento + Visualização
  | "atendente"        // Apenas atendimentos
  | "gestor"           // Relatórios + Analytics
  | "custom";          // Permissões customizadas

/**
 * Estrutura de permissão individual
 */
export interface Permission {
  module: Module;
  actions: Action[];
}

/**
 * Perfil de usuário com permissões
 */
export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
}

/**
 * Context state
 */
interface PermissionsContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  hasPermission: (module: Module, action?: Action) => boolean;
  hasAnyPermission: (modules: Module[]) => boolean;
  canAccessRoute: (path: string) => boolean;
  getAccessibleModules: () => Module[];
  isLoading: boolean;
}

// ============================================
// PRESETS DE PERMISSÕES POR PAPEL
// ============================================

const rolePermissionsPresets: Record<UserRole, Permission[]> = {
  super_admin: [
    { module: "atendimentos", actions: ["view", "create", "edit", "delete", "export", "manage"] },
    { module: "casos", actions: ["view", "create", "edit", "delete", "export", "manage"] },
    { module: "usuarios", actions: ["view", "create", "edit", "delete", "export", "manage"] },
    { module: "relatorios", actions: ["view", "create", "edit", "delete", "export", "manage"] },
    { module: "analytics", actions: ["view", "export", "manage"] },
    { module: "configuracoes", actions: ["view", "create", "edit", "delete", "manage"] },
    { module: "ajuda", actions: ["view"] },
  ],
  
  admin: [
    { module: "atendimentos", actions: ["view", "create", "edit", "delete", "export"] },
    { module: "casos", actions: ["view", "create", "edit", "delete", "export"] },
    { module: "usuarios", actions: ["view", "create", "edit", "export"] },
    { module: "relatorios", actions: ["view", "export"] },
    { module: "analytics", actions: ["view", "export"] },
    { module: "configuracoes", actions: ["view", "edit"] },
    { module: "ajuda", actions: ["view"] },
  ],
  
  supervisor: [
    { module: "atendimentos", actions: ["view", "create", "edit", "export"] },
    { module: "casos", actions: ["view", "create", "edit", "export"] },
    { module: "usuarios", actions: ["view"] },
    { module: "relatorios", actions: ["view", "export"] },
    { module: "analytics", actions: ["view"] },
    { module: "ajuda", actions: ["view"] },
  ],
  
  atendente: [
    { module: "atendimentos", actions: ["view", "create", "edit"] },
    { module: "casos", actions: ["view", "create"] },
    { module: "ajuda", actions: ["view"] },
  ],
  
  gestor: [
    { module: "relatorios", actions: ["view", "create", "export"] },
    { module: "analytics", actions: ["view", "export"] },
    { module: "casos", actions: ["view", "export"] },
    { module: "usuarios", actions: ["view"] },
    { module: "ajuda", actions: ["view"] },
  ],
  
  custom: [], // Será preenchido com permissões customizadas
};

// ============================================
// MAPEAMENTO DE ROTAS PARA MÓDULOS
// ============================================

const routeToModuleMap: Record<string, Module> = {
  "/atendimentos": "atendimentos",
  "/casos": "casos",
  "/usuarios": "usuarios",
  "/relatorios": "relatorios",
  "/analytics": "analytics",
  "/configuracoes": "configuracoes",
  "/ajuda": "ajuda",
};

// ============================================
// CONTEXT
// ============================================

const PermissionsContext = createContext<PermissionsContextType | undefined>(
  undefined
);

// ============================================
// PROVIDER
// ============================================

interface PermissionsProviderProps {
  children: ReactNode;
}

export function PermissionsProvider({ children }: PermissionsProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simular carregamento de permissões do backend
  useEffect(() => {
    // TODO: Substituir por chamada real à API
    const loadUserPermissions = async () => {
      try {
        // Simulação de usuário logado
        // Em produção, isso viria de uma API ou localStorage
        const mockUser: UserProfile = {
          id: "1",
          nome: "Maria Silva",
          email: "maria.silva@exemplo.com",
          role: "super_admin", // Alterar para testar diferentes papéis
          permissions: rolePermissionsPresets.super_admin,
        };

        // Simular delay de rede
        await new Promise((resolve) => setTimeout(resolve, 500));

        setUser(mockUser);
      } catch (error) {
        console.error("Erro ao carregar permissões:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserPermissions();
  }, []);

  /**
   * Verifica se o usuário tem permissão para uma ação específica em um módulo
   */
  const hasPermission = (module: Module, action?: Action): boolean => {
    if (!user) return false;

    const modulePermission = user.permissions.find(
      (p) => p.module === module
    );

    if (!modulePermission) return false;

    // Se não especificou ação, verifica se tem pelo menos uma permissão no módulo
    if (!action) return modulePermission.actions.length > 0;

    // Verifica se tem a ação específica
    return modulePermission.actions.includes(action);
  };

  /**
   * Verifica se o usuário tem acesso a pelo menos um dos módulos
   */
  const hasAnyPermission = (modules: Module[]): boolean => {
    if (!user) return false;
    return modules.some((module) => hasPermission(module));
  };

  /**
   * Verifica se o usuário pode acessar uma rota específica
   */
  const canAccessRoute = (path: string): boolean => {
    if (!user) return false;

    // Rota raiz sempre acessível se tiver qualquer permissão
    if (path === "/") {
      return user.permissions.length > 0;
    }

    // Buscar módulo correspondente à rota
    const matchedModule = Object.entries(routeToModuleMap).find(([route]) =>
      path.startsWith(route)
    );

    if (!matchedModule) {
      // Rota não mapeada - permitir por padrão (ex: /perfil)
      return true;
    }

    const [, module] = matchedModule;
    return hasPermission(module, "view");
  };

  /**
   * Retorna lista de módulos que o usuário pode acessar
   */
  const getAccessibleModules = (): Module[] => {
    if (!user) return [];
    return user.permissions
      .filter((p) => p.actions.includes("view"))
      .map((p) => p.module);
  };

  const value: PermissionsContextType = {
    user,
    setUser,
    hasPermission,
    hasAnyPermission,
    canAccessRoute,
    getAccessibleModules,
    isLoading,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function usePermissions() {
  const context = useContext(PermissionsContext);

  if (context === undefined) {
    throw new Error(
      "usePermissions deve ser usado dentro de um PermissionsProvider"
    );
  }

  return context;
}

// ============================================
// HELPERS EXPORTADOS
// ============================================

/**
 * Retorna as permissões padrão para um papel específico
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return rolePermissionsPresets[role] || [];
}

/**
 * Cria um usuário com permissões customizadas
 */
export function createCustomUser(
  id: string,
  nome: string,
  email: string,
  customPermissions: Permission[]
): UserProfile {
  return {
    id,
    nome,
    email,
    role: "custom",
    permissions: customPermissions,
  };
}
