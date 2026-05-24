---
modulo: entrada-nfe
rota: /fiscal/entrada-nfe
pagina: EntradaNfePage
status: ✅ Implementado (2026-05-10)
schema: src/schemas/nfe.ts
layout: wizard-3-etapas
referencia: PbmPage.tsx (padrão wizard)
---

# Entrada NF-e — Spec

## Propósito
Wizard de 3 etapas para recepção de nota fiscal de entrada. Integra identificação, conferência de itens/lotes e confirmação de entrada no estoque + geração de contas a pagar.

## Layout — Wizard 3 etapas

```
┌────────────────────────────────────────────────────┐
│ Header: título + badge progresso (N/3) + chip etapa│
│         + botão Voltar (quando step > 1)            │
├────────────────────────────────────────────────────┤
│                                                    │
│  [Etapa 1]  Identificação da nota                  │
│             Chave de acesso + dados do fornecedor   │
│             Gerar contas a pagar? (toggle)          │
│                                                    │
│  [Etapa 2]  Itens e lotes                           │
│             Tabela editável: Qtd Recebida + Lote   │
│             + Validade. Items no_catalog → CelulaBusca│
│                                                    │
│  [Etapa 3]  Conferência e entrada                  │
│             Demo switcher: revisao/bloqueado/sucesso│
│             Checklist validação + botão Confirmar  │
└────────────────────────────────────────────────────┘
```

## Schema
`src/schemas/nfe.ts` — `EntradaNfeStep1Schema`, `NfeItemSchema`, `ConferenceStatusSchema`

## Mock Data

**Dados da nota:**
```ts
const NFE_INFO = {
  fornecedor: 'Plasma Sul Distribução',
  numeroNota: '125.001 - 3041',
  cnpj: '12.345.678/0001-99',
  valorTotal: 12466.88,
  valorFinal: 12480.90,
  protocolo: 'EN-2026-004812',
}
```

**Itens (5 produtos, inclui 1 `noCatalog: true` e 1 `margemBaixa: true`):**
```ts
const ITENS_INICIAIS: NfeItem[] = [
  { seq: 1, produto: 'Dipirona 500mg',   qtdFat: 100, qtdRec: 100, lote: 'L2024A', validade: '12/2026', noCatalog: false },
  { seq: 2, produto: 'Omeprazol 20mg',   qtdFat: 50,  qtdRec: 50,  lote: 'L2024B', validade: '06/2026', noCatalog: false },
  { seq: 3, produto: 'Vitamina D3',       qtdFat: 200, qtdRec: 200, lote: 'L2024C', validade: '03/2027', noCatalog: false, margemBaixa: true },
  { seq: 4, produto: '7894561200987',     qtdFat: 30,  qtdRec: 30,  lote: '',       validade: '',        noCatalog: true  },
  { seq: 5, produto: 'Losartana 50mg',    qtdFat: 80,  qtdRec: 0,   lote: 'L2024E', validade: '09/2026', noCatalog: false },
]
```

## Config Tables

```ts
const STEP_CFG: Record<Step, { titulo, progresso, etapa }> = {
  1: { titulo: '...', progresso: 'Fluxo guiado (1/3)', etapa: 'Etapa 1 · Identificação'     },
  2: { titulo: '...', progresso: 'Fluxo guiado (2/3)', etapa: 'Etapa 2 · Itens e lotes'     },
  3: { titulo: '...', progresso: 'Fluxo guiado (3/3)', etapa: 'Etapa 3 · Conferência'        },
}

type ConferenceStatus = 'revisao' | 'bloqueado' | 'sucesso'
const STATUS_CFG: Record<ConferenceStatus, { ...badge e card colors... }> = { ... }
```

## Estado

```ts
const [step, setStep] = useState<Step>(1)
const [form1, setForm1] = useState<FormStep1>({ chaveAcesso: '', fornecedor: 'Plasma Sul Distribução', ... gerarContas: true })
const [itens, setItens] = useState<NfeItem[]>(ITENS_INICIAIS)
const [conferenceStatus, setConferenceStatus] = useState<ConferenceStatus>('revisao')
```

## Etapa 1 — Identificação

Campos (via `ReadonlyField` para dados do XML + editáveis para complementos):
- Chave de acesso (44 dígitos) — valida via `EntradaNfeStep1Schema`
- Fornecedor (readonly após parse da NF-e)
- Data de entrada, CNPJ, Filial, Tipo total (bruto/líquido), Condição pagto, Natureza
- Toggle "Gerar contas a pagar" — `gerarContas: boolean` (default `true`)

## Etapa 2 — Itens e Lotes

**Tabela editável:**
```
grid-cols-[40px_minmax(0,2fr)_60px_80px_80px_100px_80px_100px]
Seq | Produto/Código | NCM | IPI | Qtd Fat. | Qtd Rec.* | Lote* | Validade*
* campos editáveis
```

**CelulaBusca** (items `noCatalog: true`):
- Input com debounce ≥ 2 chars → filtra `CATALOGO_MOCK`
- Dropdown `onMouseDown` (não onClick — evita blur)
- Badge "Vinculado" + produto_id após seleção
```ts
// TODO: GET /api/v1/produtos/buscar?q={termo}
```

**Badge margemBaixa**: `bg-warning-50 text-warning-700` na linha do produto.

## Etapa 3 — Conferência

**Demo switcher** (pills tiny): `revisao` / `bloqueado` / `sucesso`

```ts
const STATUS_CFG = {
  revisao:  { footerText: 'Atualizações automáticas após confirmação.', footerCls: 'text-text-secondary' },
  bloqueado:{ footerText: 'Pendências fiscais críticas.',               footerCls: 'text-danger-700 font-semibold' },
  sucesso:  { footerText: 'Estoque e financeiro atualizados.',          footerCls: 'text-brand-700 font-semibold' },
}
```

Checklist (`CheckLine` com variantes `ok/warning/critical`):
- `✓ Chave de acesso válida` (ok)
- `✓ N itens com lotes preenchidos` (ok ou warning)
- `⚠ Margem abaixo do mínimo em X itens` (warning se `margemBaixa`)
- `✗ Divergência crítica: itens sem catálogo` (critical se ainda houver `noCatalog`)

Botão "Confirmar entrada" → `bloqueado` quando `temBloqueio`, `sucesso` após confirmação.

## API Endpoints

```ts
// TODO: GET /api/v1/fiscal/nfe/{chave} — buscar dados do XML
// TODO: GET /api/v1/fiscal/nfe/{chave}/itens — itens com preços
// TODO: GET /api/v1/produtos/buscar?q={termo} — catálogo para CelulaBusca
// TODO: POST /api/v1/fiscal/nfe/entrada-confirmar { chave, itens, gerar_contas } → protocolo
```

## Verificação

- [ ] Wizard avança e volta corretamente (Step 1 → 2 → 3)
- [ ] Botão "Voltar" aparece apenas a partir do step 2
- [ ] CelulaBusca: dropdown abre com ≥ 2 chars e fecha com `onMouseDown`
- [ ] Badge "Vinculado" aparece após selecionar produto do catálogo
- [ ] Demo switcher de conferência muda estado corretamente
- [ ] Botão "Confirmar entrada" desabilitado no estado `bloqueado`
- [ ] Toggle `gerarContas` persiste ao navegar entre etapas
