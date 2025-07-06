import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, forwardRef } from "react"
import "./secondary-button-fix.css"

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ children, className, asChild, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        asChild={asChild}
        className={cn(
          "bg-brand-gold hover:bg-brand-gold-hover text-brand-DEFAULT font-semibold px-8 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg",
          "focus:ring-2 focus:ring-brand-gold/50 focus:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
PrimaryButton.displayName = "PrimaryButton"

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

export const SecondaryButton = forwardRef<HTMLButtonElement, SecondaryButtonProps>(
  ({ children, className, asChild, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="outline"
        asChild={asChild}
        className={cn(
          "border-2 border-brand-gold text-brand-gold hover:bg-brand-gold secondary-btn-fix font-semibold px-8 py-3 rounded-xl transition-all duration-200 transform hover:scale-105",
          "focus:ring-2 focus:ring-brand-gold/50 focus:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
SecondaryButton.displayName = "SecondaryButton" 