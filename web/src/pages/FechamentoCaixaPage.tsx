import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ModalHistoricoCaixa } from '../components/pdv/ModalHistoricoCaixa'
import type { FechamentoCaixa } from '../schemas/pdv'
import { ESPERADO_DINHEIRO, FechamentoCaixaSchema } from '../schemas/pdv'

const TOTAL_TURNO = 5320
const SANGRIAS = 200

function fmtBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function parseBRL(raw: string): number {
  return (
    parseFloat(
      raw
        .replace(/[R$\s]/g, '')
        .replace(/\./g, '')
        .replace(',', '.')
    ) || 0
  )
}

function fmtDif(n: number): string {
  return n === 0 ? 'R$ 0,00' : (n > 0 ? '+' : '') + fmtBRL(n)
}

const DIFF_CLS: Record<'ok' | 'alerta', string> = {
  ok: 'text-success-600',
  alerta: 'text-danger-700',
}

const AUTO_ROWS = [
  { forma: 'Débito', esperado: 'R$ 1.200,00' },
  { forma: 'Crédito', esperado: 'R$ 1.560,00' },
  { forma: 'Pix', esperado: 'R$ 900,00' },
  { forma: 'PBM', esperado: 'R$ 320,00' },
]

function ModalFecharCaixa({
  onClose,
  onConfirmar,
  isLoading,
  valorContadoInicial,
}: {
  onClose: () => void
  onConfirmar: (data: FechamentoCaixa) => void
  isLoading: boolean
  valorContadoInicial: string
}) {
  const [valorContado, setValorContado] = useState(valorContadoInicial)
  const [motivoDiferenca, setMotivoDiferenca] = useState('')
  const [erros, setErros] = useState<Record<string, string[]>>({})

  const valorNum = parseBRL(valorContado)
  const diff = valorNum - ESPERADO_DINHEIRO
  const diffAbs = Math.abs(diff)
  const mostrMotivo = diffAbs > 50
  const diffKey: 'ok' | 'alerta' = diffAbs <= 0.01 ? 'ok' : 'alerta'

  const handleConfirmar = () => {
    const result = FechamentoCaixaSchema.safeParse({
      valor_contado: valorNum,
      motivo_diferenca: motivoDiferenca || undefined,
    })
    if (!result.success) {
      setErros(result.error.flatten().fieldErrors)
      return
    }
    setErros({})
    onConfirmar(result.data)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar modal"
      />
      <div className="relative z-10 flex w-[520px] flex-col gap-5 rounded-[28px] bg-white p-7 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-[20px] text-brand-950">Fechar caixa</p>
            <p className="text-[12px] text-text-secondary">
              Confirme os valores antes de encerrar o turno
            </p>
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

        {/* Resumo do turno */}
        <div className="flex flex-col gap-2 rounded-[18px] border border-brand-100 bg-[#F5F8F6] p-4">
          <p className="font-bold text-[13px] text-brand-950">Resumo do turno</p>
          <div className="flex justify-between">
            <span className="text-[12px] text-text-secondary">Total bruto</span>
            <span className="font-semibold text-[12px] text-brand-950">{fmtBRL(TOTAL_TURNO)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[12px] text-text-secondary">Sangrias</span>
            <span className="font-semibold text-[12px] text-danger-700">- {fmtBRL(SANGRIAS)}</span>
          </div>
          <div className="flex justify-between border-brand-100 border-t pt-2">
            <span className="font-semibold text-[13px] text-brand-950">Total líquido</span>
            <span className="font-bold text-[13px] text-brand-950">
              {fmtBRL(TOTAL_TURNO - SANGRIAS)}
            </span>
          </div>
        </div>

        {/* Campo valor contado */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="modal-valor-contado" className="font-bold text-[12px] text-input-label">
            Valor contado em espécie (R$)
          </label>
          <div className="flex items-center gap-1 rounded-[14px] border border-input-border bg-input-bg px-4 py-3">
            <span className="select-none text-[14px] text-brand-950">R$</span>
            <input
              id="modal-valor-contado"
              type="text"
              inputMode="decimal"
              value={valorContado}
              onChange={(e) => setValorContado(e.target.value)}
              onFocus={(e) => e.target.select()}
              className="flex-1 bg-transparent text-[14px] text-brand-950 outline-none"
              placeholder="0,00"
            />
          </div>
          {erros.valor_contado && (
            <p className="text-[11px] text-danger-600">{erros.valor_contado[0]}</p>
          )}
        </div>

        {/* Diferença em tempo real */}
        <div className="flex items-center justify-between rounded-[14px] border border-brand-100 bg-[#FBFCFB] px-4 py-3">
          <span className="font-semibold text-[13px] text-brand-950">Diferença calculada</span>
          <span className={`font-bold text-[15px] ${DIFF_CLS[diffKey]}`}>{fmtDif(diff)}</span>
        </div>

        {/* Campo motivo — visível apenas quando |diff| > 50 (RN-09) */}
        {mostrMotivo && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="motivo-diferenca" className="font-bold text-[12px] text-input-label">
              Motivo da diferença <span className="text-danger-600">*</span>
            </label>
            <textarea
              id="motivo-diferenca"
              rows={3}
              value={motivoDiferenca}
              onChange={(e) => setMotivoDiferenca(e.target.value)}
              placeholder="Descreva o motivo da diferença (RN-09)"
              className="w-full resize-none rounded-[14px] border border-input-border bg-input-bg px-4 py-3 text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder focus:border-brand-700"
            />
            {erros.motivo_diferenca && (
              <p className="text-[11px] text-danger-600">{erros.motivo_diferenca[0]}</p>
            )}
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 flex-1 items-center justify-center rounded-[14px] border border-brand-200 font-bold text-[13px] text-brand-700 transition-colors hover:bg-brand-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={isLoading}
            className={`flex h-11 flex-1 items-center justify-center rounded-[14px] font-bold text-[13px] text-white transition-colors ${
              isLoading ? 'cursor-not-allowed bg-danger-300' : 'bg-danger-500 hover:bg-danger-600'
            }`}
          >
            {isLoading ? 'Fechando...' : 'Confirmar fechamento'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function FechamentoCaixaPage() {
  const navigate = useNavigate()
  const [contado, setContado] = useState('1.335,00')
  const [fecharOpen, setFecharOpen] = useState(false)
  const [isLoadingFechar, setIsLoadingFechar] = useState(false)
  const [caixaFechado, setCaixaFechado] = useState(false)
  const [protocolo, setProtocolo] = useState('')
  const [historicoOpen, setHistoricoOpen] = useState(false)

  const contadoNum = parseBRL(contado)
  const diferenca = contadoNum - ESPERADO_DINHEIRO
  const totalLiquido = TOTAL_TURNO - SANGRIAS
  const temDiferenca = Math.abs(diferenca) >= 0.01
  const diffKey: 'ok' | 'alerta' = Math.abs(diferenca) <= 0.01 ? 'ok' : 'alerta'

  const handleFecharCaixa = async (_data: FechamentoCaixa) => {
    setIsLoadingFechar(true)
    try {
      await new Promise((r) => setTimeout(r, 1200))
      // TODO: integrar com API — POST /api/v1/pdv/fechar
      setProtocolo(`FCX-${Date.now()}`)
      setCaixaFechado(true)
      setFecharOpen(false)
    } catch (err) {
      console.error('[handleFecharCaixa]', err)
    } finally {
      setIsLoadingFechar(false)
    }
  }

  // ── Estado: caixa encerrado ────────────────────────────────────────────
  if (caixaFechado) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <header className="flex items-center justify-between rounded-[24px] border border-brand-100 bg-white px-[22px] py-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-bold text-[24px] text-brand-950 leading-none">
              Fechamento de caixa — Caixa 03
            </h1>
            <p className="text-[13px] text-text-secondary">
              Turno: 08:00 → 18:00 · Operador: João Silva
            </p>
          </div>
          <span className="rounded-full bg-brand-75 px-3.5 py-2 font-semibold text-[12px] text-brand-700">
            Caixa encerrado
          </span>
        </header>

        <div className="flex flex-1 items-center justify-center rounded-[24px] border border-brand-100 bg-white">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-75">
              <span className="font-bold text-[28px] text-brand-700">✓</span>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-bold text-[22px] text-brand-950">Caixa encerrado com sucesso</p>
              <p className="text-[14px] text-text-secondary">
                Protocolo: <span className="font-semibold text-brand-700">{protocolo}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="flex h-11 items-center gap-2 rounded-[14px] border border-brand-200 px-6 font-bold text-[13px] text-brand-700 transition-colors hover:bg-brand-50"
              >
                Baixar Relatório Z
              </button>
              <button
                type="button"
                onClick={() => navigate('/pdv/abertura-caixa')}
                className="flex h-11 items-center gap-2 rounded-[14px] bg-brand-900 px-6 font-bold text-[13px] text-white transition-colors hover:bg-brand-800"
              >
                Novo turno
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Estado: turno em andamento ─────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Header */}
      <header className="flex items-center justify-between rounded-[24px] border border-brand-100 bg-white px-[22px] py-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-[24px] text-brand-950 leading-none">
            Fechamento de caixa — Caixa 03
          </h1>
          <p className="text-[13px] text-text-secondary">
            Turno: 08:00 → 18:00 · Operador: João Silva
          </p>
        </div>
        <span className="rounded-full bg-warning-50 px-3.5 py-2 font-semibold text-[12px] text-warning-900">
          Turno em andamento
        </span>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1 gap-4">
        {/* ── Coluna esquerda — Resumo do turno ─────────────────── */}
        <div className="flex flex-1 flex-col gap-4 rounded-[24px] border border-brand-100 bg-white p-5">
          <h2 className="font-bold text-[16px] text-brand-950">Resumo do turno</h2>

          {/* Tabela de conferência */}
          <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-[1fr_130px_130px_110px] gap-2 rounded-[10px] bg-[#F5F8F6] px-3 py-2">
              {['Forma', 'Esperado', 'Conferido', 'Diferença'].map((h) => (
                <span key={h} className="font-semibold text-[12px] text-brand-muted">
                  {h}
                </span>
              ))}
            </div>

            {/* Linha editável — Dinheiro */}
            <div className="grid grid-cols-[1fr_130px_130px_110px] items-center gap-2 rounded-[10px] bg-[#FBFCFB] px-3 py-2.5">
              <span className="font-medium text-[12px] text-brand-950">Dinheiro</span>
              <span className="font-medium text-[12px] text-brand-950">
                {fmtBRL(ESPERADO_DINHEIRO)}
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={contado}
                onChange={(e) => setContado(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-full rounded-[6px] border border-input-border bg-white px-2 py-1 font-medium text-[12px] text-brand-950 outline-none focus:border-brand-700"
              />
              <span className={`font-medium text-[12px] ${DIFF_CLS[diffKey]}`}>
                {fmtDif(diferenca)}
              </span>
            </div>

            {/* Linhas automáticas */}
            {AUTO_ROWS.map((row) => (
              <div
                key={row.forma}
                className="grid grid-cols-[1fr_130px_130px_110px] gap-2 rounded-[10px] px-3 py-2.5"
              >
                <span className="font-medium text-[12px] text-brand-muted">{row.forma}</span>
                <span className="font-medium text-[12px] text-brand-muted">{row.esperado}</span>
                <span className="font-medium text-[12px] text-brand-muted">automático</span>
                <span className="font-medium text-[12px] text-brand-muted">R$ 0,00</span>
              </div>
            ))}
          </div>

          <div className="h-px bg-brand-100" />

          {/* Totais */}
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-[16px] text-brand-950">
              Total do turno: {fmtBRL(TOTAL_TURNO)}
            </span>
            <span className="font-medium text-[13px] text-danger-muted">
              Sangrias: -{fmtBRL(SANGRIAS)}
            </span>
            <span className="font-bold text-[22px] text-brand-950">
              Total líquido: {fmtBRL(totalLiquido)}
            </span>
          </div>

          {/* Alerta de diferença */}
          {temDiferenca && (
            <div className="rounded-[14px] border border-warning-100 bg-warning-25 p-3">
              <span className="font-semibold text-[13px] text-warning-900">
                Diferença: {fmtDif(diferenca)}. Registre o motivo.
              </span>
            </div>
          )}
        </div>

        {/* ── Coluna direita — Ações ─────────────────────────────── */}
        <div className="flex w-[390px] shrink-0 flex-col gap-3.5">
          {/* Conferência de dinheiro */}
          <div className="flex flex-col gap-2.5 rounded-[24px] border border-brand-100 bg-white p-4">
            <span className="font-semibold text-[12px] text-text-secondary">
              Valor contado em espécie
            </span>
            <div className="flex h-12 items-center rounded-[10px] border border-input-border px-3.5">
              <span className="mr-1 select-none text-[13px] text-brand-950">R$</span>
              <input
                type="text"
                inputMode="decimal"
                value={contado}
                onChange={(e) => setContado(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="flex-1 bg-transparent text-[13px] text-brand-950 outline-none"
              />
            </div>
            <span className={`font-semibold text-[16px] ${DIFF_CLS[diffKey]}`}>
              Diferença: {fmtDif(diferenca)}
            </span>
          </div>

          {/* Sangria / Suprimento */}
          <div className="flex flex-col gap-2.5 rounded-[24px] border border-brand-100 bg-white p-4">
            <button
              type="button"
              className="flex h-10 items-center justify-center rounded-[10px] border border-brand-100 font-semibold text-[13px] text-text-secondary transition-colors hover:bg-brand-50"
            >
              Registrar sangria
            </button>
            <button
              type="button"
              className="flex h-10 items-center justify-center rounded-[10px] border border-brand-100 font-semibold text-[13px] text-text-secondary transition-colors hover:bg-brand-50"
            >
              Registrar suprimento
            </button>
            <span className="font-medium text-[11px] text-brand-muted">
              3 sangrias · total R$ 200,00
            </span>
          </div>

          {/* Ver histórico */}
          <button
            type="button"
            onClick={() => setHistoricoOpen(true)}
            className="flex h-9 items-center justify-center rounded-[10px] border border-brand-100 font-medium text-[12px] text-text-secondary transition-colors hover:bg-brand-50"
          >
            Ver histórico de caixa
          </button>

          {/* Fechar caixa */}
          <button
            type="button"
            onClick={() => setFecharOpen(true)}
            className="flex h-11 items-center justify-center rounded-[10px] bg-danger-500 font-bold text-[13px] text-white transition-colors hover:bg-danger-600"
          >
            Fechar caixa
          </button>

          <span className="text-center font-medium text-[11px] text-brand-muted">
            Esta ação encerra o turno e não pode ser desfeita.
          </span>
        </div>
      </div>

      {/* Modal histórico de caixa */}
      {historicoOpen && <ModalHistoricoCaixa onClose={() => setHistoricoOpen(false)} />}

      {/* Modal fechar caixa */}
      {fecharOpen && (
        <ModalFecharCaixa
          onClose={() => setFecharOpen(false)}
          onConfirmar={handleFecharCaixa}
          isLoading={isLoadingFechar}
          valorContadoInicial={contado}
        />
      )}
    </div>
  )
}
