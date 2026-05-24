---
name: new-page
description: Cria uma nova página no projeto ERP seguindo os padrões de CLAUDE.md. Use quando for criar uma tela nova de um módulo.
arguments: [rota, layout]
argument-hint: "<rota> <layout: coluna-unica|duas-colunas|wizard-N>"
allowed-tools: Read, Write, Edit, Bash
---

Crie uma nova página para a rota `$rota` com layout `$layout`.

## Passo a passo

1. **Leia** `CLAUDE.md` seção "Padrões de layout de página" para o template correto do layout `$layout`
2. **Leia** `.spec/$rota.spec.md` se existir — contém a especificação completa do módulo
3. **Verifique** se o schema Zod existe em `src/schemas/`. Se não, rode `/new-schema` primeiro
4. **Crie** `src/pages/[NomePaginaPage].tsx` seguindo:
   - Layout correto para `$layout`
   - Sub-componentes locais (não exportados) no mesmo arquivo
   - Dados mock com `// TODO: MÉTODO /endpoint` em cada ponto de integração
   - Lookup tables `STATUS_CFG`, `TIPO_CFG` para estilos baseados em estado
   - `useMemo` para métricas calculadas sobre os dados locais
5. **Adicione** a rota em `src/router.tsx` como filho do `AppLayout`
6. **Atualize** a tabela de rotas em `CLAUDE.md`
7. **Rode** o quality gate: `/quality-gate`
8. **Atualize** a documentação: `/update-docs $rota`
