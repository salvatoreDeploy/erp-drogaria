# TASKS.md — Backlog de Refinamento: Farmacorp ERP

> **Como usar este arquivo:**  
> O agente deve ler este arquivo no início de cada sessão, selecionar a próxima task com status `[ ]` e prioridade mais alta, implementá-la seguindo as regras do `CLAUDE.md`, atualizar o status para `[x]` ao concluir e registrar observações no campo `Resultado`.  
> **Nunca iniciar uma task sem verificar o arquivo e componente alvo primeiro.**

---

## Legenda de Status

- `[ ]` — Pendente
- `[~]` — Em andamento
- `[x]` — Concluído
- `[!]` — Bloqueado (registrar motivo)

## Legenda de Prioridade

- `P1` — Crítico para operação (bloqueia uso do módulo)
- `P2` — Importante (funcionalidade esperada pelo usuário)
- `P3` — Melhoria (UX, qualidade, robustez)

---

## MÓDULO: PDV

---

### TASK-PDV-001
**Prioridade:** P1  
**Status:** `[ ]`  
**Título:** Implementar funcionalidade do botão "Fechar Caixa"

**Descrição:**  
O botão "Fechar Caixa" existe na UI mas não possui handler nem lógica de negócio associada.

**Arquivo(s) alvo:** `src/modules/pdv/components/CaixaControle.tsx` *(verificar path real antes de editar)*

**Critérios de aceite:**
- [ ] Clicar em "Fechar Caixa" abre modal de confirmação com resumo do caixa (total vendas, formas de pagamento).
- [ ] Modal solicita valor em espécie contado fisicamente pelo operador.
- [ ] Sistema calcula e exibe diferença entre valor esperado e contado.
- [ ] Ao confirmar: caixa recebe status `FECHADO`, novas vendas são bloqueadas.
- [ ] Relatório Z é gerado e oferecido para download/impressão.
- [ ] Evento registrado em log de auditoria (usuário, timestamp, diferença de caixa).
- [ ] Botão exibe spinner durante processamento e está desabilitado para evitar duplo clique.

**Dependências:** API endpoint `POST /api/pdv/caixa/{id}/fechar`

**Resultado:** *(preencher após implementação)*

---

### TASK-PDV-002
**Prioridade:** P2  
**Status:** `[ ]`  
**Título:** Implementar "Ver Histórico de Caixa"

**Descrição:**  
Área/link "Ver histórico de caixa" não abre nenhuma visualização.

**Arquivo(s) alvo:** `src/modules/pdv/components/CaixaControle.tsx`

**Critérios de aceite:**
- [ ] Clicar abre modal/drawer lateral com lista de fechamentos anteriores.
- [ ] Filtros disponíveis: período (data inicial/final), operador.
- [ ] Lista exibe: data/hora fechamento, operador, total bruto, diferença, status.
- [ ] Clicar em um item abre detalhamento: vendas, pagamentos por forma, sangrias.
- [ ] Botão exportar relatório do histórico selecionado (PDF).
- [ ] Paginação ou scroll infinito para listas longas.

**Dependências:** API endpoint `GET /api/pdv/caixa/historico?dataInicio=&dataFim=&operador=`

**Resultado:** *(preencher após implementação)*

---

### TASK-PDV-003
**Prioridade:** P2  
**Status:** `[ ]`  
**Título:** Implementar botão "Pesquisar" no PDV

**Descrição:**  
Botão Pesquisar presente na tela de PDV não executa nenhuma ação.

**Arquivo(s) alvo:** `src/modules/pdv/components/PdvVenda.tsx` *(verificar path real)*

**Critérios de aceite:**
- [ ] Botão Pesquisar abre campo/modal de busca de produtos.
- [ ] Busca por: EAN/código de barras, nome do produto, princípio ativo.
- [ ] Resultados exibem: nome, apresentação, estoque atual, preço.
- [ ] Selecionar produto o adiciona ao carrinho/venda atual.
- [ ] Suporte a busca por teclado (Enter confirma, Esc fecha).

**Dependências:** API endpoint `GET /api/produtos/busca?q=`

**Resultado:** *(preencher após implementação)*

---

## MÓDULO: ESTOQUE

---

### TASK-EST-001
**Prioridade:** P1  
**Status:** `[ ]`  
**Título:** Implementar botão "Nova Entrada"

**Descrição:**  
Botão "Nova Entrada" no módulo de estoque não abre formulário nem executa ação.

