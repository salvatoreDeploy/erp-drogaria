---
modulo: relatorios
rota: /relatorios
pagina: RelatoriosPage
status: ✅ Implementado
schema: src/schemas/relatorio.ts ✅
layout: coluna-unica
referencia: DashboardPage.tsx (coluna única com cards)
---

# Relatórios — Spec

## Propósito
Hub de relatórios exportáveis por categoria. Visibilidade para gestão: vendas, estoque, SNGPC, PBM e financeiro.

## Layout — Coluna única

```
┌───────────────────────────────────────────┐
│ Header: título + filtros (período + filial)│
├───────────────────────────────────────────┤
│ Grid 5 cards de categoria:               │
│  Vendas | Estoque | SNGPC | PBM | Finan. │
├───────────────────────────────────────────┤
│ [quando categoria selecionada:]           │
│ Painel de filtros do relatório:           │
│  período + filtros específicos            │
│  + botões "Exportar PDF" "Exportar Excel" │
├───────────────────────────────────────────┤
│ Tabela preview (primeiros 10 registros)   │
└───────────────────────────────────────────┘
```

## Schema (criar em src/schemas/relatorio.ts)

```ts
export const TipoRelatorioSchema = z.enum([
  'vendas_periodo', 'curva_abc', 'estoque_atual', 'validade',
  'sngpc_movimentacoes', 'pbm_atendimentos', 'contas_pagar',
])

export const FormatoExportacaoSchema = z.enum(['pdf', 'excel', 'csv'])

export const RelatorioConfigSchema = z.object({
  tipo: TipoRelatorioSchema,
  data_inicio: z.string().date(),
  data_fim: z.string().date(),
  formato: FormatoExportacaoSchema,
  filtros: z.record(z.string()).optional(),
})

export const ExportacaoStatusSchema = z.object({
  arquivo_url: z.string(),
  gerado_em: z.string().datetime(),
  registros: z.number().int(),
})
```

## Relatórios por categoria

| Categoria | Relatórios disponíveis |
|---|---|
| Vendas | Por período, por produto, por operador, curva ABC |
| Estoque | Estoque atual, vencimento, reposição sugerida |
| SNGPC | Movimentações conferidas, histórico de envios |
| PBM | Atendimentos por convênio, desconto total, aprovados/rejeitados |
| Financeiro | Contas pagas, a vencer, DRE simplificado |

## Estado Principal

```ts
const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null)
const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio | null>(null)
const [exportando, setExportando] = useState(false)
const [ultimaExportacao, setUltimaExportacao] = useState<ExportacaoStatus | null>(null)
```

## Fluxo Principal

1. Clicar em card de categoria → expande painel de filtros abaixo
2. Selecionar tipo de relatório dentro da categoria
3. Preencher filtros (período obrigatório)
4. "Exportar PDF" / "Exportar Excel" → mock: gera link fictício + exibe card de sucesso

## API Endpoints

```ts
// TODO: POST /api/v1/relatorios/gerar  { tipo, data_inicio, data_fim, formato, filtros }
// TODO: GET /api/v1/relatorios/{id}/download
```

## Verificação

- [x] Quality gate passa (Biome + tsc + vite build ✅)
- [x] Cards de categoria clicáveis (toggle com highlight ativo/inativo)
- [x] Painel de filtros expande ao selecionar categoria
- [x] Select de tipo de relatório com opções da categoria ativa
- [x] Botão de exportação desabilitado sem tipo + período preenchidos
- [x] Mock async 900ms simula chamada à API
- [x] Card de sucesso com arquivo_url, registros e timestamp
- [x] Preview de dados com colunas dinâmicas por tipo de relatório
