import { Calendar } from "lucide-react";

export function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center my-3 relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative bg-background px-3 py-0.5 rounded-full border border-border flex items-center gap-1.5">
        <Calendar className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}