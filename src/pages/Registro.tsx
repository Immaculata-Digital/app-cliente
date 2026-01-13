import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { registroSchema, type RegistroFormData } from "@/schemas/registro.schema";
import { clienteService } from "@/services/api-clientes/cliente.service";
import { pontosRecompensasService } from "@/services/api-clientes/pontos-recompensas.service";
import { lojaService } from "@/services/api-admin";
import { PasswordInput } from "@/components/ds/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ds/Input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { RecompensasCarousel } from "@/components/RecompensasCarousel";
import type { PontosRecompensa } from "@/types/cliente-pontos-recompensas";
import { useConfiguracoesGlobais } from "@/contexts/ConfiguracoesGlobaisContext";
import { getSchemaFromHostname } from "@/utils/schema.utils";

const Registro = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [itensRecompensa, setItensRecompensa] = useState<PontosRecompensa[]>([]);
  const { configuracoes } = useConfiguracoesGlobais();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setValue,
    watch,
  } = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema),
    mode: "onChange",
    defaultValues: {
      aceite_termos: false,
      sexo: undefined,
    },
  });

  const sexo = watch("sexo");
  const aceiteTermos = watch("aceite_termos");
  const nomeCompleto = watch("nome_completo");
  const email = watch("email");
  const whatsapp = watch("whatsapp");
  const cep = watch("cep");
  const senha = watch("senha");
  const confirmarSenha = watch("confirmar_senha");

  // Verifica se todos os campos obrigatórios estão preenchidos e válidos
  const isFormValid = useMemo(() => {
    return !!(
      nomeCompleto &&
      nomeCompleto.length >= 3 &&
      email &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      whatsapp &&
      /^\+55\d{2}\d{8,9}$/.test(whatsapp) &&
      cep &&
      /^\d{5}-\d{3}$/.test(cep) &&
      sexo &&
      senha &&
      senha.length >= 10 &&
      /[A-Z]/.test(senha) &&
      /[a-z]/.test(senha) &&
      /[0-9]/.test(senha) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(senha) &&
      confirmarSenha &&
      senha === confirmarSenha &&
      aceiteTermos === true &&
      Object.keys(errors).length === 0
    );
  }, [nomeCompleto, email, whatsapp, cep, sexo, senha, confirmarSenha, aceiteTermos, errors]);

  const handleDocumentoPendente = () => {
    alert("documento pendente");
  };

  useEffect(() => {
    const validarIdLoja = async () => {
      const idLoja = searchParams.get("id_loja");
      if (!idLoja) {
        toast({
          title: "Erro",
          description: "ID da loja não encontrado",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      // Verifica se o id_loja existe
      try {
        const idLojaNumero = parseInt(idLoja, 10);
        if (isNaN(idLojaNumero)) {
          toast({
            title: "ID inválido",
            description: "O ID da loja informado é inválido",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        const schema = getSchemaFromHostname();
        const lojaExiste = await lojaService.lojaExiste(schema, idLojaNumero);
        if (!lojaExiste) {
          toast({
            title: "ID inválido",
            description: "O ID da loja informado não existe",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
      } catch (error) {
        console.error("Erro ao validar id_loja:", error);
        toast({
          title: "Erro",
          description: "Não foi possível validar o ID da loja",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    validarIdLoja();
  }, [searchParams, navigate, toast]);

  // Buscar itens de recompensa disponíveis
  useEffect(() => {
    const buscarItens = async () => {
      try {
        // Usando o schema padrão (configurado via VITE_SCHEMA_DEFAULT)
        const schema = getSchemaFromHostname();
        const itens = await pontosRecompensasService.getItensDisponiveis(schema);
        setItensRecompensa(itens);
      } catch (error) {
        // Silenciosamente ignora erros ao buscar itens (não é crítico)
        console.error("Erro ao buscar itens de recompensa:", error);
      }
    };

    buscarItens();
  }, []);

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
      const schema = getSchemaFromHostname();

      await clienteService.registrar(schema, {
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
      const errorData = error.response?.data || {};
      let errorMessage = "Ocorreu um erro ao realizar o cadastro";
      
      // Prioridade: error > message > details
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.details && Array.isArray(errorData.details)) {
        errorMessage = errorData.details.join(", ");
      } else if (error.message && error.message !== "Unknown error") {
        errorMessage = error.message;
      }

      toast({
        title: "Erro ao cadastrar",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background px-4 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-2xl md:p-10">
              {configuracoes?.logo_base64 ? (
                <div className="mb-6 flex justify-center">
                  <img
                    src={configuracoes.logo_base64}
                    alt="Logo do sistema de fidelidade"
                    className="h-20 w-auto max-w-[220px] object-contain drop-shadow-lg"
                  />
                </div>
              ) : (
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-card-foreground">Sistema de Fidelidade</p>
              )}
              <h1 className="mt-4 text-4xl font-semibold leading-tight text-foreground">Seja muito bem-vindo(a)!</h1>
              <p className="mt-3 text-base text-muted-foreground">
                Acumule pontos, desbloqueie experiências exclusivas e mantenha tudo em um só lugar, mesmo que você já
                seja cliente.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-start gap-3">
                <a
                  href="#registro-form"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition hover:bg-primary/90"
                >
                  Quero me cadastrar
                </a>
                <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">ou</span>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full bg-primary-foreground border border-primary px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary transition hover:bg-primary-foreground/90"
                >
                  já tenho conta
                </Link>
              </div>

              <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-card border border-card-foreground text-xs font-bold text-card-foreground">
                    1
                  </span>
                  Informe seus dados básicos para criarmos sua conta única.
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-card border border-card-foreground text-xs font-bold text-card-foreground">
                    2
                  </span>
                  Use o mesmo e-mail ou WhatsApp já usados nas lojas parceiras.
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-card border border-card-foreground text-xs font-bold text-card-foreground">
                    3
                  </span>
                  Acesse sua área exclusiva sempre que quiser acompanhar seus pontos.
                </li>
              </ul>

              <div className="mt-6 rounded-2xl border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Usuário recorrente?</p>
                <p>
                  Entre com seu login para resgatar recompensas ou recuperar seus pontos em segundos.
                </p>
              </div>
            </div>

            {/* Carrossel de recompensas */}
            {itensRecompensa.length > 0 && (
              <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-2xl md:p-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-card-foreground">Vantagens</p>
                    <h2 className="text-lg font-semibold text-foreground">Recompensas em destaque</h2>
                  </div>
                </div>
                <div className="mt-4">
                  <RecompensasCarousel itens={itensRecompensa} />
                </div>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-2xl md:p-10">
            <div className="text-center md:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-card-foreground">Cadastro rápido</p>
              <h2 className="mt-3 text-3xl font-semibold text-foreground">Preencha seus dados</h2>
              <p className="text-sm text-muted-foreground">
                Leva menos de 2 minutos e você já pode acompanhar sua fidelidade.
              </p>
            </div>

            <form
              id="registro-form"
              onSubmit={handleSubmit(onSubmit)}
              className="mt-8 space-y-6"
              role="form"
              aria-label="Formulário de Cadastro"
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                  type="tel"
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
                  type="tel"
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
                  <Select value={sexo} onValueChange={(value) => setValue("sexo", value as "M" | "F" | "O")}>
                    <SelectTrigger className={errors.sexo ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                      <SelectItem value="O">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.sexo && <p className="text-sm text-destructive">{errors.sexo.message}</p>}
                </div>

                <div className="hidden md:block" aria-hidden="true"></div>

                <div className="space-y-2">
                  <Label>Senha</Label>
                  <PasswordInput {...register("senha")} error={errors.senha?.message} placeholder="Digite sua senha" />
                  {errors.senha && <p className="text-sm text-destructive">{errors.senha.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Confirmar Senha</Label>
                  <PasswordInput
                    {...register("confirmar_senha")}
                    error={errors.confirmar_senha?.message}
                    placeholder="Digite sua senha novamente"
                  />
                  {errors.confirmar_senha && <p className="text-sm text-destructive">{errors.confirmar_senha.message}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 p-4">
                <Checkbox
                  id="aceite_termos"
                  checked={aceiteTermos}
                  onCheckedChange={(checked) => setValue("aceite_termos", checked as boolean)}
                />
                <Label
                  htmlFor="aceite_termos"
                  className="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Aceito os{" "}
                  <button type="button" className="text-primary underline" onClick={handleDocumentoPendente}>
                    termos de política de privacidade
                  </button>{" "}
                  e as{" "}
                  <button type="button" className="text-primary underline" onClick={handleDocumentoPendente}>
                    regras do sistema de fidelidade
                  </button>
                </Label>
              </div>
              {errors.aceite_termos && <p className="text-sm text-destructive">{errors.aceite_termos.message}</p>}

              <Button type="submit" className="w-full text-base font-semibold" disabled={isSubmitting || !isFormValid}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  "Concluir meu cadastro"
                )}
              </Button>

              <div className="rounded-2xl bg-muted/50 p-4 text-center text-sm text-muted-foreground">
                Já participa do clube?{" "}
                <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
                  Acesse sua conta
                </Link>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Registro;
