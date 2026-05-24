import { z } from 'zod'

export const TipoRelatorioSchema = z.enum([
  'vendas_periodo',
  'curva_abc',
  'estoque_atual',
  'validade',
  'sngpc_movimentacoes',
  'pbm_atendimentos',
  'contas_pagar',
])

export const FormatoExportacaoSchema = z.enum(['pdf', 'excel', 'csv'])

export const RelatorioConfigSchema = z.object({
  tipo: TipoRelatorioSchema,
  data_inicio: z.string().date(),
  data_fim: z.string().date(),
  formato: FormatoExportacaoSchema,
  filtros: z.record(z.string(), z.string()).optional(),
})

export const ExportacaoStatusSchema = z.object({
  arquivo_url: z.string(),
  gerado_em: z.string().datetime(),
  registros: z.number().int(),
  formato: FormatoExportacaoSchema,
})

export type TipoRelatorio = z.infer<typeof TipoRelatorioSchema>
export type FormatoExportacao = z.infer<typeof FormatoExportacaoSchema>
export type RelatorioConfig = z.infer<typeof RelatorioConfigSchema>
export type ExportacaoStatus = z.infer<typeof ExportacaoStatusSchema>
