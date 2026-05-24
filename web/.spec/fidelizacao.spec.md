---
modulo: fidelizacao
rota: /fidelizacao
pagina: FidelizacaoPage
status: ⬜ Pendente
schema: — (criar src/schemas/fidelizacao.ts)
layout: duas-colunas
referencia: DashboardPage.tsx + CadastroClientesPage.tsx
---

# Fidelização — Spec

## Propósito
Dashboard de programa de pontos e campanhas de fidelidade. Gestão de regras de acúmulo e resgates.

## Layout — Duas colunas

**Esquerda (flex-1):** métricas do programa + ranking de clientes por pontos + histórico de resgates
**Direita (w-82.5):** configuração de regras de pontos + botão "Nova campanha"

## Schema (criar)

```ts
export const RegraFidelizacaoSchema = z.object({
  id: z.string().uuid(),
  descricao: z.string(),
  valor_gasto: z.number().int().positive(),   // centavos para ganhar 1 ponto
  pontos: z.number().int().positive(),         // pontos ganhos
  ativa: z.boolean(),
})

export const ResgateSchema = z.object({
  id: z.string().uuid(),
  cliente_nome: z.string(),
  pontos_resgatados: z.number().int().positive(),
  desconto_aplicado: z.number().int().positive(),  // centavos
  data: z.string().datetime(),
})
```

## Mock Data

- 5 regras de pontos (ex: "A cada R$10 = 1 ponto")
- 20 resgates recentes
- Top 10 clientes por pontos

## API Endpoints

```ts
// TODO: GET /api/v1/fidelizacao/dashboard
// TODO: GET /api/v1/fidelizacao/regras
// TODO: PUT /api/v1/fidelizacao/regras/{id}
// TODO: GET /api/v1/fidelizacao/resgates
```
