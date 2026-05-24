import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui'

type PaymentMethod = 'pix' | 'cartao' | 'dinheiro'
type LocState = { pbm_autorizacao_id?: string; receita_id?: string } | null

type CartItem = {
  id: number
  nome: string
  qty: number
  preco: string
  subtotal: string
  controlado: boolean
  receita_id: string | null
}

const CART_INICIAL: CartItem[] = [
  {
    id: 1,
    nome: 'Dipirona 500mg',
    qty: 2,
    preco: 'R$ 12,90',
    subtotal: 'R$ 25,80',
    controlado: false,
    receita_id: null,
  },
  {
    id: 2,
    nome: 'Fralda G 20 un',
    qty: 1,
    preco: 'R$ 44,90',
    subtotal: 'R$ 44,90',
    controlado: false,
    receita_id: null,
  },
  {
    id: 3,
    nome: 'Morfina 10mg',
    qty: 1,
    preco: 'R$ 24,90',
    subtotal: 'R$ 24,90',
    controlado: true,
    receita_id: null,
  },
  {
    id: 4,
    nome: 'Vitamina C 1g',
    qty: 1,
    preco: 'R$ 19,90',
    subtotal: 'R$ 19,90',
    controlado: false,
    receita_id: null,
  },
]

const CONVENIOS_PBM = [
  'Farmácia Popular',
  'Aqui Tem Farmácia',
  'Unimed',
  'SulAmérica',
  'Bradesco Saúde',
]

/* ── Modal PBM inline ─────────────────────────────────────────────── */

