---
modulo: pdv
rota: /pdv
pagina: PdvPage
status: ✅ Implementado (2026-05-10)
schema: src/schemas/pdv.ts
layout: duas-colunas
referencia: —
---

# PDV — Spec

## Propósito
Ponto de venda principal. Gerencia o carrinho de compras, aplica descontos PBM, vincula receitas de controlados e navega para finalização. Ativo apenas com caixa aberto (`?caixaAberto=true`).

## Layout — Duas colunas

```
┌─────────────────────────────────┬────────────────────┐
│ Busca + Carrinho (flex-1)       │ Painel PDV (fixo)  │
│ ───────────────────────────────  │ ─────────────────── │
│ Busca de produto                │ Atendimento        │
│ Banner: PBM autorizado (verde)  │ CPF cliente        │
│ Banner: Receita vinculada (info)│ Campo troco        │
│                                 │ Forma pagamento    │
│ Tabela carrinho:                │                    │
│ Produto | Qty | Preço | PBM |   │ Totais:            │
│ SNGPC | Subtotal | [X]          │ Subtotal           │
│                                 │ Desconto PBM       │
│ ─ Estado: Caixa fechado ─       │ Total              │
│ (tela centralizada + CTA        │                    │
│  → /pdv/abertura-caixa)         │ [Finalizar venda]  │
│                                 │ [Sangria] [Suprim] │
└─────────────────────────────────┴────────────────────┘
```

## Schema
`src/schemas/pdv.ts` — `CartItemSchema`, `SangriaSchema`, `SuprimentoSchema`

## Mock Data

```ts
// Carrinho inicial
type CartItem = {
  id: number; nome: string; qty: number; preco: string; subtotal: string
  controlado: boolean; receita_id: string | null
}

const CART_INICIAL: CartItem[] = [
  { id: 1, nome: 'Dipirona 500mg',  qty: 2, preco: 'R$ 12,90', controlado: false, receita_id: null },
  { id: 2, nome: 'Fralda G 20 un',  qty: 1, preco: 'R$ 44,90', controlado: false, receita_id: null },
  { id: 3, nome: 'Morfina 10mg',    qty: 1, preco: 'R$ 24,90', controlado: true,  receita_id: null },
  { id: 4, nome: 'Vitamina C 1g',   qty: 1, preco: 'R$ 19,90', controlado: false, receita_id: null },
]

const CONVENIOS_PBM = ['Farmácia Popular', 'Aqui Tem Farmácia', 'Unimed', 'SulAmérica', 'Bradesco Saúde']
```

## Config Tables

```ts
// Row background por item (controlado sem receita → warning)
// Status SNGPC por linha
```

## Estado

```ts
type LocState = { pbm_autorizacao_id?: string; receita_id?: string } | null

const [cart, setCart] = useState<CartItem[]>(CART_INICIAL)
const [caixaAberto] = useSearchParams()           // ?caixaAberto=true
const location = useLocation()                    // state.pbm_autorizacao_id / state.receita_id
const [pbmModalItem, setPbmModalItem] = useState<CartItem | null>(null)
const [ctrlModalItem, setCtrlModalItem] = useState<CartItem | null>(null)
const [sangriaOpen, setSangriaOpen] = useState(false)
const [suprimentoOpen, setSuprimentoOpen] = useState(false)
```

## Modais

### ModalPbmInline
Campos: CPF do paciente + select convênio.
Botão "Consultar PBM" (habilitado quando `cpf.length >= 11 && convenio !== ''`).
Após consulta: card `bg-brand-25` com "● Elegível 45%", desconto e autorização.
Botão "Aplicar desconto" → fecha modal.
```ts
// TODO: POST /api/v1/pdv/validar-pbm-inline { cpf, convenio, produto_id }
```

### ModalControladoInline
Campos: CPF paciente + N.º receita + CRM médico.
Banner warning Portaria 344 (⚠).
"Vincular receita" → `onVincular(receitaId)` → atualiza `cart` com `receita_id`.
Bloqueia botão "Finalizar venda" enquanto `hasControlledUnlinked`.
```ts
// TODO: GET /api/v1/receita/{id} — validar receita antes de vincular
// TODO: POST /api/v1/sngpc/registrar-dispensacao — efeito colateral após venda
```

### ModalCaixa (Sangria / Suprimento)
Sangria: valor + motivo.
Suprimento: valor + origem.
```ts
// TODO: POST /api/v1/pdv/sangria  { valor, motivo }
// TODO: POST /api/v1/pdv/suprimento { valor, origem }
```

## Banners de Contexto (useLocation state)

```tsx
// PBM vindo de /pbm:
{locState?.pbm_autorizacao_id && (
  <Banner variant="success">PBM autorizado — Autorização #{locState.pbm_autorizacao_id}</Banner>
)}
// Receita vindo de /receita:
{locState?.receita_id && (
  <Banner variant="info">Receita vinculada — #{locState.receita_id}</Banner>
)}
```

## Estado: Caixa Fechado

Quando `?caixaAberto=true` não está na URL → tela centralizada com CTA:
```tsx
// Tela alternativa (sem caixa aberto)
<div className="flex flex-1 items-center justify-center">
  <Button onClick={() => navigate('/pdv/abertura-caixa')}>Abrir caixa</Button>
</div>
```

## Colunas da Tabela (carrinho)

```
grid-cols-[minmax(0,2fr)_48px_90px_56px_70px_90px_36px]
Produto | Qtd | Preço unit. | PBM | SNGPC | Subtotal | [X]
```

Coluna PBM (56px): botão "PBM" → abre `ModalPbmInline` por item.
Coluna SNGPC (70px): badge "● Vincular" (warning) para items `controlado: true` sem `receita_id`.

## API Endpoints

```ts
// TODO: GET /api/v1/pdv/produtos/buscar?q={termo}
// TODO: POST /api/v1/pdv/venda { cart, forma_pagamento, cliente_id? }
// TODO: POST /api/v1/pdv/validar-pbm-inline { cpf, convenio, produto_id }
// TODO: POST /api/v1/pdv/sangria  { valor, motivo }
// TODO: POST /api/v1/pdv/suprimento { valor, origem }
```

## Verificação

- [ ] `?caixaAberto=true` ausente → tela de caixa fechado exibida
- [ ] Item `controlado: true` sem `receita_id` → badge "Vincular" em warning
- [ ] "Finalizar venda" desabilitado enquanto há controlados sem receita
- [ ] Banner PBM verde quando `location.state.pbm_autorizacao_id` presente
- [ ] Banner receita info quando `location.state.receita_id` presente
- [ ] Modal overlay usa `<button type="button">` (não div)
