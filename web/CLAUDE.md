# Farmacorp ERP — Instruções para Claude

@PLANNING.md

## Pencil MCP — Design fidelity (padrão obrigatório)

O arquivo de design `/C:/Users/Desktop/Documents/erp-drograria.pen` é a fonte canônica de layout para este projeto.

**Regra:** sempre que o Pencil MCP estiver disponível (`mcp__pencil__*`), consultar o frame da tela antes de implementar ou ajustar qualquer página. Extrair:

- **Cores exatas** (fills, borders) → mapear para tokens Tailwind ou hex permitidos (`#F5F8F6`, `#FBFCFB`)
- **Corner radius** → `rounded-[Npx]` conforme o design (ex: `cornerRadius:18` → `rounded-[18px]`)
- **Tamanhos de texto** → `text-[Npx]` conforme o design
- **Espaçamentos e alturas** → `h-[Npx]`, `px-N`, `py-N` conforme o design
- **Estrutura de colunas e cards** → respeitar a hierarquia de grupos do Pencil

**Fluxo de consulta:**
1. `get_editor_state` — identificar frame da tela (por nome)
2. `batch_get` com IDs dos nós relevantes — extrair fills, radius, sizes
3. `get_screenshot` — validar visualmente o resultado
4. Aplicar no `.tsx` com classes Tailwind correspondentes

Quando o design divergir de um padrão do CLAUDE.md (ex: `rounded-3xl` vs `rounded-[18px]`), o **design Pencil tem precedência** para a tela em questão.

---

## Projeto
ERP para farmácias: PDV, caixa, estoque, fiscal (NF-e/SNGPC), PBM e WhatsApp.
Stack: React 19 + Vite 8 + TypeScript 6 + Tailwind v4 + React Router v7.

---

## Estrutura de arquivos

```
src/
├── components/
│   ├── layout/        # AppLayout (shell do app) + Sidebar (nav)
│   └── ui/            # Design system — ver src/components/ui/CLAUDE.md
├── pages/             # Uma página por rota
├── router.tsx         # createBrowserRouter com todas as rotas
└── index.css          # @theme com todos os tokens de cor
backend/
└── CLAUDE.md          # Specs de API por módulo
```

---

## Rotas existentes

| Rota | Página | Observação |
|---|---|---|
| `/login` | LoginPage | Fora do AppLayout |
| `/dashboard` | DashboardPage | |
| `/pdv` | PdvPage | `?caixaAberto=true` ativa o PDV |
| `/pdv/abertura-caixa` | AberturaCaixaPage | |
| `/pdv/fechamento-caixa` | FechamentoCaixaPage | |
| `/pdv/finalizar` | FinalizarVendaPage | |
| `/estoque` | EstoquePage | |
| `/estoque/ajuste` | AjusteEstoquePage | |
| `/fiscal` | FiscalPage | Hub de emissão NF-e: métricas, formulário de emissão, histórico e ações rápidas |
| `/fiscal/entrada-nfe` | EntradaNfePage | Wizard 3 etapas: identificação → itens/lotes → conferência |
| `/pbm` | PbmPage | Wizard 3 etapas: autorização gov (CPF/CRM/RMS) → medicamentos (lista + modal) → finalização |
| `/receita` | ReceitaPage | Multi-estado 5 fases: idle → processando (OCR) → validado / pendente / rejeitado |
| `/cadastros/produtos` | CadastroProdutosPage | Coluna única: métricas header + barra de ações + tabela paginada + ModalProduto (CRUD) + ModalImportCSV (2 etapas) |
| `/cadastros/clientes` | CadastroClientesPage | Duas colunas: métricas + alerta + tabela esquerda + form/histórico direita. ModalHistoricoCliente. |
| `/cadastros/fornecedores` | CadastroFornecedoresPage | Coluna única: métricas + alerta fiscal + tabela paginada + ModalFornecedorForm (CRUD) + ModalPedidosFornecedor. |
| `/sngpc` | SngpcPage | Duas colunas: tabela de movimentações com checkbox multi-seleção (esq.) + painel métricas + envio em lote + histórico (dir.). ModalDetalheMovimentacao. Demo switcher ANVISA. |
| `/financeiro` | FinanceiroPage | Duas colunas: lista de contas a pagar com filtros (esq.) + métricas + conta selecionada + baixa (dir.). ModalBaixaContaPagar com validação Zod. |
| `/relatorios` | RelatoriosPage | Coluna única: 5 cards de categoria (Vendas/Estoque/SNGPC/PBM/Financeiro) + painel de filtros + preview de dados + exportação PDF/Excel. |
| `/whatsapp` | WhatsAppPage | 3 abas: Hub (QR+automação) · Atendimentos (3-painéis unificados: lista+chat+painel-ação) · Campanhas. Painel de ação com cliente fixo + 4 tabs (Orçamento/Receita/Pedido/Histórico). |
| `/fidelizacao` | FidelizacaoPage | Duas colunas: progresso de segmentos + top clientes (esq.) · campanhas + transações recentes (dir.). ModalNovaCampanha com NovaCampanhaFidelizacaoSchema.safeParse(). |
| `/precificador` | PrecificadorPage | Duas colunas: calculadora de faixas (3 bands) + produtos críticos selecionáveis (esq.) · concorrentes + ações rápidas + margem OK (dir.). |
| `/administracao` | AdministracaoPage | 2 abas: Operacional (tiles 6 módulos + ModalUsuarios CRUD) · Plataforma (tiles + observabilidade). Painel direito: audit log + alerta crítico. |

**Ao adicionar rota:** importar a page em `router.tsx` e incluir como filho do `AppLayout`. Atualizar esta tabela e `backend/CLAUDE.md`.

