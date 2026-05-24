---
modulo: pbm-horus
rota: /pbm
pagina: PbmPage
status: ⬜ Pendente
schema: src/schemas/pbm.ts
layout: extensao-wizard-existente
referencia: PbmPage.tsx
change-refs: [CHANGE-PBM-001]
---

# PBM — Farmácia Popular (HÓRUS)

## Propósito
Extensão ao wizard `/pbm` para o subfluxo do Programa Farmácia Popular (PFP). Quando o operador seleciona convênio "Farmácia Popular" na Etapa 1, o sistema ativa a verificação HÓRUS/DATASUS, exibe o custo ao cliente como R$ 0,00 e gera o registro para ressarcimento pelo Ministério da Saúde. Visibilidade por perfil: operador vê preço ao cliente; gerente/admin vê custo e ressarcimento.

## Contexto regulatório

| Aspecto | Regra |
|---|---|
| **Base legal** | Portaria SCTIE nº 11/2022 + Decreto 5090/2004 |
| **Sistema** | HÓRUS (DATASUS) — transmissão de dispensações |
| **CPF** | Obrigatório — sem CPF válido não há dispensação (RN-11) |
| **Receita** | Obrigatória para medicamentos de prescrição (RN-01) |
| **Limite** | 1 embalagem/mês por produto/CPF (RN-08) |
| **Ressarcimento** | Governo paga à farmácia após aprovação do lote |

## Fluxo dentro do wizard

```
Etapa 1 — Autorização
│
├── Convênio = "Farmácia Popular" ?
│     ↓ SIM
│     ├── Verificar CPF no HÓRUS (mock)
│     │     ├── Beneficiário válido → status_horus = 'aprovado'
│     │     ├── Já dispensou este mês → status_horus = 'limite_atingido'
│     │     └── CPF não cadastrado → status_horus = 'nao_cadastrado'
│     │
│     └── Status box HÓRUS (toma lugar do status box padrão)
│
├── Avançar (só quando aprovado) → Etapa 2
│
Etapa 2 — Medicamentos
│    [Mesmo fluxo existente, mas filtra por lista Farmácia Popular]
│
Etapa 3 — Finalização HÓRUS
│    ├── Tela de confirmação com visibilidade por perfil
│    ├── Campo receita (obrigatório se med de prescrição)
│    └── Botão "Registrar dispensação HÓRUS"
│          → Gera registro no lote ativo
│          → Banner: "Dispensação registrada — Lote #NNNN"
```

## Layout — Etapa 3 HÓRUS (substituição do card padrão)

```
┌─────────────────────────────────────────────────────────────┐
│ Card: Resumo da Dispensação                                  │
│ ─────────────────────────────────────────────────────────── │
│ Medicamento: Metformina 850mg                                │
│ Quantidade:  2 caixas                                        │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐    │
│ │  VALOR PARA O CLIENTE                                │    │
│ │  R$ 0,00                     [● Farmácia Popular]   │    │
│ │  Desconto governo: 100%                              │    │
│ └──────────────────────────────────────────────────────┘    │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐    │
│ │  VISÍVEL APENAS PARA: gerente / admin                │    │
│ │  Custo para a farmácia:   R$ 38,40                  │    │
│ │  Ressarcimento governo:   R$ 38,40                  │    │
│ │  Status ressarcimento:    ● Pendente (lote #1042)   │    │
│ └──────────────────────────────────────────────────────┘    │
│                                                              │
│ Receita: [Vinculada: REC-2026-001847] ✓                     │
│          (obrigatório se prescrição)                         │
│ ─────────────────────────────────────────────────────────── │
│           [Registrar dispensação HÓRUS →]                   │
└─────────────────────────────────────────────────────────────┘
```

## Schema
`src/schemas/pbm.ts` — adicionar:

