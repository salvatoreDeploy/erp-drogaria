---
modulo: cadastro-produtos
rota: /cadastros/produtos
pagina: CadastroProdutosPage
status: ✅ Implementado (2026-05-10)
schema: src/schemas/produto.ts
layout: coluna-unica
referencia: CadastroFornecedoresPage.tsx (padrão Lista + Modal)
---

# Cadastro de Produtos — Spec

## Propósito
CRUD completo de produtos do catálogo farmacêutico. Inclui importação em massa via CSV. Perfis: `farmaceutico`, `admin`.

## Layout — Coluna única (Lista + Modal)

```
┌──────────────────────────────────────────────────────┐
│ Header card: "Produtos" + subtítulo + [+ Novo Produto]│
├──────────────────────────────────────────────────────┤
│ Grid 5 Métricas: Total / Ativos / Controlados /       │
│                  PBM-elegíveis / Novos este mês       │
├──────────────────────────────────────────────────────┤
│ Barra de ações:                                      │
│ Busca (nome/EAN/fabricante) + filtro categoria +     │
│ toggle "Controlados" + [Importar CSV]                │
├──────────────────────────────────────────────────────┤
│ Header colunas: bg-[#F5F8F6]                          │
│ Tabela (overflow-y-auto):                            │
│ Nome+EAN | EAN | Categoria | Preço venda | Est. mín. │
│ Controlado | Status | Ações                          │
└──────────────────────────────────────────────────────┘
```

## Schema
`src/schemas/produto.ts` — `ProdutoSchema`, `ProdutoFormSchema`, `ProdutoStatus`

Validação: `ProdutoFormSchema.safeParse()` no `ModalProduto.handleSave()`.
Regra: `controlado: true` → DCB obrigatório (`.refine()`).

## Mock Data

**12 produtos** cobrindo todas as categorias:
- Losartana 50mg (cardiovascular, ativo, PBM)
- Dipirona 500mg (analgésico, ativo)
- Morfina 10mg (controlado, Portaria 344, requer receita)
- Omeprazol 20mg (gastrointestinal, ativo)
- Amoxicilina 500mg (antibiótico, ativo)
- Vitamina D3 (vitamina, ativo, PBM)
- Alprazolam 0.5mg (psiquiátrico, controlado)
- Colesterol Total Test (outro, ativo)
- Seringa 10ml (material, ativo)
- Losartana+Hidroclorotiazida (cardiovascular, ativo)
- Ibuprofeno 600mg (anti-inflamatório, ativo)
- Metformina 850mg (cardiovascular, inativo)

## Config Tables

```ts
// Badge de categoria (via Badge component com variant)
// Toggle de status: ● ativo / ○ inativo
```

## Estado

```ts
const [produtos, setProdutos] = useState<Produto[]>(PRODUTOS_MOCK)
const [novoOpen, setNovoOpen] = useState(false)
const [editando, setEditando] = useState<Produto | null>(null)
const [importCsvOpen, setImportCsvOpen] = useState(false)
const [busca, setBusca] = useState('')
const [filtroCategoria, setFiltroCategoria] = useState('')
const [soControlados, setSoControlados] = useState(false)
```

## Métricas (useMemo)

```ts
const stats = useMemo(() => ({
  total:        produtos.length,
  ativos:       produtos.filter(p => p.status === 'ativo').length,
  controlados:  produtos.filter(p => p.controlado).length,
  pbmElegiveis: produtos.filter(p => p.pbm_elegivel).length,
  novosMes:     3,  // mock estático
}), [produtos])
```

## Colunas da Tabela

```
grid-cols-[minmax(0,2.5fr)_120px_110px_100px_80px_80px_80px_130px]
Nome+EAN | EAN | Categoria | Preço venda | Est. mín. | Controlado | Status | Ações
```

Ações (130px): `[Editar]` + `[Importar]` (para produto selecionado).

## ModalProduto — CRUD

**4 seções:**
1. **Identificação**: nome*, EAN*, DCB (obrigatório se controlado), NCM, RMS, fabricante*
2. **Comercial**: preço custo*, preço venda*, margem mínima*
3. **Estoque**: estoque mínimo*
4. **Classificação**: categoria*, forma farmacêutica*, concentração*

**4 FlagToggles** (Base UI Switch): `controlado`, `portaria_344`, `requer_receita`, `pbm_elegivel`

```ts
function handleSave() {
  const r = ProdutoFormSchema.safeParse(form)
  if (!r.success) { setErrors(r.error.flatten().fieldErrors); return }
  onSalvar({ ...r.data, id: produto?.id ?? crypto.randomUUID() })
}
```

## ModalImportCSV — 2 etapas

**Etapa 1:** drag & drop de arquivo `.csv` + botão "Selecionar arquivo".
**Etapa 2:** preview das primeiras 5 linhas + lista de erros de validação.
Botão "Confirmar importação" → `setProdutos(prev => [...prev, ...importados])`.
```ts
// TODO: POST /api/v1/cadastros/produtos/importar-csv (multipart/form-data)
```

## API Endpoints

```ts
// TODO: GET /api/v1/cadastros/produtos?busca=&categoria=&controlado=
// TODO: POST /api/v1/cadastros/produtos
// TODO: PUT /api/v1/cadastros/produtos/{id}
// TODO: DELETE /api/v1/cadastros/produtos/{id}
// TODO: POST /api/v1/cadastros/produtos/importar-csv
```

## Verificação

- [ ] Busca filtra por nome, EAN e fabricante simultaneamente
- [ ] Toggle "Controlados" filtra somente `controlado: true`
- [ ] `ProdutoFormSchema.safeParse()` exibe erros por campo no modal
- [ ] DCB obrigatório quando `controlado: true` (regra `.refine()` do schema)
- [ ] Modal no modo "novo": campos em branco; modo "editar": pré-preenchido
- [ ] `novoOpen` e `editando` são estados separados (nunca `null | Produto | 'novo'`)
- [ ] ModalImportCSV: etapa 2 exibe preview dos primeiros 5 registros
