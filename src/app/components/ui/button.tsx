import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import {
  cva,
  type VariantProps,
} from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive disabled:[&_svg]:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary-600 text-primary-foreground hover:bg-primary/90",
        brand:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        success: "bg-success text-white hover:bg-success/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90",
        danger:
          "bg-destructive text-white hover:bg-destructive/90",
        outline:
          "border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-primary/10 data-[active=true]:border-primary data-[active=true]:text-primary data-[active=true]:[&_svg]:text-primary data-[active=true]:hover:bg-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        ghost:
          "text-muted-foreground hover:bg-primary/20 hover:text-primary [&_svg]:text-muted-foreground/70 hover:[&_svg]:text-primary data-[active=true]:bg-primary/10 data-[active=true]:border data-[active=true]:border-primary data-[active=true]:text-primary data-[active=true]:[&_svg]:text-primary data-[active=true]:hover:bg-primary/20",
        "ghost-secondary":
          "text-muted-foreground hover:bg-secondary/20 hover:text-secondary [&_svg]:text-muted-foreground hover:[&_svg]:text-secondary",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 rounded-full px-4 py-2 has-[>svg]:px-3",
        xs: "h-7 rounded-full gap-0.5 px-2.5 text-xs has-[>svg]:px-2",
        sm: "h-8 rounded-full gap-0.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-full gap-1.5 px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
      active?: boolean;
    }
>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      active,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        data-slot="button"
        data-active={active}
        className={cn(
          buttonVariants({ variant, size, className }),
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };