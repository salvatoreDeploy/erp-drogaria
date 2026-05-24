import { z } from 'zod'

export const EstoqueStatusSchema = z.enum(['saudavel', 'alerta', 'critico', 'comprar'])
export type EstoqueStatus = z.infer<typeof EstoqueStatusSchema>

export const SngpcStatusSchema = z.enum(['OK', 'Pendente', 'N/A'])
export type SngpcStatus = z.infer<typeof SngpcStatusSchema>

export const EstoqueItemSchema = z.object({
  id: z.string(),
  produto: z.string(),
  estoque: z.number().int().nonnegative(),
  minimo: z.number().int().nonnegative(),
  validade: z.string(),
  validade_dias: z.number().int(),
  lote: z.string(),
  sngpc: SngpcStatusSchema,
  controlado: z.boolean().default(false),
  status: EstoqueStatusSchema,
})
export type EstoqueItem = z.infer<typeof EstoqueItemSchema>

export const AjusteBaseItemSchema = z.object({
  id: z.number().int().positive(),
  produto: z.string(),
  lote: z.string(),
  validade: z.string(),
  qtd_sistema: z.number().int().nonnegative(),
  preco: z.number().nonnegative(),
  categoria: z.string(),
})
export type AjusteBaseItem = z.infer<typeof AjusteBaseItemSchema>

export const AjusteStatusSchema = z.enum(['ok', 'pendente', 'aprovado', 'revisao'])
export type AjusteStatus = z.infer<typeof AjusteStatusSchema>

export const ModalReposicaoSchema = z.object({
  fornecedor: z.string().min(1, 'Selecione um fornecedor'),
  quantidade: z.coerce.number().int().positive('Quantidade deve ser maior que zero'),
  observacao: z.string().optional(),
})
export type ModalReposicao = z.infer<typeof ModalReposicaoSchema>

export const ModalTransferenciaSchema = z.object({
  filial: z.string().min(1, 'Selecione uma filial'),
  quantidade: z.coerce.number().int().positive('Quantidade deve ser maior que zero'),
  motivo: z.string().min(1, 'Selecione um motivo'),
})
export type ModalTransferencia = z.infer<typeof ModalTransferenciaSchema>
