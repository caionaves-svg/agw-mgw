import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { ChannelType } from "../components/ChannelAvatar";

// Interfaces
export interface Mensagem {
  id: string;
  texto: string;
  remetente: "cliente" | "atendente";
  timestamp: string;
  status?: "enviando" | "enviado" | "lido";
  tipo?: "texto" | "audio" | "imagem" | "localizacao" | "arquivo"; // Tipo de mensagem
  duracao?: string; // Duração do áudio (ex: "0:45")
  transcricao?: string; // Transcrição do áudio
  imagemUrl?: string; // URL da imagem anexada
  imagemLegenda?: string; // Legenda opcional da imagem
  localizacao?: {
    latitude: number;
    longitude: number;
    endereco: string;
    nome?: string; // Nome do local (ex: "Hospital Santa Casa")
  };
  arquivo?: {
    nome: string;
    tamanho: string; // Ex: "2.4 MB"
    tipo: "pdf" | "doc" | "docx" | "xls" | "xlsx" | "txt" | "zip" | "outros";
    url?: string; // URL para download
  };
  reactions?: {
    emoji: string;
    count: number;
    users: string[];
  }[];
}

export interface Atendente {
  nome: string;
  cor: string;
}

export interface Tag {
  label: string;
  color: string; // Cor de fundo da tag
  textColor: string; // Cor do texto
}

export interface SLA {
  tipo: 'primeira-resposta' | 'resolucao' | 'resposta-subsequente';
  status: 'dentro-prazo' | 'em-risco' | 'estourado';
  prazo: string; // Data/hora limite
  tempoRestante: string; // Formato HH:MM:SS
  percentualDecorrido: number; // 0-100
  metaMinutos: number; // Meta em minutos
  tempoDecorridoMinutos: number; // Tempo já decorrido
}

export interface Usuario {
  id: string;
  nome: string;
  avatar: string;
  ultimaMensagem: string;
  horario: string;
  lastMessageTimestamp?: number; // Timestamp para ordenação
  notificacoes?: number;
  status?: "lida" | "nao-lida" | "enviada";
  channel: ChannelType;
  atendente?: Atendente;
  tags?: Tag[]; // Nova propriedade - limite de 2 tags
  isEmCurso?: boolean;
  sla?: SLA;
}

export interface HistoricoConversa {
  usuarioId: string;
  mensagens: Mensagem[];
}

// Interfaces para Email
export interface EmailAnexo {
  id: string;
  nome: string;
  tamanho: string;
  tipo: "pdf" | "doc" | "docx" | "xls" | "xlsx" | "jpg" | "png" | "zip" | "outros";
  url?: string;
}

export interface Email {
  id: string;
  assunto: string;
  remetente: {
    nome: string;
    email: string;
  };
  destinatarios: Array<{
    nome: string;
    email: string;
  }>;
  cc?: Array<{
    nome: string;
    email: string;
  }>;
  cco?: Array<{
    nome: string;
    email: string;
  }>;
  corpo: string; // HTML ou texto
  preview: string; // Primeira linha do corpo para preview
  data: string;
  timestamp: Date;
  lido: boolean;
  importante: boolean;
  anexos?: EmailAnexo[];
  tags?: string[];
}

// Context Data Interface
interface DataContextType {
  usuarios: Usuario[];
  conversas: HistoricoConversa[];
  emails: Email[]; // Nova propriedade
  getUsuarioById: (id: string) => Usuario | undefined;
  getMensagensByUsuarioId: (id: string) => Mensagem[];
  getUltimaMensagemByUsuarioId: (id: string) => string;
  addMensagem: (
    usuarioId: string,
    mensagem: Omit<Mensagem, "id">,
  ) => void;
  updateUsuarioStatus: (
    usuarioId: string,
    status: Usuario["status"],
  ) => void;
  setUsuarios: (usuarios: Usuario[]) => void;
  removeUsuario: (usuarioId: string) => void;
  getEmailById: (id: string) => Email | undefined; // Nova função
  markEmailAsRead: (id: string) => void; // Nova função
  assumirAtendimento: (usuarioId: string) => void; // Nova função para assumir atendimento
  /** Zera as não lidas ao abrir a conversa (só em memória — volta ao recarregar) */
  marcarComoLido: (usuarioId: string) => void;
}

// Context
const DataContext = createContext<DataContextType | undefined>(
  undefined,
);

// Mapeamento de IDs antigos para novos IDs aleatórios de 6 dígitos
const idMapping: Record<string, string> = {
  "1": "098765",
  "2": "742130",
  "29": "156482",
  "30": "923647",
  "21": "481230",
  "22": "657891",
  "3": "345678",
  "4": "890123",
  "23": "234567",
  "5": "567890",
  "24": "123890",
  "6": "789456",
  "25": "456123",
  "26": "321098",
  "27": "654789",
  "28": "198234",
};

