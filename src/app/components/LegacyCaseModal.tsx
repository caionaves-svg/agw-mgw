import { useEffect, useState, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Upload, X, Paperclip, Star, HelpCircle } from "lucide-react";
import { InternalCommentsSection } from "./interaction-panel/InternalCommentsSection";

/**
 * Modal "Dados do Caso" da plataforma atual (legado). Uso temporário: é o que
 * abre ao clicar no ID de um caso fora da página de gerenciamento. A nova
 * experiência (CasePreviewModal) fica restrita a /management/cases.
 */

const TABS = [
  "Dados Do Caso",
  "Histórico Do Caso",
  "Histórico Do Cliente",
  "Histórico De Ligações",
  "Interações",
  "SLA",
  "Anexo",
  "Avaliação",
  "Comentários",
] as const;
type Tab = (typeof TABS)[number];

interface LegacyCaseModalProps {
  casoId: string | null;
  clienteNome?: string;
  onClose: () => void;
}

// ── Dados simulados (determinísticos a partir do ID) ─────────────────────
function mockCaso(casoId: string, clienteNome?: string) {
  const seed = [...casoId].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const nome = clienteNome ?? "Lucas Cordeiro";
  const slug = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(" ")
    .join(".");
  return {
    nome,
    documento: String(516042030477 + seed),
    emails: [`${slug}@cvortex.io`, `${slug}2@cvortex.io`],
    telefone: `BR.55119${String(80000000 + seed * 137).slice(0, 8)}`,
    assunto: ["webchat cvortex", "segunda via de fatura", "contestação de cobrança"][seed % 3],
    status: ["Aguardando Atendimento - Space", "Em Atendimento", "Pendente Cliente"][seed % 3],
    score: seed % 10,
    prioridade: ["LOW", "MEDIUM", "HIGH"][seed % 3],
    tipo: ["Webchat Internet Banking", "SAC Voz", "SAC WhatsApp"][seed % 3],
    abertura: "14/10/2026 09:42",
  };
}

const HISTORICO_CASO = [
  { data: "14/10/2026 09:42", usuario: "Sistema", acao: "Caso aberto", status: "Novo" },
  { data: "14/10/2026 09:43", usuario: "Sistema", acao: "Distribuído para a fila Space", status: "Aguardando Atendimento - Space" },
  { data: "14/10/2026 10:05", usuario: "Maria Silva", acao: "Comentário interno adicionado", status: "Aguardando Atendimento - Space" },
];

const HISTORICO_CLIENTE = [
  { id: "812233", abertura: "02/10/2026 15:10", tipo: "SAC Voz", assunto: "segunda via de fatura", status: "Finalizado" },
  { id: "798120", abertura: "18/09/2026 11:22", tipo: "SAC WhatsApp", assunto: "alteração cadastral", status: "Finalizado" },
  { id: "771045", abertura: "29/08/2026 08:57", tipo: "Webchat Internet Banking", assunto: "acesso bloqueado", status: "Cancelado" },
];

const LIGACOES = [
  { data: "13/10/2026 16:20", origem: "11998765432", destino: "08007771234", duracao: "00:04:12", resultado: "Atendida" },
  { data: "10/10/2026 09:05", origem: "11998765432", destino: "08007771234", duracao: "00:00:38", resultado: "Abandonada" },
];

const INTERACOES = [
  { data: "14/10/2026 09:42", autor: "Cliente", texto: "Olá, não consigo acessar o internet banking." },
  { data: "14/10/2026 09:43", autor: "Bot", texto: "Olá! Vou te encaminhar para um especialista." },
  { data: "14/10/2026 09:50", autor: "Cliente", texto: "Ok, fico no aguardo." },
];

const SLA_ROWS = [
  { tipo: "Primeira resposta", meta: "00:15:00", decorrido: "00:08:00", status: "Dentro do prazo" },
  { tipo: "Resolução", meta: "24:00:00", decorrido: "00:23:00", status: "Dentro do prazo" },
];

const ANEXOS = [
  { nome: "comprovante_residencia.pdf", tamanho: "312 KB", data: "14/10/2026 09:45" },
  { nome: "print_erro_login.png", tamanho: "1,2 MB", data: "14/10/2026 09:46" },
];

