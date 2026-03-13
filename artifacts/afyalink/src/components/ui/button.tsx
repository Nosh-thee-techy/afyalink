import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "triage-normal" | "triage-urgent" | "triage-emergency" | "triage-pregnancy"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]"
    
    const variants = {
      default: "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground shadow hover:bg-destructive/90",
      outline: "border-2 border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
      "triage-normal": "bg-[hsl(var(--triage-normal))] text-white shadow-md hover:opacity-90",
      "triage-urgent": "bg-[hsl(var(--triage-urgent))] text-white shadow-md hover:opacity-90",
      "triage-emergency": "bg-[hsl(var(--triage-emergency))] text-white shadow-md hover:opacity-90",
      "triage-pregnancy": "bg-[hsl(var(--triage-pregnancy))] text-white shadow-md hover:opacity-90",
    }

    const sizes = {
      default: "h-12 px-6 py-3",
      sm: "h-9 rounded-lg px-4",
      lg: "h-14 rounded-2xl px-8 text-lg",
      icon: "h-12 w-12",
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
