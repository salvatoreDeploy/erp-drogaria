import { useState } from 'react'
import { Link } from 'react-router-dom'

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

        {/* Table section */}
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
              {['Produto', 'Estoque', 'Mínimo', 'Validade', 'Lote', 'SNGPC', 'Status', 'Ações'].map(
                (h) => (
                  <span key={h} className="font-semibold text-[12px] text-text-secondary">
                    {h}
                  </span>
                )
              )}
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
