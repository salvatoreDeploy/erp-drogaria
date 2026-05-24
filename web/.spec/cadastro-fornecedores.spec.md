---
modulo: cadastro-fornecedores
rota: /cadastros/fornecedores
pagina: CadastroFornecedoresPage
status: ✅ Implementado (2026-05-10)
schema: src/schemas/fornecedor.ts
layout: coluna-unica
referencia: CadastroProdutosPage.tsx (padrão Lista + Modal)
---

# Cadastro de Fornecedores — Spec

## Propósito
CRUD de fornecedores com controle de condições comerciais, alertas fiscais e histórico de pedidos. Perfis: `farmaceutico`, `admin`.

## Layout — Coluna única (Lista + Modal)

```
┌──────────────────────────────────────────────────────┐
│ Header card: "Fornecedores" + [+ Novo Fornecedor]    │
├──────────────────────────────────────────────────────┤
│ Grid 5 Métricas: Ativos / CNPJ pendente / Prazo resp.│
│                  Pedidos recentes / Histórico fiscal  │
├──────────────────────────────────────────────────────┤
│ Banner fiscal (bg-warning-25 border-warning-100):    │
│ "⚠ CNPJ irregular · ⚠ Sem contrato · ⚠ Prazo vencido"│
├──────────────────────────────────────────────────────┤
│ Busca (razão social, CNPJ, cidade)                   │
├──────────────────────────────────────────────────────┤
│ Tabela (overflow-y-auto):                            │
│ Fornecedor | Cidade | Tipo | Forma Pagto | Entrega | │
│ Status | [Editar] [Pedidos]                          │
└──────────────────────────────────────────────────────┘
```

## Schema
`src/schemas/fornecedor.ts` — `FornecedorSchema`, `FornecedorFormSchema`, `TipoFornecedor`

## Mock Data

**7 fornecedores:**
```ts
const FORNECEDORES_MOCK = [
  { nome: 'Plasma Sul Distribução',  cidade: 'São Paulo',    tipo: 'distribuidor',  forma_pagto: 'Boleto 30d',  entrega_dias: 3,  status: 'ativo'   },
  { nome: 'Medley Farmacêutica',     cidade: 'Campinas',     tipo: 'fabricante',   forma_pagto: 'Boleto 60d',  entrega_dias: 7,  status: 'ativo'   },
  { nome: 'EMS S/A',                 cidade: 'Hortolândia',  tipo: 'fabricante',   forma_pagto: 'Boleto 45d',  entrega_dias: 5,  status: 'ativo'   },
  { nome: 'Cristália Farmacêutica',  cidade: 'Itapira',      tipo: 'fabricante',   forma_pagto: 'Antecipado',  entrega_dias: 10, status: 'ativo'   },
  { nome: 'Profarma Distribuidora',  cidade: 'Rio de Janeiro',tipo: 'distribuidor', forma_pagto: 'Boleto 30d',  entrega_dias: 2,  status: 'ativo'   },
  { nome: 'FarmaSul Representações', cidade: 'Porto Alegre', tipo: 'representante',forma_pagto: 'Boleto 60d',  entrega_dias: 8,  status: 'inativo' },
  { nome: 'BioFarma Manipulação',    cidade: 'Curitiba',     tipo: 'fabricante',   forma_pagto: 'PIX à vista', entrega_dias: 15, status: 'ativo'   },
]
```

## Config Tables

```ts
const TIPO_CFG: Record<TipoFornecedor, { label, bg, text }> = {
  fabricante:   { label: 'Fabricante',   bg: 'bg-info-50',    text: 'text-info-700'    },
  distribuidor: { label: 'Distribuidor', bg: 'bg-brand-75',   text: 'text-brand-750'   },
  representante:{ label: 'Representante',bg: 'bg-warning-50', text: 'text-warning-700' },
}
```

## Estado

```ts
const [fornecedores, setFornecedores] = useState<Fornecedor[]>(FORNECEDORES_MOCK)
const [novoOpen, setNovoOpen] = useState(false)
const [editando, setEditando] = useState<Fornecedor | null>(null)
const [pedidosOpen, setPedidosOpen] = useState<Fornecedor | null>(null)
const [busca, setBusca] = useState('')
```

## Métricas (useMemo)

```ts
const stats = useMemo(() => ({
  ativos:         fornecedores.filter(f => f.status === 'ativo').length,
  cnpjPendente:   2,   // mock estático
  prazoMedioResp: 4,   // dias médios
  pedidosRecentes:12,  // mock estático
  semContratoAtivo: 1, // mock estático
}), [fornecedores])
```

## Colunas da Tabela

```
grid-cols-[minmax(0,2fr)_100px_100px_120px_80px_80px_130px]
Fornecedor | Cidade | Tipo | Forma Pagto | Entrega (dias) | Status | [Editar][Pedidos]
```

## ModalFornecedorForm — CRUD

**4 seções com grid 2 colunas:**
1. **Dados da empresa**: razão social*, nome fantasia, CNPJ*, IE, tipo*
2. **Contato**: responsável, telefone, e-mail, site
3. **Endereço**: CEP, rua, número, complemento, bairro, cidade*, UF*
4. **Condições comerciais**: forma pagamento*, prazo entrega (dias)*, prazo pagamento, desconto padrão %, observações

Total: **22 campos**.

```ts
// Validação via FornecedorFormSchema.safeParse()
// handleSalvar(data, id?) → id presente: PUT; ausente: POST
```

## ModalPedidosFornecedor

Tabela read-only: Data | Nº Pedido | Valor | Prazo entrega | Status.
```ts
// TODO: GET /api/v1/cadastros/fornecedores/{id}/pedidos
```

## API Endpoints

```ts
// TODO: GET /api/v1/cadastros/fornecedores?busca=
// TODO: POST /api/v1/cadastros/fornecedores
// TODO: PUT /api/v1/cadastros/fornecedores/{id}
// TODO: DELETE /api/v1/cadastros/fornecedores/{id}
// TODO: GET /api/v1/cadastros/fornecedores/{id}/pedidos
```

## Verificação

- [ ] Banner fiscal aparece com alertas mock (bg-warning-25)
- [ ] Badge de tipo usa `TIPO_CFG` lookup — zero ifs inline no JSX
- [ ] Busca filtra por razão social, CNPJ e cidade
- [ ] `novoOpen` e `editando` separados (nunca `'novo' | null | Fornecedor`)
- [ ] Modal de pedidos é somente leitura (sem campos editáveis)
- [ ] Soft delete via campo `status` no modal (não button separado)
