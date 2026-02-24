import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  endAdornment?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type, endAdornment, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1.5 leading-none">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={type}
            className={cn(
              "flex h-11 w-full rounded-lg border border-input bg-card px-4 py-2",
              "text-base text-foreground placeholder:text-muted-foreground",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "shadow-sm hover:border-primary/50",
              error && "border-destructive/80 focus:ring-destructive/30 bg-destructive/5 text-destructive placeholder:text-destructive/60",
              endAdornment && error ? "pr-20" : endAdornment ? "pr-12" : error ? "pr-12" : "",
              className
            )}
            ref={ref}
            {...props}
          />
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {error && (
              <AlertCircle className="h-5 w-5 text-destructive pointer-events-none" />
            )}
            {endAdornment}
          </div>
        </div>
        <div className="min-h-[20px] mt-1 flex flex-col justify-start">
          {error ? (
            <p className="flex items-start gap-1.5 text-xs font-medium text-destructive animate-in fade-in leading-tight">
              {error}
            </p>
          ) : helperText ? (
            <p className="text-xs text-muted-foreground leading-tight">{helperText}</p>
          ) : null}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
