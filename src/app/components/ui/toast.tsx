import { toast } from "sonner";
import { Info, CircleCheck, CircleAlert, X, type LucideIcon } from "lucide-react";
import { cn } from "./utils";

// Snackbar no padrão AGW v3 (Figma › Toast): ícone de status, título,
// descrição, ação opcional e botão de fechar.
export type ToastVariant = "default" | "info" | "success" | "warning" | "error";

const VARIANT_ICON: Record<ToastVariant, { icon: LucideIcon; className: string }> = {
  default: { icon: Info, className: "text-muted-foreground" },
  info: { icon: Info, className: "text-primary" },
  success: { icon: CircleCheck, className: "text-success" },
  warning: { icon: CircleAlert, className: "text-warning" },
  error: { icon: CircleAlert, className: "text-destructive" },
};

export interface NotifyOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface ToastCardProps extends NotifyOptions {
  onDismiss: () => void;
}

export function ToastCard({
  title,
  description,
  variant = "default",
  action,
  onDismiss,
}: ToastCardProps) {
  const { icon: Icon, className } = VARIANT_ICON[variant];
  return (
    <div
      role="status"
      className="flex w-full items-center gap-2 overflow-hidden rounded-md bg-card px-3 py-2 text-card-foreground shadow-[0px_10px_41px_0px_rgba(62,72,76,0.15)] dark:border dark:border-border"
    >
      <Icon className={cn("size-5 shrink-0", className)} />
      <div className="flex min-w-0 flex-1 flex-col break-words">
        <p className="text-sm font-semibold leading-5 text-foreground">{title}</p>
        {description && (
          <p className="text-xs leading-4 text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
      </div>
      {action && (
        <button
          type="button"
          onClick={() => {
            action.onClick();
            onDismiss();
          }}
          className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium leading-[14px] text-foreground transition-colors hover:bg-accent"
        >
          {action.label}
        </button>
      )}
      <button
        type="button"
        aria-label="Fechar"
        onClick={onDismiss}
        className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

export function notify({ duration, ...options }: NotifyOptions) {
  return toast.custom(
    (id) => <ToastCard {...options} onDismiss={() => toast.dismiss(id)} />,
    { duration },
  );
}
