---
name: new-schema
description: Cria um novo arquivo de schema Zod em src/schemas/ e exporta no barrel. Use antes de criar qualquer nova tela.
arguments: [modulo]
argument-hint: "<nome-do-modulo>"
allowed-tools: Read, Write, Edit, Bash
---

Crie o schema Zod para o módulo `$modulo`:

## Passo a passo

1. **Leia** `src/schemas/produto.ts` como referência de padrão
2. **Crie** `src/schemas/$modulo.ts` seguindo estas regras obrigatórias:
   - Schemas de enum antes dos schemas de objeto
   - `z.infer<typeof XSchema>` como fonte do tipo — NUNCA declarar `type` manual
   - Exportar schema + tipo + schema de formulário (sem id)
   - Usar `z.coerce.number()` para campos numéricos vindos de `<input type="number">`
   - Usar `z.string().datetime()` para timestamps ISO 8601
   - Valores monetários como `z.number().int()` (centavos)
3. **Adicione** os exports em `src/schemas/index.ts` em ordem alfabética
4. **Verifique** colisões de nomes com schemas existentes: `grep -r "export.*Schema" src/schemas/`
5. **Rode** `npx tsc -b` para verificar tipos

## Template mínimo

```ts
import { z } from 'zod'

export const $moduloStatusSchema = z.enum(['ativo', 'inativo'])

export const $moduloSchema = z.object({
  id: z.string().uuid(),
  // ... campos
  status: $moduloStatusSchema,
})

export type $modulo = z.infer<typeof $moduloSchema>
export type $moduloStatus = z.infer<typeof $moduloStatusSchema>

export const $moduloFormSchema = $moduloSchema.omit({ id: true })
export type $moduloForm = z.infer<typeof $moduloFormSchema>
```
