import { useMemo, useState } from 'react'
import {
  type CampanhaFidelizacao,
  NovaCampanhaFidelizacaoSchema,
  type TransacaoPontos,
} from '../schemas/fidelizacao'

// --- MOCK ---

const SEGMENTOS = [
  {
    id: 'bronze',
    label: 'Bronze',
    count: 4120,
    bg: 'bg-[#F0EDE8]',
    text: 'text-[#7A5212]',
    border: 'border-[#D4C5B4]',
  },
  {
    id: 'prata',
    label: 'Prata',
    count: 2641,
    bg: 'bg-[#E8EEF2]',
    text: 'text-[#3A4F5E]',
    border: 'border-[#B8CCDA]',
  },
  {
    id: 'ouro',
    label: 'Ouro',
    count: 1012,
    bg: 'bg-[#FFF7E0]',
    text: 'text-[#8B6914]',
    border: 'border-[#F4D29C]',
  },
  {
    id: 'diamante',
    label: 'Diamante',
    count: 639,
    bg: 'bg-[#E1F5EE]',
    text: 'text-[#085041]',
    border: 'border-[#A8D5C4]',
  },
] as const

const TOP_CLIENTES = [
  { nome: 'Ana Oliveira', segmento: 'diamante', pontos: 5240, ultimaVisita: '19/05' },
  { nome: 'Carlos Mendes', segmento: 'diamante', pontos: 4890, ultimaVisita: '18/05' },
  { nome: 'Fernanda Lima', segmento: 'ouro', pontos: 2760, ultimaVisita: '16/05' },
  { nome: 'Roberto Silva', segmento: 'ouro', pontos: 2340, ultimaVisita: '15/05' },
  { nome: 'Lucia Costa', segmento: 'prata', pontos: 1180, ultimaVisita: '14/05' },
]

const CAMPANHAS: CampanhaFidelizacao[] = [
  {
    id: '1',
    nome: 'Pontos em dobro – Maio',
    tipo: 'pontos_dobro',
    inicio: '2026-05-01',
    fim: '2026-05-31',
    status: 'ativa',
    clientes_atingidos: 3421,
  },
  {
    id: '2',
    nome: 'Cupom aniversariantes',
    tipo: 'cupom',
    desconto_percentual: 15,
    inicio: '2026-05-01',
    fim: '2026-05-31',
    status: 'ativa',
    clientes_atingidos: 842,
  },
  {
    id: '3',
    nome: 'Desconto Ouro – Vitaminas',
    tipo: 'desconto_segmento',
    segmento_alvo: 'ouro',
    desconto_percentual: 20,
    inicio: '2026-04-01',
    fim: '2026-04-30',
    status: 'encerrada',
    clientes_atingidos: 1012,
  },
]

const TRANSACOES: TransacaoPontos[] = [
  {
    id: '1',
    cliente_id: 'c1',
    cliente_nome: 'Ana Oliveira',
    tipo: 'credito',
    pontos: 120,
    valor_compra: 240.0,
    data: '19/05 14:32',
    descricao: 'Compra no PDV',
  },
  {
    id: '2',
    cliente_id: 'c2',
    cliente_nome: 'Carlos Mendes',
    tipo: 'resgate',
    pontos: -500,
    data: '19/05 11:10',
    descricao: 'Resgate de pontos',
  },
  {
    id: '3',
    cliente_id: 'c3',
    cliente_nome: 'Fernanda Lima',
    tipo: 'credito',
    pontos: 85,
    valor_compra: 170.0,
    data: '18/05 16:45',
    descricao: 'Compra no PDV',
  },
  {
    id: '4',
    cliente_id: 'c4',
    cliente_nome: 'Roberto Silva',
    tipo: 'expiracao',
    pontos: -200,
    data: '17/05 00:00',
    descricao: 'Pontos expirados',
  },
  {
    id: '5',
    cliente_id: 'c5',
    cliente_nome: 'Lucia Costa',
    tipo: 'credito',
    pontos: 60,
    valor_compra: 120.0,
    data: '17/05 09:20',
    descricao: 'Compra no PDV',
  },
]

