import { z } from 'zod'

export const StatusMargemSchema = z.enum(['ok', 'alerta', 'critico'])

export const ProdutoPrecificadorSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  laboratorio: z.string(),
  apresentacao: z.string(),
  preco_custo: z.number().positive(),
  preco_atual: z.number().positive(),
  preco_sugerido: z.number().positive(),
  margem_atual: z.number(),
  margem_minima: z.number(),
  margem_alvo: z.number(),
  status_margem: StatusMargemSchema,
  giro_mensal: z.number().nonnegative(),
  concorrente_preco: z.number().positive().optional(),
})

export const FaixaPrecoSchema = z.object({
  label: z.string(),
  descricao: z.string(),
  margem: z.number(),
  preco: z.number().positive(),
  bg: z.string(),
  border: z.string(),
})

export const PromocaoSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(3),
  tipo: z.enum(['desconto_percentual', 'kit', 'quantidade_minima']),
  valor: z.number().positive(),
  produto_ids: z.array(z.string().uuid()),
  inicio: z.string(),
  fim: z.string(),
  ativa: z.boolean(),
})

export const SimulacaoPrecoSchema = z.object({
  preco_custo: z.coerce.number().positive('Custo obrigatório'),
  margem_alvo: z.coerce.number().min(0).max(100, 'Máximo 100%'),
})

export type StatusMargem = z.infer<typeof StatusMargemSchema>
export type ProdutoPrecificador = z.infer<typeof ProdutoPrecificadorSchema>
export type FaixaPreco = z.infer<typeof FaixaPrecoSchema>
export type Promocao = z.infer<typeof PromocaoSchema>
export type SimulacaoPreco = z.infer<typeof SimulacaoPrecoSchema>
