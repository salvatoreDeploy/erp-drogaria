import { z } from 'zod'

export const ContaPagarStatusSchema = z.enum(['aberta', 'paga', 'atrasada', 'cancelada'])
export const FormasPagamentoSchema = z.enum([
  'dinheiro',
  'pix',
  'boleto',
  'debito',
  'credito',
  'cheque',
])

export const ContaPagarSchema = z.object({
  id: z.string().uuid(),
  nfe_entrada_id: z.string().uuid().optional(),
  fornecedor_id: z.string().uuid(),
  fornecedor_nome: z.string(),
  descricao: z.string().optional(),
  valor: z.number().int().positive(),
  vencimento: z.string().date(),
  status: ContaPagarStatusSchema,
  paga_em: z.string().datetime().optional(),
  forma_pagamento: FormasPagamentoSchema.optional(),
  observacao: z.string().optional(),
})

export const BaixaContaPagarSchema = z.object({
  data_pagamento: z.string().date(),
  forma_pagamento: FormasPagamentoSchema,
  observacao: z.string().optional(),
})

export const ResumoFinanceiroSchema = z.object({
  a_vencer_hoje: z.number().int().nonnegative(),
  em_atraso: z.number().int().nonnegative(),
  proximos_30d: z.number().int().nonnegative(),
  total_aberto: z.number().int().nonnegative(),
  total_pago_mes: z.number().int().nonnegative(),
})

// Form schema para criação manual de conta a pagar (valor em reais, convertido p/ centavos no handler)
export const NovaContaPagarFormSchema = z.object({
  fornecedor_nome: z.string().min(2, 'Informe o fornecedor'),
  descricao: z.string().optional(),
  valor_reais: z.coerce.number().positive('Valor deve ser maior que zero'),
  vencimento: z.string().date('Data inválida'),
  observacao: z.string().optional(),
})

export type ContaPagar = z.infer<typeof ContaPagarSchema>
export type ContaPagarStatus = z.infer<typeof ContaPagarStatusSchema>
export type FormasPagamento = z.infer<typeof FormasPagamentoSchema>
export type BaixaContaPagar = z.infer<typeof BaixaContaPagarSchema>
export type ResumoFinanceiro = z.infer<typeof ResumoFinanceiroSchema>
export type NovaContaPagarForm = z.infer<typeof NovaContaPagarFormSchema>
