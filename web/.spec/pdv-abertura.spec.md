---
modulo: pdv-abertura
rota: /pdv/abertura-caixa
pagina: AberturaCaixaPage
status: ✅ Implementado (2026-05-10)
schema: src/schemas/caixa.ts
layout: dois-paineis-laterais
referencia: —
---

# Abertura de Caixa — Spec

## Propósito
Formulário de abertura de turno. Operador seleciona o caixa, confirma operador/data/hora (somente leitura) e informa o fundo de troco.

## Layout — Dois painéis laterais (sem AppLayout interno)

```
┌────────────────────────────┬──────────────────────┐
│  Formulário (w-120)        │  Status dos caixas   │
│                            │  (w-92)              │
│  Logo $ icon               │                      │
│  Select: Caixa             │  CaixaCard 1         │
│  Operador (readonly)       │  (Caixa 02 · Aberto) │
│  Data/Hora (readonly)      │                      │
│  Fundo de troco (input)    │  CaixaCard 2         │
│  [Abrir caixa]             │  (Caixa 01 · Fechado)│
│  Ver histórico             │                      │
└────────────────────────────┴──────────────────────┘
```

Sem `rounded-3xl` global — formulário com `rounded-[24px]`.

## Schema
`src/schemas/caixa.ts` — `AberturaCaixaSchema` (`fundo_troco`, `observacao?`)

## Mock Data

```ts
const CAIXAS = [
  { id: 'caixa02', label: 'Caixa 02 · Aberto · Ana', status: 'aberto' },
  { id: 'caixa01', label: 'Caixa 01 · Fechado', status: 'fechado' },
]
```

Data/hora: `new Date()` formatada em tempo real.
Operador: estático "João Silva" (virá da sessão autenticada).

## Estado

```ts
const [caixa, setCaixa] = useState('caixa01')
const [fundo, setFundo] = useState('0,00')
```

## Componentes UI Utilizados
`<SelectRoot>`, `<SelectTrigger>`, `<SelectList>`, `<SelectItem>`, `<Button>`

## Sub-componentes Internos

```tsx
function FormField({ label, children })         — wrapper label + campo
function ReadOnlyField({ value })               — campo somente leitura bg-[#F2F4F2]
function CaixaCard({ label, sub, status, ... }) — card selecionável (só caixas fechados)
```

## Fluxo Principal

1. Operador seleciona caixa **fechado** (caixas abertos são não-clicáveis)
2. Informa fundo de troco em R$
3. `handleAbrir(e)` → `e.preventDefault()` → TODO: POST /api/v1/pdv/abrir-caixa
4. `navigate('/pdv?caixaAberto=true')`

## API Endpoints

```ts
// TODO: GET /api/v1/pdv/caixas — lista caixas e status atual
// TODO: POST /api/v1/pdv/abrir-caixa { caixa_id, operador_id, fundo_troco } → turno_id
```

## Verificação

- [ ] Campo fundo de troco tem `id="fundo-troco"` e `<label htmlFor>`
- [ ] `inputMode="decimal"` no campo de valor
- [ ] `onFocus` seleciona conteúdo do campo para substituição rápida
- [ ] CaixaCard com `status="aberto"` é `disabled` (não clicável)
- [ ] Navegação correta para `/pdv?caixaAberto=true`