**Critérios de aceite:**
- [ ] Abre formulário de entrada manual de produtos.
- [ ] Campos: produto (busca), quantidade, custo unitário, lote, validade, fornecedor, observação.
- [ ] Validação: quantidade > 0, produto obrigatório, validade futura.
- [ ] Salvar atualiza saldo em estoque e gera movimento de entrada.
- [ ] Entrada registrada no log com usuário e timestamp.

**Dependências:** API `POST /api/estoque/entradas`

**Resultado:** *(preencher após implementação)*

---

### TASK-EST-002
**Prioridade:** P1  
**Status:** `[ ]`  
**Título:** Implementar botão "Iniciar Inventário"

**Descrição:**  
Fluxo de inventário não está implementado. Ver fluxo detalhado em `PLANNING.md §2.4 > E-RX-01`.

**Critérios de aceite:**
- [ ] Modal de configuração: escopo (geral ou por categoria), modo (cego ou com quantidades visíveis).
- [ ] Gera lista de contagem com todos os produtos do escopo.
- [ ] Operador registra quantidade física por produto.
- [ ] Sistema exibe divergências (saldo sistema vs. contagem física).
- [ ] Botão "Salvar Ajuste" disponível (ver TASK-EST-003).
- [ ] Inventário salvo com status: rascunho → em andamento → finalizado.

**Dependências:** TASK-EST-003 (Salvar Ajuste)

**Resultado:** *(preencher após implementação)*

---

### TASK-EST-003
**Prioridade:** P1  
**Status:** `[ ]`  
**Título:** Implementar botão "Salvar Ajuste"

**Descrição:**  
Botão "Salvar Ajuste" deve ser ativado após inventário ou revisão manual de saldo.

**Critérios de aceite:**
- [ ] Disponível após divergências identificadas em inventário ou revisão.
- [ ] Exige seleção de motivo do ajuste (lista predefinida + campo livre).
- [ ] Gera movimento de ajuste de estoque (positivo ou negativo) por produto.
- [ ] Atualiza saldo em estoque atomicamente.
- [ ] Registro de auditoria: usuário, motivo, produtos ajustados, diferenças.
- [ ] Confirmação obrigatória antes de salvar (prevenção de ajuste acidental).

**Resultado:** *(preencher após implementação)*

---

### TASK-EST-004
**Prioridade:** P2  
**Status:** `[ ]`  
**Título:** Implementar botão "Revisar Agora"

**Descrição:**  
Botão presente em alertas de estoque mínimo/crítico, sem ação associada.

**Critérios de aceite:**
- [ ] Abre tela filtrada de produtos com estoque abaixo do mínimo configurado.
- [ ] Exibe: produto, saldo atual, estoque mínimo, diferença, fornecedor padrão.
- [ ] Permite selecionar produtos para solicitar reposição (ver TASK-EST-005).
- [ ] Permite ajustar estoque mínimo diretamente na tela.

**Resultado:** *(preencher após implementação)*

---

### TASK-EST-005
**Prioridade:** P2  
**Status:** `[ ]`  
**Título:** Implementar botão "Solicitar Reposição"

**Critérios de aceite:**
- [ ] Gera pedido de compra sugerido com base nos produtos selecionados (ver TASK-EST-004).
- [ ] Preenche automaticamente: fornecedor padrão, quantidade sugerida (ponto de pedido).
- [ ] Pedido pode ser editado antes de enviar.
- [ ] Opções: salvar como rascunho ou enviar para aprovação/compras.
- [ ] Notificação ao setor de compras via sistema (ou e-mail se configurado).

**Resultado:** *(preencher após implementação)*

---

### TASK-EST-006
**Prioridade:** P2  
**Status:** `[ ]`  
**Título:** Implementar botão "Confirmar Transferência"

**Descrição:**  
Ver fluxo detalhado em `PLANNING.md §2.4 > E-RX-02`.

**Critérios de aceite:**
- [ ] Disponível apenas para transferências com status "aguardando confirmação".
- [ ] Exibe resumo: origem, destino, produtos, quantidades.
- [ ] Ao confirmar: atualiza saldo origem (débito) e destino (crédito) em transação atômica.
- [ ] Gera documento de transferência (PDF disponível para download).
- [ ] Notificação para ambas as unidades.
- [ ] Histórico de transferências atualizado.

**Resultado:** *(preencher após implementação)*

---

### TASK-EST-007
**Prioridade:** P2  
**Status:** `[ ]`  
**Título:** Implementar botão "Conferir Agora"

