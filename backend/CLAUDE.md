# Farmacorp ERP — Especificações de Backend

> Documento vivo: atualizado a cada nova tela implementada no frontend.
> Stack sugerida: **Node.js + Fastify + Prisma + PostgreSQL**.

---

## Regras gerais da API

| Campo | Decisão |
|---|---|
| Base URL | `/api/v1` |
| Autenticação | JWT no header `Authorization: Bearer <token>` |
| Datas | ISO 8601 UTC — `"2025-07-01T14:00:00Z"` |
| **Valores monetários** | **Inteiro em centavos** — `890` = R$ 8,90 |
| Paginação | `?page=1&limit=50` → response: `{ data[], total, page, pages }` |
| Erros | `{ error: "CODIGO_ERRO", message: "...", details?: {} }` |
| Rate limit | 1 000 req/min por operador autenticado |
| CORS | Apenas origem do frontend (configurar por ambiente) |
| Content-Type | `application/json` (exceto uploads: `multipart/form-data`) |

### Códigos de erro padrão

| Código | HTTP | Quando |
|---|---|---|
| `NAO_AUTENTICADO` | 401 | Token ausente ou expirado |
| `SEM_PERMISSAO` | 403 | Perfil não autorizado para a operação |
| `NAO_ENCONTRADO` | 404 | Recurso não existe |
| `VALIDACAO` | 422 | Body inválido (Zod / schema) |
| `CONFLITO` | 409 | Caixa já aberto, item duplicado, etc. |
| `APROVACAO_NECESSARIA` | 403 | Divergência >5% requer supervisor |
| `ERRO_INTERNO` | 500 | Falha inesperada |

---

## Autenticação — `/auth`

```
POST /api/v1/auth/login     { email, senha }  → { token, refresh_token, operador }
POST /api/v1/auth/logout
POST /api/v1/auth/refresh   { refresh_token } → { token }
GET  /api/v1/auth/me        → { id, nome, perfil, farmacia_id, caixas_permitidos[] }
```

**Perfis:** `admin` · `farmaceutico` · `operador_caixa`
JWT expira em 8 h (turno). Refresh token via cookie httpOnly (30 dias).

---

## Dashboard — `/dashboard`

```
GET /api/v1/dashboard/resumo
```
```json
{
  "vendas_dia":        { "valor": 4870000, "variacao_pct": 12 },
  "itens_alerta":      { "lotes": 23 },
  "pbm_aprovado_pct":  86,
  "caixa":             { "atendimentos": 14, "aberto": true }
}
```

```
GET /api/v1/alertas/criticos           → SNGPC pendentes + validade + reposição
GET /api/v1/estoque/alertas-validade?dias=90
```

---

## PDV — `/pdv`

### Busca de produtos
```
GET /api/v1/produtos/buscar?q={termo}   nome, EAN ou lote
GET /api/v1/produtos/:id
```
```json
{
  "id": "uuid",
  "nome": "Dipirona 500mg",
  "ean": "7891058012046",
  "preco": 890,
  "estoque": 124,
  "controlado": false,
  "pbm": { "elegivel": true, "desconto_pct": 16 }
}
```

### Venda
```
POST /api/v1/vendas
```
```json
{
  "caixa_id": "uuid",
  "cliente_id": "uuid|null",
  "itens": [{ "produto_id": "uuid", "qty": 2, "preco_unitario": 890, "lote": "D-2291" }],
  "desconto_pbm": 814,
  "desconto_manual": 0,
  "pagamento": {
    "forma": "dinheiro|debito|credito|pix|multiplos",
    "valor_recebido": 5000,
    "parcelas": 1
  }
}
```
Response: `{ "venda_id": "uuid", "troco": 724, "nfce_chave": "...", "nfce_pdf_url": "..." }`

### PBM
```
POST /api/v1/pbm/validar   { cliente_cpf, itens[] } → { desconto, elegivel, convenio, validade_autorizacao }
```

---

## Caixa — `/pdv/abertura-caixa` · `/pdv/fechamento-caixa`

```
GET  /api/v1/pdv/caixas                      lista com status (aberto/fechado)
POST /api/v1/pdv/caixa/abrir                 { caixa_id, operador_id, fundo_troco }
POST /api/v1/pdv/caixa/fechar                { caixa_id, valor_contado, motivo_diferenca? }
GET  /api/v1/pdv/caixa/:id/resumo-turno      totais por forma de pagamento
POST /api/v1/pdv/sangria                     { caixa_id, valor, motivo }
POST /api/v1/pdv/suprimento                  { caixa_id, valor, origem }
```

**Response resumo-turno:**
```json
{
  "total_turno": 532000,
  "sangrias": 20000,
  "total_liquido": 512000,
  "formas": {
    "dinheiro": { "esperado": 134000, "contado": 133500 },
    "debito":   { "esperado": 120000 },
    "credito":  { "esperado": 156000 },
    "pix":      { "esperado":  90000 },
    "pbm":      { "esperado":  32000 }
  }
}
```

**Regra:** diferença no fechamento de caixa > R$ 50 (5000 centavos) requer `motivo_diferenca`.

---

## Estoque — `/estoque`

### Resumo (métricas do topo)
```
GET /api/v1/estoque/resumo
```
```json
{
  "produtos_ativos": 8412,
  "lotes_vencendo_30d": 23,
  "ruptura_critica": 11,
  "reposicao_sugerida_skus": 42,
  "controlados_sngpc": 138
}
```

### Inventário e lotes
```
GET /api/v1/estoque?filter=todos|criticos|controlados&search={termo}&page=1&limit=50
```
```json
{
  "id": "uuid",
  "produto": "Losartana 50mg",
  "estoque": 124,
  "minimo": 80,
  "validade_proximo_lote": "2025-08-15",
  "validade_label": "62 dias",
  "lote": "L-1044",
  "sngpc_status": "ok|pendente|n_a",
  "status": "saudavel|alerta|critico|comprar"
}
```

**Status calculado pelo backend:**
- `saudavel` — estoque ≥ mínimo **e** validade > 30 dias
- `alerta` — validade 10–30 dias **ou** estoque < mínimo × 0,5
- `critico` — validade < 10 dias **ou** estoque = 0
- `comprar` — estoque < mínimo (sem alerta de validade)

### Reposição
```
GET /api/v1/estoque/repor     itens abaixo do mínimo ou com validade curta
```
```json
[{ "produto": "Losartana 50mg", "descricao": "Estoque mínimo atingido", "pct_estoque": 20, "tipo": "normal|warning" }]
```

### Ajuste físico (inventário) — `/estoque/ajuste`

```
POST /api/v1/estoque/inventario/iniciar        { data_inventario } → { inventario_id }
GET  /api/v1/estoque/inventario/:id/itens      lista com qtd_sistema por lote
POST /api/v1/estoque/inventario/:id/salvar
GET  /api/v1/estoque/inventario/:id/exportar   → CSV / XLSX
POST /api/v1/estoque/inventario/:id/aprovar    { supervisor_id, senha } → desbloqueia revisões
```

**Body salvar:**
```json
{
  "itens": [{
    "produto_id": "uuid",
    "lote": "L-1044",
    "qtd_sistema": 124,
    "qtd_contada": 124,
    "motivo": "produto_vencido|avaria|furto|erro_entrada|devolucao|transferencia|null"
  }]
}
```

