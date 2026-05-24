import { z } from 'zod'

export const ReceitaStatusSchema = z.enum([
  'idle',
  'processando',
  'validado',
  'pendente',
  'rejeitado',
])
export type ReceitaStatus = z.infer<typeof ReceitaStatusSchema>

export const MedStatusSchema = z.enum(['liberado', 'analisar', 'bloqueado'])
export type MedStatus = z.infer<typeof MedStatusSchema>

export const CheckStatusSchema = z.enum(['ok', 'pendente', 'erro', 'aguardando'])
export type CheckStatus = z.infer<typeof CheckStatusSchema>

export const ReceitaMedItemSchema = z.object({
  id: z.number().int().positive(),
  nome: z.string(),
  posologia: z.string(),
  controlado: z.boolean(),
  status: MedStatusSchema,
})
export type ReceitaMedItem = z.infer<typeof ReceitaMedItemSchema>

export const CheckItemSchema = z.object({
  label: z.string(),
  value: z.string(),
  status: CheckStatusSchema,
})
export type CheckItem = z.infer<typeof CheckItemSchema>
