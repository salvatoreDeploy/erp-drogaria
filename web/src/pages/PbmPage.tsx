import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/* ── Types ────────────────────────────────────────────────────────── */

type PbmStep = 1 | 2 | 3
type AutorizacaoStatus = 'aguardando' | 'analisando' | 'autorizado' | 'negado'
type QueueItemStatus = 'aprovado' | 'pendente' | 'rejeitado'

interface MedItem {
  id: number
  nome: string
  rms: string
  qtdTotal: string
  qtdDiaria: string
}

interface SearchResult {
  id: number
  nome: string
  rms: string
  ean: string
}

/* ── Constants ────────────────────────────────────────────────────── */

// TODO: integrar com API — GET /api/v1/pbm/metricas-dia
const METRICS = [
  {
    label: 'Atendimentos hoje',
    value: '86',
    bg: 'bg-white',
    border: 'border-brand-100',
    lbl: 'text-text-secondary',
    val: 'text-brand-950',
  },
  {
    label: 'Aprovados',
    value: '72%',
    bg: 'bg-brand-25',
    border: 'border-brand-100',
    lbl: 'text-success-600',
    val: 'text-brand-900',
  },
  {
    label: 'Pendentes de docs',
    value: '14',
    bg: 'bg-warning-50',
    border: 'border-warning-100',
    lbl: 'text-warning-700',
    val: 'text-warning-950',
  },
  {
    label: 'Rejeições',
    value: '8',
    bg: 'bg-danger-50',
    border: 'border-danger-100',
    lbl: 'text-danger-700',
    val: 'text-danger-800',
  },
  {
    label: 'Desconto médio',
    value: 'R$ 18,40',
    bg: 'bg-info-50',
    border: 'border-info-100',
    lbl: 'text-info-700',
    val: 'text-info-950',
  },
] as const

const STEP_CFG: Record<
  PbmStep,
  { titulo: string; subtitulo: string; progresso: string; etapa: string; queueLabel: string }
> = {
  1: {
    titulo: 'PBM / Farmácia Popular · Etapa 1',
    subtitulo: 'Primeiro valide a autorização governamental antes de incluir medicamentos.',
    progresso: 'Fluxo guiado (1/3)',
    etapa: 'Etapa 1 · Autorização',
    queueLabel: 'Fila de autorizações',
  },
  2: {
    titulo: 'PBM / Farmácia Popular · Etapa 2',
    subtitulo: 'Autorização concluída. Agora inclua os medicamentos e quantidades.',
    progresso: 'Fluxo guiado (2/3)',
    etapa: 'Etapa 2 · Medicamentos',
    queueLabel: 'Fila de lançamentos PBM',
  },
  3: {
    titulo: 'PBM / Farmácia Popular · Etapa 3',
    subtitulo: 'Conferência final da autorização e dos itens para concluir o atendimento.',
    progresso: 'Fluxo guiado (3/3)',
    etapa: 'Etapa 3 · Finalização',
    queueLabel: 'Fila de finalizações',
  },
}

const AUTORIZACAO_CFG: Record<
  AutorizacaoStatus,
  {
    badge: string
    badgeBg: string
    badgeText: string
    cardBg: string
    cardBorder: string
    title: string
    desc: string
    btnText: string
    btnCls: string
    disabled: boolean
    govStatus: string
    govCls: string
    chip: string
  }