```ts
export const HorusStatusSchema = z.enum([
  'idle',
  'verificando',
  'aprovado',
  'limite_atingido',
  'nao_cadastrado',
  'offline',
])

export const HorusDispensacaoSchema = z.object({
  cpf_paciente:     z.string().length(11, 'CPF deve ter 11 dígitos'),
  produto_id:       z.string(),
  produto_nome:     z.string(),
  quantidade:       z.number().int().positive(),
  preco_tabela:     z.number().int().positive(),   // centavos
  custo_farmacia:   z.number().int().positive(),   // centavos
  ressarcimento:    z.number().int().positive(),   // centavos
  receita_id:       z.string().optional(),
  requer_receita:   z.boolean(),
})

export const HorusLoteSchema = z.object({
  id:            z.string().uuid(),
  numero_lote:   z.number().int().positive(),
  farmacia_id:   z.string(),
  dispensacoes:  z.array(HorusDispensacaoSchema),
  status:        z.enum(['aberto', 'enviando', 'enviado', 'processado', 'aprovado', 'ressarcido', 'glosado']),
  criado_em:     z.string(),
  enviado_em:    z.string().optional(),
  valor_total:   z.number().int(),               // centavos
})

export type HorusStatus      = z.infer<typeof HorusStatusSchema>
export type HorusDispensacao = z.infer<typeof HorusDispensacaoSchema>
export type HorusLote        = z.infer<typeof HorusLoteSchema>
```

## Mock Data

```ts
// Lista simplificada Farmácia Popular (subset dos 108 medicamentos do programa)
const LISTA_FARMACIA_POPULAR = [
  { produto_id: 'fp001', nome: 'Metformina 850mg',          custo: 1920,  ressarcimento: 1920  },
  { produto_id: 'fp002', nome: 'Losartana 50mg',             custo: 1540,  ressarcimento: 1540  },
  { produto_id: 'fp003', nome: 'Atenolol 25mg',              custo:  890,  ressarcimento:  890  },
  { produto_id: 'fp004', nome: 'Sinvastatina 20mg',          custo: 1230,  ressarcimento: 1230  },
  { produto_id: 'fp005', nome: 'Captopril 25mg',             custo:  560,  ressarcimento:  560  },
  { produto_id: 'fp006', nome: 'Hidroclorotiazida 25mg',     custo:  480,  ressarcimento:  480  },
  { produto_id: 'fp007', nome: 'Omeprazol 20mg',             custo: 1180,  ressarcimento: 1180  },
  { produto_id: 'fp008', nome: 'Glibenclamida 5mg',          custo:  620,  ressarcimento:  620  },
  { produto_id: 'fp009', nome: 'Amitriptilina 25mg',         custo:  790,  ressarcimento:  790  },
  { produto_id: 'fp010', nome: 'Fluoxetina 20mg',            custo: 1150,  ressarcimento: 1150  },
]

// Lote ativo mock
const LOTE_ATIVO_MOCK: HorusLote = {
  id:           'lote-horus-042',
  numero_lote:  1042,
  farmacia_id:  'farm-001',
  dispensacoes: [],
  status:       'aberto',
  criado_em:    '2026-05-01T00:00:00',
  valor_total:  0,
}

// Histórico de lotes
const HISTORICO_LOTES_MOCK = [
  { numero_lote: 1041, mes: 'Abril/2026',  dispensacoes: 234, valor: 452800, status: 'ressarcido', enviado_em: '2026-05-05' },
  { numero_lote: 1040, mes: 'Março/2026',  dispensacoes: 198, valor: 381500, status: 'aprovado',   enviado_em: '2026-04-04' },
  { numero_lote: 1039, mes: 'Fevereiro/26',dispensacoes: 187, valor: 362100, status: 'glosado',    enviado_em: '2026-03-05' },
]
```

## Config Tables