function ModalPbmInline({ item, onClose }: { item: CartItem; onClose: () => void }) {
  const [cpf, setCpf] = useState('')
  const [convenio, setConvenio] = useState('')
  const [consultado, setConsultado] = useState(false)
  const canConsultar = cpf.length >= 11 && convenio !== ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar modal"
      />
      <div className="relative z-10 flex w-[440px] flex-col gap-4 rounded-[28px] bg-white p-6 shadow-xl">
        <div>
          <h3 className="font-bold text-[18px] text-brand-950">Desconto PBM</h3>
          <p className="text-[13px] text-text-secondary">{item.nome}</p>
        </div>

        <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
          <label htmlFor="pbm-cpf" className="font-bold text-[12px] text-input-label">
            CPF do paciente
          </label>
          <input
            id="pbm-cpf"
            type="text"
            maxLength={14}
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="000.000.000-00"
            className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
          />
        </div>

        <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
          <label htmlFor="pbm-convenio" className="font-bold text-[12px] text-input-label">
            Convênio PBM
          </label>
          <select
            id="pbm-convenio"
            value={convenio}
            onChange={(e) => setConvenio(e.target.value)}
            className="bg-transparent text-[14px] text-brand-950 outline-none"
          >
            <option value="">Selecione o convênio</option>
            {CONVENIOS_PBM.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {consultado && (
          <div className="flex items-start gap-3 rounded-[18px] border border-brand-100 bg-brand-25 p-4">
            <span className="shrink-0 rounded-full bg-brand-75 px-3 py-1 font-bold text-[12px] text-success-600">
              ● Elegível
            </span>
            <div className="flex flex-1 flex-col gap-0.5">
              <p className="font-bold text-[14px] text-brand-950">45% de desconto autorizado</p>
              <p className="text-[12px] text-text-secondary">
                {/* TODO: integrar com API — POST /api/v1/pdv/validar-pbm-inline */}
                Desconto: R$ 8,60 · Autorização #PBM-2026-004812
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-brand-200 font-bold text-[13px] text-brand-700 transition-colors hover:bg-brand-50"
          >
            Cancelar
          </button>
          {consultado ? (
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 flex-1 items-center justify-center rounded-[14px] bg-brand-900 font-bold text-[13px] text-white transition-colors hover:bg-brand-800"
            >
              Aplicar desconto
            </button>
          ) : (
            <button
              type="button"
              disabled={!canConsultar}
              onClick={() => setConsultado(true)}
              className={[
                'flex h-10 flex-1 items-center justify-center rounded-[14px] font-bold text-[13px] transition-colors',
                canConsultar
                  ? 'bg-brand-900 text-white hover:bg-brand-800'
                  : 'cursor-not-allowed bg-brand-300 text-white',
              ].join(' ')}
            >
              Consultar PBM
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Modal Produto Controlado ─────────────────────────────────────── */

function ModalControladoInline({
  item,
  onVincular,
  onClose,
}: {
  item: CartItem
  onVincular: (receitaId: string) => void
  onClose: () => void
}) {
  const [cpf, setCpf] = useState('')
  const [receitaId, setReceitaId] = useState('')
  const [crm, setCrm] = useState('')
  const canSubmit = cpf.length >= 11 && receitaId !== '' && crm !== ''

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
          <h3 className="font-bold text-[18px] text-brand-950">Produto controlado</h3>
          <p className="text-[13px] text-text-secondary">{item.nome}</p>
        </div>

        <div className="flex items-start gap-3 rounded-[16px] border border-warning-100 bg-warning-50 px-4 py-3">
          <span className="shrink-0 font-bold text-[13px] text-warning-700">⚠</span>
          <p className="text-[12px] text-warning-700">
            Sujeito a controle especial (Portaria 344). Vincule a receita antes de finalizar — será
            registrado no SNGPC.
          </p>
        </div>

        <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
          <label htmlFor="ctrl-cpf" className="font-bold text-[12px] text-input-label">
            CPF do paciente
          </label>
          <input
            id="ctrl-cpf"
            type="text"
            maxLength={14}
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="000.000.000-00"
            className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
            <label htmlFor="ctrl-receita" className="font-bold text-[12px] text-input-label">
              N.º da receita
            </label>
            <input
              id="ctrl-receita"
              type="text"
              value={receitaId}
              onChange={(e) => setReceitaId(e.target.value)}
              placeholder="RX-2026-XXXXX"
              className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
            />
          </div>
          <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
            <label htmlFor="ctrl-crm" className="font-bold text-[12px] text-input-label">
              CRM do médico
            </label>
            <input
              id="ctrl-crm"
              type="text"
              value={crm}
              onChange={(e) => setCrm(e.target.value)}
              placeholder="CRM/SP 000000"
              className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-brand-200 font-bold text-[13px] text-brand-700 transition-colors hover:bg-brand-50"
          >
            Cancelar
          </button>
          {/* TODO: integrar com API — vincula com GET /api/v1/receita/{id} + gera SngpcLog */}
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => onVincular(receitaId)}
            className={[
              'flex h-10 flex-1 items-center justify-center rounded-[14px] font-bold text-[13px] transition-colors',
              canSubmit
                ? 'bg-brand-900 text-white hover:bg-brand-800'
                : 'cursor-not-allowed bg-brand-300 text-white',
            ].join(' ')}
          >
            Vincular receita
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────── */

export function PdvPage() {
  const location = useLocation()
  const locState = location.state as LocState
  const pbmId = locState?.pbm_autorizacao_id
  const receitaId = locState?.receita_id
  const [search, setSearch] = useState('')
  const [payment, setPayment] = useState<PaymentMethod>('pix')
  const [sangriaOpen, setSangriaOpen] = useState(false)
  const [suprimentoOpen, setSuprimentoOpen] = useState(false)
  const [pbmItem, setPbmItem] = useState<CartItem | null>(null)
  const [cart, setCart] = useState<CartItem[]>(CART_INICIAL)
  const [controladorItem, setControladorItem] = useState<CartItem | null>(null)
  const [searchParams] = useSearchParams()
  const caixaAberto = searchParams.get('caixaAberto') === 'true'
  const hasControlledUnlinked = cart.some((i) => i.controlado && !i.receita_id)

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Header */}
      <header className="flex items-center justify-between rounded-[24px] border border-brand-100 bg-white px-5.5 py-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-[26px] text-brand-950 leading-none">PDV rápido</h1>
          <p className="text-[13px] text-text-secondary">
            Venda com múltiplas formas de pagamento, PBM e Farmácia Popular.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {caixaAberto ? (
            <>
              <span className="rounded-full bg-brand-50 px-3.5 py-2.5 font-bold text-[12px] text-brand-900">
                Caixa 03
              </span>
              <span className="rounded-full bg-brand-900 px-3.5 py-2.5 font-bold text-[12px] text-white">
                Conectado ao TEF
              </span>
              <Link
                to="/pdv/fechamento-caixa"
                className="flex items-center gap-1.5 rounded-full border border-[#D2DDD8] bg-white px-3.5 py-2.5 font-bold text-[#5A6B66] text-[12px] transition-colors hover:bg-brand-50"
              >
                Fechar caixa →
              </Link>
            </>
          ) : (
            <>
              <span className="rounded-full bg-warning-50 px-3.5 py-2.5 font-bold text-[12px] text-warning-900">
                Caixa fechado
              </span>
              <Link
                to="/pdv/abertura-caixa"
                className="flex items-center gap-1.5 rounded-full bg-brand-700 px-3.5 py-2.5 font-bold text-[12px] text-white transition-colors hover:bg-brand-800"
              >
                Abrir caixa →
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Banners de contexto vindos de outras telas */}
      {caixaAberto && pbmId && (
        <div className="flex items-center justify-between rounded-[18px] border border-brand-100 bg-brand-25 px-[18px] py-3">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-success-600" />
            <p className="font-bold text-[13px] text-brand-700">
              Desconto PBM aplicado — Autorização #{pbmId}
            </p>
          </div>
          <span className="text-[12px] text-brand-muted">PBM / Farmácia Popular</span>
        </div>
      )}
      {caixaAberto && receitaId && (
        <div className="flex items-center justify-between rounded-[18px] border border-info-100 bg-info-50 px-[18px] py-3">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-info-600" />
            <p className="font-bold text-[13px] text-info-700">Receita #{receitaId} vinculada</p>
          </div>
          <span className="text-[12px] text-info-600">Receita digital</span>
        </div>
      )}

      {/* Body */}
      {caixaAberto ? (
        <div className="flex min-h-0 flex-1 gap-4">
          {/* ── Coluna esquerda ─────────────────────────────────── */}
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            {/* Busca */}
            <div className="flex gap-3 rounded-[24px] border border-brand-100 bg-white p-4.5">
              <div className="flex flex-1 items-center rounded-2xl border border-input-border bg-input-bg px-4 py-3.5">
                <input
                  type="text"
                  placeholder="Buscar por produto, EAN, lote ou cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-[14px] text-brand-900 outline-none placeholder:text-input-placeholder"
                />
              </div>
              <button
                type="button"
                className="flex items-center justify-center rounded-2xl bg-brand-900 px-4.5 py-3.5 font-bold text-[13px] text-white transition-colors hover:bg-brand-800"
              >
                Pesquisar
              </button>
            </div>

            {/* Itens da venda */}
            <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-[24px] border border-brand-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[18px] text-brand-950">Itens da venda</h2>
                <span className="text-[#6C8279] text-[12px]">Atalhos: F2 cliente, F4 desconto</span>
              </div>

              <div className="grid grid-cols-[1fr_44px_96px_96px_56px_80px] gap-2.5 rounded-xl bg-[#F5F8F6] px-3 py-2.5">
                {['Produto', 'Qtd', 'Preço', 'Subtotal', '% PBM', 'SNGPC'].map((h) => (
                  <span key={h} className="font-bold text-[12px] text-text-secondary">
                    {h}
                  </span>
                ))}
              </div>

              <div className="flex flex-col gap-2.5 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className={[
                      'grid grid-cols-[1fr_44px_96px_96px_56px_80px] items-center gap-2.5 rounded-2xl px-3 py-3.5',
                      item.controlado && !item.receita_id ? 'bg-warning-25' : 'bg-[#FBFCFB]',
                    ].join(' ')}
                  >
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate font-bold text-[13px] text-brand-950">
                        {item.nome}
                      </span>
                      {item.controlado && (
                        <span className="shrink-0 rounded-full bg-warning-50 px-1.5 py-0.5 font-bold text-[10px] text-warning-700">
                          Ctrl
                        </span>
                      )}
                    </div>
                    <span className="text-[13px] text-brand-950">{item.qty}</span>
                    <span className="text-[13px] text-brand-950">{item.preco}</span>
                    <span className="font-bold text-[13px] text-brand-900">{item.subtotal}</span>
                    <button
                      type="button"
                      onClick={() => setPbmItem(item)}
                      className="rounded-[8px] border border-brand-200 bg-white px-2 py-1 font-bold text-[11px] text-brand-700 transition-colors hover:bg-brand-50"
                    >
                      PBM
                    </button>
                    {item.controlado ? (
                      item.receita_id ? (
                        <span className="font-bold text-[11px] text-success-600">✓ Vinculado</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setControladorItem(item)}
                          className="rounded-[8px] border border-warning-100 bg-warning-50 px-2 py-1 font-bold text-[11px] text-warning-700 transition-colors hover:bg-warning-100"
                        >
                          Vincular
                        </button>
                      )
                    ) : (
                      <span />
                    )}
                  </div>
                ))}
              </div>

              {/* Operações de caixa */}
              <div className="flex gap-2 border-brand-100 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setSangriaOpen(true)}
                  className="flex h-8 flex-1 items-center justify-center rounded-[12px] border border-brand-100 font-bold text-[12px] text-brand-700 transition-colors hover:bg-brand-50"
                >
                  Sangria
                </button>
                <button
                  type="button"
                  onClick={() => setSuprimentoOpen(true)}
                  className="flex h-8 flex-1 items-center justify-center rounded-[12px] border border-brand-100 font-bold text-[12px] text-brand-700 transition-colors hover:bg-brand-50"
                >
                  Suprimento
                </button>
              </div>
            </div>

            {/* Atalhos de teclado */}
            <div className="grid grid-cols-3 gap-3">
              <ShortcutKey
                kbd="F9"
                label="Finalizar"
                bgClass="bg-[#EAF5EF]"
                kbdClass="text-brand-900"
                labelClass="text-[#456559]"
              />
              <ShortcutKey
                kbd="F6"
                label="Desconto"
                bgClass="bg-[#EEF3FB]"
                kbdClass="text-[#25406D]"
                labelClass="text-[#5B6F92]"
              />
              <ShortcutKey
                kbd="F2"
                label="Cliente"
                bgClass="bg-[#FFF3E7]"
                kbdClass="text-[#8A4B00]"
                labelClass="text-[#B26A13]"
              />
            </div>
          </div>

          {/* ── Coluna direita ──────────────────────────────────── */}
          <div className="flex w-97.5 shrink-0 flex-col gap-4">
            {/* Resumo e pagamento */}
            <div className="flex flex-col gap-2.5 rounded-[24px] border border-brand-100 bg-white p-3.5">
              <h2 className="font-bold text-[18px] text-brand-950">Resumo e pagamento</h2>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#6C8279] text-[13px]">Subtotal</span>
                  <span className="font-bold text-[13px] text-brand-950">R$ 116,10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6C8279] text-[13px]">Desconto PBM</span>
                  <span className="font-bold text-[13px] text-success-600">- R$ 18,50</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[16px] text-brand-950">Total</span>
                  <span className="font-bold text-[16px] text-brand-900">R$ 97,60</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 rounded-[18px] bg-input-bg p-4">
                <span className="font-bold text-[12px] text-text-secondary">
                  Forma de pagamento
                </span>
                <div className="flex gap-2">
                  {(['pix', 'cartao', 'dinheiro'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayment(m)}
                      className={
                        m === payment
                          ? 'flex-1 rounded-xl bg-brand-900 py-2.5 font-bold text-[12px] text-white'
                          : 'flex-1 rounded-xl border border-input-border bg-white py-2.5 font-bold text-[12px] text-brand-950 hover:bg-brand-50'
                      }
                    >
                      {m === 'pix' ? 'Pix' : m === 'cartao' ? 'Cartão' : 'Dinheiro'}
                    </button>
                  ))}
                </div>
              </div>

              {hasControlledUnlinked ? (
                <button
                  type="button"
                  disabled
                  className="flex w-full cursor-not-allowed items-center justify-center rounded-[18px] bg-brand-300 py-4 font-bold text-[14px] text-white"
                >
                  ⚠ Vincule a receita do controlado
                </button>
              ) : (
                <Link
                  to="/pdv/finalizar"
                  className="flex w-full items-center justify-center rounded-[18px] bg-brand-900 py-4 font-bold text-[14px] text-white transition-colors hover:bg-brand-800"
                >
                  Finalizar venda
                </Link>
              )}
            </div>

            {/* Integrações ativas */}
            <div className="flex flex-col gap-2.5 rounded-[24px] border border-brand-100 bg-white p-3.5">
              <h2 className="font-bold text-[18px] text-brand-950">Integrações ativas</h2>
              <div className="flex flex-col gap-2.5">
                <IntegrationRow name="WhatsApp" status="sincronizado" />
                <IntegrationRow name="PBM / Popular" status="online" />
                <IntegrationRow name="TEF / NFC-e" status="ok" />
              </div>
            </div>

            {/* Contexto da venda */}
            <div className="flex flex-col gap-2.5 rounded-[18px] border border-[#D8E4DD] bg-white p-3.5">
              <h2 className="font-bold text-[#12352B] text-[16px]">Contexto da venda</h2>
              <div className="flex gap-2">
                <ContextItem label="Cliente" value="Não identificado" valueClass="text-brand-950" />
                <ContextItem
                  label="Desconto"
                  value="Autorização pendente"
                  valueClass="text-[#A84A1A]"
                />
                <ContextItem label="Fiscal" value="Sincronizando" valueClass="text-[#2057A6]" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex max-w-xs flex-col items-center gap-5 text-center">
            <div className="flex size-16 items-center justify-center rounded-[20px] bg-brand-50">
              <span className="font-bold text-[32px] text-brand-300" aria-hidden="true">
                $
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-bold text-[20px] text-brand-950">Caixa não iniciado</h2>
              <p className="text-[14px] text-text-secondary leading-normal">
                Abra o caixa para começar a atender clientes e registrar vendas no turno.
              </p>
            </div>
            <Link to="/pdv/abertura-caixa">
              <Button>Abrir caixa agora</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Modais */}
      {pbmItem && <ModalPbmInline item={pbmItem} onClose={() => setPbmItem(null)} />}
      {controladorItem && (
        <ModalControladoInline
          item={controladorItem}
          onVincular={(rxId) => {
            setCart((prev) =>
              prev.map((i) => (i.id === controladorItem.id ? { ...i, receita_id: rxId } : i))
            )
            setControladorItem(null)
          }}
          onClose={() => setControladorItem(null)}
        />
      )}
      {sangriaOpen && (
        <ModalCaixa
          title="Sangria"
          labelValor="Valor retirado"
          labelComplemento="Motivo"
          idPrefix="sangria"
          onClose={() => setSangriaOpen(false)}
          onConfirm={() => setSangriaOpen(false)}
        />
      )}
      {suprimentoOpen && (
        <ModalCaixa
          title="Suprimento"
          labelValor="Valor depositado"
          labelComplemento="Origem"
          idPrefix="suprimento"
          onClose={() => setSuprimentoOpen(false)}
          onConfirm={() => setSuprimentoOpen(false)}
        />
      )}
    </div>
  )
}

