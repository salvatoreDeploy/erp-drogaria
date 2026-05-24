import { z } from 'zod'

export const ConferenceStatusSchema = z.enum(['revisao', 'bloqueado', 'sucesso'])
export type ConferenceStatus = z.infer<typeof ConferenceStatusSchema>

export const NfeItemSchema = z.object({
  seq: z.number().int().positive(),
  codigo: z.string(),
  produto: z.string(),
  ncm: z.string(),
  ipi: z.number().nonnegative(),
  qtd_faturada: z.number().positive(),
  qtd_recebida: z.coerce.number().nonnegative(),
  valor_unit: z.number().positive(), // centavos
  lote: z.string(),
  validade: z.string(), // formato MM/AAAA
  no_catalog: z.boolean().default(false),
  produto_id: z.string().optional(),
  margem_baixa: z.boolean().default(false),
})
export type NfeItem = z.infer<typeof NfeItemSchema>

export const EntradaNfeStep1Schema = z.object({
  chave_acesso: z
    .string()
    .length(44, 'Chave de acesso deve ter 44 dígitos')
    .regex(/^\d+$/, 'Chave deve conter apenas números'),
  fornecedor: z.string().min(1, 'Fornecedor obrigatório'),
  data_entrada: z.string(),
  cnpj: z.string().length(14, 'CNPJ deve ter 14 dígitos').regex(/^\d+$/, 'CNPJ inválido'),
  filial: z.string().min(1, 'Filial obrigatória'),
  tipo_total: z.enum(['bruto', 'liquido']),
  condicao_pagto: z.string().min(1, 'Condição de pagamento obrigatória'),
  natureza: z.string().min(1, 'Natureza obrigatória'),
  gerar_contas: z.boolean().default(true),
})
export type EntradaNfeStep1 = z.infer<typeof EntradaNfeStep1Schema>
