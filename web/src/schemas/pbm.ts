import { z } from 'zod'

export const PbmStatusSchema = z.enum(['aguardando', 'aprovado', 'pendente', 'rejeitado'])
export type PbmStatus = z.infer<typeof PbmStatusSchema>

export const AutorizacaoStatusSchema = z.enum(['aguardando', 'analisando', 'autorizado', 'negado'])
export type AutorizacaoStatus = z.infer<typeof AutorizacaoStatusSchema>

export const QueueItemStatusSchema = z.enum(['aprovado', 'pendente', 'rejeitado'])
export type QueueItemStatus = z.infer<typeof QueueItemStatusSchema>

export const AtendimentoPbmSchema = z.object({
  id: z.string().uuid(),
  cpf_paciente: z.string().length(11, 'CPF deve ter 11 dígitos').regex(/^\d+$/, 'CPF inválido'),
  crm_medico: z.string().min(4, 'CRM obrigatório'),
  convenio: z.string().min(1, 'Convênio obrigatório'),
  status: PbmStatusSchema,
  protocolo: z.string().optional(),
})
export type AtendimentoPbm = z.infer<typeof AtendimentoPbmSchema>

export const PbmConsultaSchema = z.object({
  cpf: z.string().length(11, 'CPF deve ter 11 dígitos').regex(/^\d+$/, 'CPF inválido'),
  convenio: z.string().min(1, 'Selecione um convênio'),
})
export type PbmConsulta = z.infer<typeof PbmConsultaSchema>

export const PbmMedItemSchema = z.object({
  id: z.number().int().positive(),
  nome: z.string(),
  rms: z.string(),
  qtd_total: z.string(),
  qtd_diaria: z.string(),
})
export type PbmMedItem = z.infer<typeof PbmMedItemSchema>

export const MedSearchResultSchema = z.object({
  id: z.number().int().positive(),
  nome: z.string(),
  rms: z.string(),
  ean: z.string(),
})
export type MedSearchResult = z.infer<typeof MedSearchResultSchema>
