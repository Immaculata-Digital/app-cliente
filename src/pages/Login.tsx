import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn, Loader2, Key, Copy } from "lucide-react";
import { loginSchema, LoginFormData } from "@/schemas/auth.schema";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { MOCK_CREDENTIALS } from "@/utils/mock-auth";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");

  // Redireciona se já autenticado
  useEffect(() => {
    if (user) {
      const intendedRoute = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(intendedRoute, { replace: true });
    }
  }, [user, navigate, location]);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);

    try {
      await login(data.login, data.password);

      toast({
        title: "Bem-vindo(a)!",
        description: "Login realizado com sucesso.",
      });

      const intendedRoute = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(intendedRoute, { replace: true });
    } catch (error: any) {
      let title = "Erro no login";
      let description = "Ocorreu um erro. Tente novamente.";

      if (error.message === "LOGIN_INVALID") {
        title = "Credenciais inválidas";
        description = "Login ou senha inválidos.";
      } else if (error.message === "USER_BLOCKED") {
        title = "Usuário bloqueado";
        description = "Usuário bloqueado. Procure o administrador.";
      } else if (error.message === "RATE_LIMIT") {
        title = "Muitas tentativas";
        description = "Muitas tentativas. Tente novamente mais tarde.";
      } else if (error.message === "NETWORK_ERROR") {
        title = "Sem conexão";
        description = "Sem conexão. Verifique sua internet.";
      }

      toast({
        title,
        description,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-light px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
          {/* Header com gradiente */}
          <div className="bg-gradient-primary p-8 text-center">
            <h1 className="text-3xl font-bold text-primary-foreground mb-2">
              App Clientes
            </h1>
            <p className="text-primary-foreground/90">
              Acesso ao sistema de gestão
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-8 space-y-6"
            role="form"
            aria-label="Formulário de login"
          >
            {/* Campo Login */}
            <div className="space-y-2">
              <Label htmlFor="login" className="text-foreground">
                Login
              </Label>
              <Input
                id="login"
                type="text"
                placeholder="E-mail ou usuário"
                autoComplete="username"
                aria-invalid={!!errors.login}
                aria-describedby={errors.login ? "login-error" : undefined}
                {...register("login")}
                disabled={isSubmitting}
              />
              {errors.login && (
                <p
                  id="login-error"
                  className="text-sm text-destructive"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.login.message}
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  {...register("password")}
                  disabled={isSubmitting}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2",
                    "text-muted-foreground hover:text-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1",
                    "transition-colors"
                  )}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={showPassword}
                  disabled={isSubmitting}
                  tabIndex={0}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  className="text-sm text-destructive"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Lembrar-me */}
            <div className="flex items-center justify-between">
              <Label
                htmlFor="rememberMe"
                className="text-sm text-foreground cursor-pointer select-none"
              >
                Lembrar-me
              </Label>
              <Switch
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setValue("rememberMe", checked as boolean)}
                disabled={isSubmitting}
                aria-label="Lembrar de mim"
              />
            </div>

            {/* Botão Entrar */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>

            {/* Link Esqueci minha senha */}
            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Esqueci minha senha
              </Link>
            </div>
          </form>

          {/* Card de Acesso Temporário */}
          <div className="p-6 bg-muted/30 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Key className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">
                Acesso Temporário (Desenvolvimento)
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between bg-background/50 p-2 rounded">
                <div>
                  <span className="text-muted-foreground">Login: </span>
                  <span className="font-mono text-foreground">{MOCK_CREDENTIALS.login}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(MOCK_CREDENTIALS.login);
                    toast({ description: "Login copiado!" });
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center justify-between bg-background/50 p-2 rounded">
                <div>
                  <span className="text-muted-foreground">Senha: </span>
                  <span className="font-mono text-foreground">{MOCK_CREDENTIALS.password}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(MOCK_CREDENTIALS.password);
                    toast({ description: "Senha copiada!" });
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-3"
                onClick={() => {
                  setValue("login", MOCK_CREDENTIALS.login);
                  setValue("password", MOCK_CREDENTIALS.password);
                  toast({ description: "Credenciais preenchidas!" });
                }}
              >
                Preencher automaticamente
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          © 2025 App Clientes - Todos os direitos reservados
        </p>
      </div>
    </div>
  );
};

export default Login;
