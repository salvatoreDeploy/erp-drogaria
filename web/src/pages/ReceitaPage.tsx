import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type ReceitaStatus = 'idle' | 'processando' | 'validado' | 'pendente' | 'rejeitado'
type MedStatus = 'liberado' | 'analisar' | 'bloqueado'
type CheckStatus = 'ok' | 'pendente' | 'erro' | 'aguardando'

interface MedItem {
  id: number
  nome: string
  posologia: string
  controlado: boolean
  status: MedStatus
}

interface CheckItem {
  label: string
  value: string
  status: CheckStatus
}

// TODO: integrar com API — GET /api/v1/receita/metricas-dia
const METRICS = [
  {
    label: 'Receitas hoje',
    value: '58',
    bg: 'bg-white',
    border: 'border-brand-100',
    lbl: 'text-text-secondary',
    val: 'text-brand-950',
  },
  {
    label: 'Validadas',
    value: '49',
    bg: 'bg-brand-25',
    border: 'border-brand-100',
    lbl: 'text-success-600',
    val: 'text-brand-900',
  },
  {
    label: 'Em análise',
    value: '7',
    bg: 'bg-warning-50',
    border: 'border-warning-100',
    lbl: 'text-warning-700',
    val: 'text-warning-950',
  },
  {
    label: 'Rejeitadas',
    value: '2',
    bg: 'bg-danger-50',
    border: 'border-danger-100',
    lbl: 'text-danger-700',
    val: 'text-danger-800',
  },
  {
    label: 'Tempo médio',
    value: '1m 12s',
    bg: 'bg-info-50',
    border: 'border-info-100',
    lbl: 'text-info-700',
    val: 'text-info-950',
  },
] as const

const STATUS_CFG: Record<
  ReceitaStatus,
  {
    chipLabel: string
    chipBg: string
    chipText: string
    chipBorder: string
    badge: string
    badgeBg: string
    badgeText: string
    cardBg: string
    cardBorder: string
    title: string
    desc: string
    btnText: string
    btnCls: string
    btnDisabled: boolean
  }
> = {
  idle: {
    chipLabel: 'Leitura ativa',
    chipBg: 'bg-brand-75',
    chipText: 'text-brand-750',
    chipBorder: 'border-brand-200',
    badge: '',
    badgeBg: '',
    badgeText: '',
    cardBg: 'bg-white',
    cardBorder: 'border-brand-100',
    title: '',
    desc: '',
    btnText: '',
    btnCls: '',
    btnDisabled: true,
  },
  processando: {
    chipLabel: 'Processando OCR...',
    chipBg: 'bg-info-50',
    chipText: 'text-info-700',
    chipBorder: 'border-info-100',
    badge: '⟳ Processando',
    badgeBg: 'bg-info-50',
    badgeText: 'text-info-700',
    cardBg: 'bg-info-50',
    cardBorder: 'border-info-100',
    title: 'OCR em andamento. Extraindo dados da receita...',
    desc: 'Aguarde enquanto o sistema lê e valida a assinatura digital.',
    btnText: 'Processando receita...',
    btnCls: 'bg-brand-300 cursor-not-allowed text-white',
    btnDisabled: true,
  },
  validado: {
    chipLabel: 'OCR pronto',
    chipBg: 'bg-brand-900',
    chipText: 'text-white',
    chipBorder: 'border-brand-900',
    badge: '● Validação ok',
    badgeBg: 'bg-brand-75',
    badgeText: 'text-success-600',
    cardBg: 'bg-brand-25',
    cardBorder: 'border-brand-100',
    title: 'Prescrição conferida, documento autenticado e itens elegíveis para atendimento.',
    desc: 'Ações seguintes: separar, confirmar desconto e concluir atendimento com assinatura digital.',
    btnText: 'Concluir atendimento →',
    btnCls: 'bg-brand-900 text-white hover:bg-brand-800',
    btnDisabled: false,
  },
  pendente: {
    chipLabel: 'Atenção necessária',
    chipBg: 'bg-warning-50',
    chipText: 'text-warning-800',
    chipBorder: 'border-warning-100',
    badge: '⚠ Conferência necessária',
    badgeBg: 'bg-warning-50',
    badgeText: 'text-warning-800',
    cardBg: 'bg-warning-50',
    cardBorder: 'border-warning-100',
    title: 'Medicamento controlado requer conferência manual antes de dispensar.',
    desc: 'Sertralina 50mg exige receituário especial (Portaria 344) e registro no SNGPC.',
    btnText: 'Conferir e liberar',
    btnCls: 'bg-warning-700 text-white hover:bg-warning-800',
    btnDisabled: false,
  },
  rejeitado: {
    chipLabel: 'Rejeitado',
    chipBg: 'bg-danger-50',
    chipText: 'text-danger-700',
    chipBorder: 'border-danger-100',
    badge: '✗ Rejeitado',
    badgeBg: 'bg-danger-50',
    badgeText: 'text-danger-700',
    cardBg: 'bg-danger-50',
    cardBorder: 'border-danger-100',
    title: 'Receita inválida ou medicamento não elegível para dispensação.',
    desc: 'Assinatura digital inválida ou receita vencida. Solicite nova prescrição ao médico.',
    btnText: 'Nova conferência',
    btnCls: 'bg-danger-600 text-white hover:bg-danger-700',
    btnDisabled: false,
  },
}

