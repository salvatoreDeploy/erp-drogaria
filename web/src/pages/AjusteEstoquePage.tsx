import { useMemo, useState } from 'react'

type AjusteStatus = 'ok' | 'pendente' | 'aprovado' | 'revisao'

const MOTIVO_OPTIONS = [
  { value: 'produto_vencido', label: 'Produto vencido' },
  { value: 'avaria', label: 'Avaria / quebra' },
  { value: 'furto', label: 'Furto / perda' },
  { value: 'erro_entrada', label: 'Erro de entrada NF' },
  { value: 'devolucao', label: 'Devolução' },
  { value: 'transferencia', label: 'Transferência' },
]

const CATEGORIAS = ['Cardiovascular', 'Analgésico', 'Antibiótico', 'Controlado', 'Material']

// TODO: integrar com API — GET /api/estoque?inventario=true
const BASE_ITEMS = [
  {
    id: 1,
    produto: 'Losartana 50mg',
    lote: 'L-1044',
    validade: '62 dias',
    qtdSistema: 124,
    preco: 2.8,
    categoria: 'Cardiovascular',
  },
  {
    id: 2,
    produto: 'Dipirona 500mg',
    lote: 'D-2291',
    validade: '18 dias',
    qtdSistema: 18,
    preco: 4.2,
    categoria: 'Analgésico',
  },
  {
    id: 3,
    produto: 'Amoxicilina 500mg',
    lote: 'A-5561',
    validade: '34 dias',
    qtdSistema: 53,
    preco: 12.4,
    categoria: 'Antibiótico',
  },
  {
    id: 4,
    produto: 'Morfina 10mg',
    lote: 'C-8920',
    validade: '9 dias',
    qtdSistema: 21,
    preco: 65.0,
    categoria: 'Controlado',
  },
  {
    id: 5,
    produto: 'Seringa 10ml',
    lote: 'P-7812',
    validade: 'N/A',
    qtdSistema: 21,
    preco: 1.9,
    categoria: 'Material',
  },
]

type Edits = Record<number, { qtdContada: string; motivo: string }>

// Estado inicial espelha o design (rows 1 e 5 ok; 2 pendente; 3 aprovado; 4 revisão)
const INITIAL_EDITS: Edits = {
  1: { qtdContada: '124', motivo: '' },
  2: { qtdContada: '16', motivo: '' },
  3: { qtdContada: '23', motivo: 'produto_vencido' },
  4: { qtdContada: '6', motivo: 'avaria' },
  5: { qtdContada: '21', motivo: '' },
}

function calcStatus(qtdSistema: number, qtdContada: number, motivo: string): AjusteStatus {
  const diff = qtdContada - qtdSistema
  if (diff === 0) return 'ok'
  if (!motivo) return 'pendente'
  if (motivo === 'produto_vencido') return 'aprovado'
  return Math.abs(diff / qtdSistema) > 0.05 ? 'revisao' : 'aprovado'
}

function fmtBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

const STATUS_CFG: Record<AjusteStatus, { label: string; bg: string; text: string }> = {
  ok: { label: '● OK', bg: 'bg-brand-75', text: 'text-brand-750' },
  pendente: { label: '● Pendente', bg: 'bg-warning-50', text: 'text-warning-800' },
  aprovado: { label: '● Aprovado', bg: 'bg-brand-75', text: 'text-brand-750' },
  revisao: { label: '✗ Revisão', bg: 'bg-danger-50', text: 'text-danger-700' },
}

const ROW_BG: Record<AjusteStatus, string> = {
  ok: 'bg-[#FBFCFB]',
  aprovado: 'bg-[#FBFCFB]',
  pendente: 'bg-warning-50',
  revisao: 'bg-danger-50',
}

const COL = 'grid-cols-[minmax(0,1fr)_80px_80px_90px_110px_80px_minmax(160px,auto)_120px]'

