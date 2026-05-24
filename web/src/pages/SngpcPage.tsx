import { useMemo, useState } from 'react'
import type {
  LoteEnvioSngpc,
  MovimentacaoSngpc,
  MovimentacaoSngpcStatus,
  TipoMovimentacaoSngpc,
} from '../schemas'

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOVIMENTACOES: MovimentacaoSngpc[] = [
  {
    id: '1',
    tipo: 'saida',
    produto: 'Ritalina 10mg',
    dcb: '07578',
    lote: 'L-1042',
    quantidade: 2,
    paciente: 'Mariana Souza',
    cpf_paciente: '032.456.789-01',
    crm_medico: 'CRM/SP 12345',
    receita_id: 'RX-2026-007291',
    data: '2026-05-18T10:22:00Z',
    status: 'pendente',
  },
  {
    id: '2',
    tipo: 'saida',
    produto: 'Morfina 10mg',
    dcb: '07576',
    lote: 'L-0881',
    quantidade: 1,
    paciente: 'Carlos Mendes',
    cpf_paciente: '045.678.912-34',
    crm_medico: 'CRM/SP 98765',
    receita_id: 'RX-2026-007288',
    data: '2026-05-18T09:45:00Z',
    status: 'pendente',
  },
  {
    id: '3',
    tipo: 'saida',
    produto: 'Clonazepam 2mg',
    dcb: '02390',
    lote: 'L-2241',
    quantidade: 30,
    paciente: 'Ana Ferreira',
    cpf_paciente: '091.234.567-89',
    crm_medico: 'CRM/SP 33210',
    receita_id: 'RX-2026-007275',
    data: '2026-05-18T09:10:00Z',
    status: 'conferido',
  },
  {
    id: '4',
    tipo: 'saida',
    produto: 'Alprazolam 1mg',
    dcb: '00744',
    lote: 'L-1105',
    quantidade: 20,
    paciente: 'Roberto Lima',
    cpf_paciente: '078.345.612-00',
    crm_medico: 'CRM/SP 55431',
    receita_id: 'RX-2026-007260',
    data: '2026-05-17T16:30:00Z',
    status: 'conferido',
  },
  {
    id: '5',
    tipo: 'saida',
    produto: 'Codeína 30mg',
    dcb: '02568',
    lote: 'L-0997',
    quantidade: 10,
    paciente: 'Fernanda Costa',
    cpf_paciente: '110.987.654-32',
    crm_medico: 'CRM/SP 71002',
    receita_id: 'RX-2026-007251',
    data: '2026-05-17T15:55:00Z',
    status: 'divergencia',
    observacao: 'Receita física ilegível — rasura no campo do produto.',
  },
  {
    id: '6',
    tipo: 'saida',
    produto: 'Fenobarbital 100mg',
    dcb: '04267',
    lote: 'L-2300',
    quantidade: 30,
    paciente: 'Paulo Rodrigues',
    cpf_paciente: '055.123.456-78',
    crm_medico: 'CRM/SP 18800',
    receita_id: 'RX-2026-007244',
    data: '2026-05-17T14:20:00Z',
    status: 'conferido',
  },
  {
    id: '7',
    tipo: 'saida',
    produto: 'Ritalina LA 20mg',
    dcb: '07578',
    lote: 'L-1080',
    quantidade: 1,
    paciente: 'Beatriz Santos',
    cpf_paciente: '027.654.321-09',
    crm_medico: 'CRM/SP 44556',
    receita_id: 'RX-2026-007238',
    data: '2026-05-17T11:00:00Z',
    status: 'pendente',
  },
  {
    id: '8',
    tipo: 'saida',
    produto: 'Morfina 30mg',
    dcb: '07576',
    lote: 'L-0905',
    quantidade: 2,
    paciente: 'Luiz Oliveira',
    cpf_paciente: '088.234.567-12',
    crm_medico: 'CRM/SP 60001',
    receita_id: 'RX-2026-007230',
    data: '2026-05-16T17:40:00Z',
    status: 'pendente',
  },
  {
    id: '9',
    tipo: 'saida',
    produto: 'Clonazepam 0,5mg',
    dcb: '02390',
    lote: 'L-2210',
    quantidade: 30,
    paciente: 'Juliana Pires',
    cpf_paciente: '033.456.789-55',
    crm_medico: 'CRM/SP 29900',
    receita_id: 'RX-2026-007220',
    data: '2026-05-16T14:15:00Z',
    status: 'pendente',
  },
  {
    id: '10',
    tipo: 'saida',
    produto: 'Alprazolam 0,5mg',
    dcb: '00744',
    lote: 'L-1100',
    quantidade: 30,
    paciente: 'Marcos Teixeira',
    cpf_paciente: '066.789.012-34',
    crm_medico: 'CRM/SP 81234',
    receita_id: 'RX-2026-007215',
    data: '2026-05-16T10:30:00Z',
    status: 'conferido',
  },
  {
    id: '11',
    tipo: 'saida',
    produto: 'Codeína 15mg',
    dcb: '02568',
    lote: 'L-1005',
    quantidade: 5,
    paciente: 'Patrícia Alves',
    cpf_paciente: '099.012.345-67',
    crm_medico: 'CRM/SP 53300',
    receita_id: 'RX-2026-007200',
    data: '2026-05-15T15:00:00Z',
    status: 'pendente',
  },
  {
    id: '12',
    tipo: 'saida',
    produto: 'Fenobarbital 50mg',
    dcb: '04267',
    lote: 'L-2280',
    quantidade: 30,
    paciente: 'Eduardo Melo',
    cpf_paciente: '011.345.678-90',
    crm_medico: 'CRM/SP 37700',
    receita_id: 'RX-2026-007195',
    data: '2026-05-15T11:20:00Z',
    status: 'divergencia',
    observacao: 'Quantidade dispensada diverge da receita (30 vs 15 comprimidos).',
  },
  {
    id: '13',
    tipo: 'saida',
    produto: 'Ritalina 20mg',
    dcb: '07578',
    lote: 'L-1055',
    quantidade: 2,
    paciente: 'Camila Nascimento',
    cpf_paciente: '022.456.789-01',
    crm_medico: 'CRM/SP 61122',
    receita_id: 'RX-2026-007180',
    data: '2026-05-15T09:00:00Z',
    status: 'conferido',
  },
  {
    id: '14',
    tipo: 'saida',
    produto: 'Morfina 5mg',
    dcb: '07576',
    lote: 'L-0920',
    quantidade: 1,
    paciente: 'Helena Sousa',
    cpf_paciente: '077.890.123-45',
    crm_medico: 'CRM/SP 20040',
    receita_id: 'RX-2026-007170',
    data: '2026-05-14T16:45:00Z',
    status: 'pendente',
  },
  {
    id: '15',
    tipo: 'saida',
    produto: 'Clonazepam 1mg',
    dcb: '02390',
    lote: 'L-2250',
    quantidade: 20,
    paciente: 'Thiago Carvalho',
    cpf_paciente: '044.567.890-12',
    crm_medico: 'CRM/SP 49900',
    receita_id: 'RX-2026-007155',
    data: '2026-05-14T13:10:00Z',
    status: 'pendente',
  },
  {
    id: '16',
    tipo: 'entrada',
    produto: 'Ritalina 10mg',
    dcb: '07578',
    lote: 'L-1090',
    quantidade: 200,
    data: '2026-05-13T08:00:00Z',
    status: 'conferido',
  },
  {
    id: '17',
    tipo: 'entrada',
    produto: 'Morfina 10mg',
    dcb: '07576',
    lote: 'L-0950',
    quantidade: 100,
    data: '2026-05-12T08:30:00Z',
    status: 'conferido',
  },
  {
    id: '18',
    tipo: 'entrada',
    produto: 'Clonazepam 2mg',
    dcb: '02390',
    lote: 'L-2260',
    quantidade: 500,
    data: '2026-05-10T09:15:00Z',
    status: 'pendente',
  },
  {
    id: '19',
    tipo: 'ajuste',
    produto: 'Alprazolam 1mg',
    dcb: '00744',
    lote: 'L-1095',
    quantidade: 5,
    data: '2026-05-09T14:00:00Z',
    status: 'pendente',
    observacao: 'Ajuste por inventário físico — diferença de 5 unidades.',
  },
  {
    id: '20',
    tipo: 'ajuste',
    produto: 'Fenobarbital 100mg',
    dcb: '04267',
    lote: 'L-2290',
    quantidade: 3,
    data: '2026-05-08T11:00:00Z',
    status: 'divergencia',
    observacao: 'Ajuste não autorizado — aguardando supervisão de farmacêutico.',
  },
]

