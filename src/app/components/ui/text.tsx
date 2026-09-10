import * as React from "react"
import { cn } from "./utils"

type TextVariant = "xs" | "sm" | "base" | "lg" | "xl" | "2xl"
type TextWeight = "normal" | "medium" | "bold"

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant
  weight?: TextWeight
  as?: React.ElementType
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ className, variant = "base", weight = "normal", as: Component = "p", style, ...props }, ref) => {
    // Mapa de pesos para classes Tailwind
    const weightClasses = {
      normal: "font-normal",
      medium: "font-medium",
      bold: "font-bold",
    }

    return (
      <Component
        ref={ref}
        className={cn(
          "font-['Roboto'] text-foreground transition-all duration-200",
          weightClasses[weight],
          className
        )}
        style={{
          fontSize: `var(--text-${variant})`,
          fontVariationSettings: "'wdth' 100",
          ...style,
        }}
        {...props}
      />
    )
  }
)
Text.displayName = "Text"

export { Text }
