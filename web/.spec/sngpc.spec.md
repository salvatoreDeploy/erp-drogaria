---
modulo: sngpc
rota: /sngpc
pagina: SngpcPage
status: ✅ Implementado (2026-05-18)
schema: src/schemas/sngpc.ts
layout: duas-colunas
referencia: EstoquePage.tsx (duas colunas) + AjusteEstoquePage.tsx (seleção de linhas)
---

# SNGPC — Spec

## Propósito
Conferência manual e envio em lote de movimentações de medicamentos controlados à ANVISA (RDC 204/2017). Exclusivo para perfil `farmaceutico` e `admin`.

## Layout — Duas colunas

```
┌─────────────────────────────────┬───────────────┐
│ Header: título + filtros        │               │
├─────────────────────────────────┤  Painel       │
│ Tabela de movimentações         │  Direito      │
│ (checkbox + produto + paciente  │  (w-82.5)     │
│  + tipo + qtd + data + status   │               │
│  + [Detalhe])                   │  Métricas 3x  │
│                                 │  Botão Enviar │
│ ← scroll interno (flex-1)       │  Histórico    │
└─────────────────────────────────┴───────────────┘
```

**Esquerda (flex-1 flex-col gap-4 min-h-0):**
- Header card: título + chip ANVISA (demo switcher online/offline) + barra de filtros (tipo + busca)
- Card da tabela: header fixo + linhas com checkbox + `overflow-y-auto flex-1`

**Direita (w-82.5 shrink-0 flex-col gap-4):**
- Card métricas (3 cards: Pendentes / Conferidos / Divergências) via `useMemo`
- Card ações: contador de selecionados + "Conferir selecionados" + "Enviar lote X mov." (disabled se nenhum conferido selecionado)
- Card histórico: últimos 5 lotes enviados (protocolo + enviados + status badge + data)
- Card de protocolo (aparece após envio bem-sucedido): protocolo ANVISA + badge ✓ Aceito

## Schema
`src/schemas/sngpc.ts`

**Tipos principais:**
- `MovimentacaoSngpc` — id, tipo, produto, dcb, lote, quantidade, paciente?, cpf_paciente?, crm_medico?, receita_id?, data, status, observacao?
- `LoteEnvioSngpc` — lote_id, protocolo, enviados, rejeitados, status, enviado_em, farmaceutico
- `MovimentacaoSngpcStatus` = `'pendente' | 'conferido' | 'divergencia'`
- `TipoMovimentacaoSngpc` = `'saida' | 'entrada' | 'ajuste'`

## Mock Data

**20 movimentações:**
- 15 saída: Ritalina, Morfina, Clonazepam, Alprazolam, Codeína, Fenobarbital (variados)
- 3 entrada: lançamentos de compra NF-e
- 2 ajuste: correções de inventário
- Status mix: 10 pendente, 7 conferido, 3 divergencia

**5 lotes históricos:** protocolos ANVISA-2026-*, datas recentes, todos aceito exceto 1 rejeitado_parcial

## Config Tables

```ts
const TIPO_CFG = {
  saida:   { label: 'Saída',   bg: 'bg-danger-50',  text: 'text-danger-700'  },
  entrada: { label: 'Entrada', bg: 'bg-brand-75',   text: 'text-brand-750'   },
  ajuste:  { label: 'Ajuste',  bg: 'bg-warning-50', text: 'text-warning-700' },
}

const STATUS_CFG = {
  pendente:    { label: '● Pendente',    bg: 'bg-neutral-50',  text: 'text-neutral-500' },
  conferido:   { label: '✓ Conferido',   bg: 'bg-brand-75',    text: 'text-success-600' },
  divergencia: { label: '✗ Divergência', bg: 'bg-danger-50',   text: 'text-danger-700'  },
}
```

## Estado (useState)

```ts
const [movs, setMovs] = useState<MovimentacaoSngpc[]>(MOVIMENTACOES)
const [selecionados, setSelecionados] = useState<string[]>([])
const [filtroTipo, setFiltroTipo] = useState<'todos'|'saida'|'entrada'|'ajuste'>('todos')
const [busca, setBusca] = useState('')
const [detalheOpen, setDetalheOpen] = useState<MovimentacaoSngpc | null>(null)
const [anvisaOnline, setAnvisaOnline] = useState(true)
const [historicoLotes, setHistoricoLotes] = useState<LoteEnvioSngpc[]>(HISTORICO_LOTES)
const [ultimoEnvio, setUltimoEnvio] = useState<{ protocolo: string; enviados: number } | null>(null)
```

## Colunas da Tabela

```
grid-cols-[20px_minmax(0,2fr)_minmax(0,1.2fr)_72px_50px_80px_100px_48px]
[✓] | Produto+DCB | Paciente/CRM | Tipo | Qtd | Data | Status | [↗]
```

Header: checkbox "select all" na primeira coluna.

## Fluxo Principal

1. Checkbox por linha → acumula `selecionados`
2. Botão "Conferir selecionados" → `setMovs(prev => prev.map(...conferido))`; remove dos selecionados
3. Clique em [↗] → abre `ModalDetalheMovimentacao` com dados + campo observação
4. No modal: "Marcar divergência" → `setMovs(status: divergencia, observacao)`
5. Botão "Enviar lote" (ativo quando ≥1 selecionado com status conferido):
   - Mock: gera protocolo `ANVISA-2026-XXXXXX`
   - Remove movimentações enviadas do estado
   - Adiciona lote ao histórico
   - Exibe card de protocolo `ultimoEnvio`

## ModalDetalheMovimentacao

Campos exibidos (somente leitura via `ReadonlyField`): produto, DCB, lote, quantidade, paciente, CPF, CRM, data, tipo.
Campo de escrita: textarea "Observação" (para divergências).
Botões: "Conferir ✓" (brand) | "Marcar divergência ✗" (danger)

## API Endpoints

```ts
// TODO: GET /api/v1/sngpc/status
// TODO: GET /api/v1/sngpc/movimentacoes-pendentes?tipo=&data=
// TODO: PATCH /api/v1/sngpc/movimentacoes/{id}
// TODO: POST /api/v1/sngpc/enviar-lote
// TODO: GET /api/v1/sngpc/lotes
```

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---|---|
| `src/pages/SngpcPage.tsx` | Criar |
| `src/router.tsx` | Adicionar rota `/sngpc` |
| `CLAUDE.md` | Adicionar `/sngpc` na tabela |
| `PLANNING.md` | Marcar ✅ |
| `backend/CLAUDE.md` | Marcar SngpcPage ✅ |

## Verificação

- [ ] Quality gate passa (biome + tsc + vite)
- [ ] Checkbox seleciona/deseleciona linhas corretamente
- [ ] "Conferir selecionados" muda status de pendente → conferido
- [ ] "Enviar lote" só ativo quando há conferidos selecionados
- [ ] Modal abre ao clicar em ↗, fecha overlay ao clicar fora
- [ ] Card de protocolo aparece após envio
- [ ] Demo switcher ANVISA muda chip corretamente
