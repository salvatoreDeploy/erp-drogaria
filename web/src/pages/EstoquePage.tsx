import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ItemInventario } from '../schemas/estoque'

type EstoqueStatus = 'saudavel' | 'alerta' | 'critico' | 'comprar'
type FilterTab = 'todos' | 'criticos' | 'controlados'

const ITEMS: {
  produto: string
  estoque: number
  minimo: number
  validade: string
  validade_dias: number
  lote: string
  sngpc: string
  status: EstoqueStatus
}[] = [
  // TODO: integrar com API — GET /api/estoque?filter=&search=
  {
    produto: 'Losartana 50mg',
    estoque: 124,
    minimo: 80,
    validade: '62 dias',
    validade_dias: 62,
    lote: 'L-1044',
    sngpc: 'OK',
    status: 'saudavel',
  },
  {
    produto: 'Dipirona 500mg',
    estoque: 18,
    minimo: 40,
    validade: '18 dias',
    validade_dias: 18,
    lote: 'D-2291',
    sngpc: 'OK',
    status: 'alerta',
  },
  {
    produto: 'Morfina 10mg',
    estoque: 7,
    minimo: 12,
    validade: '9 dias',
    validade_dias: 9,
    lote: 'C-8920',
    sngpc: 'Pendente',
    status: 'critico',
  },
  {
    produto: 'Seringa 10ml',
    estoque: 21,
    minimo: 60,
    validade: 'Reposição',
    validade_dias: 999,
    lote: 'P-7812',
    sngpc: 'N/A',
    status: 'comprar',
  },
  {
    produto: 'Amoxicilina 500mg',
    estoque: 53,
    minimo: 30,
    validade: '34 dias',
    validade_dias: 34,
    lote: 'A-5561',
    sngpc: 'OK',
    status: 'saudavel',
  },
]

// TODO: integrar com API — GET /api/estoque/repor
const REORDER_ITEMS = [
  {
    produto: 'Losartana 50mg',
    descricao: 'Estoque mínimo atingido',
    pct: 20,
    variant: 'normal' as const,
  },
  {
    produto: 'Seringa 10ml',
    descricao: 'Pedido sugerido: 120 un.',
    pct: 35,
    variant: 'normal' as const,
  },
  {
    produto: 'Dipirona 500mg',
    descricao: 'Vence em 18 dias',
    pct: 45,
    variant: 'warning' as const,
  },
]

const STATUS_CONFIG: Record<EstoqueStatus, { rowBg: string; label: string; cls: string }> = {
  saudavel: { rowBg: 'bg-[#FBFCFB]', label: 'Saudável', cls: 'text-success-600' },
  alerta: { rowBg: 'bg-warning-50', label: 'Alerta', cls: 'font-bold text-warning-700' },
  critico: { rowBg: 'bg-danger-50', label: 'Crítico', cls: 'font-bold text-danger-700' },
  comprar: { rowBg: 'bg-[#FBFCFB]', label: 'Comprar', cls: 'font-bold text-brand-700' },
}

function validadeClass(status: EstoqueStatus): string {
  if (status === 'critico') return 'font-bold text-danger-700'
  if (status === 'alerta') return 'font-bold text-warning-700'
  if (status === 'comprar') return 'font-bold text-brand-700'
  return 'text-success-600'
}

function sngpcClass(val: string): string {
  if (val === 'Pendente') return 'font-bold text-danger-700'
  if (val === 'OK') return 'font-bold text-success-600'
  return 'text-brand-muted'
}

type EstoqueItem = (typeof ITEMS)[0]

const FORNECEDORES = ['Cristália', 'EMS', 'Eurofarma', 'Hypermarcas', 'Aché']
const FILIAIS = ['Filial Centro', 'Filial Norte', 'Filial Sul', 'Matriz']
const MOTIVOS_TRANSFERENCIA = [
  'Rebalanceamento de estoque',
  'Ajuste de inventário',
  'Solicitação emergencial',
  'Outro motivo',
]

const CATEGORIAS_INV = [
  'Analgésicos',
  'Antibióticos',
  'Antihipertensivos',
  'Vitaminas',
  'Material hospitalar',
]

const MOTIVOS_AJUSTE_INV = [
  'Erro de contagem anterior',
  'Quebra / avaria',
  'Produto vencido retirado',
  'Roubo ou furto',
  'Divergência de lote',
  'Outro (especificar)',
]