---

## Fluxos pendentes nas telas existentes

Modais e sub-fluxos que faltam nas telas já implementadas. Implementar **antes** de criar novas rotas — são vínculos críticos entre módulos. Cada item é um modal interno (padrão overlay `<button>`) ou integração de navegação.

### PDV (`/pdv`)

| Fluxo | Status | Gatilho | Observação |
|---|---|---|---|
| **Modal: Produto controlado** | ✅ | Botão "Vincular" na col. SNGPC (item `controlado: true`) | `ModalControladoInline`: banner Portaria 344 + CPF + N.º receita + CRM. `hasControlledUnlinked` bloqueia botão "Finalizar venda". Ao confirmar, atualiza `cart` com `receita_id`. Mock `GET /api/v1/receita/{id}` + gera `SngpcLog`. |
| **Modal: Aplicar PBM** | ✅ | Botão "PBM" por item no carrinho (col. `56px`) | `ModalPbmInline`: CPF + convênio → "Consultar PBM" → card "Elegível 45%" → "Aplicar desconto". Mock `POST /api/v1/pdv/validar-pbm-inline`. Banners de contexto: `pbm_autorizacao_id` → banner verde; `receita_id` → banner info. |
| **Modal: Sangria** | ✅ | Botão "Sangria" no rodapé (caixa aberto) | `ModalCaixa` com valor+motivo. `TODO: POST /api/v1/pdv/sangria`. |
| **Modal: Suprimento** | ✅ | Botão "Suprimento" no rodapé (caixa aberto) | `ModalCaixa` com valor+origem. `TODO: POST /api/v1/pdv/suprimento`. |
| **Estado: Caixa fechado** | ✅ | `/pdv` sem `?caixaAberto=true` | Tela centralizada com CTA → `/pdv/abertura-caixa`. |

### Estoque (`/estoque`)

| Fluxo | Status | Gatilho | Observação |
|---|---|---|---|
| **Modal: Solicitar reposição** | ✅ | Botão "Repor" em item `critico` ou `comprar` | `ModalReposicao`: select fornecedor + qtd pré-preenchida (`minimo - estoque`) + obs opcional. Mock `POST /api/v1/estoque/reposicao/solicitar`. |
| **Modal: Transferência** | ✅ | Botão "Transferir" na coluna Ações (todos os itens) | `ModalTransferencia`: select filial + qtd (max estoque atual) + motivo. Mock `POST /api/v1/estoque/transferencia`. |
| **Filtro: Por validade** | ✅ | Toggle "Por validade ↑" na barra | Ordena `sortedItems` por `validade_dias` asc. Campo numérico no dataset. |

### Fiscal — Hub (`/fiscal`)

| Fluxo | Status | Gatilho | Observação |
|---|---|---|---|
| **Modal: Carta de correção** | ✅ | Botão "Emitir carta de correção" em Ações rápidas | `ModalCartaCorrecao`: select NF-e do `HISTORICO` + textarea com contador (min 15/max 1000); "Enviar CC-e" desabilitado até atingir mínimo. Mock `POST /api/v1/fiscal/nfe/carta-correcao`. |
| **Modal: Cancelar NF-e** | ✅ | Botão "Cancelar" por linha `autorizada` no Histórico | `ModalCancelarNfe`: banner danger (aviso 24h) + select `MOTIVOS_CANCELAMENTO` + checkbox de confirmação; botão `bg-danger-600` habilitado só quando ambos preenchidos. Mock `POST /api/v1/fiscal/nfe/{id}/cancelar`. |
| **Estado: SEFAZ offline** | ✅ | Demo switcher `online`/`offline` no header | `useState(true)` — chip + banner warning quando offline. |

### PBM (`/pbm`)

| Fluxo | Status | Gatilho | Observação |
|---|---|---|---|
| **Modal: Histórico do paciente** | ✅ | Botão "Ver histórico" no campo CPF | `ModalHistoricoPbm` — tabela data/produto/convênio/status. Mock `HISTORICO_PBM`. |
| **Envio ao caixa (Etapa 3)** | ✅ | Botão "Finalizar e enviar ao caixa" | `useNavigate` → `/pdv?caixaAberto=true` com `state.pbm_autorizacao_id`. PDV exibe banner verde de confirmação. |

### Receita Digital (`/receita`)

| Fluxo | Status | Gatilho | Observação |
|---|---|---|---|
| **Modal: Histórico do paciente** | ✅ | Botão "Histórico" no card do paciente | `ModalHistoricoReceita` — tabela data/médico/medicamentos/status. Mock `HISTORICO_RECEITA`. |
| **Integração com PDV** | ✅ | Botão "Concluir atendimento →" (status validado) | `useNavigate` → `/pdv?caixaAberto=true` com `state.receita_id`. PDV exibe banner info de receita vinculada. |
| **Confirmação SNGPC** | ⬜ | Após `POST /receita/{id}/liberar` para controlado | Exibir protocolo gerado pelo backend (efeito colateral do endpoint). |

### Entrada NF-e (`/fiscal/entrada-nfe`)

| Fluxo | Status | Gatilho | Observação |
|---|---|---|---|
| **Vincular produto sem catálogo** | ✅ | Item com `no_catalog: true` na Etapa 2 | `CelulaBusca`: input com debounce → filtra `CATALOGO_MOCK` (≥2 chars) → dropdown `onMouseDown` → badge "Vinculado" após seleção. Mock `GET /api/v1/produtos/buscar?q={termo}`. |

---

## Telas a criar — prioridade