const MED_STATUS_CFG: Record<
  MedStatus,
  { bg: string; border: string; posCls: string; valueCls: string; label: string }
> = {
  liberado: {
    bg: 'bg-brand-25',
    border: 'border-brand-100',
    posCls: 'text-text-secondary',
    valueCls: 'text-success-600',
    label: 'Liberado',
  },
  analisar: {
    bg: 'bg-warning-50',
    border: 'border-warning-100',
    posCls: 'text-warning-700',
    valueCls: 'text-warning-800',
    label: 'Analisar',
  },
  bloqueado: {
    bg: 'bg-danger-50',
    border: 'border-danger-100',
    posCls: 'text-danger-700',
    valueCls: 'text-danger-700',
    label: 'Bloqueado',
  },
}

const CHECK_STATUS_CFG: Record<CheckStatus, { bg: string; valueCls: string }> = {
  ok: { bg: 'bg-brand-25', valueCls: 'text-success-600' },
  pendente: { bg: 'bg-warning-50', valueCls: 'text-warning-800' },
  erro: { bg: 'bg-danger-50', valueCls: 'text-danger-700' },
  aguardando: { bg: 'bg-[#FBFCFB]', valueCls: 'text-brand-muted' },
}

const MEDS: Record<ReceitaStatus, MedItem[]> = {
  idle: [],
  processando: [],
  validado: [
    {
      id: 1,
      nome: 'Losartana 50mg',
      posologia: '1x ao dia · receita válida',
      controlado: false,
      status: 'liberado',
    },
    {
      id: 2,
      nome: 'Sertralina 50mg',
      posologia: '1x ao dia · receita válida',
      controlado: true,
      status: 'liberado',
    },
  ],
  pendente: [
    {
      id: 1,
      nome: 'Losartana 50mg',
      posologia: '1x ao dia · receita válida',
      controlado: false,
      status: 'liberado',
    },
    {
      id: 2,
      nome: 'Sertralina 50mg',
      posologia: '1x ao dia · exige conferência',
      controlado: true,
      status: 'analisar',
    },
  ],
  rejeitado: [
    {
      id: 1,
      nome: 'Losartana 50mg',
      posologia: '1x ao dia · receita válida',
      controlado: false,
      status: 'liberado',
    },
    {
      id: 2,
      nome: 'Sertralina 50mg',
      posologia: '1x ao dia · receita inválida',
      controlado: true,
      status: 'bloqueado',
    },
  ],
}

const CHECKLIST: Record<ReceitaStatus, CheckItem[]> = {
  idle: [
    { label: 'QR code lido', value: '—', status: 'aguardando' },
    { label: 'Assinatura válida', value: '—', status: 'aguardando' },
    { label: 'Medicamento elegível', value: '—', status: 'aguardando' },
  ],
  processando: [
    { label: 'QR code lido', value: 'Verificando...', status: 'aguardando' },
    { label: 'Assinatura válida', value: 'Verificando...', status: 'aguardando' },
    { label: 'Medicamento elegível', value: 'Verificando...', status: 'aguardando' },
  ],
  validado: [
    { label: 'QR code lido', value: 'OK', status: 'ok' },
    { label: 'Assinatura válida', value: 'OK', status: 'ok' },
    { label: 'Medicamento elegível', value: 'OK', status: 'ok' },
  ],
  pendente: [
    { label: 'QR code lido', value: 'OK', status: 'ok' },
    { label: 'Assinatura válida', value: 'OK', status: 'ok' },
    { label: 'Medicamento elegível', value: '1 pendente', status: 'pendente' },
  ],
  rejeitado: [
    { label: 'QR code lido', value: 'OK', status: 'ok' },
    { label: 'Assinatura válida', value: 'Inválida', status: 'erro' },
    { label: 'Medicamento elegível', value: 'Bloqueado', status: 'erro' },
  ],
}