> = {
  aguardando: {
    badge: '● Aguardando',
    badgeBg: 'bg-neutral-50',
    badgeText: 'text-neutral-500',
    cardBg: 'bg-white',
    cardBorder: 'border-brand-100',
    title: 'Preencha os dados para validar a autorização governamental.',
    desc: 'Informe CPF, receita, CRM, RMS e código do cliente para consultar.',
    btnText: 'Validar autorização',
    btnCls: 'bg-brand-900 text-white hover:bg-brand-800',
    disabled: false,
    govStatus: 'Aguardando consulta',
    govCls: 'text-brand-muted',
    chip: 'Consulta governo em tempo real',
  },
  analisando: {
    badge: '⟳ Em análise',
    badgeBg: 'bg-info-50',
    badgeText: 'text-info-700',
    cardBg: 'bg-info-50',
    cardBorder: 'border-info-100',
    title: 'Validar autorização junto ao governo para liberar próxima etapa.',
    desc: 'Sem autorização ativa não é permitido adicionar medicamentos.',
    btnText: 'Aguardando resposta...',
    btnCls: 'bg-brand-300 cursor-not-allowed text-white',
    disabled: true,
    govStatus: 'Em análise...',
    govCls: 'font-semibold text-info-700',
    chip: 'Consulta governo em tempo real',
  },
  autorizado: {
    badge: '● Autorizado',
    badgeBg: 'bg-brand-75',
    badgeText: 'text-success-600',
    cardBg: 'bg-brand-25',
    cardBorder: 'border-brand-100',
    title: 'Autorização confirmada. Avance para incluir os medicamentos.',
    desc: 'CPF, CRM e RMS validados com sucesso pelo sistema do governo.',
    btnText: 'Avançar para medicamentos →',
    btnCls: 'bg-brand-900 text-white hover:bg-brand-800',
    disabled: false,
    govStatus: 'Autorizado',
    govCls: 'font-semibold text-success-600',
    chip: 'Autorização confirmada',
  },
  negado: {
    badge: '✗ Negado',
    badgeBg: 'bg-danger-50',
    badgeText: 'text-danger-700',
    cardBg: 'bg-danger-50',
    cardBorder: 'border-danger-100',
    title: 'Autorização negada pelo governo. Verifique os dados informados.',
    desc: 'CRM, RMS ou código do cliente com inconsistência no sistema.',
    btnText: 'Autorização negada',
    btnCls: 'bg-brand-300 cursor-not-allowed text-white',
    disabled: true,
    govStatus: 'Negado',
    govCls: 'font-semibold text-danger-700',
    chip: 'Consulta governo em tempo real',
  },
}

const QUEUE_CFG: Record<
  QueueItemStatus,
  { row: string; border: string; statusText: string; detailCls: string }
> = {
  aprovado: {
    row: 'bg-[#FBFCFB]',
    border: 'border-brand-100',
    statusText: 'text-success-600',
    detailCls: 'text-text-secondary',
  },
  pendente: {
    row: 'bg-warning-50',
    border: 'border-warning-100',
    statusText: 'text-warning-700',
    detailCls: 'text-warning-700',
  },
  rejeitado: {
    row: 'bg-danger-50',
    border: 'border-danger-100',
    statusText: 'text-danger-700',
    detailCls: 'text-danger-700',
  },
}

// TODO: integrar com API — GET /api/v1/pbm/fila?minutos=20
const QUEUE_ITEMS: Record<
  PbmStep,
  Array<{ id: number; name: string; detail: string; status: QueueItemStatus }>
> = {
  1: [
    {
      id: 1,
      name: 'Maria Silva',
      detail: 'CPF/RMS validados · Cliente cadastrado',
      status: 'aprovado',
    },
    {
      id: 2,
      name: 'João Pereira',
      detail: 'Receita de CRM e código do cliente pendentes',
      status: 'pendente',
    },
    {
      id: 3,
      name: 'Ana Costa',
      detail: 'Código de cliente inconsistente com CPF',
      status: 'rejeitado',
    },
  ],
  2: [
    {
      id: 1,
      name: 'Maria Silva',
      detail: 'CRM/RMS validados · 4 medicamentos lançados',
      status: 'aprovado',
    },
    {
      id: 2,
      name: 'João Pereira',
      detail: 'Pendente de validação CRM e código do cliente',
      status: 'pendente',
    },
    {
      id: 3,
      name: 'Ana Costa',
      detail: 'Código de cliente inconsistente com CPF',
      status: 'rejeitado',
    },
  ],
  3: [
    {
      id: 1,
      name: 'Maria Silva',
      detail: 'CRM/RMS validados · Cliente cadastrado',
      status: 'aprovado',
    },
    {
      id: 2,
      name: 'João Pereira',
      detail: 'Pendente de validação CRM e código do cliente',
      status: 'pendente',
    },
    {
      id: 3,
      name: 'Ana Costa',
      detail: 'Código de cliente inconsistente com CPF',
      status: 'rejeitado',
    },
  ],
}

