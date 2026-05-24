---
modulo: pdv-fechamento
rota: /pdv/fechamento-caixa
pagina: FechamentoCaixaPage
status: ✅ Implementado (2026-05-10)
schema: src/schemas/caixa.ts
layout: duas-colunas
referencia: —
---

# Fechamento de Caixa — Spec

## Propósito
Conferência do valor contado em espécie vs. esperado do sistema. Exibe totais por forma de pagamento e permite fechar o turno.

## Layout — Duas colunas

```
┌───────────────────────────────────────────────────┐
│ Header: título + chip "Turno em andamento"         │
├──────────────────────────────┬────────────────────┤
│  Resumo do turno (flex-1)    │  Ações (w-390)     │
│  ─────────────────────────── │  ─────────────────  │
│  Tabela conferência:         │  Input contado      │
│  Forma | Esperado | Conf.    │  Diferença display  │
│  Diferença                   │                     │
│  (Dinheiro editável +        │  Sangria / Suprimento│
│   Débito/Crédito/Pix/PBM    │  botões             │
│   automáticos)               │                     │
│  ─────────────────────────── │  [Fechar caixa]     │
│  Totais: Total turno         │  (danger-500)       │
│  -Sangrias                   │                     │
│  =Total líquido              │  Aviso irreversível  │
│  [Banner diferença]          │                     │
└──────────────────────────────┴────────────────────┘
```

## Schema
`src/schemas/caixa.ts` — `FechamentoCaixaSchema` (`dinheiro_contado`, `motivo_diferenca?`)

## Mock Data (constantes)

```ts
const ESPERADO_DINHEIRO = 1340   // R$ 1.340,00
const TOTAL_TURNO = 5320         // R$ 5.320,00
const SANGRIAS = 200             // R$ 200,00

const AUTO_ROWS = [
  { forma: 'Débito',  esperado: 'R$ 1.200,00' },
  { forma: 'Crédito', esperado: 'R$ 1.560,00' },
  { forma: 'Pix',     esperado: 'R$ 900,00'   },
  { forma: 'PBM',     esperado: 'R$ 320,00'   },
]
```

## Estado

```ts
const [contado, setContado] = useState('1.335,00')
// derivados:
const contadoNum = parseBRL(contado)
const diferenca = contadoNum - ESPERADO_DINHEIRO
const totalLiquido = TOTAL_TURNO - SANGRIAS
const temDiferenca = Math.abs(diferenca) >= 0.01
```

## Lógica de Diferença

- `temDiferenca` → exibe banner warning `bg-warning-25 border-warning-100`
- Cor da célula de diferença: `text-danger-muted` quando há diferença, `text-brand-muted` se ok
- `fmtDif(n)`: prefix `+` se positivo, `-` automático se negativo

## API Endpoints

```ts
// TODO: GET /api/v1/pdv/turno-atual → { total_turno, sangrias, esperado_dinheiro, formas[] }
// TODO: POST /api/v1/pdv/fechar-caixa { dinheiro_contado, motivo_diferenca? } → resumo
```

## Verificação

- [ ] Campo dinheiro contado sincronizado entre tabela e painel direito
- [ ] Banner diferença só aparece quando `|diferença| >= R$ 0,01`
- [ ] Total líquido = Total turno − Sangrias
- [ ] Botão "Fechar caixa" é `bg-danger-500` com aviso irreversível
- [ ] `parseBRL` converte corretamente `1.335,00` → `1335`

## Refinamentos Pendentes

| Change | Prioridade | Descrição | Status |
|---|---|---|---|
| [CHANGE-PDV-001](./changes/CHANGE-PDV-001.md) | P1 | Fechar Caixa: Fluxo Completo — async handler, loading state, validação motivo quando `\|diferença\| > R$50`, toast de confirmação | ⬜ pending |
| [CHANGE-PDV-002](./changes/CHANGE-PDV-002.md) | P2 | Histórico de Caixa: Modal/Drawer — `ModalHistoricoCaixa` com filtros por período/operador, detalhe readonly, exportar Relatório Z | ⬜ pending |

### O que cada change adiciona a esta tela

**CHANGE-PDV-001** completa o fluxo de fechamento que hoje é mockado: adiciona `handleFecharCaixa` async com loading state no botão, validação Zod `FechamentoCaixaSchema.safeParse()`, regra RN-09 (motivo obrigatório quando `|diferença| > R$50`), e integração `POST /api/v1/pdv/fechar-caixa`. Novo spec detalhado em `.spec/pdv-fechamento.spec.md` (este arquivo).

**CHANGE-PDV-002** adiciona `ModalHistoricoCaixa` (w-[820px], dois painéis) ao `FechamentoCaixaPage`: lista filtrada de fechamentos anteriores à esquerda e detalhe readonly + exportação PDF à direita. Depende do spec `.spec/pdv-historico-caixa.spec.md` para layout, mock data e schemas Zod.
