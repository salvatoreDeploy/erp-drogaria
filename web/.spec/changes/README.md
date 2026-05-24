# changes/ — Sistema de Change Files

> Cada arquivo representa uma mudança atômica e rastreável derivada de TASKS.md.  
> O agente deve ler o change file, a spec referenciada e os arquivos alvo antes de implementar.

---

## Como usar

```
/apply-change CHANGE-PDV-001
```

O skill `apply-change` lê o change file, localiza os arquivos alvo, implementa os critérios e atualiza `status` para `done`.

---

## Formato de um change file

```markdown
---
id: CHANGE-XXX-NNN
task: TASK-XXX-NNN
prioridade: P1 | P2 | P3
status: pending | in-progress | done | blocked
modulo: nome-do-modulo
pagina: NomeDaPaginaTsx
arquivos: [caminho/relativo.tsx, ...]
spec: .spec/modulo.spec.md
depende-de: []             # IDs de outros CHANGE que devem estar done antes
---

# CHANGE-XXX-NNN — Título da mudança

## Contexto
Uma linha: por que esta mudança existe.

## O que implementar
- [ ] Critério de aceite 1
- [ ] Critério de aceite 2

## Arquivos alvo
| Arquivo | O que muda |
|---|---|
| `src/pages/X.tsx` | descrição objetiva |

## TODOs de API
(marcar em código com o padrão `// TODO: integrar com API — MÉTODO /caminho`)

## Referência CLAUDE.md
- Seção específica do padrão a seguir
```

---

## Regras

| Regra | Detalhe |
|---|---|
| Um change = uma task | Granularidade 1:1 com TASKS.md |
| `status: done` só após quality gate | `npx biome check --write ./src && npx tsc -b` |
| Dependências explícitas | `depende-de` lista IDs — nunca iniciar sem deps `done` |
| TODOs no código | Formato `// TODO: integrar com API — MÉTODO /endpoint` |
| Spec consultada antes de editar | Sempre ler `.spec/` referenciado antes de tocar o arquivo |

---

## Ordem de execução (derivada de TASKS.md)

```
CHANGE-PDV-003  →  CHANGE-WA-001  →  CHANGE-WA-002  →  CHANGE-NF-003
→  CHANGE-EST-001  →  CHANGE-NF-001 (deps: NF-003/004/005)
→  CHANGE-NF-002 (dep: NF-001)  →  CHANGE-NF-004  →  CHANGE-NF-005
→  CHANGE-EST-002 (dep: EST-003)  →  CHANGE-EST-003
→  CHANGE-PDV-001  →  CHANGE-PDV-002  →  CHANGE-EST-004
→  CHANGE-EST-005 (dep: EST-004)  →  CHANGE-EST-006
→  CHANGE-EST-007  →  CHANGE-EST-008  →  CHANGE-EST-009
→  CHANGE-REC-001  →  CHANGE-WA-003  →  CHANGE-FIN-002
→  CHANGE-FIN-001 (dep: FIN-002)  →  CHANGE-PRE-001
→  CHANGE-PRE-002 (dep: PRE-001)  →  CHANGE-FID-001
→  CHANGE-WA-004  →  CHANGE-CAD-001
→  CHANGE-PBM-002  →  CHANGE-PBM-001 (maior complexidade)
```
