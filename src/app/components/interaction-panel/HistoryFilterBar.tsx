import { Check, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export interface FilterFieldConfig {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  /** "multi" (padrão) permite marcar vários valores; "single" funciona como Sim/Não. */
  mode?: "multi" | "single";
}

interface HistoryFilterBarProps {
  fields: FilterFieldConfig[];
  values: Record<string, string[]>;
  onChange: (fieldId: string, values: string[]) => void;
}

export function HistoryFilterBar({
  fields,
  values,
  onChange,
}: HistoryFilterBarProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {fields.map((field) => {
        const selected = values[field.id] ?? [];
        const isActive = selected.length > 0;
        const single = field.mode === "single";

        const toggle = (optionValue: string) => {
          if (single) {
            onChange(
              field.id,
              selected[0] === optionValue ? [] : [optionValue],
            );
            return;
          }
          onChange(
            field.id,
            selected.includes(optionValue)
              ? selected.filter((v) => v !== optionValue)
              : [...selected, optionValue],
          );
        };

        return (
          <DropdownMenu key={field.id}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="xs"
                active={isActive}
                className="gap-1"
              >
                {field.label}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[190px]">
              <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {field.label}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {field.options.map((opt) => {
                const checked = selected.includes(opt.value);
                return (
                  <DropdownMenuItem
                    key={opt.value}
                    onSelect={(e) => {
                      e.preventDefault();
                      toggle(opt.value);
                    }}
                    className="flex items-center justify-between gap-2"
                  >
                    <span
                      className={
                        checked
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {opt.label}
                    </span>
                    {checked && (
                      <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    )}
                  </DropdownMenuItem>
                );
              })}
              {isActive && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      onChange(field.id, []);
                    }}
                    className="text-muted-foreground text-xs justify-center"
                  >
                    Limpar filtro
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </div>
  );
}
