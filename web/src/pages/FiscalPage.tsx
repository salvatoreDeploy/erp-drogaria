import { useState } from 'react'
import { Link } from 'react-router-dom'

/* ── Types ────────────────────────────────────────────────────────── */

type ItemEmissaoStatus = 'normal' | 'contingencia'
type NfeHistStatus = 'autorizada' | 'cancelada' | 'contingencia'

/* ── Constants ────────────────────────────────────────────────────── */

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// TODO: integrar com API — GET /api/v1/fiscal/metricas-dia
const METRIC_CFG = [
  {
    label: 'Notas emitidas hoje',
    value: '34',
    bg: 'bg-white',
    border: 'border-brand-100',
    lbl: 'text-text-secondary',
    val: 'text-brand-950',
  },
  {
    label: 'Autorizadas',
    value: '31',
    bg: 'bg-brand-25',
    border: 'border-brand-100',
    lbl: 'text-success-600',
    val: 'text-brand-900',
  },
  {
    label: 'Em contingência',
    value: '2',
    bg: 'bg-warning-50',
    border: 'border-warning-100',
    lbl: 'text-warning-700',
    val: 'text-warning-950',
  },
  {
    label: 'Rejeições',
    value: '3',
    bg: 'bg-danger-50',
    border: 'border-danger-100',
    lbl: 'text-danger-700',
    val: 'text-danger-800',
  },
  {
    label: 'Tempo médio',
    value: '42s',
    bg: 'bg-info-50',
    border: 'border-info-100',
    lbl: 'text-info-700',
    val: 'text-info-950',
  },
] as const

// TODO: integrar com API — GET /api/v1/fiscal/nfe/emissao/{id}/itens
const ITENS_EMISSAO: Array<{
  id: number
  produto: string
  cfop: string
  lote: string
  valor: number
  status: ItemEmissaoStatus
}> = [
  { id: 1, produto: 'Losartana 50mg', cfop: '6102', lote: 'L-1044', valor: 2490, status: 'normal' },
  { id: 2, produto: 'Dipirona 500mg', cfop: '6102', lote: 'D-2291', valor: 840, status: 'normal' },
  {
    id: 3,
    produto: 'Morfina 10mg',
    cfop: '—',
    lote: 'C-8920',
    valor: 1120,
    status: 'contingencia',
  },
]

const TOTAL_EMISSAO = ITENS_EMISSAO.reduce((sum, i) => sum + i.valor, 0)

// TODO: integrar com API — GET /api/v1/fiscal/nfe/historico-recente
const HISTORICO: Array<{ numero: string; status: NfeHistStatus }> = [
  { numero: 'NF-e 002184', status: 'autorizada' },
  { numero: 'NF-e 002183', status: 'cancelada' },
  { numero: 'NF-e 002182', status: 'contingencia' },
]

const HIST_CFG: Record<NfeHistStatus, { label: string; cls: string }> = {
  autorizada: { label: 'Autorizada', cls: 'text-success-600' },
  cancelada: { label: 'Cancelada', cls: 'text-danger-700' },
  contingencia: { label: 'Contingência', cls: 'text-warning-700' },
}

const ITEM_CFG: Record<ItemEmissaoStatus, { row: string; detail: string; valor: string }> = {
  normal: {
    row: 'bg-[#FBFCFB] border-brand-100',
    detail: 'text-text-secondary',
    valor: 'text-brand-900',
  },
  contingencia: {
    row: 'bg-warning-50 border-warning-100',
    detail: 'font-semibold text-warning-700',
    valor: 'text-warning-950',
  },
}

const MOTIVOS_CANCELAMENTO = [
  'Erro de emissão',
  'Desistência do comprador',
  'Mercadoria não entregue',
  'Dados do destinatário incorretos',
  'Outro motivo',
]

/* ── Modais ───────────────────────────────────────────────────────── */

