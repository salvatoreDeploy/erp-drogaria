import { z } from 'zod'

export const MovimentacaoSngpcStatusSchema = z.enum(['pendente', 'conferido', 'divergencia'])
export const TipoMovimentacaoSngpcSchema = z.enum(['saida', 'entrada', 'ajuste'])
export const LoteEnvioStatusSchema = z.enum(['aceito', 'rejeitado_parcial', 'rejeitado_total'])

export const MovimentacaoSngpcSchema = z.object({
  id: z.string().uuid(),
  tipo: TipoMovimentacaoSngpcSchema,
  produto: z.string(),
  dcb: z.string(),
  lote: z.string(),
  quantidade: z.number().int().positive(),
  paciente: z.string().optional(),
  cpf_paciente: z.string().optional(),
  crm_medico: z.string().optional(),
  receita_id: z.string().uuid().optional(),
  data: z.string().datetime(),
  status: MovimentacaoSngpcStatusSchema,
  observacao: z.string().optional(),
})

export const LoteEnvioSngpcSchema = z.object({
  lote_id: z.string().uuid(),
  protocolo: z.string(),
  enviados: z.number().int().nonnegative(),
  rejeitados: z.number().int().nonnegative(),
  status: LoteEnvioStatusSchema,
  enviado_em: z.string().datetime(),
  farmaceutico: z.string(),
  arquivo_xml: z.string().optional(),
})

export const SngpcModuloStatusSchema = z.object({
  pendentes: z.number().int().nonnegative(),
  enviados_hoje: z.number().int().nonnegative(),
  divergencias: z.number().int().nonnegative(),
  ultima_sinc: z.string().datetime(),
  anvisa_online: z.boolean(),
  proximo_envio: z.string().datetime().optional(),
})

export const ConferenciaBodySchema = z.object({
  status: z.enum(['conferido', 'divergencia']),
  observacao: z.string().optional(),
})

export const EnvioLoteBodySchema = z.object({
  movimentacao_ids: z.array(z.string().uuid()).min(1, 'Selecione ao menos uma movimentação'),
  farmaceutico_id: z.string().uuid(),
})

export type MovimentacaoSngpc = z.infer<typeof MovimentacaoSngpcSchema>
export type MovimentacaoSngpcStatus = z.infer<typeof MovimentacaoSngpcStatusSchema>
export type TipoMovimentacaoSngpc = z.infer<typeof TipoMovimentacaoSngpcSchema>
export type LoteEnvioSngpc = z.infer<typeof LoteEnvioSngpcSchema>
export type LoteEnvioStatus = z.infer<typeof LoteEnvioStatusSchema>
export type SngpcModuloStatus = z.infer<typeof SngpcModuloStatusSchema>
export type ConferenciaBody = z.infer<typeof ConferenciaBodySchema>
export type EnvioLoteBody = z.infer<typeof EnvioLoteBodySchema>