**Critérios de aceite:**
- [ ] Abre tela de conferência de itens pendentes (ex: pós-recebimento de NF).
- [ ] Lista itens para conferir com quantidade esperada vs. campo para quantidade conferida.
- [ ] Ao finalizar conferência, registra divergências e status da conferência.

**Resultado:** *(preencher após implementação)*

---

### TASK-EST-008
**Prioridade:** P3  
**Status:** `[ ]`  
**Título:** Implementar botão "Exportar Relatório" (Estoque)

**Critérios de aceite:**
- [ ] Modal de opções: formato (Excel/PDF), filtros (categoria, fornecedor, status, validade).
- [ ] Exportação gerada no backend.
- [ ] Download automático ao concluir.
- [ ] Log de auditoria da exportação (usuário, filtros, data).

**Resultado:** *(preencher após implementação)*

---

### TASK-EST-009
**Prioridade:** P3  
**Status:** `[ ]`  
**Título:** Implementar botão "Importar CSV" (Estoque)

**Critérios de aceite:**
- [ ] Abre file picker filtrado para `.csv`.
- [ ] Valida cabeçalho e formato antes de processar.
- [ ] Exibe prévia dos dados e erros encontrados.
- [ ] Importação com rollback em caso de falha.
- [ ] Relatório de resultado: registros importados, ignorados, com erro.
- [ ] Disponibilizar template CSV para download.

**Resultado:** *(preencher após implementação)*

---

## MÓDULO: NOTA FISCAL

---

### TASK-NF-001
**Prioridade:** P1  
**Status:** `[ ]`  
**Título:** Implementar botão "Importar XML" (NF-e)

**Descrição:**  
Ver fluxo detalhado em `PLANNING.md §2.4 > F-RX-01`.

**Critérios de aceite:**
- [ ] File picker para `.xml`.
- [ ] Validação de schema NF-e v4.00 antes de processar.
- [ ] Extração de dados: emitente, destinatário, produtos, valores, impostos, chave de acesso.
- [ ] Mapeamento automático de produtos por EAN ou código.
- [ ] Tela de conferência: itens mapeados, itens não reconhecidos (para cadastro manual).
- [ ] Exibir alertas para produtos com variação de preço > X% em relação ao último custo.

**Dependências:** TASK-NF-002, TASK-NF-003, TASK-NF-004, TASK-NF-005

**Resultado:** *(preencher após implementação)*

---

### TASK-NF-002
**Prioridade:** P1  
**Status:** `[ ]`  
**Título:** Implementar botão "Finalizar Entrada" (NF-e)

**Critérios de aceite:**
- [ ] Disponível apenas quando NF está em status de conferência ou rascunho.
- [ ] Confirma a entrada: atualiza estoque, registra custo de entrada, gera lançamento financeiro (conta a pagar se prazo).
- [ ] NF recebe status `FINALIZADA` — somente leitura após este ponto.
- [ ] Geração de etiquetas de produtos opcional pós-finalização.

**Resultado:** *(preencher após implementação)*

---

### TASK-NF-003
**Prioridade:** P2  
**Status:** `[ ]`  
**Título:** Implementar botão "Salvar Rascunho" (NF-e)

**Critérios de aceite:**
- [ ] Salva estado atual da NF em importação (mesmo incompleta).
- [ ] NF fica com status `RASCUNHO` na lista de entradas.
- [ ] Permite retomar em outro momento sem reprocessar o XML.
- [ ] Toast de confirmação de salvamento.

**Resultado:** *(preencher após implementação)*

---

### TASK-NF-004
**Prioridade:** P2  
**Status:** `[ ]`  
**Título:** Implementar botão "Marcar Todos como OK" (NF-e)

**Critérios de aceite:**
- [ ] Marca todos os itens da conferência como conferidos (aceita mapeamento sugerido).
- [ ] Deve exigir confirmação via modal (ação em lote).
- [ ] Itens sem mapeamento são excluídos da seleção em lote (permanecem pendentes).

**Resultado:** *(preencher após implementação)*

---

### TASK-NF-005
**Prioridade:** P2  
**Status:** `[ ]`  
**Título:** Implementar botão "Aplicar Arredondamento Fiscal" (NF-e)

**Critérios de aceite:**
- [ ] Ajusta valores de impostos conforme regras de arredondamento SEFAZ (2 casas decimais, arredondamento comercial).
- [ ] Exibe diferença antes/depois para aprovação do usuário.
- [ ] Aplicado antes de finalizar a entrada.
- [ ] Regras configuráveis por UF (verificar legislação estadual aplicável).

