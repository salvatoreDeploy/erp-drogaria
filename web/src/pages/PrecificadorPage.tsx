import { useMemo, useState } from 'react'
import type { ProdutoPrecificador } from '../schemas/precificador'

// --- MOCK ---

const PRODUTOS: ProdutoPrecificador[] = [
  {
    id: '1',
    nome: 'Losartana 50mg',
    laboratorio: 'EMS',
    apresentacao: '30 comp.',
    preco_custo: 8.4,
    preco_atual: 12.9,
    preco_sugerido: 14.7,
    margem_atual: 34.9,
    margem_minima: 45.0,
    margem_alvo: 55.0,
    status_margem: 'critico',
    giro_mensal: 120,
    concorrente_preco: 13.5,
  },
  {
    id: '2',
    nome: 'Omeprazol 20mg',
    laboratorio: 'Medley',
    apresentacao: '28 cap.',
    preco_custo: 6.2,
    preco_atual: 11.9,
    preco_sugerido: 12.4,
    margem_atual: 47.9,
    margem_minima: 45.0,
    margem_alvo: 55.0,
    status_margem: 'ok',
    giro_mensal: 98,
    concorrente_preco: 12.0,
  },
  {
    id: '3',
    nome: 'Metformina 850mg',
    laboratorio: 'Sandoz',
    apresentacao: '30 comp.',
    preco_custo: 5.1,
    preco_atual: 8.9,
    preco_sugerido: 11.2,
    margem_atual: 42.7,
    margem_minima: 45.0,
    margem_alvo: 55.0,
    status_margem: 'alerta',
    giro_mensal: 87,
    concorrente_preco: 9.2,
  },
  {
    id: '4',
    nome: 'Atorvastatina 20mg',
    laboratorio: 'Torrent',
    apresentacao: '30 comp.',
    preco_custo: 12.5,
    preco_atual: 19.9,
    preco_sugerido: 22.5,
    margem_atual: 37.2,
    margem_minima: 45.0,
    margem_alvo: 55.0,
    status_margem: 'critico',
    giro_mensal: 64,
    concorrente_preco: 20.5,
  },
  {
    id: '5',
    nome: 'Amoxicilina 500mg',
    laboratorio: 'Teuto',
    apresentacao: '15 caps.',
    preco_custo: 9.8,
    preco_atual: 18.4,
    preco_sugerido: 18.4,
    margem_atual: 46.7,
    margem_minima: 45.0,
    margem_alvo: 55.0,
    status_margem: 'ok',
    giro_mensal: 55,
    concorrente_preco: 18.9,
  },
  {
    id: '6',
    nome: 'Clonazepam 2mg',
    laboratorio: 'Roche',
    apresentacao: '30 comp.',
    preco_custo: 18.0,
    preco_atual: 28.9,
    preco_sugerido: 32.4,
    margem_atual: 37.7,
    margem_minima: 45.0,
    margem_alvo: 55.0,
    status_margem: 'critico',
    giro_mensal: 42,
  },
  {
    id: '7',
    nome: 'Dipirona 500mg',
    laboratorio: 'Farmasa',
    apresentacao: '10 comp.',
    preco_custo: 2.1,
    preco_atual: 4.5,
    preco_sugerido: 4.7,
    margem_atual: 53.3,
    margem_minima: 45.0,
    margem_alvo: 55.0,
    status_margem: 'ok',
    giro_mensal: 210,
  },
]

const STATUS_MARGEM_CFG = {
  ok: { label: '● OK', bg: 'bg-[#E1F5EE]', text: 'text-[#085041]' },
  alerta: { label: '⚠ Alerta', bg: 'bg-[#FFF7E0]', text: 'text-[#8B6914]' },
  critico: { label: '✗ Crítico', bg: 'bg-danger-50', text: 'text-danger-700' },
}