// Dados iniciais dos usuários (migrados de AtendimentosList.tsx)
const usuariosIniciais: Usuario[] = [
  // Atendimentos em Curso
  {
    id: "098765",
    nome: "Sérgio Vieira",
    ultimaMensagem:
      "Olá! Gostaria de saber que horas que po...",
    horario: "10:32",
    lastMessageTimestamp: Date.now() - (5 * 60 * 1000), // Há 5 minutos
    notificacoes: 2,
    avatar:
      "https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTY4Mzk5ODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "nao-lida",
    channel: "whatsapp",
    isEmCurso: true,
    tags: [
      { label: "Confirmado", color: "#D1FAE5", textColor: "#065F46" },   // Verde - Resolvido/Sucesso
      { label: "VIP", color: "#E0E7FF", textColor: "#3730A3" },          // Roxo - Prioridade
    ],
    sla: {
      tipo: 'primeira-resposta',
      status: 'dentro-prazo',
      prazo: '13/11/2025 11:32',
      tempoRestante: '00:45:23',
      percentualDecorrido: 25,
      metaMinutos: 60,
      tempoDecorridoMinutos: 15,
    },
  },
  {
    id: "742130",
    nome: "Ana Takahashi",
    ultimaMensagem: "Poderia ajudar em algo mais?",
    horario: "10:30",
    lastMessageTimestamp: Date.now() - (2 * 60 * 1000), // Há 2 minutos
    avatar:
      "https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTY3NTg4ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "lida",
    channel: "webchat",
    isEmCurso: true,
    tags: [
      { label: "Cadastro", color: "#E0E7FF", textColor: "#3730A3" },
    ],
  },
  {
    id: "156482",
    nome: "Ricardo Pereira",
    ultimaMensagem: "Preciso alterar meu cadastro urgente",
    horario: "10:35",
    lastMessageTimestamp: Date.now() - (1 * 60 * 1000), // Há 1 minuto
    notificacoes: 1,
    avatar:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTY3NTg4ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "nao-lida",
    channel: "instagram",
    isEmCurso: true,
    tags: [
      { label: "Urgente", color: "#FEE2E2", textColor: "#991B1B" },
      { label: "Atualização", color: "#FEF3C7", textColor: "#92400E" },
    ],
    sla: {
      tipo: 'primeira-resposta',
      status: 'em-risco',
      prazo: '13/11/2025 10:50',
      tempoRestante: '00:12:30',
      percentualDecorrido: 75,
      metaMinutos: 15,
      tempoDecorridoMinutos: 12,
    },
  },
  {
    id: "923647",
    nome: "Beatriz Fernandes",
    ultimaMensagem: "Quando vai estar disponível o resultado?",
    horario: "10:33",
    lastMessageTimestamp: Date.now() - (3 * 60 * 1000), // Há 3 minutos
    notificacoes: 3,
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTY3NTg4ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "nao-lida",
    channel: "telegram",
    isEmCurso: true,
    tags: [
      { label: "Resultado", color: "#D1FAE5", textColor: "#065F46" },
      { label: "Exame", color: "#DBEAFE", textColor: "#1E40AF" },
    ],
    sla: {
      tipo: 'primeira-resposta',
      status: 'estourado',
      prazo: '13/11/2025 10:30',
      tempoRestante: '-00:08:00',
      percentualDecorrido: 120,
      metaMinutos: 15,
      tempoDecorridoMinutos: 18,
    },
  },

  // Todos os Atendimentos
  {
    id: "481230",
    nome: "Marina Santos",
    ultimaMensagem: "Quando posso agendar minha consulta?",
    horario: "Ontem",
    lastMessageTimestamp: Date.now() - (24 * 60 * 60 * 1000), // Ontem
    notificacoes: 3,
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616c4c8aae5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTY3NTg4ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "nao-lida",
    channel: "email",
    tags: [
      { label: "Agendamento", color: "#DBEAFE", textColor: "#1E40AF" },
      { label: "Consulta", color: "#E0E7FF", textColor: "#3730A3" },
    ],
  },
  {
    id: "657891",
    nome: "Roberto Lima",
    ultimaMensagem: "Preciso confirmar os dados do pedido",
    horario: "10:44",
    lastMessageTimestamp: Date.now() - (10 * 60 * 1000), // Há 10 minutos
    notificacoes: 1,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTY3NTg4ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "nao-lida",
    channel: "rcs",
    tags: [
      { label: "Pedido", color: "#FEF3C7", textColor: "#92400E" },
    ],
  },
  {
    id: "345678",
    nome: "Caio Naves",
    ultimaMensagem: "Ok, muito obrigado!",
    horario: "10:40",
    lastMessageTimestamp: Date.now() - (15 * 60 * 1000), // Há 15 minutos
    notificacoes: 1,
    avatar:
      "https://images.unsplash.com/photo-1624835589323-442670703bc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTY4NDE2NTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "nao-lida",
    channel: "messenger",
    tags: [
      { label: "Resolvido", color: "#D1FAE5", textColor: "#065F46" },
    ],
  },
  {
    id: "890123",
    nome: "Thiago Fuzaro",
    ultimaMensagem: "Av. Getúlio Vargas, nº 34",
    horario: "10:41",
    lastMessageTimestamp: Date.now() - (20 * 60 * 1000), // Há 20 minutos
    avatar:
      "https://images.unsplash.com/photo-1712168567859-e24cbc155219?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTY4Mjg5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "lida",
    channel: "whatsapp",
    tags: [
      { label: "Cadastro", color: "#E0E7FF", textColor: "#3730A3" },
      { label: "Endereço", color: "#FEF3C7", textColor: "#92400E" },
    ],
  },
  {
    id: "234567",
    nome: "Jessica Moura",
    ultimaMensagem: "Ótimo, vou aguardar o retorno!",
    horario: "2 dias atrás",
    lastMessageTimestamp: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 dias atrás
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTY3NTg4ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "lida",
    channel: "telegram",
    tags: [
      { label: "Pendente", color: "#FEF3C7", textColor: "#92400E" },
    ],
  },
  {
    id: "567890",
    nome: "Dione Munir",
    ultimaMensagem:
      "Preciso trocar de horário para o meu agu...",
    horario: "Ontem",
    lastMessageTimestamp: Date.now() - (26 * 60 * 60 * 1000), // Ontem (26h atrás)
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTY3NDU0OTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "nao-lida",
    channel: "webchat",
    tags: [
      { label: "Reagendamento", color: "#DBEAFE", textColor: "#1E40AF" },
    ],
  },
  {
    id: "123890",
    nome: "Fernando Costa",
    ultimaMensagem: "Qual é o procedimento para cancelar?",
    horario: "Semana passada",
    lastMessageTimestamp: Date.now() - (6 * 24 * 60 * 60 * 1000), // 6 dias atrás
    notificacoes: 2,
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTY3NTg4ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "nao-lida",
    channel: "instagram",
    tags: [
      { label: "Cancelamento", color: "#FEE2E2", textColor: "#991B1B" },
    ],
  },
  {
    id: "789456",
    nome: "Letícia Araújo",
    ultimaMensagem: "Preciso de ajuda com isso!",
    horario: "10:41",
    lastMessageTimestamp: Date.now() - (7 * 60 * 1000), // Há 7 minutos
    notificacoes: 5,
    avatar:
      "https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTY3NTg4ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "nao-lida",
    channel: "email",
    tags: [
      { label: "Urgente", color: "#FEE2E2", textColor: "#991B1B" },
      { label: "Reclamação", color: "#FEE2E2", textColor: "#991B1B" },
    ],
  },
  {
    id: "456123",
    nome: "Paulo Mendes",
    ultimaMensagem: "Já recebi a confirmação, obrigado!",
    horario: "10:37",
    lastMessageTimestamp: Date.now() - (30 * 60 * 1000), // Há 30 minutos
    avatar:
      "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTY3NTg4ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "lida",
    channel: "whatsapp",
    tags: [
      { label: "Confirmação", color: "#D1FAE5", textColor: "#065F46" },
    ],
  },
  {
    id: "321098",
    nome: "Carla Ribeiro",
    ultimaMensagem: "Posso remarcar para quinta-feira?",
    horario: "10:36",
    lastMessageTimestamp: Date.now() - (45 * 60 * 1000), // Há 45 minutos
    notificacoes: 1,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTY3NTg4ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "nao-lida",
    channel: "rcs",
    tags: [
      { label: "Reagendamento", color: "#DBEAFE", textColor: "#1E40AF" },
    ],
  },
  {
    id: "654789",
    nome: "Rafael Souza",
    ultimaMensagem: "Relatorio_Mensal_Agosto_2025.xlsx",
    horario: "10:35",
    lastMessageTimestamp: Date.now() - (1 * 60 * 60 * 1000), // Há 1 hora
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTY3NTg4ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "lida",
    channel: "messenger",
    tags: [
      { label: "Documento", color: "#E0E7FF", textColor: "#3730A3" },
    ],
  },
  {
    id: "198234",
    nome: "Camila Torres",
    ultimaMensagem: "Muito obrigada pelo atendimento!",
    horario: "10:34",
    lastMessageTimestamp: Date.now() - (3 * 24 * 60 * 60 * 1000), // 3 dias atrás
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTY3NTg4ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "lida",
    channel: "telegram",
    tags: [
      { label: "Finalizado", color: "#D1FAE5", textColor: "#065F46" },
    ],
  },
];