**Resultado:** *(preencher após implementação)*

---

## MÓDULO: PBM

---

### TASK-PBM-001
**Prioridade:** P1  
**Status:** `[ ]`  
**Título:** Implementar fluxo completo Farmácia Popular (HÓRUS)

**Descrição:**  
Ver fluxo detalhado em `PLANNING.md §2.4 > B-RX-01`.

**Critérios de aceite:**
- [ ] Sistema identifica automaticamente medicamentos da lista Farmácia Popular.
- [ ] Exige CPF do cliente para dispensação.
- [ ] Tela de confirmação exibe preço ao cliente (R$ 0,00), custo farmácia e ressarcimento governo (visível apenas para gerente/admin).
- [ ] Captura de receita digitalizada (obrigatório para medicamentos de prescrição).
- [ ] Geração de lote HÓRUS para transmissão DATASUS.
- [ ] Acompanhamento de status do lote (enviado → processado → aprovado → ressarcido).
- [ ] Conciliação financeira: relatório de aprovados, glosados e pendentes.
- [ ] Controle de acesso por perfil (operador vê apenas preço ao cliente).

**Dependências:** Definição do layout de arquivo HÓRUS/DATASUS. Verificar versão atual em: http://www.saude.gov.br/farmacia-popular

**Resultado:** *(preencher após implementação)*

---

### TASK-PBM-002
**Prioridade:** P2  
**Status:** `[ ]`  
**Título:** Implementar pesquisa de médico/CRM em PBM

**Descrição:**  
Ver decisão de arquitetura em `PLANNING.md §2.4 > B-RX-02`.

**Critérios de aceite:**
- [ ] Campo de busca por CRM (parcial), nome ou especialidade.
- [ ] Busca primeiro na base local (offline-first).
- [ ] Botão "Buscar online (CFM)" para consulta em tempo real.
- [ ] Resultados: nome, CRM, UF, especialidade, situação no conselho.
- [ ] Seleção preenche CRM automaticamente no formulário de receita.
- [ ] Opção de salvar médico na base local para futuras buscas.
- [ ] Dados de médico armazenados conforme LGPD (dados profissionais públicos — sem dados pessoais do paciente).

**Dependências:** Validar disponibilidade e SLA da API CFM antes de implementar consulta online.

**Resultado:** *(preencher após implementação)*

---

## MÓDULO: RECEITA DIGITAL

---

### TASK-REC-001
**Prioridade:** P1  
**Status:** `[ ]`  
**Título:** Implementar botão "Importar Receita"

**Critérios de aceite:**
- [ ] Suporta: upload de imagem (JPG/PNG) ou PDF da receita.
- [ ] Suporta: QR Code de receita digital (RNDS/RES) se aplicável.
- [ ] Preview da receita importada.
- [ ] Extração de dados via OCR ou parse do QR (médico, CRM, medicamentos, posologia, validade).
- [ ] Dados extraídos pré-preenchem formulário de dispensação — usuário pode corrigir.
- [ ] Receita armazenada vinculada à venda/dispensação (rastreabilidade SNGPC).
- [ ] LGPD: receita armazenada com controle de acesso (apenas usuários autorizados visualizam).

**Resultado:** *(preencher após implementação)*

---

## MÓDULO: WHATSAPP

---

### TASK-WA-001
**Prioridade:** P2  
**Status:** `[ ]`  
**Título:** Corrigir espaçamento dos botões de ação no WhatsApp

**Arquivo(s) alvo:** `src/modules/whatsapp/components/WhatsAppActions.tsx` *(verificar path)*

**Critérios de aceite:**
- [ ] Botões com espaçamento uniforme (`gap` ou `margin` consistente com design system).
- [ ] Sem sobreposição em telas menores (responsivo).
- [ ] Alinhamento vertical consistente com ícones e labels.

**Resultado:** *(preencher após implementação)*

---

### TASK-WA-002
**Prioridade:** P2  
**Status:** `[ ]`  
**Título:** Adicionar scroll na lista de conversas do WhatsApp

**Critérios de aceite:**
- [ ] Container da lista de conversas com `overflow-y: auto` e altura máxima definida.
- [ ] Scroll suave (`scroll-behavior: smooth`).
- [ ] Scroll infinito ou paginação para listas longas (>50 conversas).
- [ ] Posição do scroll mantida ao retornar para a lista após abrir conversa.