/* ── sub-componentes internos ─────────────────────────────────────── */

function ShortcutKey({
  kbd,
  label,
  bgClass,
  kbdClass,
  labelClass,
}: {
  kbd: string
  label: string
  bgClass: string
  kbdClass: string
  labelClass: string
}) {
  return (
    <div className={`flex flex-col gap-1.5 rounded-[18px] p-3.5 ${bgClass}`}>
      <span className={`font-bold text-[16px] leading-none ${kbdClass}`}>{kbd}</span>
      <span className={`text-[12px] leading-none ${labelClass}`}>{label}</span>
    </div>
  )
}

function IntegrationRow({ name, status }: { name: string; status: string }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] bg-[#F7FBF9] px-3 py-3">
      <span className="font-bold text-[13px] text-brand-950">{name}</span>
      <span className="text-[12px] text-success-600">{status}</span>
    </div>
  )
}

function ContextItem({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass: string
}) {
  return (
    <div className="flex flex-1 flex-col gap-0.5 rounded-xl border border-[#E6ECE8] bg-[#F8FBF9] p-2.5">
      <span className="font-bold text-[#5A6B66] text-[11px]">{label}</span>
      <span className={`font-bold text-[13px] ${valueClass}`}>{value}</span>
    </div>
  )
}

function ModalCaixa({
  title,
  labelValor,
  labelComplemento,
  idPrefix,
  onClose,
  onConfirm,
}: {
  title: string
  labelValor: string
  labelComplemento: string
  idPrefix: string
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar modal"
      />
      <div className="relative z-10 flex w-[400px] flex-col gap-4 rounded-[28px] bg-white p-6 shadow-xl">
        <h3 className="font-bold text-[18px] text-brand-950">{title}</h3>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
            <label htmlFor={`${idPrefix}-valor`} className="font-bold text-[12px] text-input-label">
              {labelValor}
            </label>
            <input
              id={`${idPrefix}-valor`}
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
            />
          </div>
          <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
            <label
              htmlFor={`${idPrefix}-complemento`}
              className="font-bold text-[12px] text-input-label"
            >
              {labelComplemento}
            </label>
            <input
              id={`${idPrefix}-complemento`}
              type="text"
              placeholder="Descreva brevemente..."
              className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-brand-200 font-bold text-[13px] text-brand-700"
          >
            Cancelar
          </button>
          {/* TODO: integrar com API — POST /api/v1/pdv/sangria ou /api/v1/pdv/suprimento */}
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] bg-brand-900 font-bold text-[13px] text-white"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