const HISTORICO_LOTES: LoteEnvioSngpc[] = [
  {
    lote_id: 'h1',
    protocolo: 'ANVISA-2026-118432',
    enviados: 18,
    rejeitados: 0,
    status: 'aceito',
    enviado_em: '2026-05-17T18:00:00Z',
    farmaceutico: 'João Silva',
  },
  {
    lote_id: 'h2',
    protocolo: 'ANVISA-2026-115009',
    enviados: 22,
    rejeitados: 2,
    status: 'rejeitado_parcial',
    enviado_em: '2026-05-16T18:00:00Z',
    farmaceutico: 'João Silva',
  },
  {
    lote_id: 'h3',
    protocolo: 'ANVISA-2026-111755',
    enviados: 15,
    rejeitados: 0,
    status: 'aceito',
    enviado_em: '2026-05-15T18:00:00Z',
    farmaceutico: 'Maria Farmacêutica',
  },
  {
    lote_id: 'h4',
    protocolo: 'ANVISA-2026-108221',
    enviados: 30,
    rejeitados: 0,
    status: 'aceito',
    enviado_em: '2026-05-14T18:00:00Z',
    farmaceutico: 'João Silva',
  },
  {
    lote_id: 'h5',
    protocolo: 'ANVISA-2026-104887',
    enviados: 12,
    rejeitados: 0,
    status: 'aceito',
    enviado_em: '2026-05-13T18:00:00Z',
    farmaceutico: 'Maria Farmacêutica',
  },
]