**Resultado:** *(preencher após implementação)*

---

### TASK-WA-003
**Prioridade:** P2  
**Status:** `[ ]`  
**Título:** Implementar botão "Anexar Arquivo" no WhatsApp

**Critérios de aceite:**
- [ ] File picker com tipos permitidos: imagem (JPG/PNG/WEBP), PDF, documento.
- [ ] Limite de tamanho: 16MB (limite WhatsApp Business API).
- [ ] Preview do arquivo antes de enviar.
- [ ] Upload para servidor intermediário → envio via WhatsApp Business API.
- [ ] Feedback de progresso durante upload.
- [ ] Tratamento de erro: arquivo muito grande, tipo não suportado, falha de envio.

**Resultado:** *(preencher após implementação)*

---

### TASK-WA-004
**Prioridade:** P3  
**Status:** `[ ]`  
**Título:** Implementar Ações Rápidas no WhatsApp (ex: Consultar Produto)

**Descrição:**  
Ver arquitetura em `PLANNING.md §2.4 > W-RX-01`.

**Critérios de aceite:**
- [ ] Menu de ações rápidas acessível na tela de conversa.
- [ ] Ação "Consultar Produto": abre busca de produto, resultado formatado enviado como mensagem.
- [ ] Ação "Consultar Pedido": busca status de pedido/venda do cliente.
- [ ] Ação "Enviar Boleto/Comprovante": seleciona documento e envia como anexo.
- [ ] Ações extensíveis (arquitetura de plugin para adicionar novas ações sem refatoração).

**Resultado:** *(preencher após implementação)*

---

## MÓDULO: FIDELIZAÇÃO

---

### TASK-FID-001
**Prioridade:** P3  
**Status:** `[ ]`  
**Título:** Implementar botão "Exportar Base" (Fidelização)

**Critérios de aceite:**
- [ ] Modal de opções: formato (Excel/CSV), filtros (data de cadastro, cidade, faixa de pontos, ativo/inativo).
- [ ] Campos exportados: nome, telefone, e-mail, pontos, data último acesso — **sem CPF em exportações para uso externo**.
- [ ] Exportação gerada no backend.
- [ ] LGPD: log de exportação registrado (usuário, data, finalidade declarada).
- [ ] Confirmação de finalidade antes de exportar.

**Resultado:** *(preencher após implementação)*

---

## MÓDULO: PRECIFICADOR

---

### TASK-PRE-001
**Prioridade:** P2  
**Status:** `[ ]`  
**Título:** Implementar botão "Simular Cenário" (Precificador)

**Critérios de aceite:**
- [ ] Modal de configuração de cenário: margem desejada (%), desconto máximo (%), curva ABC.
- [ ] Simulação aplicada sobre seleção de produtos (categoria, fornecedor ou lista).
- [ ] Exibe: preço atual, preço sugerido, margem resultante, impacto no faturamento estimado.
- [ ] Resultado da simulação pode ser salvo como "cenário nomeado" para comparação.
- [ ] Cenário não altera preços reais — apenas simulação.

**Resultado:** *(preencher após implementação)*

---

### TASK-PRE-002
**Prioridade:** P2  
**Status:** `[ ]`  
**Título:** Implementar botão "Publicar Preço Sugerido" (Precificador)

**Critérios de aceite:**
- [ ] Disponível após simulação ou revisão de preços sugeridos.
- [ ] Seleção de produtos a publicar (individual ou em lote).
- [ ] Confirmação com resumo: quantidade de produtos, variação média de preço.
- [ ] Publicação atualiza preço de venda no cadastro do produto e no PDV.
- [ ] Histórico de publicações de preço (data, usuário, quantidade de produtos, variação).
- [ ] Opção de agendar publicação para data/hora futura.

**Resultado:** *(preencher após implementação)*

---

## MÓDULO: FINANCEIRO

---

### TASK-FIN-001
**Prioridade:** P2  
**Status:** `[ ]`  
**Título:** Implementar botão "Exportar" (Financeiro)

**Critérios de aceite:**
- [ ] Modal de opções: formato (Excel/PDF), período (data inicial/final), tipo (receitas, despesas, todos).
- [ ] Filtros adicionais: categoria, centro de custo, forma de pagamento.
- [ ] Exportação gerada no backend.
- [ ] Arquivo inclui totalizadores por categoria.
- [ ] Log de auditoria da exportação.

