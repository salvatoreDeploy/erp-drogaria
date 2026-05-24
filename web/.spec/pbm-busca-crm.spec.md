---
modulo: pbm-busca-crm
rota: /pbm  (primário) · /receita (secundário)
pagina: PbmPage · ReceitaPage
status: ⬜ Pendente
schema: src/schemas/pbm.ts
layout: modal-reutilizavel
referencia: PbmPage.tsx · ReceitaPage.tsx
change-refs: [CHANGE-PBM-002]
---

# PBM / Receita — Busca de Médico/CRM (Offline-First)

## Propósito
Modal reutilizável para busca de médico por CRM parcial, nome ou especialidade. Usado em `PbmPage` (campo CRM da Etapa 1) e `ReceitaPage` (campo CRM da receita). Arquitetura offline-first: busca na base local de médicos frequentes e aciona a API do CFM (Conselho Federal de Medicina) apenas quando o resultado não é encontrado localmente.

## Decisão de arquitetura

| Camada | Mecanismo | Quando |
|---|---|---|
| **Base local** | Array em memória (futuro: IndexedDB) | Sempre consultada primeiro |
| **API CFM** | `GET /api/v1/medicos/cfm?q=` (fallback) | Quando busca local retorna vazio |
| **Salvar localmente** | `POST /api/v1/medicos/salvar-local` | Quando usuário seleciona médico via CFM |

**LGPD:** Dados de médico são registros profissionais públicos (CRM é registro público). Não requer consentimento especial para armazenamento local. Dados de paciente (CPF, endereço) **nunca** entram nesta base.

## Layout — Modal (w-[560px])

```
┌──────────────────────────────────────────────────────────────┐
│ "Buscar Médico"                                    [✕]        │
├──────────────────────────────────────────────────────────────┤
│  [🔍 Buscar por CRM, nome ou especialidade...     ]          │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│  ── Resultados locais (N médicos) ──                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Dr. José Antunes  CRM-SP 12345  Clínica Geral  ● Reg.│   │
│  │ Dra. Ana Pereira  CRM-SP 67890  Cardiologia    ● Reg.│   │
│  │ Dr. Paulo Souza   CRM-RJ 44321  Ortopedia      ● Reg.│   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ── Não encontrou? ──────────────────────────────────────    │
│  [Buscar no CFM (online)]                                    │
│                                                              │
│  [Resultados CFM — aparece após busca online]                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Dr. Roberto Lima  CRM-SP 98765  Psiquiatria  ● Ativo │   │
│  └──────────────────────────────────────────────────────┘   │
│  ☐ Salvar na base local para próximas buscas                 │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│       [Cancelar]              [Selecionar médico]            │
└──────────────────────────────────────────────────────────────┘
```

## Schema
`src/schemas/pbm.ts` — adicionar:

```ts
export const SituacaoMedicoSchema = z.enum(['regular', 'irregular', 'cancelado', 'desconhecido'])

export const MedicoLocalSchema = z.object({
  id:            z.string().uuid(),
  crm:           z.string().min(3),       // ex: "CRM-SP 12345" ou "12345"
  nome:          z.string().min(3),
  uf:            z.string().length(2),
  especialidade: z.string(),
  situacao:      SituacaoMedicoSchema,
  fonte:         z.enum(['local', 'cfm']),
  atualizado_em: z.string(),
})

export const BuscaCrmFiltroSchema = z.object({
  query:    z.string().min(2, 'Mínimo 2 caracteres para buscar'),
  salvar_local: z.boolean().optional(),
})

export type MedicoLocal     = z.infer<typeof MedicoLocalSchema>
export type SituacaoMedico  = z.infer<typeof SituacaoMedicoSchema>
```

## Mock Data

