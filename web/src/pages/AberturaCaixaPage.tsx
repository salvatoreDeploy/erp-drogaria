import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ModalHistoricoCaixa } from '../components/pdv/ModalHistoricoCaixa'
import { Button, SelectItem, SelectList, SelectRoot, SelectTrigger } from '../components/ui'

type CaixaStatus = 'aberto' | 'fechado'

const CAIXAS = [
  {
    id: 'caixa02',
    label: 'Caixa 02 · Aberto · Ana',
    sub: 'desde 07:45',
    status: 'aberto' as CaixaStatus,
  },
  {
    id: 'caixa01',
    label: 'Caixa 01 · Fechado',
    sub: 'R$ 3.240,00 turno anterior',
    status: 'fechado' as CaixaStatus,
  },
]

function fmtDateTime(d: Date) {
  const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${date} · ${time}`
}

export function AberturaCaixaPage() {
  const [caixa, setCaixa] = useState('caixa01')
  const [fundo, setFundo] = useState('0,00')
  const [historicoOpen, setHistoricoOpen] = useState(false)
  const now = new Date()
  const navigate = useNavigate()

  function handleAbrir(e: React.FormEvent) {
    e.preventDefault()
    navigate('/pdv?caixaAberto=true')
  }

  return (
    <div className="flex gap-6">
      {/* ── Formulário de abertura ───────────────────────────── */}
      <div className="flex w-120 shrink-0 flex-col gap-4 rounded-[24px] border border-[#E2ECE6] bg-white p-8 pb-6">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-1">
          <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-brand-700">
            <span className="font-bold text-[24px] text-white leading-none" aria-hidden="true">
              $
            </span>
          </div>
          <h1 className="font-bold text-[22px] text-brand-950 leading-none">Abertura de caixa</h1>
          <p className="text-[#6D7F78] text-[13px]">Informe o valor inicial para iniciar o turno</p>
        </div>

        {/* Campos */}
        <form onSubmit={handleAbrir} className="flex flex-col gap-4">
          {/* Caixa */}
          <FormField label="Caixa">
            <SelectRoot value={caixa} onValueChange={(v) => setCaixa(v ?? 'caixa01')}>
              <SelectTrigger
                className="h-14 w-full rounded-[10px]"
                placeholder="Selecione o caixa"
              />
              <SelectList>
                <SelectItem value="caixa01">Caixa 01</SelectItem>
                <SelectItem value="caixa02">Caixa 02</SelectItem>
                <SelectItem value="caixa03">Caixa 03</SelectItem>
              </SelectList>
            </SelectRoot>
          </FormField>

          {/* Operador (somente leitura) */}
          <FormField label="Operador">
            <ReadOnlyField value="João Silva" />
          </FormField>

          {/* Data / Hora (somente leitura) */}
          <FormField label="Data / Hora">
            <ReadOnlyField value={fmtDateTime(now)} />
          </FormField>

          {/* Fundo de troco */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fundo-troco" className="font-semibold text-[#5A6B66] text-[12px]">
              Fundo de troco (R$)
            </label>
            <div className="flex h-14 items-center rounded-[10px] border-2 border-brand-700 px-3.5">
              <span className="mr-1 select-none text-[13px] text-brand-950">R$</span>
              <input
                id="fundo-troco"
                type="text"
                inputMode="decimal"
                value={fundo}
                onChange={(e) => setFundo(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="flex-1 bg-transparent text-[13px] text-brand-950 outline-none"
              />
            </div>
            <span className="font-medium text-[#7A8883] text-[11px]">
              Valor em espécie disponível no caixa
            </span>
          </div>

          <Button type="submit" className="mt-2 h-11 w-full rounded-[10px]">
            Abrir caixa e iniciar turno
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setHistoricoOpen(true)}
          className="text-center font-semibold text-[13px] text-brand-700 hover:underline"
        >
          Ver histórico de caixas
        </button>
      </div>

      {historicoOpen && <ModalHistoricoCaixa onClose={() => setHistoricoOpen(false)} />}

      {/* ── Status dos caixas ────────────────────────────────── */}
      <div className="flex w-92 shrink-0 flex-col gap-3">
        <p className="font-semibold text-[12px] text-brand-muted uppercase tracking-wider">
          Caixas da farmácia
        </p>
        {CAIXAS.map((c) => (
          <CaixaCard
            key={c.id}
            label={c.label}
            sub={c.sub}
            status={c.status}
            selected={caixa === c.id}
            onSelect={() => {
              if (c.status === 'fechado') setCaixa(c.id)
            }}
          />
        ))}
      </div>
    </div>
  )
}

/* ── sub-componentes internos ─────────────────────────────────────── */

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-semibold text-[#5A6B66] text-[12px]">{label}</span>
      {children}
    </div>
  )
}

function ReadOnlyField({ value }: { value: string }) {
  return (
    <div className="flex h-14 items-center rounded-[10px] bg-[#F2F4F2] px-3.5">
      <span className="text-[#88948F] text-[13px]">{value}</span>
    </div>
  )
}

function CaixaCard({
  label,
  sub,
  status,
  selected,
  onSelect,
}: {
  label: string
  sub: string
  status: CaixaStatus
  selected: boolean
  onSelect: () => void
}) {
  const isClickable = status === 'fechado'

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!isClickable}
      className={[
        'flex w-full flex-col gap-1.5 rounded-[14px] border bg-white p-3.5 text-left transition-colors',
        selected ? 'border-brand-700 ring-1 ring-brand-700/20' : 'border-[#E2ECE6]',
        isClickable && !selected ? 'cursor-pointer hover:border-brand-300' : '',
        !isClickable ? 'cursor-default' : '',
      ]
        .join(' ')
        .trim()}
    >
      <span className="font-bold text-[13px] text-brand-950">{label}</span>
      <span className="text-[#7A8883] text-[12px]">{sub}</span>
      {status === 'aberto' && (
        <span className="inline-flex h-5.5 items-center self-start rounded-full bg-brand-75 px-2.5 font-semibold text-[11px] text-brand-750">
          Aberto
        </span>
      )}
    </button>
  )
}