// TODO: integrar com API — GET /api/v1/receita/historico-recente
const HISTORICO = [
  {
    id: '2024-0183',
    label: 'Receita 2024-0183',
    status: 'Validade ok',
    statusCls: 'text-success-600',
  },
  {
    id: '2024-0182',
    label: 'Receita 2024-0182',
    status: 'Pendente docs',
    statusCls: 'text-warning-800',
  },
] as const

const ACOES = [
  { label: 'Conferir receita', shortcut: 'F3' },
  { label: 'Gerar autorização', shortcut: 'F4' },
  { label: 'Enviar para WhatsApp', shortcut: 'F5' },
] as const

const PATIENT_ROWS = [
  { label: 'Paciente', value: 'Mariana Souza' },
  { label: 'CPF', value: '000.000.000-00' },
  { label: 'Médico', value: 'Dra. Camila Nogueira' },
  { label: 'CRM', value: 'CRM 123456/SP' },
  { label: 'Data da receita', value: '01/05/2025' },
] as const

function MedRow({ item }: { item: MedItem }) {
  const cfg = MED_STATUS_CFG[item.status]
  return (
    <div
      className={`flex items-center justify-between rounded-[16px] border px-3.5 py-3 transition-colors ${cfg.bg} ${cfg.border}`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[13px] text-brand-950">{item.nome}</span>
          {item.controlado && (
            <span className="rounded-full border border-warning-100 bg-warning-50 px-2 py-0.5 font-bold text-[10px] text-warning-800">
              Controlado
            </span>
          )}
        </div>
        <span className={`text-[12px] ${cfg.posCls}`}>{item.posologia}</span>
      </div>
      <span className={`shrink-0 font-bold text-[12px] ${cfg.valueCls}`}>{cfg.label}</span>
    </div>
  )
}

function CheckRow({ item }: { item: CheckItem }) {
  const cfg = CHECK_STATUS_CFG[item.status]
  return (
    <div className={`flex items-center justify-between rounded-[14px] px-3 py-2.5 ${cfg.bg}`}>
      <span className="font-bold text-[13px] text-brand-950">{item.label}</span>
      <span className={`font-bold text-[12px] ${cfg.valueCls}`}>{item.value}</span>
    </div>
  )
}

export function ReceitaPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<ReceitaStatus>('pendente')
  const [historicoOpen, setHistoricoOpen] = useState(false)
  const [sngpcProtocolo, setSngpcProtocolo] = useState<string | null>(null)

  const cfg = STATUS_CFG[status]
  const meds = MEDS[status]
  const checklist = CHECKLIST[status]
  const showContent = status !== 'idle' && status !== 'processando'

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between rounded-[24px] border border-brand-100 bg-white px-5 py-4">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-[26px] text-brand-950">Receita digital</span>
          <span className="text-[13px] text-text-secondary">
            Captura, leitura e validação da prescrição digital com fluxo rápido de conferência.
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1">
            {(['idle', 'processando', 'validado', 'pendente', 'rejeitado'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setStatus(s)
                  setSngpcProtocolo(null)
                }}
                className={[
                  'rounded-full px-2 py-0.5 font-mono text-[9px] uppercase transition-colors',
                  status === s
                    ? 'bg-brand-100 text-brand-750'
                    : 'text-brand-muted hover:bg-brand-50',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
          </div>
          <div
            className={`flex items-center rounded-[14px] border px-4 py-3 ${cfg.chipBg} ${cfg.chipText} ${cfg.chipBorder}`}
          >
            <span className="font-bold text-[12px]">{cfg.chipLabel}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setStatus('idle')
              setSngpcProtocolo(null)
            }}
            className="flex items-center rounded-[14px] bg-brand-900 px-4 py-3"
          >
            <span className="font-bold text-[12px] text-white">Nova conferência</span>
          </button>
        </div>
      </header>

      {/* Metrics */}
      {/* TODO: integrar com API — GET /api/v1/receita/metricas-dia */}
      <div className="grid shrink-0 grid-cols-5 gap-3.5">
        {METRICS.map((m) => (
          <div
            key={m.label}
            className={`flex flex-col gap-2 rounded-[20px] border p-4 ${m.bg} ${m.border}`}
          >
            <span className={`text-[12px] ${m.lbl}`}>{m.label}</span>
            <span className={`font-bold text-[24px] ${m.val}`}>{m.value}</span>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 gap-4">
        {/* Left — main */}
        <div className="flex min-h-0 flex-1 flex-col rounded-[24px] border border-brand-100 bg-white">
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
            {/* Section header */}
            <div className="flex items-center justify-between">
              <span className="font-bold text-[18px] text-brand-950">Captura e validação</span>
              <span
                className={`rounded-full border px-3 py-1.5 font-bold text-[12px] ${cfg.chipBg} ${cfg.chipText} ${cfg.chipBorder}`}
              >
                {cfg.chipLabel}
              </span>
            </div>

            {/* Upload — idle */}
            {status === 'idle' && (
              <div className="flex h-[180px] flex-col items-center justify-center gap-2.5 rounded-[22px] border border-brand-100 bg-brand-25 p-[18px] text-center">
                <span className="font-bold text-[16px] text-brand-950">
                  Solte o PDF, imagem ou link da receita digital aqui
                </span>
                <span className="text-[12px] text-text-secondary">
                  Aceita PDF assinado, QR code e documento capturado pela câmera.
                </span>
                <button
                  type="button"
                  onClick={() => setStatus('processando')}
                  className="flex items-center rounded-[14px] bg-brand-900 px-4 py-2.5"
                >
                  <span className="font-bold text-[12px] text-white">Importar receita</span>
                </button>
              </div>
            )}

            {/* Upload — processando */}
            {status === 'processando' && (
              <div className="flex h-[180px] flex-col items-center justify-center gap-2.5 rounded-[22px] border border-info-100 bg-info-50 p-[18px] text-center">
                <span className="font-bold text-[16px] text-brand-950">Processando receita...</span>
                <span className="text-[12px] text-info-700">
                  OCR em andamento. Aguarde a extração dos dados.
                </span>
                <button
                  type="button"
                  disabled
                  className="flex cursor-not-allowed items-center rounded-[14px] bg-brand-300 px-4 py-2.5"
                >
                  <span className="font-bold text-[12px] text-white">Aguardando...</span>
                </button>
              </div>
            )}

            {/* File bar — after import */}
            {showContent && (
              <div className="flex items-center gap-3 rounded-[16px] border border-brand-100 bg-brand-25 px-4 py-3">
                <span className="font-bold text-[13px] text-brand-950">receita_2024_0183.pdf</span>
                <span className="text-[12px] text-text-secondary">
                  · Arquivo importado com sucesso
                </span>
              </div>
            )}

            {/* Patient card */}
            {showContent && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[18px] text-brand-950">
                    Paciente e prescrição
                  </span>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setHistoricoOpen(true)}
                      className="font-bold text-[11px] text-brand-700 hover:underline"
                    >
                      Histórico
                    </button>
                    <span className="font-bold text-[12px] text-success-600">autenticado</span>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 rounded-[18px] border border-input-border bg-[#FBFCFB] px-4 py-3">
                  {PATIENT_ROWS.map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-1.5">
                      <span className="font-bold text-[12px] text-text-secondary">{label}</span>
                      <span className="font-bold text-[13px] text-brand-950">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prescription items */}
            {showContent && meds.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[18px] text-brand-950">Itens prescritos</span>
                  <span className="text-[12px] text-text-secondary">
                    {meds.length} medicamento{meds.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {meds.map((med) => (
                    <MedRow key={med.id} item={med} />
                  ))}
                </div>
              </div>
            )}

            {/* Status box */}
            {showContent && (
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
            )}

            {/* Confirmação SNGPC — exibida após liberar medicamento controlado */}
            {sngpcProtocolo && (
              <div className="flex flex-col gap-3 rounded-[20px] border border-brand-100 bg-brand-25 p-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-brand-75 px-3 py-1 font-bold text-[12px] text-success-600">
                    ● Registrado no SNGPC
                  </span>
                  <span className="font-bold font-mono text-[11px] text-brand-700">
                    {sngpcProtocolo}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-[13px] text-brand-950">
                    Sertralina 50mg — dispensação registrada
                  </p>
                  <p className="text-[12px] text-text-secondary">
                    Portaria 344 · Registro enviado automaticamente à ANVISA. Válido por 10 dias
                    úteis.
                  </p>
                </div>
              </div>
            )}

            {/* Action button */}
            {showContent && (
              <button
                type="button"
                disabled={cfg.btnDisabled}
                onClick={() => {
                  if (status === 'pendente') {
                    // TODO: POST /api/v1/receita/{id}/liberar — protocolo retornado como efeito colateral
                    setSngpcProtocolo('SNGPC-2026-008847')
                    setStatus('validado')
                  } else if (status === 'validado') {
                    navigate('/pdv?caixaAberto=true', {
                      state: { receita_id: 'RX-2026-007291', meds: ['Sertralina 50mg'] },
                    })
                  }
                }}
                className={`flex h-11 w-full items-center justify-center rounded-[14px] font-bold text-[13px] transition-colors ${cfg.btnCls}`}
              >
                {cfg.btnText}
              </button>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex w-[360px] shrink-0 flex-col gap-3 overflow-y-auto">
          {/* Checklist */}
          <div className="flex flex-col gap-3 rounded-[24px] border border-brand-100 bg-white p-[18px]">
            <span className="font-bold text-[18px] text-brand-950">Checklist de validação</span>
            <div className="flex flex-col gap-2">
              {checklist.map((item) => (
                <CheckRow key={item.label} item={item} />
              ))}
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="flex flex-col gap-3 rounded-[24px] border border-brand-100 bg-white p-[18px]">
            <span className="font-bold text-[18px] text-brand-950">Ações rápidas</span>
            <div className="flex flex-col gap-2">
              {ACOES.map((a) => (
                <div
                  key={a.label}
                  className="flex items-center justify-between rounded-[14px] bg-brand-25 px-3 py-2.5"
                >
                  <span className="font-bold text-[13px] text-brand-950">{a.label}</span>
                  <span className="text-[12px] text-success-600">{a.shortcut}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Histórico recente */}
          {/* TODO: integrar com API — GET /api/v1/receita/historico-recente */}
          <div className="flex flex-col gap-3 rounded-[24px] border border-brand-100 bg-white p-[18px]">
            <span className="font-bold text-[18px] text-brand-950">Histórico recente</span>
            <div className="flex flex-col gap-2">
              {HISTORICO.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-[14px] bg-brand-25 px-3 py-2.5"
                >
                  <span className="font-bold text-[13px] text-brand-950">{h.label}</span>
                  <span className={`text-[12px] ${h.statusCls}`}>{h.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {historicoOpen && <ModalHistoricoReceita onClose={() => setHistoricoOpen(false)} />}
    </div>
  )
}

/* ── Modal Histórico Paciente Receita ────────────────────────────── */

// TODO: integrar com API — GET /api/v1/receita/historico?cpf={cpf}
const HISTORICO_RECEITA = [
  {
    id: 1,
    data: '10/05/2026',
    medico: 'Dr. Carlos Andrade',
    medicamentos: 'Losartana 50mg, Metformina',
    status: 'validado' as const,
  },
  {
    id: 2,
    data: '15/04/2026',
    medico: 'Dr. Carlos Andrade',
    medicamentos: 'Sertralina 50mg',
    status: 'validado' as const,
  },
  {
    id: 3,
    data: '01/03/2026',
    medico: 'Dra. Patrícia Lima',
    medicamentos: 'Amoxicilina 500mg',
    status: 'rejeitado' as const,
  },
]

const HIST_RECEITA_CFG: Record<
  'validado' | 'pendente' | 'rejeitado',
  { label: string; cls: string }
> = {
  validado: { label: 'Validado', cls: 'text-success-600' },
  pendente: { label: 'Pendente', cls: 'text-warning-700' },
  rejeitado: { label: 'Rejeitado', cls: 'text-danger-700' },
}

function ModalHistoricoReceita({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar modal"
      />
      <div className="relative z-10 flex w-[620px] flex-col gap-4 rounded-[28px] bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[18px] text-brand-950">Histórico de receitas — paciente</h3>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-[16px] text-text-secondary hover:text-brand-950"
          >
            ✕
          </button>
        </div>
        <p className="text-[12px] text-text-secondary">CPF: 000.000.000-00 · últimas receitas</p>

        <div className="grid grid-cols-[80px_1fr_1fr_80px] gap-3 rounded-[12px] bg-[#F5F8F6] px-3 py-2.5">
          {['Data', 'Médico', 'Medicamentos', 'Status'].map((h) => (
            <span key={h} className="font-semibold text-[12px] text-text-secondary">
              {h}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {HISTORICO_RECEITA.map((h) => (
            <div
              key={h.id}
              className="grid grid-cols-[80px_1fr_1fr_80px] items-center gap-3 rounded-[14px] bg-[#FBFCFB] px-3 py-3"
            >
              <span className="text-[12px] text-text-secondary">{h.data}</span>
              <span className="font-bold text-[13px] text-brand-950">{h.medico}</span>
              <span className="text-[12px] text-text-secondary">{h.medicamentos}</span>
              <span className={`font-bold text-[12px] ${HIST_RECEITA_CFG[h.status].cls}`}>
                {HIST_RECEITA_CFG[h.status].label}
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