// Históricos de conversa específicos para cada usuário
const conversasIniciais: HistoricoConversa[] = [
  // Sérgio Vieira (ID: 098765)
  {
    usuarioId: "098765",
    mensagens: [
      {
        id: "1-1",
        texto: "Olá, boa tarde!",
        remetente: "cliente",
        timestamp: "12:30",
      },
      {
        id: "1-2",
        texto:
          "Gostaria de saber que horas que posso ser atendido hoje...",
        remetente: "cliente",
        timestamp: "12:30",
      },
      {
        id: "1-3",
        texto:
          "Olá Sérgio! Vou verificar os horários disponíveis para você.",
        remetente: "atendente",
        timestamp: "12:31",
        status: "lido",
        reactions: [
          { emoji: "👍", count: 1, users: ["Sérgio Vieira"] },
        ],
      },
      {
        id: "1-4",
        texto: "Temos vagas às 15h e às 17h, qual prefere?",
        remetente: "atendente",
        timestamp: "12:33",
        status: "enviado",
        reactions: [
          { emoji: "👍", count: 1, users: ["Sérgio Vieira"] },
          { emoji: "❤️", count: 1, users: ["Sérgio Vieira"] },
        ],
      },
      {
        id: "1-5",
        texto: "Pode ser às 15h, obrigado!",
        remetente: "cliente",
        timestamp: "12:34",
        tipo: "audio",
        duracao: "0:05",
        transcricao: "Pode ser às 15h, obrigado!",
      },
    ],
  },

  // Ana Takahashi (ID: 742130)
  {
    usuarioId: "742130",
    mensagens: [
      {
        id: "2-1",
        texto: "Obrigada pela ajuda anterior",
        remetente: "cliente",
        timestamp: "10:25",
      },
      {
        id: "2-2",
        texto: "Poderia ajudar em algo mais?",
        remetente: "cliente",
        timestamp: "10:30",
      },
      {
        id: "2-3",
        texto:
          "Claro! Fico à disposição. Em que posso te ajudar?",
        remetente: "atendente",
        timestamp: "10:31",
        status: "lido",
      },
      {
        id: "2-4",
        texto:
          "Preciso confirmar se meu cadastro está atualizado.",
        remetente: "cliente",
        timestamp: "10:32",
      },
      {
        id: "2-5",
        texto:
          "Sim, está tudo correto no sistema. Não há pendências.",
        remetente: "atendente",
        timestamp: "10:34",
        status: "lido",
      },
      {
        id: "2-6",
        texto: "Perfeito! Aliás, essa é a localização da clínica para minha consulta de amanhã?",
        remetente: "cliente",
        timestamp: "10:36",
      },
      {
        id: "2-7",
        texto: "Hospital Santa Casa",
        remetente: "cliente",
        timestamp: "10:37",
        tipo: "localizacao",
        localizacao: {
          latitude: -19.9245,
          longitude: -43.9352,
          endereco: "Av. Francisco Sales, 1111 - Santa Efigênia, Belo Horizonte - MG, 30150-221",
          nome: "Hospital Santa Casa de Belo Horizonte"
        }
      },
      {
        id: "2-8",
        texto: "Isso mesmo! Sua consulta é amanhã às 14h neste endereço. Lembre-se de chegar com 15 minutos de antecedência.",
        remetente: "atendente",
        timestamp: "10:38",
        status: "enviado",
      },
    ],
  },

  // Ricardo Pereira (ID: 156482)
  {
    usuarioId: "156482",
    mensagens: [
      {
        id: "29-1",
        texto: "Oi, preciso de ajuda urgente",
        remetente: "cliente",
        timestamp: "10:33",
      },
      {
        id: "29-2",
        texto: "Preciso alterar meu cadastro urgente",
        remetente: "cliente",
        timestamp: "10:35",
      },
      {
        id: "29-3",
        texto:
          "Tudo bem, Ricardo! Vou te ajudar com isso. Para atualizar seu cadastro, preciso de algumas informações. Pode me informar qual dado específico você precisa atualizar e qual o novo valor correto?",
        remetente: "atendente",
        timestamp: "10:36",
        status: "lido",
        tipo: "audio",
        duracao: "0:18",
        transcricao: "Tudo bem, Ricardo! Vou te ajudar com isso. Para atualizar seu cadastro, preciso de algumas informações. Pode me informar qual dado específico você precisa atualizar e qual o novo valor correto?",
      },
      {
        id: "29-4",
        texto: "Meu endereço está desatualizado.",
        remetente: "cliente",
        timestamp: "10:37",
      },
      {
        id: "29-5",
        texto:
          "Perfeito! Para garantir que seus dados fiquem corretos no sistema, vou precisar que você me passe o endereço completo atualizado, incluindo rua, número, complemento se houver, bairro, cidade, estado e CEP. Assim consigo fazer a alteração de forma precisa e você já fica com tudo certinho para futuras comunicações e atendimentos.",
        remetente: "atendente",
        timestamp: "10:38",
        status: "enviado",
        tipo: "audio",
        duracao: "0:25",
        transcricao: "Perfeito! Para garantir que seus dados fiquem corretos no sistema, vou precisar que você me passe o endereço completo atualizado, incluindo rua, número, complemento se houver, bairro, cidade, estado e CEP. Assim consigo fazer a alteração de forma precisa e você já fica com tudo certinho para futuras comunicações e atendimentos.",
      },
    ],
  },

  // Beatriz Fernandes (ID: 923647)
  {
    usuarioId: "923647",
    mensagens: [
      {
        id: "30-1",
        texto: "Bom dia!",
        remetente: "cliente",
        timestamp: "10:30",
      },
      {
        id: "30-2",
        texto: "Quando vai estar disponível o resultado?",
        remetente: "cliente",
        timestamp: "10:33",
      },
      {
        id: "30-3",
        texto:
          "Bom dia, Beatriz! O resultado estará disponível amanhã às 14h.",
        remetente: "atendente",
        timestamp: "10:35",
        status: "enviado",
      },
      {
        id: "30-4",
        texto: "Perfeito, muito obrigada pela informação.",
        remetente: "cliente",
        timestamp: "10:36",
      },
      {
        id: "30-5",
        texto: "Aliás, segue o pedido médico para o exame",
        remetente: "cliente",
        timestamp: "10:38",
      },
      {
        id: "30-6",
        texto: "Pedido Médico - Exame de Sangue",
        remetente: "cliente",
        timestamp: "10:38",
        tipo: "imagem",
        imagemUrl: "https://images.unsplash.com/photo-1620933967796-53cc2b175b6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZXhhbSUyMHJlc3VsdCUyMGRvY3VtZW50fGVufDF8fHx8MTc2NzgxNjA5OXww&ixlib=rb-4.1.0&q=80&w=1080",
        imagemLegenda: "Pedido médico solicitando hemograma completo"
      },
      {
        id: "30-7",
        texto: "Recebi o pedido! Já está anexado ao seu prontuário. Obrigado por enviar.",
        remetente: "atendente",
        timestamp: "10:39",
        status: "lido",
      },
    ],
  },

  // Marina Santos (ID: 481230)
  {
    usuarioId: "481230",
    mensagens: [
      {
        id: "21-1",
        texto: "Olá, como faço para agendar?",
        remetente: "cliente",
        timestamp: "10:43",
      },
      {
        id: "21-2",
        texto: "Quando posso agendar minha consulta?",
        remetente: "cliente",
        timestamp: "10:45",
        tipo: "audio",
        duracao: "0:08",
        transcricao: "Quando posso agendar minha consulta?",
      },
      {
        id: "21-3",
        texto: "Vou verificar as opções disponíveis para você.",
        remetente: "atendente",
        timestamp: "10:46",
        status: "enviado",
      },
      {
        id: "21-4",
        texto:
          "Temos horários na próxima terça-feira às 9h e às 11h.",
        remetente: "atendente",
        timestamp: "10:48",
        status: "lido",
        tipo: "audio",
        duracao: "0:12",
        transcricao: "Temos horários na próxima terça-feira às 9h e às 11h.",
      },
      {
        id: "21-5",
        texto: "Pode agendar às 11h, por favor.",
        remetente: "cliente",
        timestamp: "10:49",
      },
    ],
  },

  // Roberto Lima (ID: 657891)
  {
    usuarioId: "657891",
    mensagens: [
      {
        id: "22-1",
        texto: "Fiz um pedido ontem",
        remetente: "cliente",
        timestamp: "10:42",
      },
      {
        id: "22-2",
        texto: "Preciso confirmar os dados do pedido",
        remetente: "cliente",
        timestamp: "10:44",
      },
      {
        id: "22-3",
        texto:
          "Claro, Roberto. Pode me passar o número do pedido?",
        remetente: "atendente",
        timestamp: "10:45",
        status: "enviado",
      },
      {
        id: "22-4",
        texto: "Número #4589",
        remetente: "cliente",
        timestamp: "10:46",
      },
    ],
  },

  // Caio Naves (ID: 345678)
  {
    usuarioId: "345678",
    mensagens: [
      {
        id: "3-1",
        texto: "Conseguiu resolver minha solicitação?",
        remetente: "cliente",
        timestamp: "10:38",
      },
      {
        id: "3-2",
        texto: "Sim, já está tudo resolvido!",
        remetente: "atendente",
        timestamp: "10:39",
        status: "lido",
      },
      {
        id: "3-3",
        texto: "Ok, muito obrigado!",
        remetente: "cliente",
        timestamp: "10:40",
      },
    ],
  },

  // Thiago Fuzaro (ID: 890123)
  {
    usuarioId: "890123",
    mensagens: [
      {
        id: "4-1",
        texto: "Qual meu endereço cadastrado?",
        remetente: "cliente",
        timestamp: "10:40",
      },
      {
        id: "4-2",
        texto: "Av. Getúlio Vargas, nº 34",
        remetente: "atendente",
        timestamp: "10:41",
        status: "lido",
      },
    ],
  },

  // Jessica Moura (ID: 234567)
  {
    usuarioId: "234567",
    mensagens: [
      {
        id: "23-1",
        texto: "Quando terei uma resposta?",
        remetente: "cliente",
        timestamp: "10:37",
      },
      {
        id: "23-2",
        texto: "Em até 24 horas você receberá o retorno.",
        remetente: "atendente",
        timestamp: "10:38",
        status: "lido",
      },
      {
        id: "23-3",
        texto: "Ótimo, vou aguardar o retorno!",
        remetente: "cliente",
        timestamp: "10:39",
      },
    ],
  },

  // Dione Munir (ID: 567890)
  {
    usuarioId: "567890",
    mensagens: [
      {
        id: "5-1",
        texto:
          "Preciso trocar de horário para o meu agendamento",
        remetente: "cliente",
        timestamp: "10:41",
      },
    ],
  },

  // Letícia Araújo (ID: 789456) - Conversa agressiva
  {
    usuarioId: "789456",
    mensagens: [
      {
        id: "6-1",
        texto:
          "ISSO É UM ABSURDO! Vocês prometeram resolver em 24h e já fazem 3 dias!",
        remetente: "cliente",
        timestamp: "10:38",
      },
      {
        id: "6-2",
        texto:
          "Estou EXTREMAMENTE INSATISFEITA com esse atendimento",
        remetente: "cliente",
        timestamp: "10:39",
      },
      {
        id: "6-3",
        texto:
          "PRECISO DE AJUDA COM ISSO URGENTE! Vou reclamar no Procon se não resolverem!",
        remetente: "cliente",
        timestamp: "10:41",
      },
      {
        id: "6-4",
        texto: "Letícia, compreendo sua frustração. Vou analisar seu caso imediatamente. Pode me enviar o comprovante do protocolo?",
        remetente: "atendente",
        timestamp: "10:42",
        status: "lido",
      },
      {
        id: "6-5",
        texto: "Protocolo_Atendimento_45891.pdf",
        remetente: "cliente",
        timestamp: "10:43",
        tipo: "arquivo",
        arquivo: {
          nome: "Protocolo_Atendimento_45891.pdf",
          tamanho: "856 KB",
          tipo: "pdf",
        }
      },
      {
        id: "6-6",
        texto: "Recebi o documento. Já estou escalando para o setor responsável com prioridade máxima. Você receberá um retorno em até 2 horas.",
        remetente: "atendente",
        timestamp: "10:44",
        status: "enviado",
      },
    ],
  },

  // Carla Ribeiro (ID: 321098)
  {
    usuarioId: "321098",
    mensagens: [
      {
        id: "26-1",
        texto: "Oi! Tenho um agendamento para amanhã",
        remetente: "cliente",
        timestamp: "10:34",
      },
      {
        id: "26-2",
        texto: "Posso remarcar para quinta-feira?",
        remetente: "cliente",
        timestamp: "10:36",
      },
      {
        id: "26-3",
        texto:
          "Vou verificar a agenda e te retorno em instantes.",
        remetente: "atendente",
        timestamp: "10:37",
        status: "enviado",
      },
    ],
  },

  // Fernando Costa (ID: 123890)
  {
    usuarioId: "123890",
    mensagens: [
      {
        id: "24-1",
        texto: "Preciso cancelar meu pedido",
        remetente: "cliente",
        timestamp: "10:36",
      },
      {
        id: "24-2",
        texto: "Qual é o procedimento para cancelar?",
        remetente: "cliente",
        timestamp: "10:38",
      },
      {
        id: "24-3",
        texto:
          "Vou verificar as opções de cancelamento para você.",
        remetente: "atendente",
        timestamp: "10:39",
        status: "enviado",
      },
    ],
  },

  // Paulo Mendes (ID: 456123)
  {
    usuarioId: "456123",
    mensagens: [
      {
        id: "25-1",
        texto: "Recebi o e-mail de confirmação",
        remetente: "cliente",
        timestamp: "10:35",
      },
      {
        id: "25-2",
        texto: "Já recebi a confirmação, obrigado!",
        remetente: "cliente",
        timestamp: "10:37",
      },
      {
        id: "25-3",
        texto: "Perfeito! Fico feliz em ajudar.",
        remetente: "atendente",
        timestamp: "10:38",
        status: "lido",
      },
    ],
  },

  // Rafael Souza (ID: 654789)
  {
    usuarioId: "654789",
    mensagens: [
      {
        id: "27-1",
        texto: "Vou enviar o documento agora",
        remetente: "cliente",
        timestamp: "10:33",
      },
      {
        id: "27-2",
        texto: "Relatorio_Mensal_Agosto_2025.xlsx",
        remetente: "cliente",
        timestamp: "10:34",
        tipo: "arquivo",
        arquivo: {
          nome: "Relatorio_Mensal_Agosto_2025.xlsx",
          tamanho: "1.2 MB",
          tipo: "xlsx",
        }
      },
      {
        id: "27-3",
        texto: "Documento enviado com sucesso",
        remetente: "cliente",
        timestamp: "10:35",
      },
      {
        id: "27-4",
        texto: "Recebi o documento. Está tudo correto!",
        remetente: "atendente",
        timestamp: "10:36",
        status: "lido",
      },
    ],
  },

  // Camila Torres (ID: 198234)
  {
    usuarioId: "198234",
    mensagens: [
      {
        id: "28-1",
        texto: "Obrigada por resolver minha questão",
        remetente: "cliente",
        timestamp: "10:32",
      },
      {
        id: "28-2",
        texto: "Muito obrigada pelo atendimento!",
        remetente: "cliente",
        timestamp: "10:34",
      },
      {
        id: "28-3",
        texto:
          "Foi um prazer te atender! Qualquer coisa, estamos aqui.",
        remetente: "atendente",
        timestamp: "10:35",
        status: "lido",
      },
    ],
  },
];

