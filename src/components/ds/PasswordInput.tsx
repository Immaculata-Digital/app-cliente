import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ds/Input";
import { cn } from "@/lib/utils";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  showToggle?: boolean;
  label?: string;
}

/**
 * Componente de input de senha com toggle de visibilidade
 * Reutilizável em formulários de login, cadastro, redefinição de senha, etc.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, showToggle = true, disabled, label, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleButton = showToggle ? (
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className={cn(
          "text-muted-foreground hover:text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1",
          "transition-colors",
          disabled && "opacity-50 cursor-not-allowed",
          error && "text-destructive/70 hover:text-destructive"
        )}
        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={showPassword}
        disabled={disabled}
        tabIndex={0}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    ) : null;

    return (
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        className={className}
        disabled={disabled}
        aria-invalid={!!error}
        error={error}
        label={label}
        endAdornment={toggleButton}
        {...props}
      />
    );
  }
);

PasswordInput.displayName = "PasswordInput";
