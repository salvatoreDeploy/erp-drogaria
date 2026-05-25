import { useState } from 'react'

// ── Tipos e dados mock ────────────────────────────────────────────────

type FechamentoStatus = 'balanceado' | 'divergencia_leve' | 'divergencia_critica'

interface VendaForma {
  forma: string
  valor: number
}
interface SangriaReg {
  motivo: string
  valor: number
}
interface Fechamento {
  id: string
  caixa: string
  data: string
  hora_inicio: string
  hora_fim: string
  operador: string
  total_bruto: number
  diferenca: number
  status: FechamentoStatus
  vendas: VendaForma[]
  sangrias: SangriaReg[]
}

const STATUS_CFG: Record<FechamentoStatus, { label: string; bg: string; text: string }> = {
  balanceado: { label: '✓ Balanceado', bg: 'bg-brand-75', text: 'text-brand-700' },
  divergencia_leve: {
    label: '⚠ Divergência leve',
    bg: 'bg-warning-50',
    text: 'text-warning-800',
  },
  divergencia_critica: { label: '✗ Crítico', bg: 'bg-danger-50', text: 'text-danger-700' },
}

const DIFF_CLS: Record<'ok' | 'alerta', string> = {
  ok: 'text-success-600',
  alerta: 'text-danger-700',
}

const CAIXAS_DISPONIVEIS = ['Todos', 'Caixa 01', 'Caixa 02', 'Caixa 03'] as const
type CaixaFiltro = (typeof CAIXAS_DISPONIVEIS)[number]

// TODO: integrar com API — GET /api/v1/pdv/historico-caixa?caixa_id=&data_inicio=&data_fim=&operador_id=
const HISTORICO_MOCK: Fechamento[] = [
  // ── Caixa 01 ────────────────────────────────────────────────────────
  {
    id: '1',
    caixa: 'Caixa 01',
    data: '24/05/2026',
    hora_inicio: '08:00',
    hora_fim: '18:00',
    operador: 'João Silva',
    total_bruto: 5320,
    diferenca: -5,
    status: 'divergencia_leve',
    vendas: [
      { forma: 'Dinheiro', valor: 1335 },
      { forma: 'Débito', valor: 1200 },
      { forma: 'Crédito', valor: 1560 },
      { forma: 'Pix', valor: 900 },
      { forma: 'PBM', valor: 325 },
    ],
    sangrias: [{ motivo: 'Pagamento fornecedor', valor: 200 }],
  },
  {
    id: '4',
    caixa: 'Caixa 01',
    data: '22/05/2026',
    hora_inicio: '08:00',
    hora_fim: '18:00',
    operador: 'João Silva',
    total_bruto: 6120,
    diferenca: 0,
    status: 'balanceado',
    vendas: [
      { forma: 'Dinheiro', valor: 1400 },
      { forma: 'Débito', valor: 1800 },
      { forma: 'Crédito', valor: 1920 },
      { forma: 'Pix', valor: 700 },
      { forma: 'PBM', valor: 300 },
    ],
    sangrias: [],
  },
  {
    id: '6',
    caixa: 'Caixa 01',
    data: '20/05/2026',
    hora_inicio: '08:00',
    hora_fim: '17:45',
    operador: 'Maria Souza',
    total_bruto: 4780,
    diferenca: 0,
    status: 'balanceado',
    vendas: [
      { forma: 'Dinheiro', valor: 1100 },
      { forma: 'Débito', valor: 1380 },
      { forma: 'Crédito', valor: 1050 },
      { forma: 'Pix', valor: 940 },
      { forma: 'PBM', valor: 310 },
    ],
    sangrias: [],
  },

  // ── Caixa 02 ────────────────────────────────────────────────────────
  {
    id: '2',
    caixa: 'Caixa 02',
    data: '23/05/2026',
    hora_inicio: '08:00',
    hora_fim: '17:30',
    operador: 'Maria Souza',
    total_bruto: 4890,
    diferenca: 0,
    status: 'balanceado',
    vendas: [
      { forma: 'Dinheiro', valor: 1120 },
      { forma: 'Débito', valor: 1430 },
      { forma: 'Crédito', valor: 980 },
      { forma: 'Pix', valor: 870 },
      { forma: 'PBM', valor: 490 },
    ],
    sangrias: [],
  },
  {
    id: '5',
    caixa: 'Caixa 02',
    data: '21/05/2026',
    hora_inicio: '08:00',
    hora_fim: '18:00',
    operador: 'Maria Souza',
    total_bruto: 4320,
    diferenca: 20,
    status: 'divergencia_leve',
    vendas: [
      { forma: 'Dinheiro', valor: 1020 },
      { forma: 'Débito', valor: 1130 },
      { forma: 'Crédito', valor: 890 },
      { forma: 'Pix', valor: 1020 },
      { forma: 'PBM', valor: 260 },
    ],
    sangrias: [{ motivo: 'Troco devolvido', valor: 80 }],
  },
  {
    id: '7',
    caixa: 'Caixa 02',
    data: '20/05/2026',
    hora_inicio: '08:00',
    hora_fim: '17:30',
    operador: 'Pedro Alves',
    total_bruto: 3940,
    diferenca: 0,
    status: 'balanceado',
    vendas: [
      { forma: 'Dinheiro', valor: 850 },
      { forma: 'Débito', valor: 1290 },
      { forma: 'Crédito', valor: 760 },
      { forma: 'Pix', valor: 840 },
      { forma: 'PBM', valor: 200 },
    ],
    sangrias: [],
  },

  // ── Caixa 03 ────────────────────────────────────────────────────────
  {
    id: '3',
    caixa: 'Caixa 03',
    data: '23/05/2026',
    hora_inicio: '18:00',
    hora_fim: '22:00',
    operador: 'Pedro Alves',
    total_bruto: 2140,
    diferenca: -75,
    status: 'divergencia_critica',
    vendas: [
      { forma: 'Dinheiro', valor: 1265 },
      { forma: 'Débito', valor: 520 },
      { forma: 'Pix', valor: 355 },
    ],
    sangrias: [{ motivo: 'Retirada caixa cheio', valor: 500 }],
  },
  {
    id: '8',
    caixa: 'Caixa 03',
    data: '22/05/2026',
    hora_inicio: '18:00',
    hora_fim: '22:00',
    operador: 'Ana Lima',
    total_bruto: 1980,
    diferenca: 0,
    status: 'balanceado',
    vendas: [
      { forma: 'Dinheiro', valor: 680 },
      { forma: 'Débito', valor: 740 },
      { forma: 'Pix', valor: 430 },
      { forma: 'PBM', valor: 130 },
    ],
    sangrias: [],
  },
  {
    id: '9',
    caixa: 'Caixa 03',
    data: '21/05/2026',
    hora_inicio: '18:00',
    hora_fim: '22:00',
    operador: 'Ana Lima',
    total_bruto: 2310,
    diferenca: 15,
    status: 'divergencia_leve',
    vendas: [
      { forma: 'Dinheiro', valor: 815 },
      { forma: 'Débito', valor: 890 },
      { forma: 'Pix', valor: 445 },
      { forma: 'PBM', valor: 160 },
    ],
    sangrias: [],
  },
]

