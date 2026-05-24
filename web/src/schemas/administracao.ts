import { z } from 'zod'

export const PerfilAcessoSchema = z.enum(['admin', 'farmaceutico', 'operador_caixa'])

export const UsuarioAdminSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(3, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  perfil: PerfilAcessoSchema,
  ativo: z.boolean(),
  ultimo_acesso: z.string().optional(),
  caixas_permitidos: z.array(z.string()),
  modulos_permitidos: z.array(z.string()),
})

export const NovoUsuarioSchema = UsuarioAdminSchema.omit({
  id: true,
  ultimo_acesso: true,
})
  .extend({
    senha: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmar_senha: z.string(),
  })
  .refine((d) => d.senha === d.confirmar_senha, {
    message: 'Senhas não coincidem',
    path: ['confirmar_senha'],
  })

export const ConfigFarmaciaSchema = z.object({
  nome: z.string().min(3),
  cnpj: z.string().length(18, 'CNPJ inválido'),
  inscricao_estadual: z.string().optional(),
  crt: z.enum(['1', '2', '3']),
  regime_tributario: z.string(),
  endereco: z.string(),
  cidade: z.string(),
  uf: z.string().length(2),
  cep: z.string().length(9),
  telefone: z.string(),
  email_nfe: z.string().email(),
  logo_url: z.string().url().optional(),
})

export const ConfigSistemaSchema = z.object({
  url_sefaz_homologacao: z.string().url(),
  url_sefaz_producao: z.string().url(),
  ambiente_nfe: z.enum(['homologacao', 'producao']),
  serie_nfe: z.number().int().positive(),
  proximo_numero_nfe: z.number().int().positive(),
  timeout_sefaz_ms: z.number().int().positive(),
  backup_automatico: z.boolean(),
  notificacao_email: z.boolean(),
})

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  operador_nome: z.string(),
  operador_perfil: PerfilAcessoSchema,
  acao: z.string(),
  entidade_tipo: z.string(),
  entidade_id: z.string().optional(),
  hora: z.string(),
  ip: z.string().optional(),
  detalhes: z.string().optional(),
})

export type PerfilAcesso = z.infer<typeof PerfilAcessoSchema>
export type UsuarioAdmin = z.infer<typeof UsuarioAdminSchema>
export type NovoUsuario = z.infer<typeof NovoUsuarioSchema>
export type ConfigFarmacia = z.infer<typeof ConfigFarmaciaSchema>
export type ConfigSistema = z.infer<typeof ConfigSistemaSchema>
export type AuditLog = z.infer<typeof AuditLogSchema>