```ts
// Base local (médicos frequentes da farmácia)
const MEDICOS_LOCAL_MOCK: MedicoLocal[] = [
  { id: 'm001', crm: 'CRM-SP 12345', nome: 'Dr. José Antunes Filho',   uf: 'SP', especialidade: 'Clínica Geral',        situacao: 'regular',    fonte: 'local', atualizado_em: '2026-05-01' },
  { id: 'm002', crm: 'CRM-SP 67890', nome: 'Dra. Ana Beatriz Pereira', uf: 'SP', especialidade: 'Cardiologia',          situacao: 'regular',    fonte: 'local', atualizado_em: '2026-04-15' },
  { id: 'm003', crm: 'CRM-RJ 44321', nome: 'Dr. Paulo Souza',          uf: 'RJ', especialidade: 'Ortopedia',            situacao: 'regular',    fonte: 'local', atualizado_em: '2026-03-20' },
  { id: 'm004', crm: 'CRM-SP 22987', nome: 'Dra. Camila Torres',       uf: 'SP', especialidade: 'Endocrinologia',       situacao: 'regular',    fonte: 'cfm',   atualizado_em: '2026-05-10' },
  { id: 'm005', crm: 'CRM-MG 55102', nome: 'Dr. Fernando Ramos',       uf: 'MG', especialidade: 'Psiquiatria',          situacao: 'regular',    fonte: 'local', atualizado_em: '2026-02-28' },
  { id: 'm006', crm: 'CRM-SP 11432', nome: 'Dr. Ricardo Almeida',      uf: 'SP', especialidade: 'Neurologia',           situacao: 'irregular',  fonte: 'local', atualizado_em: '2026-01-15' },
  { id: 'm007', crm: 'CRM-SP 78965', nome: 'Dra. Lucia Mendes',        uf: 'SP', especialidade: 'Ginecologia',          situacao: 'regular',    fonte: 'local', atualizado_em: '2026-04-02' },
  { id: 'm008', crm: 'CRM-PR 34567', nome: 'Dr. Marcos Oliveira',      uf: 'PR', especialidade: 'Clínica Geral',        situacao: 'regular',    fonte: 'cfm',   atualizado_em: '2026-05-18' },
  { id: 'm009', crm: 'CRM-SP 90123', nome: 'Dra. Sofia Costa',         uf: 'SP', especialidade: 'Reumatologia',         situacao: 'regular',    fonte: 'local', atualizado_em: '2026-03-05' },
  { id: 'm010', crm: 'CRM-SP 45678', nome: 'Dr. André Barbosa',        uf: 'SP', especialidade: 'Pneumologia',          situacao: 'cancelado',  fonte: 'local', atualizado_em: '2026-01-01' },
]

// Resultado simulado da API CFM (quando busca online)
const CFM_RESULTADO_MOCK: MedicoLocal[] = [
  { id: 'cfm001', crm: 'CRM-SP 98765', nome: 'Dr. Roberto Lima',   uf: 'SP', especialidade: 'Psiquiatria',   situacao: 'regular', fonte: 'cfm', atualizado_em: '2026-05-20' },
  { id: 'cfm002', crm: 'CRM-SP 87654', nome: 'Dra. Clara Matos',   uf: 'SP', especialidade: 'Neurologia',    situacao: 'regular', fonte: 'cfm', atualizado_em: '2026-05-20' },
]
```

## Config Tables

```ts
// Badge de situação do médico
const SITUACAO_CFG: Record<SituacaoMedico, { label: string; bg: string; text: string }> = {
  regular:      { label: '● Regular',     bg: 'bg-brand-75',   text: 'text-success-600'  },
  irregular:    { label: '⚠ Irregular',   bg: 'bg-warning-50', text: 'text-warning-800'  },
  cancelado:    { label: '✗ Cancelado',   bg: 'bg-danger-50',  text: 'text-danger-700'   },
  desconhecido: { label: '? Desconhecido',bg: 'bg-neutral-50', text: 'text-neutral-500'  },
}

// Cor do nome por situação — aviso visual para irregular/cancelado
const NOME_CLS: Record<SituacaoMedico, string> = {
  regular:      'text-brand-950',
  irregular:    'text-warning-800 font-semibold',
  cancelado:    'text-danger-700 line-through',
  desconhecido: 'text-text-secondary',
}
```

## Estado interno do modal

```ts
type BuscaFase = 'idle' | 'buscando_local' | 'resultado_local' | 'buscando_cfm' | 'resultado_cfm' | 'nenhum'

// Estado local do ModalBuscaCrm
const [query, setQuery]                   = useState('')
const [fase, setFase]                     = useState<BuscaFase>('idle')
const [resultadoLocal, setResultadoLocal] = useState<MedicoLocal[]>([])
const [resultadoCfm, setResultadoCfm]     = useState<MedicoLocal[]>([])
const [selecionado, setSelecionado]       = useState<MedicoLocal | null>(null)
const [salvarLocal, setSalvarLocal]       = useState(true)
const [buscandoCfm, setBuscandoCfm]       = useState(false)
```

## Busca local (debounce)

```ts
useEffect(() => {
  if (query.length < 2) {
    setResultadoLocal([])
    setFase('idle')
    return
  }
  const t = setTimeout(() => {
    const q = query.toLowerCase()
    const local = MEDICOS_LOCAL_MOCK.filter((m) =>
      m.nome.toLowerCase().includes(q) ||
      m.crm.toLowerCase().includes(q) ||
      m.especialidade.toLowerCase().includes(q)
    )
    setResultadoLocal(local)
    setFase(local.length > 0 ? 'resultado_local' : 'nenhum')
  }, 300)
  return () => clearTimeout(t)
}, [query])
```

