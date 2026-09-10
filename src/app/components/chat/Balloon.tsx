import React, { useState } from "react";
import { Check, CheckCheck, MoreVertical, Reply, Forward, Copy, Trash2, Star, Smile } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

/**
 * TIPOS
 */
export type MessagePosition =
  | "single"
  | "first"
  | "middle"
  | "last";
export type Remetente = "atendente" | "cliente";

/**
 * COMPONENTE INTERNO: StatusIcon
 * Ícone de status de leitura (✓ ou ✓✓)
 * Apenas visível para mensagens do atendente
 */
function StatusIcon({ status }: { status?: string }) {
  if (status === "lido") {
    return <CheckCheck className="w-4 h-4 text-primary" />;
  }

  if (status === "enviado") {
    return <Check className="w-4 h-4 text-gray-400" />;
  }

  return null;
}

/**
 * COMPONENTE INTERNO: MessageActions
 * Botão de opções (3 pontos) que aparece no hover
 */
interface MessageActionsProps {
  onReply?: () => void;
  onForward?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onFavorite?: () => void;
  onReaction?: () => void;
  isAtendente: boolean;
}

function MessageActions({
  onReply,
  onForward,
  onCopy,
  onDelete,
  onFavorite,
  onReaction,
  isAtendente,
}: MessageActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isAtendente ? "end" : "start"} className="w-48">
        <DropdownMenuItem onClick={onReaction}>
          <Smile className="w-4 h-4" />
          Reações
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onReply}>
          <Reply className="w-4 h-4" />
          Responder
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onForward}>
          <Forward className="w-4 h-4" />
          Encaminhar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCopy}>
          <Copy className="w-4 h-4" />
          Copiar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onFavorite}>
          <Star className="w-4 h-4" />
          Favoritar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-destructive">
          <Trash2 className="w-4 h-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * COMPONENTE INTERNO: ReactionPicker
 * Barra de reactions que aparece no hover
 */
const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "😊"];

interface ReactionPickerProps {
  onReaction: (emoji: string) => void;
  isAtendente: boolean;
}

