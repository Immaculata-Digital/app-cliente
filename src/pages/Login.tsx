import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn, Loader2, Key, Copy, Info } from "lucide-react";
import { loginSchema, LoginFormData } from "@/schemas/auth.schema";
import { useAuth } from "@/contexts/AuthContext";
import { useConfiguracoesGlobais } from "@/contexts/ConfiguracoesGlobaisContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ds/Button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PasswordInput } from "@/components/ds/PasswordInput";
import { cn } from "@/lib/utils";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();
  const { configuracoes } = useConfiguracoesGlobais();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug: verificar configurações
  useEffect(() => {
    console.log('[Login] Configurações atuais:', configuracoes);
    console.log('[Login] Logo base64 presente?', !!configuracoes?.logo_base64);
    if (configuracoes?.logo_base64) {
      console.log('[Login] Primeiros 100 chars do logo:', configuracoes.logo_base64.substring(0, 100));
    }
  }, [configuracoes]);

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

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);

    try {
      await login(data.login, data.password, data.rememberMe);

      toast({
        title: "Bem-vindo(a)!",
        description: "Login realizado com sucesso.",
      });

      navigate("/", { replace: true });
    } catch (error: unknown) {
      let title = "Erro no login";
      let description = "Ocorreu um erro. Tente novamente.";

      if (error instanceof Error && error.message === "LOGIN_INVALID") {
        title = "Credenciais inválidas";
        description = "Login ou senha inválidos.";
      } else if (error instanceof Error && error.message === "USER_NOT_CLIENT") {
        title = "Acesso não permitido";
        description = "esse usuário não é um cliente";
      } else if (error instanceof Error && error.message === "USER_BLOCKED") {
        title = "Usuário bloqueado";
        description = "Usuário bloqueado. Procure o administrador.";
      } else if (error instanceof Error && error.message === "RATE_LIMIT") {
        title = "Muitas tentativas";
        description = "Muitas tentativas. Tente novamente mais tarde.";
      } else if (error instanceof Error && error.message === "NETWORK_ERROR") {
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
            {/* Logo */}
            {configuracoes?.logo_base64 ? (
              <div className="flex justify-center">
                <img 
                  src={configuracoes.logo_base64}
                  alt="Logo" 
                  className="h-20 w-auto object-contain"
                />
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-primary-foreground mb-2">Sistema de Fidelidade</h1>
                <p className="text-primary-foreground/90">Acesso aos seus pontos</p>
              </>
            )}
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
                <p id="login-error" className="text-sm text-destructive" role="alert" aria-live="polite">
                  {errors.login.message}
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Senha
              </Label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                {...register("password")}
                disabled={isSubmitting}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive" role="alert" aria-live="polite">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Lembrar-me */}
            <div className="flex items-center justify-between">
              <Label htmlFor="rememberMe" className="text-sm text-foreground cursor-pointer select-none">
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
              variant="primary"
              size="md"
              className="w-full"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              leftIcon={isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>

            {/* Link Esqueci minha senha */}
            <div className="text-center">
              <Link
                to="/esqueci-senha"
                className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Esqueci minha senha
              </Link>
            </div>
          </form>
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