**Status calculado pelo backend:**
- `ok` — `qtd_contada == qtd_sistema`
- `pendente` — divergência sem motivo informado
- `aprovado` — `motivo == produto_vencido` OU `|diff/sistema| ≤ 5%` com motivo
- `revisao` — `|diff/sistema| > 5%` → **bloqueia Salvar até aprovação de supervisor**

### Movimentações e importação
```
GET  /api/v1/estoque/movimentacoes?hoje=true
POST /api/v1/estoque/entrada          { nfe_chave, itens[] }
GET  /api/v1/estoque/exportar         → CSV / XLSX
POST /api/v1/estoque/importar-csv     multipart/form-data
```

### Alertas
```
GET /api/v1/alertas/estoque           → SNGPC pendentes + lotes vencendo
```

---

## SNGPC — `/sngpc`

```
GET  /api/v1/sngpc/status             { pendentes, ultima_sinc: "ISO8601" }
GET  /api/v1/sngpc/controlados        lista medicamentos controlados com lotes
POST /api/v1/sngpc/enviar             envia lote de movimentações à ANVISA
POST /api/v1/sngpc/conferir           abre sessão de conferência manual
```

---

## Fiscal — NF-e Entrada de Compra `/fiscal`

> Telas implementadas: **Etapa 1 — Identificação** · **Etapa 2 — Itens e lotes** · **Etapa 3 — Conferência e entrada**
> Rota frontend: `/fiscal/entrada-nfe`

### Fluxo geral

```
1. Operador importa XML ou informa chave de acesso (44 dígitos)
2. Backend consulta SEFAZ e retorna dados da NF-e + itens
3. Frontend exibe etapa 1 (dados do fornecedor, datas, condições)
4. Etapa 2: operador confere qtd recebida vs faturada e preenche lotes
5. Etapa 3: checklist automático → confirmação grava entrada no estoque
```

### Etapa 1 — Identificação

```
POST /api/v1/fiscal/nfe/importar-xml        multipart/form-data  → NfeResumo
GET  /api/v1/fiscal/nfe/{chave}             busca por chave de 44 dígitos → NfeResumo
POST /api/v1/fiscal/nfe/rascunho            salva rascunho parcial
```

**NfeResumo (response):**
```json
{
  "chave": "35250412345678000195550010000012341000012345",
  "fornecedor": "Plasma Sul Distribução",
  "numero_nota": "125.001 - 3041",
  "cnpj_emitente": "12.345.678/0001-99",
  "natureza": "Compra para revenda",
  "data_emissao": "2025-04-28T00:00:00Z",
  "valor_total": 1246688,
  "base_icms": 1098400,
  "icms_total": 197712,
  "pis_cofins": 62405,
  "frete": 0,
  "valor_final": 1248090,
  "protocolo_sefaz": "EN-2026-004812",
  "data_autorizacao": "2025-04-29T14:22:00Z",
  "status_sefaz": "autorizado | denegado | cancelado"
}
```

**Body rascunho:**
```json
{
  "chave": "...",
  "filial_id": "uuid",
  "tipo_total": "com_imposto | sem_imposto",
  "condicao_pagto": "avista | 30 | 30_60_90 | 60_90_120",
  "natureza": "compra | uso | devolucao | transferencia",
  "gerar_contas": true
}
```

### Etapa 2 — Itens e lotes

```
GET  /api/v1/fiscal/nfe/{chave}/itens       lista itens com match no catálogo
POST /api/v1/fiscal/nfe/{chave}/itens/lotes salva lotes + qtd recebida
```

**GET itens (response por item):**
```json
{
  "seq": 1,
  "codigo_ean": "7891058012046",
  "produto_id": "uuid | null",
  "produto_nome": "Dipirona 500mg",
  "ncm": "3004.90",
  "ipi_pct": 0.0,
  "qtd_faturada": 100,
  "valor_unit": 420,
  "no_catalog": false,
  "margem_baixa": false
}
```

> **Regra:** `no_catalog = true` quando `produto_id == null` (EAN não encontrado no catálogo).
> `margem_baixa = true` quando margem do produto estiver abaixo do mínimo configurado (ex: 18%).
> O frontend sinaliza margem baixa como `⚠ Margem baixa` na etapa 3; não bloqueia confirmação.

**POST lotes (body):**
```json
{
  "itens": [
    {
      "seq": 1,
      "produto_id": "uuid",
      "qtd_recebida": 100,
      "lote": "L2024A",
      "validade": "2026-12-01"
    }
  ]
}
```

**Regras de validação (backend):**
- `qtd_recebida` obrigatória e ≥ 0
- `lote` obrigatório para medicamentos (`produto.controlado = true` ou `produto.requer_lote = true`)
- `validade` obrigatória se `lote` preenchido; deve ser data futura
- Divergência `|qtd_recebida - qtd_faturada| > 0` → campo `divergencia: true` na response; **não bloqueia**, apenas sinaliza
- Divergência > 10% → requer autorização de supervisor (`APROVACAO_NECESSARIA` 403)

### Etapa 3 — Conferência e confirmação de entrada

**Estados da conferência** (frontend usa `conference_status` para controlar UI):

| Status | Condição | Botão "Finalizar entrada" |
|---|---|---|
| `revisao` | Itens com avisos (margem baixa, NCM divergente) | Ativo |
| `bloqueado` | Divergência fiscal crítica detectada pelo backend | Desabilitado |
| `sucesso` | Entrada confirmada com sucesso | Desabilitado (mostra protocolo) |

> O frontend calcula o status localmente a partir do checklist retornado.
> `bloqueado` é sinalizado quando o backend retorna `divergencia_critica: true` na validação.

**Novos endpoints de ação na etapa 3:**

```
POST /api/v1/fiscal/nfe/{chave}/marcar-todos-ok
  Body: {} → marca todos os itens da conferência como "OK" (limpa divergências de status)

POST /api/v1/fiscal/nfe/{chave}/arredondamento
  Body: {} → aplica arredondamento fiscal (ajuste de centavos em IPI/PIS/COFINS)
  Response: { "itens_ajustados": N, "diff_total": 5 }  /* diff em centavos */
```

**Validação de checklist (GET /api/v1/fiscal/nfe/{chave}/checklist):**
```json
{
  "itens_vinculados":   true,
  "lotes_completos":    true,
  "cfop_cst_ok":        true,
  "divergencia_critica": false,
  "margem_baixa_count": 1,
  "pendencias": [
    "1 item com margem abaixo da política (mín. 18%)",
    "Divergência de NCM em 1 SKU (sugerido: 3004.90.99)",
    "Validar alíquota interna de ICMS para UF destino"
  ]
}
```

**Conciliação automática (retornada junto ao checklist):**
```json
{
  "plano_de_contas": "Estoque de Mercadorias (1.1.3.01)",
  "centro_de_custo": "Compras Loja Matriz"
}
```

```
POST /api/v1/fiscal/nfe/{chave}/confirmar
```

**Body:**
```json
{
  "rascunho_id": "uuid",
  "itens": [ /* mesma estrutura do POST lotes */ ],
  "gerar_contas": true,
  "supervisor_id": "uuid | null"
}
```

**Response (sucesso):**
```json
{
  "entrada_id": "uuid",
  "protocolo": "EN-2026-004812",
  "movimentacoes": ["uuid", "uuid"],
  "contas_geradas": ["uuid"],
  "estoque_atualizado": true,
  "auditoria": [
    { "hora": "10:42", "descricao": "XML importado por Ana" },
    { "hora": "10:47", "descricao": "Itens vinculados automaticamente" },
    { "hora": "10:53", "descricao": "Revisão fiscal concluída por João" }
  ]
}
```

