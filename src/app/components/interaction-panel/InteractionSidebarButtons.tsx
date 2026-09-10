import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import { Zap, LucideIcon } from "lucide-react";

interface Section {
  id: string;
  icon: LucideIcon;
  title: string;
}

interface InteractionSidebarButtonsProps {
  sections: Section[];
  activeSection: string | null;
  actionSection?: string | null;
  onToggleSection: (sectionId: string) => void;
  hideActions?: boolean;
}

export function InteractionSidebarButtons({
  sections,
  activeSection,
  actionSection,
  onToggleSection,
  hideActions = false,
}: InteractionSidebarButtonsProps) {
  return (
    <TooltipProvider>
      <div className="flex flex-col items-center h-full justify-between py-2 overflow-hidden">
        {/* Botões de seção no topo */}
        <div className="flex flex-col items-center gap-1 overflow-y-auto overflow-x-hidden w-full py-1" style={{ scrollbarWidth: "none" }}>
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <Tooltip key={section.id}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => onToggleSection(section.id)}
                    variant="ghost"
                    size="icon"
                    className="size-10"
                    data-active={isActive}
                  >
                    <Icon className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{section.title}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Botão de ações na parte inferior */}
        {!hideActions && (
          <div className="flex flex-col items-center pb-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onToggleSection("acoes")}
                  variant="ghost"
                  size="icon"
                  className="size-10"
                  data-active={actionSection === "acoes"}
                >
                  <Zap className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Ações</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}