const SEG_CFG: Record<string, { bg: string; text: string; border: string }> = {
  bronze: { bg: 'bg-[#F0EDE8]', text: 'text-[#7A5212]', border: 'border-[#D4C5B4]' },
  prata: { bg: 'bg-[#E8EEF2]', text: 'text-[#3A4F5E]', border: 'border-[#B8CCDA]' },
  ouro: { bg: 'bg-[#FFF7E0]', text: 'text-[#8B6914]', border: 'border-[#F4D29C]' },
  diamante: { bg: 'bg-[#E1F5EE]', text: 'text-[#085041]', border: 'border-[#A8D5C4]' },
}

const TRANS_CFG: Record<string, { text: string }> = {
  credito: { text: 'text-[#085041]' },
  resgate: { text: 'text-danger-600' },
  expiracao: { text: 'text-[#9B3D2E]' },
}

const CAMPANHA_STATUS_CFG = {
  ativa: { label: '● Ativa', cls: 'bg-[#E1F5EE] text-[#085041]' },
  agendada: { label: '◷ Agendada', cls: 'bg-[#FFF7E0] text-[#8B6914]' },
  encerrada: { label: '○ Encerrada', cls: 'bg-[#F0F4F2] text-[#566A63]' },
}

// --- MODAL ---

function ModalNovaCampanha({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ nome: '', tipo: 'cupom', inicio: '', fim: '' })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [salvo, setSalvo] = useState(false)

  function handleSalvar() {
    const result = NovaCampanhaFidelizacaoSchema.safeParse({
      ...form,
      status: 'agendada',
      clientes_atingidos: 0,
    })
    if (!result.success) {
      const fe = result.error.flatten().fieldErrors
      setErrors(Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v ?? []])))
      return
    }
    setSalvo(true)
    setTimeout(onClose, 800)
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
        <div className="flex items-center justify-between">
          <p className="font-bold text-[#12352B] text-[18px]">Nova campanha</p>
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
            <label htmlFor="camp-nome" className="font-bold text-[12px] text-input-label">
              Nome da campanha
            </label>
            <input
              id="camp-nome"
              type="text"
              placeholder="Ex.: Pontos em dobro – Junho"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
            />
          </div>
          {errors.nome && <p className="text-[11px] text-danger-600">{errors.nome[0]}</p>}

          <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
            <label htmlFor="camp-tipo" className="font-bold text-[12px] text-input-label">
              Tipo
            </label>
            <select
              id="camp-tipo"
              value={form.tipo}
              onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
              className="bg-transparent text-[14px] text-brand-950 outline-none"
            >
              <option value="cupom">Cupom de desconto</option>
              <option value="pontos_dobro">Pontos em dobro</option>
              <option value="desconto_segmento">Desconto por segmento</option>
              <option value="aniversario">Aniversário</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
              <label htmlFor="camp-inicio" className="font-bold text-[12px] text-input-label">
                Início
              </label>
              <input
                id="camp-inicio"
                type="date"
                value={form.inicio}
                onChange={(e) => setForm((f) => ({ ...f, inicio: e.target.value }))}
                className="bg-transparent text-[14px] text-brand-950 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
              <label htmlFor="camp-fim" className="font-bold text-[12px] text-input-label">
                Fim
              </label>
              <input
                id="camp-fim"
                type="date"
                value={form.fim}
                onChange={(e) => setForm((f) => ({ ...f, fim: e.target.value }))}
                className="bg-transparent text-[14px] text-brand-950 outline-none"
              />
            </div>
          </div>
          {errors.inicio && <p className="text-[11px] text-danger-600">{errors.inicio[0]}</p>}
        </div>

        {salvo && (
          <p className="text-center font-bold text-[#085041] text-[13px]">
            ✓ Campanha criada com sucesso!
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-brand-200 font-bold text-[13px] text-brand-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] bg-[#0E4D3B] font-bold text-[13px] text-white hover:bg-[#0a3d2f]"
          >
            Criar campanha
          </button>
        </div>
      </div>
    </div>
  )
}