## Busca CFM (fallback)

```ts
const handleBuscarCfm = async () => {
  if (query.length < 2) return
  setBuscandoCfm(true)
  setFase('buscando_cfm')
  try {
    // TODO: integrar com API — GET /api/v1/medicos/cfm?q={query}
    await new Promise((r) => setTimeout(r, 1200))
    setResultadoCfm(CFM_RESULTADO_MOCK)
    setFase('resultado_cfm')
  } catch {
    setFase('nenhum')
  } finally {
    setBuscandoCfm(false)
  }
}
```

## Confirmar seleção

```ts
const handleSelecionar = async () => {
  if (!selecionado) return

  // Se médico veio do CFM e usuário quer salvar localmente
  if (selecionado.fonte === 'cfm' && salvarLocal) {
    // TODO: integrar com API — POST /api/v1/medicos/salvar-local { medico }
    // (fire-and-forget — não bloqueia o fluxo)
  }

  onSelect(selecionado)  // passa CRM para o campo pai
  onClose()
}
```

## Integração nas páginas

### PbmPage — Campo CRM na Etapa 1

```tsx
// Ao lado do input de CRM:
<div className="flex items-center gap-2">
  <div className="flex flex-col gap-1.5 flex-1 rounded-[18px] border border-input-border bg-input-bg p-4">
    <label htmlFor="crm-input" className="font-bold text-[12px] text-input-label">CRM do médico</label>
    <input id="crm-input" value={crm} onChange={(e) => setCrm(e.target.value)}
      className="bg-transparent text-[14px] text-brand-950 outline-none" />
  </div>
  <button type="button" onClick={() => setBuscaCrmOpen(true)}
    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px]
               border border-brand-200 bg-white text-[16px] hover:bg-brand-50"
    title="Buscar médico">
    🔍
  </button>
</div>

{buscaCrmOpen && (
  <ModalBuscaCrm
    onClose={() => setBuscaCrmOpen(false)}
    onSelect={(medico) => { setCrm(medico.crm); setBuscaCrmOpen(false) }}
  />
)}
```

### ReceitaPage — Campo CRM da receita

Mesma integração — o modal é idêntico, apenas o `onSelect` atualiza o campo CRM da receita em vez do PBM.

## API Endpoints

```ts
// TODO: integrar com API — GET /api/v1/medicos/buscar?q={termo}
//   → MedicoLocal[] (base local do backend, sincronizada entre sessões)

// TODO: integrar com API — GET /api/v1/medicos/cfm?q={termo}
//   → MedicoLocal[] (proxy para a API CFM — validar SLA antes de ativar)

// TODO: integrar com API — POST /api/v1/medicos/salvar-local { medico: MedicoLocal }
//   → { id } (fire-and-forget — falha não bloqueia o fluxo)
```

## Nota sobre a API CFM

A API oficial do CFM (`https://portal.cfm.org.br/api/`) tem SLA imprevisível e não é garantida para uso em produção. Antes de ativar a busca online:
1. Validar disponibilidade e formato de resposta em ambiente de homologação
2. Implementar timeout de 5s + fallback gracioso (mensagem "CFM indisponível, tente mais tarde")
3. Considerar cache no backend com TTL de 24h para reduzir chamadas ao CFM

## Verificação

- [ ] Modal abre ao clicar no ícone 🔍 ao lado do campo CRM em PbmPage e ReceitaPage
- [ ] Busca local inicia com ≥ 2 caracteres (debounce 300ms)
- [ ] Busca por CRM parcial (`"12345"` encontra `"CRM-SP 12345"`)
- [ ] Busca por nome parcial (`"ana"` encontra `"Ana Beatriz Pereira"`)
- [ ] Busca por especialidade (`"cardio"` encontra `"Cardiologia"`)
- [ ] Médico com `situacao: 'cancelado'` exibe nome tachado e badge danger
- [ ] Médico com `situacao: 'irregular'` exibe aviso warning
- [ ] Botão "Buscar no CFM" aparece quando busca local retorna vazio
- [ ] Loading state no botão CFM durante `buscandoCfm`
- [ ] Checkbox "Salvar localmente" visível quando médico selecionado veio do CFM
- [ ] `onSelect(medico)` preenche o campo CRM do pai e fecha o modal
- [ ] Botão "Selecionar médico" desabilitado enquanto `selecionado === null`
