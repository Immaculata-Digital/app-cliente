import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { registroSchema, type RegistroFormData } from "@/schemas/registro.schema";
import { clienteService } from "@/services/api-clientes/cliente.service";
import { PasswordInput } from "@/components/ds/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ds/Input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const Registro = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      aceite_termos: false,
      sexo: undefined,
    },
  });

  const sexo = watch("sexo");
  const aceiteTermos = watch("aceite_termos");

  useEffect(() => {
    const idLoja = searchParams.get("id_loja");
    if (!idLoja) {
      toast({
        title: "Erro",
        description: "ID da loja não encontrado",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [searchParams, navigate, toast]);

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return `+55${numbers}`;
    if (numbers.length <= 4) return `+55${numbers.slice(2)}`;
    return `+55${numbers.slice(2, 4)}${numbers.slice(4, 13)}`;
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const onSubmit = async (data: RegistroFormData) => {
    try {
      const idLoja = searchParams.get("id_loja");
      if (!idLoja) {
        throw new Error("ID da loja não encontrado");
      }

      const { confirmar_senha, ...registroData } = data;

      await clienteService.registrar("z_demo", {
        nome_completo: registroData.nome_completo,
        email: registroData.email,
        whatsapp: registroData.whatsapp,
        cep: registroData.cep,
        sexo: registroData.sexo,
        aceite_termos: registroData.aceite_termos,
        senha: registroData.senha,
        id_loja: parseInt(idLoja, 10),
      });

      toast({
        title: "Sucesso!",
        description: "Cadastro realizado com sucesso",
      });

      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar",
        description: error.response?.data?.message || "Ocorreu um erro ao realizar o cadastro",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2">Criar Conta</h1>
          <p className="text-muted-foreground text-center mb-6">
            Preencha os dados para se cadastrar
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome Completo"
              {...register("nome_completo")}
              error={errors.nome_completo?.message}
              placeholder="Digite seu nome completo"
            />

            <Input
              label="E-mail"
              type="email"
              {...register("email")}
              error={errors.email?.message}
              placeholder="seu@email.com"
            />

            <Input
              label="WhatsApp"
              {...register("whatsapp")}
              error={errors.whatsapp?.message}
              placeholder="+55DDD000000000"
              onChange={(e) => {
                const formatted = formatWhatsApp(e.target.value);
                setValue("whatsapp", formatted);
              }}
            />

            <Input
              label="CEP"
              {...register("cep")}
              error={errors.cep?.message}
              placeholder="00000-000"
              onChange={(e) => {
                const formatted = formatCEP(e.target.value);
                setValue("cep", formatted);
              }}
            />

            <div className="space-y-2">
              <Label>Sexo</Label>
              <Select
                value={sexo}
                onValueChange={(value) => setValue("sexo", value as "M" | "F" | "O")}
              >
                <SelectTrigger className={errors.sexo ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Feminino</SelectItem>
                  <SelectItem value="O">Outro</SelectItem>
                </SelectContent>
              </Select>
              {errors.sexo && (
                <p className="text-sm text-destructive">{errors.sexo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Senha</Label>
              <PasswordInput
                {...register("senha")}
                error={errors.senha?.message}
                placeholder="Digite sua senha"
              />
              {errors.senha && (
                <p className="text-sm text-destructive">{errors.senha.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Confirmar Senha</Label>
              <PasswordInput
                {...register("confirmar_senha")}
                error={errors.confirmar_senha?.message}
                placeholder="Digite sua senha novamente"
              />
              {errors.confirmar_senha && (
                <p className="text-sm text-destructive">{errors.confirmar_senha.message}</p>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="aceite_termos"
                checked={aceiteTermos}
                onCheckedChange={(checked) => setValue("aceite_termos", checked as boolean)}
              />
              <Label
                htmlFor="aceite_termos"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Aceito os termos de uso e política de privacidade
              </Label>
            </div>
            {errors.aceite_termos && (
              <p className="text-sm text-destructive">{errors.aceite_termos.message}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <a href="/login" className="text-primary hover:underline">
                Fazer login
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registro;
