import { z } from 'zod'

export const ClienteSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(2, 'Nome obrigatório'),
  cpf: z
    .string()
    .length(11, 'CPF deve ter 11 dígitos')
    .regex(/^\d+$/, 'CPF deve conter apenas números'),
  telefone: z.string().optional(),
  email: z.string().email('E-mail inválido').or(z.literal('')).optional(),
  convenio: z.string().optional(),
  pontos_fidelidade: z.number().int().nonnegative().default(0),
  observacoes: z.string().optional(),
})

export type Cliente = z.infer<typeof ClienteSchema>

export const ClienteFormSchema = ClienteSchema.omit({ id: true })
export type ClienteForm = z.infer<typeof ClienteFormSchema>