| Prioridade | Rota | Status | Schema | Justificativa |
|---|---|---|---|---|
| 🔴 Alta | `/sngpc` | ✅ | `src/schemas/sngpc.ts` ✅ | Obrigatório por lei (ANVISA/RDC 204). Implementado com mock. |
| 🟡 Média | `/financeiro` | ✅ | `src/schemas/financeiro.ts` ✅ | Contas a pagar geradas por NF-e já existem no backend sem tela. |
| 🟡 Média | `/whatsapp` | ✅ | `src/schemas/whatsapp.ts` ✅ | 4 abas: Hub · Conversas (3-painéis chat) · Atendimento (ops panel 4 abas) · Campanhas. EvolutionAPI pendente. |
| 🟡 Média | `/relatorios` | ✅ | `src/schemas/relatorio.ts` ✅ | Visibilidade para gestão: vendas, SNGPC, estoque, PBM. |
| 🟢 Normal | `/fidelizacao` | ✅ | `src/schemas/fidelizacao.ts` ✅ | Pontos, segmentos e campanhas. ModalNovaCampanha com validação Zod. |
| 🟢 Normal | `/precificador` | ✅ | `src/schemas/precificador.ts` ✅ | Calculadora de faixas + comparação de concorrentes + ações rápidas. |
| 🟢 Normal | `/administracao` | ✅ | `src/schemas/administracao.ts` ✅ | 2 abas (Operacional/Plataforma). ModalUsuarios com NovoUsuarioSchema.safeParse(). |

**Schemas de suporte já criados:** `src/schemas/auth.ts` (Operador, Perfil, Sessao) · `src/schemas/dashboard.ts` (ResumoDia, AlertaCritico)

**Regra AI-first:** criar o schema Zod do módulo antes de iniciar a implementação da tela. `z.infer<>` é a fonte única de tipos — nunca declarar `type` manual paralelo.

---

## Padrão de tela para módulos de Cadastro

Todas as telas de cadastro (`/cadastros/*`) seguem o **padrão Lista + Modais**. Nunca implementar formulário inline na página — o formulário fica sempre dentro de um modal.

### Estrutura obrigatória

```
CadastroPaginaPage
├── Header card: título + subtítulo + botão "Novo X" (abre ModalFormX)
├── Grid de 5 métricas (useMemo sobre o estado local)
├── [Opcional] Banner de alertas (bg-warning-25 border-warning-100)
├── Card da tabela (flex-1, overflow-y-auto):
│   ├── Barra de busca (filtra por texto em tempo real) + contador de resultados
│   ├── Header de colunas (bg-[#F5F8F6])
│   └── Linhas com avatar de iniciais + dados + badges + [Editar] [Histórico/Pedidos]
├── ModalFormX (novo: dados em branco | editar: pré-preenchido com item selecionado)
│   └── Formulário em seções com grid 2col, body overflow-y-auto, footer fixo
└── ModalHistoricoX / ModalPedidosX (read-only, tabela de registros anteriores)
```

### Regras do padrão

| Regra | Detalhe |
|---|---|
| Sem formulário inline na página | Todo CRUD usa modal; a página só exibe a lista |
| `novoOpen: boolean` + `editando: T \| null` | Estado separado — nunca `modalItem: T \| null \| 'novo'` |
| `handleSalvar(data, id?)` | `id` presente → PUT; ausente → POST. Fecha modal ao concluir. |
| Busca client-side com `useMemo` | Filtra por campos relevantes (nome, CPF/CNPJ, cidade…) |
| Avatar de iniciais | `Iniciais({ nome })` — círculo `bg-brand-100` com 2 letras `text-brand-700` |
| Badge de tipo/categoria | Lookup `TIPO_CFG: Record<string, string>` para classes Tailwind |
| Modal de histórico | Recebe o item selecionado como prop; exibe tabela read-only com mock |
| Biome `noLabelWithoutControl` | Todo `<input>`/`<select>` tem `id` + `<label htmlFor>` correspondente |

### Colunas típicas da tabela

```
grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)_100px_..._90px_130px]
```
Última coluna sempre `130px` para os dois botões de ação [Editar] [Histórico/Pedidos].

### Referências de implementação

| Página | Padrão | Detalhe especial |
|---|---|---|
| `CadastroProdutosPage` | Lista + Modal CRUD + ModalImportCSV | ModalImportCSV 2 etapas: upload/preview → confirmar |
| `CadastroClientesPage` | Lista + ModalClienteForm + ModalHistoricoCliente | Toggles WhatsApp/SMS, seção saúde |
| `CadastroFornecedoresPage` | Lista + ModalFornecedorForm + ModalPedidosFornecedor | Seção condições comerciais, badge tipo colorido |

---

## Padrões de layout de página

### Quatro estruturas possíveis

**A — Coluna única** (Dashboard, AjusteEstoque):
```tsx
<div className="flex flex-1 flex-col gap-4 min-h-0">
  <header className="rounded-3xl border border-brand-100 bg-white px-5.5 py-4" />
  <div className="flex flex-1 min-h-0 flex-col rounded-3xl border border-brand-100 bg-white">
    <div className="flex-1 overflow-y-auto">{/* corpo scrollável */}</div>
  </div>
</div>
```

**B — Duas colunas** (Estoque, FechamentoCaixa):
```tsx
<div className="flex flex-1 gap-4 min-h-0">
  <div className="flex flex-1 flex-col gap-4 min-h-0">{/* coluna principal */}</div>
  <div className="flex w-82.5 shrink-0 flex-col gap-4">{/* painel lateral */}</div>
</div>
```

