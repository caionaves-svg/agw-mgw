import * as React from "react";
import {
  cva,
  type VariantProps,
} from "class-variance-authority";
import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary inset-ring inset-ring-primary/20",
        gray: "bg-gray-500/10 text-gray-600 inset-ring inset-ring-gray-700/20",
        red: "bg-red-500/10 text-red-600 inset-ring inset-ring-red-700/20",
        yellow:
          "bg-yellow-500/10 text-yellow-600 inset-ring inset-ring-yellow-700/20",
        green:
          "bg-green-500/10 text-green-600 inset-ring inset-ring-green-700/20",
        blue: "bg-blue-500/10 text-blue-600 inset-ring inset-ring-blue-700/20",
        indigo:
          "bg-indigo-500/10 text-indigo-600 inset-ring inset-ring-indigo-700/20",
        purple:
          "bg-purple-500/10 text-purple-600 inset-ring inset-ring-purple-700/20",
        pink: "bg-pink-500/10 text-pink-600 inset-ring inset-ring-pink-700/20",
        // Variantes semânticas para o design system
        success:
          "bg-success/10 text-success inset-ring inset-ring-success/20",
        warning:
          "bg-warning/10 text-warning inset-ring inset-ring-warning/20",
        destructive:
          "bg-destructive/10 text-destructive inset-ring inset-ring-destructive/20",
        info: "bg-primary/10 text-primary inset-ring inset-ring-primary/20",
      },
      size: {
        sm: "px-1.5 py-0.5 text-xs",
        md: "px-2 py-1 text-xs",
        lg: "px-2.5 py-1.5 text-sm",
      },
      shape: {
        rounded: "rounded-md",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      shape: "rounded",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({
  className,
  variant,
  size,
  shape,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        badgeVariants({ variant, size, shape }),
        className,
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };