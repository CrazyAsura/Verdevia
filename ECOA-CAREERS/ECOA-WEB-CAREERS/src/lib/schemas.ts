import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(4, { message: "Senha deve ter pelo menos 4 caracteres" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const complaintSchema = z.object({
  title: z.string().min(5, { message: "Título muito curto" }),
  description: z.string().min(20, { message: "Descrição deve ser mais detalhada" }),
  category: z.string(),
  isAnonymous: z.boolean().default(false),
});

export type ComplaintFormValues = z.infer<typeof complaintSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  confirmPassword: z.string().min(6, { message: "Confirmação de senha deve ter pelo menos 6 caracteres" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: "Senha deve ter pelo menos 8 caracteres" }),
  confirmPassword: z.string().min(8, { message: "Confirmação deve ter pelo menos 8 caracteres" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
