import * as React from "react";
import { Button as BaseButton, ButtonProps as BaseButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends BaseButtonProps {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, loading, disabled, ...props }, ref) => {
    return (
      <BaseButton
        ref={ref}
        disabled={loading || disabled}
        className={cn(className)}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </BaseButton>
    );
  }
);

Button.displayName = "Button";

export { Button };
