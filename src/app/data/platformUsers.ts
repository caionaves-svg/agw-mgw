// Usuários da plataforma (atendentes/gestores) que podem ser mencionados
// em comentários internos. Mock — substituir pela API de usuários.

export type PlatformUserStatus = "online" | "ausente" | "ocupado" | "offline";

export interface PlatformUser {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  equipe: string;
  cor: string;
  status: PlatformUserStatus;
}

export const PLATFORM_USERS: PlatformUser[] = [
  { id: "u-maria", nome: "Maria Silva", email: "maria.silva@empresa.com", cargo: "Atendente Sênior", equipe: "Suporte Técnico", cor: "#00bcf2", status: "online" },
  { id: "u-joao", nome: "João Santos", email: "joao.santos@empresa.com", cargo: "Atendente Pleno", equipe: "Financeiro", cor: "#7850cb", status: "online" },
  { id: "u-ana", nome: "Ana Costa", email: "ana.costa@empresa.com", cargo: "Atendente Pleno", equipe: "Financeiro", cor: "#ec4899", status: "ocupado" },
  { id: "u-carlos", nome: "Carlos Oliveira", email: "carlos.oliveira@empresa.com", cargo: "Supervisor", equipe: "Comercial", cor: "#f97316", status: "ausente" },
  { id: "u-fernanda", nome: "Fernanda Lima", email: "fernanda.lima@empresa.com", cargo: "Atendente Júnior", equipe: "Suporte Técnico", cor: "#16a34a", status: "online" },
  { id: "u-pedro", nome: "Pedro Alves", email: "pedro.alves@empresa.com", cargo: "Atendente Pleno", equipe: "Retenção", cor: "#3b82f6", status: "offline" },
  { id: "u-juliana", nome: "Juliana Mendes", email: "juliana.mendes@empresa.com", cargo: "Coordenadora", equipe: "Retenção", cor: "#d4183d", status: "online" },
  { id: "u-marina", nome: "Marina Costa", email: "marina.costa@empresa.com", cargo: "Supervisora", equipe: "Fila Cadastro", cor: "#0ea5e9", status: "online" },
  { id: "u-felipe", nome: "Felipe Nunes", email: "felipe.nunes@empresa.com", cargo: "Atendente Pleno", equipe: "Fila Cadastro", cor: "#a855f7", status: "ocupado" },
  { id: "u-roberto", nome: "Roberto Costa", email: "roberto.costa@empresa.com", cargo: "Atendente Júnior", equipe: "Comercial", cor: "#f59e0b", status: "offline" },
];

export const STATUS_COLORS: Record<PlatformUserStatus, string> = {
  online: "#22C55E",
  ausente: "#F59E0B",
  ocupado: "#EF4444",
  offline: "#9CA3AF",
};

export const STATUS_LABELS: Record<PlatformUserStatus, string> = {
  online: "Online",
  ausente: "Ausente",
  ocupado: "Ocupado",
  offline: "Offline",
};

export const isOffline = (u: PlatformUser) => u.status === "offline";

export function getInitials(nome: string) {
  const parts = nome.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Disponíveis primeiro, offline no fim; dentro de cada grupo, por relevância
export function searchPlatformUsers(query: string, limit = 20) {
  const q = normalize(query.trim());

  // Prioridade: nome começa com o termo > alguma palavra do nome começa
  // com o termo > nome/e-mail/equipe contém o termo
  const score = (u: PlatformUser) => {
    const nome = normalize(u.nome);
    if (!q) return 0;
    if (nome.startsWith(q)) return 0;
    if (nome.split(/\s+/).some((w) => w.startsWith(q))) return 1;
    if (nome.includes(q) || normalize(u.email.split("@")[0]).includes(q) || normalize(u.equipe).includes(q)) return 2;
    return -1;
  };

  return PLATFORM_USERS.map((u) => ({ u, s: score(u) }))
    .filter(({ s }) => s >= 0)
    .sort(
      (a, b) =>
        Number(isOffline(a.u)) - Number(isOffline(b.u)) ||
        a.s - b.s ||
        a.u.nome.localeCompare(b.u.nome, "pt-BR"),
    )
    .slice(0, limit)
    .map(({ u }) => u);
}

export function findPlatformUser(id: string) {
  return PLATFORM_USERS.find((u) => u.id === id);
}

export function findPlatformUserByName(nome: string) {
  return PLATFORM_USERS.find((u) => u.nome === nome);
}
