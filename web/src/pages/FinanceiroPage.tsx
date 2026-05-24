import { useMemo, useState } from 'react'
import type {
  BaixaContaPagar,
  ContaPagar,
  ContaPagarStatus,
  FormasPagamento,
  NovaContaPagarForm,
} from '../schemas'
import { BaixaContaPagarSchema, NovaContaPagarFormSchema } from '../schemas'

// ── Helpers ───────────────────────────────────────────────────────────────────

const HOJE = new Date().toISOString().split('T')[0]

function fmtBRL(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDia(iso: string) {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

function getDow(iso: string) {
  return new Date(`${iso}T12:00:00`).getDay()
}

// ── Mock data — Contas a pagar ────────────────────────────────────────────────
// TODO: GET /api/v1/financeiro/contas-pagar?status=&fornecedor_id=&page=

const CONTAS_INICIAL: ContaPagar[] = [
  {
    id: 'c01',
    nfe_entrada_id: 'nfe-001',
    fornecedor_id: 'f1',
    fornecedor_nome: 'Pharma Sul',
    descricao: 'Compra medicamentos',
    valor: 482000,
    vencimento: '2026-05-05',
    status: 'atrasada',
  },
  {
    id: 'c02',
    nfe_entrada_id: 'nfe-002',
    fornecedor_id: 'f2',
    fornecedor_nome: 'Logística X',
    descricao: 'Frete entrada NF-e',
    valor: 38000,
    vencimento: '2026-05-10',
    status: 'aberta',
  },
  {
    id: 'c03',
    nfe_entrada_id: 'nfe-003',
    fornecedor_id: 'f3',
    fornecedor_nome: 'Energia CPFL',
    descricao: 'Conta de energia',
    valor: 124000,
    vencimento: '2026-05-15',
    status: 'aberta',
  },
  {
    id: 'c04',
    nfe_entrada_id: 'nfe-004',
    fornecedor_id: 'f4',
    fornecedor_nome: 'Aluguel',
    descricao: 'Ponto comercial',
    valor: 450000,
    vencimento: '2026-06-01',
    status: 'aberta',
  },
  {
    id: 'c05',
    nfe_entrada_id: 'nfe-005',
    fornecedor_id: 'f5',
    fornecedor_nome: 'Medley Farmacêutica',
    descricao: 'NF-e 88.234',
    valor: 345000,
    vencimento: '2026-06-17',
    status: 'aberta',
  },
  {
    id: 'c06',
    nfe_entrada_id: 'nfe-006',
    fornecedor_id: 'f1',
    fornecedor_nome: 'Plasma Sul Distribuição',
    descricao: 'NF-e 124.890',
    valor: 189000,
    vencimento: '2026-05-25',
    status: 'aberta',
  },
  {
    id: 'c07',
    nfe_entrada_id: 'nfe-007',
    fornecedor_id: 'f2',
    fornecedor_nome: 'Medley Farmacêutica',
    descricao: 'NF-e 87.100',
    valor: 210000,
    vencimento: '2026-05-15',
    status: 'atrasada',
  },
  {
    id: 'c08',
    nfe_entrada_id: 'nfe-008',
    fornecedor_id: 'f3',
    fornecedor_nome: 'EMS S/A',
    descricao: 'NF-e 43.500',
    valor: 123000,
    vencimento: '2026-05-11',
    status: 'atrasada',
  },
  {
    id: 'c09',
    nfe_entrada_id: 'nfe-009',
    fornecedor_id: 'f4',
    fornecedor_nome: 'Cristália Químicos',
    descricao: 'NF-e 75.200',
    valor: 450000,
    vencimento: '2026-05-03',
    status: 'atrasada',
  },
  {
    id: 'c10',
    nfe_entrada_id: 'nfe-010',
    fornecedor_id: 'f5',
    fornecedor_nome: 'Profarma Distribuidora',
    descricao: 'NF-e 98.200',
    valor: 78000,
    vencimento: '2026-05-17',
    status: 'aberta',
  },
  {
    id: 'c11',
    nfe_entrada_id: 'nfe-011',
    fornecedor_id: 'f1',
    fornecedor_nome: 'Plasma Sul Distribuição',
    descricao: 'NF-e 124.000',
    valor: 320000,
    vencimento: '2026-04-30',
    status: 'paga',
    paga_em: '2026-04-28T10:00:00Z',
    forma_pagamento: 'pix',
  },
  {
    id: 'c12',
    nfe_entrada_id: 'nfe-012',
    fornecedor_id: 'f2',
    fornecedor_nome: 'Medley Farmacêutica',
    descricao: 'NF-e 86.000',
    valor: 110000,
    vencimento: '2026-04-20',
    status: 'paga',
    paga_em: '2026-04-19T14:30:00Z',
    forma_pagamento: 'boleto',
  },
  {
    id: 'c13',
    nfe_entrada_id: 'nfe-013',
    fornecedor_id: 'f3',
    fornecedor_nome: 'EMS S/A',
    descricao: 'NF-e 42.000',
    valor: 280000,
    vencimento: '2026-04-15',
    status: 'paga',
    paga_em: '2026-04-14T09:00:00Z',
    forma_pagamento: 'debito',
  },
  {
    id: 'c14',
    nfe_entrada_id: 'nfe-014',
    fornecedor_id: 'f4',
    fornecedor_nome: 'Cristália Químicos',
    descricao: 'NF-e 74.000',
    valor: 1248000,
    vencimento: '2026-04-10',
    status: 'paga',
    paga_em: '2026-04-09T11:00:00Z',
    forma_pagamento: 'pix',
  },
  {
    id: 'c15',
    nfe_entrada_id: 'nfe-015',
    fornecedor_id: 'f5',
    fornecedor_nome: 'Profarma Distribuidora',
    descricao: 'NF-e 97.000',
    valor: 95000,
    vencimento: '2026-04-01',
    status: 'cancelada',
    observacao: 'NF-e cancelada por divergência.',
  },
]

// TODO: GET /api/v1/financeiro/contas-receber

type StatusReceber = 'atrasada' | 'pendente' | 'futuro'

const CONTAS_RECEBER: {
  id: string
  cliente: string
  origem: string
  vencimento: string
  valor: number
  status: StatusReceber
}[] = [
  {
    id: 'r01',
    cliente: 'Maria Silva',
    origem: 'Venda #00841',
    vencimento: '2026-04-29',
    valor: 8700,
    status: 'atrasada',
  },
  {
    id: 'r02',
    cliente: 'Conv. Unimed',
    origem: 'PBM março',
    vencimento: '2026-04-30',
    valor: 420000,
    status: 'atrasada',
  },
  {
    id: 'r03',
    cliente: 'João Santos',
    origem: 'Venda #00845',
    vencimento: '2026-05-05',
    valor: 14200,
    status: 'pendente',
  },
  {
    id: 'r04',
    cliente: 'Conv. Bradesco',
    origem: 'PBM abril',
    vencimento: '2026-05-15',
    valor: 380000,
    status: 'futuro',
  },
]

// TODO: GET /api/v1/financeiro/dre?mes=2026-05
// Seções da DRE — valores em centavos, calculados e verificados abaixo:
//   Receita líquida = 4.312.000 - 89.000 - 648.000 = 3.575.000
//   Lucro bruto     = 3.575.000 - 1.820.000          = 1.755.000
//   Res. operacional= 1.755.000 - 420.000 - 450.000 - 124.000 - 87.000 = 674.000
//   Lucro líquido   = 674.000 - 168.000               = 506.000

type DreRow = { label: string; valor: number }
type DreSection = {
  id: string
  title: string
  rows: DreRow[]
  total: DreRow & { highlight?: true }
}

const DRE_SECTIONS: DreSection[] = [
  {
    id: 's1',
    title: 'Receitas',
    rows: [
      { label: 'Receita bruta de vendas', valor: 4312000 },
      { label: '(-) Devoluções e cancelamentos', valor: -89000 },
      { label: '(-) Descontos PBM/convênio', valor: -648000 },
    ],
    total: { label: 'Receita líquida', valor: 3575000 },
  },
  {
    id: 's2',
    title: 'Custo das mercadorias',
    rows: [{ label: '(-) CMV — custo de mercadorias', valor: -1820000 }],
    total: { label: 'Lucro bruto', valor: 1755000 },
  },
  {
    id: 's3',
    title: 'Despesas operacionais',
    rows: [
      { label: '(-) Pessoal e encargos sociais', valor: -420000 },
      { label: '(-) Aluguel e ocupação', valor: -450000 },
      { label: '(-) Energia e utilidades', valor: -124000 },
      { label: '(-) Marketing e outros', valor: -87000 },
    ],
    total: { label: 'Resultado operacional', valor: 674000 },
  },
  {
    id: 's4',
    title: 'Resultado final',
    rows: [{ label: '(-) Impostos e taxas', valor: -168000 }],
    total: { label: 'Lucro líquido', valor: 506000, highlight: true },
  },
]

// ── Config tables ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<ContaPagarStatus, { label: string; bg: string; text: string }> = {
  aberta: { label: '● Em aberto', bg: 'bg-brand-75', text: 'text-brand-750' },
  atrasada: { label: '⚠ Atrasada', bg: 'bg-warning-50', text: 'text-warning-700' },
  paga: { label: '✓ Paga', bg: 'bg-brand-75', text: 'text-success-600' },
  cancelada: { label: '— Cancelada', bg: 'bg-neutral-50', text: 'text-neutral-500' },
}

const STATUS_RECEBER_CFG: Record<StatusReceber, { label: string; bg: string; text: string }> = {
  atrasada: { label: '✗ Em atraso', bg: 'bg-danger-50', text: 'text-danger-700' },
  pendente: { label: '● Pendente', bg: 'bg-brand-75', text: 'text-brand-750' },
  futuro: { label: '◌ Futuro', bg: 'bg-neutral-50', text: 'text-neutral-500' },
}

const FORMA_LABELS: Record<FormasPagamento, string> = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  boleto: 'Boleto',
  debito: 'Débito',
  credito: 'Crédito',
  cheque: 'Cheque',
}

