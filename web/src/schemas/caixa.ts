import { z } from 'zod'

export const AberturaCaixaSchema = z.object({
  fundo_troco: z.coerce.number().nonnegative('Fundo de troco não pode ser negativo'),
  observacao: z.string().optional(),
})
export type AberturaCaixa = z.infer<typeof AberturaCaixaSchema>

export const ConferenciaCaixaSchema = z.object({
  dinheiro: z.coerce.number().nonnegative(),
  motivo: z.string().optional(),
})
export type ConferenciaCaixa = z.infer<typeof ConferenciaCaixaSchema>
