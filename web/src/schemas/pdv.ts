import { z } from 'zod'

export const ESPERADO_DINHEIRO = 1340 // R$ esperado em espécie (mock — dado pelo sistema)

export const FechamentoCaixaSchema = z
  .object({
    valor_contado: z.coerce.number().positive('Informe o valor contado'),
    motivo_diferenca: z.string().optional(),
  })
  .refine((d) => Math.abs(d.valor_contado - ESPERADO_DINHEIRO) <= 50 || !!d.motivo_diferenca, {
    message: 'Motivo obrigatório quando diferença > R$ 50 (RN-09)',
    path: ['motivo_diferenca'],
  })

export type FechamentoCaixa = z.infer<typeof FechamentoCaixaSchema>

export const CartItemSchema = z.object({
  id: z.string(),
  nome: z.string(),
  lote: z.string(),
  validade: z.string(),
  quantidade: z.number().int().positive(),
  preco_unitario: z.number().int().positive(), // centavos
  desconto_pbm: z.number().int().nonnegative().default(0), // centavos
  controlado: z.boolean().default(false),
  receita_id: z.string().optional(),
  pbm_autorizacao_id: z.string().optional(),
})

export type CartItem = z.infer<typeof CartItemSchema>

export const SangriaSchema = z.object({
  valor: z.coerce.number().positive('Valor deve ser maior que zero'),
  motivo: z.string().min(3, 'Motivo obrigatório'),
})

export type Sangria = z.infer<typeof SangriaSchema>

export const SuprimentoSchema = z.object({
  valor: z.coerce.number().positive('Valor deve ser maior que zero'),
  origem: z.string().min(3, 'Origem obrigatória'),
})

export type Suprimento = z.infer<typeof SuprimentoSchema>
