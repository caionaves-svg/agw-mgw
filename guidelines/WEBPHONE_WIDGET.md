# WebPhoneWidget - Sistema Completo de Estados

## Visão Geral

O `WebPhoneWidget` é um componente unificado que gerencia **todos os estados visuais** do WebPhone. Os desenvolvedores front-end precisam apenas passar o `state` correto e os callbacks apropriados.

## Componente Principal

* **Localização**: `/components/webphone/WebPhoneWidget.tsx`
* **Uso**: Componente controlado por props - apenas defina o estado atual
* **Altura**: Todos os estados têm **altura fixa de 44px (h-11)** para consistência visual
* **Design System**: Usa tokens de cor, fontes e espaçamentos do design system (sem hardcode)

## Estados Disponíveis

| Estado | Valor | Quando Usar |
|--------|-------|-------------|
| **Login** | `"login"` | Usuário não autenticado no WebPhone - mostra botão de login |
| **Idle** | `"idle"` | Logado mas sem número inserido - botão call desabilitado (opacidade 60%) |
| **Ready** | `"ready"` | Pronto para ligar - número inserido, botão call verde ativo |
| **Auto-Answer Countdown** | `"auto-answer-countdown"` | Contagem regressiva para atender automaticamente (ex: 00:10) |
| **Outgoing Call** | `"outgoing"` | Fazendo chamada - mostra "Chamando..." com animação de pulsação |
| **Incoming Call** | `"incoming"` | Recebendo chamada - opção de atender (verde) ou recusar (vermelho) |
| **In Call** | `"in-call"` | Em chamada ativa - mostra timer, número e controles completos |

## Exemplo de Uso

```tsx
import WebPhoneWidget from "@/components/webphone/WebPhoneWidget";

// Estado: Login
<WebPhoneWidget
  state="login"
  onLogin={() => handleLogin()}
  hasMicrophonePermission={false}
  onRequestMicPermission={() => requestMicPermission()}
/>

// Estado: Idle (sem número)
<WebPhoneWidget
  state="idle"
  onDialpad={() => openDialpad()}
/>

// Estado: Ready (com número)
<WebPhoneWidget
  state="ready"
  phoneNumber="+55 (11) 98765-4321"
  onCall={() => initiateCall()}
  onDialpad={() => openDialpad()}
/>

// Estado: Auto-Answer Countdown
<WebPhoneWidget
  state="auto-answer-countdown"
  timer="00:10"
/>

// Estado: Outgoing Call
<WebPhoneWidget
  state="outgoing"
  onHangup={() => cancelCall()}
  onMute={() => toggleMute()}
  onDialpad={() => openDialpad()}
/>

// Estado: Incoming Call
<WebPhoneWidget
  state="incoming"
  phoneNumber="+55 (34) 9 9999-9999"
  onAnswer={() => acceptCall()}
  onHangup={() => rejectCall()}
/>

// Estado: In Call
<WebPhoneWidget
  state="in-call"
  timer="00:05:42"
  phoneNumber="+55 (11) 98765-4321"
  onHangup={() => endCall()}
  onMute={() => toggleMute()}
  onDialpad={() => openDialpad()}
/>
```

## Props do WebPhoneWidget

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `state` | `WebPhoneState` | ✅ Sim | Estado atual do WebPhone |
| `phoneNumber` | `string` | ❌ Não | Número de telefone formatado |
| `timer` | `string` | ❌ Não | Timer no formato "MM:SS" ou "HH:MM:SS" |
| `onLogin` | `() => void` | ❌ Não | Callback ao clicar no botão "Acessar" |
| `onCall` | `() => void` | ❌ Não | Callback ao clicar no botão de ligar (verde) |
| `onAnswer` | `() => void` | ❌ Não | Callback ao atender chamada recebida |
| `onHangup` | `() => void` | ❌ Não | Callback ao desligar/recusar chamada |
| `onMute` | `() => void` | ❌ Não | Callback ao mutar/desmutar |
| `onDialpad` | `() => void` | ❌ Não | Callback ao abrir teclado numérico |
| `onMore` | `() => void` | ❌ Não | Callback para mais opções (3 pontos) |
| `hasMicrophonePermission` | `boolean` | ❌ Não | Se false, mostra ícone de alerta no estado login |
| `onRequestMicPermission` | `() => void` | ❌ Não | Callback ao clicar no ícone de microfone |

## Anatomia Visual dos Estados

### 1. Login
```
[Ícone Phone] Faça login para atendimentos de voz  [Botão Acessar]  [⚠️ Mic Icon]
                                                     (azul brand)     (se sem permissão)
```

### 2. Idle
```
Insira um número  [🟢 Call (opaco 60%)]  [⋮⋮⋮ Dialpad]
```

### 3. Ready
```
+55 (34) 9 9999-9999  [🟢 Call]  [⋮⋮⋮ Dialpad]
```

### 4. Auto-Answer Countdown
```
[Ícone Phone] Atendendo a chamada em:  00:10
                                       (azul bold)
```

### 5. Outgoing Call
```
[● Pulse] Chamando...  [🔴 Hangup]  [🎤 Mute]  [⋮⋮⋮ Dialpad]  [🔴 Hangup]
```

### 6. Incoming Call
```
[Ícone Phone]  Recebendo chamada...      [🟢 Answer]  [🔴 Reject]
               +55 (34) 9 9999-9999
```

