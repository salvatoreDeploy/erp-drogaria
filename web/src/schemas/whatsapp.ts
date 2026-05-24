import { z } from 'zod'

export const MensagemStatusSchema = z.enum(['enviada', 'entregue', 'lida', 'falhou'])
export const CategoriaCampanhaSchema = z.enum([
  'promocao',
  'receita',
  'fidelidade',
  'sazonal',
  'automatica',
])
export const StatusCampanhaSchema = z.enum(['ativa', 'agendada', 'concluida', 'pausada'])

export const TemplateWhatsAppSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  categoria: CategoriaCampanhaSchema,
  mensagem: z.string(),
  variaveis: z.array(z.string()),
})

export const MensagemWhatsAppSchema = z.object({
  id: z.string().uuid(),
  cliente_nome: z.string(),
  cliente_telefone: z.string(),
  template_id: z.string().uuid().optional(),
  mensagem_preview: z.string(),
  canal: z.enum(['whatsapp', 'sms']),
  status: MensagemStatusSchema,
  enviada_em: z.string().datetime(),
})

export const CampanhaWhatsAppSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  tipo: CategoriaCampanhaSchema,
  enviadas: z.number().int().nonnegative(),
  abertura_pct: z.number().int().min(0).max(100),
  status: StatusCampanhaSchema,
  data: z.string().date(),
})

export const EnvioMensagemSchema = z.object({
  cliente_id: z.string().uuid(),
  template_id: z.string().uuid(),
  canal: z.enum(['whatsapp', 'sms']),
})

export const NovaCampanhaSchema = z.object({
  nome: z.string().min(3, 'Nome obrigatório'),
  template_id: z.string().uuid({ message: 'Selecione um template' }),
  segmento: z.enum(['todos', 'convenio', 'aniversario', 'receita_vencendo']),
  agendar_em: z.string().datetime().optional(),
})

export type MensagemStatus = z.infer<typeof MensagemStatusSchema>
export type CategoriaCampanha = z.infer<typeof CategoriaCampanhaSchema>
export type StatusCampanha = z.infer<typeof StatusCampanhaSchema>
export type TemplateWhatsApp = z.infer<typeof TemplateWhatsAppSchema>
export type MensagemWhatsApp = z.infer<typeof MensagemWhatsAppSchema>
export type CampanhaWhatsApp = z.infer<typeof CampanhaWhatsAppSchema>
export type EnvioMensagem = z.infer<typeof EnvioMensagemSchema>
export type NovaCampanha = z.infer<typeof NovaCampanhaSchema>