// --- PAGE ---

export function FidelizacaoPage() {
  const [novaCampanhaOpen, setNovaCampanhaOpen] = useState(false)

  const totalClientes = useMemo(() => SEGMENTOS.reduce((s, r) => s + r.count, 0), [])
  const maxCount = useMemo(() => Math.max(...SEGMENTOS.map((s) => s.count)), [])

  const campanhasAtivas = useMemo(() => CAMPANHAS.filter((c) => c.status === 'ativa').length, [])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between rounded-[24px] border border-[#DCE7E1] bg-white px-6 py-5">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-[#163B32] text-[30px]">Fidelização de clientes</h1>
          <p className="text-[#5A6B66] text-[14px]">
            Programa de pontos, segmentos e campanhas de relacionamento
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[#A8D5C4] bg-[#E1F5EE] px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-[#0E4D3B]" />
            <span className="font-bold text-[#085041] text-[12px]">Programa ativo</span>
          </div>
          <button
            type="button"
            onClick={() => setNovaCampanhaOpen(true)}
            className="flex h-10 items-center gap-2 rounded-[14px] bg-[#0E4D3B] px-4 font-bold text-[13px] text-white hover:bg-[#0a3d2f]"
          >
            + Nova campanha
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Clientes fidelizados', value: '8.412', sub: '+124 este mês' },
          { label: 'Elegíveis desconto', value: '72%', sub: '6.057 clientes' },
          { label: 'Ticket médio pontuado', value: 'R$ 18,40', sub: 'pontos/compra' },
          { label: 'Frequência mensal', value: '3,2×', sub: 'visitas/cliente' },
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
          {/* Pontuação por segmento */}
          <div className="flex flex-col gap-4 rounded-[22px] border border-[#DCE7E1] bg-white p-[22px]">
            <p className="font-bold text-[#163B32] text-[16px]">Pontuação por segmento</p>
            <div className="flex flex-col gap-4">
              {SEGMENTOS.map((seg) => {
                const pct = Math.round((seg.count / totalClientes) * 100)
                const barPct = Math.round((seg.count / maxCount) * 100)
                const cfg = SEG_CFG[seg.id]
                return (
                  <div key={seg.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 font-bold text-[11px] ${cfg.bg} ${cfg.text} ${cfg.border}`}
                        >
                          {seg.label}
                        </span>
                        <span className="text-[#5A6B66] text-[12px]">
                          {seg.count.toLocaleString('pt-BR')} clientes
                        </span>
                      </div>
                      <span className="font-bold text-[#163B32] text-[12px]">{pct}%</span>
                    </div>
                    <div className="h-4 w-full overflow-hidden rounded-full bg-[#E9F2EC]">
                      <div
                        className="h-full rounded-full bg-[#0E4D3B] transition-all"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-between rounded-[14px] bg-[#F4F8F4] px-4 py-2.5">
              <span className="text-[#5A6B66] text-[12px]">Total no programa</span>
              <span className="font-bold text-[#163B32] text-[14px]">
                {totalClientes.toLocaleString('pt-BR')} clientes
              </span>
            </div>
          </div>

          {/* Top clientes */}
          <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-[22px] border border-[#DCE7E1] bg-white p-[22px]">
            <div className="flex items-center justify-between">
              <p className="font-bold text-[#163B32] text-[16px]">Top clientes</p>
              <span className="text-[#8A9892] text-[12px]">Por pontuação acumulada</span>
            </div>
            <div className="grid grid-cols-[1fr_100px_80px_56px] rounded-[12px] bg-[#F5F8F6] px-3 py-2">
              {['Cliente', 'Segmento', 'Pontos', 'Visita'].map((h) => (
                <span key={h} className="font-bold text-[#566A63] text-[11px]">
                  {h}
                </span>
              ))}
            </div>
            <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
              {TOP_CLIENTES.map((c) => {
                const cfg = SEG_CFG[c.segmento]
                return (
                  <div
                    key={c.nome}
                    className="grid grid-cols-[1fr_100px_80px_56px] items-center rounded-[14px] bg-[#FBFCFB] px-3 py-2.5"
                  >
                    <span className="font-medium text-[#163B32] text-[13px]">{c.nome}</span>
                    <span
                      className={`w-fit rounded-full border px-2 py-0.5 font-bold text-[10px] ${cfg.bg} ${cfg.text} ${cfg.border}`}
                    >
                      {c.segmento.charAt(0).toUpperCase() + c.segmento.slice(1)}
                    </span>
                    <span className="font-bold text-[#163B32] text-[13px]">
                      {c.pontos.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-[#8A9892] text-[12px]">{c.ultimaVisita}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right — fill */}
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {/* Campanhas */}
          <div className="flex flex-col gap-4 rounded-[22px] border border-[#DCE7E1] bg-white p-[22px]">
            <div className="flex items-center justify-between">
              <p className="font-bold text-[#163B32] text-[16px]">Campanhas</p>
              <span className="text-[#8A9892] text-[12px]">{campanhasAtivas} ativas</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNovaCampanhaOpen(true)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-[14px] border border-[#B8D5C5] bg-[#E5F3EB] py-2.5 font-bold text-[#085041] text-[13px] hover:bg-[#d4eede]"
              >
                + Criar cupom
              </button>
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-[14px] border border-[#D7E4DD] bg-[#F4F8F4] py-2.5 font-medium text-[#163B32] text-[13px] hover:bg-[#eaf1ec]"
              >
                ↑ Exportar base
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {CAMPANHAS.map((c) => {
                const cfg = CAMPANHA_STATUS_CFG[c.status]
                const fimParts = c.fim.split('-')
                const fimFormatado = `${fimParts[2]}/${fimParts[1]}`
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-[14px] border border-[#E6ECE8] bg-[#F8FBF9] px-3.5 py-3"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[#163B32] text-[13px]">{c.nome}</span>
                      <span className="text-[#5A6B66] text-[11px]">
                        {c.clientes_atingidos.toLocaleString('pt-BR')} clientes · até {fimFormatado}
                      </span>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 font-bold text-[10px] ${cfg.cls}`}>
                      {cfg.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Transações recentes */}
          <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-[22px] border border-[#DCE7E1] bg-white p-[22px]">
            <p className="font-bold text-[#163B32] text-[16px]">Transações recentes</p>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
              {TRANSACOES.map((t) => {
                const cfg = TRANS_CFG[t.tipo]
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-[14px] border border-[#E6ECE8] bg-[#FBFCFB] px-3.5 py-3"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-[#163B32] text-[13px]">
                        {t.cliente_nome}
                      </span>
                      <span className="text-[#5A6B66] text-[11px]">
                        {t.descricao} · {t.data}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className={`font-bold text-[14px] ${cfg.text}`}>
                        {t.pontos > 0 ? '+' : ''}
                        {t.pontos.toLocaleString('pt-BR')} pts
                      </span>
                      {t.valor_compra !== undefined && (
                        <span className="text-[#8A9892] text-[11px]">
                          R$ {t.valor_compra.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            {/* TODO: integrar com API — GET /api/v1/fidelizacao/transacoes */}
          </div>
        </div>
      </div>

      {novaCampanhaOpen && <ModalNovaCampanha onClose={() => setNovaCampanhaOpen(false)} />}
    </div>
  )
}
