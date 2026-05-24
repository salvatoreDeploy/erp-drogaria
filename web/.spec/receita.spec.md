---
modulo: receita
rota: /receita
pagina: ReceitaPage
status: ✅ Implementado (2026-05-10)
schema: src/schemas/receita.ts
layout: coluna-unica-multi-estado
referencia: —
---

# Receita Digital — Spec

## Propósito
Leitura e validação de receitas médicas (OCR + checklist automático). Fluxo não-linear com 5 estados: a UI muda completamente por estado, não é um wizard linear. Perfis: `farmaceutico`, `operador_caixa`.

## Layout — Coluna única, multi-estado

```
┌──────────────────────────────────────────────────────┐
│ Header: título + chip status (demo switcher)          │
│         + badge progresso "N/5 estados"               │
├──────────────────────────────────────────────────────┤
│ Grid 5 Métricas (Receitas hoje / Validadas /         │
│                  Em análise / Rejeitadas / Tempo)    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [idle]       Upload de receita (drag & drop)        │
│  [processando] Barra de progresso (OCR simulado)     │
│  [validado]   Card paciente + med list + checklist   │
│  [pendente]   Card amarelo — revisão manual          │
│  [rejeitado]  Card vermelho — motivo de rejeição     │
│                                                      │
├──────────────────────────────────────────────────────┤
│ Rodapé de ação (varia por estado):                   │
│  validado  → [Concluir atendimento →] (navega PDV)   │
│  rejeitado → [Nova receita]                          │
└──────────────────────────────────────────────────────┘
```

## Schema
`src/schemas/receita.ts` — `ReceitaStatusSchema`, `MedStatusSchema`, `CheckStatusSchema`, `ReceitaMedItemSchema`, `CheckItemSchema`

## Mock Data

**5 métricas:**
```ts
const METRICS = [
  { label: 'Receitas hoje',  value: '58',    bg: 'bg-white',    border: 'border-brand-100'   },
  { label: 'Validadas',      value: '49',    bg: 'bg-brand-25',  border: 'border-brand-100'   },
  { label: 'Em análise',     value: '7',     bg: 'bg-warning-50', border: 'border-warning-100' },
  { label: 'Rejeitadas',     value: '2',     bg: 'bg-danger-50',  border: 'border-danger-100'  },
  { label: 'Tempo médio',    value: '1m 12s',bg: 'bg-info-50',    border: 'border-info-100'    },
] as const
```

**Medicamentos extraídos (OCR mock):**
```ts
const MEDS_MOCK: MedItem[] = [
  { id: 1, nome: 'Losartana 50mg',    posologia: '1 cp/dia', controlado: false, status: 'liberado' },
  { id: 2, nome: 'Morfina 10mg/mL',  posologia: '2 ml/8h',  controlado: true,  status: 'analisar' },
  { id: 3, nome: 'Omeprazol 20mg',   posologia: '1 cp/dia', controlado: false, status: 'liberado' },
]
```

**Checklist de validação:**
```ts
const CHECKS_MOCK: CheckItem[] = [
  { label: 'CRM médico verificado',  value: 'CRM-SP 123456', status: 'ok'        },
  { label: 'Assinatura digital',     value: 'Verificada',    status: 'ok'        },
  { label: 'Data de validade',       value: '29/04/2026',    status: 'ok'        },
  { label: 'Registro SNGPC',         value: 'Pendente',      status: 'pendente'  },
  { label: 'Controlado Portaria 344',value: 'Aguardando',    status: 'aguardando'},
]
```

## Config Tables

```ts
type ReceitaStatus = 'idle' | 'processando' | 'validado' | 'pendente' | 'rejeitado'

const STATUS_CFG: Record<ReceitaStatus, {
  chipLabel, chipBg, chipText, chipBorder,
  badge, badgeBg, badgeText,
  cardBg, cardBorder,
  title, desc,
  btnText, btnCls, btnDisabled
}> = {
  idle:       { chipLabel: 'Aguardando receita', chipBg: 'bg-neutral-50', ... },
  processando:{ chipLabel: 'Processando OCR',    chipBg: 'bg-info-50',    ... },
  validado:   { chipLabel: 'Validado',           chipBg: 'bg-brand-25',   cardBg: 'bg-brand-25',   ... },
  pendente:   { chipLabel: 'Em análise',         chipBg: 'bg-warning-50', cardBg: 'bg-warning-50', ... },
  rejeitado:  { chipLabel: 'Rejeitado',          chipBg: 'bg-danger-50',  cardBg: 'bg-danger-50',  ... },
}
```

## Estado

```ts
const [status, setStatus] = useState<ReceitaStatus>('idle')
const [meds, setMeds] = useState<MedItem[]>(MEDS_MOCK)
const [historicOpen, setHistoricOpen] = useState(false)
const navigate = useNavigate()
```

## Fluxo de Estados

```
idle → [upload/câmera] → processando (2s simulados) → validado / pendente / rejeitado
         (demo switcher no header permite pular para qualquer estado)
```

**Estado `validado`:**
- Card paciente: nome, CPF, médico, CRM
- Lista de medicamentos com `MedStatus` badge
- Checklist com `CheckStatus` por item
- Card SNGPC se há controlados: protocolo `SNGPC-2026-008847` + banner Portaria 344
- Botão "Concluir atendimento →" → `navigate('/pdv?caixaAberto=true', { state: { receita_id, meds } })`

**Estado `pendente`:**
- Card amarelo com motivo (ex: "Assinatura não verificada")
- Botão "Enviar para análise manual"

**Estado `rejeitado`:**
- Card vermelho com motivo de rejeição
- Botão "Nova receita" → `setStatus('idle')`

## Modais

### ModalHistoricoReceita
Tabela read-only: Data | Médico | Medicamentos | Status.
Abre ao clicar "Histórico" no card do paciente (estado validado).
```ts
// TODO: GET /api/v1/receita/historico?cpf={cpf}
```

## API Endpoints

```ts
// TODO: GET /api/v1/receita/metricas-dia
// TODO: POST /api/v1/receita/processar { imagem_base64 } → { status, paciente, meds[], checks[] }
// TODO: POST /api/v1/receita/{id}/liberar → { protocolo_sngpc? }
// TODO: GET /api/v1/receita/historico?cpf={cpf}
```

## Verificação

- [ ] Demo switcher alterna todos os 5 estados corretamente
- [ ] Chip de status no header muda bg/text por estado
- [ ] Card de estado muda `cardBg` e `cardBorder` por estado
- [ ] Botão "Concluir atendimento" navega PDV com `state.receita_id`
- [ ] SNGPC card aparece apenas quando há medicamento `controlado: true` e estado = `validado`
- [ ] Botão do estado `pendente/rejeitado` usa `bg-brand-300 cursor-not-allowed`
- [ ] `ModalHistoricoReceita` só disponível no estado `validado`