// TODO: integrar com API — GET /api/v1/estoque/inventario/ativo
const ITENS_INVENTARIO_MOCK: ItemInventario[] = [
  {
    produto_id: 'p001',
    produto_nome: 'Dipirona 500mg',
    lote: 'L2024A',
    validade: '12/2026',
    qtd_sistema: 18,
    qtd_contada: null,
  },
  {
    produto_id: 'p002',
    produto_nome: 'Losartana 50mg',
    lote: 'L2024B',
    validade: '08/2026',
    qtd_sistema: 124,
    qtd_contada: null,
  },
  {
    produto_id: 'p003',
    produto_nome: 'Morfina 10mg',
    lote: 'L2023C',
    validade: '03/2025',
    qtd_sistema: 12,
    qtd_contada: null,
  },
  {
    produto_id: 'p004',
    produto_nome: 'Amoxicilina 500mg',
    lote: 'L2024D',
    validade: '06/2026',
    qtd_sistema: 53,
    qtd_contada: null,
  },
  {
    produto_id: 'p005',
    produto_nome: 'Omeprazol 20mg',
    lote: 'L2024E',
    validade: '09/2026',
    qtd_sistema: 87,
    qtd_contada: null,
  },
  {
    produto_id: 'p006',
    produto_nome: 'Atorvastatina 20mg',
    lote: 'L2024F',
    validade: '11/2026',
    qtd_sistema: 42,
    qtd_contada: null,
  },
  {
    produto_id: 'p007',
    produto_nome: 'Metformina 850mg',
    lote: 'L2024G',
    validade: '07/2026',
    qtd_sistema: 95,
    qtd_contada: null,
  },
  {
    produto_id: 'p008',
    produto_nome: 'Vitamina D3 2000UI',
    lote: 'L2024H',
    validade: '02/2027',
    qtd_sistema: 200,
    qtd_contada: null,
  },
  {
    produto_id: 'p009',
    produto_nome: 'Seringa 10ml',
    lote: 'N/A',
    validade: 'N/A',
    qtd_sistema: 21,
    qtd_contada: null,
  },
  {
    produto_id: 'p010',
    produto_nome: 'Ibuprofeno 600mg',
    lote: 'L2024I',
    validade: '10/2026',
    qtd_sistema: 67,
    qtd_contada: null,
  },
  {
    produto_id: 'p011',
    produto_nome: 'Captopril 25mg',
    lote: 'L2024J',
    validade: '05/2026',
    qtd_sistema: 33,
    qtd_contada: null,
  },
  {
    produto_id: 'p012',
    produto_nome: 'Fluoxetina 20mg',
    lote: 'L2024K',
    validade: '04/2026',
    qtd_sistema: 28,
    qtd_contada: null,
  },
]

function getDifCls(pct: number): string {
  if (pct === 0) return 'text-success-600'
  if (Math.abs(pct) <= 5) return 'text-warning-700 font-semibold'
  return 'text-danger-700 font-bold'
}

function getDivRowBg(pct: number): string {
  if (Math.abs(pct) > 5) return 'bg-danger-50'
  if (Math.abs(pct) > 0) return 'bg-warning-50'
  return 'bg-[#FBFCFB]'
}

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'criticos', label: 'Críticos' },
  { id: 'controlados', label: 'Controlados' },
]

/* ── Modais ───────────────────────────────────────────────────────── */

