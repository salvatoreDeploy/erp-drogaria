# Farmacorp ERP — Software Design Document (SDD)

> Documento vivo. Atualizar a cada decisão de arquitetura, novo módulo ou mudança de escopo.
> Última atualização: 2026-05-20

---

## 1. Visão geral

ERP web para farmácias independentes e redes pequenas. Substitui sistemas legados fragmentados (PDV separado, planilha de estoque, SNGPC manual) com uma plataforma unificada e moderna.

**Personas principais:**

| Perfil | Responsabilidades |
|---|---|
| `operador_caixa` | Atendimento no PDV, abertura/fechamento de caixa, PBM, receita digital |
| `farmaceutico` | Liberação de controlados, SNGPC, conferência de NF-e, relatórios |
| `admin` | Cadastros, usuários, permissões, configurações, financeiro |

**Stack frontend:** React 19 · Vite 8 · TypeScript 6 · Tailwind v4 · React Router v7
**Stack backend (sugerida):** Node.js · Fastify · Prisma · PostgreSQL · Bull (filas)

---

## 2. Módulos e status de implementação

### 2.1 OPERAÇÃO — Grupo 1 (completo)

| Módulo | Rota(s) | Status | Padrão de tela |
|---|---|---|---|
| PDV | `/pdv`, `/pdv/abertura-caixa`, `/pdv/fechamento-caixa`, `/pdv/finalizar` | ✅ Implementado | Duas colunas + painel direito fixo |
| Estoque | `/estoque`, `/estoque/ajuste` | ✅ Implementado | Duas colunas / Coluna única |
| Fiscal NF-e | `/fiscal`, `/fiscal/entrada-nfe` | ✅ Implementado | Hub único / Wizard 3 etapas |
| PBM / Popular | `/pbm` | ✅ Implementado | Wizard 3 etapas |
| Receita Digital | `/receita` | ✅ Implementado | Single-page multi-estado 5 fases |

### 2.2 OPERAÇÃO — Fluxos pendentes (modais nas telas prontas)

Legenda: ✅ Implementado (mock) · ⬜ Pendente. Ordenados por dependência — completar antes de abrir novos módulos.

#### PDV

| # | Status | Fluxo | Gatilho | Endpoints |
|---|---|---|---|---|
| P-01 | ✅ | Modal: Produto controlado | Botão "Vincular" na col. SNGPC para item `controlado: true` | `ModalControladoInline`: CPF + n.º receita + CRM; banner Portaria 344; bloqueia "Finalizar venda" até vincular. Cart convertido para `useState<CartItem[]>`. |
| P-02 | ✅ | Modal: Aplicar PBM inline | Botão "PBM" por item no carrinho | `POST /api/v1/pdv/validar-pbm-inline` — mock; CPF + convênio → card resultado "Elegível 45%"; "Aplicar desconto" fecha modal |
| P-03 | ✅ | Modal: Sangria | Botão no rodapé do PDV | `POST /api/v1/pdv/sangria` |
| P-04 | ✅ | Modal: Suprimento | Botão no rodapé do PDV | `POST /api/v1/pdv/suprimento` |
| P-05 | ✅ | Estado: Caixa fechado | `/pdv` sem `?caixaAberto=true` | Bloqueio com CTA → `/pdv/abertura-caixa` |

**Notas P-01:** Modal captura CPF + `receita_id` + CRM. Bloqueia "Finalizar venda" se item controlado não tiver receita vinculada. Exibe aviso de registro SNGPC pendente.

**Notas P-02:** Mais leve que o wizard `/pbm`. Retorna apenas `{ elegivel, desconto_valor, autorizacao_id }` para aplicar ao item no carrinho.

#### Estoque

| # | Status | Fluxo | Gatilho | Endpoints |
|---|---|---|---|---|
| E-01 | ✅ | Modal: Solicitar reposição | Botão "Repor" em item `critico`/`comprar` | `POST /api/v1/estoque/reposicao/solicitar` — mock; select fornecedor + qtd sugerida pré-preenchida + obs opcional |
| E-02 | ✅ | Modal: Transferência | Botão "Transferir" na coluna Ações (todos os itens) | `POST /api/v1/estoque/transferencia` — mock; select filial + qtd (max estoque atual) + motivo |
| E-03 | ✅ | Filtro: Por validade | Toggle na barra de filtros | Ordenação local por `validade_dias` asc (sem API extra) |

#### Fiscal — Hub

| # | Status | Fluxo | Gatilho | Endpoints |
|---|---|---|---|---|
| F-01 | ✅ | Modal: Carta de correção | Botão "Emitir carta de correção" em Ações rápidas | `POST /api/v1/fiscal/nfe/carta-correcao` — mock; select NF-e + textarea min 15/max 1000 chars; botão habilitado só quando válido |
| F-02 | ✅ | Modal: Cancelar NF-e | Botão "Cancelar" por linha `autorizada` no Histórico recente | `POST /api/v1/fiscal/nfe/{id}/cancelar` — mock; banner danger + select motivo + checkbox confirmação; `bg-danger-600` |
| F-03 | ✅ | Estado: SEFAZ offline | Demo switcher no header | Chip + banner warning; estado local `useState(true)` |

#### PBM

| # | Status | Fluxo | Gatilho | Endpoints |
|---|---|---|---|---|
| B-01 | ✅ | Modal: Histórico do paciente | Botão "Ver histórico" no campo CPF | `GET /api/v1/pbm/historico/{cpf}` — mock local |
| B-02 | ✅ | Envio ao caixa (Etapa 3) | Botão "Finalizar e enviar ao caixa" | `navigate('/pdv?caixaAberto=true', { state: { pbm_autorizacao_id } })` → banner verde no PDV |

#### Receita Digital