const DOW_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// ── ModalBaixaContaPagar ──────────────────────────────────────────────────────

function ModalBaixaContaPagar({
  conta,
  onClose,
  onConfirmar,
}: {
  conta: ContaPagar
  onClose: () => void
  onConfirmar: (d: BaixaContaPagar) => void
}) {
  const [form, setForm] = useState<Partial<BaixaContaPagar>>({
    data_pagamento: HOJE,
    forma_pagamento: undefined,
    observacao: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof BaixaContaPagar, string>>>({})

  function handleConfirmar() {
    const r = BaixaContaPagarSchema.safeParse(form)
    if (!r.success) {
      const fe = r.error.flatten().fieldErrors
      setErrors({
        data_pagamento: fe.data_pagamento?.[0],
        forma_pagamento: fe.forma_pagamento?.[0],
      })
      return
    }
    onConfirmar(r.data)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar modal"
      />
      <div className="relative z-10 flex w-[480px] flex-col gap-5 rounded-[24px] bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-[18px] text-brand-950">Registrar pagamento</p>
            <p className="text-[12px] text-text-secondary">
              {conta.fornecedor_nome} · {fmtBRL(conta.valor)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-[13px] text-brand-600 hover:bg-brand-100"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
            <label htmlFor="baixa-data" className="font-bold text-[12px] text-input-label">
              Data do pagamento *
            </label>
            <input
              id="baixa-data"
              type="date"
              value={form.data_pagamento ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, data_pagamento: e.target.value }))}
              className="bg-transparent text-[14px] text-brand-950 outline-none"
            />
            {errors.data_pagamento && (
              <p className="text-[11px] text-danger-700">{errors.data_pagamento}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
            <label htmlFor="baixa-forma" className="font-bold text-[12px] text-input-label">
              Forma de pagamento *
            </label>
            <select
              id="baixa-forma"
              value={form.forma_pagamento ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, forma_pagamento: e.target.value as FormasPagamento }))
              }
              className="bg-transparent text-[14px] text-brand-950 outline-none"
            >
              <option value="">Selecione…</option>
              {(Object.entries(FORMA_LABELS) as [FormasPagamento, string][]).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            {errors.forma_pagamento && (
              <p className="text-[11px] text-danger-700">{errors.forma_pagamento}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
            <label htmlFor="baixa-obs" className="font-bold text-[12px] text-input-label">
              Observação
            </label>
            <textarea
              id="baixa-obs"
              value={form.observacao ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))}
              rows={2}
              className="resize-none bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
              placeholder="Opcional…"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-brand-200 font-bold text-[13px] text-brand-700 hover:bg-brand-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] bg-brand-900 font-bold text-[13px] text-white hover:bg-brand-800"
          >
            Confirmar pagamento
          </button>
        </div>
      </div>
    </div>
  )
}