const CONCORRENTES = [
  { nome: 'Sua farmácia', margem: 38.4, preco_medio: 15.8, bg: 'bg-[#0E4D3B]', text: 'text-white' },
  {
    nome: 'Drogaria Sul',
    margem: 42.1,
    preco_medio: 16.2,
    bg: 'bg-[#E9F2EC]',
    text: 'text-[#163B32]',
  },
  {
    nome: 'Farmácia Bem',
    margem: 35.7,
    preco_medio: 14.9,
    bg: 'bg-[#F4F8F4]',
    text: 'text-[#566A63]',
  },
]

const FAIXAS_PRECO = [
  {
    label: 'Margem mínima (45%)',
    descricao: 'Piso operacional',
    bg: 'bg-[#EAF6EF]',
    border: 'border-[#C3DDD1]',
    valueKey: 'min' as const,
  },
  {
    label: 'Margem alvo (55%)',
    descricao: 'Preço recomendado',
    bg: 'bg-[#E1F5EE]',
    border: 'border-[#A8D5C4]',
    valueKey: 'alvo' as const,
  },
  {
    label: 'Margem agressiva (65%)',
    descricao: 'Máximo competitivo',
    bg: 'bg-[#F4F8F4]',
    border: 'border-[#D7E4DD]',
    valueKey: 'agres' as const,
  },
]

function calcPrecos(custo: number) {
  return {
    min: custo > 0 ? (custo / (1 - 0.45)).toFixed(2).replace('.', ',') : '—',
    alvo: custo > 0 ? (custo / (1 - 0.55)).toFixed(2).replace('.', ',') : '—',
    agres: custo > 0 ? (custo / (1 - 0.65)).toFixed(2).replace('.', ',') : '—',
  }
}

// --- PAGE ---

