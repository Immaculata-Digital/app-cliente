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
import type { Loja } from "@/services/api-admin/loja.service";

const Registro = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [itensRecompensa, setItensRecompensa] = useState<PontosRecompensa[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [lojaSelecionada, setLojaSelecionada] = useState<string>("");
  const [loadingLojas, setLoadingLojas] = useState(false);
  const { configuracoes } = useConfiguracoesGlobais();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, submitCount },
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
  const dataNascimento = watch("data_nascimento");
  const senha = watch("senha");
  const confirmarSenha = watch("confirmar_senha");

  const downloadPdfFromBase64 = (base64: string, fileName: string) => {
    try {
      // Verifica se o base64 tem cabeçalho de data URL (ex: data:application/pdf;base64,...)
      const base64Clean = base64.includes(',') ? base64.split(',')[1] : base64;

      const byteCharacters = atob(base64Clean);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Erro ao fazer download do PDF", e);
      toast({
        title: "Erro",
        description: "Não foi possível baixar o PDF.",
        variant: "destructive"
      })
    }
  };

  const abrirPoliticaPrivacidade = () => {
    if (configuracoes?.arquivo_politica_privacidade) {
      downloadPdfFromBase64(configuracoes.arquivo_politica_privacidade, "Politica_Privacidade.pdf");
    } else {
      window.open("/pdfs/Politica de privacidade.pdf", "_blank");
    }
  };

  const abrirTermosUso = () => {
    if (configuracoes?.arquivo_termos_uso) {
      downloadPdfFromBase64(configuracoes.arquivo_termos_uso, "Termos_de_Uso.pdf");
    } else {
      window.open("/pdfs/TERMOS DE USO – CLUBE DE FIDELIDADE.pdf", "_blank");
    }
  };

  // Função auxiliar para carregar lojas e mostrar combo
  const carregarLojasParaSelecao = async (mostrarMensagemLojaNaoEncontrada: boolean = false) => {
    const schema = getSchemaFromHostname();
    setLoadingLojas(true);
    try {
      const response = await lojaService.listLojas(schema, { limit: 200, offset: 0 });
      console.log('[Registro] Lojas carregadas:', response.itens.length);
      setLojas(response.itens);
      if (response.itens.length === 0) {
        toast({
          title: "Atenção",
          description: "Nenhuma loja disponível no momento. Por favor, entre em contato com o suporte.",
          variant: "default",
        });
        // Não redireciona - mantém na página de registro
        return;
      }
      // Mostra mensagem informativa ao usuário se solicitado
      if (mostrarMensagemLojaNaoEncontrada) {
        toast({
          title: "Loja não encontrada",
          description: "A loja informada não existe. Por favor, selecione uma loja abaixo.",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error("[Registro] Erro ao carregar lojas:", error);
      const errorMessage = error?.message || error?.response?.data?.message || "Não foi possível carregar as lojas";
      toast({
        title: "Atenção",
        description: `${errorMessage}. Por favor, tente novamente ou entre em contato com o suporte.`,
        variant: "default",

      });
      // Não redireciona - mantém na página de registro para o usuário tentar novamente
    } finally {
      setLoadingLojas(false);
    }
  };

  useEffect(() => {
    const validarIdLoja = async () => {
      const idLoja = searchParams.get("id_loja");
      if (!idLoja) {
        // Se não tem id_loja, carrega lista de lojas para seleção
        console.log('[Registro] id_loja não fornecido, carregando lista de lojas...');
        await carregarLojasParaSelecao(false);
        return;
      }

      const schema = getSchemaFromHostname();
      const idLojaNumero = parseInt(idLoja, 10);

      // Se id_loja for 0, carregar lista de lojas (não valida se existe)
      if (idLojaNumero === 0) {
        console.log('[Registro] id_loja = 0, carregando lista de lojas...');
        await carregarLojasParaSelecao(false);
        return;
      }

      // Se id_loja não for 0, verifica se é um número válido
      if (isNaN(idLojaNumero) || idLojaNumero < 1) {
        // Se ID inválido, carrega lista de lojas para seleção
        console.log('[Registro] id_loja inválido, carregando lista de lojas...');
        toast({
          title: "ID inválido",
          description: "O ID da loja informado é inválido. Por favor, selecione uma loja abaixo.",
          variant: "default",
        });
        await carregarLojasParaSelecao(false);
        return;
      }

      // Valida se a loja existe (apenas se id_loja > 0)
      try {
        const lojaExiste = await lojaService.lojaExiste(schema, idLojaNumero);
        if (!lojaExiste) {
          // Se a loja não existe (404), carrega lista de lojas para o usuário escolher
          console.log('[Registro] Loja não existe, carregando lista de lojas...');
          await carregarLojasParaSelecao(true);
          return;
        }
        // Se a loja existe, continua normalmente (sem combo)
      } catch (error: any) {
        // Se der erro ao validar, tenta carregar lista de lojas como fallback
        console.error("[Registro] Erro ao validar id_loja:", error);
        // Verifica se é erro 404 (loja não encontrada)
        if (error?.status === 404 || error?.response?.status === 404) {
          await carregarLojasParaSelecao(true);
        } else {
          // Para outros erros, também tenta carregar lojas como fallback
          await carregarLojasParaSelecao(true);
        }
        return;
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
      const idLojaParam = searchParams.get("id_loja");
      if (!idLojaParam) {
        throw new Error("ID da loja não encontrado");
      }

      const idLojaNumero = parseInt(idLojaParam, 10);
      let idLojaFinal: number;

      // Se id_loja for 0 OU se tem lojas carregadas (significa que precisa selecionar), usar o id_loja selecionado na combo
      if (idLojaNumero === 0 || lojas.length > 0) {
        if (!lojaSelecionada) {
          toast({
            title: "Erro",
            description: "Por favor, selecione uma loja",
            variant: "destructive",
          });
          return;
        }
        idLojaFinal = parseInt(lojaSelecionada, 10);
      } else {
        idLojaFinal = idLojaNumero;
      }

      const { confirmar_senha, ...registroData } = data;
      const schema = getSchemaFromHostname();

      await clienteService.registrar(schema, {
        nome_completo: registroData.nome_completo,
        email: registroData.email,
        whatsapp: registroData.whatsapp,
        cep: registroData.cep,
        sexo: registroData.sexo,
        data_nascimento: registroData.data_nascimento,
        aceite_termos: registroData.aceite_termos,
        senha: registroData.senha,
        id_loja: idLojaFinal,
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
            {/* Carrossel de recompensas */}
            {itensRecompensa.length > 0 && (
              <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-2xl md:p-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-card-foreground">Bem vindo(a) ao clube!</p>
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
              {/* Combo de seleção de loja quando id_loja = 0 ou quando a loja não existe */}
              {(parseInt(searchParams.get("id_loja") || "0", 10) === 0 || lojas.length > 0) && (
                <div className="space-y-2">
                  <Label htmlFor="loja">Loja *</Label>
                  <Select
                    value={lojaSelecionada}
                    onValueChange={setLojaSelecionada}
                    disabled={loadingLojas}
                  >
                    <SelectTrigger className={(!lojaSelecionada && submitCount > 0) ? "border-destructive !bg-[#ffffff]" : "!bg-[#ffffff]"}>
                      <SelectValue placeholder={loadingLojas ? "Carregando lojas..." : "Selecione uma loja"} />
                    </SelectTrigger>
                    <SelectContent>
                      {lojas.map((loja) => (
                        <SelectItem key={loja.id_loja} value={loja.id_loja.toString()}>
                          {loja.nome_loja_publico || loja.nome_loja}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(!lojaSelecionada && submitCount > 0) && (
                    <p className="text-sm text-destructive">Por favor, selecione uma loja</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Input
                  label="Nome Completo"
                  {...register("nome_completo")}
                  error={errors.nome_completo?.message}
                  placeholder="Digite seu nome completo"
                  className="!bg-[#ffffff]"
                />

                <Input
                  label="E-mail"
                  type="email"
                  {...register("email")}
                  error={errors.email?.message}
                  placeholder="seu@email.com"
                  className="!bg-[#ffffff]"
                />

                <Input
                  label="WhatsApp"
                  type="tel"
                  {...register("whatsapp")}
                  error={errors.whatsapp?.message}
                  placeholder="+55DDD000000000"
                  className="!bg-[#ffffff]"
                  onChange={(e) => {
                    const formatted = formatWhatsApp(e.target.value);
                    setValue("whatsapp", formatted, { shouldValidate: true });
                  }}
                />

                <Input
                  label="CEP"
                  type="tel"
                  {...register("cep")}
                  error={errors.cep?.message}
                  placeholder="00000-000"
                  className="!bg-[#ffffff]"
                  onChange={(e) => {
                    const formatted = formatCEP(e.target.value);
                    setValue("cep", formatted, { shouldValidate: true });
                  }}
                />

                <div className="space-y-2">
                  <Label>Sexo</Label>
                  <Select value={sexo} onValueChange={(value) => setValue("sexo", value as "M" | "F", { shouldValidate: true })}>
                    <SelectTrigger className={errors.sexo ? "border-destructive !bg-[#ffffff]" : "!bg-[#ffffff]"}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.sexo && <p className="text-sm text-destructive">{errors.sexo.message}</p>}
                </div>

                <Input
                  label="Data de Nascimento"
                  type="date"
                  {...register("data_nascimento")}
                  error={errors.data_nascimento?.message}
                  placeholder="YYYY-MM-DD"
                  className="!bg-[#ffffff]"
                />

                <div className="space-y-2">
                  <Label>Senha</Label>
                  <PasswordInput {...register("senha")} error={errors.senha?.message} placeholder="Digite sua senha" className="!bg-[#ffffff]" />
                  {errors.senha && <p className="text-sm text-destructive">{errors.senha.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Confirmar Senha</Label>
                  <PasswordInput
                    {...register("confirmar_senha")}
                    error={errors.confirmar_senha?.message}
                    placeholder="Digite sua senha novamente"
                    className="!bg-[#ffffff]"
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
                  Aceito a{" "}
                  <button type="button" className="text-primary underline" onClick={abrirPoliticaPrivacidade}>
                    política de privacidade
                  </button>{" "}
                  e os{" "}
                  <button type="button" className="text-primary underline" onClick={abrirTermosUso}>
                    termos de uso do clube de fidelidade
                  </button>
                </Label>
              </div>
              {errors.aceite_termos && <p className="text-sm text-destructive">{errors.aceite_termos.message}</p>}

              <Button type="submit" className="w-full text-base font-semibold" disabled={isSubmitting}>
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
