import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type PaymentTab = 'dinheiro' | 'debito' | 'pix' | 'multiplos'

const SUBTOTAL = 50.9
const DESCONTO_PBM = 8.14
const TOTAL = SUBTOTAL - DESCONTO_PBM // 42.76

const ITEMS = [
  { produto: 'Dipirona 500mg', qty: 2, preco: 'R$ 8,90', total: 'R$ 17,80' },
  { produto: 'Omeprazol 20mg', qty: 1, preco: 'R$ 12,40', total: 'R$ 12,40' },
  { produto: 'Vitamina D3', qty: 3, preco: 'R$ 6,90', total: 'R$ 20,70' },
]

const TABS: { id: PaymentTab; label: string }[] = [
  { id: 'dinheiro', label: 'Dinheiro' },
  { id: 'debito', label: 'Débito/Crédito' },
  { id: 'pix', label: 'Pix' },
  { id: 'multiplos', label: 'Múltiplos' },
]

function fmtBRL(value: number) {
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

export function FinalizarVendaPage() {
  const [tab, setTab] = useState<PaymentTab>('dinheiro')
  const [recebido, setRecebido] = useState('50,00')
  const navigate = useNavigate()

  const recebidoNum = parseBRL(recebido)
  const troco = recebidoNum - TOTAL
  const trocoValido = troco >= 0

  function handleConfirmar() {
    // TODO: integrar com API
    navigate('/pdv?caixaAberto=true')
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Header */}
      <header className="flex items-center justify-between rounded-[24px] border border-brand-100 bg-white px-[22px] py-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-[24px] text-brand-950 leading-none">Finalizar venda</h1>
          <p className="text-[13px] text-text-secondary">
            Confira o resumo e selecione a forma de pagamento
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-[26px] items-center rounded-full bg-neutral-50 px-2.5 font-semibold text-[12px] text-neutral-500">
            Venda #00847
          </span>
          <span className="flex h-[26px] items-center rounded-full bg-brand-100 px-2.5 font-semibold text-[12px] text-neutral-500">
            Caixa 03
          </span>
        </div>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1 gap-6">
        {/* ── Coluna esquerda — Resumo da venda ───────────────── */}
        <div className="flex flex-1 flex-col gap-4 rounded-[24px] border border-brand-100 bg-white p-5">
          <h2 className="font-bold text-[14px] text-brand-950">Itens da venda</h2>

          {/* Tabela de itens */}
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-[1fr_44px_100px_100px] gap-2 rounded-[10px] bg-[#F5F8F6] px-3 py-2">
              {['Produto', 'Qtd', 'Preço unit.', 'Total'].map((h) => (
                <span key={h} className="font-semibold text-[12px] text-brand-muted">
                  {h}
                </span>
              ))}
            </div>
            {ITEMS.map((item) => (
              <div
                key={item.produto}
                className="grid grid-cols-[1fr_44px_100px_100px] gap-2 rounded-[10px] bg-[#FBFCFB] px-3 py-2.5"
              >
                <span className="font-medium text-[12px] text-brand-950">{item.produto}</span>
                <span className="font-medium text-[12px] text-brand-950">{item.qty}</span>
                <span className="font-medium text-[12px] text-brand-950">{item.preco}</span>
                <span className="font-medium text-[12px] text-brand-950">{item.total}</span>
              </div>
            ))}
          </div>

          {/* Divisor */}
          <div className="h-px bg-brand-100" />

          {/* Totais */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] text-brand-950">Subtotal: {fmtBRL(SUBTOTAL)}</span>
            <span className="font-semibold text-[13px] text-brand-500">
              Desconto PBM: -{fmtBRL(DESCONTO_PBM)}
            </span>
            <span className="text-[13px] text-brand-950">Desconto manual: R$ 0,00</span>
            <span className="font-bold text-[24px] text-brand-700 leading-none">
              TOTAL: {fmtBRL(TOTAL)}
            </span>
          </div>
        </div>

        {/* ── Coluna direita — Pagamento ───────────────────────── */}
        <div className="flex w-[460px] shrink-0 flex-col gap-4 rounded-[24px] border border-brand-100 bg-white p-5">
          <h2 className="font-bold text-[14px] text-brand-950">Forma de pagamento</h2>

          {/* Tabs */}
          <div className="flex gap-3.5 border-brand-100 border-b">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={[
                  'pb-2 font-medium text-[13px] transition-colors',
                  tab === t.id
                    ? 'border-brand-700 border-b-2 font-semibold text-brand-950'
                    : 'text-brand-muted hover:text-brand-950',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Conteúdo por tab */}
          {tab === 'dinheiro' && (
            <div className="flex flex-col gap-4">
              {/* Input valor recebido */}
              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-[12px] text-text-secondary">
                  Valor recebido
                </span>
                <div className="flex h-14 items-center rounded-[10px] border border-input-border px-3.5">
                  <span className="mr-1 select-none text-[13px] text-brand-950">R$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={recebido}
                    onChange={(e) => setRecebido(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 bg-transparent text-[13px] text-brand-950 outline-none"
                  />
                </div>
              </div>

              {/* Troco */}
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-[12px] text-text-secondary">Troco</span>
                <span
                  className={`font-bold text-[22px] leading-none ${trocoValido ? 'text-brand-500' : 'text-danger-500'}`}
                >
                  {trocoValido ? fmtBRL(troco) : '—'}
                </span>
              </div>
            </div>
          )}

          {tab === 'debito' && (
            <div className="flex flex-col gap-3">
              <div className="rounded-[12px] bg-brand-50 p-4">
                <p className="font-medium text-[13px] text-text-secondary">
                  Insira o cartão na maquininha TEF para processar o pagamento de{' '}
                  <span className="font-bold text-brand-950">{fmtBRL(TOTAL)}</span>.
                </p>
              </div>
            </div>
          )}

          {tab === 'pix' && (
            <div className="flex flex-col gap-3">
              <div className="rounded-[12px] bg-brand-50 p-4">
                <p className="font-medium text-[13px] text-text-secondary">
                  QR Code será exibido na tela do cliente. Valor:{' '}
                  <span className="font-bold text-brand-950">{fmtBRL(TOTAL)}</span>.
                </p>
              </div>
            </div>
          )}

          {tab === 'multiplos' && (
            <div className="flex flex-col gap-3">
              <div className="rounded-[12px] bg-brand-50 p-4">
                <p className="font-medium text-[13px] text-text-secondary">
                  Divida o pagamento entre múltiplas formas. Total restante:{' '}
                  <span className="font-bold text-brand-950">{fmtBRL(TOTAL)}</span>.
                </p>
              </div>
            </div>
          )}

          {/* Botão confirmar */}
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={tab === 'dinheiro' && !trocoValido}
            className="flex h-12 items-center justify-center rounded-[10px] bg-brand-700 font-bold text-[14px] text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Confirmar pagamento
          </button>

          {/* Cancelar */}
          <Link
            to="/pdv?caixaAberto=true"
            className="text-center font-semibold text-[13px] text-brand-700 hover:underline"
          >
            Cancelar venda
          </Link>

          {/* Card do cliente */}
          <div className="flex flex-col gap-1.5 rounded-[12px] bg-brand-50 p-3">
            <span className="font-medium text-[12px] text-text-secondary">
              Cliente: Maria Silva · CPF 123.456.789-00
            </span>
            <span className="font-semibold text-[12px] text-brand-700">
              Acumular pontos de fidelidade: ligado
            </span>
          </div>

          {/* Chips de status */}
          <div className="flex flex-wrap gap-2">
            <StatusChip label="● TEF conectado" active />
            <StatusChip label="● NFC-e pronta" active />
            <StatusChip label="● Não controlado" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusChip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <span
      className={[
        'flex h-6 items-center rounded-full px-2 font-semibold text-[11px]',
        active ? 'bg-brand-75 text-brand-750' : 'bg-neutral-50 text-neutral-500',
      ].join(' ')}
    >
      {label}
    </span>
  )
}
