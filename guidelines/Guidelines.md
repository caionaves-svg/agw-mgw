# Sistema de Design - Plataforma Omnichannel

## Índice
1. [Arquitetura e Organização](#arquitetura-e-organização)
2. [Sistema de Permissionamento](#sistema-de-permissionamento)
3. [Preferências do Usuário](#preferências-do-usuário)

---

## Arquitetura e Organização

### Estrutura de Pastas

A aplicação está organizada por **features/módulos** para facilitar manutenção e escalabilidade:

```
/
├── components/
│   ├── admin/                    # Componentes de administração e configurações
│   ├── atendimentos/             # Componentes específicos de atendimentos
│   ├── casos/                    # Componentes específicos de casos
│   ├── gerenciamento/            # Componentes de monitoramento e gestão ⭐
│   │   ├── GerenciamentoOverview.tsx  # Dashboard principal
│   │   └── shared/               # Componentes compartilhados
│   │       ├── MetricCard.tsx    # Card de métricas
│   │       ├── StatWidget.tsx    # Widget de estatísticas
│   │       └── AlertCard.tsx     # Card de alertas
│   ├── interaction-panel/        # Painel de interação lateral (Info, Jornada, etc.)
│   ├── webphone/                 # Componentes do WebPhone ⭐
│   │   ├── WebPhone.tsx          # Componente principal do WebPhone
│   │   ├── WebPhoneLogin.tsx     # Tela de login do WebPhone
│   │   └── ActiveCallWidget.tsx  # Widget de chamada ativa
│   ├── ui/                       # Componentes de UI reutilizáveis (shadcn/ui)
│   ├── figma/                    # Componentes protegidos do Figma
│   ├── pictograms/               # Pictogramas customizados (light/dark mode)
│   ├── AppHeader.tsx             # Cabeçalho global da aplicação
│   ├── GlobalRightPanel.tsx      # Painel lateral direito global (Wizz, Apps)
│   ├── ProtectedRoute.tsx        # Componente para proteção de rotas
│   └── ...                       # Outros componentes compartilhados
│
├── pages/                        # Páginas principais da aplicação
│   ├── AtendimentosPage.tsx      # Página de atendimentos
│   ├── GerenciamentoPage.tsx     # Centro de controle operacional ⭐
│   ├── CasosPage.tsx             # Página de casos
│   ├── UsuariosPage.tsx          # Página de usuários
│   ├── RelatoriosPage.tsx        # Página de relatórios
│   ├── AnalyticsPage.tsx         # Página de analytics
│   └── AjudaPage.tsx             # Página de ajuda
│
├── contexts/                     # Contextos React (estado global)
│   ├── PermissionsContext.tsx    # Sistema de permissionamento ⭐
│   ├── PreferencesContext.tsx    # Preferências de tema e fonte
│   ├── CallContext.tsx           # Estado de chamadas ativas + WebPhone ⭐
│   ├── DataContext.tsx           # Dados da aplicação
│   ├── SidePanelContext.tsx      # Estado do painel lateral
│   └── NavigationContext.tsx     # Estado de navegação
│
├── hooks/                        # Custom hooks
│   └── useNavigation.ts
│
├── styles/                       # Estilos globais
│   └── globals.css
│
├── imports/                      # Componentes e assets do Figma
│
└── guidelines/                   # Documentação
    └── Guidelines.md
```

### Princípios de Organização

1. **Separação por Feature**: Componentes agrupados por funcionalidade/módulo
2. **Componentes Compartilhados**: Na raiz de `/components/` apenas componentes usados em múltiplos módulos
3. **Páginas Limpas**: `/pages/` contém apenas a composição de componentes, lógica mínima
4. **Contexts Centralizados**: Todo estado global em `/contexts/`
5. **UI Components**: shadcn/ui sempre em `/components/ui/`

### Onde Colocar Novos Arquivos

| Tipo de Arquivo | Local | Exemplo |
|-----------------|-------|---------|
| Componente específico de atendimentos | `/components/atendimentos/` | `ContactItem.tsx` |
| Componente específico de casos | `/components/casos/` | `CasosHeader.tsx` |
| Componente específico de admin | `/components/admin/` | `BusinessUnits.tsx` |
| Componente específico de WebPhone | `/components/webphone/` | `WebPhoneLogin.tsx` |
| Seção do InteractionPanel | `/components/interaction-panel/` | `BillingSection.tsx` |
| Componente de UI reutilizável | `/components/ui/` | `button.tsx` |
| Pictogramas customizados | `/components/pictograms/` | `NewAchievement.tsx` |
| Componente compartilhado | `/components/` | `ChannelAvatar.tsx` |
| Nova página | `/pages/` | `NovaFeaturePage.tsx` |
| Novo contexto | `/contexts/` | `NovoContext.tsx` |
| Custom hook | `/hooks/` | `useCustomHook.ts` |

---

## Sistema de Permissionamento

### Visão Geral

A plataforma utiliza um sistema robusto de **permissionamento baseado em papéis e módulos**, permitindo controle granular de acesso a diferentes áreas e funcionalidades.

### Componentes do Sistema

#### 1. PermissionsContext (`/contexts/PermissionsContext.tsx`)

Context que gerencia toda lógica de permissões:

**Principais recursos:**
- ✅ Perfis de usuário com papéis (roles)
- ✅ Permissões por módulo e ação
- ✅ Presets de permissões por papel
- ✅ Verificação de acesso a rotas
- ✅ Permissões customizadas

#### 2. ProtectedRoute (`/components/ProtectedRoute.tsx`)

Componente para proteger rotas inteiras:

```tsx
import ProtectedRoute from '../components/ProtectedRoute';

<ProtectedRoute module="atendimentos" action="view">
  <AtendimentosPage />
</ProtectedRoute>
```

#### 3. ProtectedElement (`/components/ProtectedRoute.tsx`)

Componente para proteger elementos individuais da UI:

```tsx
import { ProtectedElement } from '../components/ProtectedRoute';

<ProtectedElement module="usuarios" action="create">
  <Button>Novo Usuário</Button>
</ProtectedElement>
```

### Módulos Disponíveis

| Módulo | Descrição |
|--------|-----------|
| `atendimentos` | Área de atendimentos/chat |
| `casos` | Gestão de casos |
| `usuarios` | Gestão de usuários |
| `relatorios` | Relatórios operacionais |
| `analytics` | Dashboards e analytics |
| `configuracoes` | Configurações do sistema |
| `ajuda` | Central de ajuda |

### Ações Disponíveis

| Ação | Descrição |
|------|-----------|
| `view` | Visualizar/acessar o módulo |
| `create` | Criar novos registros |
| `edit` | Editar registros existentes |
| `delete` | Excluir registros |
| `export` | Exportar dados |
| `manage` | Gerenciar configurações avançadas |

### Papéis (Roles) Pré-definidos

#### 1. Super Admin
- **Acesso**: Total (todos módulos, todas ações)
- **Uso**: Administradores da plataforma

#### 2. Admin
- **Acesso**: Quase total (sem delete em usuários, sem manage)
- **Uso**: Gestores administrativos

#### 3. Supervisor
- **Acesso**: Atendimentos, Casos, Usuários (view), Relatórios, Analytics
- **Uso**: Supervisores de equipe

#### 4. Atendente
- **Acesso**: Apenas Atendimentos e Casos (limitado)
- **Uso**: Operadores de atendimento

#### 5. Gestor
- **Acesso**: Relatórios, Analytics, Casos (view)
- **Uso**: Gestores focados em análise

#### 6. Custom
- **Acesso**: Permissões totalmente customizadas
- **Uso**: Perfis específicos definidos manualmente

### Como Usar

#### Proteger uma Rota

```tsx
import { Routes, Route } from 'react-router';
import ProtectedRoute from './components/ProtectedRoute';
import AtendimentosPage from './pages/AtendimentosPage';

<Routes>
  <Route 
    path="/atendimentos" 
    element={
      <ProtectedRoute module="atendimentos" action="view">
        <AtendimentosPage />
      </ProtectedRoute>
    } 
  />
</Routes>
```

#### Proteger um Elemento da UI

```tsx
import { ProtectedElement } from './components/ProtectedRoute';
import { Button } from './components/ui/button';
import { Plus } from 'lucide-react';

function UsuariosPage() {
  return (
    <div>
      <h1>Usuários</h1>
      
      {/* Botão só aparece se tiver permissão de criar */}
      <ProtectedElement module="usuarios" action="create">
        <Button variant="brand">
          <Plus className="w-4 h-4" />
          Novo Usuário
        </Button>
      </ProtectedElement>
    </div>
  );
}
```

#### Verificar Permissões no Código

```tsx
import { usePermissions } from './contexts/PermissionsContext';

function MyComponent() {
  const { hasPermission, hasAnyPermission, user } = usePermissions();

  // Verificar permissão específica
  if (hasPermission('usuarios', 'create')) {
    // Usuário pode criar usuários
  }

  // Verificar se tem acesso a pelo menos um módulo
  if (hasAnyPermission(['relatorios', 'analytics'])) {
    // Usuário tem acesso a relatórios OU analytics
  }

  // Acessar dados do usuário
  console.log(user?.nome, user?.role);

  return <div>...</div>;
}
```

#### Criar Usuário com Permissões Customizadas

```tsx
import { createCustomUser } from './contexts/PermissionsContext';

const customUser = createCustomUser(
  '123',
  'João Silva',
  'joao@exemplo.com',
  [
    { module: 'atendimentos', actions: ['view', 'create', 'edit'] },
    { module: 'relatorios', actions: ['view', 'export'] },
  ]
);
```

### Integração com Backend

Para produção, substitua a lógica mock no `PermissionsContext.tsx`:

```tsx
// Em PermissionsContext.tsx, linha ~168
useEffect(() => {
  const loadUserPermissions = async () => {
    try {
      // ⚠️ Substituir por chamada real à API
      const response = await fetch('/api/auth/me');
      const userData = await response.json();
      
      setUser(userData);
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
    } finally {
      setIsLoading(false);
    }
  };

  loadUserPermissions();
}, []);
```

### Tela de Acesso Negado

Quando um usuário tenta acessar um módulo sem permissão, é exibida automaticamente uma tela amigável com:
- ✅ Mensagem clara explicando a restrição
- ✅ Informação sobre qual módulo/ação foi negada
- ✅ Botão para voltar ou ir para página inicial
- ✅ Lista de módulos disponíveis para o usuário

### Boas Práticas

1. **Sempre use ProtectedRoute** para páginas inteiras
2. **Use ProtectedElement** para botões e ações específicas
3. **Não duplique lógica de permissão** - sempre use o hook `usePermissions()`
4. **Teste com diferentes papéis** durante desenvolvimento
5. **Documente permissões necessárias** para novos módulos

---

## Preferências do Usuário

### Sistema de Temas (Light/Dark Mode)
* **Provider**: `PreferencesProvider` em `/contexts/PreferencesContext.tsx`
* **Hook**: `usePreferences()` para acessar tema e funções
* **Persistência**: Preferências salvas no localStorage
* **Classes CSS**: `.dark` aplicada automaticamente no `<html>` quando modo escuro ativo
* **Controle UI**: `<PreferencesMenu />` na navbar (canto superior direito) para alternar tema e tamanho de fonte

### Tamanhos de Fonte (3 níveis)
* **Pequeno** (`data-font-size="small"`): Base 14px - ideal para telas menores ou mais informação
* **Padrão** (`data-font-size="medium"` ou sem atributo): Base 16px - tamanho padrão recomendado
* **Grande** (`data-font-size="large"`): Base 18px - ideal para acessibilidade e leitura

### Variáveis CSS de Tipografia
* `--text-2xl`: Títulos principais (24px padrão, escala com tamanho)
* `--text-xl`: Subtítulos (20px padrão, escala com tamanho)
* `--text-lg`: Texto grande (18px padrão, escala com tamanho)
* `--text-base`: Texto base (16px padrão, escala com tamanho)
* `--text-sm`: Texto pequeno (14px padrão, escala com tamanho)
* `--text-xs`: Texto extra pequeno (12px padrão, escala com tamanho)

### Implementação em Componentes
```tsx
import { usePreferences } from '../contexts/PreferencesContext';

function MyComponent() {
  const { theme, fontSize, toggleTheme, setFontSize } = usePreferences();
  
  return (
    <div className="bg-background text-foreground">
      {/* Cores se adaptam automaticamente ao tema */}
      <p className="text-base">
        Texto que escala com preferências de tamanho
      </p>
    </div>
  );
}
```

### Acesso ao Menu de Preferências
* **Localização**: Navbar superior à direita, entre Ajuda e Perfil
* **Ícone**: Sol (modo claro) ou Lua (modo escuro)
* **Opções disponíveis**:
  - Toggle de tema (Modo claro ↔ Modo escuro)
  - Tamanho de fonte: Pequeno, Padrão, Grande
* **Persistência**: Todas as preferências são salvas automaticamente no localStorage

## Tipografia

### Fonte Principal
* **Roboto** - fonte padrão para toda a aplicação
* **Implementação**: Aplicada globalmente via CSS no body e todos os elementos
* **Fallbacks**: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
* **Weights disponíveis**: 100, 300, 400, 500, 700, 900 (regular e italic)

### Hierarquia Tipográfica
* **Títulos**: Roboto Medium para h1-h4
* **Texto comum**: Roboto Regular para parágrafos e inputs  
* **Labels/Botões**: Roboto Medium para elementos de interface
* **Consistência**: Evitar override da fonte padrão nos componentes
* **Variáveis CSS**: Usar `var(--text-*)` para tamanhos que devem escalar com preferências

## Tokens de Cor - Design System

### IMPORTANTE: Nunca use cores hexadecimais hardcoded
Sempre use os tokens do design system definidos no CSS. Nunca usar `bg-[#hexcolor]` ou similar.

### Suporte a Tema Claro e Escuro
* **Todos os tokens se adaptam automaticamente** ao tema ativo (light/dark)
* **Sempre use tokens semânticos** (`bg-background`, `text-foreground`, etc.) em vez de cores fixas
* **Modo escuro**: Ativado automaticamente quando classe `.dark` está no `<html>`
* **Cores da marca**: `--brand-primary` (#00BCF2) mantém consistência em ambos os temas
* **Scrollbar**: Estilo customizado que se adapta ao tema (claro/escuro)

### Tokens Semânticos (adaptam automaticamente ao tema)
* `bg-background` - Fundo principal da aplicação (branco → escuro)
* `text-foreground` - Texto principal (preto → branco)
* `bg-card` - Fundo de cards (branco → cinza escuro)
* `text-card-foreground` - Texto em cards
* `bg-muted` - Fundo menos destacado (cinza claro → cinza médio)
* `text-muted-foreground` - Texto secundário (cinza → cinza claro)
* `border-border` - Bordas padrão (cinza claro → cinza escuro)
* `bg-input` - Fundo de inputs (transparente → cinza escuro)
* `bg-popover` - Fundo de popovers e menus
* `text-popover-foreground` - Texto em popovers

### Tokens de Navegação (adaptam ao tema)
* `bg-navigation-bg` - Cor de fundo da sidebar (#162533 light → #0f172a dark)
* `border-navigation-border` - Bordas da navegação (#0d1a2a → #1e293b)
* `bg-navigation-hover` - Hover nos itens de menu (#1a2936 → #1e293b)
* `bg-navigation-active` - Estado ativo dos itens de menu
* `text-navigation-text` - Texto da navegação (#fff → #e5e7eb)
* `text-navigation-text-active` - Texto ativo da navegação (azul brand)

### Tokens de Brand
* `bg-brand-primary` - Cor primária da marca (#00BCF2)
* `text-brand-primary` - Texto na cor primária
* `text-brand-primary-foreground` - Texto sobre fundo primário (branco)

### Tokens de Interface
* `bg-chat-selection` - Fundo de item selecionado no chat (azul claro)
* `border-chat-selection-border` - Borda de item selecionado
* `text-status-read` - Cor para indicador de mensagem lida (azul)
* `bg-badge-notification` - Fundo do badge de notificação (vermelho)
* `text-badge-notification-foreground` - Texto do badge (branco)

### Exemplos de Uso Correto
```tsx
// ✅ CORRETO - usando tokens
<div className="bg-navigation-bg text-navigation-text">
<Button className="bg-brand-primary text-brand-primary-foreground">
<div className="bg-chat-selection border-chat-selection-border">
<span className="text-status-read">

// ❌ INCORRETO - cores hardcoded
<div className="bg-[#162533] text-white">
<Button className="bg-[#00BCF2] text-white">
<div className="bg-blue-50 border-blue-200">
<span className="text-blue-500">
```

### Regras de Implementação
1. **Sempre prefira tokens**: Use tokens do design system ao invés de classes do Tailwind quando disponível
2. **Consistência**: Mantenha a mesma cor para elementos similares em toda a aplicação
3. **Hierarquia**: Use `brand-primary` para ações principais, `secondary` para secundárias
4. **Estados**: Use tokens específicos para hover, active, selected, etc.
5. **Acessibilidade**: Sempre verifique contraste entre texto e fundo
6. **Tema-aware**: Sempre use tokens semânticos que se adaptam ao tema (nunca cores fixas)

### Boas Práticas para Temas
```tsx
// ✅ CORRETO - se adapta ao tema automaticamente
<div className="bg-background text-foreground">
<div className="bg-card border-border">
<p className="text-muted-foreground">

// ❌ INCORRETO - cor fixa, não funciona em dark mode
<div className="bg-white text-black">
<div className="bg-gray-100 border-gray-200">
<p className="text-gray-500">

// ✅ CORRETO - usa variável CSS para tamanho escalável
<h1 style={{ fontSize: 'var(--text-2xl)' }}>Título</h1>

// ❌ INCORRETO - tamanho fixo, não escala com preferências
<h1 className="text-2xl">Título</h1>
```

### Componentes Específicos
* **Sidebar**: Sempre usar `bg-navigation-bg` com texto `text-navigation-text`
* **Badges de notificação**: Sempre usar `bg-badge-notification`
* **Itens selecionados**: Sempre usar `bg-chat-selection`
* **Botões primários**: Sempre usar variante `brand` no Button component

## Variantes de Botão
* **default**: Usa `--primary` (preto) - para ações neutras
* **brand**: Usa `--brand-primary` (azul #00BCF2) - para ações principais da marca
* **destructive**: Vermelho para ações destrutivas
* **outline**: Borda para ações secundárias
* **secondary**: Cinza para ações secundárias
* **ghost**: Transparente para ações sutis
* **link**: Estilo de link

### Exemplos de Uso de Botões
```tsx
// ✅ CORRETO - ação principal da marca
<Button variant="brand">
  <Plus className="w-4 h-4" />
  Novo atendimento
</Button>

// ✅ CORRETO - ação secundária
<Button variant="outline">
  <Filter className="w-4 h-4" />
</Button>

// ❌ INCORRETO - classe customizada ao invés de variante
<Button className="bg-brand-primary text-brand-primary-foreground">
  Novo atendimento
</Button>
```

## Estrutura de Layout
* Use layout flexível e responsivo
* **Navbar horizontal no topo** - altura fixa de 64px (h-16)
* **Visual claro**: Fundo branco, bordas cinza claro, texto escuro
* **Organização horizontal**:
  - Esquerda: Logo + itens de menu principais (com labels)
  - Direita: Configurações, Ajuda, Preferências (sol/lua), Perfil
* Painel principal flexível ocupando altura restante
* Height 100vh para container principal
* Layout: `flex flex-col` (navbar no topo + conteúdo abaixo)

## Navbar Horizontal - Design System

### Anatomia da Navbar
* **Container**: `bg-white h-16 w-full border-b border-border shadow-sm`
* **Padding horizontal**: `px-4` (16px de margem nas laterais)
* **Layout**: `flex items-center justify-between` (espaçamento entre esquerda e direita)

### Seção Esquerda - Logo e Menu Principal
* **Container**: `flex items-center gap-6` (24px entre logo e menu)
* **Logo**: `w-8 h-8 flex-shrink-0` - Isotype clicável para voltar aos Atendimentos
* **Menu principal**: `flex items-center gap-1` (4px entre items)

### MenuItem (Item de Menu Principal)
* **Layout**: `flex items-center gap-[10px]` (gap de 10px entre elementos)
* **Padding**: `px-[16px] pt-[16px] pb-[14px]` (horizontal 16px, top 16px, bottom 14px)
* **Label**: 
  - Font: Roboto Regular
  - Size: 14px (text-[14px])
  - Leading: 17.063px
  - Font variation: 'wdth' 100
* **Estado inativo**: `text-[#717182] hover:text-foreground`
* **Estado ativo**: 
  - Texto: `text-[#00bcf2]`
  - Borda inferior: `border-b-[2px] border-[#00bcf2]`
  - A borda fica alinhada na parte inferior do item, junto à borda da navbar
* **Dropdown**: Ícone ChevronDown (18px) quando hasDropdown=true
* **Transição**: `transition-colors duration-200`
* **Importante**: Padding bottom reduzido (14px vs 16px top) para acomodar a borda de 2px e manter alinhamento visual

### Seção Direita - Ações do Usuário
* **Container**: `flex items-center gap-[5px]` (5px entre elementos)
* **Estrutura**: 2 grupos separados por divisor
* **Grupo 1 - Páginas adicionais**:
  - Botão Ajuda
  - Botão Wizz (Chat de IA)
  - Botão Apps/Grid
* **Grupo 2 - Perfil do usuário**:
  - ActiveCallWidget (quando em Atendimentos e chamada ativa)
  - Menu de Usuário
* **Estilo dos botões**:
  - Background: `bg-[#ebebeb]`
  - Padding: `p-[12px]` (12px)
  - Border radius: `rounded-[48.75px]` (circular)
  - Hover: `hover:bg-gray-200`
  - Transição: `transition-colors`
  - Ícones: `size-[18px]` ou `size-[20px]` (Wizz)
  - Cor dos ícones: `text-[#717182]`
* **Divisor**: `bg-[rgba(0,0,0,0.1)] h-6 w-px mx-2` - sempre visível entre os grupos
* **Consistência**: Todos os botões usam `<button>` com `onClick`, não `<Link>`

### Itens do Menu Principal
1. **Atendimentos** - Ícone: Headset - Badge de notificação ativo
2. **Casos** - Ícone: Briefcase
3. **Usuários** - Ícone: Users
4. **Relatórios** - Ícone: FileText
5. **Analytics** - Ícone: TrendingUp
6. **Administração** - Ícone: Building2

### Ações da Direita
**Grupo 1: Páginas adicionais**
1. **Ajuda** - Ícone: CircleHelp (18px)
2. **Wizz** - Ícone: WizzIcon (20px) - Chat de IA
3. **Apps/Grid** - Ícone: LayoutGrid (18px)

**[Divisor vertical - sempre visível]**

**Grupo 2: Perfil do usuário**
4. **ActiveCallWidget** - Aparece em Atendimentos quando chamada ativa
5. **Menu de Usuário** - Ícone: User (18px) - Dropdown com perfil, tema e fonte

### Comportamento e Estados
* **Transições**: `transition-colors duration-200` para mudanças suaves
* **Hover**: Background cinza claro (`bg-muted`) em items inativos
* **Active**: Background azul brand (`bg-brand-primary`) com texto branco
* **Links**: Todos os itens são `<Link>` do react-router
* **Responsividade**: Labels visíveis em desktop, colapsáveis em mobile (futuro)

### Cores (Tema Claro)
* **Background**: `bg-white` (branco)
* **Borda**: `border-border` (cinza claro)
* **Texto padrão**: `text-foreground` (escuro)
* **Texto secundário**: `text-muted-foreground` (cinza)
* **Hover**: `bg-muted` (cinza muito claro)
* **Ativo**: `bg-brand-primary` (#00BCF2) + `text-white`
* **Badge**: `bg-badge-notification` (vermelho) com borda branca

### Exemplo de Implementação
```tsx
import { Link } from "react-router";
import { Headset, Settings, User } from "lucide-react";
import Isotype from "../imports/Isotype";
import { PreferencesMenu } from "./PreferencesMenu";

function MenuItem({ 
  label, 
  isActive = false, 
  to, 
  hasDropdown = false,
  onClick 
}: {
  label: string;
  isActive?: boolean;
  to?: string;
  hasDropdown?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <div
      className={`box-border flex gap-[10px] items-center justify-center px-[16px] pt-[16px] pb-[14px] relative cursor-pointer transition-colors duration-200 ${
        isActive ? "border-b-[2px] border-[#00bcf2]" : ""
      }`}
    >
      <p
        className={`font-['Roboto'] font-normal leading-[17.063px] text-[14px] text-nowrap ${
          isActive ? "text-[#00bcf2]" : "text-[#717182] hover:text-foreground"
        }`}
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        {label}
      </p>
      {hasDropdown && (
        <ChevronDown
          className={`size-[18px] ${isActive ? "stroke-[#00bcf2]" : "stroke-[#717182]"}`}
          strokeWidth="2"
        />
      )}
    </div>
  );

  if (to && !hasDropdown) {
    return <Link to={to}>{content}</Link>;
  }

  return <div onClick={onClick}>{content}</div>;
}

// Navbar
<nav className="bg-white h-16 w-full border-b border-border">
  <div className="flex items-center justify-between px-4 h-full">
    {/* Lado Esquerdo - Logo + Menu */}
    <div className="flex items-center gap-[16px]">
      <Link to="/atendimentos" className="flex-shrink-0">
        <Logo />
      </Link>
      
      {/* Menu items */}
      <div className="flex items-center">
        <MenuItem label="Atendimento" isActive={activeItem === "atendimento"} to="/atendimentos" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div>
              <MenuItem label="Gerenciamento" isActive={activeItem === "gerenciamento"} hasDropdown />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => handleNavigation("/casos")}>Casos</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigation("/usuarios")}>Usuários</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Outros menus */}
      </div>
    </div>
  
  <div className="flex items-center gap-[5px]">
    {/* Grupo 1: Páginas adicionais */}
    <button
      onClick={() => handleNavigation("/ajuda")}
      className="bg-[#ebebeb] p-[12px] rounded-[48.75px] hover:bg-gray-200 transition-colors"
      title="Ajuda"
    >
      <CircleHelp className="size-[18px] text-[#717182]" />
    </button>
    
    <button
      onClick={() => console.log("Abrir Wizz")}
      className="bg-[#ebebeb] p-[12px] rounded-[48.75px] hover:bg-gray-200 transition-colors"
      title="Wizz - Chat de IA"
    >
      <WizzIcon className="size-[20px] text-[#717182]" />
    </button>
    
    <button
      onClick={() => console.log("Abrir Apps")}
      className="bg-[#ebebeb] p-[12px] rounded-[48.75px] hover:bg-gray-200 transition-colors"
      title="Aplicativos"
    >
      <LayoutGrid className="size-[18px] text-[#717182]" />
    </button>
    
    {/* Divisor entre grupos */}
    <div className="bg-[rgba(0,0,0,0.1)] h-6 w-px mx-2" />
    
    {/* Grupo 2: Perfil do usuário */}
    {isAtendimento && callState.isActive && (
      <ActiveCallWidget {...callProps} />
    )}
    
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="bg-[#ebebeb] p-[12px] rounded-[48.75px] hover:bg-gray-200 transition-colors"
          title="Perfil"
        >
          <User className="size-[18px] text-[#717182]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Menu items */}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</nav>
```

## Terminologia Padrão

### Status de Casos
* **Aguardando** - casos abertos aguardando atendimento (status: "aberto")
* **Em Atendimento** - casos sendo processados (status: "em-andamento") 
* **Finalizado** - casos resolvidos (status: "resolvido")
* **Fechado** - casos arquivados (status: "fechado")

### Uso Consistente
* Sempre usar terminologia padronizada na interface
* Manter mapeamento correto entre labels visuais e status internos
* Aplicar consistentemente em filtros, badges e estatísticas

## Ícones e Componentes
* Sempre usar lucide-react para ícones
* Manter consistência visual em toda aplicação
* Sistema de avatares com iniciais padronizado

### Indicadores Visuais de Status
* **Atendente em atendimento**: Círculo colorido + ícone headphone (w-3 h-3)
* **Cor coordenada**: Mesmo tom para círculo, ícone e nome do atendente
* **Espaçamento**: gap-1 entre círculo e headphone, gap-1 entre indicadores e nome

## Sistema de Casos com Múltiplas Visualizações

### Estrutura de Dados
* **Origem**: Dados dos atendimentos convertidos automaticamente em casos
* **Interface**: Caso com campos adaptados (id, titulo, cliente, status, etc.)
* **Conversão**: Função `convertAtendimentoToCaso()` mapeia atendimentos para casos
* **Status**: aberto, em-andamento, resolvido, fechado
* **Prioridade**: Baseada no número de notificações (baixa, media, alta, urgente)

### Modos de Visualização

#### 1. Cards Horizontais (Padrão)
* **Layout**: Grid vertical com cards expansivos
* **Conteúdo**: Título, descrição, cliente com canal, atendente, badges de status/prioridade
* **Interação**: Hover com shadow, click para detalhes
* **Elementos**: ChannelAvatar, badges coloridos, ícone headphone para atendente

#### 2. Kanban
* **Layout**: 4 colunas por status (Aguardando, Em Atendimento, Finalizado, Fechado)
* **Cards**: Compactos com informações essenciais
* **Colunas**: Header com ícone de status + contador de casos
* **Drag & Drop**: Preparado para implementação futura
* **Scroll**: Individual por coluna

#### 3. Tabela com Checkboxes
* **Layout**: Tabela responsiva com colunas estruturadas
* **Seleção**: Checkbox individual + "selecionar todos" com indeterminate state
* **Colunas**: ID, Cliente+Canal, Título, Status, Prioridade, Atendente, Atualização, Ações
* **Ações em Lote**: Barra de ações aparece quando casos são selecionados
* **Funcionalidades**: Atribuir atendente, alterar status, exportar

### Navegação entre Modos
* **Selector**: Toggle buttons com ícones (LayoutGrid, Columns3, Table)
* **Estado**: Preserva filtros e busca, limpa seleções ao trocar modo
* **Visual**: Background cinza com botão ativo destacado

### Estatísticas Dinâmicas
* **Cards de Status**: 5 cards (Aguardando, Em Atendimento, Finalizado, Fechado, Total)
* **Cores**: Seguem padrão de status (amarelo, azul, verde, cinza, brand-primary)
* **Cálculo**: Automático baseado nos dados filtrados
* **Layout**: Grid de 5 colunas responsivo

### Funcionalidades Compartilhadas
* **Busca**: Por título, cliente ou ID
* **Filtros**: Por status com dropdown
* **ChannelAvatar**: Integração completa em todos os modos
* **Atendente**: Ícone headphone + nome colorido consistente
* **Badges**: Status e prioridade com cores padronizadas

## Sistema de Avatares com Canais

### ChannelAvatar Component
* **Localização**: `/components/ChannelAvatar.tsx`
* **Uso**: Avatar com iniciais + ícone de canal no canto inferior direito
* **Funcionalidade**: Combina avatar personalizado com identificação visual do canal de origem

### Canais Suportados
* **WhatsApp** - Verde oficial (#25D366) - Ícone: SVG customizado (WhatsApp)
* **WebChat** - Cinza (bg-gray-500) - Ícone: SVG customizado (WebChat)  
* **Messenger** - Azul oficial (#0084FF) - Ícone: SVG customizado (Messenger)
* **Instagram** - Rosa oficial (#E4405F) - Ícone: SVG customizado (Instagram)
* **Telegram** - Azul oficial (#0088CC) - Ícone: SVG customizado (Telegram)
* **Email** - Verde (#34A853) - Ícone: SVG customizado (Email)
* **RCS** - Amarelo/Laranja (#FFAB00) - Ícone: SVG customizado (RCS)

### Implementação
```tsx
import ChannelAvatar, { ChannelType } from './components/ChannelAvatar';

<ChannelAvatar 
  nome="Nome do Usuário" 
  channel="whatsapp" 
  className="optional-class"
/>
```

### Padrão de Cores
* **Avatar principal**: Visual neutro uniforme para todos os usuários
  - Background: `bg-muted` (cinza claro #ececf0)
  - Texto: `text-muted-foreground` (cinza escuro #717182)
  - Borda: `border-white` (branca 2px)
* **Ícone do canal**: Cores específicas mantidas por canal
  - WhatsApp: Verde #25D366
  - Messenger: Azul #0084FF  
  - Instagram: Rosa #E4405F
  - Telegram: Azul #0088CC
  - Email: Verde #34A853
  - RCS: Amarelo/Laranja #FFAB00
  - WebChat: Cinza (bg-gray-500)

### Estrutura Visual
* **Avatar principal**: Círculo com iniciais e visual neutro (bg cinza claro, texto cinza escuro, borda branca)
* **Ícone do canal**: Círculo pequeno (20px) no canto inferior direito com cores específicas mantidas
* **Background avatar**: `bg-muted` (cinza claro #ececf0 do design system)
* **Texto avatar**: `text-muted-foreground` (cinza escuro #717182 do design system)  
* **Borda avatar**: `border-white` (borda branca de 2px)
* **Cores dos canais**: Mantidas as cores específicas de cada canal no círculo pequeno
* **Responsivo**: Mantém proporções em diferentes tamanhos

### Ícones SVG Customizados
* **Origem**: SVGs importados de `/imports/svg-puq4f9kx8l.ts`
* **Renderização**: Função `getChannelIcon()` no ChannelAvatar
* **Tamanho**: 12px (w-3 h-3) - adequado para círculo de 20px
* **Cor**: Branca (#ffffff) no círculo colorido do canal
* **Viewbox**: 0 0 20 20 para todos os ícones
* **Paths específicos**: 
  - WhatsApp: `p1396f400`
  - WebChat: `p1f58c900`
  - Email: `p1af1a500`
  - Instagram: SVG customizado com círculo e moldura
  - Messenger: SVG customizado com raio característico
  - Telegram: SVG customizado com formato de papel
  - RCS: SVG customizado com balões de conversa
* **Vantagem**: Ícones consistentes e alinhados com o design system

## Sistema de Chamadas (WebPhone)

### WebPhone Widget - Estados e Interações
* **Componente**: `/components/webphone/WebPhoneWidget.tsx`
* **Página de Demo**: `/ligacao` - Demonstração completa de todos os estados
* **Estados**: 7 estados visuais diferentes (login, idle, ready, auto-answer-countdown, outgoing, incoming, in-call)

#### Estado "idle" - Input Editável
* **Funcionalidade**: Campo de input onde usuário pode **digitar o número de telefone**
* **Formatação automática**: Número formatado no padrão brasileiro `(XX) X XXXX-XXXX`
* **Validação**: Aceita apenas números, formatados automaticamente
* **Transição automática**: Muda para estado "ready" quando número tem 10+ dígitos
* **Botão de chamada**: Fica **ativo** apenas quando número é válido (10+ dígitos)
* **Props necessárias**:
  - `onPhoneNumberChange`: Callback para receber mudanças no número digitado
  - `phoneNumber`: Valor controlado do número

#### Implementação do Input
```tsx
// No componente pai (ex: LigacaoPage)
const [phoneNumber, setPhoneNumber] = useState("");
const [state, setState] = useState<WebPhoneState>("idle");

const handlePhoneNumberChange = (value: string) => {
  setPhoneNumber(value);
  // Transição automática de estado baseada no número de dígitos
  const digitsOnly = value.replace(/\D/g, "");
  if (digitsOnly.length >= 10) {
    setState("ready");
  } else if (digitsOnly.length === 0) {
    setState("idle");
  }
};

<WebPhoneWidget
  state={state}
  phoneNumber={phoneNumber}
  onPhoneNumberChange={handlePhoneNumberChange}
  onCall={handleCall}
  // ... outras props
/>
```

#### Formatação de Telefone
* **Padrão**: `(34) 9 9999-9999` para celulares
* **Máximo**: 19 caracteres (com formatação)
* **Apenas números**: Remove automaticamente caracteres não-numéricos
* **Progressive disclosure**: Formata conforme usuário digita
  - Até 2 dígitos: `34`
  - 3-4 dígitos: `(34) 9`
  - 5-9 dígitos: `(34) 9 9999`
  - 10+ dígitos: `(34) 9 9999-9999`

### CallContext - Gerenciamento Global
* **Provider**: `CallProvider` em `/contexts/CallContext.tsx`
* **Hook**: `useCall()` para acessar estado e funções
* **Estado**: `callState` com campos: isActive, phoneNumber, duration, isPaused
* **Funções**: `startCall(phoneNumber)`, `endCall()`, `pauseCall()`, `resumeCall()`

### ActiveCallWidget - Controles de Chamada
* **Localização**: Navbar superior à direita, ao lado do botão de perfil
* **Componente**: `/components/ActiveCallWidget.tsx`
* **Visibilidade**: Aparece automaticamente quando usuário está na página de Atendimentos
* **Início automático**: Chamada é iniciada automaticamente ao entrar em Atendimentos
* **Número padrão**: +55 (34) 9 9999-9999
* **Cores**: Fundo #ebebeb, spectrum icon #00bcf2, botão desligar #d4183d
* **Layout**: Informações da chamada + 3 botões de ação
* **Informações**:
  - SpectrumIcon animado (#00bcf2)
  - Timer formatado (00:00:44)
  - Número de telefone
* **Botões de ação**:
  1. Desligar (vermelho #d4183d) - encerra chamada
  2. Mute (branco) - muta/desmuta
  3. Mais opções (branco) - menu adicional

### Navegação Durante Chamada Ativa
* **Proteção**: Usuário não pode sair da página de Atendimentos durante chamada
* **Dialog de Confirmação**: Aparece ao tentar navegar para outra página
* **Opções**:
  - Confirmar: Encerra chamada automaticamente e navega para nova página
  - Cancelar: Mantém usuário na página de Atendimentos com chamada ativa
* **Implementação**: `AppHeader.tsx` verifica `callState.isActive` antes de navegar
* **Início automático**: useEffect monitora entrada na página de Atendimentos e inicia chamada automaticamente

### Timer da Chamada
* **Início**: Timer começa em 0 quando chamada é iniciada
* **Atualização**: Incrementa +1 a cada segundo via useEffect
* **Formato**: HH:MM:SS (00:00:44)
* **Reset**: Volta para 0 quando chamada é encerrada
* **Pausar**: Timer continua mesmo se chamada for pausada (mostra duração total)

### Implementação
```tsx
import { useCall } from '../contexts/CallContext';

function MyComponent() {
  const { callState, startCall, endCall } = useCall();
  
  // Iniciar chamada
  const handleCall = () => {
    startCall('+55 (34) 9 9999-9999');
  };
  
  // Verificar se há chamada ativa
  if (callState.isActive) {
    // Mostrar controles de chamada
  }
}
```

## Espaçamentos de Botões
* **Gap padrão**: `gap-1` (4px) entre ícones e texto
* **Botão small**: `gap-0.5` (2px) para botões menores
* **Botão large**: `gap-1.5` (6px) para botões maiores
* **Evitar margins manuais**: Não usar `mr-2`, `ml-2` em ícones - deixar o gap do botão controlar

### Exemplo Correto
```tsx
// ✅ CORRETO - sem margin manual no ícone
<Button>
  <Plus className="w-4 h-4" />
  Novo atendimento
</Button>

// ❌ INCORRETO - margin manual sobrescreve o gap
<Button>
  <Plus className="w-4 h-4 mr-2" />
  Novo atendimento
</Button>
```

## Estados de Focus e Bordas
* **Bordas padrão**: Sempre usar `border-border` para estado normal dos inputs
* **Focus**: Automático com `brand-primary` (#00BCF2) aplicado globalmente
* **Consistência**: Todos os inputs seguem o mesmo padrão visual
* **Implementação**: CSS global aplicado automaticamente
* **Customização**: Evitar override dos estilos de focus/border padrão

### Exemplo de Input Correto
```tsx
// ✅ CORRETO - borda padrão + focus automático
<SearchInput
  placeholder="Buscar"
  className="border-border" // borda cinza no estado normal
/>
// Focus azul aplicado automaticamente via CSS global
```

## Módulo de Gerenciamento

### Visão Geral

O **módulo de Gerenciamento** é o centro de controle operacional para supervisores e gestores monitorarem toda a operação de atendimento em tempo real e histórico.

### Acesso
* **Localização**: Menu "Gerenciamento" → "Dashboard Gerencial"
* **Rota**: `/gerenciamento`
* **Permissão necessária**: `casos.view` (reutiliza permissão de casos)
* **Papéis com acesso**: Super Admin, Admin, Supervisor, Gestor

### Estrutura do Módulo

O módulo é organizado em **5 abas principais**:

#### 1. Overview (Dashboard Principal)
* **KPIs Principais**:
  - Atendimentos em Aberto (com trend)
  - Tempo Médio de Resposta (com trend)
  - Satisfação do Cliente (CSAT)
  - Taxa de Resolução
* **Alertas**: Notificações de SLA, canais com problemas, picos de demanda
* **Gráficos**:
  - Atendimentos nos últimos 7 dias (linha)
  - Atendimentos por canal (barra)
  - Distribuição por status (pizza)
* **Atendentes em Tempo Real**: Lista com status, atendimentos e TMR
* **Status da Equipe**: Online, Ausente, Offline com percentuais

#### 2. Atendimentos
* **Objetivo**: Gestão operacional de atendimentos
* **Visões Disponíveis**: Kanban, Lista, Timeline
* **Funcionalidades**: Filtros avançados, ações em lote, busca
* **Status**: 🚧 Em desenvolvimento

#### 3. Atendentes
* **Objetivo**: Monitoramento de equipe e performance
* **Funcionalidades**:
  - Grid de atendentes com métricas
  - Ranking de performance
  - Disponibilidade em tempo real
  - Carga de trabalho
* **Status**: 🚧 Em desenvolvimento

#### 4. Canais
* **Objetivo**: Análise de eficiência por canal
* **Canais Monitorados**: WhatsApp, WebChat, Email, Voz, Instagram, Telegram
* **Métricas**: Volume, TMR, CSAT, tendências
* **Funcionalidades**: Comparativo entre canais, detalhes individuais
* **Status**: 🚧 Em desenvolvimento

#### 5. SLA e Metas
* **Objetivo**: Indicadores de qualidade e cumprimento
* **Funcionalidades**:
  - Dashboard de SLA (dentro do prazo, em risco, vencido)
  - Metas vs Realizado
  - Alertas de descumprimento
  - Projeções
* **Status**: 🚧 Em desenvolvimento

### Componentes

#### MetricCard (`/components/gerenciamento/shared/MetricCard.tsx`)
```tsx
<MetricCard
  title="Atendimentos em Aberto"
  value={142}
  icon={MessageSquare}
  trend={{ value: 12, direction: "up" }}
  iconColor="bg-blue-500"
  description="vs. semana anterior"
/>
```

#### StatWidget (`/components/gerenciamento/shared/StatWidget.tsx`)
```tsx
<StatWidget
  label="Online"
  value="12 atendentes (60%)"
  color="bg-green-500"
  percentage={60}
/>
```

#### AlertCard (`/components/gerenciamento/shared/AlertCard.tsx`)
```tsx
<AlertCard
  type="warning"
  title="Atendimentos próximos do SLA"
  message="3 atendimentos vencerão em 10 minutos"
  count={3}
/>
```

### Navegação

* **Tabs Horizontais**: Navegação entre as 5 seções
* **Estilo**: Tabs com ícones e labels
* **Indicador**: Borda inferior azul (#00BCF2) na aba ativa
* **Layout**: Header fixo + conteúdo scrollável

### Dados Mock

O módulo utiliza dados mockados para desenvolvimento. Principais datasets:

* **KPIs**: Valores agregados com trends
* **Atendimentos por Dia**: 7 dias de histórico
* **Atendimentos por Canal**: WhatsApp, WebChat, Email, Voz
* **Distribuição por Status**: Aguardando, Em Atendimento, Finalizado, Fechado
* **Atendentes**: 4 atendentes com status e métricas

### Integração com Backend

Para produção, substituir dados mock por chamadas à API:

```tsx
// Exemplo de integração
useEffect(() => {
  const loadDashboardData = async () => {
    const response = await fetch('/api/gerenciamento/overview');
    const data = await response.json();
    setDashboardData(data);
  };
  
  loadDashboardData();
}, []);
```

### Roadmap

**Fase 1** (Atual):
- ✅ Overview Dashboard com KPIs principais
- ✅ Gráficos de atendimentos e canais
- ✅ Atendentes em tempo real
- ✅ Sistema de alertas

**Fase 2** (Próxima):
- [ ] Visão Kanban de atendimentos
- [ ] Visão Lista de atendimentos
- [ ] Grid de atendentes com detalhes
- [ ] Análise detalhada de canais

**Fase 3**:
- [ ] Dashboard de SLA e Metas
- [ ] Exportação de relatórios
- [ ] Alertas automáticos
- [ ] Filtros salvos

### Documentação Adicional

Para arquitetura detalhada, consulte: [GERENCIAMENTO_ARCHITECTURE.md](../GERENCIAMENTO_ARCHITECTURE.md)

---

## InteractionPanel - Mecânica de Aplicativo

### Renderização Condicional da Sidebar
* **Empty state**: Sidebar InteractionPanel NÃO é renderizada quando não há atendimento selecionado
* **ChatPanel**: Mostra empty state único "Selecione um atendimento para iniciar o chat"
* **Layout limpo**: Apenas ChatPanel visível no estado vazio, sem sidebar lateral
* **Implementação**: `{selectedAtendimento && <InteractionPanel atendimento={selectedAtendimento} />}`

### Comportamento Principal
* **Estado padrão**: Colapsado - apenas ícones verticais visíveis (activeSection = null)
* **Largura colapsada**: 63px - barra vertical de ícones à direita
* **Largura expandida**: 464px (padrão), 320px (mínima), 800px (máxima)
* **Layout**: Conteúdo à esquerda + barra de ícones fixa à direita (63px)
* **Biblioteca**: re-resizable (conforme guideline - não usar react-resizable)
* **Transição**: transition-all duration-300 para animação suave

### Navegação por Ícones (Mecânica de App)
* **Layout**: Barra vertical fixa à direita (w-[63px])
* **Botões**: w-10 h-10, rounded-[10px], centralizado
* **Ícones**: w-5 h-5 (20px)
* **Tooltips**: TooltipProvider com side="left"
* **Estado inativo**: hover:bg-gray-200, text-[#717182]
* **Estado ativo**: bg-brand-primary (#00BCF2), text-white
* **Interação**:
  - Clicar em ícone inativo: Expande painel e mostra aquela seção
  - Clicar em ícone ativo: Fecha painel (volta ao estado colapsado)
  - Clicar em outro ícone: Troca de seção mantendo painel aberto
* **Seções disponíveis**:
  1. Info - Informações
  2. Zap - Jornada do cliente
  3. Star - Experiência
  4. MessageSquare - Comentários internos
  5. DollarSign - Faturamento
  6. Paperclip - Anexos

### Cards das Seções
* **Container**: bg-white border border-border rounded-[8px] overflow-hidden h-full flex flex-col
* **Padding do painel**: p-3 no container de conteúdo (aplica margem uniforme)
* **Altura total**: h-full para ocupar toda altura disponível até o fim da página
* **Layout**: flex flex-col para controlar distribuição vertical
* **Sem margem individual**: Cards não têm mx-3 mb-3 (controlado pelo padding do container pai)

### Header dos Cards de Seção
* **Layout**: flex items-center justify-between flex-shrink-0
* **Padding**: px-3 py-3
* **Border**: border-b border-border
* **Flexbox**: flex-shrink-0 para manter altura fixa do header
* **Lado esquerdo**: Ícone (w-5 h-5) + Título (text-[16px] font-semibold)
* **Lado direito**: Botão close (X)
* **Botão close**: variant="ghost" size="sm" h-6 w-6 p-0
* **Ícone close**: X com w-4 h-4
* **Comportamento**: onClick chama onClose() para fechar o painel

### Conteúdo dos Cards de Seção
* **Container**: flex-1 overflow-y-auto custom-scrollbar p-3
* **Flexbox**: flex-1 para ocupar todo espaço restante após o header
* **Overflow**: overflow-y-auto para scroll quando necessário
* **Scrollbar**: custom-scrollbar para estilo consistente
* **Padding**: p-3 (12px) uniforme em todo conteúdo

### Persistência de Largura do Painel
* **Estado customizado**: Painel "lembra" da última largura ajustada pelo usuário
* **Callback**: `onResizeStop` captura quando usuário termina de redimensionar
* **Comportamento**: Ao reabrir o painel, volta na última largura customizada
* **Reset**: Apenas colapsar/expandir não reseta a largura customizada

### Implementação - Mecânica de Aplicativo
```tsx
import { Resizable } from "re-resizable";

// Estado (default: colapsado - nenhuma seção ativa)
const [activeSection, setActiveSection] = useState<string | null>(null);

// Estado para lembrar da largura customizada pelo usuário
const [customWidth, setCustomWidth] = useState<number>(464);

// Array de seções
const sections = [
  { id: "info", icon: Info, title: "Informações" },
  { id: "jornada", icon: Zap, title: "Jornada do cliente" },
  // ... outras seções
];

// Função para toggle de seção
const toggleSection = (sectionId: string) => {
  if (activeSection === sectionId) {
    // Se clicar na mesma seção, fecha
    setActiveSection(null);
  } else {
    // Se clicar em outra seção, abre ela
    setActiveSection(sectionId);
  }
};

const isCollapsed = activeSection === null;

// Container principal com Resizable
<Resizable
  size={{
    width: isCollapsed ? 63 : customWidth,
    height: "100%",
  }}
  minWidth={isCollapsed ? 63 : 320}
  maxWidth={isCollapsed ? 63 : 800}
  enable={{
    left: !isCollapsed, // Apenas resize pela esquerda quando expandida
    // todos outros lados: false
  }}
  onResizeStop={(e, direction, ref, d) => {
    // Salva a nova largura quando o usuário termina de redimensionar
    if (!isCollapsed) {
      setCustomWidth(customWidth + d.width);
    }
  }}
  handleStyles={{
    left: {
      width: "4px",
      left: "0",
      cursor: "col-resize",
      backgroundColor: "transparent",
      transition: "background-color 0.2s",
    },
  }}
  handleClasses={{
    left: "hover:bg-brand-primary/20",
  }}
  className="transition-all duration-300"
>
  <div className="bg-gray-100 border-l border-gray-200 h-full flex flex-col w-full">
    {/* Conteúdo principal - Layout flex horizontal */}
    <div className="flex-1 flex overflow-hidden">
      {/* Painel de conteúdo - só aparece quando expandido */}
      {!isCollapsed && (
        <div className="flex-1 overflow-hidden p-3">
          {activeSection === "info" && (
            <InformationSection
              atendimento={atendimento}
              onClose={() => setActiveSection(null)}
            />
          )}
          {activeSection === "jornada" && (
            <JourneySection
              onClose={() => setActiveSection(null)}
            />
          )}
          {/* ... outras seções com onClose */}
        </div>
      )}

      {/* Barra de ícones à direita - sempre visível */}
      <div className="w-[63px] flex-shrink-0 border-l border-gray-200">
        <TooltipProvider>
          <div className="flex flex-col items-center py-2 gap-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <Tooltip key={section.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className={`w-10 h-10 rounded-[10px] flex items-center justify-center transition-colors ${
                        isActive ? "bg-brand-primary" : "hover:bg-gray-200"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-[#717182]"}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>{section.title}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </div>
    </div>
  </div>
</Resizable>
```

### Implementação das Seções com Close
Todas as seções recebem a prop `onClose` e devem implementar o botão de fechar:

```tsx
import { Star, X } from "lucide-react";
import { Button } from "../ui/button";

interface ExperienceSectionProps {
  onClose: () => void;
}

export function ExperienceSection({ onClose }: ExperienceSectionProps) {
  return (
    <div className="bg-white border border-border rounded-[8px] overflow-hidden h-full flex flex-col">
      {/* Header com título e botão close */}
      <div className="px-3 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold text-[16px]">Experiência</span>
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

      {/* Conteúdo da seção */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        {/* Seu conteúdo aqui */}
      </div>
    </div>
  );
}
```

### Passagem da Função onClose
No InteractionPanel, passe a função que fecha o painel para cada seção:

```tsx
{activeSection === "experiencia" && (
  <ExperienceSection
    onClose={() => setActiveSection(null)}
  />
)}
```

### Detalhes da Animação
* **Transição de largura**: transition-all duration-300 no Resizable
* **Resize handle**: 4px de largura, hover com bg-brand-primary/20
* **Estados visuais**: Ícones com transition-colors para mudança suave
* **Performance**: Transições CSS nativas (GPU accelerated)

## Padrão de Visualização de Dados

### Layout Padronizado para Informações
* **Estrutura**: Grid responsivo (1 coluna em mobile, 2 colunas em desktop)
* **Card de informação**: Label + Valor (sem ícones)
* **Gap**: 3 unidades (12px) entre cards
* **Consistência**: Padrão limpo e objetivo para todas as seções

### Anatomia do Card de Informação
```tsx
<div>
  {/* Label */}
  <span className="text-[11px] text-muted-foreground block mb-1">Label do Campo</span>
  
  {/* Valor */}
  <p className="text-[12px] text-foreground truncate">Valor do Campo</p>
</div>
```

### Elementos Visuais
* **Label**: 11px (text-[11px]), cor muted-foreground, bloco com margem inferior de 4px (mb-1)
* **Valor**: 12px (text-[12px]), cor foreground, truncate para texto longo
* **Espaçamento vertical**: mb-1 (4px) entre label e valor
* **Container**: Simples div sem borders ou padding adicional

### Campos Especiais

#### Chip/Badge (ID do Caso)
```tsx
<div className="flex items-center gap-1">
  <span className="text-[12px] text-foreground font-mono bg-gray-100 px-2 py-0.5 rounded">098765</span>
</div>
```

#### Status Badge
```tsx
<span className="bg-[#e9f3d4] text-[#6d9f10] text-[11px] px-2 py-0.5 rounded-[4px]">
  Finalizado
</span>
```

#### Campo de largura completa (endereço)
```tsx
<div className="flex items-center gap-2 lg:col-span-2">
  {/* Ícone + Conteúdo */}
</div>
```

### Campos Enriquecidos - Tab Atendimento
* ID do Caso (chip com fonte mono)
* Protocolo
* Nome do usuário
* CPF
* Atendente
* Equipe
* Data de registro (com hora)
* Tempo de atendimento
* Motivo
* Status (badge colorido)

### Campos Enriquecidos - Tab Cliente
* Nome completo
* CPF
* E-mail principal
* E-mail secundário
* Telefone principal
* Telefone secundário
* Data de nascimento (com idade)
* Cliente desde
* Endereço completo (span 2 colunas)
* Empresa
* Cargo

### Grid Responsivo
* **Mobile**: 1 coluna (`grid-cols-1`)
* **Desktop**: 2 colunas (`lg:grid-cols-2`)
* **Campos largos**: Span 2 colunas em desktop (`lg:col-span-2`)
* **Gap**: 3 unidades (12px) entre items

## Padrão de Menu de Ações em Faturas

### Dropdown Menu para Faturas
* **Trigger**: Botão ghost com ícone MoreVertical (3 pontos verticais)
* **Tamanho**: h-7 w-7 p-0 (28px quadrado)
* **Ícone**: w-3.5 h-3.5 (14px)
* **Alinhamento**: Menu alinhado à direita (align="end")
* **Largura**: w-56 (224px)

### Ações Disponíveis

#### Ações Comuns (todas as faturas)
1. **Download do PDF** - Ícone: Download
2. **Enviar por e-mail** - Ícone: Mail
3. **Enviar por SMS** - Ícone: MessageSquare
4. **Ver detalhes da fatura** - Ícone: Eye

#### Ações Condicionais
* **Prorrogar vencimento** - Ícone: CalendarClock
  - Aparece apenas para faturas com status: Vencida ou Pendente
  - NÃO aparece para faturas Pagas
  - Separada por `DropdownMenuSeparator` antes e depois

### Status de Faturas

#### Badges de Status
* **Vencida**: `bg-red-100 text-red-700` - faturas com vencimento passado
* **Pendente**: `bg-yellow-100 text-yellow-700` - faturas em aberto dentro do prazo
* **Paga**: `bg-green-100 text-green-700` - faturas quitadas

#### Tamanho dos badges
* **Font size**: text-[10px]
* **Padding**: px-2 py-0.5
* **Border radius**: rounded-full

### Estrutura do Card de Fatura
```tsx
<div className="flex items-center justify-between p-2 bg-gray-50 rounded-[4px]">
  {/* Informações da fatura */}
  <div className="flex items-center gap-2">
    <FileText className="w-4 h-4 text-muted-foreground" />
    <div>
      <div className="text-[12px] text-foreground">Fatura 05/2025</div>
      <div className="text-[11px] text-muted-foreground">Venc: 05/06/2025 • R$ 1.234,50</div>
    </div>
  </div>
  
  {/* Status e ações */}
  <div className="flex items-center gap-1">
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Pendente</span>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <MoreVertical className="w-3.5 h-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Ações aqui */}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</div>
```

### Exemplo Completo - Menu com Ação Condicional
```tsx
{/* Fatura Vencida - com opção "Prorrogar vencimento" */}
<DropdownMenuContent align="end" className="w-56">
  <DropdownMenuItem>
    <Download className="w-4 h-4" />
    Download do PDF
  </DropdownMenuItem>
  <DropdownMenuItem>
    <Mail className="w-4 h-4" />
    Enviar por e-mail
  </DropdownMenuItem>
  <DropdownMenuItem>
    <MessageSquare className="w-4 h-4" />
    Enviar por SMS
  </DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem>
    <CalendarClock className="w-4 h-4" />
    Prorrogar vencimento
  </DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem>
    <Eye className="w-4 h-4" />
    Ver detalhes da fatura
  </DropdownMenuItem>
</DropdownMenuContent>

{/* Fatura Paga - SEM opção "Prorrogar vencimento" */}
<DropdownMenuContent align="end" className="w-56">
  <DropdownMenuItem>
    <Download className="w-4 h-4" />
    Download do PDF
  </DropdownMenuItem>
  <DropdownMenuItem>
    <Mail className="w-4 h-4" />
    Enviar por e-mail
  </DropdownMenuItem>
  <DropdownMenuItem>
    <MessageSquare className="w-4 h-4" />
    Enviar por SMS
  </DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem>
    <Eye className="w-4 h-4" />
    Ver detalhes da fatura
  </DropdownMenuItem>
</DropdownMenuContent>
```

### Layout da Lista de Faturas
* **Container**: space-y-2 (8px entre cards)
* **Background**: bg-gray-50 em cada card
* **Border radius**: rounded-[4px]
* **Padding**: p-2 (8px)
* **Ordenação**: Faturas mais recentes no topo
* **Separador**: border-t border-border antes da seção de faturas
* **Título da seção**: "Faturas" com text-[12px] font-semibold text-[#162533] mb-2

## Seção de Faturamento

### Estrutura Completa
A seção de Faturamento é dividida em duas subseções:
1. **Detalhes de cobrança**: Informações gerais sobre cobrança
2. **Faturas**: Lista de faturas com ações

### Detalhes de Cobrança
* **Título**: "Detalhes de cobrança" com text-[12px] font-semibold text-[#162533] mb-2
* **Layout**: Grid responsivo (1 col mobile, 2 cols desktop)
* **Padrão**: Igual ao padrão de visualização de dados (Label + Valor, sem ícones)
* **Campos**: Tipo de cobrança, Vencimento, Modalidade, Banco, Agência, Conta, Dígito
* **Gap**: 3 unidades (12px) entre campos

### Estrutura Completa da Seção
```tsx
<CollapsibleSection title="Faturamento" icon={DollarSign}>
  <div className="space-y-3">
    {/* Detalhes de cobrança */}
    <div>
      <h4 className="font-semibold text-[12px] text-[#162533] mb-2">Detalhes de cobrança</h4>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div>
          <span className="text-[11px] text-muted-foreground block mb-1">Tipo de cobrança</span>
          <p className="text-[12px] text-foreground truncate">Boleto Sustentável</p>
        </div>
        {/* Outros campos: Vencimento, Modalidade, Banco, Agência, Conta, Dígito */}
      </div>
    </div>

    {/* Seção de Faturas */}
    <div className="pt-3 border-t border-border">
      <h4 className="font-semibold text-[12px] text-[#162533] mb-2">Faturas</h4>
      <div className="space-y-2">
        {/* Cards de faturas com dropdown menu */}
      </div>
    </div>
  </div>
</CollapsibleSection>
```