**Efeitos colaterais obrigatórios ao confirmar:**
1. Criar `Movimentacao` do tipo `entrada` por item/lote
2. Atualizar `Lote.estoque_atual` (inserir ou incrementar)
3. Se `gerar_contas = true` → criar registros em contas a pagar com vencimentos conforme `condicao_pagto`
4. Se item controlado → gerar `SngpcLog` pendente de envio à ANVISA
5. Emitir evento interno `nfe.entrada.confirmada` para notificações em tempo real (WebSocket)
6. Registrar rastro de auditoria (`AuditoriaLog`) com operador + timestamp por cada ação

### Rascunhos

```
GET    /api/v1/fiscal/nfe/rascunhos          lista rascunhos em aberto
GET    /api/v1/fiscal/nfe/rascunhos/{id}     detalhes + itens salvos
DELETE /api/v1/fiscal/nfe/rascunhos/{id}     descarta rascunho
```

Rascunho expira automaticamente após **7 dias** sem atualização.

### Histórico de entradas

```
GET /api/v1/fiscal/entradas?page=1&limit=50&fornecedor_id=&data_inicio=&data_fim=
GET /api/v1/fiscal/entradas/{id}
```

### Modelos de dados adicionais

```
NfeEntrada     id, farmacia_id, chave_44, fornecedor_id, numero_nota, filial_id, data_entrada,
               valor_total, base_icms, icms_total, pis_cofins, frete, valor_final,
               protocolo_sefaz, status(rascunho/confirmado/cancelado)
NfeItem        id, nfe_entrada_id, seq, produto_id, ncm, ipi_pct,
               qtd_faturada, qtd_recebida, valor_unit, lote, validade, divergencia, margem_baixa
ContaPagar     id, nfe_entrada_id, fornecedor_id, valor, vencimento, status(aberta/paga)
AuditoriaLog   id, entidade_tipo, entidade_id, operador_id, acao, hora, descricao
```

### Permissões por perfil

| Operação | `operador_caixa` | `farmaceutico` | `admin` |
|---|---|---|---|
| Importar XML / consultar SEFAZ | ✓ | ✓ | ✓ |
| Salvar rascunho | ✓ | ✓ | ✓ |
| Confirmar entrada (sem divergência) | ✓ | ✓ | ✓ |
| Confirmar com divergência ≤ 10% | — | ✓ | ✓ |
| Autorizar divergência > 10% | — | ✓ | ✓ |

### TODOs críticos para implementação

- [ ] Integração com webservice SEFAZ (consulta por chave / download XML)
- [ ] Parser de XML NF-e 4.0 (campos: `det/prod`, `det/imposto/IPI`, `total/ICMSTot`)
- [ ] Match produto: EAN (`cEAN`) → `Produto.ean`; fallback por CEST ou nome
- [ ] Geração automática de parcelas conforme condição de pagamento
- [ ] Controle de duplicidade: `CONFLITO` 409 se mesma chave já foi confirmada
- [ ] Endpoint de cancelamento retroativo com estorno de movimentações
- [ ] Notificação de divergência para supervisor via WebSocket / push

---

## PBM / Farmácia Popular — `/pbm`

> Tela implementada: **PbmPage** (wizard 3 etapas)
> Rota frontend: `/pbm`
> Módulos: Farmácia Popular (gov), Aqui Tem Farmácia, Programas Privados (ex: Sempre Bem, Farmácias Nissei).
>
> **Fluxo wizard:**
> 1. **Etapa 1 — Autorização**: operador informa CPF, convênio, CRM, RMS, receita → POST /autorizar → governo retorna status em tempo real
> 2. **Etapa 2 — Medicamentos**: lista de medicamentos elegíveis; operador adiciona/remove via modal de busca → POST /medicamentos valida elegibilidade de cada item
> 3. **Etapa 3 — Finalização**: revisão somente-leitura → POST /finalizar encerra o atendimento e envia ao caixa

### Métricas do dia

```
GET /api/v1/pbm/metricas-dia
```
```json
{
  "atendimentos_hoje": 86,
  "aprovados":         63,
  "aprovados_pct":     72,
  "pendentes_docs":    14,
  "rejeicoes":          8,
  "desconto_medio":  1840
}
```

### Validação de elegibilidade

```
POST /api/v1/pbm/validar
```

**Body:**
```json
{
  "cpf_paciente":    "000.000.000-00",
  "convenio":        "farmacia_popular | aqui_tem | privado",
  "crm_medico":      "000000/SP",
  "data_receita":    "2025-05-01",
  "produto_id":      "uuid",
  "quantidade":      2,
  "receita_id":      "uuid | null"
}
```

> **Validações obrigatórias para Farmácia Popular:**
> - `crm_medico` — verificado no CFM (Conselho Federal de Medicina); CRM inativo bloqueia a autorização
> - `data_receita` — deve ser ≤ 90 dias em relação à data atual (Portaria SCTIE nº 11/2022)
> - Ambos campos são exigidos pelo webservice DATASUS ao solicitar autorização de dispensação

**Response (aprovado):**
```json
{
  "status":          "aprovado",
  "elegivel":        true,
  "desconto_valor":  2760,
  "desconto_pct":    30,
  "preco_original":  8290,
  "preco_final":     5803,
  "convenio_nome":   "Farmácia Popular",
  "autorizacao_id":  "uuid",
  "validade_autorizacao": "2025-05-06T23:59:59Z"
}
```

**Response (pendente — falta documento):**
```json
{
  "status":  "pendente",
  "elegivel": null,
  "motivo":  "receita_ilegivel | receita_ausente | documento_foto_ausente",
  "descricao": "Foto da receita não enviada ou ilegível."
}
```

**Response (rejeitado):**
```json
{
  "status":  "rejeitado",
  "elegivel": false,
  "motivo":  "cpf_inconsistente | produto_nao_elegivel | convenio_inativo | limite_mensal_atingido",
  "descricao": "CPF inconsistente com o cadastro do programa."
}
```

**Regras por convênio:**

| Convênio | Desconto | Medicamentos elegíveis | Receita |
|---|---|---|---|
| Farmácia Popular | 10–90% por lista RENAME | Hipertensão, diabetes, asma, anticoncepcionais (lista RENAME/MDS) | Obrigatória + foto |
| Aqui Tem Farmácia | Variável por produto | Medicamentos do programa gov. | Obrigatória |
| Privado | Configurado por operadora | Conforme contrato | Conforme operadora |

### Etapa 1 — Autorização governamental

```
POST /api/v1/pbm/autorizar
```

Equivale ao `/validar` mas retorna fluxo de estado em tempo real (polling ou WebSocket). O frontend usa `AutorizacaoStatus = 'aguardando' | 'analisando' | 'autorizado' | 'negado'`.

**Body:** (mesmo do `/validar` + campo `rms_produto`)
```json
{
  "cpf_paciente":    "000.000.000-00",
  "convenio":        "farmacia_popular | aqui_tem | privado",
  "crm_medico":      "000000/SP",
  "data_receita":    "2025-05-01",
  "rms_produto":     "1234567",
  "receita_id":      "uuid | null"
}
```