| # | Status | Fluxo | Gatilho | Endpoints |
|---|---|---|---|---|
| R-01 | ✅ | Modal: Histórico do paciente | Botão "Histórico" no card do paciente | `GET /api/v1/receita/historico?cpf={cpf}` — mock local |
| R-02 | ✅ | Integração com PDV | Botão "Concluir atendimento →" (status validado) | `navigate('/pdv?caixaAberto=true', { state: { receita_id, meds } })` → banner info no PDV |
| R-03 | ✅ | Confirmação SNGPC | Após liberar controlado | Card `bg-brand-25` com protocolo `SNGPC-2026-008847`, medicamento e aviso Portaria 344. Mock `POST /api/v1/receita/{id}/liberar`. |

#### Entrada NF-e

| # | Status | Fluxo | Gatilho | Endpoints |
|---|---|---|---|---|
| N-01 | ✅ | Vincular produto sem catálogo | Item com `no_catalog: true` (Etapa 2) | `CelulaBusca`: debounce ≥2 chars → filtra `CATALOGO_MOCK` → dropdown `onMouseDown` → badge "Vinculado". Mock `GET /api/v1/produtos/buscar?q={termo}`. |

---

### 2.3 GESTÃO E CADASTROS — Próximos módulos

Ordenados por prioridade de negócio e dependência entre módulos.

#### 🔴 PRIORIDADE ALTA

---

**SNGPC** — `/sngpc` ✅ Implementado (Fase 3)

Obrigatório por lei (RDC ANVISA 204/2017). Farmácias com medicamentos sujeitos a controle especial devem enviar movimentações periodicamente à ANVISA.

**Schema criado:** `src/schemas/sngpc.ts` — `MovimentacaoSngpc`, `LoteEnvioSngpc`, `SngpcModuloStatus`, `ConferenciaBody`, `EnvioLoteBody`

*Fluxo principal:*
1. Painel mostra métricas: pendentes, enviados hoje, divergências
2. Lista de movimentações de controlados pendentes de conferência (saída por dispensação, entrada por compra)
3. Farmacêutico revisa cada entrada — marca `conferido` ou `divergência`
4. Seleciona lote de conferidos → envia em batch à ANVISA → recebe protocolo
5. Histórico de envios com XML disponível para download

*Padrão de tela sugerido:* Duas colunas — esquerda: lista de movimentações com filtros e seleção múltipla; direita: painel de ação (botão enviar lote, métricas, histórico recente)

*Implementado:*
- Layout duas colunas: tabela com checkbox multi-seleção (esq.) + painel métricas + ações + histórico (dir.)
- 20 movimentações mock: 15 saída, 3 entrada, 2 ajuste (mix pendente/conferido/divergencia)
- 5 lotes históricos mock (4 aceitos, 1 rejeitado_parcial)
- `ModalDetalheMovimentacao` — ReadonlyFields + textarea observação + botões Conferir/Divergência
- Conferência em lote: "Conferir selecionadas" + "Enviar lote N"
- Card de protocolo pós-envio + demo switcher ANVISA online/offline
- `TODO: GET /api/v1/sngpc/status`
- `TODO: GET /api/v1/sngpc/movimentacoes-pendentes?tipo=&data=`
- `TODO: PATCH /api/v1/sngpc/movimentacoes/{id}`
- `TODO: POST /api/v1/sngpc/enviar-lote`
- `TODO: GET /api/v1/sngpc/lotes`

---

**Cadastro de Produtos** — `/cadastros/produtos` ✅ Implementado

Rota: `/cadastros/produtos` — `CadastroProdutosPage.tsx`

*Implementado:*
- Header com métricas (total / ativos / controlados) via `useMemo`
- Busca por nome, EAN e fabricante + filtro de categoria + toggle "Controlados"
- Tabela com 12 produtos mock: Nome | EAN | Categoria | Preço venda | Est. mín. | Controlado | Status | Ações
- `ModalProduto` — CRUD completo: 4 grupos (Identificação / Comercial / Estoque / Classificação), 15+ campos, 4 flags via `FlagToggle`, validação inline DCB obrigatório para controlado
- `ModalImportCSV` — 2 etapas: upload drag & drop → preview 5 primeiros + lista de erros → confirmar
- Soft delete via toggle de status (● / ○)
- `TODO: GET/POST/PUT/DELETE /api/v1/cadastros/produtos`

---

**Cadastro de Clientes** — `/cadastros/clientes` ✅ Implementado

Rota: `/cadastros/clientes` — `CadastroClientesPage.tsx`

*Implementado:*
- Header com métricas (total / ativos / com convênio / pontos emitidos / novos mês) via `useMemo`
- Alerta de aniversariantes da semana
- Busca por CPF/nome/telefone + filtro de convênio
- Tabela paginada com 8 clientes mock: Nome | CPF | Telefone | Convênio | Pontos | Status | Ações
- Painel direito: formulário de criação/edição com campos Dados Pessoais, Endereço, Saúde e Comunicação
- Toggles aceitar WhatsApp / aceitar SMS
- `ModalHistoricoCliente` — tabela de receitas e atendimentos PBM anteriores
- Soft delete via toggle de status
- `TODO: GET/POST/PUT/DELETE /api/v1/cadastros/clientes`

---

#### 🟡 PRIORIDADE MÉDIA

---

**Financeiro** — `/financeiro` ✅ Implementado (Fase 4)

Contas a pagar são geradas automaticamente pela entrada de NF-e (backend já especificado).

**Schema criado:** `src/schemas/financeiro.ts` — `ContaPagar`, `BaixaContaPagar`, `ResumoFinanceiro`, `ContaPagarStatus`, `FormasPagamento`

