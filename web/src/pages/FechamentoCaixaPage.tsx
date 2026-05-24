import { useState } from 'react'

const ESPERADO_DINHEIRO = 1340
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

const AUTO_ROWS = [
  { forma: 'Débito', esperado: 'R$ 1.200,00' },
  { forma: 'Crédito', esperado: 'R$ 1.560,00' },
  { forma: 'Pix', esperado: 'R$ 900,00' },
  { forma: 'PBM', esperado: 'R$ 320,00' },
]

export function FechamentoCaixaPage() {
  const [contado, setContado] = useState('1.335,00')

  const contadoNum = parseBRL(contado)
  const diferenca = contadoNum - ESPERADO_DINHEIRO
  const totalLiquido = TOTAL_TURNO - SANGRIAS
  const temDiferenca = Math.abs(diferenca) >= 0.01

  const fmtDif = (n: number) => (n === 0 ? 'R$ 0,00' : (n > 0 ? '+' : '') + fmtBRL(n))

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
            {/* Cabeçalho */}
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
              <span className="font-medium text-[12px] text-brand-950">R$ 1.340,00</span>
              <input
                type="text"
                inputMode="decimal"
                value={contado}
                onChange={(e) => setContado(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-full rounded-[6px] border border-input-border bg-white px-2 py-1 font-medium text-[12px] text-brand-950 outline-none focus:border-brand-700"
              />
              <span
                className={`font-medium text-[12px] ${temDiferenca ? 'text-danger-muted' : 'text-brand-muted'}`}
              >
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

          {/* Divisor */}
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
            <span className="font-semibold text-[16px] text-brand-950">
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

          {/* Fechar caixa */}
          <button
            type="button"
            className="flex h-11 items-center justify-center rounded-[10px] bg-danger-500 font-bold text-[13px] text-white transition-colors hover:bg-danger-600"
          >
            Fechar caixa
          </button>

          <span className="text-center font-medium text-[11px] text-brand-muted">
            Esta ação encerra o turno e não pode ser desfeita.
          </span>
        </div>
      </div>
    </div>
  )
}