// Dados iniciais de emails
const emailsIniciais: Email[] = [
  {
    id: "1",
    assunto: "Agendamento de Consulta",
    remetente: {
      nome: "Marina Santos",
      email: "marina.santos@example.com",
    },
    destinatarios: [
      {
        nome: "Carlos Silva",
        email: "carlos.silva@example.com",
      },
    ],
    corpo: "<p>Olá Carlos,</p><p>Estou aguardando a confirmação do meu agendamento para a consulta de amanhã às 11h.</p><p>Atenciosamente,</p><p>Marina Santos</p>",
    preview: "Olá Carlos, estou aguardando a confirmação do meu agendamento para a consulta de amanhã às 11h.",
    data: "13/11/2025",
    timestamp: new Date("2025-11-13T10:45:00"),
    lido: false,
    importante: true,
    anexos: [
      {
        id: "1-1",
        nome: "Agendamento_Marina_Santos.pdf",
        tamanho: "500 KB",
        tipo: "pdf",
        url: "https://example.com/anexos/Agendamento_Marina_Santos.pdf",
      },
    ],
    tags: ["agendamento", "consulta"],
  },
  {
    id: "2",
    assunto: "Relatório Mensal de Agosto 2025",
    remetente: {
      nome: "Rafael Souza",
      email: "rafael.souza@example.com",
    },
    destinatarios: [
      {
        nome: "Pedro Oliveira",
        email: "pedro.oliveira@example.com",
      },
    ],
    corpo: "<p>Olá Pedro,</p><p>Anexado está o relatório mensal de agosto 2025.</p><p>Atenciosamente,</p><p>Rafael Souza</p>",
    preview: "Olá Pedro, anexado está o relatório mensal de agosto 2025.",
    data: "13/11/2025",
    timestamp: new Date("2025-11-13T10:35:00"),
    lido: true,
    importante: false,
    anexos: [
      {
        id: "2-1",
        nome: "Relatorio_Mensal_Agosto_2025.xlsx",
        tamanho: "1.2 MB",
        tipo: "xlsx",
        url: "https://example.com/anexos/Relatorio_Mensal_Agosto_2025.xlsx",
      },
    ],
    tags: ["relatório", "agosto"],
  },
  {
    id: "3",
    assunto: "Protocolo de Atendimento",
    remetente: {
      nome: "Letícia Araújo",
      email: "leticia.araujo@example.com",
    },
    destinatarios: [
      {
        nome: "Julia Santos",
        email: "julia.santos@example.com",
      },
    ],
    corpo: "<p>Olá Julia,</p><p>Anexado está o protocolo de atendimento para a resolução urgente.</p><p>Atenciosamente,</p><p>Letícia Araújo</p>",
    preview: "Olá Julia, anexado está o protocolo de atendimento para a resolução urgente.",
    data: "13/11/2025",
    timestamp: new Date("2025-11-13T10:41:00"),
    lido: false,
    importante: true,
    anexos: [
      {
        id: "3-1",
        nome: "Protocolo_Atendimento_45891.pdf",
        tamanho: "856 KB",
        tipo: "pdf",
        url: "https://example.com/anexos/Protocolo_Atendimento_45891.pdf",
      },
    ],
    tags: ["protocolo", "atendimento"],
  },
  {
    id: "4",
    assunto: "Proposta de Projeto - Implementação de Sistema de CRM Completo",
    remetente: {
      nome: "Roberto Lima",
      email: "roberto.lima@example.com",
    },
    destinatarios: [
      {
        nome: "Ana Takahashi",
        email: "ana.takahashi@example.com",
      },
    ],
    cc: [
      {
        nome: "Carlos Silva",
        email: "carlos.silva@example.com",
      },
      {
        nome: "Marina Santos",
        email: "marina.santos@example.com",
      },
    ],
    corpo: `
      <h2>Proposta de Implementação de Sistema de CRM</h2>
      <p>Prezada Ana,</p>
      <p>Venho por meio deste e-mail apresentar nossa proposta detalhada para a implementação de um Sistema de CRM (Customer Relationship Management) completo para sua empresa.</p>

      <h3>1. Escopo do Projeto</h3>
      <p>O projeto contempla as seguintes funcionalidades principais:</p>
      <ul>
        <li><strong>Gestão de Contatos:</strong> Cadastro completo de clientes, fornecedores e prospects com histórico detalhado de interações</li>
        <li><strong>Pipeline de Vendas:</strong> Gestão visual do funil de vendas com etapas customizáveis e automação de tarefas</li>
        <li><strong>Atendimento Multicanal:</strong> Integração com WhatsApp, E-mail, Telefone, Chat e Redes Sociais</li>
        <li><strong>Relatórios e Dashboards:</strong> Analytics avançado com métricas de desempenho e KPIs personalizados</li>
        <li><strong>Automação de Marketing:</strong> Campanhas automatizadas, segmentação de público e nurturing</li>
      </ul>

      <h3>2. Cronograma de Implementação</h3>
      <p>A implementação está prevista para ocorrer em 4 fases distintas ao longo de 6 meses:</p>
      <ul>
        <li><strong>Fase 1 (Mês 1-2):</strong> Levantamento de requisitos, análise de processos e configuração inicial do ambiente</li>
        <li><strong>Fase 2 (Mês 2-3):</strong> Desenvolvimento e configuração dos módulos principais (Gestão de Contatos e Pipeline)</li>
        <li><strong>Fase 3 (Mês 3-4):</strong> Integrações com canais de comunicação e sistemas legados</li>
        <li><strong>Fase 4 (Mês 5-6):</strong> Implantação dos módulos de Analytics, treinamento da equipe e go-live</li>
      </ul>

      <h3>3. Investimento</h3>
      <p>O investimento total para a implementação completa do sistema é de <strong>R$ 125.000,00</strong>, podendo ser parcelado em até 12 vezes sem juros.</p>
      <p>Este valor inclui:</p>
      <ul>
        <li>Licenças de software por 12 meses</li>
        <li>Customização e parametrização completa</li>
        <li>Migração de dados do sistema atual</li>
        <li>Treinamento para até 50 usuários</li>
        <li>Suporte técnico premium por 12 meses</li>
      </ul>

      <h3>4. Próximos Passos</h3>
      <p>Para darmos continuidade ao projeto, sugerimos agendar uma reunião de alinhamento com os stakeholders principais para validação do escopo e cronograma propostos.</p>
      <p>Estou à disposição para esclarecer quaisquer dúvidas e fornecer informações adicionais.</p>

      <h3>5. Benefícios Esperados</h3>
      <p>Com a implementação deste sistema, esperamos que sua empresa alcance:</p>
      <ul>
        <li>Aumento de 30% na produtividade da equipe de vendas</li>
        <li>Redução de 40% no tempo de resposta ao cliente</li>
        <li>Melhoria de 25% na taxa de conversão do funil de vendas</li>
        <li>Visibilidade completa do histórico de interações com clientes</li>
        <li>Automação de processos repetitivos liberando tempo para atividades estratégicas</li>
      </ul>

      <p>Atenciosamente,</p>
      <p><strong>Roberto Lima</strong><br>
      Gerente de Projetos<br>
      roberto.lima@example.com<br>
      (11) 98765-4321</p>
    `,
    preview: "Venho por meio deste e-mail apresentar nossa proposta detalhada para a implementação de um Sistema de CRM completo...",
    data: "14/11/2025",
    timestamp: new Date("2025-11-14T09:15:00"),
    lido: false,
    importante: true,
    anexos: [
      {
        id: "4-1",
        nome: "Proposta_CRM_Completa.pdf",
        tamanho: "2.4 MB",
        tipo: "pdf",
        url: "https://example.com/anexos/Proposta_CRM_Completa.pdf",
      },
      {
        id: "4-2",
        nome: "Cronograma_Projeto.xlsx",
        tamanho: "856 KB",
        tipo: "xlsx",
        url: "https://example.com/anexos/Cronograma_Projeto.xlsx",
      },
      {
        id: "4-3",
        nome: "Apresentacao_CRM.pptx",
        tamanho: "5.1 MB",
        tipo: "pptx",
        url: "https://example.com/anexos/Apresentacao_CRM.pptx",
      },
    ],
    tags: ["proposta", "crm", "projeto"],
  },
];

