import { z } from "zod";

/**
 * Schema de validação para registro de cliente
 */
export const registroSchema = z.object({
  nome_completo: z.string()
    .min(3, "Nome completo deve ter pelo menos 3 caracteres")
    .max(100, "Nome completo deve ter no máximo 100 caracteres"),
  
  email: z.string()
    .email("E-mail inválido")
    .max(255, "E-mail deve ter no máximo 255 caracteres"),
  
  whatsapp: z.string()
    .min(14, "WhatsApp inválido")
    .regex(/^\+55\d{2}\d{8,9}$/, "WhatsApp deve estar no formato +55DDNNNNNNNNN"),
  
  cep: z.string()
    .length(9, "CEP deve ter 8 dígitos")
    .regex(/^\d{5}-\d{3}$/, "CEP deve estar no formato 00000-000"),
  
  sexo: z.enum(["M", "F", "O"], {
    errorMap: () => ({ message: "Selecione uma opção válida" })
  }),
  
  aceite_termos: z.boolean()
    .refine(val => val === true, "Você deve aceitar os termos de uso"),
  
  senha: z.string()
    .min(10, "Senha deve ter pelo menos 10 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Senha deve conter pelo menos um caractere especial"),
  
  confirmar_senha: z.string()
}).refine((data) => data.senha === data.confirmar_senha, {
  message: "As senhas não conferem",
  path: ["confirmar_senha"],
});

export type RegistroFormData = z.infer<typeof registroSchema>;