// ── Config tables ─────────────────────────────────────────────────────────────

const TIPO_CFG: Record<TipoMovimentacaoSngpc, { label: string; bg: string; text: string }> = {
  saida: { label: 'Saída', bg: 'bg-danger-50', text: 'text-danger-700' },
  entrada: { label: 'Entrada', bg: 'bg-brand-75', text: 'text-brand-750' },
  ajuste: { label: 'Ajuste', bg: 'bg-warning-50', text: 'text-warning-700' },
}

const STATUS_CFG: Record<MovimentacaoSngpcStatus, { label: string; bg: string; text: string }> = {
  pendente: { label: '● Pendente', bg: 'bg-neutral-50', text: 'text-neutral-500' },
  conferido: { label: '✓ Conferido', bg: 'bg-brand-75', text: 'text-success-600' },
  divergencia: { label: '✗ Divergência', bg: 'bg-danger-50', text: 'text-danger-700' },
}

const LOTE_STATUS_CFG = {
  aceito: { label: '✓ Aceito', bg: 'bg-brand-75', text: 'text-success-600' },
  rejeitado_parcial: { label: '⚠ Parcial', bg: 'bg-warning-50', text: 'text-warning-700' },
  rejeitado_total: { label: '✗ Rejeitado', bg: 'bg-danger-50', text: 'text-danger-700' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function fmtDataCurta(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

// ── ModalDetalheMovimentacao ──────────────────────────────────────────────────

function ModalDetalheMovimentacao({
  mov,
  onClose,
  onConferir,
  onDivergencia,
}: {
  mov: MovimentacaoSngpc
  onClose: () => void
  onConferir: (id: string) => void
  onDivergencia: (id: string, obs: string) => void
}) {
  const [obs, setObs] = useState(mov.observacao ?? '')

  function ReadonlyField({ label, value }: { label: string; value?: string }) {
    if (!value) return null
    return (
      <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
        <p className="font-bold text-[12px] text-input-label">{label}</p>
        <span className="text-[14px] text-brand-950">{value}</span>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar modal"
      />
      <div className="relative z-10 flex w-[540px] flex-col gap-5 rounded-[28px] bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-[18px] text-brand-950">Detalhe da movimentação</p>
            <p className="text-[12px] text-text-secondary">
              DCB {mov.dcb} · Lote {mov.lote}
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

        {/* Dados */}
        <div className="grid grid-cols-2 gap-3">
          <ReadonlyField label="Produto" value={mov.produto} />
          <ReadonlyField label="Quantidade" value={String(mov.quantidade)} />
          <ReadonlyField label="Tipo" value={TIPO_CFG[mov.tipo].label} />
          <ReadonlyField label="Data" value={fmtData(mov.data)} />
          {mov.paciente && <ReadonlyField label="Paciente" value={mov.paciente} />}
          {mov.cpf_paciente && <ReadonlyField label="CPF" value={mov.cpf_paciente} />}
          {mov.crm_medico && <ReadonlyField label="CRM Médico" value={mov.crm_medico} />}
          {mov.receita_id && <ReadonlyField label="N.º Receita" value={mov.receita_id} />}
        </div>

        {/* Observação */}
        <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
          <label htmlFor="obs-sngpc" className="font-bold text-[12px] text-input-label">
            Observação {mov.status === 'divergencia' && '(divergência registrada)'}
          </label>
          <textarea
            id="obs-sngpc"
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            rows={3}
            className="resize-none bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
            placeholder="Descreva a divergência encontrada…"
          />
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onDivergencia(mov.id, obs)}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-danger-100 font-bold text-[13px] text-danger-700 hover:bg-danger-50"
          >
            ✗ Marcar divergência
          </button>
          <button
            type="button"
            onClick={() => onConferir(mov.id)}
            disabled={mov.status === 'conferido'}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] bg-brand-900 font-bold text-[13px] text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-brand-300"
          >
            ✓ Conferir
          </button>
        </div>
      </div>
    </div>
  )
}

// ── SngpcPage ─────────────────────────────────────────────────────────────────

export function SngpcPage() {
  const [movs, setMovs] = useState<MovimentacaoSngpc[]>(MOVIMENTACOES)
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [filtroTipo, setFiltroTipo] = useState<'todos' | TipoMovimentacaoSngpc>('todos')
  const [busca, setBusca] = useState('')
  const [detalheOpen, setDetalheOpen] = useState<MovimentacaoSngpc | null>(null)
  const [anvisaOnline, setAnvisaOnline] = useState(true)
  const [historicoLotes, setHistoricoLotes] = useState<LoteEnvioSngpc[]>(HISTORICO_LOTES)
  const [ultimoEnvio, setUltimoEnvio] = useState<{ protocolo: string; enviados: number } | null>(
    null
  )

  // Filtragem
  const filtradas = useMemo(() => {
    return movs.filter((m) => {
      if (filtroTipo !== 'todos' && m.tipo !== filtroTipo) return false
      if (busca) {
        const q = busca.toLowerCase()
        if (
          !m.produto.toLowerCase().includes(q) &&
          !m.paciente?.toLowerCase().includes(q) &&
          !m.lote.toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [movs, filtroTipo, busca])

  // Métricas
  const stats = useMemo(
    () => ({
      pendentes: movs.filter((m) => m.status === 'pendente').length,
      conferidos: movs.filter((m) => m.status === 'conferido').length,
      divergencias: movs.filter((m) => m.status === 'divergencia').length,
    }),
    [movs]
  )

  // IDs selecionados que estão conferidos (aptos para envio)
  const selecionadosConferidos = selecionados.filter(
    (id) => movs.find((m) => m.id === id)?.status === 'conferido'
  )

  function handleConferir(ids: string[]) {
    setMovs((prev) =>
      prev.map((m) => (ids.includes(m.id) ? { ...m, status: 'conferido' as const } : m))
    )
  }

  function handleDivergencia(id: string, observacao: string) {
    setMovs((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'divergencia' as const, observacao } : m))
    )
    setDetalheOpen(null)
  }

  function handleEnviarLote() {
    // TODO: POST /api/v1/sngpc/enviar-lote
    const protocolo = `ANVISA-2026-${Math.floor(Math.random() * 900000 + 100000)}`
    const novoLote: LoteEnvioSngpc = {
      lote_id: crypto.randomUUID(),
      protocolo,
      enviados: selecionadosConferidos.length,
      rejeitados: 0,
      status: 'aceito',
      enviado_em: new Date().toISOString(),
      farmaceutico: 'João Silva',
    }
    setHistoricoLotes((prev) => [novoLote, ...prev])
    setMovs((prev) => prev.filter((m) => !selecionadosConferidos.includes(m.id)))
    setSelecionados([])
    setUltimoEnvio({ protocolo, enviados: selecionadosConferidos.length })
  }

  function toggleSelecionar(id: string) {
    setSelecionados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function toggleSelecionarTodos() {
    const ids = filtradas.map((m) => m.id)
    setSelecionados(selecionados.length === filtradas.length ? [] : ids)
  }

  const todosSelecionados = filtradas.length > 0 && selecionados.length === filtradas.length

  return (
    <div className="flex min-h-0 flex-1 gap-4">
      {/* ── Coluna esquerda ──────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between rounded-3xl border border-brand-100 bg-white px-5.5 py-4">
          <div>
            <h1 className="font-bold text-[20px] text-brand-950">SNGPC</h1>
            <p className="text-[13px] text-text-secondary">
              Conferência e envio de controlados à ANVISA
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Demo switcher ANVISA */}
            {(['online', 'offline'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setAnvisaOnline(s === 'online')}
                className={[
                  'rounded-full px-2 py-0.5 font-mono text-[9px] uppercase transition-colors',
                  (s === 'online') === anvisaOnline
                    ? 'bg-brand-100 text-brand-750'
                    : 'text-brand-muted hover:bg-brand-50',
                ].join(' ')}
              >
                {s}
              </button>
            ))}

            {/* Chip ANVISA status */}
            <div
              className={[
                'flex items-center gap-2 rounded-full border px-3 py-1.5',
                anvisaOnline ? 'border-brand-200 bg-brand-75' : 'border-warning-100 bg-warning-50',
              ].join(' ')}
            >
              <span
                className={[
                  'h-2 w-2 rounded-full',
                  anvisaOnline ? 'bg-success-600' : 'bg-warning-600',
                ].join(' ')}
              />
              <span
                className={[
                  'font-bold text-[12px]',
                  anvisaOnline ? 'text-success-600' : 'text-warning-700',
                ].join(' ')}
              >
                ANVISA {anvisaOnline ? 'online' : 'offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Barra de filtros */}
        <div className="flex items-center gap-3 rounded-3xl border border-brand-100 bg-white px-5 py-3">
          {/* Filtro tipo */}
          {(['todos', 'saida', 'entrada', 'ajuste'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFiltroTipo(t)}
              className={[
                'rounded-xl border px-3 py-1.5 font-semibold text-[12px] transition-colors',
                filtroTipo === t
                  ? 'border-brand-700 bg-brand-75 text-brand-750'
                  : 'border-brand-100 bg-white text-brand-muted hover:bg-brand-50',
              ].join(' ')}
            >
              {t === 'todos'
                ? 'Todos'
                : t === 'saida'
                  ? 'Saída'
                  : t === 'entrada'
                    ? 'Entrada'
                    : 'Ajuste'}
            </button>
          ))}

          <div className="mx-1 h-4 w-px bg-brand-100" />

          {/* Busca */}
          <input
            type="text"
            placeholder="Buscar produto, paciente ou lote…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 rounded-xl border border-input-border bg-input-bg px-3 py-1.5 text-[13px] text-brand-950 outline-none placeholder:text-input-placeholder focus:border-brand-700 focus:ring-1 focus:ring-brand-700/20"
          />

          <span className="text-[12px] text-text-secondary">{filtradas.length} mov.</span>
        </div>

        {/* Tabela */}
        <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-brand-100 bg-white">
          {/* Header da tabela */}
          <div className="grid grid-cols-[20px_minmax(0,2fr)_minmax(0,1.2fr)_72px_50px_80px_100px_48px] items-center gap-3 rounded-t-3xl bg-[#F5F8F6] px-5 py-3">
            <input
              type="checkbox"
              checked={todosSelecionados}
              onChange={toggleSelecionarTodos}
              className="h-3.5 w-3.5 accent-brand-700"
              aria-label="Selecionar todos"
            />
            {['Produto / DCB', 'Paciente / CRM', 'Tipo', 'Qtd', 'Data', 'Status', ''].map((h) => (
              <span key={h} className="font-bold text-[11px] text-brand-muted">
                {h}
              </span>
            ))}
          </div>

          {/* Linhas */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {filtradas.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-[13px] text-text-secondary">
                Nenhuma movimentação encontrada
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {filtradas.map((mov) => {
                  const tipoCfg = TIPO_CFG[mov.tipo]
                  const statusCfg = STATUS_CFG[mov.status]
                  const selecionado = selecionados.includes(mov.id)

                  return (
                    <div
                      key={mov.id}
                      className={[
                        'grid grid-cols-[20px_minmax(0,2fr)_minmax(0,1.2fr)_72px_50px_80px_100px_48px] items-center gap-3 rounded-[14px] px-5 py-3 transition-colors',
                        selecionado
                          ? 'border border-brand-200 bg-brand-25'
                          : mov.status === 'divergencia'
                            ? 'bg-danger-50'
                            : 'bg-[#FBFCFB]',
                      ].join(' ')}
                    >
                      <input
                        type="checkbox"
                        checked={selecionado}
                        onChange={() => toggleSelecionar(mov.id)}
                        className="h-3.5 w-3.5 accent-brand-700"
                        aria-label={`Selecionar ${mov.produto}`}
                      />

                      {/* Produto */}
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate font-semibold text-[13px] text-brand-950">
                          {mov.produto}
                        </span>
                        <span className="text-[11px] text-text-secondary">
                          DCB {mov.dcb} · {mov.lote}
                        </span>
                      </div>

                      {/* Paciente ou origem */}
                      <div className="flex min-w-0 flex-col gap-0.5">
                        {mov.paciente ? (
                          <>
                            <span className="truncate text-[12px] text-brand-950">
                              {mov.paciente}
                            </span>
                            <span className="text-[11px] text-text-secondary">
                              {mov.crm_medico ?? ''}
                            </span>
                          </>
                        ) : (
                          <span className="text-[12px] text-text-secondary">
                            {mov.tipo === 'entrada' ? 'NF-e entrada' : 'Ajuste inventário'}
                          </span>
                        )}
                      </div>

                      {/* Tipo badge */}
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold text-[10px] ${tipoCfg.bg} ${tipoCfg.text}`}
                      >
                        {tipoCfg.label}
                      </span>

                      {/* Qtd */}
                      <span className="font-semibold text-[13px] text-brand-950">
                        {mov.quantidade}
                      </span>

                      {/* Data */}
                      <span className="text-[11px] text-text-secondary">
                        {fmtDataCurta(mov.data)}
                      </span>

                      {/* Status badge */}
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold text-[10px] ${statusCfg.bg} ${statusCfg.text}`}
                      >
                        {statusCfg.label}
                      </span>

                      {/* Detalhe */}
                      <button
                        type="button"
                        onClick={() => setDetalheOpen(mov)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-100 text-[12px] text-brand-600 hover:bg-brand-50"
                        aria-label="Ver detalhe"
                      >
                        ↗
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Painel direito ────────────────────────────────────────────────── */}
      <div className="flex w-82.5 shrink-0 flex-col gap-4">
        {/* Métricas */}
        <div className="rounded-3xl border border-brand-100 bg-white p-5">
          <p className="mb-3 font-bold text-[14px] text-brand-950">Situação atual</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: 'Pendentes',
                value: stats.pendentes,
                bg: 'bg-white',
                border: 'border-brand-100',
                lbl: 'text-text-secondary',
                val: 'text-brand-950',
              },
              {
                label: 'Conferidos',
                value: stats.conferidos,
                bg: 'bg-brand-25',
                border: 'border-brand-100',
                lbl: 'text-success-600',
                val: 'text-brand-900',
              },
              {
                label: 'Divergências',
                value: stats.divergencias,
                bg: 'bg-danger-50',
                border: 'border-danger-100',
                lbl: 'text-danger-700',
                val: 'text-danger-800',
              },
            ].map((m) => (
              <div
                key={m.label}
                className={`flex flex-col gap-1 rounded-[16px] border p-3 ${m.bg} ${m.border}`}
              >
                <span className={`font-semibold text-[10px] ${m.lbl}`}>{m.label}</span>
                <span className={`font-bold text-[22px] ${m.val}`}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ações de conferência */}
        <div className="flex flex-col gap-3 rounded-3xl border border-brand-100 bg-white p-5">
          <p className="font-bold text-[14px] text-brand-950">Ações em lote</p>

          {selecionados.length > 0 && (
            <div className="rounded-[14px] border border-brand-100 bg-brand-25 px-3 py-2">
              <p className="text-[12px] text-brand-700">
                <span className="font-bold">{selecionados.length}</span> selecionadas ·{' '}
                <span className="font-bold text-success-600">{selecionadosConferidos.length}</span>{' '}
                conferidas
              </p>
            </div>
          )}

          <button
            type="button"
            disabled={selecionados.length === 0}
            onClick={() => handleConferir(selecionados)}
            className="flex h-10 items-center justify-center rounded-[14px] border border-brand-200 font-bold text-[13px] text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ✓ Conferir selecionadas
          </button>

          <button
            type="button"
            disabled={selecionadosConferidos.length === 0}
            onClick={handleEnviarLote}
            className="flex h-11 items-center justify-center rounded-[14px] bg-brand-900 font-bold text-[13px] text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-brand-300"
          >
            {/* TODO: POST /api/v1/sngpc/enviar-lote */}
            Enviar lote
            {selecionadosConferidos.length > 0 && (
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-[11px]">
                {selecionadosConferidos.length}
              </span>
            )}
          </button>
        </div>

        {/* Card protocolo (após envio) */}
        {ultimoEnvio && (
          <div className="flex flex-col gap-2 rounded-3xl border border-brand-100 bg-brand-25 p-5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success-600" />
              <span className="font-bold text-[13px] text-success-600">Lote enviado</span>
            </div>
            <p className="font-bold text-[12px] text-brand-950">{ultimoEnvio.protocolo}</p>
            <p className="text-[11px] text-text-secondary">
              {ultimoEnvio.enviados} movimentações aceitas pela ANVISA
            </p>
            <button
              type="button"
              onClick={() => setUltimoEnvio(null)}
              className="mt-1 text-[11px] text-brand-muted hover:text-brand-700"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Histórico de lotes */}
        <div className="flex flex-1 flex-col gap-3 overflow-hidden rounded-3xl border border-brand-100 bg-white p-5">
          <p className="font-bold text-[14px] text-brand-950">Histórico de envios</p>
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
            {/* TODO: GET /api/v1/sngpc/lotes */}
            {historicoLotes.map((lote) => {
              const cfg = LOTE_STATUS_CFG[lote.status]
              return (
                <div
                  key={lote.lote_id}
                  className="flex flex-col gap-1 rounded-[14px] border border-brand-100 bg-[#FBFCFB] px-3 py-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[12px] text-brand-950">{lote.protocolo}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-semibold text-[10px] ${cfg.bg} ${cfg.text}`}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary">
                    {lote.enviados} env.{lote.rejeitados > 0 ? ` · ${lote.rejeitados} rej.` : ''} ·{' '}
                    {lote.farmaceutico} · {fmtDataCurta(lote.enviado_em)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Modal de detalhe */}
      {detalheOpen && (
        <ModalDetalheMovimentacao
          mov={detalheOpen}
          onClose={() => setDetalheOpen(null)}
          onConferir={(id) => {
            handleConferir([id])
            setDetalheOpen(null)
          }}
          onDivergencia={handleDivergencia}
        />
      )}
    </div>
  )
}