**C — Coluna + painel direito fixo** (PDV, FinalizarVenda):
```tsx
<div className="flex flex-1 flex-col gap-4">
  <header />
  <div className="flex min-h-0 flex-1 gap-4">
    <div className="flex min-h-0 flex-1 flex-col gap-4">{/* esquerda */}</div>
    <div className="flex w-115 shrink-0 flex-col gap-4">{/* direita */}</div>
  </div>
</div>
```

**D — Três painéis contíguos (chat)** (WhatsAppPage — AbaConversas / AbaAtendimento):
```tsx
{/* Container único sem gap — bordas unificadas formam um único card */}
<div className="flex min-h-0 flex-1 overflow-hidden rounded-[20px] border border-[#DCE7E1]">
  {/* Painel esquerdo: lista de conversas / mini-lista */}
  <div className="flex w-[320px] shrink-0 flex-col border-r border-[#DCE7E1] bg-white">
    {/* conteúdo com overflow-y-auto */}
  </div>
  {/* Painel central: chat (flex-1) */}
  <div className="flex min-h-0 flex-1 flex-col bg-[#F7FAF8]">
    {/* header + messages scroll + input bar */}
  </div>
  {/* Painel direito: contexto (cliente ou operações) */}
  <div className="flex w-70 shrink-0 flex-col border-l border-[#DCE7E1] bg-white">
    {/* conteúdo */}
  </div>
</div>
```

**Regras específicas do layout chat:**
- `overflow-hidden` no container externo garante que `rounded-[20px]` corta os painéis internos
- `border-r` / `border-l` nos painéis (cor `#DCE7E1`) em vez de `gap` — painéis ficam colados
- Chat background: `bg-[#F7FAF8]` (não `bg-white`)
- Tokens de cor do chat: ver `.spec/whatsapp-atendimentos.spec.md`
- Painel direito é sempre **360px** — o conteúdo interno muda por aba, não o painel
- `ClienteHeader` fica fixo acima das abas — atendente nunca perde referência do cliente

**Regra:** `min-h-0` em cada nível flex que precisa propagar altura para `overflow-y-auto` funcionar.

### Cards de seção
```tsx
<div className="rounded-3xl border border-brand-100 bg-white p-5">
```
Variante compacta (PDV lateral): `p-3.5` e `gap-2.5`.

### Tabelas internas

Header: `bg-[#F5F8F6]` com `rounded-[12px]` — rows: `bg-[#FBFCFB]` com `rounded-[14px]`  
Colunas definidas com `grid-cols-[...]` — usar `minmax(0,1fr)` na coluna flexível.

Esses dois valores hex (`#F5F8F6` e `#FBFCFB`) são os únicos permitidos sem token.

---

## Padrões de componentes de página

### Sub-componentes locais (não exportados)

Componentes usados apenas na página ficam no **mesmo arquivo**, sem export:

```tsx
function StatPill({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) { ... }
function MovRow({ label, value, valueClass }: { ... }) { ... }
function DiffCell({ diff }: { diff: number }) { ... }
function MetricItem({ label, value, variant }: { ... }) { ... }
```

### Status-driven styling (lookup tables)

```tsx
const ROW_BG: Record<MyStatus, string> = {
  ok:      'bg-[#FBFCFB]',
  alerta:  'bg-warning-50',
  critico: 'bg-danger-50',
}

const STATUS_CFG: Record<MyStatus, { label: string; bg: string; text: string }> = {
  ok:      { label: '● OK',       bg: 'bg-brand-75',  text: 'text-brand-750'   },
  alerta:  { label: '● Alerta',   bg: 'bg-warning-50', text: 'text-warning-800' },
  critico: { label: '✗ Crítico',  bg: 'bg-danger-50',  text: 'text-danger-700'  },
}
```

### Métricas ao vivo com useMemo

```tsx
const stats = useMemo(() => ({
  total:           rows.length,
  comDivergencia:  rows.filter((r) => r.diff !== 0).length,
  valorAjustado:   rows.reduce((sum, r) => sum + Math.abs(r.diff) * r.preco, 0),
}), [rows])
```

### Células editáveis inline (tabelas de inventário)

```tsx
{/* input numérico */}
<input type="number" min="0"
  className="w-full rounded-lg border border-input-border bg-white px-2.5 py-1.5
             text-[13px] text-brand-950 outline-none
             focus:border-brand-700 focus:ring-1 focus:ring-brand-700/20" />

{/* select de motivo */}
<select className="w-full rounded-lg border border-input-border bg-white px-2 py-1.5
                   text-[12px] text-brand-950 outline-none focus:border-brand-700" />
```

### Toggle de filtro

```tsx
<button type="button" onClick={() => setToggle((v) => !v)}
  className={toggle
    ? 'border-brand-700 bg-brand-75 text-brand-750'
    : 'border-brand-100 bg-white text-brand-muted hover:bg-brand-50'}>
  Só divergências
</button>
```

### Progress bars de estoque

```tsx
<div className="h-2 w-full overflow-hidden rounded-full bg-brand-100">
  <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
</div>
```
Variante warning: `bg-warning-100` / `bg-warning-600`.

### Componente multi-estado (3+ variações de UI)

Quando uma única tela tem estados mutuamente exclusivos (ex: revisao / bloqueado / sucesso), use `useState` + lookup tables. **Não** ramifique em sub-componentes separados:

```tsx
type PageStatus = 'revisao' | 'bloqueado' | 'sucesso'

const MSG: Record<PageStatus, string> = {
  revisao:  'Todos os itens serão lançados após confirmação.',
  bloqueado: 'Bloqueado até resolver pendências críticas.',
  sucesso:  'Protocolo #EN-2026-004812 gerado e enviado.',
}

const FOOTER: Record<PageStatus, { text: string; cls: string }> = {
  revisao:  { text: 'Atualizações automáticas após confirmação.', cls: 'text-text-secondary' },
  bloqueado: { text: 'Pendências fiscais críticas.',              cls: 'font-semibold text-danger-700' },
  sucesso:  { text: 'Estoque e financeiro atualizados.',          cls: 'font-semibold text-brand-700' },
}

const [status, setStatus] = useState<PageStatus>('revisao')
// botão principal → setStatus('sucesso')
// estado bloqueado → botão com cursor-not-allowed bg-brand-300
```