const MEDS_INICIAIS: MedItem[] = [
  {
    id: 1,
    nome: 'Losartana 50mg',
    rms: '1.2345.6789',
    qtdTotal: '2 caixas',
    qtdDiaria: '2 comprimidos/dia',
  },
  {
    id: 2,
    nome: 'Metformina 850mg',
    rms: '9.8877.6655',
    qtdTotal: '1 caixa',
    qtdDiaria: '1 comprimido/dia',
  },
  {
    id: 3,
    nome: 'Atorvastatina 20mg',
    rms: '3.2211.9087',
    qtdTotal: '1 caixa',
    qtdDiaria: '1 comprimido/dia',
  },
  {
    id: 4,
    nome: 'Glibenclamida 5mg',
    rms: '7.4400.3321',
    qtdTotal: '2 caixas',
    qtdDiaria: '2 comprimidos/dia',
  },
]

// TODO: integrar com API — GET /api/v1/pbm/medicamentos/buscar?q=
const SEARCH_RESULTS: SearchResult[] = [
  {
    id: 1,
    nome: 'Losartana Potássica 50mg - cx 30 comp',
    rms: '1.2345.6789',
    ean: '7891234567890',
  },
  {
    id: 2,
    nome: 'Losartana Potássica 100mg - cx 30 comp',
    rms: '8.7777.1222',
    ean: '7891234567000',
  },
  {
    id: 3,
    nome: 'Losartana + Hidroclorotiazida 50/12,5mg',
    rms: '5.9090.4321',
    ean: '7891234000111',
  },
]

const RULES = [
  { label: 'Documento com foto', value: 'Obrigatório' },
  { label: 'Receita válida', value: 'Checagem automática' },
  { label: 'Elegibilidade', value: 'PBM / F. Popular' },
]

const SHORTCUTS = [
  { label: 'Ler QR da receita', key: 'F3' },
  { label: 'Consultar elegibilidade', key: 'F4' },
  { label: 'Enviar comprovante', key: 'F5' },
]

/* ── Shared sub-components ────────────────────────────────────────── */

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
      <p className="font-bold text-[12px] text-input-label">{label}</p>
      <span className="text-[14px] text-brand-950">{value}</span>
    </div>
  )
}

