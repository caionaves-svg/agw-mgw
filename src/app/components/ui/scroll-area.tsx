import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "./utils";

/**
 * Área de rolagem com barra flutuante: não ocupa espaço no layout (o
 * conteúdo não é empurrado) e só aparece com o mouse sobre a área.
 */
function ScrollArea({
  className,
  children,
  type = "hover",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      type={type}
      scrollHideDelay={400}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      {/* O Radix envolve o conteúdo em display:table; "block" mantém o truncate funcionando */}
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] [&>div]:!block"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      forceMount
      className={cn(
        "z-10 flex touch-none select-none p-px transition-opacity duration-200 data-[state=hidden]:opacity-0 data-[state=visible]:opacity-100",
        orientation === "vertical" && "h-full w-1.5 hover:w-2 transition-[width,opacity]",
        orientation === "horizontal" && "h-1.5 flex-col hover:h-2",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-muted-foreground/40 hover:bg-muted-foreground/70 transition-colors"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