**Response imediata (enquanto processa):**
```json
{ "status": "analisando", "autorizacao_id": "uuid" }
```

**GET de poll / WebSocket update:**
```
GET /api/v1/pbm/autorizacao/{autorizacao_id}/status
```
```json
{
  "status": "autorizado | negado | analisando",
  "desconto_pct": 30,
  "validade_autorizacao": "2025-05-06T23:59:59Z",
  "motivo": "string | null"
}
```

### Etapa 2 — Lista de medicamentos

```
POST /api/v1/pbm/medicamentos/buscar
```

Busca medicamentos elegíveis pelo convênio para adicionar via modal.

**Body:**
```json
{ "q": "losartana", "convenio": "farmacia_popular" }
```

**Response:**
```json
[
  { "id": "uuid", "nome": "Losartana Potássica 50mg", "rms": "1234567", "ean": "7891058012046", "elegivel": true, "desconto_pct": 30 }
]
```

```
POST /api/v1/pbm/autorizacao/{autorizacao_id}/medicamentos
```

Salva a lista final de medicamentos associada à autorização.

**Body:**
```json
{
  "itens": [
    { "produto_id": "uuid", "rms": "1234567", "qtd_total": 2, "qtd_diaria": "1x ao dia" }
  ]
}
```

### Etapa 3 — Finalização e envio ao caixa

```
POST /api/v1/pbm/autorizacao/{autorizacao_id}/finalizar
```

Encerra o atendimento PBM, gera o comprovante e envia os dados ao PDV.

**Body:**
```json
{ "enviar_comprovante": true }
```

**Response:**
```json
{
  "atendimento_id": "uuid",
  "protocolo":      "PBM-2026-000123",
  "desconto_total": 2760,
  "itens_aprovados": 4,
  "comprovante_url": "/api/v1/pbm/comprovante/uuid",
  "pdv_payload": {
    "autorizacao_id":  "uuid",
    "desconto_valor":  2760,
    "convenio_nome":   "Farmácia Popular",
    "validade":        "2025-05-06T23:59:59Z"
  }
}
```

**Efeitos colaterais ao finalizar:**
1. Registrar `AtendimentoPbm` com todos os itens e desconto aprovado
2. Criar registro em `FilaAtendimento` com status `aprovado` para exibição na fila
3. Emitir evento interno `pbm.finalizado` → PDV pode consumir via WebSocket para pré-preencher desconto
4. Se `enviar_comprovante = true` → gerar PDF e disparar via WhatsApp/e-mail (assíncrono)
5. Registrar rastro de auditoria com operador + timestamps de cada etapa

### Fila de atendimentos

```
GET /api/v1/pbm/fila?minutos=20
```
```json
[
  {
    "id":      "uuid",
    "paciente_nome": "Maria Silva",
    "produto":       "Losartana 50mg",
    "convenio":      "farmacia_popular",
    "status":        "aprovado | pendente | rejeitado",
    "descricao":     "Losartana 50mg · Farmácia Popular",
    "criado_em":     "ISO8601"
  }
]
```

### Histórico do paciente ✅ mock implementado (B-01)

Mock local em `PbmPage.tsx` — `HISTORICO_PBM[]`. Substituir por chamada real ao integrar.

```
GET /api/v1/pbm/historico/{cpf}?page=1&limit=10
```
```json
[
  {
    "id":       "uuid",
    "data":     "2025-04-28",
    "produto":  "Losartana 50mg",
    "convenio": "Farmácia Popular",
    "status":   "aprovado",
    "desconto": 2760
  }
]
```

### Comprovante

```
POST /api/v1/pbm/comprovante          { autorizacao_id } → envia comprovante PDF ao paciente (WhatsApp / e-mail)
GET  /api/v1/pbm/comprovante/{id}     → PDF binário (Content-Type: application/pdf)
```

### Receita digital

```
POST /api/v1/pbm/receita/upload        multipart/form-data (image/*) → { receita_id, valida: bool, validade: ISO8601 }
GET  /api/v1/pbm/receita/{id}          → { id, status: "valida|ilegivel|expirada", legivel: bool }
```

### Permissões por perfil

| Operação | `operador_caixa` | `farmaceutico` | `admin` |
|---|---|---|---|
| Consultar elegibilidade / validar | ✓ | ✓ | ✓ |
| Upload de receita | ✓ | ✓ | ✓ |
| Enviar comprovante | ✓ | ✓ | ✓ |
| Visualizar histórico | — | ✓ | ✓ |
| Configurar convênios | — | — | ✓ |

### TODOs críticos para implementação

- [ ] Integração com webservice Farmácia Popular (DATASUS / SCTIE-MDS) para consulta de elegibilidade em tempo real
- [ ] Parser de receita digital via OCR (Google Vision / AWS Textract) para validação automática
- [ ] Integração com operadoras privadas (TUSS / TISS) para PBMs corporativos
- [ ] Controle de limite mensal por CPF por programa (ex: 1 embalagem/mês Farmácia Popular)
- [ ] Geração de comprovante PDF server-side com logo do convênio
- [ ] Fila em tempo real via WebSocket — atualizar status sem reload

---

## Fiscal — NF-e Emissão `/fiscal`

> Tela implementada: **FiscalPage** (hub único de emissão)
> Rota frontend: `/fiscal`
> Navegação bidirecional com `/fiscal/entrada-nfe` via botão "Entrada NF-e" e link "Registrar entrada de compra".

### Métricas do dia

```
GET /api/v1/fiscal/metricas-dia
```
```json
{
  "notas_emitidas":   34,
  "autorizadas":      31,
  "contingencia":      2,
  "rejeicoes":         3,
  "tempo_medio_seg":  42
}
```

### Histórico recente

```
GET /api/v1/fiscal/nfe/historico-recente?limit=10
```
```json
[
  { "numero": "002184", "chave": "35...", "status": "autorizada|cancelada|contingencia", "emitida_em": "ISO8601" }
]
```

### Emissão de NF-e

```
POST /api/v1/fiscal/nfe/emissao/nova       cria rascunho de emissão
POST /api/v1/fiscal/nfe/rascunho           salva rascunho parcial (emissão ou entrada)
POST /api/v1/fiscal/nfe/validar-xml        valida schema XML antes de transmitir
POST /api/v1/fiscal/nfe/transmitir         envia NF-e à SEFAZ e aguarda autorização
```

**Body `/emissao/nova`:**
```json
{
  "destinatario": { "nome": "Farmácia São Lucas Ltda", "cnpj": "12.345.678/0001-99" },
  "operacao":     "venda_interestadual|venda_interna|devolucao|transferencia",
  "cfop":         "6102",
  "pagamento":    "vista_cartao|30|30_60_90|60_90_120",
  "itens": [
    { "produto_id": "uuid", "lote": "L-1044", "qty": 10, "valor_unit": 24900 }
  ]
}
```
Response: `{ "rascunho_id": "uuid", "numero_sequencial": 2185, "serie": 1 }`

**Response `/transmitir` (sucesso):**
```json
{
  "nfe_id":       "uuid",
  "chave":        "35...",
  "numero":       "002185",
  "protocolo":    "135200000012345",
  "status":       "autorizada",
  "danfe_url":    "/api/v1/fiscal/nfe/002185/danfe",
  "xml_url":      "/api/v1/fiscal/nfe/002185/xml"
}
```