**Resultado:** *(preencher após implementação)*

---

### TASK-FIN-002
**Prioridade:** P2  
**Status:** `[ ]`  
**Título:** Desenvolver componente de consulta financeira de meses anteriores

**Descrição:**  
Ver especificação do componente em `PLANNING.md §2.4 > FIN-RX-01`.

**Critérios de aceite:**
- [ ] Navegação por mês com setas anterior/próximo.
- [ ] Cards de resumo: Receitas, Despesas, Saldo, A Receber.
- [ ] Gráfico de receitas vs. despesas por semana do mês.
- [ ] Tabela de lançamentos com filtros.
- [ ] Meses anteriores: somente leitura.
- [ ] Mês atual: permite novos lançamentos.
- [ ] Integrado ao botão Exportar (TASK-FIN-001) para exportar mês selecionado.

**Resultado:** *(preencher após implementação)*

---

## MÓDULO: CADASTRO DE PRODUTOS

---

### TASK-CAD-001
**Prioridade:** P2  
**Status:** `[ ]`  
**Título:** Identificar e implementar botão sem funcionalidade no Cadastro de Produtos

**Descrição:**  
Foi reportado que há botão(s) sem funcionalidade no módulo de Cadastro de Produtos, mas sem especificação de qual botão. **O agente deve primeiro inspecionar o componente de cadastro de produtos e identificar todos os botões sem handler implementado antes de implementar.**

**Pré-requisito para o agente:**
1. Listar todos os componentes do módulo `cadastro-produtos` ou equivalente.
2. Identificar botões com `onClick` vazio, `onClick={() => {}}`, `onClick={undefined}` ou sem handler.
3. Documentar os botões encontrados como sub-tasks neste item.
4. Implementar os handlers identificados.

**Critérios de aceite:**
- [ ] Todos os botões do módulo de Cadastro de Produtos possuem handler implementado.
- [ ] Nenhum botão retorna erro silencioso ou não faz nada ao ser clicado.
- [ ] Sub-tasks documentadas abaixo após inspeção.

**Sub-tasks identificadas:** *(preencher após inspeção do agente)*

**Resultado:** *(preencher após implementação)*

---

## Ordem de Implementação Sugerida

Para minimizar dependências, implementar nesta sequência:

```
1. TASK-PDV-003 (Pesquisar PDV) — independente, baixo risco
2. TASK-WA-001 (Espaçamento WA) — CSS puro, baixo risco
3. TASK-WA-002 (Scroll WA) — CSS/JS simples
4. TASK-NF-003 (Salvar Rascunho NF) — independente
5. TASK-EST-001 (Nova Entrada) — base para outros fluxos
6. TASK-NF-001 (Importar XML) — depende de TASK-NF-003/004/005
7. TASK-NF-002 (Finalizar Entrada NF) — depende de TASK-NF-001
8. TASK-NF-004 (Marcar todos OK) — depende de TASK-NF-001
9. TASK-NF-005 (Arredondamento Fiscal) — depende de TASK-NF-001
10. TASK-EST-002 (Iniciar Inventário) — depende de TASK-EST-003
11. TASK-EST-003 (Salvar Ajuste)
12. TASK-PDV-001 (Fechar Caixa) — crítico, testar extensivamente
13. TASK-PDV-002 (Histórico Caixa)
14. TASK-EST-004 (Revisar Agora)
15. TASK-EST-005 (Solicitar Reposição) — depende de TASK-EST-004
16. TASK-EST-006 (Confirmar Transferência)
17. TASK-EST-007 (Conferir Agora)
18. TASK-EST-008 (Exportar Relatório Estoque)
19. TASK-EST-009 (Importar CSV)
20. TASK-REC-001 (Importar Receita)
21. TASK-WA-003 (Anexar Arquivo WA)
22. TASK-FIN-002 (Histórico Financeiro) — componente novo
23. TASK-FIN-001 (Exportar Financeiro) — depende de TASK-FIN-002
24. TASK-PRE-001 (Simular Cenário)
25. TASK-PRE-002 (Publicar Preço) — depende de TASK-PRE-001
26. TASK-FID-001 (Exportar Base Fidelização)
27. TASK-WA-004 (Ações Rápidas WA)
28. TASK-CAD-001 (Cadastro Produtos) — inspecionar primeiro
29. TASK-PBM-002 (Pesquisa Médico CRM)
30. TASK-PBM-001 (Farmácia Popular) — maior complexidade, implementar por último
```