// ── Helpers ────────────────────────────────────────────────────────────

function fmtBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function fmtDif(n: number): string {
  return n === 0 ? 'R$ 0,00' : (n > 0 ? '+' : '') + fmtBRL(n)
}

// ── Componente ─────────────────────────────────────────────────────────

export function ModalHistoricoCaixa({ onClose }: { onClose: () => void }) {
  const [caixaFiltro, setCaixaFiltro] = useState<CaixaFiltro>('Todos')
  const [busca, setBusca] = useState('')
  const [selecionado, setSelecionado] = useState<Fechamento | null>(null)
  const [isExportando, setIsExportando] = useState(false)

  const filtrados = HISTORICO_MOCK.filter(
    (f) =>
      (caixaFiltro === 'Todos' || f.caixa === caixaFiltro) &&
      (busca === '' ||
        f.operador.toLowerCase().includes(busca.toLowerCase()) ||
        f.data.includes(busca))
  )

  const selectedSt = selecionado ? STATUS_CFG[selecionado.status] : null

  const handleCaixaFiltro = (c: CaixaFiltro) => {
    setCaixaFiltro(c)
    setSelecionado(null)
  }

  const handleExportarPDF = async () => {
    setIsExportando(true)
    try {
      await new Promise((r) => setTimeout(r, 1400))
      // TODO: integrar com API — GET /api/v1/pdv/historico-caixa/{id}/exportar-pdf
    } catch (err) {
      console.error('[handleExportarPDF]', err)
    } finally {
      setIsExportando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar modal"
      />
      <div className="relative z-10 flex max-h-[90vh] w-[820px] flex-col overflow-hidden rounded-[28px] bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-brand-100 border-b px-7 py-5">
          <div>
            <p className="font-bold text-[18px] text-brand-950">Histórico de caixa</p>
            <p className="text-[12px] text-text-secondary">Fechamentos dos últimos 30 dias</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-[13px] text-brand-600 hover:bg-brand-100"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>

        {/* Body — dois painéis */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Painel esquerdo: filtros + lista */}
          <div className="flex w-[300px] shrink-0 flex-col border-brand-100 border-r">
            {/* Pills de caixa */}
            <div className="flex items-center gap-1.5 overflow-x-auto border-brand-100 border-b px-3 py-2.5">
              {CAIXAS_DISPONIVEIS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleCaixaFiltro(c)}
                  className={`shrink-0 rounded-full px-3 py-1 font-semibold text-[11px] transition-colors ${
                    caixaFiltro === c
                      ? 'bg-brand-900 text-white'
                      : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Busca */}
            <div className="border-brand-100 border-b p-3">
              <input
                id="hist-busca"
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por operador ou data..."
                className="w-full rounded-[12px] border border-input-border bg-input-bg px-3 py-2 text-[12px] text-brand-950 outline-none placeholder:text-input-placeholder focus:border-brand-700"
              />
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto p-2">
              {filtrados.length === 0 ? (
                <p className="py-8 text-center text-[12px] text-text-secondary">Nenhum resultado</p>
              ) : (
                filtrados.map((f) => {
                  const st = STATUS_CFG[f.status]
                  const isActive = selecionado?.id === f.id
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelecionado(f)}
                      className={`flex w-full flex-col gap-1 rounded-[12px] px-3 py-2.5 text-left transition-colors ${
                        isActive ? 'bg-brand-75' : 'hover:bg-brand-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[11px] text-brand-950">{f.data}</span>
                          {caixaFiltro === 'Todos' && (
                            <span className="rounded-full bg-brand-50 px-2 py-0.5 font-medium text-[9px] text-brand-600">
                              {f.caixa}
                            </span>
                          )}
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 font-semibold text-[9px] ${st.bg} ${st.text}`}
                        >
                          {st.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-text-secondary">
                        {f.hora_inicio}–{f.hora_fim} · {f.operador}
                      </span>
                      <span className="font-medium text-[11px] text-brand-950">
                        {fmtBRL(f.total_bruto)}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Painel direito: detalhe */}
          <div className="flex flex-1 flex-col overflow-y-auto">
            {selecionado && selectedSt ? (
              <div className="flex flex-col gap-5 p-6">
                {/* Cabeçalho */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-0.5">
                    <p className="font-bold text-[15px] text-brand-950">
                      {selecionado.data} · {selecionado.hora_inicio}–{selecionado.hora_fim}
                    </p>
                    <p className="text-[12px] text-text-secondary">
                      {selecionado.caixa} · {selecionado.operador}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 font-semibold text-[11px] ${selectedSt.bg} ${selectedSt.text}`}
                  >
                    {selectedSt.label}
                  </span>
                </div>

                {/* Vendas por forma */}
                <div className="flex flex-col gap-2">
                  <p className="font-bold text-[13px] text-brand-950">Vendas por forma</p>
                  <div className="flex flex-col gap-1">
                    <div className="grid grid-cols-[1fr_90px] rounded-[10px] bg-[#F5F8F6] px-3 py-2">
                      <span className="font-semibold text-[11px] text-brand-muted">Forma</span>
                      <span className="text-right font-semibold text-[11px] text-brand-muted">
                        Valor
                      </span>
                    </div>
                    {selecionado.vendas.map((v) => (
                      <div
                        key={v.forma}
                        className="grid grid-cols-[1fr_90px] rounded-[10px] bg-[#FBFCFB] px-3 py-2"
                      >
                        <span className="font-medium text-[12px] text-brand-950">{v.forma}</span>
                        <span className="text-right font-medium text-[12px] text-brand-950">
                          {fmtBRL(v.valor)}
                        </span>
                      </div>
                    ))}
                    <div className="grid grid-cols-[1fr_90px] border-brand-100 border-t px-3 pt-2">
                      <span className="font-bold text-[12px] text-brand-950">Total</span>
                      <span className="text-right font-bold text-[12px] text-brand-950">
                        {fmtBRL(selecionado.total_bruto)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sangrias */}
                {selecionado.sangrias.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="font-bold text-[13px] text-brand-950">Sangrias</p>
                    <div className="flex flex-col gap-1">
                      {selecionado.sangrias.map((s) => (
                        <div
                          key={s.motivo}
                          className="flex items-center justify-between rounded-[10px] bg-[#FBFCFB] px-3 py-2"
                        >
                          <span className="text-[12px] text-brand-950">{s.motivo}</span>
                          <span className="font-medium text-[12px] text-danger-700">
                            -{fmtBRL(s.valor)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Divergência */}
                <div className="flex items-center justify-between rounded-[14px] border border-brand-100 bg-[#FBFCFB] px-4 py-3">
                  <span className="font-semibold text-[13px] text-brand-950">
                    Divergência (espécie)
                  </span>
                  <span
                    className={`font-bold text-[15px] ${DIFF_CLS[Math.abs(selecionado.diferenca) <= 0.01 ? 'ok' : 'alerta']}`}
                  >
                    {fmtDif(selecionado.diferenca)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-[13px] text-text-secondary">
                  Selecione um fechamento para ver o detalhe
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-brand-100 border-t px-7 py-4">
          <button
            type="button"
            onClick={handleExportarPDF}
            disabled={!selecionado || isExportando}
            className={`flex h-9 items-center gap-2 rounded-[12px] border px-4 font-semibold text-[12px] transition-colors ${
              !selecionado || isExportando
                ? 'cursor-not-allowed border-brand-100 text-brand-300'
                : 'border-brand-200 text-brand-700 hover:bg-brand-50'
            }`}
          >
            {isExportando ? 'Exportando...' : 'Exportar PDF'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 items-center rounded-[12px] bg-brand-900 px-5 font-bold text-[12px] text-white transition-colors hover:bg-brand-800"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