**Response `/transmitir` (contingência — SEFAZ offline):**
```json
{ "status": "contingencia", "contingencia_id": "uuid", "sync_previsto": "ISO8601" }
```

### Pós-emissão

```
POST /api/v1/fiscal/nfe/carta-correcao     { nfe_id, texto_correcao (mín. 15 chars) }  ✅ mock F-01 — ModalCartaCorrecao em FiscalPage.tsx
POST /api/v1/fiscal/nfe/{id}/cancelar      { nfe_id, motivo } — prazo: 24h após autorização  ✅ mock F-02 — ModalCancelarNfe em FiscalPage.tsx
GET  /api/v1/fiscal/nfe/{id}/danfe         → PDF binário (Content-Type: application/pdf)
GET  /api/v1/fiscal/nfe/{id}/xml           → XML da NF-e autorizada
GET  /api/v1/fiscal/nfe/protocolo/{numero} → { protocolo, status_sefaz, data_autorizacao }
```

**Regras fiscais obrigatórias:**
- CFOP `6xxx` = operação interestadual; `5xxx` = interna — validar contra UF do destinatário
- Modelo 55 (NF-e) para valor ≥ R$ 10 000 ou destinatário PJ; modelo 65 (NFC-e) para consumidor final
- Carta de correção limitada a 20 eventos por NF-e
- Cancelamento bloqueado após 24h da autorização → exige NF-e de devolução

### Status fiscal do sistema

```
GET /api/v1/fiscal/status-sefaz
```
```json
{
  "sefaz_online":      true,
  "contingencia_ativa": false,
  "notas_contingencia": 2,
  "rejeicoes_pendentes": 3,
  "ultima_verificacao": "ISO8601"
}
```

### Permissões por perfil

| Operação | `operador_caixa` | `farmaceutico` | `admin` |
|---|---|---|---|
| Consultar métricas / histórico | ✓ | ✓ | ✓ |
| Criar rascunho / validar XML | ✓ | ✓ | ✓ |
| Transmitir NF-e | — | ✓ | ✓ |
| Cancelar NF-e | — | ✓ | ✓ |
| Emitir carta de correção | — | ✓ | ✓ |

### TODOs críticos para implementação

- [ ] Integração com webservice SEFAZ (SOAP/REST por estado — usar biblioteca `node-nfe` ou similar)
- [ ] Gerador de XML NF-e 4.0 com assinatura digital (certificado A1/A3)
- [ ] Controle de numeração sequencial com lock distribuído (evitar duplicidade em múltiplas instâncias)
- [ ] Fila de transmissão em contingência com reconexão automática ao retorno do SEFAZ
- [ ] Sincronização de notas em contingência (`POST /api/v1/fiscal/nfe/sincronizar-contingencia`)
- [ ] DANFE gerado server-side (PDF com `puppeteer` ou biblioteca específica de NF-e)

---

## Receita Digital — `/receita`

> Tela implementada: **ReceitaPage**
> Rota frontend: `/receita`
> Estados: `idle → processando → validado | pendente | rejeitado`
> Aceita: PDF assinado digitalmente, QR code RNDS, imagem capturada por câmera.

### Métricas do dia

```
GET /api/v1/receita/metricas-dia
```
```json
{
  "receitas_hoje":  58,
  "validadas":      49,
  "em_analise":      7,
  "rejeitadas":      2,
  "tempo_medio_seg": 72
}
```

### Upload e processamento OCR

```
POST /api/v1/receita/importar        multipart/form-data (application/pdf | image/*)
```

**Response (processamento iniciado — polling):**
```json
{ "receita_id": "uuid", "status": "processando" }
```

```
GET /api/v1/receita/{receita_id}/status
```
```json
{
  "receita_id":   "uuid",
  "status":       "processando | validado | pendente | rejeitado",
  "paciente":     { "nome": "Mariana Souza", "cpf": "000.000.000-00" },
  "medico":       { "nome": "Dra. Camila Nogueira", "crm": "CRM 123456/SP" },
  "data_receita": "2025-05-01",
  "itens": [
    {
      "id": "uuid",
      "nome": "Losartana 50mg",
      "posologia": "1x ao dia",
      "controlado": false,
      "status_item": "liberado | analisar | bloqueado",
      "rms": "1234567"
    }
  ],
  "checklist": {
    "qr_code_lido":         true,
    "assinatura_valida":    true,
    "medicamento_elegivel": false,
    "pendencias": ["Sertralina 50mg requer receituário especial (Portaria 344)"]
  }
}
```

**Status calculado pelo backend:**
- `validado` — QR lido + assinatura válida + todos itens elegíveis
- `pendente` — ≥ 1 item controlado ou pendência de documento; operador deve conferir manualmente
- `rejeitado` — assinatura inválida, receita vencida (> 30 dias), ou produto não dispensável

### Conferência e liberação

```
POST /api/v1/receita/{receita_id}/liberar
```

**Body:**
```json
{ "farmaceutico_id": "uuid", "observacao": "Receituário especial conferido" }
```

**Response (sucesso):**
```json
{
  "receita_id":   "uuid",
  "status":       "validado",
  "protocolo":    "REC-2026-000183",
  "liberado_por": "uuid",
  "liberado_em":  "ISO8601"
}
```

**Efeitos colaterais:**
1. Se item controlado → gerar `SngpcLog` pendente de envio à ANVISA
2. Atualizar `ReceitaDigital.status` para `validado`
3. Emitir evento `receita.liberada` → PDV pode consumir para pré-vincular desconto PBM

### Rejeição manual

```
POST /api/v1/receita/{receita_id}/rejeitar
```
```json
{ "motivo": "assinatura_invalida | receita_vencida | produto_nao_elegivel | documento_incompleto" }
```

### Histórico

```
GET /api/v1/receita/historico-recente?limit=10
```
```json
[
  { "id": "uuid", "label": "Receita 2024-0183", "status": "validado", "status_label": "Validade ok",   "criado_em": "ISO8601" },
  { "id": "uuid", "label": "Receita 2024-0182", "status": "pendente", "status_label": "Pendente docs", "criado_em": "ISO8601" }
]
```

```
GET /api/v1/receita/historico?cpf={cpf}&page=1&limit=20    histórico por paciente ✅ mock (R-01)
GET /api/v1/receita/{receita_id}                            detalhes completos
```
Mock local em `ReceitaPage.tsx` — `HISTORICO_RECEITA[]`. Campos: `id, data, medico, medicamentos, status`.

### Ações rápidas (atalhos de teclado)

| Atalho | Ação | Endpoint |
|---|---|---|
| F3 | Conferir receita | GET /api/v1/receita/{id}/status |
| F4 | Gerar autorização | POST /api/v1/receita/{id}/liberar |
| F5 | Enviar para WhatsApp | POST /api/v1/receita/{id}/compartilhar |

```
POST /api/v1/receita/{receita_id}/compartilhar
```
```json
{ "canal": "whatsapp | email", "destinatario": "+5511999999999" }
```

### Modelos de dados

```
ReceitaDigital   id, farmacia_id, status, arquivo_url, paciente_nome, paciente_cpf,
                 medico_nome, crm, data_receita, protocolo, liberado_por_id, criado_em
ItemReceita      id, receita_id, produto_id, nome, posologia, controlado, rms, status_item
SngpcLog         id, item_receita_id, operacao, data, status_envio, anvisa_protocolo
```

### Permissões por perfil