function ReactionPicker({ onReaction, isAtendente }: ReactionPickerProps) {
  return (
    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border rounded-full shadow-lg px-2 py-1 flex items-center gap-1 z-10">
      {REACTIONS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onReaction(emoji)}
          className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-full transition-colors text-lg"
          title={`Reagir com ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

/**
 * COMPONENTE INTERNO: ReactionDisplay
 * Exibe reactions abaixo da mensagem
 */
interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface ReactionDisplayProps {
  reactions: Reaction[];
  onReactionClick?: (emoji: string) => void;
}

function ReactionDisplay({ reactions, onReactionClick }: ReactionDisplayProps) {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="flex items-center gap-1 mt-1 flex-wrap">
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => onReactionClick?.(reaction.emoji)}
          className="inline-flex items-center gap-1 bg-muted hover:bg-muted/80 rounded-full px-2 py-0.5 text-xs transition-colors"
          title={reaction.users.join(", ")}
        >
          <span>{reaction.emoji}</span>
          <span className="text-muted-foreground">{reaction.count}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * COMPONENTE BASE: Balloon
 *
 * Container reutilizável para todos os tipos de mensagens.
 * Centraliza toda a lógica de:
 * - Bordas arredondadas adaptativas (baseadas na posição no grupo)
 * - Cores de fundo (atendente vs cliente)
 * - Alinhamento (direita vs esquerda)
 * - Largura máxima e margens
 * - Footer com timestamp e status (comum a TODOS os tipos)
 * - Hover com botão de opções e reactions
 * - Exibição de reactions
 *
 * @param remetente - "atendente" ou "cliente"
 * @param position - Posição no grupo: 'single' | 'first' | 'middle' | 'last'
 * @param children - Conteúdo interno do balão (texto, imagem, etc.)
 * @param timestamp - Horário da mensagem (ex: "12:30")
 * @param status - Status da mensagem: "lido" | "enviado" (apenas para atendente)
 * @param className - Classes adicionais (opcional)
 * @param innerClassName - Classes para o container interno (opcional)
 * @param showFooter - Se deve mostrar footer com timestamp/status (padrão: true)
 * @param footerClassName - Classes customizadas para o footer (padrão: "px-2 pb-2")
 * @param reactions - Array de reactions na mensagem
 * @param onReaction - Callback ao adicionar reaction
 * @param onReply - Callback ao clicar em "Responder"
 * @param onForward - Callback ao clicar em "Encaminhar"
 * @param onCopy - Callback ao clicar em "Copiar"
 * @param onDelete - Callback ao clicar em "Excluir"
 * @param onFavorite - Callback ao clicar em "Favoritar"
 */
export interface BalloonProps {
  remetente: Remetente;
  position: MessagePosition;
  children: React.ReactNode;
  timestamp: string;
  status?: string;
  className?: string;
  innerClassName?: string;
  showFooter?: boolean;
  footerClassName?: string;
  reactions?: Reaction[];
  onReaction?: (emoji: string) => void;
  onReply?: () => void;
  onForward?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onFavorite?: () => void;
}

/**
 * FUNÇÃO: getBorderClasses
 *
 * Determina as classes de borda (border-radius) baseadas em:
 * 1. Posição da mensagem no grupo (first, middle, last, single)
 * 2. Remetente (atendente ou cliente)
 *
 * LÓGICA DE BORDAS AGRUPADAS:
 * - "single": Mensagem isolada → todas bordas arredondadas (rounded-md)
 * - "first": Primeira do grupo → borda superior arredondada
 * - "middle": No meio do grupo → bordas laterais diferentes
 * - "last": Última do grupo → borda inferior arredondada
 *
 * DIFERENÇA ATENDENTE vs CLIENTE:
 * - Atendente (direita): Bordas esquerdas mais arredondadas
 * - Cliente (esquerda): Bordas direitas mais arredondadas
 */
export function getBorderClasses(
  position: MessagePosition,
  isAtendente: boolean,
): string {
  const baseRounded = "rounded-md"; // Padrão para mensagem única

  // Mensagem isolada = todas bordas arredondadas
  if (position === "single") return baseRounded;

  // ESTILO PARA ATENDENTE (alinhado à direita)
  if (isAtendente) {
    switch (position) {
      case "first":
        // Primeira mensagem: topo completo + inferior esquerda arredondados
        return "rounded-tl-md rounded-tr-md rounded-bl-md rounded-br-sm";
      case "middle":
        // Meio: esquerda arredondada, direita menos
        return "rounded-tl-md rounded-tr-sm rounded-bl-md rounded-br-sm";
      case "last":
        // Última: base completa + superior esquerda arredondados
        return "rounded-tl-md rounded-tr-sm rounded-bl-md rounded-br-md";
      default:
        return baseRounded;
    }
  }
  // ESTILO PARA CLIENTE (alinhado à esquerda)
  else {
    switch (position) {
      case "first":
        // Primeira mensagem: topo completo + inferior direita arredondados
        return "rounded-tl-md rounded-tr-md rounded-bl-sm rounded-br-md";
      case "middle":
        // Meio: direita arredondada, esquerda menos
        return "rounded-tl-sm rounded-tr-md rounded-bl-sm rounded-br-md";
      case "last":
        // Última: base completa + superior direita arredondados
        return "rounded-tl-sm rounded-tr-md rounded-bl-md rounded-br-md";
      default:
        return baseRounded;
    }
  }
}

/**
 * COMPONENTE: Balloon
 */
export function Balloon({
  remetente,
  position,
  children,
  timestamp,
  status,
  className = "",
  innerClassName = "",
  showFooter = true,
  footerClassName = "px-2 pb-2",
  reactions = [],
  onReaction,
  onReply,
  onForward,
  onCopy,
  onDelete,
  onFavorite,
}: BalloonProps) {
  const isAtendente = remetente === "atendente";

  return (
    // ========== CONTAINER PRINCIPAL DO BALÃO ==========
    // Alinhamento: justify-end (direita) para atendente, justify-start (esquerda) para cliente
    <div
      className={`flex ${isAtendente ? "justify-end" : "justify-start"} ${className}`}
    >
      {/* ========== WRAPPER COM LARGURA MÁXIMA ========== */}
      {/* 
        max-w-[70%]: Limita largura do balão a 70% da tela
        ml-16/mr-16: Margem lateral para evitar balões muito largos
      */}
      <div
        className={`max-w-[70%] ${isAtendente ? "ml-16" : "mr-16"}`}
      >
        {/* ========== GRUPO HOVER (Balão + Botões) ========== */}
        <div className="group relative flex items-start gap-2">
          {/* Botão de Opções (à esquerda para atendente, à direita para cliente) */}
          {isAtendente && (
            <MessageActions
              onReply={onReply}
              onForward={onForward}
              onCopy={onCopy}
              onDelete={onDelete}
              onFavorite={onFavorite}
              onReaction={onReaction}
              isAtendente={isAtendente}
            />
          )}

          {/* Container do balão com reaction picker */}
          <div className="relative flex-1">
            {/* Reaction Picker (aparece no hover) */}
            {onReaction && (
              <ReactionPicker
                onReaction={onReaction}
                isAtendente={isAtendente}
              />
            )}

            {/* ========== BALÃO DA MENSAGEM ========== */}
            {/*
              CORES E BORDAS:
              - Atendente: bg-message-agent-bg + border-message-agent-border (adapta automaticamente ao tema)
              - Cliente: Fundo branco + texto padrão
              
              CLASSES IMPORTANTES:
              - getBorderClasses(): Aplica bordas adaptativas
              - text-foreground: Cor do texto adaptável ao tema
            */}
            <div
              className={`${getBorderClasses(position, isAtendente)} ${
                isAtendente
                  ? "bg-message-agent-bg border border-message-agent-border text-foreground"
                  : "bg-background border border-border text-foreground"
              } ${innerClassName}`}
            >
              {/* Conteúdo customizado da mensagem */}
              {children}

              {/* ========== FOOTER: TIMESTAMP + STATUS ========== */}
              {/*
                Footer centralizado que aparece em TODOS os tipos de mensagem.
                - Timestamp: Sempre visível
                - Status: Apenas para mensagens do atendente (✓ ou ✓✓)
                - Alinhamento: justify-end (direita)
                - Gap: 4px entre timestamp e ícone
              */}
              {showFooter && (
                <div
                  className={`flex items-center justify-end gap-1 ${footerClassName}`}
                >
                  {/* Timestamp em cinza pequeno */}
                  <span
                    className="text-muted-foreground/70"
                    style={{ fontSize: "var(--text-xs)" }}
                  >
                    {timestamp}
                  </span>

                  {/* Ícone de status (✓ ou ✓✓) - apenas para atendente */}
                  {isAtendente && <StatusIcon status={status} />}
                </div>
              )}
            </div>

            {/* ========== REACTIONS DISPLAY ========== */}
            <ReactionDisplay
              reactions={reactions}
              onReactionClick={onReaction}
            />
          </div>

          {/* Botão de Opções (à direita para cliente) */}
          {!isAtendente && (
            <MessageActions
              onReply={onReply}
              onForward={onForward}
              onCopy={onCopy}
              onDelete={onDelete}
              onFavorite={onFavorite}
              onReaction={onReaction}
              isAtendente={isAtendente}
            />
          )}
        </div>
      </div>
    </div>
  );
}