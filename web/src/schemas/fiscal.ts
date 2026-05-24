import { z } from 'zod'

export const NfeHistStatusSchema = z.enum(['autorizada', 'cancelada', 'contingencia'])
export type NfeHistStatus = z.infer<typeof NfeHistStatusSchema>

export const ItemEmissaoStatusSchema = z.enum(['normal', 'contingencia'])
export type ItemEmissaoStatus = z.infer<typeof ItemEmissaoStatusSchema>

export const CartaCorrecaoSchema = z.object({
  nfe_id: z.string().min(1, 'Selecione uma NF-e'),
  correcao: z.string().min(15, 'Mínimo 15 caracteres').max(1000, 'Máximo 1000 caracteres'),
})
export type CartaCorrecao = z.infer<typeof CartaCorrecaoSchema>

export const CancelarNfeSchema = z.object({
  nfe_id: z.string().min(1, 'NF-e obrigatória'),
  motivo: z.string().min(1, 'Selecione um motivo'),
  confirmado: z.literal(true, { message: 'Confirme o cancelamento para continuar' }),
})
export type CancelarNfe = z.infer<typeof CancelarNfeSchema>

export const NfeEmissaoSchema = z.object({
  natureza_operacao: z.string().min(1, 'Natureza obrigatória'),
  destinatario_cnpj: z
    .string()
    .length(14, 'CNPJ deve ter 14 dígitos')
    .regex(/^\d+$/, 'CNPJ inválido'),
  destinatario_nome: z.string().min(1, 'Destinatário obrigatório'),
  valor_total: z.number().int().positive(), // centavos
  itens: z.array(
    z.object({
      produto_id: z.string().uuid(),
      quantidade: z.number().int().positive(),
      valor_unitario: z.number().int().positive(), // centavos
    })
  ),
})
export type NfeEmissao = z.infer<typeof NfeEmissaoSchema>
