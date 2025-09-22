import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        navy: "border-transparent bg-navy-800 text-white hover:bg-navy-900",
        success: "border-transparent bg-success text-success-foreground hover:bg-success/80",
        warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        accent: "border-transparent bg-accent text-accent-foreground hover:bg-accent/80",
        cashback: "border-transparent bg-gradient-success text-success-foreground hover:opacity-90",
        "success-light": "border-transparent bg-success-bg text-success hover:bg-success-bg/80",
        "warning-light": "border-transparent bg-warning-bg text-warning hover:bg-warning-bg/80",
        "destructive-light": "border-transparent bg-destructive-bg text-destructive hover:bg-destructive-bg/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "text-foreground",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