function ModalReposicao({ item, onClose }: { item: EstoqueItem; onClose: () => void }) {
  const qtdSugerida = Math.max(0, item.minimo - item.estoque)
  const [fornecedor, setFornecedor] = useState('')
  const [quantidade, setQuantidade] = useState(String(qtdSugerida))
  const [obs, setObs] = useState('')
  const canSubmit = fornecedor !== '' && Number(quantidade) > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar modal"
      />
      <div className="relative z-10 flex w-[480px] flex-col gap-4 rounded-[28px] bg-white p-6 shadow-xl">
        <div>
          <h3 className="font-bold text-[18px] text-brand-950">Solicitar reposição</h3>
          <p className="text-[13px] text-text-secondary">{item.produto}</p>
        </div>

        <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
          <label htmlFor="rep-fornecedor" className="font-bold text-[12px] text-input-label">
            Fornecedor
          </label>
          <select
            id="rep-fornecedor"
            value={fornecedor}
            onChange={(e) => setFornecedor(e.target.value)}
            className="bg-transparent text-[14px] text-brand-950 outline-none"
          >
            <option value="">Selecione um fornecedor</option>
            {FORNECEDORES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
            <label htmlFor="rep-quantidade" className="font-bold text-[12px] text-input-label">
              Quantidade
            </label>
            <input
              id="rep-quantidade"
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="bg-transparent text-[14px] text-brand-950 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
            <p className="font-bold text-[12px] text-input-label">Estoque atual / mín.</p>
            <span className="text-[14px] text-brand-950">
              {item.estoque} / {item.minimo}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
          <label htmlFor="rep-obs" className="font-bold text-[12px] text-input-label">
            Observação (opcional)
          </label>
          <input
            id="rep-obs"
            type="text"
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Ex.: urgente, entrega no turno da tarde"
            className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-brand-200 font-bold text-[13px] text-brand-700 transition-colors hover:bg-brand-50"
          >
            Cancelar
          </button>
          {/* TODO: integrar com API — POST /api/v1/estoque/reposicao/solicitar */}
          <button
            type="button"
            disabled={!canSubmit}
            className={[
              'flex h-10 flex-1 items-center justify-center rounded-[14px] font-bold text-[13px] transition-colors',
              canSubmit
                ? 'bg-brand-900 text-white hover:bg-brand-800'
                : 'cursor-not-allowed bg-brand-300 text-white',
            ].join(' ')}
          >
            Solicitar reposição
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalTransferencia({ item, onClose }: { item: EstoqueItem; onClose: () => void }) {
  const [filial, setFilial] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [motivo, setMotivo] = useState('')
  const qtdNum = Number(quantidade)
  const canSubmit = filial !== '' && qtdNum > 0 && qtdNum <= item.estoque && motivo !== ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar modal"
      />
      <div className="relative z-10 flex w-[480px] flex-col gap-4 rounded-[28px] bg-white p-6 shadow-xl">
        <div>
          <h3 className="font-bold text-[18px] text-brand-950">Transferir estoque</h3>
          <p className="text-[13px] text-text-secondary">{item.produto}</p>
        </div>

        <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
          <label htmlFor="trf-filial" className="font-bold text-[12px] text-input-label">
            Filial destino
          </label>
          <select
            id="trf-filial"
            value={filial}
            onChange={(e) => setFilial(e.target.value)}
            className="bg-transparent text-[14px] text-brand-950 outline-none"
          >
            <option value="">Selecione a filial</option>
            {FILIAIS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
            <label htmlFor="trf-quantidade" className="font-bold text-[12px] text-input-label">
              Quantidade
            </label>
            <input
              id="trf-quantidade"
              type="number"
              min="1"
              max={item.estoque}
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder={`máx. ${item.estoque}`}
              className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
            />
          </div>
          <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
            <p className="font-bold text-[12px] text-input-label">Disponível</p>
            <span className="text-[14px] text-brand-950">{item.estoque} un.</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
          <label htmlFor="trf-motivo" className="font-bold text-[12px] text-input-label">
            Motivo
          </label>
          <select
            id="trf-motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="bg-transparent text-[14px] text-brand-950 outline-none"
          >
            <option value="">Selecione um motivo</option>
            {MOTIVOS_TRANSFERENCIA.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-brand-200 font-bold text-[13px] text-brand-700 transition-colors hover:bg-brand-50"
          >
            Cancelar
          </button>
          {/* TODO: integrar com API — POST /api/v1/estoque/transferencia */}
          <button
            type="button"
            disabled={!canSubmit}
            className={[
              'flex h-10 flex-1 items-center justify-center rounded-[14px] font-bold text-[13px] transition-colors',
              canSubmit
                ? 'bg-brand-900 text-white hover:bg-brand-800'
                : 'cursor-not-allowed bg-brand-300 text-white',
            ].join(' ')}
          >
            Confirmar transferência
          </button>
        </div>
      </div>
    </div>
  )
}

export function EstoquePage() {
  const [filter, setFilter] = useState<FilterTab>('todos')
  const [search, setSearch] = useState('')
  const [filterValidade, setFilterValidade] = useState(false)
  const [reposicaoItem, setReposicaoItem] = useState<EstoqueItem | null>(null)
  const [transferenciaItem, setTransferenciaItem] = useState<EstoqueItem | null>(null)

  // Inventário wizard
  const [invStep, setInvStep] = useState<'config' | 'contagem' | 'divergencias' | null>(null)
  const [escopo, setEscopo] = useState<'geral' | 'por_categoria'>('geral')
  const [categoriaId, setCategoriaId] = useState('')
  const [modo, setModo] = useState<'cego' | 'com_saldo'>('cego')
  const [itensInv, setItensInv] = useState<ItemInventario[]>(ITENS_INVENTARIO_MOCK)
  const [motivoInv, setMotivoInv] = useState('')
  const [motivoDetalheInv, setMotivoDetalheInv] = useState('')
  const [salvandoAjuste, setSalvandoAjuste] = useState(false)

  const filteredItems = ITEMS.filter((item) => {
    if (filter === 'criticos') return item.status === 'critico' || item.status === 'alerta'
    if (filter === 'controlados') return item.sngpc !== 'N/A'
    return true
  }).filter(
    (item) =>
      search === '' ||
      item.produto.toLowerCase().includes(search.toLowerCase()) ||
      item.lote.toLowerCase().includes(search.toLowerCase())
  )

  const sortedItems = filterValidade
    ? [...filteredItems].sort((a, b) => a.validade_dias - b.validade_dias)
    : filteredItems

  function setQtdContada(produtoId: string, qty: number | null) {
    setItensInv((prev) =>
      prev.map((i) => (i.produto_id === produtoId ? { ...i, qtd_contada: qty } : i))
    )
  }

  function cancelarInventario() {
    setInvStep(null)
    setItensInv(ITENS_INVENTARIO_MOCK)
    setEscopo('geral')
    setCategoriaId('')
    setModo('cego')
    setMotivoInv('')
    setMotivoDetalheInv('')
  }

  async function handleSalvarInventario() {
    setSalvandoAjuste(true)
    try {
      await new Promise<void>((res) => setTimeout(res, 1200))
      // TODO: integrar com API — POST /api/v1/estoque/inventario/{id}/finalizar
      cancelarInventario()
    } catch (err) {
      console.error('[handleSalvarInventario]', err)
    } finally {
      setSalvandoAjuste(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 gap-4">
      {/* ── Coluna esquerda ─────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {/* Header */}
        <header className="flex items-center justify-between rounded-[24px] border border-brand-100 bg-white px-[22px] py-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-bold text-[24px] text-brand-950 leading-none">
              Controle de estoque
            </h1>
            <p className="text-[13px] text-text-secondary">
              Validades, lotes, SNGPC e reposição automática em uma visão única.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            {invStep === null && (
              <button
                type="button"
                onClick={() => setInvStep('config')}
                className="flex h-9 items-center gap-1.5 rounded-[14px] border border-brand-200 bg-white px-4 font-bold text-[12px] text-brand-700 transition-colors hover:bg-brand-50"
              >
                + Iniciar Inventário
              </button>
            )}
            {/* TODO: integrar com API — POST /api/estoque/importar-csv */}
            <button
              type="button"
              className="flex h-9 items-center rounded-[14px] border border-brand-100 bg-brand-50 px-4 font-bold text-[12px] text-brand-950 transition-colors hover:bg-brand-75"
            >
              Importar CSV
            </button>
            <Link
              to="/estoque/ajuste"
              className="flex h-9 items-center rounded-[14px] border border-brand-100 bg-white px-4 font-bold text-[12px] text-brand-950 transition-colors hover:bg-brand-50"
            >
              Ajuste físico
            </Link>
            {/* TODO: integrar com API — POST /api/estoque/entrada */}
            <button
              type="button"
              className="flex h-9 items-center rounded-[14px] bg-brand-900 px-4 font-bold text-[12px] text-white transition-colors hover:bg-brand-800"
            >
              Nova entrada
            </button>
          </div>
        </header>

        {/* Metrics */}
        {/* TODO: integrar com API — GET /api/estoque/resumo */}
        <div className="grid grid-cols-5 gap-3.5">
          <MetricItem label="Produtos ativos" value="8.412" variant="normal" />
          <MetricItem label="Lotes vencendo" value="23" variant="warning" />
          <MetricItem label="Ruptura crítica" value="11 itens" variant="danger" />
          <MetricItem label="Reposição sugerida" value="42 SKUs" variant="info" />
          <MetricItem label="Controlados SNGPC" value="138" variant="brand" />
        </div>

        {/* Alert banner */}
        {/* TODO: integrar com API — GET /api/alertas/estoque */}
        <div className="flex h-14 items-center justify-between rounded-[18px] bg-brand-900 px-[18px]">
          <p className="font-bold text-[13px] text-white">
            5 medicamentos controlados aguardam conferência SNGPC e 8 lotes entram em janela de
            vencimento em 30 dias.
          </p>
          <button
            type="button"
            className="ml-4 shrink-0 font-bold text-[12px] text-brand-200 hover:underline"
          >
            Revisar agora
          </button>
        </div>

        {/* Table section / Wizard inventário */}
        {invStep === 'config' && (
          <EtapaConfig
            escopo={escopo}
            onEscopoChange={setEscopo}
            categoriaId={categoriaId}
            onCategoriaChange={setCategoriaId}
            modo={modo}
            onModoChange={setModo}
            onIniciar={() => setInvStep('contagem')}
            onCancelar={cancelarInventario}
          />
        )}
        {invStep === 'contagem' && (
          <EtapaContagem
            itens={itensInv}
            onSetQtd={setQtdContada}
            modo={modo}
            onVerDivergencias={() => setInvStep('divergencias')}
            onVoltar={() => setInvStep('config')}
            onCancelar={cancelarInventario}
          />
        )}
        {invStep === 'divergencias' && (
          <EtapaDivergencias
            itens={itensInv}
            motivo={motivoInv}
            onMotivoChange={setMotivoInv}
            motivoDetalhe={motivoDetalheInv}
            onMotivoDetalheChange={setMotivoDetalheInv}
            salvando={salvandoAjuste}
            onSalvar={handleSalvarInventario}
            onVoltar={() => setInvStep('contagem')}
            onCancelar={cancelarInventario}
          />
        )}
        {invStep === null && (
          <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-[24px] border border-brand-100 bg-white p-5">
            {/* Title + filters */}
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[18px] text-brand-950">Inventário e lotes</h2>
              <div className="flex gap-2">
                {FILTER_TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFilter(t.id)}
                    className={[
                      'flex h-8 items-center rounded-[12px] border px-3 font-bold text-[12px] transition-colors',
                      t.id === 'criticos'
                        ? filter === t.id
                          ? 'border-warning-100 bg-warning-50 text-warning-800'
                          : 'border-brand-100 bg-input-bg text-brand-950 hover:bg-brand-50'
                        : filter === t.id
                          ? 'border-brand-700 bg-brand-75 text-brand-750'
                          : 'border-brand-100 bg-input-bg text-brand-950 hover:bg-brand-50',
                    ].join(' ')}
                  >
                    {t.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setFilterValidade((v) => !v)}
                  className={[
                    'flex h-8 items-center rounded-[12px] border px-3 font-bold text-[12px] transition-colors',
                    filterValidade
                      ? 'border-brand-700 bg-brand-75 text-brand-750'
                      : 'border-brand-100 bg-input-bg text-brand-950 hover:bg-brand-50',
                  ].join(' ')}
                >
                  Por validade {filterValidade ? '↑' : ''}
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center rounded-[14px] border border-brand-100 bg-input-bg px-4 py-3">
              <input
                type="text"
                placeholder="Buscar produto, lote, código ou fornecedor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-[13px] text-brand-950 outline-none placeholder:text-brand-muted"
              />
            </div>

            {/* Table */}
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
              <div className="grid grid-cols-[1fr_70px_70px_95px_90px_80px_100px_110px] items-center gap-3 rounded-[12px] bg-[#F5F8F6] px-3 py-2.5">
                {[
                  'Produto',
                  'Estoque',
                  'Mínimo',
                  'Validade',
                  'Lote',
                  'SNGPC',
                  'Status',
                  'Ações',
                ].map((h) => (
                  <span key={h} className="font-semibold text-[12px] text-text-secondary">
                    {h}
                  </span>
                ))}
              </div>

              {sortedItems.length === 0 ? (
                <div className="flex flex-1 items-center justify-center py-8 text-[13px] text-brand-muted">
                  Nenhum item encontrado.
                </div>
              ) : (
                sortedItems.map((item) => {
                  const cfg = STATUS_CONFIG[item.status]
                  return (
                    <div
                      key={item.lote}
                      className={`grid grid-cols-[1fr_70px_70px_95px_90px_80px_100px_110px] items-center gap-3 rounded-[14px] px-3 py-3 ${cfg.rowBg}`}
                    >
                      <span className="font-bold text-[13px] text-brand-950">{item.produto}</span>
                      <span className="text-[13px] text-brand-950">{item.estoque}</span>
                      <span className="text-[13px] text-brand-muted">{item.minimo}</span>
                      <span className={`text-[13px] ${validadeClass(item.status)}`}>
                        {item.validade}
                      </span>
                      <span className="text-[13px] text-text-secondary">{item.lote}</span>
                      <span className={`text-[13px] ${sngpcClass(item.sngpc)}`}>{item.sngpc}</span>
                      <span className={`text-[13px] ${cfg.cls}`}>{cfg.label}</span>
                      <div className="flex items-center gap-1.5">
                        {(item.status === 'critico' || item.status === 'comprar') && (
                          <button
                            type="button"
                            onClick={() => setReposicaoItem(item)}
                            className="rounded-[8px] border border-brand-200 bg-white px-2 py-1 font-bold text-[11px] text-brand-700 transition-colors hover:bg-brand-50"
                          >
                            Repor
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setTransferenciaItem(item)}
                          className="rounded-[8px] border border-brand-100 bg-input-bg px-2 py-1 font-bold text-[11px] text-brand-muted transition-colors hover:bg-brand-50"
                        >
                          Transferir
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-brand-100 border-t pt-2.5">
              <span className="text-[12px] text-brand-muted">Atualizado há 2 minutos</span>
              {/* TODO: integrar com API — GET /api/estoque/exportar */}
              <button
                type="button"
                className="font-bold text-[12px] text-success-600 hover:underline"
              >
                Exportar relatório
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Coluna direita ──────────────────────────────────── */}
      <div className="flex w-[330px] shrink-0 flex-col gap-4">
        {/* Repor hoje */}
        <div className="flex flex-col gap-2.5 rounded-[24px] border border-brand-100 bg-white p-4">
          <h2 className="font-bold text-[18px] text-brand-950">Repor hoje</h2>
          {REORDER_ITEMS.map((item) => (
            <div
              key={item.produto}
              className={[
                'flex flex-col gap-1.5 rounded-[16px] p-3',
                item.variant === 'warning' ? 'bg-warning-50' : 'bg-input-bg',
              ].join(' ')}
            >
              <span className="font-bold text-[13px] text-brand-950">{item.produto}</span>
              <span
                className={`text-[12px] ${item.variant === 'warning' ? 'text-warning-800' : 'text-text-secondary'}`}
              >
                {item.descricao}
              </span>
              <div
                className={`h-2 w-full overflow-hidden rounded-full ${item.variant === 'warning' ? 'bg-warning-100' : 'bg-brand-100'}`}
              >
                <div
                  className={`h-full rounded-full ${item.variant === 'warning' ? 'bg-warning-600' : 'bg-brand-500'}`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Movimentações */}
        {/* TODO: integrar com API — GET /api/estoque/movimentacoes?hoje=true */}
        <div className="flex flex-col gap-2.5 rounded-[24px] border border-brand-100 bg-white p-4">
          <h2 className="font-bold text-[18px] text-brand-950">Movimentações</h2>
          <MovRow label="Entrada NF-e" value="+42 itens" valueClass="text-success-600" />
          <MovRow label="Saída PDV" value="-18 itens" valueClass="text-danger-700" />
          <MovRow label="Ajuste físico" value="3 pendentes" valueClass="text-warning-700" />
        </div>

        {/* SNGPC e controlados */}
        {/* TODO: integrar com API — GET /api/sngpc/status */}
        <div className="flex flex-col gap-2.5 rounded-[24px] border border-brand-100 bg-white p-4">
          <h2 className="font-bold text-[18px] text-brand-950">SNGPC e controlados</h2>
          <div className="flex items-center justify-between rounded-[16px] bg-danger-50 px-3 py-3">
            <span className="font-bold text-[13px] text-brand-950">Envios pendentes</span>
            <span className="font-bold text-[13px] text-danger-700">5</span>
          </div>
          <div className="flex items-center justify-between rounded-[16px] bg-input-bg px-3 py-3">
            <span className="font-bold text-[13px] text-brand-950">Última sincronização</span>
            <span className="text-[12px] text-success-600">há 4 min</span>
          </div>
          {/* TODO: integrar com API — POST /api/sngpc/conferir */}
          <button
            type="button"
            className="flex h-11 items-center justify-center rounded-[16px] bg-brand-900 font-bold text-[13px] text-white transition-colors hover:bg-brand-800"
          >
            Conferir agora
          </button>
        </div>
      </div>

      {reposicaoItem && (
        <ModalReposicao item={reposicaoItem} onClose={() => setReposicaoItem(null)} />
      )}
      {transferenciaItem && (
        <ModalTransferencia item={transferenciaItem} onClose={() => setTransferenciaItem(null)} />
      )}
    </div>
  )
}

/* ── sub-componentes internos ─────────────────────────────────────── */

function MovRow({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass: string
}) {
  return (
    <div className="flex items-center justify-between rounded-[16px] bg-input-bg px-3 py-3">
      <span className="font-bold text-[13px] text-brand-950">{label}</span>
      <span className={`text-[12px] ${valueClass}`}>{value}</span>
    </div>
  )
}

type MetricVariant = 'normal' | 'warning' | 'danger' | 'info' | 'brand'

const METRIC_VARIANTS: Record<
  MetricVariant,
  { bg: string; border: string; labelCls: string; valueCls: string }
> = {
  normal: {
    bg: 'bg-white',
    border: 'border-brand-100',
    labelCls: 'text-text-secondary',
    valueCls: 'text-brand-950',
  },
  warning: {
    bg: 'bg-warning-50',
    border: 'border-warning-100',
    labelCls: 'text-warning-800',
    valueCls: 'text-warning-950',
  },
  danger: {
    bg: 'bg-danger-50',
    border: 'border-danger-100',
    labelCls: 'text-danger-700',
    valueCls: 'text-danger-800',
  },
  info: {
    bg: 'bg-info-50',
    border: 'border-info-100',
    labelCls: 'text-info-700',
    valueCls: 'text-info-950',
  },
  brand: {
    bg: 'bg-brand-50',
    border: 'border-brand-100',
    labelCls: 'text-text-secondary',
    valueCls: 'text-brand-950',
  },
}

function MetricItem({
  label,
  value,
  variant,
}: {
  label: string
  value: string
  variant: MetricVariant
}) {
  const cfg = METRIC_VARIANTS[variant]
  return (
    <div className={`flex flex-col gap-2 rounded-[20px] border p-4 ${cfg.bg} ${cfg.border}`}>
      <span className={`text-[12px] ${cfg.labelCls}`}>{label}</span>
      <span className={`font-bold text-[24px] leading-none ${cfg.valueCls}`}>{value}</span>
    </div>
  )
}

/* ── Wizard inventário ─────────────────────────────────────────────── */

function EtapaConfig({
  escopo,
  onEscopoChange,
  categoriaId,
  onCategoriaChange,
  modo,
  onModoChange,
  onIniciar,
  onCancelar,
}: {
  escopo: 'geral' | 'por_categoria'
  onEscopoChange: (v: 'geral' | 'por_categoria') => void
  categoriaId: string
  onCategoriaChange: (v: string) => void
  modo: 'cego' | 'com_saldo'
  onModoChange: (v: 'cego' | 'com_saldo') => void
  onIniciar: () => void
  onCancelar: () => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 rounded-[24px] border border-brand-100 bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-brand-100 border-b pb-4">
        <div>
          <h2 className="font-bold text-[18px] text-brand-950">Inventário em andamento</h2>
          <p className="text-[13px] text-text-secondary">Configure o escopo e modo de contagem</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-[14px] bg-brand-75 px-3 py-1 font-semibold text-[12px] text-brand-750">
            Etapa 1/2
          </span>
          <button
            type="button"
            onClick={onCancelar}
            className="flex h-8 items-center rounded-[12px] border border-brand-200 px-3 font-semibold text-[12px] text-brand-700 hover:bg-brand-50"
          >
            Cancelar inventário
          </button>
        </div>
      </div>

      {/* Escopo */}
      <div className="flex flex-col gap-3 rounded-[16px] border border-brand-100 p-4">
        <h3 className="font-semibold text-[14px] text-brand-950">Escopo do inventário</h3>
        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="radio"
              name="escopo"
              value="geral"
              checked={escopo === 'geral'}
              onChange={() => onEscopoChange('geral')}
              className="accent-brand-700"
            />
            <span className="text-[13px] text-brand-950">Inventário geral (todos os produtos)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="radio"
              name="escopo"
              value="por_categoria"
              checked={escopo === 'por_categoria'}
              onChange={() => onEscopoChange('por_categoria')}
              className="accent-brand-700"
            />
            <span className="text-[13px] text-brand-950">Por categoria</span>
          </label>
          {escopo === 'por_categoria' && (
            <div className="ml-6">
              <label htmlFor="inv-categoria" className="sr-only">
                Categoria do inventário
              </label>
              <select
                id="inv-categoria"
                value={categoriaId}
                onChange={(e) => onCategoriaChange(e.target.value)}
                className="h-8 rounded-[8px] border border-input-border bg-white px-2 text-[12px] text-brand-950 outline-none focus:border-brand-700"
              >
                <option value="">Selecione a categoria...</option>
                {CATEGORIAS_INV.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Modo de contagem */}
      <div className="flex flex-col gap-3 rounded-[16px] border border-brand-100 p-4">
        <h3 className="font-semibold text-[14px] text-brand-950">Modo de contagem</h3>
        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="radio"
              name="modo"
              value="cego"
              checked={modo === 'cego'}
              onChange={() => onModoChange('cego')}
              className="accent-brand-700"
            />
            <span className="text-[13px] text-brand-950">
              Cego (operador não vê saldo do sistema)
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="radio"
              name="modo"
              value="com_saldo"
              checked={modo === 'com_saldo'}
              onChange={() => onModoChange('com_saldo')}
              className="accent-brand-700"
            />
            <span className="text-[13px] text-brand-950">Com saldo visível</span>
          </label>
        </div>
      </div>

      {/* Banner modo cego */}
      {modo === 'cego' && (
        <div className="flex items-start gap-3 rounded-[14px] border border-info-100 bg-info-50 p-3.5">
          <span className="mt-0.5 shrink-0 text-[16px]">ℹ</span>
          <p className="text-[13px] text-info-700">
            No modo cego o operador não vê o saldo atual, garantindo uma contagem imparcial.
          </p>
        </div>
      )}

      <div className="mt-auto flex justify-end">
        <button
          type="button"
          onClick={onIniciar}
          className="flex h-10 items-center gap-2 rounded-[12px] bg-brand-700 px-5 font-bold text-[13px] text-white transition-colors hover:bg-brand-800"
        >
          Iniciar contagem →
        </button>
      </div>
    </div>
  )
}

function EtapaContagem({
  itens,
  onSetQtd,
  modo,
  onVerDivergencias,
  onVoltar,
  onCancelar,
}: {
  itens: ItemInventario[]
  onSetQtd: (produtoId: string, qty: number | null) => void
  modo: 'cego' | 'com_saldo'
  onVerDivergencias: () => void
  onVoltar: () => void
  onCancelar: () => void
}) {
  const contados = itens.filter((i) => i.qtd_contada !== null)
  const pct = Math.round((contados.length / itens.length) * 100)
  const divergencias = contados.filter((i) => i.qtd_contada !== i.qtd_sistema)
  const colCls =
    modo === 'cego'
      ? 'grid-cols-[minmax(0,1fr)_80px_80px_120px_36px]'
      : 'grid-cols-[minmax(0,1fr)_80px_80px_100px_120px_36px]'

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-[24px] border border-brand-100 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-brand-100 border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onVoltar}
            className="flex h-8 items-center rounded-[12px] border border-brand-200 px-3 font-semibold text-[12px] text-brand-700 hover:bg-brand-50"
          >
            ← Voltar
          </button>
          <h2 className="font-bold text-[18px] text-brand-950">Inventário em andamento</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-[14px] bg-brand-900 px-3 py-1 font-semibold text-[12px] text-white">
            Etapa 2/2
          </span>
          <button
            type="button"
            onClick={onCancelar}
            className="flex h-8 items-center rounded-[12px] border border-brand-200 px-3 font-semibold text-[12px] text-brand-700 hover:bg-brand-50"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-2 px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[12px] text-text-secondary">
            {contados.length}/{itens.length} itens contados
          </span>
          <span className="font-bold text-[12px] text-brand-700">{pct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-brand-100">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Tabela de contagem */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className={`grid ${colCls} items-center gap-3 bg-[#F5F8F6] px-6 py-2.5`}>
          {[
            'Produto',
            'Lote',
            'Validade',
            ...(modo === 'com_saldo' ? ['Saldo Sistema'] : []),
            'Qtd Contada',
            '',
          ].map((h) => (
            <span key={h} className="font-semibold text-[11px] text-text-secondary">
              {h}
            </span>
          ))}
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          {itens.map((item) => (
            <div
              key={item.produto_id}
              className={`grid ${colCls} items-center gap-3 border-brand-100/60 border-b px-6 py-3 last:border-b-0 ${item.qtd_contada !== null ? 'bg-brand-25' : 'bg-[#FBFCFB]'}`}
            >
              <span className="truncate font-semibold text-[13px] text-brand-950">
                {item.produto_nome}
              </span>
              <span className="text-[12px] text-text-secondary">{item.lote}</span>
              <span className="text-[12px] text-brand-muted">{item.validade}</span>
              {modo === 'com_saldo' && (
                <span className="text-[13px] text-brand-950">{item.qtd_sistema}</span>
              )}
              <input
                type="number"
                min="0"
                value={item.qtd_contada ?? ''}
                onChange={(e) => {
                  const val = e.target.value
                  onSetQtd(item.produto_id, val === '' ? null : Number.parseInt(val, 10) || 0)
                }}
                placeholder="—"
                className="w-full rounded-[8px] border border-input-border bg-white px-2.5 py-1.5 text-[13px] text-brand-950 outline-none placeholder:text-brand-muted focus:border-brand-700 focus:ring-1 focus:ring-brand-700/20"
              />
              <span className="text-center text-[14px] text-success-600">
                {item.qtd_contada !== null ? '✓' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-brand-100 border-t px-6 py-4">
        {divergencias.length > 0 ? (
          <button
            type="button"
            onClick={onVerDivergencias}
            className="flex h-8 items-center gap-1.5 rounded-[12px] border border-warning-100 bg-warning-50 px-3 font-semibold text-[12px] text-warning-800 hover:bg-warning-100"
          >
            Ver divergências ({divergencias.length})
          </button>
        ) : (
          <span className="text-[12px] text-text-secondary">Nenhuma divergência detectada</span>
        )}
        <button
          type="button"
          onClick={onVerDivergencias}
          disabled={contados.length === 0}
          className="flex h-10 items-center gap-2 rounded-[12px] bg-brand-700 px-5 font-bold text-[13px] text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Finalizar e ver ajustes →
        </button>
      </div>
    </div>
  )
}

function EtapaDivergencias({
  itens,
  motivo,
  onMotivoChange,
  motivoDetalhe,
  onMotivoDetalheChange,
  salvando,
  onSalvar,
  onVoltar,
  onCancelar,
}: {
  itens: ItemInventario[]
  motivo: string
  onMotivoChange: (v: string) => void
  motivoDetalhe: string
  onMotivoDetalheChange: (v: string) => void
  salvando: boolean
  onSalvar: () => Promise<void>
  onVoltar: () => void
  onCancelar: () => void
}) {
  const divergencias = itens.filter(
    (i) => i.qtd_contada !== null && i.qtd_contada !== i.qtd_sistema
  )
  const temCritico = divergencias.some((i) => {
    const pct = Math.abs(((i.qtd_contada ?? 0) - i.qtd_sistema) / Math.max(i.qtd_sistema, 1)) * 100
    return pct > 5
  })
  const canSalvar = motivo.length >= 5 && !temCritico && !salvando

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 rounded-[24px] border border-brand-100 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-brand-100 border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onVoltar}
            className="flex h-8 items-center rounded-[12px] border border-brand-200 px-3 font-semibold text-[12px] text-brand-700 hover:bg-brand-50"
          >
            ← Voltar
          </button>
          <h2 className="font-bold text-[18px] text-brand-950">Resumo de divergências</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-[14px] bg-warning-50 px-3 py-1 font-semibold text-[12px] text-warning-800">
            {divergencias.length} produto{divergencias.length !== 1 ? 's' : ''} com divergência
          </span>
          <button
            type="button"
            onClick={onCancelar}
            className="flex h-8 items-center rounded-[12px] border border-brand-200 px-3 font-semibold text-[12px] text-brand-700 hover:bg-brand-50"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Tabela de divergências */}
      <div className="min-h-0 overflow-hidden px-6">
        <div className="overflow-hidden rounded-[12px] border border-brand-100">
          <div className="grid grid-cols-[minmax(0,1fr)_90px_90px_90px_100px] items-center gap-3 bg-[#F5F8F6] px-4 py-2.5">
            {['Produto', 'Sistema', 'Contado', 'Diferença', '% Dif.'].map((h) => (
              <span key={h} className="font-semibold text-[11px] text-text-secondary">
                {h}
              </span>
            ))}
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {divergencias.length === 0 ? (
              <div className="flex items-center justify-center py-8 font-semibold text-[13px] text-success-600">
                ✓ Nenhuma divergência encontrada
              </div>
            ) : (
              divergencias.map((item) => {
                const diff = (item.qtd_contada ?? 0) - item.qtd_sistema
                const pct = item.qtd_sistema === 0 ? 0 : Math.round((diff / item.qtd_sistema) * 100)
                const rowBg = getDivRowBg(pct)
                const difCls = getDifCls(pct)
                return (
                  <div
                    key={item.produto_id}
                    className={`grid grid-cols-[minmax(0,1fr)_90px_90px_90px_100px] items-center gap-3 border-brand-100/60 border-t px-4 py-2.5 ${rowBg}`}
                  >
                    <span className="truncate font-semibold text-[13px] text-brand-950">
                      {item.produto_nome}
                    </span>
                    <span className="text-[13px] text-brand-950">{item.qtd_sistema}</span>
                    <span className="text-[13px] text-brand-950">{item.qtd_contada}</span>
                    <span
                      className={`font-semibold text-[13px] ${diff > 0 ? 'text-success-600' : 'text-danger-700'}`}
                    >
                      {diff > 0 ? '+' : ''}
                      {diff}
                    </span>
                    <span className={`text-[13px] ${difCls}`}>
                      {pct > 0 ? '+' : ''}
                      {pct}%
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Banner RN-05 */}
      {temCritico && (
        <div className="mx-6 flex items-start gap-3 rounded-[14px] border border-danger-100 bg-danger-50 p-3.5">
          <span className="mt-0.5 shrink-0 text-[16px]">⚠</span>
          <p className="text-[13px] text-danger-700">
            <span className="font-bold">Divergência crítica</span> — aprovação de farmacêutico
            obrigatória antes de salvar (RN-05).
          </p>
        </div>
      )}

      {/* Motivo */}
      <div className="flex flex-col gap-3 px-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="inv-motivo" className="font-semibold text-[12px] text-text-secondary">
            Motivo do ajuste <span className="text-danger-700">*</span>
          </label>
          <select
            id="inv-motivo"
            value={motivo}
            onChange={(e) => onMotivoChange(e.target.value)}
            className="h-10 rounded-[10px] border border-input-border bg-white px-3 text-[13px] text-brand-950 outline-none focus:border-brand-700"
          >
            <option value="">Selecione um motivo...</option>
            {MOTIVOS_AJUSTE_INV.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="inv-detalhe" className="font-semibold text-[12px] text-text-secondary">
            Detalhes (opcional)
          </label>
          <input
            id="inv-detalhe"
            type="text"
            value={motivoDetalhe}
            onChange={(e) => onMotivoDetalheChange(e.target.value)}
            placeholder="Adicione detalhes sobre o ajuste..."
            className="h-10 rounded-[10px] border border-input-border bg-white px-3 text-[13px] text-brand-950 outline-none placeholder:text-brand-muted focus:border-brand-700"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 border-brand-100 border-t px-6 py-4">
        <button
          type="button"
          onClick={onVoltar}
          className="flex h-10 flex-1 items-center justify-center rounded-[12px] border border-brand-200 font-bold text-[13px] text-brand-700 hover:bg-brand-50"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={onSalvar}
          disabled={!canSalvar}
          title={
            temCritico
              ? 'Aprovação de farmacêutico obrigatória (RN-05)'
              : motivo.length < 5
                ? 'Selecione um motivo'
                : undefined
          }
          className={`flex h-10 flex-1 items-center justify-center rounded-[12px] font-bold text-[13px] text-white transition-colors ${canSalvar ? 'bg-brand-700 hover:bg-brand-800' : 'cursor-not-allowed bg-brand-300'}`}
        >
          {salvando ? 'Salvando...' : 'Salvar ajuste'}
        </button>
      </div>
    </div>
  )
}