**Demo switcher** (tiny pills no header do card para alternar estados em protótipo):
```tsx
{(['revisao', 'bloqueado', 'sucesso'] as const).map((s) => (
  <button key={s} type="button" onClick={() => setStatus(s)}
    className={['rounded-full px-2 py-0.5 font-mono text-[9px] uppercase transition-colors',
      status === s ? 'bg-brand-100 text-brand-750' : 'text-brand-muted hover:bg-brand-50',
    ].join(' ')}>
    {s}
  </button>
))}
```

### Status box multi-estado com transição de cores

Caixas de resultado que mudam de cor conforme o estado (ex: validação de PBM). O estado controla `bg`, `border`, badge e texto via lookup table:

```tsx
type PbmStatus = 'idle' | 'aprovado' | 'pendente' | 'rejeitado'

const STATUS_CFG: Record<PbmStatus, {
  badge: string; badgeBg: string; badgeText: string
  cardBg: string; cardBorder: string
  title: string; desc: string
  btnText: string; btnCls: string; disabled: boolean
}> = {
  idle:      { badge: '● Aguardando', badgeBg: 'bg-neutral-50',  badgeText: 'text-neutral-500', cardBg: 'bg-white',    cardBorder: 'border-brand-100',   ... },
  aprovado:  { badge: '● Aprovado',   badgeBg: 'bg-brand-75',    badgeText: 'text-success-600', cardBg: 'bg-brand-25', cardBorder: 'border-brand-100',   ... },
  pendente:  { badge: '⚠ Pendente',   badgeBg: 'bg-warning-50',  badgeText: 'text-warning-800', cardBg: 'bg-warning-50', cardBorder: 'border-warning-100', disabled: true, ... },
  rejeitado: { badge: '✗ Rejeitado',  badgeBg: 'bg-danger-50',   badgeText: 'text-danger-700',  cardBg: 'bg-danger-50',  cardBorder: 'border-danger-100',  disabled: true, ... },
}

{/* Renderização */}
<div className={`flex items-start gap-3 rounded-[20px] border p-4 transition-colors ${cfg.cardBg} ${cfg.cardBorder}`}>
  <span className={`shrink-0 rounded-full px-3 py-1 font-bold text-[12px] ${cfg.badgeBg} ${cfg.badgeText}`}>
    {cfg.badge}
  </span>
  <div className="flex flex-1 flex-col gap-1">
    <p className="font-bold text-[14px] text-brand-950">{cfg.title}</p>
    <p className="text-[12px] text-text-secondary">{cfg.desc}</p>
  </div>
</div>
{/* Botão desabilitado em estados bloqueados */}
<button type="button" disabled={cfg.disabled}
  className={`flex h-10 flex-1 items-center justify-center rounded-[14px] font-bold text-[13px] transition-colors ${cfg.btnCls}`}>
  {cfg.btnText}
</button>
```
Estados bloqueados usam `bg-brand-300 cursor-not-allowed text-white` no botão.

### Grid de métricas com variante por card

Usado em FiscalPage (e reutilizável em dashboards de módulo). Cada card carrega seu próprio esquema de cores via lookup table — evita ifs inline:

```tsx
const METRIC_CFG = [
  { label: 'Total', value: '34', bg: 'bg-white',    border: 'border-brand-100',   lbl: 'text-text-secondary', val: 'text-brand-950'  },
  { label: 'OK',    value: '31', bg: 'bg-brand-25',  border: 'border-brand-100',   lbl: 'text-success-600',    val: 'text-brand-900'  },
  { label: 'Aviso', value: '2',  bg: 'bg-warning-50', border: 'border-warning-100', lbl: 'text-warning-700',   val: 'text-warning-950'},
  { label: 'Erro',  value: '3',  bg: 'bg-danger-50',  border: 'border-danger-100',  lbl: 'text-danger-700',    val: 'text-danger-800' },
  { label: 'Info',  value: '42s',bg: 'bg-info-50',    border: 'border-info-100',    lbl: 'text-info-700',      val: 'text-info-950'   },
] as const

{/* Renderização — 5 colunas; ajuste grid-cols-N conforme o número de cards */}
<div className="grid grid-cols-5 gap-3.5">
  {METRIC_CFG.map((m) => (
    <div key={m.label} className={`flex flex-col gap-1.5 rounded-[20px] border p-4 ${m.bg} ${m.border}`}>
      <span className={`text-[12px] ${m.lbl}`}>{m.label}</span>
      <span className={`font-bold text-[24px] ${m.val}`}>{m.value}</span>
    </div>
  ))}
</div>
```

### Campos de formulário inline (label + controle)

Padrão para formulários dentro de cards — campo auto-contido com borda, sem `<form>` externo:

```tsx
{/* Campo texto */}
<div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
  <label htmlFor="field-id" className="font-bold text-[12px] text-input-label">Rótulo</label>
  <input id="field-id" type="text"
    className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder" />
</div>

{/* Campo select */}
<div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
  <label htmlFor="sel-id" className="font-bold text-[12px] text-input-label">Operação</label>
  <select id="sel-id" className="bg-transparent text-[14px] text-brand-950 outline-none">
    <option value="a">Opção A</option>
  </select>
</div>

{/* Campo somente-leitura (sem controle): usar <p> como rótulo em vez de <label> */}
<div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
  <p className="font-bold text-[12px] text-input-label">Série / modelo</p>
  <span className="text-[14px] text-brand-950">1 / 55</span>
</div>
```