*Implementado:*
- Layout duas colunas: lista de contas a pagar com filtros (esq.) + métricas + conta selecionada + baixa (dir.)
- 15 contas mock: 6 aberta, 4 atrasada, 4 paga, 1 cancelada — Plasma Sul, Medley, EMS, Cristália, Profarma
- `ModalBaixaContaPagar` — validação `BaixaContaPagarSchema.safeParse()` com exibição de erros por campo
- Stats ao vivo via `useMemo`: vence_hoje, em_atraso, proximos_30d, total_aberto
- Clique na linha seleciona conta; baixa disponível somente para 'aberta' ou 'atrasada'
- `TODO: GET /api/v1/financeiro/contas-pagar?status=&fornecedor_id=&page=`
- `TODO: POST /api/v1/financeiro/contas-pagar/{id}/baixar`
- `TODO: GET /api/v1/financeiro/resumo`

---

**Cadastro de Fornecedores** — `/cadastros/fornecedores` ✅ Implementado

Rota: `/cadastros/fornecedores` — `CadastroFornecedoresPage.tsx`

*Implementado:*
- Header com métricas (ativos / CNPJ pendente / prazo de resposta / pedidos recentes / histórico fiscal) via `useMemo`
- Banner "Fiscal e contratos" (bg-warning-25) com 3 alertas: CNPJ irregular / Sem contrato / Prazo vencido
- Busca por razão social, CNPJ ou cidade
- Tabela com 7 fornecedores mock: Fornecedor | Cidade | Tipo | Forma Pagto | Entrega | Status | Ações
- Badge de tipo colorido: Fabricante (info) / Distribuidor (brand) / Representante (warning)
- `ModalFornecedorForm` — CRUD completo: 4 seções (Dados da empresa / Contato / Endereço / Condições comerciais), 22 campos
- `ModalPedidosFornecedor` — tabela read-only com últimos pedidos/NF-e
- Soft delete via campo status no modal
- `TODO: GET/POST/PUT/DELETE /api/v1/cadastros/fornecedores`

---

**WhatsApp / CRM** — `/whatsapp` ✅ Implementado (Fase 5, refatorado 2026-05-19)

**Schema criado:** `src/schemas/whatsapp.ts` — `MensagemWhatsApp`, `TemplateWhatsApp`, `CampanhaWhatsApp`, `NovaCampanha`, `EnvioMensagem`

*Implementado (versão unificada — 3 abas):*
- **3 abas:** Hub · Atendimentos · Campanhas (AbaConversas + AbaAtendimento fundidas em AbaAtendimentos)
- **Hub:** status QR conectado, métricas de fila, card QR Code, card automação, log de interações com SLA
- **Atendimentos (3 painéis unificados):**
  - Esquerda (280px): lista única de conversas com filtro por status (Todos/Aguardando/Em atendimento/Resolvidos) + busca + badge unread
  - Centro (flex-1): `ChatPanelShared` — header com status + bubbles + inputbar
  - Direita (360px): `ClienteHeader` fixo + 4 tabs — **Orçamento** (busca produto → enviar no chat → converter pedido) · **Receita** (validar receita digital vinculada) · **Pedido** (confirmar + separar) · **Histórico** (compras/receitas anteriores)
  - Máquina de estados: `aguardando → em_atendimento → resolvido` — uma conversa, um estado
- **Campanhas:** métricas + tabela + ações rápidas + templates, `ModalNovaCampanha` com `NovaCampanhaSchema.safeParse()`
- Spec canônico: `.spec/whatsapp-atendimentos.spec.md` (substitui whatsapp-conversas.spec.md + whatsapp-atendimento.spec.md)
- `TODO: GET /api/v1/whatsapp/conversas?status=` + `POST /api/v1/whatsapp/conversas/{id}/send`
- `TODO: POST /api/v1/whatsapp/conversas/{id}/iniciar` + `POST /api/v1/whatsapp/conversas/{id}/encerrar`
- `TODO: POST /api/v1/whatsapp/conversas/{id}/orcamento/enviar`
- `TODO: POST /api/v1/whatsapp/conversas/{id}/pedido/separar`
- `TODO: POST /api/v1/whatsapp/enviar` + `GET /api/v1/whatsapp/templates` + `POST /api/v1/whatsapp/campanha`
- `TODO: WS /api/v1/whatsapp/ws` (tempo real)

---

**Relatórios** — `/relatorios` ✅ Implementado (Fase 6)

**Schema criado:** `src/schemas/relatorio.ts` — `TipoRelatorio`, `FormatoExportacao`, `RelatorioConfig`, `ExportacaoStatus`

*Implementado:*
- Layout coluna única: 5 cards de categoria (Vendas/Estoque/SNGPC/PBM/Financeiro) com toggle de seleção
- 7 tipos de relatório: vendas_periodo, curva_abc, estoque_atual, validade, sngpc_movimentacoes, pbm_atendimentos, contas_pagar
- Painel de filtros condicional: select de tipo + período (data início/fim) + botões PDF e Excel
- Preview de dados mock com tabela de colunas dinâmicas por tipo de relatório
- Card de sucesso pós-exportação com arquivo_url, registros, timestamp
- Mock async de exportação via setTimeout (900ms) — `// TODO: POST /api/v1/relatorios/gerar`
- `canExportar` = tipo + datas + não exportando (botões desabilitados automaticamente)

---

#### 🟢 PRIORIDADE NORMAL

---

**Fidelização** — `/fidelizacao` ✅ Implementado (2026-05-19)

**Schema criado:** `src/schemas/fidelizacao.ts` — `SegmentoFidelidade`, `CampanhaFidelizacao`, `NovaCampanhaFidelizacao`, `TransacaoPontos`

*Implementado:*
- Layout duas colunas: pontuação por segmento com progress bars + top clientes (esq. 620px) · campanhas + transações (dir.)
- 4 segmentos: Bronze / Prata / Ouro / Diamante com badge colorido e barra de distribuição
- `ModalNovaCampanha` — `NovaCampanhaFidelizacaoSchema.safeParse()` com tipo + período
- `TODO: GET /api/v1/fidelizacao/transacoes · POST /api/v1/fidelizacao/campanhas`

