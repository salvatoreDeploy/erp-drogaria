---
name: quality-gate
description: Roda o quality gate obrigatório do projeto ERP — biome check + tsc + vite build. Use após qualquer mudança no código antes de encerrar a sessão.
allowed-tools: Bash
---

Execute o quality gate completo do projeto Farmacorp ERP e reporte o resultado:

```
npx biome check --write ./src && npx tsc -b && npx vite build
```

Reporte de forma clara:
- ✅ **Biome:** sem erros / N arquivos corrigidos
- ✅ **TypeScript:** sem erros
- ✅ **Vite build:** concluído em Xs

Se houver erros, liste cada um com arquivo e linha. O aviso de chunk > 500 kB é esperado e não é erro.
