---
id: CHANGE-PRE-002
task: TASK-PRE-002
prioridade: P2
status: pending
modulo: precificador
pagina: PrecificadorPage
arquivos:
  - src/pages/PrecificadorPage.tsx
spec: .spec/precificador.spec.md
depende-de: [CHANGE-PRE-001]
---

# CHANGE-PRE-002 — Botão "Publicar Preço Sugerido"

## Contexto
Após revisar margens, não há forma de aplicar os preços sugeridos — operador precisa ir em Cadastro de Produtos para alterar um a um.

## O que implementar
- [ ] Botão "Publicar Preços" habilitado quando ≥ 1 produto selecionado na tabela
- [ ] `ModalPublicarPrecos`: lista de produtos selecionados + preço atual → sugerido + variação %
- [ ] Resumo: N produtos, variação média de preço
- [ ] Opção: publicar agora ou agendar (data/hora futura)
- [ ] Confirmação → atualiza preço no estado local dos produtos + badge "Publicado"
- [ ] Histórico de publicações no painel lateral (data, usuário, qtd produtos)

## Arquivos alvo

| Arquivo | O que muda |
|---|---|
| `src/pages/PrecificadorPage.tsx` | `ModalPublicarPrecos` + estado de seleção + histórico de publicações |

## TODOs de API
```
// TODO: integrar com API — POST /api/v1/precificador/publicar
// TODO: integrar com API — POST /api/v1/precificador/agendar-publicacao
// TODO: integrar com API — GET /api/v1/precificador/historico-publicacoes
```

## Referência CLAUDE.md
- Padrão handler async (§6) — publicação é crítica, não pode haver duplo-clique
- Botão com `disabled={isLoading}` obrigatório

## Resultado
*(preencher após implementação)*