// ── ModalNovaContaPagar ───────────────────────────────────────────────────────
// TODO: POST /api/v1/financeiro/contas-pagar

function ModalNovaContaPagar({
  onClose,
  onConfirmar,
}: {
  onClose: () => void
  onConfirmar: (f: NovaContaPagarForm) => void
}) {
  const [form, setForm] = useState<Record<string, string>>({
    fornecedor_nome: '',
    descricao: '',
    valor_reais: '',
    vencimento: '',
    observacao: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof NovaContaPagarForm, string>>>({})

  function handleSalvar() {
    const r = NovaContaPagarFormSchema.safeParse(form)
    if (!r.success) {
      const fe = r.error.flatten().fieldErrors
      setErrors({
        fornecedor_nome: fe.fornecedor_nome?.[0],
        valor_reais: fe.valor_reais?.[0],
        vencimento: fe.vencimento?.[0],
      })
      return
    }
    onConfirmar(r.data)
  }

  const F = {
    change: (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value })),
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar modal"
      />
      <div className="relative z-10 flex w-[520px] flex-col gap-5 rounded-[24px] bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-[18px] text-brand-950">Nova conta a pagar</p>
            <p className="text-[12px] text-text-secondary">
              Lançamento manual — sem vínculo com NF-e
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-[13px] text-brand-600 hover:bg-brand-100"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* Fornecedor */}
          <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
            <label htmlFor="nc-fornecedor" className="font-bold text-[12px] text-input-label">
              Fornecedor / credor *
            </label>
            <input
              id="nc-fornecedor"
              type="text"
              value={form.fornecedor_nome}
              onChange={F.change('fornecedor_nome')}
              placeholder="Nome do fornecedor"
              className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
            />
            {errors.fornecedor_nome && (
              <p className="text-[11px] text-danger-700">{errors.fornecedor_nome}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
            <label htmlFor="nc-desc" className="font-bold text-[12px] text-input-label">
              Descrição
            </label>
            <input
              id="nc-desc"
              type="text"
              value={form.descricao}
              onChange={F.change('descricao')}
              placeholder="Ex: Aluguel maio, conta de energia…"
              className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
            />
          </div>

          {/* Valor + Vencimento — 2 colunas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
              <label htmlFor="nc-valor" className="font-bold text-[12px] text-input-label">
                Valor (R$) *
              </label>
              <input
                id="nc-valor"
                type="number"
                step="0.01"
                min="0"
                value={form.valor_reais}
                onChange={F.change('valor_reais')}
                placeholder="0,00"
                className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
              />
              {errors.valor_reais && (
                <p className="text-[11px] text-danger-700">{errors.valor_reais}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
              <label htmlFor="nc-venc" className="font-bold text-[12px] text-input-label">
                Vencimento *
              </label>
              <input
                id="nc-venc"
                type="date"
                value={form.vencimento}
                onChange={F.change('vencimento')}
                className="bg-transparent text-[14px] text-brand-950 outline-none"
              />
              {errors.vencimento && (
                <p className="text-[11px] text-danger-700">{errors.vencimento}</p>
              )}
            </div>
          </div>

          {/* Observação */}
          <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
            <label htmlFor="nc-obs" className="font-bold text-[12px] text-input-label">
              Observação
            </label>
            <textarea
              id="nc-obs"
              value={form.observacao}
              onChange={F.change('observacao')}
              rows={2}
              className="resize-none bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
              placeholder="Opcional…"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-brand-200 font-bold text-[13px] text-brand-700 hover:bg-brand-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] bg-brand-900 font-bold text-[13px] text-white hover:bg-brand-800"
          >
            Salvar conta
          </button>
        </div>
      </div>
    </div>
  )
}

// ── FinanceiroPage ────────────────────────────────────────────────────────────

export function FinanceiroPage() {
  const [contas, setContas] = useState<ContaPagar[]>(CONTAS_INICIAL)
  const [baixaConta, setBaixaConta] = useState<ContaPagar | null>(null)
  const [novaContaOpen, setNovaContaOpen] = useState(false)

  // ── Stats derivados ────────────────────────────────────────────────────────
  // TODO: GET /api/v1/financeiro/resumo
  const stats = useMemo(() => {
    const abertas = contas.filter((c) => c.status === 'aberta')
    const atrasadas = contas.filter((c) => c.status === 'atrasada')
    return {
      totalAberto: [...abertas, ...atrasadas].reduce((s, c) => s + c.valor, 0),
      pendentes: abertas.length + atrasadas.length,
    }
  }, [contas])

  const contasAbertas = useMemo(
    () => contas.filter((c) => c.status === 'aberta' || c.status === 'atrasada'),
    [contas]
  )

  // ── Gráfico de fluxo de caixa — agrupado por dia da semana ──────────────
  // TODO: GET /api/v1/financeiro/fluxo-caixa?periodo=semana
  const chartData = useMemo(() => {
    return DOW_LABELS.map((label, dow) => {
      const saidas = contas
        .filter(
          (c) => (c.status === 'aberta' || c.status === 'atrasada') && getDow(c.vencimento) === dow
        )
        .reduce((s, c) => s + c.valor, 0)

      const entradas = CONTAS_RECEBER.filter((cr) => getDow(cr.vencimento) === dow).reduce(
        (s, cr) => s + cr.valor,
        0
      )

      return { label, saidas, entradas }
    })
  }, [contas])

  const maxBarVal = useMemo(
    () => Math.max(...chartData.flatMap((d) => [d.saidas, d.entradas]), 1),
    [chartData]
  )

  const todayDow = getDow(HOJE)

  function barPx(val: number, maxPx = 96): number {
    return val > 0 ? Math.max(Math.round((val / maxBarVal) * maxPx), 4) : 0
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleBaixa(data: BaixaContaPagar) {
    // TODO: POST /api/v1/financeiro/contas-pagar/{id}/baixar
    if (!baixaConta) return
    setContas((prev) =>
      prev.map((c) =>
        c.id === baixaConta.id
          ? {
              ...c,
              status: 'paga' as const,
              paga_em: new Date().toISOString(),
              forma_pagamento: data.forma_pagamento,
            }
          : c
      )
    )
    setBaixaConta(null)
  }

  function handleNovaConta(form: NovaContaPagarForm) {
    // TODO: POST /api/v1/financeiro/contas-pagar
    const nova: ContaPagar = {
      id: crypto.randomUUID(),
      fornecedor_id: crypto.randomUUID(),
      fornecedor_nome: form.fornecedor_nome,
      descricao: form.descricao,
      valor: Math.round(form.valor_reais * 100),
      vencimento: form.vencimento,
      status: form.vencimento < HOJE ? 'atrasada' : 'aberta',
      observacao: form.observacao,
    }
    setContas((prev) => [nova, ...prev])
    setNovaContaOpen(false)
  }

  const totalReceber = CONTAS_RECEBER.reduce((s, c) => s + c.valor, 0)
  const atrasadasReceber = CONTAS_RECEBER.filter((c) => c.status === 'atrasada').length
  const COLS = 'grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_70px_80px_84px]'

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between rounded-[18px] border border-brand-100 bg-white px-5.5 py-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-[22px] text-brand-950">Financeiro</h1>
          <p className="text-[13px] text-text-secondary">
            Contas a pagar, receber e fluxo de caixa
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 items-center rounded-full bg-[#F1F3F2] px-3">
            <span className="font-semibold text-[#5F5E5A] text-[12px]">Maio 2025</span>
          </div>
          <button
            type="button"
            className="flex h-10 items-center rounded-[10px] bg-brand-900 px-3.5 font-bold text-[13px] text-white hover:bg-brand-800"
          >
            Exportar
          </button>
        </div>
      </div>

      {/* ── 5 métricas ── */}
      <div className="grid grid-cols-5 gap-2">
        <div className="flex flex-col gap-1.5 rounded-[16px] border border-brand-100 bg-white p-3">
          <span className="font-semibold text-[12px] text-brand-muted">Receitas do mês</span>
          <span className="font-bold text-[20px] text-brand-950">R$ 48.240</span>
          <span className="font-semibold text-[11px] text-success-600">↑ 12% vs abril</span>
        </div>
        <div className="flex flex-col gap-1.5 rounded-[16px] border border-brand-100 bg-white p-3">
          <span className="font-semibold text-[12px] text-brand-muted">Despesas do mês</span>
          <span className="font-bold text-[20px] text-brand-950">R$ 31.680</span>
          <span className="font-semibold text-[11px] text-success-600">↓ 3% vs abril</span>
        </div>
        <div className="flex flex-col gap-1.5 rounded-[16px] border border-brand-100 bg-white p-3">
          <span className="font-semibold text-[12px] text-brand-muted">Lucro líquido</span>
          <span className="font-bold text-[20px] text-brand-950">R$ 16.560</span>
          <span className="font-semibold text-[11px] text-success-600">Margem 34%</span>
        </div>
        {/* m4 — design: bg #FFF8EE border #F3E2C5 */}
        <div className="flex flex-col gap-1.5 rounded-[16px] border border-[#F3E2C5] bg-[#FFF8EE] p-3">
          <span className="font-semibold text-[#7A5212] text-[12px]">Contas a pagar</span>
          <span className="font-bold text-[20px] text-brand-950">{fmtBRL(stats.totalAberto)}</span>
          <span className="font-semibold text-[11px] text-warning-700">
            {stats.pendentes} em aberto/atraso
          </span>
        </div>
        {/* m5 — design: bg #F2F7F4 border #DCE8E2 */}
        <div className="flex flex-col gap-1.5 rounded-[16px] border border-[#DCE8E2] bg-brand-25 p-3">
          <span className="font-semibold text-[12px] text-brand-muted">Contas a receber</span>
          <span className="font-bold text-[20px] text-brand-950">{fmtBRL(totalReceber)}</span>
          <span className="font-semibold text-[11px] text-success-600">
            {atrasadasReceber} em atraso
          </span>
        </div>
      </div>

      {/* ── Body: duas colunas ── */}
      <div className="flex min-h-0 flex-1 gap-4">
        {/* ── Coluna esquerda ── */}
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {/* cardContasPagar */}
          <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-[18px] border border-brand-100 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[14px] text-brand-950">Contas a pagar</span>
              <span className="flex h-6 items-center rounded-full bg-warning-50 px-2.5 font-bold text-[11px] text-warning-700">
                {stats.pendentes} pendentes
              </span>
            </div>

            <div className={`grid ${COLS} gap-2 rounded-[10px] bg-[#F5F8F6] px-3 py-2`}>
              {['Fornecedor', 'Descrição', 'Vencimento', 'Valor', 'Status'].map((h) => (
                <span key={h} className="font-semibold text-[11px] text-brand-muted">
                  {h}
                </span>
              ))}
            </div>

            <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
              {contasAbertas.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-[12px] text-text-secondary">
                  Nenhuma conta pendente
                </div>
              ) : (
                contasAbertas.map((conta) => {
                  const cfg = STATUS_CFG[conta.status]
                  return (
                    <button
                      key={conta.id}
                      type="button"
                      onClick={() => setBaixaConta(conta)}
                      className={`grid w-full ${COLS} gap-2 rounded-[10px] px-3 py-2 text-left transition-colors hover:bg-brand-25`}
                    >
                      <span
                        className={`truncate font-medium text-[11px] ${conta.status === 'atrasada' ? 'text-warning-700' : 'text-brand-950'}`}
                      >
                        {conta.fornecedor_nome}
                      </span>
                      <span
                        className={`truncate text-[11px] ${conta.status === 'atrasada' ? 'text-warning-700' : 'text-text-secondary'}`}
                      >
                        {conta.descricao ?? '—'}
                      </span>
                      <span
                        className={`font-medium text-[11px] ${conta.status === 'atrasada' ? 'text-warning-700' : 'text-brand-950'}`}
                      >
                        {fmtDia(conta.vencimento)}
                      </span>
                      <span
                        className={`font-bold text-[11px] ${conta.status === 'atrasada' ? 'text-warning-700' : 'text-brand-950'}`}
                      >
                        {fmtBRL(conta.valor)}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold text-[10px] ${cfg.bg} ${cfg.text}`}
                      >
                        {cfg.label}
                      </span>
                    </button>
                  )
                })
              )}
            </div>

            <div className="flex items-center justify-between border-brand-100 border-t pt-2">
              <span className="font-semibold text-[13px] text-brand-950">
                Total a pagar: {fmtBRL(contasAbertas.reduce((s, c) => s + c.valor, 0))}
              </span>
              <button
                type="button"
                onClick={() => setNovaContaOpen(true)}
                className="flex h-[34px] items-center rounded-[10px] border border-success-600 px-3 font-bold text-[12px] text-success-600 hover:bg-brand-25"
              >
                + Nova conta
              </button>
            </div>
          </div>

          {/* cardContasReceber */}
          <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-[18px] border border-brand-100 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[14px] text-brand-950">Contas a receber</span>
              <span className="flex h-6 items-center rounded-full bg-danger-50 px-2.5 font-bold text-[11px] text-danger-700">
                {atrasadasReceber} em atraso
              </span>
            </div>

            <div className={`grid ${COLS} gap-2 rounded-[10px] bg-[#F5F8F6] px-3 py-2`}>
              {['Cliente', 'Origem', 'Vencimento', 'Valor', 'Status'].map((h) => (
                <span key={h} className="font-semibold text-[11px] text-brand-muted">
                  {h}
                </span>
              ))}
            </div>

            <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
              {CONTAS_RECEBER.map((cr) => {
                const cfg = STATUS_RECEBER_CFG[cr.status]
                return (
                  <div key={cr.id} className={`grid ${COLS} gap-2 rounded-[10px] px-3 py-2`}>
                    <span
                      className={`truncate font-medium text-[11px] ${cr.status === 'atrasada' ? 'text-danger-700' : 'text-brand-950'}`}
                    >
                      {cr.cliente}
                    </span>
                    <span
                      className={`truncate text-[11px] ${cr.status === 'atrasada' ? 'text-danger-700' : 'text-text-secondary'}`}
                    >
                      {cr.origem}
                    </span>
                    <span
                      className={`font-medium text-[11px] ${cr.status === 'atrasada' ? 'text-danger-700' : 'text-brand-950'}`}
                    >
                      {fmtDia(cr.vencimento)}
                    </span>
                    <span
                      className={`font-bold text-[11px] ${cr.status === 'atrasada' ? 'text-danger-700' : 'text-brand-950'}`}
                    >
                      {fmtBRL(cr.valor)}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold text-[10px] ${cfg.bg} ${cfg.text}`}
                    >
                      {cfg.label}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="border-brand-100 border-t pt-2">
              <span className="font-semibold text-[13px] text-brand-950">
                Total a receber: {fmtBRL(totalReceber)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Coluna direita ── */}
        <div className="flex w-[428px] shrink-0 flex-col gap-4">
          {/* cardFluxo — gráfico dinâmico por dia da semana */}
          <div className="flex flex-1 flex-col gap-3 rounded-[18px] border border-brand-100 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[14px] text-brand-950">Fluxo de caixa — semanal</span>
              <span className="font-medium text-[11px] text-text-secondary">por dia da semana</span>
            </div>

            {/* Área do gráfico */}
            <div className="relative flex min-h-[140px] flex-1 items-end justify-around rounded-[12px] border border-brand-100 bg-input-bg px-3 pt-3 pb-5">
              {chartData.map((d, i) => {
                const entH = barPx(d.entradas)
                const saiH = barPx(d.saidas)
                const isToday = i === todayDow

                return (
                  /* group — tooltip via CSS hover, sem handler JS em div estático */
                  <div key={d.label} className="group relative flex flex-col items-center gap-1">
                    {/* Tooltip — visível no hover via group-hover */}
                    {(d.entradas > 0 || d.saidas > 0) && (
                      <div className="pointer-events-none absolute bottom-full z-20 mb-2 hidden w-[130px] flex-col gap-0.5 rounded-[10px] border border-brand-100 bg-white p-2 shadow-md group-hover:flex">
                        <p className="font-bold text-[10px] text-brand-muted">{d.label}</p>
                        {d.entradas > 0 && (
                          <p className="font-semibold text-[10px] text-success-600">
                            ↑ {fmtBRL(d.entradas)}
                          </p>
                        )}
                        {d.saidas > 0 && (
                          <p className="font-semibold text-[10px] text-warning-700">
                            ↓ {fmtBRL(d.saidas)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Duas barras: entrada (verde) + saída (vermelho) */}
                    <div className="flex h-[96px] items-end justify-center gap-1">
                      <div
                        className="w-3 rounded-t-[3px] transition-all"
                        style={{
                          height: entH || 2,
                          backgroundColor: entH > 0 ? '#BFE4D5' : '#E8F5EF',
                          opacity: entH > 0 ? 1 : 0.3,
                        }}
                      />
                      <div
                        className="w-3 rounded-t-[3px] transition-all"
                        style={{
                          height: saiH || 2,
                          backgroundColor: saiH > 0 ? '#F3D0D0' : '#F9EDED',
                          opacity: saiH > 0 ? 1 : 0.3,
                        }}
                      />
                    </div>

                    <span
                      className={`font-semibold text-[10px] ${isToday ? 'text-brand-950' : 'text-brand-muted'}`}
                    >
                      {d.label}
                    </span>
                    {isToday && <div className="h-1.5 w-1.5 rounded-full bg-brand-700" />}
                  </div>
                )
              })}
            </div>

            {/* Legenda + saldo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[#BFE4D5]" />
                  <span className="font-semibold text-[11px] text-text-secondary">Entradas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[#F3D0D0]" />
                  <span className="font-semibold text-[11px] text-text-secondary">Saídas</span>
                </div>
              </div>
              <span className="font-medium text-[10px] text-brand-muted">
                Passe o mouse nas barras
              </span>
            </div>

            <div className="rounded-[12px] border border-brand-100 bg-brand-25 px-3 py-2">
              <p className="font-medium text-[11px] text-brand-muted">Saldo projetado do período</p>
              <p className="font-bold text-[16px] text-success-600">
                {fmtBRL(chartData.reduce((s, d) => s + d.entradas - d.saidas, 0))}
              </p>
            </div>
          </div>

          {/* cardDRE — DRE completa com 4 seções */}
          <div className="flex flex-1 flex-col gap-0 rounded-[18px] border border-brand-100 bg-white">
            {/* Header fixo */}
            <div className="flex items-center justify-between border-brand-100 border-b px-4 py-3">
              <span className="font-bold text-[14px] text-brand-950">DRE resumido — abril</span>
              <span className="font-medium text-[11px] text-text-secondary">
                Demonstração do Resultado
              </span>
            </div>

            {/* Seções scrolláveis */}
            <div className="flex flex-1 flex-col overflow-y-auto px-4 py-3">
              {DRE_SECTIONS.map((sec, si) => (
                <div key={sec.id} className={si > 0 ? 'mt-4' : ''}>
                  {/* Título da seção */}
                  <p className="mb-1.5 font-bold text-[10px] text-brand-muted uppercase tracking-wide">
                    {sec.title}
                  </p>

                  {/* Linhas da seção */}
                  <div className="flex flex-col gap-1">
                    {sec.rows.map((row) => (
                      <div key={row.label} className="flex items-baseline justify-between gap-2">
                        <span className="text-[12px] text-text-secondary">{row.label}</span>
                        <span
                          className={`font-mono text-[12px] tabular-nums ${row.valor < 0 ? 'text-danger-700' : 'text-brand-950'}`}
                        >
                          {row.valor < 0 ? `(${fmtBRL(Math.abs(row.valor))})` : fmtBRL(row.valor)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total da seção */}
                  <div
                    className={[
                      'mt-1.5 flex items-baseline justify-between gap-2 rounded-[8px] px-2 py-1.5',
                      sec.total.highlight ? 'border border-brand-100 bg-brand-25' : 'bg-[#F5F8F6]',
                    ].join(' ')}
                  >
                    <span
                      className={`font-semibold text-[12px] ${sec.total.highlight ? 'text-success-600' : 'text-brand-950'}`}
                    >
                      {sec.total.label}
                    </span>
                    <span
                      className={`font-bold font-mono text-[13px] tabular-nums ${sec.total.highlight ? 'text-success-600' : 'text-brand-950'}`}
                    >
                      {fmtBRL(sec.total.valor)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modais */}
      {baixaConta && (
        <ModalBaixaContaPagar
          conta={baixaConta}
          onClose={() => setBaixaConta(null)}
          onConfirmar={handleBaixa}
        />
      )}
      {novaContaOpen && (
        <ModalNovaContaPagar
          onClose={() => setNovaContaOpen(false)}
          onConfirmar={handleNovaConta}
        />
      )}
    </div>
  )
}