### 7. In Call
```
[● Pulse] 00:05:42  +55 (34) 9 9999-9999  [🔴 Hangup]  [🎤 Mute]  [⋮⋮⋮ Dialpad]
```

## Cores e Estilos (Design System)

* **Container**: `bg-muted` com `rounded-full` e altura fixa `h-11`
* **Botão Call (verde)**: `bg-green-600 hover:bg-green-700`
* **Botão Call (idle/desabilitado)**: `bg-green-600/60 opacity-60`
* **Botão Hangup (vermelho)**: `bg-destructive hover:opacity-90`
* **Botões secundários (mute, dialpad)**: `bg-card border border-card hover:bg-muted`
* **Botão Acessar**: `variant="brand"` (azul #00BCF2)
* **Texto primário**: `text-muted-foreground` com `variant="sm"` do componente Text
* **Timer (countdown)**: `text-brand-primary font-bold`
* **Pulsação animada**: Componente `PulseIndicator` com circles e `animate-pulse`

## Ícones do Lucide React

O componente usa ícones da biblioteca **Lucide React** seguindo o padrão do projeto:
* `Phone` - Ícone de telefone (ligar, atender)
* `PhoneOff` - Ícone de desligar/recusar chamada
* `Mic` - Ícone de microfone (mute/unmute)
* `Grid3x3` - Ícone de teclado numérico (dialpad)
* `PulseIndicator` - Componente customizado de animação de pulsação durante chamadas

**Importante**: Sempre use ícones do Lucide React - nunca importe ícones do Figma para manter consistência.

## Integração com CallContext

O WebPhoneWidget é **stateless** - ele apenas renderiza o UI. O estado real da chamada deve ser gerenciado pelo `CallContext`:

```tsx
import { useCall } from '@/contexts/CallContext';
import WebPhoneWidget from '@/components/webphone/WebPhoneWidget';

function MyCallComponent() {
  const { callState, webPhoneState, startCall, endCall, loginWebPhone } = useCall();
  
  // Determinar estado visual baseado no CallContext
  const getWebPhoneState = () => {
    if (!webPhoneState.isLoggedIn) return "login";
    if (callState.isActive && callState.isIncoming) return "incoming";
    if (callState.isActive && !callState.isAnswered) return "outgoing";
    if (callState.isActive) return "in-call";
    if (callState.phoneNumber) return "ready";
    return "idle";
  };

  return (
    <WebPhoneWidget
      state={getWebPhoneState()}
      timer={callState.duration}
      phoneNumber={callState.phoneNumber}
      onLogin={loginWebPhone}
      onCall={() => startCall(callState.phoneNumber)}
      onHangup={endCall}
      // ... outros callbacks
    />
  );
}
```

## Demonstração de Estados

Para visualizar **todos os estados** disponíveis:

```tsx
import WebPhoneStates from '@/components/webphone/WebPhoneStates';

// Renderiza uma página com todos os estados e controles interativos
<WebPhoneStates />
```

Este componente é **apenas para desenvolvimento/documentação** - não usar em produção.

## Padronização de Altura

**IMPORTANTE**: Todos os estados do WebPhone têm altura fixa de `44px (h-11)` para garantir:
* ✅ Consistência visual ao trocar de estado
* ✅ Sem "jumps" ou deslocamento de layout
* ✅ Alinhamento perfeito com outros elementos da navbar

Os paddings foram ajustados individualmente (`py-2`, `pl-2`, `pr-2`, etc.) para manter a altura consistente mesmo com elementos internos diferentes.

## Boas Práticas

1. **Sempre defina o estado**: Não deixe `state` undefined
2. **Forneça callbacks apropriados**: Cada estado precisa de callbacks específicos
3. **Formate o timer corretamente**: Use "MM:SS" ou "HH:MM:SS"
4. **Formate o phoneNumber**: Use formatação consistente com máscara
5. **Não modifique o componente base**: Crie wrappers se precisar de comportamento customizado
6. **Use CallContext para lógica**: WebPhoneWidget é apenas apresentação

## Fluxo de Estados Típico

### Fluxo: Fazer Chamada
```
login → idle → ready → outgoing → in-call → login
```

### Fluxo: Receber Chamada
```
login → idle → incoming → in-call → login
```

### Fluxo: Atendimento Automático
```
login → idle → incoming → auto-answer-countdown → in-call → login
```

## Troubleshooting

### Estado não muda visualmente
✅ Verifique se a prop `state` está sendo atualizada corretamente
✅ Confira se o valor do state é válido (um dos 7 estados disponíveis)

### Botões não funcionam
✅ Certifique-se de passar os callbacks apropriados para cada estado
✅ Verifique console do navegador para erros

### Altura inconsistente
✅ Todos os estados devem ter `h-11` - não modifique manualmente
✅ Use os componentes de estado fornecidos, não crie custom

### Timer não atualiza
✅ O WebPhoneWidget é stateless - você deve gerenciar o timer externamente
✅ Atualize a prop `timer` a cada segundo via useEffect no componente pai

## Arquivos Relacionados

* `/components/webphone/WebPhoneWidget.tsx` - Componente principal
* `/components/webphone/WebPhoneStates.tsx` - Demo de todos os estados
* `/components/webphone/WebPhoneLogin.tsx` - Componente legado (deprecated)
* `/components/webphone/ActiveCallWidget.tsx` - Componente legado (deprecated)
* `/contexts/CallContext.tsx` - Gerenciamento de estado de chamadas
* `/guidelines/WEBPHONE_WIDGET.md` - Esta documentação