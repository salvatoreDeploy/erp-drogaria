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

export const AjusteSchema = z.object({
  motivo: z.string().min(1, 'Selecione um motivo'),
  motivo_detalhe: z.string().min(3, 'Descreva o motivo'),
  itens: z.array(z.object({ produto_id: z.number(), diff: z.number().int() })),
})
export type Ajuste = z.infer<typeof AjusteSchema>

export const EscopoInventarioSchema = z.enum(['geral', 'por_categoria'])
export const ModoInventarioSchema = z.enum(['cego', 'com_saldo'])
export const StatusInventarioSchema = z.enum([
  'rascunho',
  'em_andamento',
  'aguardando_aprovacao',
  'finalizado',
])

export const ItemInventarioSchema = z.object({
  produto_id: z.string(),
  produto_nome: z.string(),
  lote: z.string(),
  validade: z.string(),
  qtd_sistema: z.number().int().nonnegative(),
  qtd_contada: z.number().int().nonnegative().nullable(),
  motivo: z.string().optional(),
})

export const InventarioSchema = z.object({
  id: z.string().uuid(),
  escopo: EscopoInventarioSchema,
  categoria_id: z.string().optional(),
  modo: ModoInventarioSchema,
  status: StatusInventarioSchema,
  iniciado_em: z.string(),
  itens: z.array(ItemInventarioSchema),
})

export const AjusteInventarioSchema = z.object({
  inventario_id: z.string().uuid(),
  motivo: z.string().min(5, 'Motivo obrigatório (mínimo 5 caracteres)'),
  motivo_detalhe: z.string().optional(),
})

export type ItemInventario = z.infer<typeof ItemInventarioSchema>
export type Inventario = z.infer<typeof InventarioSchema>
export type AjusteInventario = z.infer<typeof AjusteInventarioSchema>