---

**Precificador** — `/precificador` ✅ Implementado (2026-05-19)

**Schema criado:** `src/schemas/precificador.ts` — `StatusMargem`, `ProdutoPrecificador`, `SimulacaoPreco`

*Implementado:*
- Layout duas colunas: calculadora de faixas (45%/55%/65%) + produtos críticos (esq. 620px) · concorrentes + ações rápidas (dir.)
- 7 produtos mock com `status_margem: ok | alerta | critico` — rows #FFFDF8 border #F0E4D1
- Comparação com 3 concorrentes via barras de margem visual
- `TODO: GET /api/v1/precificador/produtos · POST /api/v1/precificador/publicar`

---

**Administração** — `/administracao` ✅ Implementado (2026-05-19)

**Schema criado:** `src/schemas/administracao.ts` — `UsuarioAdmin`, `NovoUsuario`, `ConfigFarmacia`, `ConfigSistema`, `AuditLog`

*Implementado:*
- 2 abas: Operacional (6 módulos + ModalUsuarios CRUD) · Plataforma (6 módulos + observabilidade / health checks)
- Summary row por aba: 3 cards (2 neutros + 1 warning amarelo)
- `ModalUsuarios` — toggle ativo/inativo + formulário `NovoUsuarioSchema.safeParse()` com confirmação de senha
- Painel direito fixo (360px): audit log com bullets · alerta crítico (bg #FFF2EF)
- `TODO: GET/POST/PATCH /api/v1/administracao/usuarios`

---

### 2.4 REFINAMENTOS UX — Fluxos pendentes nas telas existentes

Melhorias identificadas para elevar a qualidade operacional das telas já implementadas. Nenhuma nova rota — são aprofundamentos de UX dentro dos módulos existentes.

Legenda: ⬜ Pendente · 🔴 Alta · 🟡 Média · 🟢 Normal

#### PDV (`/pdv/fechamento-caixa`)

| # | Prioridade | Refinamento | Spec |
|---|---|---|---|
| P-RX-01 | 🔴 | **Fechamento de caixa — fluxo completo** | Ver spec abaixo |
| P-RX-02 | 🟡 | **Histórico de caixa — modal/drawer** | Ver spec abaixo |

**P-RX-01 — Fluxo de fechamento:**
```
[Usuário clica "Fechar Caixa"]
  → Verificar se há vendas pendentes/abertas
  → Exibir resumo: total vendas, formas de pagamento, sangrias
  → Solicitar conferência do valor em espécie (contagem física)
  → Calcular diferença (sistema vs. físico)
    → Diferença > R$ 50: campo motivo obrigatório (RN-09)
  → Gerar relatório Z (fechamento)
  → Registrar evento com timestamp e operador
  → Bloquear novas vendas no caixa
  → Redirecionar para tela de abertura de caixa
```
*Critério de aceite:* Caixa fechado impede novas transações. Relatório Z disponível para impressão/download. `TODO: POST /api/v1/pdv/fechar`

**P-RX-02 — Histórico de caixa:**
```
[Usuário clica "Ver Histórico de Caixa"]
  → Modal/drawer: filtros período + operador
  → Lista de fechamentos: data, operador, total, status
  → Clique no item: detalhamento (vendas, pagamentos, diferenças)
  → Botão exportar relatório do fechamento selecionado
```
*`TODO: GET /api/v1/pdv/historico-caixa?data_inicio=&data_fim=&operador_id=`*

#### Estoque (`/estoque`, `/estoque/ajuste`)

| # | Prioridade | Refinamento | Spec |
|---|---|---|---|
| E-RX-01 | 🟡 | **Inventário — fluxo guiado completo** | Ver spec abaixo |
| E-RX-02 | 🟢 | **Transferência — confirmação atômica** | Ver spec abaixo |

**E-RX-01 — Inventário:**
```
[Usuário clica "Iniciar Inventário"]
  → Selecionar escopo: geral ou por categoria/setor
  → Opção: inventário "cego" (sem qtd visível) ou com saldo atual
  → Operador registra contagens físicas
  → Sistema compara com saldo → exibe divergências
  → Divergência > 5%: exige aprovação de farmacêutico (RN-05)
  → "Salvar Ajuste" → movimento de ajuste com motivo
  → Log de auditoria
```
*`TODO: POST /api/v1/estoque/inventario/iniciar · PATCH /api/v1/estoque/inventario/{id}/item · POST /api/v1/estoque/inventario/{id}/finalizar`*

**E-RX-02 — Confirmação de transferência:**
```
[Destino confirma recebimento]
  → Validar status "aguardando_confirmacao"
  → Verificar saldo disponível na origem
  → Atualizar saldos em ambos os locais (transação atômica)
  → Notificar origem e destino
  → Gerar documento de transferência
```
*`TODO: POST /api/v1/estoque/transferencia/{id}/confirmar`*

#### NF-e Entrada (`/fiscal/entrada-nfe`)

| # | Prioridade | Refinamento | Spec |
|---|---|---|---|
| F-RX-01 | 🟡 | **Importação de XML NF-e v4.00** | Ver spec abaixo |

**F-RX-01 — Importação XML:**
```
[Usuário clica "Importar XML"]
  → File picker filtrado para .xml
  → Validar schema NF-e v4.00 antes de processar
  → Extrair: fornecedor, CNPJ, produtos, valores, impostos
  → Mapear produtos por EAN/código para cadastro interno
  → Tela de conferência: reconhecidos vs. não reconhecidos
  → "Marcar todos como OK" → aceitar mapeamento em lote
  → "Aplicar Arredondamento Fiscal" → ajustar casas decimais SEFAZ
  → "Salvar Rascunho" → persistir sem finalizar
  → "Finalizar Entrada" → confirmar, atualizar estoque, lançar financeiro
```
*Schema: https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=BMPFMBoC3fU=*
*`TODO: POST /api/v1/fiscal/nfe/importar-xml`*

#### PBM (`/pbm`)

| # | Prioridade | Refinamento | Spec |
|---|---|---|---|
| B-RX-01 | 🔴 | **Farmácia Popular — fluxo HÓRUS completo** | Ver spec abaixo |
| B-RX-02 | 🟡 | **Pesquisa de médico/CRM — offline-first + CFM** | Ver spec abaixo |

**B-RX-01 — Fluxo Farmácia Popular (HÓRUS):**

> **Contexto regulatório:** O Programa Farmácia Popular custeia 100% de medicamentos da lista básica. A farmácia dispensa gratuitamente e registra para ressarcimento pelo Ministério da Saúde via DATASUS/HÓRUS.

```
1. Atendente seleciona medicamento no PDV
2. Sistema identifica: consta na lista Farmácia Popular?
   → SIM: ativa fluxo PBM Popular
   → NÃO: venda normal

3. Se PBM Popular:
   a. CPF do cliente (obrigatório)
   b. Validar cadastro no HÓRUS (API ou offline se indisponível)
   c. Exibir confirmação:
      ┌─────────────────────────────────────┐
      │ Medicamento: [Nome]                 │
      │ Preço de tabela: R$ XX,XX           │
      │ Desconto governo (100%): R$ XX,XX   │
      │ VALOR PARA O CLIENTE: R$ 0,00       │
      │ [INFO OPERADOR]                     │
      │ Custo para a farmácia: R$ XX,XX     │
      │ Ressarcimento governo: R$ XX,XX     │
      └─────────────────────────────────────┘
   d. Capturar assinatura/digital do cliente (se dispositivo disponível)
   e. Escanear receita (obrigatório para prescrição)
   f. Finalizar dispensação → gerar registro HÓRUS (lote)

4. Processamento para ressarcimento:
   → Agrupamento de dispensações em lote (diário/semanal)
   → Geração de arquivo de transmissão HÓRUS
   → Envio ao DATASUS
   → Status: enviado → processado → aprovado → ressarcido
   → Conciliação: valor aprovado vs. valor dispensado
```

**Visibilidade por perfil:**
- `operador_caixa`: vê apenas preço ao cliente (R$ 0,00) e desconto aplicado
- `farmaceutico` / `admin`: vê custo farmácia + valor ressarcimento + status lote HÓRUS

*Critério de aceite:* Impedir dispensação sem CPF válido e receita digitalizada. Relatório de lote conforme layout DATASUS. Limite: 1 embalagem/mês por produto/CPF (RN-08).
*Dependência crítica:* Layout do arquivo HÓRUS (DATASUS) deve ser validado antes da implementação.
*`TODO: POST /api/v1/pbm/horus/dispensar · POST /api/v1/pbm/horus/enviar-lote · GET /api/v1/pbm/horus/conciliacao`*

**B-RX-02 — Pesquisa de médico/CRM (offline-first):**
```
[Receita com CRM ilegível]
  → Campo busca por: CRM parcial, nome, especialidade
  → Busca na base local (cache de médicos frequentes) — offline-first
  → Se não encontrado: botão "Buscar online (CFM)"
    → Chamar API CFM → exibir: nome, CRM, UF, especialidade, situação
  → Usuário seleciona → CRM preenchido automaticamente
  → Opção de salvar na base local para próxima vez
```
*LGPD: dados de médico são registros profissionais públicos (CRM). Dados de paciente nunca entram nessa base.*
*Dependência: validar disponibilidade/SLA da API CFM antes da implementação.*
*`TODO: GET /api/v1/medicos/buscar?q= · GET /api/v1/medicos/cfm?q= · POST /api/v1/medicos/salvar-local`*

#### WhatsApp (`/whatsapp`)

| # | Prioridade | Refinamento | Spec |
|---|---|---|---|
| W-RX-01 | 🟡 | **Melhorias de UI — scroll, anexos, ações rápidas** | Ver spec abaixo |

**W-RX-01 — Problemas identificados e soluções:**

| Problema | Solução |
|---|---|
| Lista de conversas sem scroll | Adicionar `overflow-y-auto` no container da lista |
| Botão "Anexar Arquivo" sem ação | Handler de file picker + preview de imagem/PDF inline |
| Ações rápidas não implementadas | Interface `AcaoRapida { id, label, handler }` — consultar produto, enviar template, marcar urgente |
| Espaçamento entre botões de ação | Revisar gap e padding no painel direito conforme Pencil |

```typescript
interface AcaoRapida {
  id: string
  label: string
  handler: (conversaId: string) => Promise<void>
}
```

#### Financeiro (`/financeiro`)

| # | Prioridade | Refinamento | Spec |
|---|---|---|---|
| FIN-RX-01 | 🟢 | **Histórico mensal — componente de navegação** | Ver spec abaixo |

**FIN-RX-01 — Histórico mensal:**
```
← [Mês Anterior]   Maio 2026   [Mês Seguinte] →

Cards de resumo: Receitas · Despesas · Saldo · A Receber
Gráfico: receitas vs. despesas por semana
Tabela: lançamentos do mês com filtros
Botão: exportar mês (PDF/Excel)
```
*Regra: meses anteriores são somente leitura. Apenas o mês atual permite novos lançamentos.*
*`TODO: GET /api/v1/financeiro/historico-mensal?mes=&ano=`*

---

## 3. Integrações externas

| Sistema | Módulo(s) | Criticidade | Observação |
|---|---|---|---|
| **SEFAZ** (SOAP/REST por UF) | Fiscal | 🔴 Crítica | Transmissão de NF-e, consulta de status, contingência |
| **ANVISA / SNGPC** | SNGPC | 🔴 Crítica | Envio de movimentações de controlados — webservice SOAP |
| **DATASUS / RNDS** | PBM, Receita | 🔴 Crítica | Autorização Farmácia Popular (HÓRUS), validação de prescrição eletrônica |
| **DATASUS / HÓRUS** | PBM | 🔴 Crítica | Lotes de dispensação Farmácia Popular — ressarcimento pelo Ministério da Saúde |
| **CFM** | PBM, Receita | 🟡 Alta | Verificação de CRM médico em tempo real (fallback para base local) |
| **ICP-Brasil** | Receita, SNGPC, Fiscal | 🔴 Crítica | Assinatura digital de XML NF-e e receitas eletrônicas |
| **WhatsApp Business API** | WhatsApp | 🟡 Alta | Envio de mensagens — requer conta Meta Business verificada |
| **OCR** (Google Vision / AWS Textract) | Receita | 🟡 Alta | Extração de dados de receitas físicas fotografadas |
| **TUSS/TISS** | PBM | 🟢 Normal | Convênios privados (Unimed, SulAmérica etc.) |

---

## 4. Arquitetura de dados — visão consolidada

```
Farmacia          id, nome, cnpj, endereco, certificado_a1
Operador          id, farmacia_id, nome, email, perfil, senha_hash
Caixa             id, farmacia_id, numero, status
Turno             id, caixa_id, operador_id, inicio, fim, fundo_troco
Venda             id, turno_id, cliente_id, total, desconto_pbm, nfce_chave
ItemVenda         venda_id, produto_id, qty, preco_unitario, lote, receita_id
Produto           id, farmacia_id, nome, ean, dcb, ncm, preco, controlado, portaria_344,
                  requer_receita, pbm_elegivel, rms, margem_minima, estoque_minimo
Lote              id, produto_id, numero, validade, estoque_atual
Movimentacao      id, tipo, produto_id, lote_id, quantidade, motivo, turno_id
Inventario        id, farmacia_id, data, status, escopo, modo (cego|visivel)
ItemInventario    inventario_id, produto_id, lote_id, qtd_sistema, qtd_contada, motivo, status_ajuste
NfeEntrada        id, farmacia_id, chave_44, fornecedor_id, numero_nota, valor_total, status
NfeItem           id, nfe_entrada_id, produto_id, qtd_faturada, qtd_recebida, lote, validade
ContaPagar        id, nfe_entrada_id, fornecedor_id, valor, vencimento, status
AtendimentoPbm    id, farmacia_id, cpf_paciente, crm_medico, convenio, status, protocolo
ItemPbm           atendimento_id, produto_id, rms, qtd, desconto_valor
ReceitaDigital    id, farmacia_id, status, paciente_cpf, medico_crm, data_receita, protocolo
ItemReceita       id, receita_id, produto_id, posologia, controlado, status_item
SngpcLog          id, movimentacao_id, lote_id, produto_id, operacao, data, status_envio, anvisa_protocolo
LoteEnvioSngpc    id, farmacia_id, farmaceutico_id, protocolo, status, enviado_em
LoteHorus         id, farmacia_id, dispensacoes[], status, enviado_em, aprovado_em, valor_ressarcimento
MedicoLocal       id, farmacia_id, crm, nome, uf, especialidade (cache offline-first)
Cliente           id, farmacia_id, nome, cpf, telefone, convenio, pontos_fidelidade
Fornecedor        id, farmacia_id, razao_social, cnpj, condicao_padrao, prazo_entrega_dias
AuditoriaLog      id, entidade_tipo, entidade_id, operador_id, acao, hora, descricao
```

---

## 5. Regras de negócio críticas

| # | Regra | Origem legal / técnica |
|---|---|---|
| RN-01 | Medicamento controlado (Portaria 344) exige receita vinculada para dispensação | Portaria SVS/MS 344/1998 |
| RN-02 | Receita de controlado tem validade máxima de 30 dias | Portaria 344 |
| RN-03 | Movimentações de controlados devem ser enviadas ao SNGPC/ANVISA em até 10 dias úteis | RDC 204/2017 |
| RN-04 | CRM médico deve ser verificado no CFM antes de autorizar PBM/Farmácia Popular | Portaria SCTIE 11/2022 |
| RN-05 | Divergência de inventário > 5% exige aprovação de farmacêutico | Controle interno |
| RN-06 | NF-e pode ser cancelada em até 24h após autorização SEFAZ | Ajuste SINIEF 07/2005 |
| RN-07 | Carta de correção limitada a 20 eventos por NF-e | Manual NF-e SEFAZ |
| RN-08 | Limite Farmácia Popular: 1 embalagem/mês por produto por CPF | DATASUS / RENAME |
| RN-09 | Fechamento de caixa com diferença > R$ 50 exige motivo preenchido | Controle interno |
| RN-10 | Operador só acessa dados da própria farmácia (multitenancy por `farmacia_id`) | Segurança / LGPD |
| RN-11 | Dispensação Farmácia Popular exige CPF válido e receita digitalizada (quando aplicável) | Portaria SCTIE 11/2022 |
| RN-12 | Inventário "cego" não exibe saldo do sistema ao operador durante a contagem | Boas práticas de auditoria interna |

---

## 6. Padrões de frontend (resumo executivo)

> Detalhes completos em `CLAUDE.md` (raiz) e `src/components/ui/CLAUDE.md`.

### Padrões de layout por tipo de tela

| Tipo | Quando usar | Estrutura |
|---|---|---|
| **Coluna única** | Fluxos lineares simples (Dashboard, AjusteEstoque) | `flex flex-col` com scroll interno |
| **Duas colunas** | Lista + detalhe/painel (Estoque, FechamentoCaixa, Receita, SNGPC) | `flex-1` + `w-[Xpx] shrink-0` |
| **Painel fixo direito** | PDV, Finalizar Venda | `flex-1` + `w-115 shrink-0` |
| **Wizard N etapas** | Fluxos guiados com etapas obrigatórias (EntradaNfe, PBM) | `step: 1\|2\|3`, `goNext/goBack`, renderização condicional |
| **Multi-estado** | Telas com UI totalmente diferente por estado (Receita) | `STATUS_CFG: Record<Status, {...}>`, demo switcher |

### Padrões de componente obrigatórios

| Padrão | Quando | Detalhe |
|---|---|---|
| `ReadonlyField` | Campos somente-leitura em wizards | Usa `<p>` não `<label>` — evita `noLabelWithoutControl` Biome |
| `<Modal.Root>` | Qualquer modal interno (2+ campos) | Composition: `Modal.Root`, `Modal.Header`, `Modal.Body`, `Modal.Footer`. Context interno compartilha `onClose`. |
| `<Alert>` | Banners de aviso/erro/info | Variantes `danger\|warning\|info\|success` via `tv()` |
| `<Table.Header>` / `<Table.Row>` | Tabelas com header + linhas de dado | Composition sem Context: `Table.Header` e `Table.Row` recebem `gridCols` como prop |
| Demo switcher | Toda tela com múltiplos estados | Pills mono `text-[9px] uppercase` no header para troca rápida em protótipo |
| Lookup table | Estilo dependente de estado/status | `Record<Status, {bg, text, border, ...}>` — zero ifs inline no JSX |
| `htmlFor` + `id` | Todo campo editável | Biome enforça — campos sem associação geram erro de lint |
| Schema Zod | Todo tipo de dado de formulário ou API | `z.infer<typeof Schema>` — nunca declarar `type` manual para dados validáveis |

### Padrão de handler de botão (async)

Todo botão de ação que faz I/O deve seguir:

```typescript
const [isLoading, setIsLoading] = useState(false)

const handleAcao = async () => {
  setIsLoading(true)
  try {
    await servicoRelevante.executar(params)
    notificar('sucesso', 'Operação realizada com sucesso.')
    // atualizar estado local / recarregar dados
  } catch (err) {
    notificar('erro', 'Falha ao executar operação. Tente novamente.')
    console.error('[handleAcao]', err)
  } finally {
    setIsLoading(false)
  }
}
```

Botão desabilitado enquanto loading: `disabled={isLoading}` + `className={isLoading ? 'opacity-60 cursor-not-allowed' : ''}`.

### Padrão de notificação centralizada

Centralizar via `useNotification()` hook. Suporte a: `sucesso` · `erro` · `aviso` · `info`. Nunca usar `alert()` nativo ou `console.log` visível ao usuário.

### Padrão de exportação de dados

Toda exportação (CSV, PDF, Excel) deve:
1. Ser gerada no **backend** via endpoint dedicado (`POST /api/v1/relatorios/gerar`)
2. Retornar URL assinada ou blob para download
3. Registrar log de auditoria (usuário, data, filtros aplicados)

O frontend nunca gera o arquivo — apenas chama o endpoint e inicia o download.

### Padrão de importação de arquivos (XML, CSV)

1. Validação de schema/formato **antes** de processar (ex: NF-e v4.00, CSV com cabeçalho esperado)
2. Feedback de progresso para arquivos grandes (progress bar ou spinner com % estimado)
3. Rollback em caso de falha parcial (transação no backend)
4. Relatório de erros linha a linha exibido na UI antes de confirmar

### Quality gate obrigatório antes de encerrar qualquer tarefa

```bash
npx biome check --write ./src && npx tsc -b && npx vite build
```

---

## 7. Decisões técnicas registradas

| Data | Decisão | Motivo |
|---|---|---|
| 2026-05 | SNGPC: conferência manual + envio em lote (não automático) | Farmacêutico precisa revisar cada movimentação antes do envio à ANVISA |
| 2026-05 | Cadastros: CRUD completo + importação CSV | Farmácias migram de sistemas legados com planilhas — import é essencial |
| 2026-05 | PBM: wizard 3 etapas separadas | Design Pencil revelou 4 telas distintas; wizard garante fluxo guiado sem erro |
| 2026-05 | Receita: multi-estado single-page (não wizard) | Fluxo não é linear — farmacêutico pode rejeitar, reclassificar, reprocessar |
| 2026-05 | Modal overlay: `<button>` não `<div onClick>` | Biome a11y `useKeyWithClickEvents` — padrão documentado e aplicado em todas as telas |
| 2026-05 | Hex arbitrários: só `#F5F8F6` e `#FBFCFB` | Micro-tons de tabela sem token correspondente na paleta brand |
| 2026-05 | Composition Pattern (estilo Radix UI) para componentes com sub-partes | Namespace `{ Root, Header, Body }` + Context interno opcional — ex: `<Modal.Root>`, `<Modal.Header>` |
| 2026-05 | Zod como fonte única de tipos nos schemas de dados | `z.infer<typeof Schema>` substitui `type` manual — validação e tipagem no mesmo lugar |
| 2026-05 | Componentes UI promovidos quando padrão aparece em 2+ páginas | Evita divergência visual: Modal, Alert, Table e FilterTabs extraídos de 8+/6+/7+/2+ páginas |
| 2026-05-19 | WhatsApp: AbaConversas + AbaAtendimento → AbaAtendimentos (3 abas em vez de 4) | Ana Oliveira aparecia duplicada (pendente em Conversas + em_atendimento em Atendimento) — estado conflitante. Padrão real (Blip, Huggy, Zendesk): uma conversa, um estado. Painel direito 360px fixo com ClienteHeader + 4 tabs (Orçamento/Receita/Pedido/Histórico) |
| 2026-05-20 | Handler async padrão com loading/error/finally em todos os botões de I/O | Evitar UI travada e estados inconsistentes quando API retorna erro |
| 2026-05-20 | Notificação centralizada via `useNotification()` — nunca `alert()` nativo | Consistência visual; permite log de eventos de UX; `alert()` bloqueia thread |
| 2026-05-20 | Exportação via backend + URL assinada com log de auditoria | LGPD: rastrear quem exportou o quê e quando; evitar processamento pesado no browser |
| 2026-05-20 | PBM Farmácia Popular: validação HÓRUS offline-first (cache local) | API DATASUS tem SLA imprevisível; farmácia não pode parar atendimento por indisponibilidade externa |
| 2026-05-20 | Pesquisa de médico/CRM: base local + fallback API CFM | Médicos frequentes já estão em cache; API CFM só chamada quando CRM não reconhecido — reduz latência e dependência externa |

---

## 8. Sequência de implementação recomendada

### Fase 1 — Completar telas existentes (modais pendentes)
Antes de abrir novos módulos, fechar os vínculos entre os módulos de OPERAÇÃO.

```
P-01  Modal produto controlado no PDV
P-02  Modal PBM inline no PDV
P-03  Modal Sangria (PDV)
P-04  Modal Suprimento (PDV)
E-01  Modal Reposição (Estoque)
F-01  Modal Carta de Correção (Fiscal)
F-02  Modal Cancelar NF-e (Fiscal)
B-01  Modal Histórico paciente (PBM Etapa 1)
R-01  Modal Histórico paciente (Receita)
R-02  Integração Receita → PDV (Router state)
B-02  Integração PBM → PDV (Router state)
```

### Fase 2 — Cadastros (fundação)
```
/cadastros/produtos     CRUD + CSV import/export        ✅ concluído
/cadastros/clientes     CRUD + CSV + histórico inline   ✅ concluído
/cadastros/fornecedores CRUD + CSV                      ✅ concluído
```

### Fase 2.5 — Refatoração de qualidade ✅ Concluída

```
R-A  ✅ Criados: modal.tsx, alert.tsx, table.tsx, filter-tabs.tsx (Composition Pattern)
R-B  ✅ Input e MetricCard migrados para .Root; Badge aplicado em CadastroProdutosPage
R-C  ✅ Zod instalado + src/schemas/ criado: produto, cliente, fornecedor, pdv, pbm
R-D  ✅ ProdutoFormSchema.safeParse() aplicado no ModalProduto (CadastroProdutosPage)
```

### Fase 3 — SNGPC (compliance legal)
```
/sngpc                  Hub: lista de pendentes + painel de envio    ✅ concluído
```

### Fase 4 — Gestão financeira
```
/financeiro             Hub: contas a pagar/receber + fluxo de caixa ✅ concluído
```

### Fase 5 — Relacionamento com cliente
```
/whatsapp               Fila + templates + histórico                 ✅ concluído
/fidelizacao            Dashboard de pontos + campanhas              ✅ concluído
```

### Fase 6 — Ferramentas de gestão
```
/relatorios             Hub de relatórios exportáveis                ✅ concluído
/precificador           Margem + promoções                           ✅ concluído
/administracao          Usuários + permissões + configurações        ✅ concluído
```

### Fase 7 — Refinamentos UX (telas existentes)

Ordem sugerida por impacto operacional:

| # | Módulo | Item | SP | Dependência externa |
|---|---|---|---|---|
| 1 | PDV | P-RX-01: Fechamento de caixa completo | 3 | — |
| 2 | PBM | B-RX-01: Farmácia Popular HÓRUS | 8 | Layout arquivo HÓRUS (DATASUS) |
| 3 | NF-e | F-RX-01: Importação XML v4.00 | 5 | Schema NF-e v4.00 SEFAZ |
| 4 | Estoque | E-RX-01: Inventário guiado | 5 | — |
| 5 | PBM | B-RX-02: Pesquisa CRM offline-first | 3 | SLA API CFM |
| 6 | PDV | P-RX-02: Histórico de caixa | 2 | — |
| 7 | WhatsApp | W-RX-01: Scroll + anexos + ações rápidas | 3 | — |
| 8 | Financeiro | FIN-RX-01: Histórico mensal | 3 | — |
| 9 | Estoque | E-RX-02: Confirmação atômica de transferência | 2 | — |
| **Total** | | | **~34 SP** | |

---

## 9. Checklist de produção (pré-go-live)

- [ ] Integração SEFAZ configurada com certificado A1 real
- [ ] Integração SNGPC/ANVISA testada em homologação
- [ ] Integração DATASUS/RNDS (Farmácia Popular) funcionando
- [ ] Integração DATASUS/HÓRUS: layout de arquivo validado + transmissão testada em homologação
- [ ] Assinatura ICP-Brasil nos XMLs de NF-e e receitas
- [ ] API CFM configurada (SLA validado) + base local de médicos populada
- [ ] Multitenancy validado: operador não acessa dados de outra farmácia
- [ ] Rate limiting e JWT expiração configurados
- [ ] Auditoria de escrita funcionando em todos os endpoints críticos
- [ ] LGPD: CPF e dados sensíveis criptografados at rest
- [ ] Exportação: log de auditoria registra usuário + filtros em toda exportação
- [ ] Backup automático PostgreSQL configurado
- [ ] Módulo de Administração com gestão de usuários funcional
- [ ] SNGPC: envio automático agendado (cron) validado em homologação
- [ ] Testes de carga no PDV (pico de atendimento: 50 req/min)
- [ ] Fluxo HÓRUS: validar limite 1 embalagem/mês/CPF aplicado corretamente (RN-08)