```ts
// Status da verificação HÓRUS
const HORUS_STATUS_CFG: Record<HorusStatus, {
  badge: string; badgeBg: string; badgeText: string
  cardBg: string; cardBorder: string
  title: string; desc: string
  btnText: string; btnCls: string; disabled: boolean
}> = {
  idle: {
    badge: '● Aguardando', badgeBg: 'bg-neutral-50', badgeText: 'text-neutral-500',
    cardBg: 'bg-white', cardBorder: 'border-brand-100',
    title: 'Verificação HÓRUS pendente', desc: 'Informe o CPF para consultar o beneficiário.',
    btnText: 'Consultar HÓRUS', btnCls: 'bg-brand-900 text-white', disabled: false,
  },
  verificando: {
    badge: '⟳ Verificando', badgeBg: 'bg-brand-75', badgeText: 'text-brand-750',
    cardBg: 'bg-brand-25', cardBorder: 'border-brand-100',
    title: 'Consultando HÓRUS…', desc: 'Aguarde a resposta do DATASUS.',
    btnText: 'Aguarde…', btnCls: 'bg-brand-300 cursor-not-allowed text-white', disabled: true,
  },
  aprovado: {
    badge: '● Aprovado', badgeBg: 'bg-brand-75', badgeText: 'text-success-600',
    cardBg: 'bg-brand-25', cardBorder: 'border-brand-100',
    title: 'Beneficiário habilitado', desc: 'CPF validado no programa Farmácia Popular.',
    btnText: 'Avançar →', btnCls: 'bg-brand-900 text-white', disabled: false,
  },
  limite_atingido: {
    badge: '⚠ Limite atingido', badgeBg: 'bg-warning-50', badgeText: 'text-warning-800',
    cardBg: 'bg-warning-50', cardBorder: 'border-warning-100',
    title: 'Limite mensal atingido', desc: 'Este CPF já dispensou o limite de 1 embalagem/mês para este produto (RN-08).',
    btnText: 'Dispensação bloqueada', btnCls: 'bg-brand-300 cursor-not-allowed text-white', disabled: true,
  },
  nao_cadastrado: {
    badge: '✗ Não cadastrado', badgeBg: 'bg-danger-50', badgeText: 'text-danger-700',
    cardBg: 'bg-danger-50', cardBorder: 'border-danger-100',
    title: 'CPF não cadastrado no programa', desc: 'Beneficiário não encontrado no HÓRUS. Orientar o cliente a se cadastrar.',
    btnText: 'Dispensação bloqueada', btnCls: 'bg-brand-300 cursor-not-allowed text-white', disabled: true,
  },
  offline: {
    badge: '⚠ HÓRUS offline', badgeBg: 'bg-warning-50', badgeText: 'text-warning-800',
    cardBg: 'bg-warning-50', cardBorder: 'border-warning-100',
    title: 'Sistema HÓRUS indisponível', desc: 'Dispensação offline permitida. Sincronização será feita quando o sistema voltar.',
    btnText: 'Dispensar offline', btnCls: 'bg-warning-600 text-white', disabled: false,
  },
}

// Visibilidade por perfil — campos financeiros
function deveExibirCustoFarmacia(perfil: string): boolean {
  return ['farmaceutico', 'admin', 'gerente'].includes(perfil)
}
```

## Estado (adições ao wizard)

```ts
// Adições ao estado da PbmPage para o fluxo HÓRUS:
const [horusStatus, setHorusStatus]       = useState<HorusStatus>('idle')
const [isHorusOnline, setIsHorusOnline]   = useState(true)  // demo switcher
const [loteAtivo, setLoteAtivo]           = useState<HorusLote>(LOTE_ATIVO_MOCK)
const [dispensando, setDispensando]       = useState(false)
const [dispensacaoOk, setDispensacaoOk]   = useState(false)

// Perfil do operador (vindo de contexto de autenticação)
const perfil = 'operador_caixa'  // mock — substituir por useAuth().perfil
```

## Integração no wizard