> **Biome `noLabelWithoutControl`:** campos somente-leitura usam `<p>` em vez de `<label>` para evitar o erro. Campos com `<input>` ou `<select>` sempre recebem `htmlFor` + `id` correspondente.

### Status chip no header (SEFAZ / serviço externo)

```tsx
<div className="flex items-center gap-2 rounded-full border border-brand-200 bg-brand-75 px-3 py-1.5">
  <span className="h-2 w-2 rounded-full bg-success-600" />
  <span className="font-bold text-[12px] text-success-600">SEFAZ online</span>
</div>
```
Variante offline/alerta: `border-warning-100 bg-warning-50` + dot `bg-warning-600` + texto `text-warning-700`.

### Chat bubbles e avatar colorido (módulo WhatsApp)

Componentes locais em `WhatsAppPage.tsx` — não promovidos para `ui/` pois são específicos do chat.

```tsx
// Avatar colorido com iniciais — tamanho variável
function AvatarCircle({ nome, color, size = 40 }: { nome: string; color: string; size?: number }) {
  const ini = nome.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()
  const fontSize = size <= 32 ? 11 : size <= 38 ? 13 : 14
  return (
    <div style={{ width: size, height: size, backgroundColor: color, fontSize }}
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white">
      {ini}
    </div>
  )
}

// Bubble de mensagem — 3 tipos: recebida / enviada / sistema
function BubbleMsg({ b }: { b: Bubble }) {
  // Sistema: pill centralizado
  if (b.tipo === 'sistema') return (
    <div className="flex justify-center">
      <span className="rounded-full bg-[#FAEEDA] px-3 py-1 font-semibold text-[10px] text-warning-900">{b.texto}</span>
    </div>
  )
  const isEnviada = b.tipo === 'enviada'
  return (
    <div className={['flex', isEnviada ? 'justify-end' : 'justify-start'].join(' ')}>
      <div className={[
        'flex max-w-[80%] flex-col gap-1 px-3.5 py-2.5',
        isEnviada
          ? 'rounded-[16px_4px_16px_16px] bg-[#0E4D3B]'     // enviada: canto sup-dir cortado
          : 'rounded-[4px_16px_16px_16px] border border-[#E6ECE8] bg-white',  // recebida: sup-esq cortado
      ].join(' ')}>
        {/* Anexo PDF */}
        {b.arquivo && (
          <div className="flex items-center gap-2 rounded-[10px] border border-[#DCE7E1] bg-[#F2F7F4] px-3 py-2">
            <span className="text-[18px]">📄</span>
            <div>
              <p className="font-semibold text-[11px] text-brand-700">{b.arquivo.nome}</p>
              <p className="text-[9px] text-text-secondary">{b.arquivo.tamanho}</p>
            </div>
          </div>
        )}
        {b.texto && (
          <p className={['whitespace-pre-line text-[13px] leading-snug',
            isEnviada ? 'text-white' : 'text-brand-950'].join(' ')}>
            {b.texto}
          </p>
        )}
        {b.hora && (
          <p className={['text-right text-[10px]',
            isEnviada ? 'text-[#B8D8CF]' : 'text-[#8A9892]'].join(' ')}>
            {b.hora}{isEnviada && b.lido ? ' ✓✓' : ''}
          </p>
        )}
      </div>
    </div>
  )
}
```

**Tokens de cor do chat (não alterar — extraídos do Pencil):**
- `#DCE7E1` — bordas do container e input
- `#F7FAF8` — background do chat
- `#E8F5EF` — item ativo na lista de conversas
- `#0E4D3B` — verde primário (botões, bubble enviada)
- `#173126` — texto principal do chat
- `#8A9892` — texto secundário / hora
- `#FAEEDA` / `#633806` — sistema/alerta (pill warning)
- `#E1F5EE` / `#085041` — badges "Cliente ativo" / total pedido

### Checklist de texto simples (sem ícone)

Para listas de verificação onde a cor/emoji já indica o estado, use texto puro:

```tsx
function CheckLine({ text, variant }: { text: string; variant: 'ok' | 'warning' | 'critical' }) {
  const cls = {
    ok: 'font-medium text-brand-700',
    warning: 'font-semibold text-warning-700',
    critical: 'font-bold text-danger-700',
  }[variant]
  return <p className={`text-[12px] ${cls}`}>{text}</p>
}
```
O texto já carrega o símbolo: `'✓ Lotes preenchidos'`, `'⚠ Margem baixa'`, `'✗ Divergência crítica'`.

### Wizard de N etapas (fluxo guiado)

Usado em `EntradaNfePage` (fiscal) e `PbmPage`. Estado da etapa atual fica no page-level via `useState`; cada etapa é um sub-componente separado renderizado condicionalmente.

```tsx
type MyStep = 1 | 2 | 3

const STEP_CFG: Record<MyStep, { titulo: string; progresso: string; etapa: string }> = {
  1: { titulo: '...', progresso: 'Fluxo guiado (1/3)', etapa: 'Etapa 1 · Label' },
  2: { titulo: '...', progresso: 'Fluxo guiado (2/3)', etapa: 'Etapa 2 · Label' },
  3: { titulo: '...', progresso: 'Fluxo guiado (3/3)', etapa: 'Etapa 3 · Label' },
}

const [step, setStep] = useState<MyStep>(1)
const goNext = () => setStep((s) => Math.min(s + 1, 3) as MyStep)
const goBack = () => setStep((s) => Math.max(s - 1, 1) as MyStep)
```

