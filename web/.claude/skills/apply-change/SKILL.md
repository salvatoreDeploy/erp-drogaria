---
name: apply-change
description: Lê um change file em changes/ e implementa a mudança na página alvo. Use quando quiser aplicar uma task específica do backlog de refinamento.
arguments: [change_id]
argument-hint: "<ID do change file (ex: CHANGE-PDV-001)>"
allowed-tools: Read, Edit, Write, Bash
---

Implemente o change `$change_id` do Farmacorp ERP.

## Passo a passo

### 1. Ler o change file

```
Read changes/$change_id.md
```

Extraia:
- `arquivos` — lista de arquivos alvo
- `spec` — spec de referência
- `depende-de` — verificar se todos estão `done`
- Critérios de aceite (checkboxes)

### 2. Verificar dependências

Se `depende-de` não estiver vazio, ler cada dependency:
```
Read changes/CHANGE-XXX-NNN.md
```
Se alguma tiver `status: pending | in-progress | blocked`, **parar e avisar o usuário**.

### 3. Atualizar status para in-progress

```
Edit changes/$change_id.md
→ status: pending → status: in-progress
```

### 4. Ler contexto

```
Read .spec/<modulo>.spec.md        ← spec do módulo
Read src/pages/<NomePage>.tsx      ← arquivo alvo principal
Read CLAUDE.md (seção relevante)   ← padrões obrigatórios
```

### 5. Implementar

Seguir **exatamente** os critérios de aceite do change file. Padrões obrigatórios:

```tsx
// Handler async obrigatório para toda ação com I/O:
const [isLoading, setIsLoading] = useState(false)
const handleAcao = async () => {
  setIsLoading(true)
  try {
    // lógica
    // TODO: integrar com API — MÉTODO /endpoint
  } catch (err) {
    console.error('[handleAcao]', err)
  } finally {
    setIsLoading(false)
  }
}

// Botão com loading state:
<button type="button" onClick={handleAcao} disabled={isLoading}
  className={isLoading ? 'opacity-60 cursor-not-allowed ...' : '...'}>
  {isLoading ? 'Aguarde...' : 'Label'}
</button>
```

Regras específicas por tipo de mudança:

| Tipo | Regra |
|---|---|
| Novo modal | Overlay `<button>` nunca `<div onClick>`. Todo `<input>` tem `id` + `htmlFor`. |
| Novo fluxo wizard | `useState<Step>` + lookup `STEP_CFG` + `goNext/goBack` |
| Campo somente-leitura | `<p>` não `<label>` — evita Biome `noLabelWithoutControl` |
| Validação de form | `Schema.safeParse()` — nunca `parse()` |
| Export/import | Mock async com `setTimeout` + `// TODO: integrar com API` |

### 6. Rodar quality gate

```bash
npx biome check --write ./src && npx tsc -b
```

Se falhar: corrigir antes de marcar como done.

### 7. Atualizar change file

```
Edit changes/$change_id.md
→ status: in-progress → status: done
→ Preencher campo ## Resultado com resumo do que foi implementado
```

### 8. Atualizar spec do módulo

Se a mudança adicionou comportamento novo, adicionar seção `## Refinamentos Aplicados` no `.spec/<modulo>.spec.md`.

## Regras invioláveis

| Regra | Motivo |
|---|---|
| Nunca implementar se dep não está `done` | Evita quebra de fluxo |
| Quality gate antes de marcar `done` | Status `done` = funciona em build limpo |
| TODOs no formato padrão | `// TODO: integrar com API — MÉTODO /caminho` |
| Não criar novos arquivos sem necessidade | Mudança vai na página existente |
| Marcar `[x]` nos critérios no change file | Rastreabilidade de progresso |