| Operação | `operador_caixa` | `farmaceutico` | `admin` |
|---|---|---|---|
| Importar receita / consultar status | ✓ | ✓ | ✓ |
| Liberar medicamento controlado | — | ✓ | ✓ |
| Rejeitar receita | — | ✓ | ✓ |
| Visualizar histórico completo | — | ✓ | ✓ |

### TODOs críticos para implementação

- [ ] Integração com RNDS (Rede Nacional de Dados em Saúde) para validação de prescrição eletrônica
- [ ] OCR server-side: Google Vision / AWS Textract para extração de dados de receitas físicas
- [ ] Validação de assinatura ICP-Brasil em PDFs assinados digitalmente
- [ ] Verificação de CRM no CFM (Conselho Federal de Medicina) em tempo real
- [ ] Controle de receita de uso único (Portaria 344 — psicotrópicos e entorpecentes)
- [ ] Fila de processamento OCR em background (Bull / BullMQ) com webhook de conclusão
- [ ] Integração com SNGPC para lançamento automático de medicamentos controlados dispensados

---

## SNGPC — `/sngpc`

> Tela implementada: **SngpcPage** ✅
> Rota frontend: `/sngpc`
> Fluxo: farmacêutico confere movimentações de controlados manualmente → seleciona → envia lote à ANVISA → recebe protocolo.
> Obrigatório pela RDC ANVISA 204/2017 para farmácias com medicamentos sujeitos a controle especial.

### Status e métricas

```
GET /api/v1/sngpc/status
```
```json
{
  "pendentes":        23,
  "enviados_hoje":    41,
  "divergencias":      2,
  "ultima_sinc":      "2025-05-10T08:30:00Z",
  "anvisa_online":    true,
  "proximo_envio":    "2025-05-10T18:00:00Z"
}
```

### Movimentações pendentes de conferência

```
GET /api/v1/sngpc/movimentacoes-pendentes?page=1&limit=50&tipo=saida|entrada|ajuste&data=hoje|semana|mes
```
```json
[
  {
    "id":          "uuid",
    "tipo":        "saida",
    "produto":     "Ritalina 10mg",
    "dcb":         "07578",
    "lote":        "L-1042",
    "quantidade":  2,
    "paciente":    "Mariana Souza",
    "cpf_paciente":"000.000.000-00",
    "crm_medico":  "CRM 123456/SP",
    "receita_id":  "uuid",
    "data":        "2025-05-10T10:22:00Z",
    "status":      "pendente | conferido | divergencia"
  }
]
```

### Conferência individual

```
PATCH /api/v1/sngpc/movimentacoes/{id}
```
```json
{ "status": "conferido | divergencia", "observacao": "string | null" }
```

**Regras de conferência:**
- `conferido` — dados conferidos com receita física; libera para envio em lote
- `divergencia` — dado incorreto; bloqueia envio até correção manual; dispara alerta para `admin`

### Envio em lote à ANVISA

```
POST /api/v1/sngpc/enviar-lote
```
```json
{ "movimentacao_ids": ["uuid", "uuid"], "farmaceutico_id": "uuid" }
```

**Response (sucesso):**
```json
{
  "lote_id":       "uuid",
  "protocolo":     "ANVISA-2025-123456",
  "enviados":      18,
  "rejeitados":     0,
  "arquivo_xml":   "/api/v1/sngpc/lotes/uuid/xml",
  "status":        "aceito | rejeitado_parcial | rejeitado_total"
}
```

**Regras de envio:**
- Apenas movimentações com `status = conferido` entram no lote
- Máx. 500 movimentações por lote (limite ANVISA)
- Somente `farmaceutico` ou `admin` pode enviar
- Lote rejeitado pela ANVISA → cada movimentação volta para `pendente` com `observacao` do erro

### Histórico de envios

```
GET /api/v1/sngpc/lotes?page=1&limit=20
GET /api/v1/sngpc/lotes/{lote_id}           detalhes + movimentações do lote
GET /api/v1/sngpc/lotes/{lote_id}/xml       download do XML enviado
```

```json
[
  {
    "lote_id":   "uuid",
    "protocolo": "ANVISA-2025-123456",
    "enviados":  18,
    "status":    "aceito",
    "enviado_em":"2025-05-10T18:00:00Z",
    "farmaceutico": "João Silva"
  }
]
```

### Permissões por perfil

| Operação | `operador_caixa` | `farmaceutico` | `admin` |
|---|---|---|---|
| Ver movimentações pendentes | — | ✓ | ✓ |
| Conferir / marcar divergência | — | ✓ | ✓ |
| Enviar lote à ANVISA | — | ✓ | ✓ |
| Ver histórico de envios | — | ✓ | ✓ |
| Corrigir divergências | — | — | ✓ |

### TODOs críticos para implementação

- [ ] Integração com webservice ANVISA (SNGPC) — SOAP via certificado digital A1/A3
- [ ] Geração de XML no padrão SNGPC (XSD disponível no portal ANVISA)
- [ ] Assinatura digital do XML com certificado ICP-Brasil
- [ ] Agendamento automático de envio via cron (ex: diariamente às 18h)
- [ ] Conciliação automática entre `SngpcLog` e movimentações do estoque

---

## Cadastros — `/cadastros`

> Telas implementadas: **ProdutosPage** ✅ · **ClientesPage** ✅ · **FornecedoresPage** ✅ · **SngpcPage** ✅
> Estratégia: CRUD completo inline (modais de criação/edição) + importação via CSV + exportação.
> Estas telas são a fundação de todos os outros módulos — implementar antes de módulos de gestão.

### Produtos — `/cadastros/produtos`

```
GET    /api/v1/cadastros/produtos?search=&categoria=&controlado=&page=1&limit=50
GET    /api/v1/cadastros/produtos/{id}
POST   /api/v1/cadastros/produtos
PUT    /api/v1/cadastros/produtos/{id}
DELETE /api/v1/cadastros/produtos/{id}          soft delete (inativa)
POST   /api/v1/cadastros/produtos/importar-csv  multipart/form-data → { importados, erros[], preview[] }
GET    /api/v1/cadastros/produtos/exportar-csv  → arquivo CSV
GET    /api/v1/cadastros/produtos/template-csv  → CSV modelo para importação
```

**Body POST/PUT:**
```json
{
  "nome":          "Losartana Potássica 50mg",
  "ean":           "7891058012046",
  "dcb":           "05071",
  "ncm":           "3004.90.99",
  "categoria":     "cardiovascular",
  "fabricante":    "Medley",
  "preco_custo":   420,
  "preco_venda":   890,
  "margem_minima": 18,
  "estoque_minimo": 80,
  "controlado":    false,
  "portaria_344":  false,
  "requer_receita":false,
  "pbm_elegivel":  true,
  "rms":           "1234567",
  "forma_farmaceutica": "comprimido",
  "concentracao":  "50mg"
}
```

**Regras:**
- EAN único por farmácia
- `controlado: true` obriga preenchimento de `dcb` (código ANVISA)
- `portaria_344: true` exige receituário especial e SNGPC
- `margem_minima` usada pelo Precificador e pela validação de NF-e (alerta de `margem_baixa`)

### Clientes — `/cadastros/clientes`