**Header do wizard (chips de navegação):**
```tsx
{step > 1 && (
  <button type="button" onClick={goBack}
    className="flex h-8 items-center gap-1 rounded-xl border border-brand-100 bg-white px-3 font-medium text-[12px] text-brand-700 hover:bg-brand-50">
    ← Voltar
  </button>
)}
<div className="flex items-center rounded-[14px] border border-brand-200 bg-brand-25 px-4 py-2">
  <span className="font-bold text-[12px] text-brand-950">{stepCfg.progresso}</span>
</div>
<div className="flex items-center rounded-[14px] bg-brand-900 px-4 py-2">
  <span className="font-bold text-[12px] text-white">{stepCfg.etapa}</span>
</div>
```

**Renderização condicional:**
```tsx
{step === 1 && <StepUm onAvancar={goNext} />}
{step === 2 && <StepDois onAvancar={goNext} />}
{step === 3 && <StepTres />}
```

**Campo somente-leitura reutilizável (evita `noLabelWithoutControl`):**
```tsx
function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
      <p className="font-bold text-[12px] text-input-label">{label}</p>
      <span className="text-[14px] text-brand-950">{value}</span>
    </div>
  )
}
```
Usa `<p>` (não `<label>`) para evitar o erro Biome `noLabelWithoutControl`.

### Modal de seleção / adição (overlay com botão)

Modal interno à página (não global). Overlay como `<button type="button">` evita o erro Biome `a11y/useKeyWithClickEvents` que ocorre com `<div onClick>`:

```tsx
function MyModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (item: Item) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay — button para satisfazer a11y Biome */}
      <button type="button" onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar modal" />
      {/* Card do modal */}
      <div className="relative z-10 flex w-120 flex-col gap-4 rounded-[28px] bg-white p-6 shadow-xl">
        {/* conteúdo */}
        <div className="flex gap-3">
          <button type="button" onClick={onClose}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-brand-200 font-bold text-[13px] text-brand-700">
            Cancelar
          </button>
          <button type="button" onClick={() => onConfirm(selected)}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] bg-brand-900 font-bold text-[13px] text-white">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

{/* Renderização condicional na página */}
{modalOpen && <MyModal onClose={() => setModalOpen(false)} onConfirm={handleConfirm} />}
```

---

## Tokens de cor

Usar tokens do `@theme` em `src/index.css`. Ver a tabela completa em `src/components/ui/CLAUDE.md`.

Os únicos hex arbitrários permitidos nas páginas são os de tabela: `#F5F8F6` (header) e `#FBFCFB` (row par).

---

## Dados estáticos e TODOs

Todas as páginas usam dados estáticos. Marcar cada ponto de integração:

```ts
// TODO: integrar com API — GET /api/estoque?filter=todos
// TODO: integrar com API — POST /api/estoque/ajuste
```

Formato: `// TODO: integrar com API — MÉTODO /caminho/do/endpoint`

---

## Componentes UI (design system)

- Composition Pattern (estilo Radix UI): `<Modal.Root>`, `<Modal.Header>`, `<Modal.Body>`
- Variantes com `tv()` — nunca `twMerge()` diretamente
- Nunca `default export`; sempre exportar a interface de props
- Detalhes: `src/components/ui/CLAUDE.md`

### Regra de promoção de padrão inline → componente UI

Um padrão repetido em páginas torna-se componente em `src/components/ui/` quando aparece em **2 ou mais páginas**. Padrões já promovidos:

| Componente | Páginas de origem | Status |
|---|---|---|
| `<Modal>` | PdvPage, EstoquePage, FiscalPage, PbmPage (8+ modais) | ⬜ Criar |
| `<Alert>` | PdvPage, FiscalPage, PbmPage, CadastroProdutosPage (6+ banners) | ⬜ Criar |
| `<Table>` | EstoquePage, PdvPage, FiscalPage, PbmPage (7+ tabelas) | ⬜ Criar |
| `<FilterTabs>` | EstoquePage, PbmPage (toggle de filtros) | ⬜ Criar |
| `<Input>` | 11+ páginas ainda usam inline | ⬜ Migrar |
| `<Badge>` | 10+ páginas ainda usam inline | ⬜ Migrar |
| `<MetricCard>` | FiscalPage, EstoquePage reimplementam inline | ⬜ Migrar |

### Composition Pattern (estilo Radix UI)

Todo componente com sub-partes semânticas usa o Composition Pattern: cada parte é uma função independente, exportadas juntas em um namespace — igual a `Dialog.Root`, `Dialog.Trigger`, `Dialog.Content` do Radix UI. Quando sub-partes precisam compartilhar estado, um Context interno é criado — nunca exposto ao consumer.

