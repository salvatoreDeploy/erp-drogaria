---
modulo: precificador
rota: /precificador
pagina: PrecificadorPage
status: ⬜ Pendente
schema: — (usa src/schemas/produto.ts existente)
layout: coluna-unica
referencia: CadastroProdutosPage.tsx (tabela + modal)
---

# Precificador — Spec

## Propósito
Tabela de produtos com margem atual vs. mínima. Sugestão de preço por margem alvo. Gestão de promoções.

## Layout — Coluna única

```
┌────────────────────────────────────────┐
│ Header: título + filtros (categoria +  │
│ toggle "Abaixo da margem mínima")      │
├────────────────────────────────────────┤
│ Métricas: total | abaixo margem |      │
│           margem média | promoções     │
├────────────────────────────────────────┤
│ Tabela: Produto | Custo | Preço Atual  │
│         | Margem% | Preço Sugerido     │
│         | Status | [Ajustar]           │
└────────────────────────────────────────┘
```

## Colunas

```
grid-cols-[minmax(0,2fr)_90px_100px_80px_110px_80px_80px]
Produto | Custo | Preço Atual | Margem% | Preço Sugerido | Status | [Ajustar]
```

**Status de margem:**
- `ok` — margem ≥ margem_minima
- `alerta` — margem dentro de 5% do mínimo
- `baixo` — margem < margem_minima

## Modal de Ajuste

`ModalAjustarPreco`: margem alvo (slider 0-100%) → calcula preço sugerido automaticamente → confirma.

## API Endpoints

```ts
// TODO: GET /api/v1/precificador/produtos?filter=abaixo_margem
// TODO: PUT /api/v1/cadastros/produtos/{id}  (reusa endpoint de Produtos)
// TODO: POST /api/v1/precificador/campanha  { produto_ids[], desconto_pct, validade }
```