```
GET    /api/v1/cadastros/clientes?search=&page=1&limit=50
GET    /api/v1/cadastros/clientes/{id}
GET    /api/v1/cadastros/clientes/buscar?cpf={cpf}     busca exata por CPF (usado pelo PDV e PBM)
POST   /api/v1/cadastros/clientes
PUT    /api/v1/cadastros/clientes/{id}
DELETE /api/v1/cadastros/clientes/{id}
POST   /api/v1/cadastros/clientes/importar-csv
GET    /api/v1/cadastros/clientes/exportar-csv
```

**Body POST/PUT:**
```json
{
  "nome":        "Mariana Souza",
  "cpf":         "000.000.000-00",
  "data_nascimento": "1985-03-12",
  "telefone":    "+5511999999999",
  "email":       "mariana@email.com",
  "convenio":    "farmacia_popular | aqui_tem | privado | null",
  "observacoes": "string"
}
```

**Campos automáticos (gerados pelo backend):**
- `pontos_fidelidade` — acumulado por compras
- `historico_receitas[]` — vinculado via `ReceitaDigital`
- `historico_pbm[]` — vinculado via `AtendimentoPbm`

### Fornecedores — `/cadastros/fornecedores`

```
GET    /api/v1/cadastros/fornecedores?search=&page=1&limit=50
GET    /api/v1/cadastros/fornecedores/{id}
POST   /api/v1/cadastros/fornecedores
PUT    /api/v1/cadastros/fornecedores/{id}
DELETE /api/v1/cadastros/fornecedores/{id}
POST   /api/v1/cadastros/fornecedores/importar-csv
GET    /api/v1/cadastros/fornecedores/exportar-csv
```

**Body POST/PUT:**
```json
{
  "razao_social": "Plasma Sul Distribuição Ltda",
  "nome_fantasia": "Plasma Sul",
  "cnpj":         "12.345.678/0001-99",
  "ie":           "123.456.789.000",
  "telefone":     "+5511333334444",
  "email":        "pedidos@plasmasul.com.br",
  "endereco":     { "logradouro": "...", "cidade": "São Paulo", "uf": "SP", "cep": "01234-000" },
  "prazo_entrega_dias": 3,
  "condicao_padrao": "30_60_90"
}
```

### Padrão de resposta de importação CSV

```json
{
  "total":      150,
  "importados":  147,
  "erros": [
    { "linha": 23, "campo": "ean", "motivo": "EAN já cadastrado" },
    { "linha": 51, "campo": "cpf", "motivo": "CPF inválido" }
  ],
  "preview": [ /* primeiros 5 registros para confirmação */ ]
}
```

> Importação é feita em **duas etapas**: (1) preview com validação → (2) confirmação de importação. Evita imports parciais sem ciência do operador.

---

## Fluxos de modal faltantes em módulos existentes

### PDV — produto controlado inline (P-01)  ✅ mock — ModalControladoInline em PdvPage.tsx

```
GET /api/v1/receita/{id}
```
```json
{
  "receita_id": "RX-2026-007291",
  "paciente_cpf": "000.000.000-00",
  "medico_crm": "CRM/SP 12345",
  "status": "validado",
  "itens": [{ "produto_id": "uuid", "nome": "Morfina 10mg", "controlado": true }]
}
```

> Ao vincular: frontend aplica `receita_id` ao `CartItem` via `setCart`. Backend gera `SngpcLog` ao confirmar a venda (`POST /api/v1/vendas`). `hasControlledUnlinked` bloqueia botão "Finalizar venda" enquanto houver item `controlado: true` sem `receita_id`.

---

### Entrada NF-e — vincular produto sem catálogo (N-01)  ✅ mock — CelulaBusca em EntradaNfePage.tsx

```
GET /api/v1/produtos/buscar?q={termo}
```
```json
[
  { "id": "uuid", "nome": "Metformina 850mg", "ean": "7891058012001", "dcb": "6625" },
  { "id": "uuid", "nome": "Metformina 500mg", "ean": "7891058012002", "dcb": "6625" }
]
```

> Busca com debounce (≥2 chars) — filtra por nome ou EAN. Ao selecionar: `no_catalog` passa a `false` + `produto_id` preenchido + badge "Vinculado" exibido. `POST /api/v1/fiscal/nfe/{chave}/itens/lotes` deve receber o `produto_id` vinculado.

---

### PDV — validação PBM inline

```
POST /api/v1/pdv/validar-pbm-inline
```
```json
{
  "cpf_paciente": "000.000.000-00",
  "convenio":     "farmacia_popular | aqui_tem | privado",
  "itens": [
    { "produto_id": "uuid", "quantidade": 2 }
  ]
}
```
```json
{
  "elegivel":      true,
  "desconto_valor": 2760,
  "desconto_pct":   30,
  "autorizacao_id": "uuid",
  "validade":       "2025-05-10T23:59:59Z"
}
```

> Diferença de `/pbm/validar`: endpoint mais leve, sem wizard, retorna apenas o necessário para aplicar desconto no carrinho do PDV.

### Estoque — reposição e transferência

```
POST /api/v1/estoque/reposicao/solicitar  ✅ mock E-01 — ModalReposicao em EstoquePage.tsx
```
```json
{
  "produto_id":    "uuid",
  "lote_id":       "uuid | null",
  "fornecedor_id": "uuid",
  "quantidade":    200,
  "observacao":    "string | null"
}
```
Response: `{ "pedido_id": "uuid", "status": "pendente", "previsao_entrega": "ISO8601" }`

```
POST /api/v1/estoque/transferencia  ✅ mock E-02 — ModalTransferencia em EstoquePage.tsx
```
```json
{
  "produto_id":     "uuid",
  "lote_id":        "uuid",
  "quantidade":     50,
  "filial_origem":  "uuid",
  "filial_destino": "uuid",
  "motivo":         "reequilibrio | urgencia | vencimento_proximo"
}
```
Response: `{ "transferencia_id": "uuid", "status": "executada" }`

---

## Módulos pendentes de implementação no frontend

Os namespaces abaixo ainda não têm tela — ou foram implementados com mock (ver abaixo):

**Implementados com mock (endpoints TODO marcados na página):**
- `FinanceiroPage` ✅ — `GET /api/v1/financeiro/contas-pagar`, `POST /api/v1/financeiro/contas-pagar/{id}/baixar`, `GET /api/v1/financeiro/resumo`
- `RelatoriosPage` ✅ — `POST /api/v1/relatorios/gerar` (body: `{ tipo, data_inicio, data_fim, formato, filtros? }` → retorna `{ arquivo_url, gerado_em, registros, formato }`)

- `WhatsAppPage` ✅ — **3 abas**: Hub (QR+automação), Atendimentos (3-painéis unificados: lista+chat+painel-ação), Campanhas. AbaAtendimentos substitui as antigas AbaConversas + AbaAtendimento (unificação 2026-05-19). Integração via EvolutionAPI (ver seção abaixo).

- `FidelizacaoPage` ✅ — `GET /api/v1/fidelizacao/programa`, `GET /api/v1/fidelizacao/clientes?segmento=`, `GET /api/v1/fidelizacao/transacoes`, `POST /api/v1/fidelizacao/campanhas`

- `PrecificadorPage` ✅ — `GET /api/v1/precificador/produtos?status=`, `POST /api/v1/precificador/publicar` (body: `{ produto_id, preco_novo }`), `GET /api/v1/precificador/concorrentes`

