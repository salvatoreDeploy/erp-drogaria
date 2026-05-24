import { z } from 'zod'

export const CondicaoPadraoSchema = z.enum(['a_vista', '30', '30_60_90', '60_90_120'])

export const FornecedorSchema = z.object({
  id: z.string().uuid(),
  razao_social: z.string().min(3, 'Razão social obrigatória'),
  cnpj: z
    .string()
    .length(14, 'CNPJ deve ter 14 dígitos')
    .regex(/^\d+$/, 'CNPJ deve conter apenas números'),
  email: z.string().email('E-mail inválido').or(z.literal('')).optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().length(2, 'UF deve ter 2 letras').optional(),
  condicao_padrao: CondicaoPadraoSchema,
  prazo_entrega_dias: z.number().int().nonnegative().default(3),
})

export type Fornecedor = z.infer<typeof FornecedorSchema>
export type CondicaoPadrao = z.infer<typeof CondicaoPadraoSchema>

export const FornecedorFormSchema = FornecedorSchema.omit({ id: true })
export type FornecedorForm = z.infer<typeof FornecedorFormSchema>