export function AjusteEstoquePage() {
  const [edits, setEdits] = useState<Edits>(INITIAL_EDITS)
  const [dataInventario, setDataInventario] = useState(new Date().toISOString().split('T')[0])
  const [soComDivergencia, setSoComDivergencia] = useState(false)
  const [categoria, setCategoria] = useState('')
  const [inventarioIniciado, setInventarioIniciado] = useState(true)

  const rows = useMemo(
    () =>
      BASE_ITEMS.map((item) => {
        const edit = edits[item.id]
        const qtdContada = parseInt(edit.qtdContada, 10) || 0
        const diff = qtdContada - item.qtdSistema
        const status = calcStatus(item.qtdSistema, qtdContada, edit.motivo)
        return { ...item, qtdContada, diff, motivo: edit.motivo, status }
      }),
    [edits]
  )

  const stats = useMemo(
    () => ({
      contados: rows.length,
      comDivergencia: rows.filter((r) => r.diff !== 0).length,
      aprovados: rows.filter((r) => r.status === 'aprovado').length,
      pendentes: rows.filter((r) => r.status === 'pendente' || r.status === 'revisao').length,
      valorAjustado: rows.reduce((sum, r) => sum + Math.abs(r.diff) * r.preco, 0),
    }),
    [rows]
  )

  const displayRows = useMemo(
    () =>
      rows.filter((r) => {
        if (soComDivergencia && r.diff === 0) return false
        if (categoria && r.categoria !== categoria) return false
        return true
      }),
    [rows, soComDivergencia, categoria]
  )

  const temRevisao = rows.some((r) => r.status === 'revisao')

  function updateQtd(id: number, val: string) {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], qtdContada: val } }))
  }

  function updateMotivo(id: number, val: string) {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], motivo: val } }))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between rounded-[24px] border border-brand-100 bg-white px-[22px] py-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-[24px] text-brand-950 leading-none">
            Ajuste físico de estoque
          </h1>
          <p className="text-[13px] text-text-secondary">
            Contagem manual com reconciliação automática de divergências.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <input
            type="date"
            value={dataInventario}
            onChange={(e) => setDataInventario(e.target.value)}
            disabled={inventarioIniciado}
            className="flex h-10 items-center rounded-[10px] border border-brand-100 bg-white px-3 text-[13px] text-brand-950 outline-none focus:border-brand-700 disabled:bg-brand-50 disabled:text-text-secondary"
          />
          {/* TODO: integrar com API — POST /api/estoque/inventario/iniciar */}
          <button
            type="button"
            onClick={() => setInventarioIniciado(true)}
            disabled={inventarioIniciado}
            className="flex h-10 items-center rounded-[10px] bg-brand-700 px-4 font-bold text-[13px] text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Iniciar inventário
          </button>
        </div>
      </header>

      {/* ── Métricas ao vivo ────────────────────────────────── */}
      <div className="flex items-center gap-0 rounded-[16px] border border-brand-100 bg-white">
        <StatPill label="Itens contados" value={String(stats.contados)} />
        <div className="h-10 w-px bg-brand-100" />
        <StatPill
          label="Com divergência"
          value={String(stats.comDivergencia)}
          valueClass={stats.comDivergencia > 0 ? 'text-warning-800' : undefined}
        />
        <div className="h-10 w-px bg-brand-100" />
        <StatPill label="Aprovados" value={String(stats.aprovados)} valueClass="text-success-600" />
        <div className="h-10 w-px bg-brand-100" />
        <StatPill
          label="Pendentes"
          value={String(stats.pendentes)}
          valueClass={stats.pendentes > 0 ? 'text-danger-700' : undefined}
        />
        <div className="h-10 w-px bg-brand-100" />
        <StatPill
          label="Valor ajustado"
          value={fmtBRL(stats.valorAjustado)}
          valueClass="text-brand-950"
        />
      </div>

      {/* ── Tabela ─────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col rounded-[24px] border border-brand-100 bg-white">
        {/* Filtros */}
        <div className="flex items-center gap-3 border-brand-100 border-b px-5 py-3.5">
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="h-8 rounded-[8px] border border-brand-100 bg-white px-2 text-[12px] text-brand-950 outline-none focus:border-brand-700"
          >
            <option value="">Todas as categorias</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select className="h-8 rounded-[8px] border border-brand-100 bg-white px-2 text-[12px] text-brand-950 outline-none focus:border-brand-700">
            <option>Todos os locais</option>
            <option>Balcão A</option>
            <option>Balcão B</option>
            <option>Depósito</option>
          </select>
          <button
            type="button"
            onClick={() => setSoComDivergencia((v) => !v)}
            className={[
              'flex h-8 items-center rounded-[8px] border px-3 font-semibold text-[12px] transition-colors',
              soComDivergencia
                ? 'border-brand-700 bg-brand-75 text-brand-750'
                : 'border-brand-100 bg-white text-brand-muted hover:bg-brand-50',
            ].join(' ')}
          >
            Só divergências
          </button>
        </div>

        {/* Cabeçalho da tabela */}
        <div
          className={`grid ${COL} items-center gap-3 border-brand-100 border-b bg-[#F5F8F6] px-5 py-2.5`}
        >
          {[
            'Produto',
            'Lote',
            'Validade',
            'Qtd sistema',
            'Qtd contada',
            'Diferença',
            'Motivo',
            'Status',
          ].map((h) => (
            <span key={h} className="font-semibold text-[12px] text-text-secondary">
              {h}
            </span>
          ))}
        </div>

        {/* Corpo scrollável */}
        <div className="flex flex-1 flex-col gap-0 overflow-y-auto">
          {displayRows.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-10 text-[13px] text-brand-muted">
              Nenhum item corresponde aos filtros selecionados.
            </div>
          ) : (
            displayRows.map((row) => {
              const badge = STATUS_CFG[row.status]
              return (
                <div
                  key={row.id}
                  className={`grid ${COL} items-center gap-3 border-brand-100/60 border-b px-5 py-3 last:border-b-0 ${ROW_BG[row.status]}`}
                >
                  {/* Produto */}
                  <span className="truncate font-semibold text-[13px] text-brand-950">
                    {row.produto}
                  </span>

                  {/* Lote */}
                  <span className="text-[12px] text-text-secondary">{row.lote}</span>

                  {/* Validade */}
                  <span
                    className={`text-[12px] ${
                      row.validade === 'N/A'
                        ? 'text-brand-muted'
                        : row.status === 'revisao' && parseInt(row.validade, 10) < 10
                          ? 'font-bold text-danger-700'
                          : 'text-brand-950'
                    }`}
                  >
                    {row.validade}
                  </span>

                  {/* Qtd sistema */}
                  <span className="text-[13px] text-brand-950">{row.qtdSistema}</span>

                  {/* Qtd contada — input editável */}
                  <input
                    type="number"
                    min="0"
                    value={edits[row.id].qtdContada}
                    onChange={(e) => updateQtd(row.id, e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="w-full rounded-[8px] border border-input-border bg-white px-2.5 py-1.5 text-[13px] text-brand-950 outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700/20"
                  />

                  {/* Diferença */}
                  <DiffCell diff={row.diff} />

                  {/* Motivo */}
                  <div>
                    {row.diff !== 0 ? (
                      <select
                        value={row.motivo}
                        onChange={(e) => updateMotivo(row.id, e.target.value)}
                        className="w-full rounded-[8px] border border-input-border bg-white px-2 py-1.5 text-[12px] text-brand-950 outline-none focus:border-brand-700"
                      >
                        <option value="">Selecionar motivo...</option>
                        {MOTIVO_OPTIONS.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-[12px] text-brand-muted">—</span>
                    )}
                  </div>

                  {/* Status */}
                  <span
                    className={`inline-flex h-6 items-center rounded-full px-2.5 font-semibold text-[11px] ${badge.bg} ${badge.text}`}
                  >
                    {badge.label}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-[13px] text-brand-950">
            {stats.comDivergencia} divergência{stats.comDivergencia !== 1 ? 's' : ''} ·{' '}
            {fmtBRL(stats.valorAjustado)}
          </span>
          {temRevisao && (
            <span className="text-[12px] text-danger-700">
              ⚠ Divergências &gt;5% aguardam aprovação de supervisor.
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          {/* TODO: integrar com API — GET /api/estoque/ajuste/exportar */}
          <button
            type="button"
            className="flex h-10 items-center rounded-[10px] border border-brand-100 px-4 font-semibold text-[13px] text-text-secondary transition-colors hover:bg-brand-50"
          >
            Exportar
          </button>
          {/* TODO: integrar com API — POST /api/estoque/ajuste */}
          <button
            type="button"
            disabled={stats.pendentes > 0}
            className="flex h-10 items-center rounded-[10px] bg-brand-700 px-5 font-bold text-[13px] text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Salvar ajuste
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── sub-componentes internos ─────────────────────────────────────── */

function StatPill({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex flex-1 flex-col gap-0.5 px-5 py-3">
      <span className="text-[11px] text-text-secondary">{label}</span>
      <span className={`font-bold text-[15px] leading-none ${valueClass ?? 'text-brand-950'}`}>
        {value}
      </span>
    </div>
  )
}

function DiffCell({ diff }: { diff: number }) {
  if (diff === 0) return <span className="text-[13px] text-brand-muted">0</span>
  if (diff > 0) return <span className="font-bold text-[13px] text-success-600">+{diff}</span>
  return <span className="font-bold text-[13px] text-danger-700">{diff}</span>
}