```tsx
// src/components/ui/modal.tsx

// ── Context interno (não exportado) ──────────────────────────
type ModalCtx = { onClose: () => void }
const ModalContext = createContext<ModalCtx | null>(null)
function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('<Modal.Body/Header/Footer> deve estar dentro de <Modal.Root>')
  return ctx
}

// ── Partes independentes ──────────────────────────────────────
function Root({ onClose, width = 'w-[520px]', children }: ModalRootProps) {
  return (
    <ModalContext.Provider value={{ onClose }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <button type="button" onClick={onClose}
          className="absolute inset-0 cursor-default bg-brand-950/30"
          aria-label="Fechar modal" />
        <div className={`relative z-10 flex max-h-[90vh] flex-col overflow-hidden rounded-[28px] bg-white shadow-xl ${width}`}>
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  )
}

function Header({ title, subtitle }: ModalHeaderProps) {
  const { onClose } = useModal()
  return (
    <div className="flex items-center justify-between border-b border-brand-100 px-7 py-5">
      <div>
        <p className="font-bold text-[18px] text-brand-950">{title}</p>
        {subtitle && <p className="text-[12px] text-text-secondary">{subtitle}</p>}
      </div>
      <button type="button" onClick={onClose}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-[13px] text-brand-600 hover:bg-brand-100"
        aria-label="Fechar modal">✕</button>
    </div>
  )
}

function Body({ children, className }: ModalBodyProps) {
  return <div className={`flex-1 overflow-y-auto px-7 py-5 ${className ?? ''}`}>{children}</div>
}

function Footer({ children }: ModalFooterProps) {
  return <div className="flex gap-3 border-t border-brand-100 px-7 py-5">{children}</div>
}

// ── Namespace exportado (estilo Radix) ───────────────────────
export const Modal = { Root, Header, Body, Footer }
export type { ModalRootProps, ModalHeaderProps, ModalBodyProps, ModalFooterProps }
```

```tsx
// Uso nas páginas — idêntico ao Radix UI:
{modalOpen && (
  <Modal.Root onClose={() => setModalOpen(false)} width="w-[700px]">
    <Modal.Header title="Novo produto" subtitle="* campos obrigatórios" />
    <Modal.Body className="flex flex-col gap-5">
      {/* campos */}
    </Modal.Body>
    <Modal.Footer>
      <button type="button" onClick={() => setModalOpen(false)} className="...">Cancelar</button>
      <button type="button" onClick={handleSave} className="...">Confirmar</button>
    </Modal.Footer>
  </Modal.Root>
)}
```

**Quando usar Context interno:** sempre que uma sub-parte precisa de dado do Root (ex: `Modal.Header` precisa de `onClose`). O Context nunca é exportado — é detalhe de implementação.

**Quando não usar Context:** partes puramente visuais e independentes (ex: `Table.Header`, `Alert`) não precisam de context — recebem props diretamente.
```

## Base UI (componentes com comportamento)

Switch, Checkbox e Select usam `@base-ui/react`. Aplicar `data-[checked]:`, `data-[highlighted]:` etc. diretamente nas classes Tailwind.

---

## Schemas Zod (validação e tipagem)

Instalar: `npm install zod`

### Estrutura de arquivos

```
src/schemas/
├── produto.ts      ← ProdutoSchema, ProdutoStatusSchema
├── cliente.ts      ← ClienteSchema
├── fornecedor.ts   ← FornecedorSchema
├── pdv.ts          ← CartItemSchema, SangriaSchemma
├── pbm.ts          ← AtendimentoPbmSchema
└── index.ts        ← barrel
```

### Padrão obrigatório — Schema como fonte única de tipo

```ts
// src/schemas/produto.ts
import { z } from 'zod'

export const ProdutoStatusSchema = z.enum(['ativo', 'inativo'])

export const ProdutoSchema = z.object({
  id:               z.string().uuid(),
  nome:             z.string().min(3, 'Nome obrigatório'),
  ean:              z.string().length(13, 'EAN deve ter 13 dígitos'),
  dcb:              z.string().optional(),
  ncm:              z.string().optional(),
  categoria:        z.string(),
  fabricante:       z.string(),
  preco_custo:      z.number().int().nonnegative(),   // centavos
  preco_venda:      z.number().int().positive(),      // centavos
  margem_minima:    z.number().int().min(0).max(100),
  estoque_minimo:   z.number().int().nonnegative(),
  controlado:       z.boolean(),
  portaria_344:     z.boolean(),
  requer_receita:   z.boolean(),
  pbm_elegivel:     z.boolean(),
  rms:              z.string().optional(),
  forma_farmaceutica: z.string(),
  concentracao:     z.string(),
  status:           ProdutoStatusSchema,
}).refine(
  (p) => !p.controlado || (p.dcb && p.dcb.trim().length > 0),
  { message: 'DCB obrigatório para produto controlado', path: ['dcb'] },
)

// Tipo inferido — NUNCA declarar type manualmente para schemas Zod
export type Produto = z.infer<typeof ProdutoSchema>
export type ProdutoStatus = z.infer<typeof ProdutoStatusSchema>

// Schema parcial para o formulário (sem id — gerado pelo backend)
export const ProdutoFormSchema = ProdutoSchema.omit({ id: true })
export type ProdutoForm = z.infer<typeof ProdutoFormSchema>
```

### Validação em modais de CRUD

```tsx
function handleSave() {
  const result = ProdutoFormSchema.safeParse(form)
  if (!result.success) {
    // result.error.flatten().fieldErrors — mapa de campo → mensagem[]
    setErrors(result.error.flatten().fieldErrors)
    return
  }
  onSave({ ...result.data, id: produto?.id ?? crypto.randomUUID() })
}
```

### Regras de uso

| Regra | Detalhe |
|---|---|
| Schema = fonte do tipo | Usar `z.infer<>` — nunca declarar `type` paralelo para dados de formulário ou API |
| `safeParse` em formulários | Nunca `parse()` — `safeParse` não lança exceção, retorna `{ success, data, error }` |
| `parse()` em API responses | Aceita no boundary de integração (middleware de chamada) — falha rápida é desejável |
| Schemas em `src/schemas/` | Nunca inline dentro de componentes — schemas são compartilhados entre form e API |
| `z.coerce` para inputs HTML | Inputs `type="number"` retornam `string` — `z.coerce.number()` converte automaticamente |

---

## Qualidade

Antes de encerrar qualquer tarefa:
```bash
npx biome check --write ./src && npx tsc -b && npx vite build
```

O aviso de chunk size > 500 kB no Vite é esperado e não é erro.
