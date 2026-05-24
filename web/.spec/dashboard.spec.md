---
modulo: dashboard
rota: /dashboard
pagina: DashboardPage
status: ✅ Implementado (2026-05-10)
schema: src/schemas/dashboard.ts
layout: coluna-unica
referencia: —
---

# Dashboard — Spec

## Propósito
Visão geral do dia: KPIs de vendas, alertas críticos (validade + SNGPC), estoque e atalhos de navegação.
Primeiro destino após login. Todos os perfis.

## Layout — Coluna única

```
┌───────────────────────────────────────────────────┐
│ Header: "Boa tarde, equipe" + botões CTA           │
├───────────────────────────────────────────────────┤
│ KPIs: 4 MetricCards em grid                        │
├───────────────────────────────────────────────────┤
│ Alertas críticos: bg-[#FFF8EE], 3 AlertCards       │
├──────────────────────────────┬────────────────────┤
│ Estoque e validade (flex-1)  │ Atalhos ERP (w-90) │
│ mini-tabela 4 colunas        │ 6 ShortcutCards    │
└──────────────────────────────┴────────────────────┘
```

## Schema
`src/schemas/dashboard.ts` — `ResumoDia`, `AlertaCritico`

## Mock Data (estático — sem estado reativo)

**KPIs:**
- Vendas do dia: R$ 48,7 mil (+12% vs ontem)
- Itens em alerta: 23 lotes (validade < 90 dias)
- PBM aprovado: 86% (convênios ativos)
- Caixa aberto: 14 atendimentos

**Alertas críticos (3):**
- Amoxicilina 500mg — 12 unidades vencem em 18 dias
- Controle A1 — Movimentação pendente ANVISA
- Reposição automática — 15 itens sugeridos

**Mini-tabela estoque (3 linhas):**
- Dipirona 500mg / L-2291 / 18 dias / Alerta
- Losartana 50mg / L-1044 / 62 dias / OK
- Seringa 10ml / P-7812 / Reposição / Baixo

**Atalhos (6 cards):** PDV rápido · NF-e e fiscal · WhatsApp integrado · PBM + Popular · Precificador · Fidelização

## Componentes UI Utilizados
`<MetricCard.Root>`, `<MetricCard.Label>`, `<MetricCard.Value>`, `<MetricCard.Trend>`, `<Button>`

## Sub-componentes Internos

```tsx
function AlertCard({ title, description })      — card bg-white, interno à seção de alertas
function InventoryRow({ produto, lote, ... })   — linha da mini-tabela de estoque
function ShortcutCard({ title, description })   — card de atalho bg-input-bg
```

## API Endpoints

```ts
// TODO: GET /api/v1/dashboard/resumo-dia → ResumoDia
// TODO: GET /api/v1/dashboard/alertas-criticos → AlertaCritico[]
// TODO: GET /api/v1/estoque/proximos-vencer?dias=30 → EstoqueItem[]
```

## Verificação

- [ ] KPIs renderizam via MetricCard.Root
- [ ] Seção alertas com bg-[#FFF8EE] border-[#F3E2C5]
- [ ] Mini-tabela com header bg-[#F5F8F6] e rows bg-[#FBFCFB]
- [ ] Botões CTA navegam para /fiscal e /pdv?caixaAberto=true
