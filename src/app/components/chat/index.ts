/**
 * BARREL EXPORT - Chat Components
 * 
 * Exporta todos os componentes de mensagem de forma centralizada.
 * Uso: import { BalloonMessage, ImageMessage } from '@/components/chat';
 */

export { Balloon, getBorderClasses } from "./Balloon";
export type { BalloonProps, MessagePosition, Remetente } from "./Balloon";

export { BalloonMessage } from "./BalloonMessage";
export type { BalloonMessageProps } from "./BalloonMessage";

export { ImageMessage } from "./ImageMessage";
export type { ImageMessageProps } from "./ImageMessage";

export { AudioMessage } from "./AudioMessage";
export type { AudioMessageProps } from "./AudioMessage";

export { FileMessage } from "./FileMessage";
export type { FileMessageProps } from "./FileMessage";

export { LocationMessage } from "./LocationMessage";
export type { LocationMessageProps } from "./LocationMessage";