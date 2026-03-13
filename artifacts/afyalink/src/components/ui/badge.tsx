import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "normal" | "urgent" | "emergency" | "pregnancy";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    destructive: "border-transparent bg-destructive text-destructive-foreground",
    outline: "text-foreground",
    normal: "border-transparent bg-[hsl(var(--triage-normal))] text-white shadow-sm",
    urgent: "border-transparent bg-[hsl(var(--triage-urgent))] text-white shadow-sm",
    emergency: "border-transparent bg-[hsl(var(--triage-emergency))] text-white shadow-sm animate-pulse",
    pregnancy: "border-transparent bg-[hsl(var(--triage-pregnancy))] text-white shadow-sm",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
