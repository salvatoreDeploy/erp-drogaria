---
modulo: pdv-finalizar
rota: /pdv/finalizar
pagina: FinalizarVendaPage
status: ✅ Implementado (2026-05-10)
schema: —
layout: duas-colunas
referencia: —
---

# Finalizar Venda — Spec

## Propósito
Tela de checkout: exibe o resumo dos itens com desconto PBM e permite selecionar a forma de pagamento para confirmar a venda.

## Layout — Duas colunas

```
┌───────────────────────────────────────────────────┐
│ Header: "Finalizar venda" + chips Venda/Caixa      │
├───────────────────────────────┬───────────────────┤
│  Resumo da venda (flex-1)     │  Pagamento (w-460) │
│  ─────────────────────────── │  ────────────────── │
│  Tabela itens:               │  Tabs: Dinheiro /  │
│  Produto | Qtd | Preço | Tot │  Débito / Pix /    │
│  ─────────────────────────── │  Múltiplos         │
│  Subtotal                     │  ─────────────────  │
│  Desconto PBM                │  Conteúdo por tab  │
│  Desconto manual             │  (dinheiro: campo  │
│  TOTAL (24px brand-700)      │   recebido + troco) │
│                               │  [Confirmar]       │
│                               │  Link: Cancelar    │
│                               │  Card cliente      │
│                               │  Chips de status   │
└───────────────────────────────┴───────────────────┘
```

## Mock Data

```ts
const SUBTOTAL = 50.90
const DESCONTO_PBM = 8.14
const TOTAL = SUBTOTAL - DESCONTO_PBM  // 42.76

const ITEMS = [
  { produto: 'Dipirona 500mg', qty: 2, preco: 'R$ 8,90',  total: 'R$ 17,80' },
  { produto: 'Omeprazol 20mg', qty: 1, preco: 'R$ 12,40', total: 'R$ 12,40' },
  { produto: 'Vitamina D3',    qty: 3, preco: 'R$ 6,90',  total: 'R$ 20,70' },
]

type PaymentTab = 'dinheiro' | 'debito' | 'pix' | 'multiplos'
```

## Estado

```ts
const [tab, setTab] = useState<PaymentTab>('dinheiro')
const [recebido, setRecebido] = useState('50,00')
// derivados:
const troco = parseBRL(recebido) - TOTAL
const trocoValido = troco >= 0
```

## Chips de Status (rodapé)

```tsx
<StatusChip label="● TEF conectado" active />
<StatusChip label="● NFC-e pronta" active />
<StatusChip label="● Não controlado" />
```

Variante `active`: `bg-brand-75 text-brand-750`; inativa: `bg-neutral-50 text-neutral-500`.

## Fluxo Principal

1. Padrão: aba "Dinheiro" com campo valor recebido e troco calculado
2. Troco negativo → botão desabilitado + texto `text-danger-500`
3. `handleConfirmar()` → TODO: POST /api/v1/pdv/venda → `navigate('/pdv?caixaAberto=true')`
4. "Cancelar venda" → `<Link to="/pdv?caixaAberto=true">`

## API Endpoints

```ts
// TODO: POST /api/v1/pdv/venda { itens, forma_pagamento, valor_recebido, cliente_id? } → nfce_chave
// TODO: GET /api/v1/pdv/venda/{id} — consultar venda finalizada
```

## Verificação

- [ ] Botão "Confirmar" desabilitado quando `!trocoValido` e tab é "dinheiro"
- [ ] Tabs de pagamento alternam corretamente (border-b-2 no tab ativo)
- [ ] Desconto PBM exibido com classe `text-brand-500`
- [ ] TOTAL em `font-bold text-[24px] text-brand-700`
- [ ] `<Link>` para cancelar (não button) — navega sem JS