// ── Blocos de layout ──────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{label}:</p>
      <div className="mt-1 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-sm text-muted-foreground">
      {children}
    </span>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="min-w-0">
      <h3 className="bg-muted/60 px-6 py-3 text-sm font-medium text-foreground">{title}</h3>
      <div className="flex flex-col gap-5 px-6 py-5">{children}</div>
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/60 text-left">
            {head.map((h) => (
              <th key={h} className="px-6 py-3 font-medium text-foreground whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {r.map((cell, j) => (
                <td key={j} className="px-6 py-3 text-muted-foreground whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────
export default function LegacyCaseModal({ casoId, clienteNome, onClose }: LegacyCaseModalProps) {
  const [tab, setTab] = useState<Tab>("Dados Do Caso");

  // Sempre reabre na primeira aba
  useEffect(() => {
    if (casoId) setTab("Dados Do Caso");
  }, [casoId]);

  if (!casoId) return null;
  const caso = mockCaso(casoId, clienteNome);

  const content: Record<Tab, ReactNode> = {
    "Dados Do Caso": (
      <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-border">
        <Panel title="Dados do Caso">
          <Field label="Nome Completo">{caso.nome}</Field>
          <Field label="Documento">{caso.documento}</Field>
          {caso.emails.map((e) => (
            <Field key={e} label="E-mail">{e}</Field>
          ))}
          <Field label="Telefone">{caso.telefone}</Field>
        </Panel>
        <Panel title="Dados do Atendimento">
          <Field label="Atendimento"><Chip>{casoId}</Chip></Field>
          <Field label="Assunto"><Chip>{caso.assunto}</Chip></Field>
          <Field label="Status do Caso">{caso.status}</Field>
          <Field label="Score do Caso">{caso.score}</Field>
          <Field label="Prioridade"><Chip>{caso.prioridade}</Chip></Field>
          <Field label="Tipo do Caso"><Chip>{caso.tipo}</Chip></Field>
          <Field label="Abertura"><Chip>{caso.abertura}</Chip></Field>
          <Field label="E-mail">-</Field>
          <Field label="Celular">-</Field>
        </Panel>
      </div>
    ),
    "Histórico Do Caso": (
      <Table
        head={["Data", "Usuário", "Ação", "Status"]}
        rows={HISTORICO_CASO.map((h) => [h.data, h.usuario, h.acao, h.status])}
      />
    ),
    "Histórico Do Cliente": (
      <Table
        head={["Caso", "Abertura", "Tipo do Caso", "Assunto", "Status"]}
        rows={HISTORICO_CLIENTE.map((h) => [<Chip>{h.id}</Chip>, h.abertura, h.tipo, h.assunto, h.status])}
      />
    ),
    "Histórico De Ligações": (
      <Table
        head={["Data", "Número de Origem", "Número de Destino", "Duração", "Resultado"]}
        rows={LIGACOES.map((l) => [l.data, l.origem, l.destino, l.duracao, l.resultado])}
      />
    ),
    Interações: (
      <div className="flex flex-col gap-4 px-6 py-5">
        {INTERACOES.map((m, i) => (
          <div key={i}>
            <p className="text-sm font-medium text-foreground">
              {m.autor} <span className="font-normal text-muted-foreground">· {m.data}</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{m.texto}</p>
          </div>
        ))}
      </div>
    ),
    SLA: (
      <Table
        head={["Tipo", "Meta", "Tempo Decorrido", "Status"]}
        rows={SLA_ROWS.map((s) => [s.tipo, s.meta, s.decorrido, s.status])}
      />
    ),
    Anexo: (
      <Table
        head={["Arquivo", "Tamanho", "Data"]}
        rows={ANEXOS.map((a) => [
          <span className="inline-flex items-center gap-2 text-foreground">
            <Paperclip className="size-4 text-muted-foreground" />
            {a.nome}
          </span>,
          a.tamanho,
          a.data,
        ])}
      />
    ),
    Avaliação: (
      <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-border">
        <Panel title="Pesquisa de Satisfação">
          <Field label="Nota">
            <span className="inline-flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`size-4 ${n <= 4 ? "fill-warning text-warning" : "text-muted-foreground"}`}
                />
              ))}
            </span>
          </Field>
          <Field label="Comentário do Cliente">Atendimento rápido, resolveu meu problema.</Field>
        </Panel>
        <Panel title="Dados da Pesquisa">
          <Field label="Respondida em">14/10/2026 11:02</Field>
          <Field label="Canal">{caso.tipo}</Field>
        </Panel>
      </div>
    ),
    Comentários: (
      <div className="h-full min-h-[420px]">
        <InternalCommentsSection atendimento={{ id: casoId, cliente: { nome: caso.nome } }} />
      </div>
    ),
  };

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-50 flex h-[92vh] w-[calc(100vw-2rem)] max-w-[1540px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-md bg-background shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-6 pt-5">
            <div className="flex items-start gap-3">
              <DialogPrimitive.Title className="pt-5 text-xl text-foreground">
                Dados do Caso - {casoId}
              </DialogPrimitive.Title>
              <HelpCircle className="size-5 shrink-0 text-primary" />
            </div>
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded border border-foreground/70 px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-accent"
              >
                <Upload className="size-4" />
                Exportar
              </button>
              <DialogPrimitive.Close
                aria-label="Fechar"
                className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-5" />
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Abas */}
          <div className="mx-6 mt-4 flex overflow-x-auto border-b border-border">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`relative whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
                  tab === t
                    ? "text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary"
                    : "text-foreground/80 hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Conteúdo */}
          <div className="mx-6 mb-6 flex-1 overflow-y-auto custom-scrollbar">{content[tab]}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
