---
name: simplify
description: Revisa o código recém-implementado buscando oportunidades de reuso, qualidade e eficiência — sem mudar comportamento. Use após implementar um módulo grande.
arguments: [arquivo]
argument-hint: "<caminho do arquivo ou glob, ex: src/pages/FinanceiroPage.tsx>"
allowed-tools: Read, Edit, Bash, Grep
---

Revise `$arquivo` buscando oportunidades de simplificação. Não mude comportamento — só qualidade.

## Checklist de revisão

### 1. Padrões do projeto (leia CLAUDE.md antes)

- [ ] Sub-componentes sem export estão no mesmo arquivo? (padrão correto)
- [ ] Estados separados `novoOpen + editando` — nunca `item | null | 'novo'`?
- [ ] Lookup tables `STATUS_CFG` usadas — zero ifs inline no JSX?
- [ ] `useMemo` para métricas calculadas sobre arrays de estado?
- [ ] `// TODO: MÉTODO /endpoint` em cada ponto de integração de API?

### 2. Código morto e imports

```bash
npx biome check --write $arquivo
```

- [ ] Variáveis e funções não utilizadas?
- [ ] Imports não usados (`noUnusedVariables`, `noUnusedImports`)?
- [ ] Funções helper duplicadas que já existem no escopo?

### 3. Componentes UI disponíveis

Verificar se padrões inline poderiam usar os componentes de `src/components/ui/`:

```bash
# Componentes disponíveis:
# Modal.Root / Modal.Header / Modal.Body / Modal.Footer
# Alert (variantes: danger, warning, info, success)
# Table.Header / Table.Row
# FilterTabs
# Badge (variantes)
# Input.Root / Input.Label / Input.Field
# MetricCard.Root / .Label / .Value / .Trend
# Button (variantes: primary, secondary, danger)
```

- [ ] Modais com `<Modal.Root>` em vez de div manual?
- [ ] Banners com `<Alert>` em vez de div manual?
- [ ] Tabelas com `<Table.Header>` + `<Table.Row>` em vez de grid manual?

### 4. Acessibilidade (Biome enforça)

- [ ] Todo `<input>` e `<select>` tem `id` + `<label htmlFor>`?
- [ ] Campos somente-leitura usam `<p>` (não `<label>`)?
- [ ] Overlay modal é `<button type="button">` (não `<div onClick>`)?
- [ ] Botões sem texto têm `aria-label`?

### 5. TypeScript

```bash
npx tsc -b
```

- [ ] Tipos inferidos de Zod (`z.infer<>`) — nenhum `type` manual duplicado?
- [ ] `as const` em arrays de config estáticos?
- [ ] `Record<K, V>` em lookup tables (mais seguro que `{ [key: string]: V }`)?

### 6. Build final

```bash
npx biome check --write ./src && npx tsc -b && npx vite build
```

Reporte:
- ✅ / ❌ para cada item do checklist
- Lista de mudanças aplicadas
- Avisos se o build produziu chunk > 500 kB (esperado, não é erro)
