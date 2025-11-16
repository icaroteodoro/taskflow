import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});
export const registerSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

export interface iLoginUserRequest {
  email: string;
  password: string;
}
export interface iCreateUserRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}