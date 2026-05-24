import { z } from 'zod'

export const ProdutoStatusSchema = z.enum(['ativo', 'inativo'])

const produtoBase = z.object({
  id: z.string().uuid(),
  nome: z.string().min(3, 'Nome obrigatório (mín. 3 caracteres)'),
  ean: z.string().length(13, 'EAN deve ter 13 dígitos'),
  dcb: z.string().optional(),
  ncm: z.string().optional(),
  categoria: z.string().min(1, 'Categoria obrigatória'),
  fabricante: z.string().min(1, 'Fabricante obrigatório'),
  preco_custo: z.number().int().nonnegative(),
  preco_venda: z.number().int().positive(),
  margem_minima: z.number().int().min(0).max(100),
  estoque_minimo: z.number().int().nonnegative(),
  controlado: z.boolean(),
  portaria_344: z.boolean(),
  requer_receita: z.boolean(),
  pbm_elegivel: z.boolean(),
  rms: z.string().optional(),
  forma_farmaceutica: z.string().min(1, 'Forma farmacêutica obrigatória'),
  concentracao: z.string().min(1, 'Concentração obrigatória'),
  status: ProdutoStatusSchema,
})

const dcbCheck = (p: { controlado: boolean; dcb?: string }) =>
  !p.controlado || (p.dcb !== undefined && p.dcb.trim().length > 0)

export const ProdutoSchema = produtoBase.refine(dcbCheck, {
  message: 'DCB obrigatório para produto controlado',
  path: ['dcb'],
})
export type Produto = z.infer<typeof ProdutoSchema>
export type ProdutoStatus = z.infer<typeof ProdutoStatusSchema>

export const ProdutoFormSchema = produtoBase.omit({ id: true }).refine(dcbCheck, {
  message: 'DCB obrigatório para produto controlado',
  path: ['dcb'],
})
export type ProdutoForm = z.infer<typeof ProdutoFormSchema>
