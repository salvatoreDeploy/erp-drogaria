---
modulo: cadastro-clientes
rota: /cadastros/clientes
pagina: CadastroClientesPage
status: ✅ Implementado (2026-05-10)
schema: src/schemas/cliente.ts
layout: duas-colunas
referencia: CadastroFornecedoresPage.tsx (padrão Lista + Modal)
---

# Cadastro de Clientes — Spec

## Propósito
CRUD de clientes com painel de edição inline na coluna direita (sem modal separado para criação/edição). Inclui histórico de atendimentos PBM e receitas. Perfis: `operador_caixa`, `farmaceutico`, `admin`.

## Layout — Duas colunas (lista + painel direito)

```
┌────────────────────────────────┬──────────────────────┐
│ Coluna esquerda (flex-1)       │ Painel direito (w-90)│
│ ─────────────────────────────  │ ─────────────────────│
│ Header: métricas (5) via useMemo│ Card form:           │
│ Alerta aniversariantes         │ Dados pessoais       │
│ Busca + filtro convênio        │ Endereço             │
│ Header tabela: bg-[#F5F8F6]   │ Saúde / convênio     │
│ Linhas: avatar iniciais +      │ Comunicação          │
│   Nome | CPF | Telefone |      │ (toggles WhatsApp,   │
│   Convênio | Pontos | Status | │  SMS)                │
│   [Editar] [Histórico]         │ [Salvar] [Cancelar]  │
└────────────────────────────────┴──────────────────────┘
```

**Diferença do padrão Lista+Modal:** o formulário fica no painel direito fixo, não em modal. Modal usado apenas para histórico.

## Schema
`src/schemas/cliente.ts` — `ClienteSchema`, `ClienteFormSchema`

## Mock Data

**8 clientes:**
```ts
const CLIENTES_MOCK = [
  { nome: 'Maria Silva',     cpf: '123.456.789-00', convenio: 'Farmácia Popular', pontos: 1240, status: 'ativo'   },
  { nome: 'João Pereira',   cpf: '234.567.890-11', convenio: '—',               pontos: 320,  status: 'ativo'   },
  { nome: 'Ana Rodrigues',  cpf: '345.678.901-22', convenio: 'Unimed',           pontos: 2800, status: 'ativo'   },
  { nome: 'Carlos Mendes',  cpf: '456.789.012-33', convenio: '—',               pontos: 90,   status: 'ativo'   },
  { nome: 'Lucia Ferreira', cpf: '567.890.123-44', convenio: 'Bradesco',         pontos: 570,  status: 'inativo' },
  { nome: 'Paulo Santos',   cpf: '678.901.234-55', convenio: 'Farmácia Popular', pontos: 1100, status: 'ativo'   },
  { nome: 'Sandra Lima',    cpf: '789.012.345-66', convenio: '—',               pontos: 450,  status: 'ativo'   },
  { nome: 'Roberto Costa',  cpf: '890.123.456-77', convenio: 'Unimed',           pontos: 230,  status: 'ativo'   },
]
```

**Aniversariantes (alerta):** 2 clientes com aniversário na semana atual.
**Histórico:** 5 registros por cliente (receitas + PBM).

## Estado

```ts
const [clientes, setClientes] = useState<Cliente[]>(CLIENTES_MOCK)
const [selecionado, setSelecionado] = useState<Cliente | null>(null)
const [form, setForm] = useState<Partial<ClienteForm>>({})
const [busca, setBusca] = useState('')
const [filtroConvenio, setFiltroConvenio] = useState('')
const [historicoOpen, setHistoricoOpen] = useState(false)
const [novoMode, setNovoMode] = useState(false)
```

## Métricas (useMemo)

```ts
const stats = useMemo(() => ({
  total:        clientes.length,
  ativos:       clientes.filter(c => c.status === 'ativo').length,
  comConvenio:  clientes.filter(c => c.convenio !== '—').length,
  pontosEmitidos: clientes.reduce((s, c) => s + c.pontos, 0),
  novosMes:     2,  // mock estático
}), [clientes])
```

## Colunas da Tabela

```
grid-cols-[minmax(0,2.5fr)_120px_120px_120px_80px_80px_130px]
Avatar+Nome | CPF | Telefone | Convênio | Pontos | Status | [Editar][Histórico]
```

**Avatar de iniciais**: `bg-brand-100 text-brand-700`, círculo 36px, 2 letras do nome.

## Painel Direito — Formulário

**4 seções colapsadas:**
1. **Dados pessoais**: nome*, CPF*, data nascimento*, telefone, e-mail
2. **Endereço**: CEP, rua, número, complemento, bairro, cidade, UF
3. **Saúde**: convênio (select), plano, doenças crônicas (textarea)
4. **Comunicação**: toggle aceitar WhatsApp, toggle aceitar SMS

```ts
// Painel direito só aparece quando selecionado !== null ou novoMode === true
// handleSalvar(data, id?) → id presente: PUT; ausente: POST
```

## ModalHistoricoCliente

Tabela read-only: Data | Tipo (Receita/PBM) | Médico/Convênio | Medicamentos | Status.
```ts
// TODO: GET /api/v1/cadastros/clientes/{id}/historico
```

## API Endpoints

```ts
// TODO: GET /api/v1/cadastros/clientes?busca=&convenio=
// TODO: POST /api/v1/cadastros/clientes
// TODO: PUT /api/v1/cadastros/clientes/{id}
// TODO: DELETE /api/v1/cadastros/clientes/{id}
// TODO: GET /api/v1/cadastros/clientes/{id}/historico
// TODO: GET /api/v1/cadastros/clientes/aniversariantes-semana
```

## Verificação

- [ ] Clicar em linha → preenche painel direito com dados do cliente
- [ ] [+ Novo Cliente] → limpa painel direito para entrada em branco
- [ ] Toggle WhatsApp/SMS usa `<Switch>` Base UI (não input checkbox padrão)
- [ ] `handleSalvar` com `id` → PUT; sem `id` → POST
- [ ] Alerta de aniversariantes com bg-warning-25 border-warning-100
- [ ] Avatar de iniciais extrai 2 letras do nome
- [ ] Busca por CPF/nome/telefone simultaneamente