function QueueSection({ step }: { step: PbmStep }) {
  const items = QUEUE_ITEMS[step]
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[18px] text-brand-950">{STEP_CFG[step].queueLabel}</h3>
        <span className="text-[12px] text-text-secondary">Últimos 20 minutos</span>
      </div>
      {items.map((item) => {
        const q = QUEUE_CFG[item.status]
        return (
          <div
            key={item.id}
            className={`flex items-center justify-between rounded-[16px] border px-3.5 py-3 ${q.row} ${q.border}`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-[13px] text-brand-950">{item.name}</span>
              <span className={`text-[12px] ${q.detailCls}`}>{item.detail}</span>
            </div>
            <span className={`font-bold text-[12px] ${q.statusText}`}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function RightPanel() {
  return (
    <div className="flex w-[350px] shrink-0 flex-col gap-3">
      <div className="flex flex-col gap-2.5 rounded-[24px] border border-brand-100 bg-white p-4">
        <h3 className="font-bold text-[15px] text-brand-950">Regras do benefício</h3>
        {RULES.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between rounded-[14px] bg-brand-25 px-3 py-2.5"
          >
            <span className="font-bold text-[13px] text-brand-950">{r.label}</span>
            <span className="text-[12px] text-success-600">{r.value}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2.5 rounded-[24px] border border-brand-100 bg-white p-4">
        <h3 className="font-bold text-[15px] text-brand-950">Atalhos operacionais</h3>
        {SHORTCUTS.map((s) => (
          <button
            key={s.label}
            type="button"
            className="flex items-center justify-between rounded-[14px] bg-brand-50 px-3 py-2.5 transition-colors hover:bg-brand-75"
          >
            <span className="font-bold text-[13px] text-brand-950">{s.label}</span>
            <span className="font-bold text-[12px] text-success-600">{s.key}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Etapa 1 — Autorização Governo ───────────────────────────────── */

function StepAutorizacao({
  status,
  onSetStatus,
  onAvancar,
}: {
  status: AutorizacaoStatus
  onSetStatus: (s: AutorizacaoStatus) => void
  onAvancar: () => void
}) {
  const [historicoOpen, setHistoricoOpen] = useState(false)
  const cfg = AUTORIZACAO_CFG[status]

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[18px] text-brand-950">Autorização Farmácia Popular</h2>
        <div className="flex items-center gap-1.5">
          {(['aguardando', 'analisando', 'autorizado', 'negado'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSetStatus(s)}
              className={[
                'rounded-full px-2 py-0.5 font-mono text-[9px] uppercase transition-colors',
                status === s ? 'bg-brand-100 text-brand-750' : 'text-brand-muted hover:bg-brand-50',
              ].join(' ')}
            >
              {s}
            </button>
          ))}
          <span className="ml-1 rounded-full bg-brand-900 px-3 py-1.5 font-bold text-[12px] text-white">
            {cfg.chip}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* CPF */}
        <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
          <div className="flex items-center justify-between">
            <label htmlFor="step1-cpf" className="font-bold text-[12px] text-input-label">
              CPF do paciente
            </label>
            <button
              type="button"
              onClick={() => setHistoricoOpen(true)}
              className="font-bold text-[11px] text-brand-700 hover:underline"
            >
              Ver histórico
            </button>
          </div>
          <input
            id="step1-cpf"
            type="text"
            defaultValue="000.000.000-00"
            placeholder="000.000.000-00"
            className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
          />
        </div>

        {/* Receita + Convênio */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
            <label htmlFor="step1-receita" className="font-bold text-[12px] text-input-label">
              Receita digital
            </label>
            <input
              id="step1-receita"
              type="text"
              placeholder="Anexar ou escanear documento"
              className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
            />
          </div>
          <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
            <label htmlFor="step1-convenio" className="font-bold text-[12px] text-input-label">
              Convênio
            </label>
            <select
              id="step1-convenio"
              className="bg-transparent text-[14px] text-brand-950 outline-none"
            >
              <option>Farmácia Popular</option>
              <option>Aqui Tem Farmácia</option>
              <option>Programa Privado</option>
            </select>
          </div>
        </div>

        {/* CRM + RMS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
            <label htmlFor="step1-crm" className="font-bold text-[12px] text-input-label">
              CRM
            </label>
            <input
              id="step1-crm"
              type="text"
              placeholder="Ex: 123456-SP"
              className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
            />
          </div>
          <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
            <label htmlFor="step1-rms" className="font-bold text-[12px] text-input-label">
              RMS
            </label>
            <input
              id="step1-rms"
              type="text"
              placeholder="Ex: 1.2345.6789"
              className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
            />
          </div>
        </div>

        {/* Código do cliente + Status gov */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
            <label htmlFor="step1-codigo" className="font-bold text-[12px] text-input-label">
              Código do cliente (já cadastrado)
            </label>
            <input
              id="step1-codigo"
              type="text"
              placeholder="Ex: CLI-000284"
              className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
            />
          </div>
          <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
            <p className="font-bold text-[12px] text-input-label">Status autorização gov.</p>
            <span className={`text-[14px] ${cfg.govCls}`}>{cfg.govStatus}</span>
          </div>
        </div>
      </div>

      {/* Status box */}
      <div
        className={`flex items-start gap-3 rounded-[20px] border p-4 transition-colors ${cfg.cardBg} ${cfg.cardBorder}`}
      >
        <span
          className={`shrink-0 rounded-full px-3 py-1 font-bold text-[12px] ${cfg.badgeBg} ${cfg.badgeText}`}
        >
          {cfg.badge}
        </span>
        <div className="flex flex-1 flex-col gap-1">
          <p className="font-bold text-[14px] text-brand-950">{cfg.title}</p>
          <p className="text-[12px] text-text-secondary">{cfg.desc}</p>
        </div>
      </div>

      {/* CTA */}
      {status === 'autorizado' ? (
        <button
          type="button"
          onClick={onAvancar}
          className="flex h-10 w-full items-center justify-center rounded-[14px] bg-brand-900 font-bold text-[13px] text-white transition-colors hover:bg-brand-800"
        >
          Avançar para medicamentos →
        </button>
      ) : (
        /* TODO: integrar com API — POST /api/v1/pbm/autorizar */
        <button
          type="button"
          disabled={cfg.disabled}
          onClick={() => onSetStatus('analisando')}
          className={`flex h-10 w-full items-center justify-center rounded-[14px] font-bold text-[13px] transition-colors ${cfg.btnCls}`}
        >
          {cfg.btnText}
        </button>
      )}

      {historicoOpen && <ModalHistoricoPbm onClose={() => setHistoricoOpen(false)} />}
    </div>
  )
}

/* ── Etapa 2 — Medicamentos ───────────────────────────────────────── */

function StepMedicamentos({
  meds,
  onRemoveMed,
  onOpenModal,
  onAvancar,
}: {
  meds: MedItem[]
  onRemoveMed: (id: number) => void
  onOpenModal: () => void
  onAvancar: () => void
}) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[18px] text-brand-950">Inclusão de medicamentos</h2>
        <span className="rounded-full bg-brand-900 px-3 py-1.5 font-bold text-[12px] text-white">
          Autorização confirmada
        </span>
      </div>

      {/* Readonly patient data */}
      <div className="flex flex-col gap-3">
        <ReadonlyField label="CPF do paciente" value="000.000.000-00" />
        <div className="grid grid-cols-2 gap-3">
          <ReadonlyField label="CRM" value="123456-SP" />
          <ReadonlyField label="Código do cliente" value="CLI-000284" />
        </div>
      </div>

      {/* Meds list */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[12px] text-text-secondary">
            Medicamentos adicionados
          </span>
          <span className="rounded-full bg-brand-75 px-2.5 py-1 font-bold text-[11px] text-success-600">
            {meds.length} {meds.length === 1 ? 'item' : 'itens'}
          </span>
        </div>

        {meds.map((med, i) => (
          <div
            key={med.id}
            className="flex items-start justify-between rounded-[14px] border border-input-border bg-input-bg p-3"
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-[13px] text-brand-950">
                {i + 1}) {med.nome} • RMS {med.rms}
              </span>
              <span className="text-[12px] text-text-secondary">
                Quantidade total: {med.qtdTotal} • Quantidade diária: {med.qtdDiaria}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onRemoveMed(med.id)}
              className="ml-3 shrink-0 font-bold text-[16px] text-brand-muted transition-colors hover:text-danger-700"
            >
              ×
            </button>
          </div>
        ))}

        {/* TODO: integrar com API — GET /api/v1/pbm/medicamentos/buscar */}
        <button
          type="button"
          onClick={onOpenModal}
          className="flex h-10 w-full items-center justify-center rounded-[14px] border border-brand-200 border-dashed font-semibold text-[13px] text-brand-muted transition-colors hover:bg-brand-25"
        >
          + Adicionar mais medicamentos
        </button>
      </div>

      {/* Status */}
      <div className="flex items-start gap-3 rounded-[20px] border border-brand-100 bg-brand-25 p-4">
        <span className="shrink-0 rounded-full bg-brand-75 px-3 py-1 font-bold text-[12px] text-success-600">
          ● Pronto para revisar
        </span>
        <div className="flex flex-1 flex-col gap-1">
          <p className="font-bold text-[14px] text-brand-950">
            {meds.length} medicamento{meds.length !== 1 ? 's' : ''} lançado
            {meds.length !== 1 ? 's' : ''}. Revise todos os itens antes da finalização.
          </p>
          <p className="text-[12px] text-text-secondary">
            Cada item deve ter RMS, quantidade total e quantidade diária para validação.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onAvancar}
        className="flex h-10 w-full items-center justify-center rounded-[14px] bg-brand-900 font-bold text-[13px] text-white transition-colors hover:bg-brand-800"
      >
        Pronto para revisar →
      </button>
    </div>
  )
}

/* ── Etapa 3 — Finalização ────────────────────────────────────────── */

function StepFinalizacao({ meds, onEnviarCaixa }: { meds: MedItem[]; onEnviarCaixa: () => void }) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[18px] text-brand-950">Finalização do benefício</h2>
        <span className="rounded-full bg-brand-900 px-3 py-1.5 font-bold text-[12px] text-white">
          Conferência final
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <ReadonlyField label="CPF do paciente" value="000.000.000-00" />
        <div className="grid grid-cols-2 gap-3">
          <ReadonlyField label="Protocolo governo" value="PBM-2026-004812" />
          <ReadonlyField
            label="Medicamentos autorizados"
            value={`${meds.length} ${meds.length === 1 ? 'item' : 'itens'}`}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ReadonlyField label="Quantidade total" value="8 unidades" />
          <ReadonlyField label="Quantidade diária" value="6 comprimidos/dia" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ReadonlyField label="Desconto aplicado" value="R$ 27,80" />
          <ReadonlyField label="Código do cliente" value="CLI-000284" />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-start gap-3 rounded-[20px] border border-brand-100 bg-brand-25 p-4">
        <span className="shrink-0 rounded-full bg-brand-75 px-3 py-1 font-bold text-[12px] text-success-600">
          ● Aprovado
        </span>
        <div className="flex flex-1 flex-col gap-1">
          <p className="font-bold text-[14px] text-brand-950">
            Atendimento pronto para finalizar no caixa com benefício aplicado.
          </p>
          <p className="text-[12px] text-text-secondary">
            Comprovante pronto para emissão e envio ao paciente.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* TODO: integrar com API — POST /api/v1/pbm/finalizar */}
        <button
          type="button"
          onClick={onEnviarCaixa}
          className="flex h-10 flex-1 items-center justify-center rounded-[14px] bg-brand-900 font-bold text-[13px] text-white transition-colors hover:bg-brand-800"
        >
          Finalizar e enviar ao caixa
        </button>
        {/* TODO: integrar com API — POST /api/v1/pbm/comprovante */}
        <button
          type="button"
          className="flex h-10 items-center rounded-[14px] border border-brand-100 bg-white px-4 font-bold text-[12px] text-brand-950 transition-colors hover:bg-brand-50"
        >
          Enviar comprovante
        </button>
      </div>
    </div>
  )
}

/* ── Modal Adicionar Medicamento ──────────────────────────────────── */

function ModalAdicionarMedicamento({
  onClose,
  onAdicionar,
}: {
  onClose: () => void
  onAdicionar: (result: SearchResult) => void
}) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<number | null>(null)

  const filtered =
    query.length >= 2
      ? SEARCH_RESULTS.filter((r) => r.nome.toLowerCase().includes(query.toLowerCase()))
      : SEARCH_RESULTS

  function handleConfirm() {
    const item = filtered.find((r) => r.id === selected)
    if (item) onAdicionar(item)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh]">
      {/* Overlay */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar modal"
      />

      {/* Card */}
      <div className="relative z-10 flex w-[580px] flex-col gap-3 rounded-[24px] border border-input-border bg-white p-[18px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[18px] text-brand-950">Adicionar medicamento PBM</h3>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-[16px] text-text-secondary transition-colors hover:text-brand-950"
          >
            ✕
          </button>
        </div>
        <p className="text-[12px] text-text-secondary">
          Pesquise o medicamento e selecione como deseja lançar no atendimento.
        </p>

        {/* Search field */}
        <div className="flex flex-col gap-1.5 rounded-[14px] border border-input-border bg-input-bg p-3.5">
          <label htmlFor="modal-search" className="font-bold text-[12px] text-input-label">
            Pesquisar medicamento
          </label>
          <input
            id="modal-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite nome, princípio ativo ou código"
            className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
          />
        </div>

        {/* Entry methods */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1.5 rounded-[14px] border border-info-100 bg-info-50 p-3">
            <span className="font-bold text-[12px] text-info-700">Código de barras</span>
            <span className="text-[11px] text-text-secondary">
              Bipe EAN e preencher automaticamente
            </span>
          </div>
          <div className="flex flex-col gap-1.5 rounded-[14px] border border-brand-100 bg-brand-25 p-3">
            <span className="font-bold text-[12px] text-brand-950">Scanner / câmera</span>
            <span className="text-[11px] text-text-secondary">
              Ler embalagem via câmera do terminal
            </span>
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[12px] text-text-secondary">
              Resultados da pesquisa
            </span>
            <span className="font-bold text-[11px] text-success-600">
              {filtered.length} encontrado{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          {filtered.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelected(r.id)}
              className={[
                'flex flex-col gap-1 rounded-[12px] border px-3 py-2.5 text-left transition-colors',
                selected === r.id
                  ? 'border-brand-700 bg-brand-25'
                  : 'border-brand-100 bg-[#FBFCFB] hover:bg-brand-50',
              ].join(' ')}
            >
              <span className="font-bold text-[13px] text-brand-950">{r.nome}</span>
              <span className="text-[11px] text-text-secondary">
                RMS {r.rms} • EAN {r.ean}
              </span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 items-center rounded-[12px] border border-brand-100 px-4 font-bold text-[12px] text-text-secondary transition-colors hover:bg-brand-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={selected === null}
            onClick={handleConfirm}
            className={[
              'flex h-9 items-center rounded-[12px] px-4 font-bold text-[12px] text-white transition-colors',
              selected !== null
                ? 'bg-brand-900 hover:bg-brand-800'
                : 'cursor-not-allowed bg-brand-300',
            ].join(' ')}
          >
            Adicionar medicamento
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Modal Histórico Paciente PBM ────────────────────────────────── */

// TODO: integrar com API — GET /api/v1/pbm/historico/{cpf}
const HISTORICO_PBM = [
  {
    id: 1,
    data: '10/05/2026',
    produto: 'Losartana 50mg',
    convenio: 'Farmácia Popular',
    status: 'aprovado' as const,
  },
  {
    id: 2,
    data: '15/04/2026',
    produto: 'Metformina 850mg',
    convenio: 'Farmácia Popular',
    status: 'aprovado' as const,
  },
  {
    id: 3,
    data: '02/03/2026',
    produto: 'Anlodipino 5mg',
    convenio: 'Aqui Tem Farmácia',
    status: 'pendente' as const,
  },
]

const HIST_PBM_CFG: Record<'aprovado' | 'pendente' | 'rejeitado', { label: string; cls: string }> =
  {
    aprovado: { label: 'Aprovado', cls: 'text-success-600' },
    pendente: { label: 'Pendente', cls: 'text-warning-700' },
    rejeitado: { label: 'Rejeitado', cls: 'text-danger-700' },
  }

function ModalHistoricoPbm({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar modal"
      />
      <div className="relative z-10 flex w-[560px] flex-col gap-4 rounded-[28px] bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[18px] text-brand-950">Histórico PBM — paciente</h3>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-[16px] text-text-secondary hover:text-brand-950"
          >
            ✕
          </button>
        </div>
        <p className="text-[12px] text-text-secondary">
          CPF: 000.000.000-00 · últimas autorizações
        </p>

        <div className="grid grid-cols-[80px_1fr_1fr_90px] gap-3 rounded-[12px] bg-[#F5F8F6] px-3 py-2.5">
          {['Data', 'Produto', 'Convênio', 'Status'].map((h) => (
            <span key={h} className="font-semibold text-[12px] text-text-secondary">
              {h}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {HISTORICO_PBM.map((h) => (
            <div
              key={h.id}
              className="grid grid-cols-[80px_1fr_1fr_90px] items-center gap-3 rounded-[14px] bg-[#FBFCFB] px-3 py-3"
            >
              <span className="text-[12px] text-text-secondary">{h.data}</span>
              <span className="font-bold text-[13px] text-brand-950">{h.produto}</span>
              <span className="text-[13px] text-brand-950">{h.convenio}</span>
              <span className={`font-bold text-[12px] ${HIST_PBM_CFG[h.status].cls}`}>
                {HIST_PBM_CFG[h.status].label}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-full items-center justify-center rounded-[14px] border border-brand-200 font-bold text-[13px] text-brand-700"
        >
          Fechar
        </button>
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────── */

export function PbmPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<PbmStep>(1)
  const [authStatus, setAuthStatus] = useState<AutorizacaoStatus>('aguardando')
  const [meds, setMeds] = useState<MedItem[]>(MEDS_INICIAIS)
  const [modalOpen, setModalOpen] = useState(false)

  const stepCfg = STEP_CFG[step]

  function handleRemoveMed(id: number) {
    setMeds((prev) => prev.filter((m) => m.id !== id))
  }

  function handleAdicionarMed(result: SearchResult) {
    const newMed: MedItem = {
      id: Date.now(),
      nome: result.nome.split(' - ')[0],
      rms: result.rms,
      qtdTotal: '1 caixa',
      qtdDiaria: '1 comprimido/dia',
    }
    setMeds((prev) => [...prev, newMed])
    setModalOpen(false)
  }

  function goBack() {
    if (step > 1) setStep((s) => (s - 1) as PbmStep)
  }

  function goNext() {
    if (step < 3) setStep((s) => (s + 1) as PbmStep)
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {/* Header */}
        <header className="flex items-center justify-between rounded-[24px] border border-brand-100 bg-white px-[22px] py-4">
          <div className="flex flex-col gap-0.5">
            <h1 className="font-bold text-[24px] text-brand-950 leading-none">{stepCfg.titulo}</h1>
            <p className="text-[13px] text-text-secondary">{stepCfg.subtitulo}</p>
          </div>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={goBack}
                className="flex h-9 items-center rounded-[14px] border border-brand-100 bg-white px-4 font-bold text-[12px] text-brand-950 transition-colors hover:bg-brand-50"
              >
                ← Voltar
              </button>
            )}
            <div className="flex items-center rounded-[14px] border border-brand-200 bg-brand-25 px-4 py-2">
              <span className="font-bold text-[12px] text-brand-950">{stepCfg.progresso}</span>
            </div>
            <div className="flex items-center rounded-[14px] bg-brand-900 px-4 py-2">
              <span className="font-bold text-[12px] text-white">{stepCfg.etapa}</span>
            </div>
          </div>
        </header>

        {/* Metrics */}
        <div className="grid grid-cols-5 gap-3.5">
          {METRICS.map((m) => (
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
          {/* Left */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-brand-100 bg-white">
            <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto p-5">
              {step === 1 && (
                <StepAutorizacao
                  status={authStatus}
                  onSetStatus={setAuthStatus}
                  onAvancar={goNext}
                />
              )}
              {step === 2 && (
                <StepMedicamentos
                  meds={meds}
                  onRemoveMed={handleRemoveMed}
                  onOpenModal={() => setModalOpen(true)}
                  onAvancar={goNext}
                />
              )}
              {step === 3 && (
                <StepFinalizacao
                  meds={meds}
                  onEnviarCaixa={() =>
                    navigate('/pdv?caixaAberto=true', {
                      state: { pbm_autorizacao_id: 'PBM-2026-004812' },
                    })
                  }
                />
              )}
              <QueueSection step={step} />
            </div>
          </div>

          {/* Right */}
          <RightPanel />
        </div>
      </div>

      {modalOpen && (
        <ModalAdicionarMedicamento
          onClose={() => setModalOpen(false)}
          onAdicionar={handleAdicionarMed}
        />
      )}
    </>
  )
}
