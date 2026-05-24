import { z } from 'zod'

export const ResumoDiaSchema = z.object({
  vendas_dia: z.object({
    valor: z.number().int().nonnegative(),
    variacao_pct: z.number(),
  }),
  itens_alerta: z.object({
    lotes: z.number().int().nonnegative(),
  }),
  pbm_aprovado_pct: z.number().min(0).max(100),
  caixa: z.object({
    atendimentos: z.number().int().nonnegative(),
    aberto: z.boolean(),
  }),
})

export const AlertaCriticoTipoSchema = z.enum([
  'sngpc_pendente',
  'validade_proximo',
  'estoque_critico',
  'reposicao_sugerida',
])

export const AlertaCriticoSchema = z.object({
  id: z.string().uuid(),
  tipo: AlertaCriticoTipoSchema,
  titulo: z.string(),
  descricao: z.string(),
  criado_em: z.string().datetime(),
  rota_acao: z.string().optional(),
})

export type ResumoDia = z.infer<typeof ResumoDiaSchema>
export type AlertaCritico = z.infer<typeof AlertaCriticoSchema>
export type AlertaCriticoTipo = z.infer<typeof AlertaCriticoTipoSchema>
