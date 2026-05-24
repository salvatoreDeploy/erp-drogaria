import { z } from 'zod'

export const PerfilOperadorSchema = z.enum(['admin', 'farmaceutico', 'operador_caixa'])

export const OperadorSchema = z.object({
  id: z.string().uuid(),
  farmacia_id: z.string().uuid(),
  nome: z.string(),
  email: z.string().email(),
  perfil: PerfilOperadorSchema,
  caixas_permitidos: z.array(z.string().uuid()),
})

export const LoginBodySchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
})

export const SessaoSchema = z.object({
  token: z.string(),
  refresh_token: z.string(),
  operador: OperadorSchema,
  expira_em: z.string().datetime(),
})

export type PerfilOperador = z.infer<typeof PerfilOperadorSchema>
export type Operador = z.infer<typeof OperadorSchema>
export type LoginBody = z.infer<typeof LoginBodySchema>
export type Sessao = z.infer<typeof SessaoSchema>
