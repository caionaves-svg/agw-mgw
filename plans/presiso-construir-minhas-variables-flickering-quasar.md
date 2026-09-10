# Plano: Construir e Reorganizar CSS Variables

## Contexto

O projeto usa `globals.css` como fonte principal de tokens de design (cores, tipografia, espaçamento). Porém, há dois problemas:

1. **Variáveis faltando**: O `Guidelines.md` e os componentes referenciam classes Tailwind como `bg-navigation-bg`, `bg-brand-primary`, `bg-badge-notification`, `bg-chat-selection`, `text-status-read` etc — mas essas variáveis **não existem** em `globals.css` nem no bloco `@theme inline`. Isso causa fallback silencioso para cores hardcoded nos componentes.

2. **Reorganização**: O arquivo `theme.css` (shadcn default) é importado via `default_theme.css` no `index.css` e depois sobrescrito por `globals.css`. Essa dupla importação é desnecessária e confusa. As variáveis já estão bem comentadas mas faltam grupos inteiros.

---

## Arquivo a modificar

**`/workspaces/default/code/src/styles/globals.css`** — único arquivo a editar.

---

## O que adicionar

### 1. Tokens de Navegação (faltando completamente)
Usados no `AppHeader`, sidebar e menus:

```css
/* Light */
--navigation-bg: #162533;
--navigation-border: #0d1a2a;
--navigation-hover: #1a2936;
--navigation-active: #00bcf2;
--navigation-text: #ffffff;
--navigation-text-muted: #a0aec0;
--navigation-text-active: #00bcf2;

/* Dark */
--navigation-bg: #0f172a;
--navigation-border: #1e293b;
--navigation-hover: #1e293b;
```

### 2. Tokens de Brand (alias explícito para `--primary`)
Usados como `bg-brand-primary`, `text-brand-primary`:

```css
--brand-primary: #00bcf2;
--brand-primary-foreground: #ffffff;
--brand-secondary: #7850cb;
--brand-secondary-foreground: #ffffff;
```

### 3. Tokens de Chat / Interface
Usados nos cards de atendimento:

```css
--chat-selection: #e6f7fd;       /* item selecionado */
--chat-selection-border: #99e0f7;
--status-read: #00bcf2;           /* check azul de lido */
--badge-notification: #d4183d;    /* badge vermelho de notificação */
--badge-notification-foreground: #ffffff;
```

### 4. Tokens de Sombra (faltando completamente)
Necessários para cards elevados, modais, dropdowns:

```css
--shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
--shadow-sm: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04);
```

### 5. Tokens de Z-index
Para garantir consistência em sobreposições:

```css
--z-dropdown: 50;
--z-sticky: 100;
--z-modal-backdrop: 200;
--z-modal: 300;
--z-toast: 400;
--z-tooltip: 500;
```

### 6. Tokens de Transição
Para animações consistentes:

```css
--transition-fast: 100ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

### 7. Registrar tudo no `@theme inline`
Todos os novos tokens precisam ser mapeados no bloco `@theme inline` para ficarem disponíveis como classes Tailwind:

```css
--color-navigation-bg: var(--navigation-bg);
--color-navigation-border: var(--navigation-border);
--color-navigation-hover: var(--navigation-hover);
--color-navigation-active: var(--navigation-active);
--color-navigation-text: var(--navigation-text);
--color-navigation-text-muted: var(--navigation-text-muted);
--color-navigation-text-active: var(--navigation-text-active);
--color-brand-primary: var(--brand-primary);
--color-brand-primary-foreground: var(--brand-primary-foreground);
--color-brand-secondary: var(--brand-secondary);
--color-brand-secondary-foreground: var(--brand-secondary-foreground);
--color-chat-selection: var(--chat-selection);
--color-chat-selection-border: var(--chat-selection-border);
--color-status-read: var(--status-read);
--color-badge-notification: var(--badge-notification);
--color-badge-notification-foreground: var(--badge-notification-foreground);
--shadow-xs: var(--shadow-xs);
--shadow-sm: var(--shadow-sm);
--shadow-md: var(--shadow-md);
--shadow-lg: var(--shadow-lg);
--shadow-xl: var(--shadow-xl);
```

---

## Reorganização do arquivo

Manter a estrutura atual de comentários, mas adicionar os novos grupos na ordem lógica dentro de `:root` e `.dark`:

```
:root
  ├── Typography scale
  ├── Brand Colors        ← adicionar brand-primary/secondary como alias
  ├── Backgrounds & Surfaces
  ├── Secondary Elements
  ├── Interactive Elements
  ├── System Feedback
  ├── Components (border, input, ring...)
  ├── Navigation          ← NOVO grupo
  ├── Chat / Interface    ← NOVO grupo
  ├── Sidebar
  ├── Messages
  ├── Charts
  ├── Color Scales (primary/secondary)
  ├── Typography tokens
  ├── Spacing tokens
  ├── Shadow tokens       ← NOVO grupo
  ├── Z-index tokens      ← NOVO grupo
  ├── Transition tokens   ← NOVO grupo
  └── Radius
```

---

## Verificação

Após a edição:
1. Abrir o app no browser → verificar que cores da navbar, badges e seleção de chat continuam corretas
2. Alternar entre light/dark mode → tokens de navegação devem mudar corretamente
3. Inspecionar no DevTools → confirmar que `--navigation-bg`, `--brand-primary`, `--badge-notification` existem no `:root`
4. Testar uma classe como `bg-brand-primary` num elemento → deve aplicar `#00bcf2`
