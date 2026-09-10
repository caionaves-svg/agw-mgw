import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { usePermissions, Module, Action } from "../contexts/PermissionsContext";
import { AlertCircle, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Text } from "./ui/text";

// ============================================
// TIPOS
// ============================================

interface ProtectedRouteProps {
  children: ReactNode;
  module: Module;
  action?: Action;
  fallback?: ReactNode;
  redirectTo?: string;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * Componente para proteger rotas baseado em permissões
 * 
 * @param children - Conteúdo a ser renderizado se o usuário tiver permissão
 * @param module - Módulo que requer permissão
 * @param action - Ação específica (padrão: "view")
 * @param fallback - Componente customizado para exibir quando não tem permissão
 * @param redirectTo - Rota para redirecionar quando não tem permissão
 * 
 * @example
 * <ProtectedRoute module="atendimentos" action="view">
 *   <AtendimentosPage />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  module,
  action = "view",
  fallback,
  redirectTo,
}: ProtectedRouteProps) {
  const { hasPermission, isLoading, user, getAccessibleModules } = usePermissions();
  const location = useLocation();

  // Mostrar loading enquanto carrega permissões
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mb-4"></div>
          <Text variant="base" className="text-muted-foreground">
            Carregando permissões...
          </Text>
        </div>
      </div>
    );
  }

  // Verificar se usuário está autenticado
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar permissão
  const hasAccess = hasPermission(module, action);

  if (!hasAccess) {
    // Se forneceu fallback customizado, usar ele
    if (fallback) {
      return <>{fallback}</>;
    }

    // Se forneceu rota de redirecionamento, redirecionar
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // Caso contrário, mostrar tela de acesso negado padrão
    return <NoPermissionScreen module={module} action={action} />;
  }

  // Usuário tem permissão, renderizar conteúdo
  return <>{children}</>;
}

// ============================================
// COMPONENTE DE ACESSO NEGADO
// ============================================

interface NoPermissionScreenProps {
  module: Module;
  action: Action;
}

function NoPermissionScreen({ module, action }: NoPermissionScreenProps) {
  const { getAccessibleModules } = usePermissions();
  const accessibleModules = getAccessibleModules();

  const moduleLabels: Record<Module, string> = {
    atendimentos: "Atendimentos",
    casos: "Casos",
    usuarios: "Usuários",
    relatorios: "Relatórios",
    analytics: "Analytics",
    configuracoes: "Configurações",
    ajuda: "Ajuda",
  };

  const actionLabels: Record<Action, string> = {
    view: "visualizar",
    create: "criar",
    edit: "editar",
    delete: "excluir",
    export: "exportar",
    manage: "gerenciar",
  };

  const getRedirectPath = (): string => {
    if (accessibleModules.includes("atendimentos")) return "/atendimentos";
    if (accessibleModules.includes("casos")) return "/casos";
    if (accessibleModules.includes("usuarios")) return "/usuarios";
    if (accessibleModules.includes("relatorios")) return "/relatorios";
    if (accessibleModules.includes("analytics")) return "/analytics";
    if (accessibleModules.includes("configuracoes")) return "/configuracoes";
    return "/";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center max-w-md px-6">
        {/* Ícone */}
        <div className="mb-6 flex justify-center">
          <div className="bg-muted rounded-full p-6">
            <Lock className="w-16 h-16 text-muted-foreground" />
          </div>
        </div>

        {/* Título */}
        <h1
          className="font-semibold text-foreground mb-3"
          style={{ fontSize: "var(--text-2xl)" }}
        >
          Acesso Negado
        </h1>

        {/* Mensagem */}
        <div className="space-y-3 mb-6">
          <Text variant="base" className="text-muted-foreground">
            Você não tem permissão para{" "}
            <span className="font-medium text-foreground">
              {actionLabels[action]}
            </span>{" "}
            o módulo de{" "}
            <span className="font-medium text-foreground">
              {moduleLabels[module]}
            </span>
            .
          </Text>

          <div className="bg-muted/50 border border-border rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <Text variant="sm" className="text-muted-foreground text-left">
              Se você acredita que deveria ter acesso a este módulo, entre em
              contato com o administrador do sistema para solicitar as
              permissões necessárias.
            </Text>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="gap-1"
          >
            Voltar
          </Button>
          {accessibleModules.length > 0 && (
            <Button
              variant="brand"
              onClick={() => (window.location.href = getRedirectPath())}
              className="gap-1"
            >
              Ir para página inicial
            </Button>
          )}
        </div>

        {/* Módulos disponíveis */}
        {accessibleModules.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <Text variant="sm" className="text-muted-foreground mb-3">
              Módulos disponíveis para você:
            </Text>
            <div className="flex flex-wrap gap-2 justify-center">
              {accessibleModules.map((mod) => (
                <span
                  key={mod}
                  className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-xs font-medium"
                >
                  {moduleLabels[mod]}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

/**
 * Componente para proteger elementos individuais da UI
 * Não renderiza nada se o usuário não tiver permissão
 * 
 * @example
 * <ProtectedElement module="usuarios" action="create">
 *   <Button>Novo Usuário</Button>
 * </ProtectedElement>
 */
interface ProtectedElementProps {
  children: ReactNode;
  module: Module;
  action?: Action;
  fallback?: ReactNode;
}

export function ProtectedElement({
  children,
  module,
  action = "view",
  fallback,
}: ProtectedElementProps) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(module, action)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