export function PrecificadorPage() {
  const [custo, setCusto] = useState('')
  const [produtoSel, setProdutoSel] = useState<string | null>(null)

  const precos = useMemo(() => calcPrecos(Number.parseFloat(custo.replace(',', '.')) || 0), [custo])

  const stats = useMemo(
    () => ({
      abaixoMinimo: PRODUTOS.filter((p) => p.status_margem !== 'ok').length,
      criticos: PRODUTOS.filter((p) => p.status_margem === 'critico').length,
      promoAtivas: 7,
      margemMedia: Number(
        (PRODUTOS.reduce((s, p) => s + p.margem_atual, 0) / PRODUTOS.length).toFixed(1)
      ),
      giroMedio: Number(
        (PRODUTOS.reduce((s, p) => s + p.giro_mensal, 0) / PRODUTOS.length).toFixed(1)
      ),
    }),
    []
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between rounded-[24px] border border-[#DCE7E1] bg-white px-6 py-5">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-[#163B32] text-[30px]">Precificador inteligente</h1>
          <p className="text-[#5A6B66] text-[14px]">
            Margens, faixas de preço e análise competitiva por produto
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Demo switcher */}
          <div className="flex items-center gap-1 rounded-[14px] border border-brand-100 bg-white px-2 py-1">
            {(['critico', 'normal'] as const).map((s) => (
              <button
                key={s}
                type="button"
                className="rounded-full px-2 py-0.5 font-mono text-[9px] text-brand-muted uppercase hover:bg-brand-50"
              >
                {s}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-[14px] border border-[#D7E4DD] bg-[#F4F8F4] px-4 font-bold text-[#163B32] text-[13px] hover:bg-[#eaf1ec]"
          >
            ↓ Exportar tabela
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: 'Margem média atual',
            value: `${stats.margemMedia}%`,
            sub: 'sobre todos os SKUs',
          },
          {
            label: 'SKUs abaixo do mínimo',
            value: `${stats.abaixoMinimo}`,
            sub: `${stats.criticos} críticos`,
          },
          { label: 'Promoções ativas', value: `${stats.promoAtivas}`, sub: 'até 31/05' },
          { label: 'Giro médio mensal', value: `${stats.giroMedio}`, sub: 'unid./produto/mês' },
        ].map((m) => (
          <div
            key={m.label}
            className="flex flex-col gap-1.5 rounded-[22px] border border-[#DCE7E1] bg-white p-[18px]"
          >
            <span className="text-[#566A63] text-[12px]">{m.label}</span>
            <span className="font-bold text-[#163B32] text-[26px] leading-none">{m.value}</span>
            <span className="text-[#8A9892] text-[11px]">{m.sub}</span>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 gap-5">
        {/* Left — 620px */}
        <div className="flex min-h-0 w-[620px] shrink-0 flex-col gap-4">
          {/* Calculadora de preço */}
          <div className="flex flex-col gap-4 rounded-[22px] border border-[#DCE7E1] bg-white p-[22px]">
            <p className="font-bold text-[#163B32] text-[16px]">Calculadora de faixas</p>
            <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
              <label htmlFor="preco-custo" className="font-bold text-[12px] text-input-label">
                Preço de custo (R$)
              </label>
              <input
                id="preco-custo"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={custo}
                onChange={(e) => setCusto(e.target.value)}
                className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
              />
            </div>

            <div className="flex flex-col gap-2">
              {FAIXAS_PRECO.map((f) => (
                <div
                  key={f.label}
                  className={`flex items-center justify-between rounded-[16px] border px-4 py-3 ${f.bg} ${f.border}`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-[#163B32] text-[13px]">{f.label}</span>
                    <span className="text-[#5A6B66] text-[11px]">{f.descricao}</span>
                  </div>
                  <span className="font-bold text-[#163B32] text-[18px]">
                    R$ {precos[f.valueKey]}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="flex h-10 flex-1 items-center justify-center rounded-[14px] bg-[#0E4D3B] font-bold text-[13px] text-white hover:bg-[#0a3d2f]"
              >
                Publicar preço sugerido
              </button>
              <button
                type="button"
                className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-[#D7E4DD] bg-[#F4F8F4] font-bold text-[#163B32] text-[13px] hover:bg-[#eaf1ec]"
              >
                Simular cenário
              </button>
            </div>
            {/* TODO: integrar com API — POST /api/v1/precificador/publicar */}
          </div>

          {/* Produtos com margem crítica */}
          <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-[22px] border border-[#DCE7E1] bg-white p-[22px]">
            <div className="flex items-center justify-between">
              <p className="font-bold text-[#163B32] text-[16px]">Produtos para revisão</p>
              <span className="rounded-full bg-danger-50 px-2.5 py-1 font-bold text-[11px] text-danger-700">
                {stats.criticos} críticos
              </span>
            </div>
            <div className="grid grid-cols-[1fr_68px_72px_72px_80px] rounded-[12px] bg-[#F5F8F6] px-3 py-2">
              {['Produto', 'Custo', 'Atual', 'Suger.', 'Status'].map((h) => (
                <span key={h} className="font-bold text-[#566A63] text-[11px]">
                  {h}
                </span>
              ))}
            </div>
            <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
              {PRODUTOS.filter((p) => p.status_margem !== 'ok').map((p) => {
                const cfg = STATUS_MARGEM_CFG[p.status_margem]
                const ativo = produtoSel === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProdutoSel(ativo ? null : p.id)}
                    className={[
                      'grid grid-cols-[1fr_68px_72px_72px_80px] items-center rounded-[16px] border px-3 py-2.5 text-left transition-colors',
                      ativo
                        ? 'border-[#0E4D3B] bg-[#E1F5EE]'
                        : 'border-[#F0E4D1] bg-[#FFFDF8] hover:bg-[#F4F8F4]',
                    ].join(' ')}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-[#163B32] text-[12px]">{p.nome}</span>
                      <span className="text-[#8A9892] text-[10px]">
                        {p.laboratorio} · {p.apresentacao}
                      </span>
                    </div>
                    <span className="text-[#566A63] text-[12px]">
                      R$ {p.preco_custo.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-[#163B32] text-[12px]">
                      R$ {p.preco_atual.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="font-bold text-[#0E4D3B] text-[12px]">
                      R$ {p.preco_sugerido.toFixed(2).replace('.', ',')}
                    </span>
                    <span
                      className={`w-fit rounded-full px-2 py-0.5 font-bold text-[10px] ${cfg.bg} ${cfg.text}`}
                    >
                      {cfg.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right — fill */}
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {/* Comparação com concorrentes */}
          <div className="flex flex-col gap-4 rounded-[22px] border border-[#DCE7E1] bg-white p-[22px]">
            <div className="flex items-center justify-between">
              <p className="font-bold text-[#163B32] text-[16px]">Sua farmácia vs Concorrentes</p>
              <span className="text-[#8A9892] text-[11px]">Atualizado hoje</span>
            </div>
            <div className="flex flex-col gap-2">
              {CONCORRENTES.map((c) => {
                const barW = Math.round((c.margem / 55) * 100)
                return (
                  <div
                    key={c.nome}
                    className={`flex flex-col gap-2 rounded-[16px] px-4 py-3 ${c.bg}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-[13px] ${c.text}`}>{c.nome}</span>
                      <span className={`font-bold text-[14px] ${c.text}`}>{c.margem}% margem</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/40">
                      <div
                        className="h-full rounded-full bg-white/80"
                        style={{ width: `${barW}%` }}
                      />
                    </div>
                    <span className={`text-[11px] ${c.text} opacity-80`}>
                      Preço médio: R$ {c.preco_medio.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-between rounded-[16px] bg-[#F4F8F4] px-4 py-3">
              <span className="text-[#5A6B66] text-[12px]">Posição no mercado local</span>
              <span className="font-bold text-[#163B32] text-[13px]">3.º lugar em margem</span>
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="flex flex-col gap-3 rounded-[22px] border border-[#DCE7E1] bg-white p-[22px]">
            <p className="font-bold text-[#163B32] text-[16px]">Ações rápidas</p>
            <div className="flex flex-col gap-2">
              {[
                {
                  label: 'Atualizar todos os críticos',
                  desc: `Aplicar margem alvo aos ${stats.criticos} SKUs críticos`,
                  primary: true,
                },
                {
                  label: 'Criar promoção por giro',
                  desc: 'Desconto por excesso de estoque parado',
                  primary: false,
                },
                {
                  label: 'Importar tabela de fornecedor',
                  desc: 'CSV com novos preços de custo + aplicar faixas',
                  primary: false,
                },
                {
                  label: 'Relatório de margem',
                  desc: 'Exportar PDF/Excel com análise completa',
                  primary: false,
                },
              ].map((a) => (
                <button
                  key={a.label}
                  type="button"
                  className={[
                    'flex flex-col gap-0.5 rounded-[16px] border px-4 py-3 text-left transition-colors',
                    a.primary
                      ? 'border-[#A8D5C4] bg-[#E1F5EE] hover:bg-[#d4eede]'
                      : 'border-[#E6ECE8] bg-[#F8FBF9] hover:bg-[#F0F4F2]',
                  ].join(' ')}
                >
                  <span
                    className={`font-bold text-[13px] ${a.primary ? 'text-[#085041]' : 'text-[#163B32]'}`}
                  >
                    {a.label}
                  </span>
                  <span className="text-[#5A6B66] text-[11px]">{a.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Produtos OK (resumo) */}
          <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-[22px] border border-[#DCE7E1] bg-white p-[22px]">
            <div className="flex items-center justify-between">
              <p className="font-bold text-[#163B32] text-[16px]">Margem adequada</p>
              <span className="rounded-full bg-[#E1F5EE] px-2.5 py-1 font-bold text-[#085041] text-[11px]">
                {PRODUTOS.filter((p) => p.status_margem === 'ok').length} SKUs
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
              {PRODUTOS.filter((p) => p.status_margem === 'ok').map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-[14px] bg-[#FBFCFB] px-3.5 py-2.5"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-[#163B32] text-[13px]">{p.nome}</span>
                    <span className="text-[#8A9892] text-[11px]">
                      {p.laboratorio} · giro {p.giro_mensal}/mês
                    </span>
                  </div>
                  <span className="font-bold text-[#085041] text-[13px]">
                    {p.margem_atual.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
            {/* TODO: integrar com API — GET /api/v1/precificador/produtos?status=ok */}
          </div>
        </div>
      </div>
    </div>
  )
}