function ModalCartaCorrecao({ onClose }: { onClose: () => void }) {
  const [nfeSelecionada, setNfeSelecionada] = useState(HISTORICO[0].numero)
  const [texto, setTexto] = useState('')
  const charCount = texto.length
  const canSubmit = charCount >= 15

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar modal"
      />
      <div className="relative z-10 flex w-[520px] flex-col gap-4 rounded-[28px] bg-white p-6 shadow-xl">
        <h3 className="font-bold text-[18px] text-brand-950">Carta de Correção (CC-e)</h3>

        <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
          <label htmlFor="cc-nfe" className="font-bold text-[12px] text-input-label">
            NF-e
          </label>
          <select
            id="cc-nfe"
            value={nfeSelecionada}
            onChange={(e) => setNfeSelecionada(e.target.value)}
            className="bg-transparent text-[14px] text-brand-950 outline-none"
          >
            {HISTORICO.map((h) => (
              <option key={h.numero} value={h.numero}>
                {h.numero}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
          <div className="flex items-center justify-between">
            <label htmlFor="cc-texto" className="font-bold text-[12px] text-input-label">
              Texto de correção
            </label>
            <span
              className={`text-[11px] ${charCount < 15 ? 'text-danger-600' : 'text-text-secondary'}`}
            >
              {charCount}/1000
            </span>
          </div>
          <textarea
            id="cc-texto"
            value={texto}
            onChange={(e) => setTexto(e.target.value.slice(0, 1000))}
            rows={4}
            placeholder="Descreva a correção (mínimo 15 caracteres)"
            className="resize-none bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
          />
        </div>

        <p className="text-[11px] text-text-secondary">
          ⚠ Permitido no máximo 20 eventos de carta de correção por NF-e.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-brand-200 font-bold text-[13px] text-brand-700 transition-colors hover:bg-brand-50"
          >
            Cancelar
          </button>
          {/* TODO: integrar com API — POST /api/v1/fiscal/nfe/carta-correcao */}
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
            Enviar CC-e
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalCancelarNfe({ nfe, onClose }: { nfe: string; onClose: () => void }) {
  const [motivo, setMotivo] = useState('')
  const [confirmado, setConfirmado] = useState(false)
  const canCancel = motivo !== '' && confirmado

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar modal"
      />
      <div className="relative z-10 flex w-[480px] flex-col gap-4 rounded-[28px] bg-white p-6 shadow-xl">
        <h3 className="font-bold text-[18px] text-brand-950">Cancelar NF-e</h3>

        <div className="flex items-start gap-3 rounded-[16px] border border-danger-100 bg-danger-50 px-4 py-3">
          <span className="shrink-0 font-bold text-[13px] text-danger-700">⚠</span>
          <p className="text-[12px] text-danger-700">
            Cancelamento só é permitido em até 24 horas após a autorização SEFAZ.
          </p>
        </div>

        <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
          <p className="font-bold text-[12px] text-input-label">NF-e</p>
          <span className="text-[14px] text-brand-950">{nfe}</span>
        </div>

        <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
          <label htmlFor="cancelar-motivo" className="font-bold text-[12px] text-input-label">
            Motivo do cancelamento
          </label>
          <select
            id="cancelar-motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="bg-transparent text-[14px] text-brand-950 outline-none"
          >
            <option value="">Selecione um motivo</option>
            {MOTIVOS_CANCELAMENTO.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <label htmlFor="cancelar-confirmar" className="flex cursor-pointer items-center gap-3">
          <input
            id="cancelar-confirmar"
            type="checkbox"
            checked={confirmado}
            onChange={(e) => setConfirmado(e.target.checked)}
            className="h-4 w-4 rounded accent-danger-600"
          />
          <span className="text-[13px] text-brand-950">Confirmo o cancelamento desta NF-e</span>
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-brand-200 font-bold text-[13px] text-brand-700 transition-colors hover:bg-brand-50"
          >
            Voltar
          </button>
          {/* TODO: integrar com API — POST /api/v1/fiscal/nfe/{id}/cancelar */}
          <button
            type="button"
            disabled={!canCancel}
            className={[
              'flex h-10 flex-1 items-center justify-center rounded-[14px] font-bold text-[13px] transition-colors',
              canCancel
                ? 'bg-danger-600 text-white hover:bg-danger-700'
                : 'cursor-not-allowed bg-danger-200 text-white',
            ].join(' ')}
          >
            Cancelar NF-e
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────── */

export function FiscalPage() {
  const [sefazOnline, setSefazOnline] = useState(true)
  const [cartaCorrecaoOpen, setCartaCorrecaoOpen] = useState(false)
  const [cancelarNfeOpen, setCancelarNfeOpen] = useState(false)
  const [selectedNfe, setSelectedNfe] = useState<string | null>(null)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Header */}
      <header className="flex items-center justify-between rounded-[24px] border border-brand-100 bg-white px-[22px] py-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-bold text-[24px] text-brand-950 leading-none">NF-e / Fiscal</h1>
          <p className="text-[13px] text-text-secondary">
            Emissão, autorização SEFAZ, cancelamento e controle de contingência.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(['online', 'offline'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSefazOnline(s === 'online')}
                className={[
                  'rounded-full px-2 py-0.5 font-mono text-[9px] uppercase transition-colors',
                  (s === 'online') === sefazOnline
                    ? 'bg-brand-100 text-brand-750'
                    : 'text-brand-muted hover:bg-brand-50',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
          </div>
          {sefazOnline ? (
            <div className="flex items-center gap-2 rounded-full border border-brand-200 bg-brand-75 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-success-600" />
              <span className="font-bold text-[12px] text-success-600">SEFAZ online</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-full border border-warning-100 bg-warning-50 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-warning-600" />
              <span className="font-bold text-[12px] text-warning-700">SEFAZ offline</span>
            </div>
          )}
          <Link
            to="/fiscal/entrada-nfe"
            className="flex h-9 items-center rounded-[14px] border border-brand-100 bg-white px-4 font-bold text-[12px] text-brand-950 transition-colors hover:bg-brand-50"
          >
            Entrada NF-e
          </Link>
          {/* TODO: integrar com API — POST /api/v1/fiscal/nfe/emissao/nova */}
          <button
            type="button"
            className="flex h-9 items-center rounded-[14px] bg-brand-900 px-4 font-bold text-[12px] text-white transition-colors hover:bg-brand-800"
          >
            Nova NF-e
          </button>
        </div>
      </header>

      {/* Offline banner */}
      {!sefazOnline && (
        <div className="flex items-center justify-between rounded-[18px] border border-warning-100 bg-warning-50 px-[18px] py-3">
          <p className="font-bold text-[13px] text-warning-800">
            SEFAZ indisponível — modo contingência ativo. 2 notas aguardam autorização.
          </p>
          <button
            type="button"
            className="ml-4 shrink-0 font-bold text-[12px] text-warning-700 hover:underline"
          >
            Ver contingências
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-5 gap-3.5">
        {METRIC_CFG.map((m) => (
          <div
            key={m.label}
            className={`flex flex-col gap-1.5 rounded-[20px] border p-4 ${m.bg} ${m.border}`}
          >
            <span className={`text-[12px] ${m.lbl}`}>{m.label}</span>
            <span className={`font-bold text-[24px] ${m.val}`}>{m.value}</span>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 gap-3">
        {/* Left: emission form */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-brand-100 bg-white">
          {/* Scrollable content */}
          <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto p-5">
            {/* Section header */}
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[18px] text-brand-950">Nova emissão</h2>
              {/* TODO: integrar com API — POST /api/v1/fiscal/nfe/rascunho */}
              <button
                type="button"
                className="flex h-9 items-center rounded-full bg-brand-900 px-3.5 font-bold text-[12px] text-white transition-colors hover:bg-brand-800"
              >
                Salvar rascunho
              </button>
            </div>

            {/* Form fields */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
                <label
                  htmlFor="emissao-destinatario"
                  className="font-bold text-[12px] text-input-label"
                >
                  Destinatário / cliente
                </label>
                <input
                  id="emissao-destinatario"
                  type="text"
                  defaultValue="Farmácia São Lucas Ltda"
                  placeholder="Nome ou CNPJ do cliente"
                  className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
                  <label
                    htmlFor="emissao-operacao"
                    className="font-bold text-[12px] text-input-label"
                  >
                    Operação
                  </label>
                  <select
                    id="emissao-operacao"
                    className="bg-transparent text-[14px] text-brand-950 outline-none"
                  >
                    <option value="venda_interestadual">Venda interestadual</option>
                    <option value="venda_interna">Venda interna</option>
                    <option value="devolucao">Devolução ao fornecedor</option>
                    <option value="transferencia">Transferência entre filiais</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
                  <label htmlFor="emissao-cfop" className="font-bold text-[12px] text-input-label">
                    CFOP
                  </label>
                  <input
                    id="emissao-cfop"
                    type="text"
                    defaultValue="6102"
                    className="bg-transparent text-[14px] text-brand-950 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
                  <label
                    htmlFor="emissao-pagamento"
                    className="font-bold text-[12px] text-input-label"
                  >
                    Pagamento
                  </label>
                  <select
                    id="emissao-pagamento"
                    className="bg-transparent text-[14px] text-brand-950 outline-none"
                  >
                    <option value="vista_cartao">A vista / cartão</option>
                    <option value="30">30 dias</option>
                    <option value="30_60_90">30/60/90 dias</option>
                    <option value="60_90_120">60/90/120 dias</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
                  <p className="font-bold text-[12px] text-input-label">Série / modelo</p>
                  <span className="text-[14px] text-brand-950">1 / 55</span>
                </div>
              </div>
            </div>

            {/* Items section */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[18px] text-brand-950">Itens da nota</h3>
                <span className="text-[12px] text-text-secondary">
                  {ITENS_EMISSAO.length} itens inseridos
                </span>
              </div>

              {ITENS_EMISSAO.map((item) => {
                const cfg = ITEM_CFG[item.status]
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between rounded-[16px] border px-3.5 py-3 ${cfg.row}`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[13px] text-brand-950">{item.produto}</span>
                      <span className={`text-[12px] ${cfg.detail}`}>
                        {item.status === 'contingencia'
                          ? `Contingência · lote ${item.lote}`
                          : `CFOP ${item.cfop} · lote ${item.lote}`}
                      </span>
                    </div>
                    <span className={`font-bold text-[13px] ${cfg.valor}`}>{fmt(item.valor)}</span>
                  </div>
                )
              })}

              {/* TODO: integrar com API — POST /api/v1/fiscal/nfe/emissao/{id}/itens */}
              <button
                type="button"
                className="flex h-10 w-full items-center justify-center rounded-[16px] border border-brand-200 border-dashed font-semibold text-[13px] text-brand-muted transition-colors hover:bg-brand-25"
              >
                + Adicionar item
              </button>
            </div>
          </div>

          {/* Total bar — sticky at bottom */}
          <div className="flex items-center justify-between border-brand-100 border-t bg-brand-25 px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[12px] text-text-secondary">Total da NF-e</span>
              <span className="font-bold text-[22px] text-brand-950">{fmt(TOTAL_EMISSAO)}</span>
            </div>
            <div className="flex items-center gap-2.5">
              {/* TODO: integrar com API — POST /api/v1/fiscal/nfe/validar-xml */}
              <button
                type="button"
                className="flex h-10 items-center rounded-[14px] border border-brand-100 bg-white px-4 font-bold text-[12px] text-brand-950 transition-colors hover:bg-brand-50"
              >
                Validar XML
              </button>
              {/* TODO: integrar com API — POST /api/v1/fiscal/nfe/transmitir */}
              <button
                type="button"
                className="flex h-10 items-center rounded-[14px] bg-brand-900 px-4 font-bold text-[12px] text-white transition-colors hover:bg-brand-800"
              >
                Transmitir
              </button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex w-[240px] shrink-0 flex-col gap-3">
          {/* Status fiscal */}
          <div className="flex flex-col gap-2.5 rounded-[24px] border border-brand-100 bg-white p-3.5">
            <h3 className="font-bold text-[15px] text-brand-950">Status fiscal</h3>
            <div
              className={[
                'flex items-center justify-between rounded-[14px] px-3 py-2.5',
                sefazOnline ? 'bg-brand-25' : 'bg-warning-50',
              ].join(' ')}
            >
              <span className="font-bold text-[13px] text-brand-950">SEFAZ</span>
              <span
                className={`font-bold text-[12px] ${sefazOnline ? 'text-success-600' : 'text-warning-700'}`}
              >
                {sefazOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-[14px] bg-warning-50 px-3 py-2.5">
              <span className="font-bold text-[13px] text-brand-950">Contingência</span>
              <span className="font-bold text-[12px] text-warning-700">2 notas</span>
            </div>
            <div className="flex items-center justify-between rounded-[14px] bg-danger-50 px-3 py-2.5">
              <span className="font-bold text-[13px] text-brand-950">Rejeições</span>
              <span className="font-bold text-[12px] text-danger-700">3 pendentes</span>
            </div>
          </div>

          {/* Histórico recente */}
          <div className="flex flex-col gap-2.5 rounded-[24px] border border-brand-100 bg-white p-3.5">
            <h3 className="font-bold text-[15px] text-brand-950">Histórico recente</h3>
            {HISTORICO.map((h) => {
              const cfg = HIST_CFG[h.status]
              return (
                <div
                  key={h.numero}
                  className="flex items-center justify-between rounded-[14px] bg-brand-50 px-3 py-2.5"
                >
                  <span className="font-bold text-[13px] text-brand-950">{h.numero}</span>
                  <div className="flex items-center gap-2">
                    {h.status === 'autorizada' && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedNfe(h.numero)
                          setCancelarNfeOpen(true)
                        }}
                        className="font-bold text-[11px] text-danger-600 hover:underline"
                      >
                        Cancelar
                      </button>
                    )}
                    <span className={`text-[12px] ${cfg.cls}`}>{cfg.label}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Ações rápidas */}
          <div className="flex flex-col gap-2.5 rounded-[24px] border border-brand-100 bg-white p-3.5">
            <h3 className="font-bold text-[15px] text-brand-950">Ações rápidas</h3>
            <button
              type="button"
              onClick={() => setCartaCorrecaoOpen(true)}
              className="flex items-center justify-between rounded-[14px] bg-brand-50 px-3 py-2.5 transition-colors hover:bg-brand-75"
            >
              <span className="font-bold text-[13px] text-brand-950">Emitir carta de correção</span>
              <span className="text-[12px] text-success-600">CC-e</span>
            </button>
            {/* TODO: integrar com API — GET /api/v1/fiscal/nfe/protocolo/{numero} */}
            <button
              type="button"
              className="flex items-center justify-between rounded-[14px] bg-brand-50 px-3 py-2.5 transition-colors hover:bg-brand-75"
            >
              <span className="font-bold text-[13px] text-brand-950">Consultar protocolo</span>
              <span className="text-[12px] text-success-600">SEFAZ</span>
            </button>
            {/* TODO: integrar com API — GET /api/v1/fiscal/nfe/{id}/danfe */}
            <button
              type="button"
              className="flex items-center justify-between rounded-[14px] bg-brand-50 px-3 py-2.5 transition-colors hover:bg-brand-75"
            >
              <span className="font-bold text-[13px] text-brand-950">Gerar DANFE</span>
              <span className="text-[12px] text-success-600">PDF</span>
            </button>
            {/* Atalho para entrada de NF-e */}
            <Link
              to="/fiscal/entrada-nfe"
              className="flex items-center justify-between rounded-[14px] border border-brand-100 px-3 py-2.5 transition-colors hover:bg-brand-50"
            >
              <span className="font-bold text-[13px] text-brand-950">
                Registrar entrada de compra
              </span>
              <span className="text-[12px] text-brand-muted">NF-e →</span>
            </Link>
          </div>
        </div>
      </div>

      {cartaCorrecaoOpen && <ModalCartaCorrecao onClose={() => setCartaCorrecaoOpen(false)} />}
      {cancelarNfeOpen && selectedNfe && (
        <ModalCancelarNfe
          nfe={selectedNfe}
          onClose={() => {
            setCancelarNfeOpen(false)
            setSelectedNfe(null)
          }}
        />
      )}
    </div>
  )
}