// Provider Component
interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [usuarios, setUsuarios] =
    useState<Usuario[]>(usuariosIniciais);
  const [conversas, setConversas] = useState<
    HistoricoConversa[]
  >(conversasIniciais);
  const [emails, setEmails] = useState<Email[]>(emailsIniciais);

  console.log('[DataProvider] Initialized with', usuarios.length, 'users');

  const getUsuarioById = (id: string): Usuario | undefined => {
    return usuarios.find((usuario) => usuario.id === id);
  };

  const getMensagensByUsuarioId = (id: string): Mensagem[] => {
    const conversa = conversas.find((c) => c.usuarioId === id);
    return conversa?.mensagens || [];
  };

  const getUltimaMensagemByUsuarioId = (id: string): string => {
    const mensagens = getMensagensByUsuarioId(id);
    if (mensagens.length === 0) {
      // Fallback para o campo ultimaMensagem do usuário se não houver mensagens
      const usuario = getUsuarioById(id);
      return usuario?.ultimaMensagem || "Sem mensagens";
    }
    // Retorna o texto da última mensagem do array
    return mensagens[mensagens.length - 1].texto;
  };

  const addMensagem = (
    usuarioId: string,
    novaMensagem: Omit<Mensagem, "id">,
  ) => {
    const mensagemComId: Mensagem = {
      ...novaMensagem,
      id: `${usuarioId}-${Date.now()}`,
    };

    setConversas((prev) => {
      const conversaExistente = prev.find(
        (c) => c.usuarioId === usuarioId,
      );

      if (conversaExistente) {
        return prev.map((c) =>
          c.usuarioId === usuarioId
            ? {
                ...c,
                mensagens: [...c.mensagens, mensagemComId],
              }
            : c,
        );
      } else {
        return [
          ...prev,
          { usuarioId, mensagens: [mensagemComId] },
        ];
      }
    });

    // Atualizar última mensagem do usuário
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === usuarioId
          ? { ...u, ultimaMensagem: novaMensagem.texto }
          : u,
      ),
    );
  };

  const updateUsuarioStatus = (
    usuarioId: string,
    status: Usuario["status"],
  ) => {
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === usuarioId ? { ...u, status } : u,
      ),
    );
  };

  const removeUsuario = (usuarioId: string) => {
    setUsuarios((prev) =>
      prev.filter((u) => u.id !== usuarioId),
    );
  };

  const getEmailById = (id: string): Email | undefined => {
    return emails.find((email) => email.id === id);
  };

  const markEmailAsRead = (id: string) => {
    setEmails((prev) =>
      prev.map((email) =>
        email.id === id ? { ...email, lido: true } : email,
      ),
    );
  };

  const assumirAtendimento = (usuarioId: string) => {
    // Assume um atendimento que está aguardando, movendo-o para "Em Atendimento"
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === usuarioId ? { ...u, isEmCurso: true } : u,
      ),
    );
  };

  const marcarComoLido = (usuarioId: string) => {
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === usuarioId ? { ...u, notificacoes: 0, status: "lida" } : u,
      ),
    );
  };

  const value: DataContextType = {
    usuarios,
    conversas,
    emails,
    getUsuarioById,
    getMensagensByUsuarioId,
    getUltimaMensagemByUsuarioId,
    addMensagem,
    updateUsuarioStatus,
    setUsuarios,
    removeUsuario,
    getEmailById,
    markEmailAsRead,
    assumirAtendimento,
    marcarComoLido,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

// Hook personalizado
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error(
      "useData must be used within a DataProvider",
    );
  }
  return context;
}