```ts
// Na Etapa 1, quando convenio === 'Farmácia Popular':
// 1. Substituir STATUS_BOX padrão pelo HORUS_STATUS_CFG
// 2. Handler de consulta:
const handleConsultarHorus = async () => {
  if (!cpf || cpf.length !== 11) return
  setHorusStatus(isHorusOnline ? 'verificando' : 'offline')
  if (isHorusOnline) {
    await new Promise((r) => setTimeout(r, 800))
    // Mock: aprovado para CPFs válidos
    setHorusStatus('aprovado')
    // TODO: integrar com API — POST /api/v1/pbm/horus/verificar-beneficiario { cpf, produto_id }
  }
}

// goNext (Etapa 1 → 2) só disponível quando:
// horusStatus === 'aprovado' || horusStatus === 'offline'

// Na Etapa 3 — handler de finalização:
const handleRegistrarDispensacao = async () => {
  setDispensando(true)
  try {
    await new Promise((r) => setTimeout(r, 1000))
    setDispensacaoOk(true)
    setLoteAtivo((prev) => ({
      ...prev,
      dispensacoes: [...prev.dispensacoes, { cpf_paciente: cpf, /* ... */ } as HorusDispensacao],
    }))
    // TODO: integrar com API — POST /api/v1/pbm/horus/dispensar
  } finally {
    setDispensando(false)
  }
}
```

## Demo switcher (HÓRUS online/offline)

```tsx
// Pills no header do card de status (para prototipação)
{(['aprovado', 'limite_atingido', 'nao_cadastrado', 'offline'] as const).map((s) => (
  <button key={s} type="button" onClick={() => setHorusStatus(s)}
    className={['rounded-full px-2 py-0.5 font-mono text-[9px] uppercase',
      horusStatus === s ? 'bg-brand-100 text-brand-750' : 'text-brand-muted hover:bg-brand-50',
    ].join(' ')}>
    {s}
  </button>
))}
```

## API Endpoints

```ts
// TODO: integrar com API — POST /api/v1/pbm/horus/verificar-beneficiario { cpf, produto_id }
//   → { status: HorusStatus, beneficiario_nome?, ultima_dispensacao? }

// TODO: integrar com API — POST /api/v1/pbm/horus/dispensar { cpf, produto_id, qtd, receita_id? }
//   → { dispensacao_id, lote_numero, protocolo }

// TODO: integrar com API — GET  /api/v1/pbm/horus/lote-ativo
//   → HorusLote com dispensacoes do mês atual

// TODO: integrar com API — POST /api/v1/pbm/horus/enviar-lote { lote_id }
//   → { protocolo_transmissao, status }

// TODO: integrar com API — GET  /api/v1/pbm/horus/historico-lotes
//   → HorusLote[]

// TODO: integrar com API — GET  /api/v1/pbm/horus/conciliacao?mes=&ano=
//   → { aprovado, glosado, pendente, valor_total }
```

## Verificação

- [ ] Fluxo HÓRUS ativado apenas quando convênio = "Farmácia Popular"
- [ ] CPF inválido (< 11 dígitos ou formato errado): botão "Consultar HÓRUS" desabilitado
- [ ] `horusStatus: 'limite_atingido'`: botão de avanço desabilitado (RN-08)
- [ ] `horusStatus: 'nao_cadastrado'`: botão de avanço desabilitado
- [ ] `horusStatus: 'offline'`: dispensação offline permitida com banner warning
- [ ] "Custo farmácia" e "Ressarcimento" visíveis apenas para `farmaceutico`/`admin`
- [ ] "VALOR PARA O CLIENTE: R$ 0,00" visível para todos os perfis
- [ ] Receita obrigatória quando `requer_receita: true` (bloqueia botão "Registrar")
- [ ] Após dispensação: lote ativo atualizado com nova dispensação
- [ ] Demo switcher alterna estados corretamente para prototipação