- `AdministracaoPage` ✅ — **2 abas** (Operacional/Plataforma). `GET /api/v1/administracao/usuarios`, `POST /api/v1/administracao/usuarios`, `PATCH /api/v1/administracao/usuarios/{id}` (body: `{ ativo?, perfil?, modulos_permitidos? }`)

**Pendentes (integração backend — telas com mock):**
```
/api/v1/whatsapp/        tela implementada com mock — integração EvolutionAPI pendente
/api/v1/fidelizacao/     tela implementada com mock — endpoints pendentes
/api/v1/precificador/    tela implementada com mock — endpoints pendentes
/api/v1/administracao/   tela implementada com mock — endpoints pendentes
```

---

## WhatsApp / CRM — EvolutionAPI

> Tela implementada: **WhatsAppPage** (3 abas: Hub, Atendimentos, Campanhas)
> AbaAtendimentos = lista unificada (aguardando/em_atendimento/resolvido) + chat + painel-ação com ClienteHeader fixo + 4 tabs (Orçamento/Receita/Pedido/Histórico)
> Rota frontend: `/whatsapp`
> Integração: **EvolutionAPI** (self-hosted REST + Webhook)

### Visão geral da arquitetura

```
Cliente WhatsApp ↔ EvolutionAPI ↔ Backend ERP ↔ Frontend (REST + WebSocket)
```

EvolutionAPI roda em container separado (Docker). O backend ERP:
1. Registra instância e webhook ao inicializar
2. Recebe eventos via `POST /api/v1/whatsapp/webhook`
3. Emite eventos para o frontend via WebSocket
4. Envia mensagens fazendo chamadas REST à EvolutionAPI

### Endpoints do ERP (a implementar)

```
# Hub / conexão
GET  /api/v1/whatsapp/status              → { conectado, qrcode?, instancia }
POST /api/v1/whatsapp/reconectar          → gera novo QR code

# AbaAtendimentos — conversas unificadas (aguardando + em_atendimento + resolvido)
GET  /api/v1/whatsapp/conversas           → lista com ?status=aguardando|em_atendimento|resolvido
GET  /api/v1/whatsapp/conversas/{id}/msgs → histórico de mensagens paginado
POST /api/v1/whatsapp/conversas/{id}/send { texto } → envia via EvolutionAPI
POST /api/v1/whatsapp/conversas/{id}/attach { base64, mimetype, fileName }
POST /api/v1/whatsapp/conversas/{id}/iniciar    → aguardando → em_atendimento
POST /api/v1/whatsapp/conversas/{id}/encerrar   → em_atendimento → resolvido
POST /api/v1/whatsapp/conversas/{id}/transfer { atendente_id }

# Ações do painel direito (AbaAtendimentos — painel-ação)
POST /api/v1/whatsapp/conversas/{id}/orcamento/enviar
     { itens: { produto_id, qty, preco }[] } → envia mensagem de orçamento formatada no chat
POST /api/v1/whatsapp/conversas/{id}/receita/validar
     { receita_id } → vincula receita digital e retorna { valida, medicamentos[] }
POST /api/v1/whatsapp/conversas/{id}/pedido/separar
     { itens[], receita_id? } → cria pré-venda + notifica cliente + enfileira no PDV
GET  /api/v1/whatsapp/conversas/{id}/historico
     → compras, receitas e atendimentos anteriores do cliente

# Templates e campanhas
GET  /api/v1/whatsapp/templates           → lista templates aprovados
POST /api/v1/whatsapp/enviar              { cliente_id, template_id, canal }
POST /api/v1/whatsapp/campanha            { nome, template_id, segmento, agendar_em? }

# Webhook (recebe eventos da EvolutionAPI)
POST /api/v1/whatsapp/webhook
```

### Payload do webhook (EvolutionAPI → Backend)

```json
{
  "event": "MESSAGES_UPSERT",
  "instance": "farmacorp-matriz",
  "data": {
    "key": { "remoteJid": "5511987654321@s.whatsapp.net", "fromMe": false, "id": "uuid" },
    "message": { "conversation": "Tem dipirona 500mg?" },
    "messageTimestamp": 1716297600,
    "pushName": "Maria Silva"
  }
}
```

Eventos relevantes: `MESSAGES_UPSERT` (nova msg) · `MESSAGES_UPDATE` (lida/entregue) · `CONNECTION_UPDATE` (status QR)

### WebSocket frontend ← backend

```
WS /api/v1/whatsapp/ws

Eventos emitidos pelo backend:
{ tipo: 'nova_mensagem',  dados: { conversa_id, bubble: Bubble } }
{ tipo: 'nova_conversa',  dados: Conversa }
{ tipo: 'status_alterado', dados: { conversa_id, status: ConvStatus } }
{ tipo: 'conexao',         dados: { conectado: boolean } }
```

### Efeitos colaterais de `separar-pedido`

1. Criar `ItemVenda` no sistema (ou pré-venda aguardando retirada)
2. Marcar `AtendimentoItem.status = 'pedido_criado'`
3. Enviar mensagem WhatsApp ao cliente: "Seu pedido foi separado! Retire em X min."
4. Gerar notificação interna para a fila do PDV

### Modelos de dados adicionais

```
Conversa        id, farmacia_id, telefone, nome_contato,
                status: 'aguardando' | 'em_atendimento' | 'resolvido',
                unread, preview, hora_ultima_msg, atendente_id,
                alertas: string[],
                receita_id?, orcamento_items?: OrcamentoItem[], pedido_id?
Mensagem        id, conversa_id, tipo(recebida/enviada/sistema), texto, arquivo_url,
                mimetype, hora, lido, evolution_msg_id
OrcamentoItem   produto_id, nome, laboratorio, apresentacao, preco, pbm_desconto?, qty
```

> **Nota:** `AtendimentoFila` foi absorvida por `Conversa.status` — não há mais tabela separada de fila. O status da conversa é a única fonte de verdade sobre o estado do atendimento.

---

## Modelos de dados principais

```
Farmacia      id, nome, cnpj, endereco
Operador      id, farmacia_id, nome, email, perfil, senha_hash
Caixa         id, farmacia_id, numero, status(aberto/fechado)
Turno         id, caixa_id, operador_id, inicio, fim, fundo_troco
Venda         id, turno_id, cliente_id, total, desconto_pbm, desconto_manual, nfce_chave
ItemVenda     venda_id, produto_id, qty, preco_unitario, lote
Produto       id, farmacia_id, nome, ean, preco, controlado, categoria
Lote          id, produto_id, numero, validade, estoque_atual, estoque_minimo
Movimentacao  id, tipo(entrada/saida/ajuste/sangria), produto_id, lote_id, quantidade, motivo, turno_id
Inventario    id, farmacia_id, data, operador_id, status(em_andamento/concluido/aprovado)
ItemInventario inventario_id, produto_id, lote_id, qtd_sistema, qtd_contada, motivo, status_ajuste
SngpcLog      id, lote_id, operacao, data, status_envio, anvisa_protocolo
Cliente       id, farmacia_id, nome, cpf, telefone, pontos_fidelidade
```

---

## Middleware obrigatório

```
1. autenticacao     → valida JWT, injeta operador no contexto
2. autorizacao      → verifica perfil mínimo por rota
3. farmacia_scope   → garante que operador só acessa dados da sua farmácia
4. audit_log        → registra toda escrita (POST/PUT/DELETE) com operador + timestamp
5. rate_limit       → por operador_id
```

Rotas públicas (sem middleware 1 e 2): `POST /auth/login`.
