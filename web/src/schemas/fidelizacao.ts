import { z } from 'zod'

export const SegmentoFidelidadeSchema = z.enum(['bronze', 'prata', 'ouro', 'diamante'])

export const ProgramaPontosSchema = z.object({
  id: z.string().uuid(),
  farmacia_id: z.string().uuid(),
  pontos_por_real: z.number().positive(),
  validade_pontos_dias: z.number().int().positive(),
  minimo_resgate: z.number().int().positive(),
  ativo: z.boolean(),
})

export const ClienteFidelidadeSchema = z.object({
  id: z.string().uuid(),
  cliente_id: z.string().uuid(),
  nome: z.string(),
  segmento: SegmentoFidelidadeSchema,
  pontos_atuais: z.number().int().nonnegative(),
  pontos_meta_proximo: z.number().int().positive(),
  total_gasto: z.number().nonnegative(),
  ultima_visita: z.string(),
})

export const CampanhaFidelizacaoSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(3, 'Nome obrigatório'),
  tipo: z.enum(['cupom', 'pontos_dobro', 'desconto_segmento', 'aniversario']),
  segmento_alvo: SegmentoFidelidadeSchema.optional(),
  desconto_percentual: z.number().int().min(0).max(100).optional(),
  pontos_bonus: z.number().int().nonnegative().optional(),
  inicio: z.string(),
  fim: z.string(),
  status: z.enum(['ativa', 'encerrada', 'agendada']),
  clientes_atingidos: z.number().int().nonnegative(),
})

export const NovaCampanhaFidelizacaoSchema = CampanhaFidelizacaoSchema.omit({
  id: true,
  status: true,
  clientes_atingidos: true,
})

export const TransacaoPontosSchema = z.object({
  id: z.string().uuid(),
  cliente_id: z.string().uuid(),
  cliente_nome: z.string(),
  tipo: z.enum(['credito', 'resgate', 'expiracao']),
  pontos: z.number().int(),
  valor_compra: z.number().nonnegative().optional(),
  data: z.string(),
  descricao: z.string(),
})

export type SegmentoFidelidade = z.infer<typeof SegmentoFidelidadeSchema>
export type ProgramaPontos = z.infer<typeof ProgramaPontosSchema>
export type ClienteFidelidade = z.infer<typeof ClienteFidelidadeSchema>
export type CampanhaFidelizacao = z.infer<typeof CampanhaFidelizacaoSchema>
export type NovaCampanhaFidelizacao = z.infer<typeof NovaCampanhaFidelizacaoSchema>
export type TransacaoPontos = z.infer<typeof TransacaoPontosSchema>
