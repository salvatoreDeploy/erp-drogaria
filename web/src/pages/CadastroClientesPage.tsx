import { useMemo, useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Cliente {
  id: string
  nome: string
  cpf: string
  telefone: string
  email: string
  convenio: string | null
  pontos: number
  ultima_compra: string | null
  status: 'ativo' | 'inativo'
  aceitar_whatsapp: boolean
  aceitar_sms: boolean
  cep: string
  estado: string
  logradouro: string
  numero: string
  complemento: string
  condicoes_cronicas: string
  alergias: string
  medico_referencia: string
  id_fidelidade: string
}

type ClienteFormData = Omit<Cliente, 'id' | 'pontos' | 'ultima_compra'>

// ── Constants ─────────────────────────────────────────────────────────────────

const FORM_VAZIO: ClienteFormData = {
  nome: '',
  cpf: '',
  telefone: '',
  email: '',
  convenio: null,
  status: 'ativo',
  aceitar_whatsapp: true,
  aceitar_sms: false,
  cep: '',
  estado: '',
  logradouro: '',
  numero: '',
  complemento: '',
  condicoes_cronicas: '',
  alergias: '',
  medico_referencia: '',
  id_fidelidade: '',
}

// TODO: integrar com API — GET /api/v1/cadastros/clientes
const CLIENTES_MOCK: Cliente[] = [
  {
    id: '1',
    nome: 'Maria Silva Santos',
    cpf: '123.456.789-00',
    telefone: '(11) 98765-4321',
    email: 'maria.silva@email.com',
    convenio: 'Farmácia Popular',
    pontos: 1240,
    ultima_compra: '10/05/2026',
    status: 'ativo',
    aceitar_whatsapp: true,
    aceitar_sms: false,
    cep: '01310-100',
    estado: 'SP',
    logradouro: 'Av. Paulista',
    numero: '1000',
    complemento: 'Apto 45',
    condicoes_cronicas: 'Hipertensão, Diabetes tipo 2',
    alergias: 'Penicilina',
    medico_referencia: 'Dr. Carlos Mendes',
    id_fidelidade: '0001 2345',
  },
  {
    id: '2',
    nome: 'João Carlos Pereira',
    cpf: '987.654.321-00',
    telefone: '(21) 97654-3210',
    email: 'joao.pereira@email.com',
    convenio: null,
    pontos: 380,
    ultima_compra: '08/05/2026',
    status: 'ativo',
    aceitar_whatsapp: false,
    aceitar_sms: true,
    cep: '20040-020',
    estado: 'RJ',
    logradouro: 'Rua da Assembleia',
    numero: '50',
    complemento: '',
    condicoes_cronicas: '',
    alergias: '',
    medico_referencia: '',
    id_fidelidade: '0002 3456',
  },
  {
    id: '3',
    nome: 'Ana Paula Rodrigues',
    cpf: '456.789.123-00',
    telefone: '(31) 96543-2109',
    email: 'ana.rodrigues@email.com',
    convenio: 'Unimed',
    pontos: 2750,
    ultima_compra: '05/05/2026',
    status: 'ativo',
    aceitar_whatsapp: true,
    aceitar_sms: true,
    cep: '30130-170',
    estado: 'MG',
    logradouro: 'Av. Afonso Pena',
    numero: '3000',
    complemento: 'Sala 12',
    condicoes_cronicas: 'Asma',
    alergias: 'Dipirona',
    medico_referencia: 'Dra. Fernanda Lima',
    id_fidelidade: '0003 4567',
  },
  {
    id: '4',
    nome: 'Roberto Almeida Costa',
    cpf: '321.654.987-00',
    telefone: '(41) 95432-1098',
    email: 'roberto.costa@email.com',
    convenio: 'Farmácia Popular',
    pontos: 90,
    ultima_compra: '02/05/2026',
    status: 'ativo',
    aceitar_whatsapp: true,
    aceitar_sms: false,
    cep: '80010-010',
    estado: 'PR',
    logradouro: 'Rua XV de Novembro',
    numero: '700',
    complemento: '',
    condicoes_cronicas: 'Hipertensão',
    alergias: '',
    medico_referencia: '',
    id_fidelidade: '0004 5678',
  },
  {
    id: '5',
    nome: 'Claudia Fernanda Moura',
    cpf: '654.321.098-00',
    telefone: '(51) 94321-0987',
    email: 'claudia.moura@email.com',
    convenio: null,
    pontos: 560,
    ultima_compra: '28/04/2026',
    status: 'ativo',
    aceitar_whatsapp: false,
    aceitar_sms: false,
    cep: '90010-000',
    estado: 'RS',
    logradouro: 'Rua dos Andradas',
    numero: '1200',
    complemento: 'Cobertura',
    condicoes_cronicas: 'Diabetes tipo 1',
    alergias: 'Sulfas',
    medico_referencia: 'Dr. Paulo Ribeiro',
    id_fidelidade: '0005 6789',
  },
  {
    id: '6',
    nome: 'Fernando Lopes Martins',
    cpf: '789.012.345-00',
    telefone: '(85) 93210-9876',
    email: 'fernando.martins@email.com',
    convenio: 'SulAmérica',
    pontos: 1890,
    ultima_compra: '20/04/2026',
    status: 'inativo',
    aceitar_whatsapp: true,
    aceitar_sms: true,
    cep: '60160-050',
    estado: 'CE',
    logradouro: 'Av. Beira Mar',
    numero: '3500',
    complemento: '',
    condicoes_cronicas: '',
    alergias: '',
    medico_referencia: '',
    id_fidelidade: '0006 7890',
  },
  {
    id: '7',
    nome: 'Patricia Souza Nunes',
    cpf: '012.345.678-00',
    telefone: '(62) 92109-8765',
    email: 'patricia.nunes@email.com',
    convenio: 'Farmácia Popular',
    pontos: 320,
    ultima_compra: '15/04/2026',
    status: 'ativo',
    aceitar_whatsapp: true,
    aceitar_sms: false,
    cep: '74110-010',
    estado: 'GO',
    logradouro: 'Av. Goiás',
    numero: '400',
    complemento: '',
    condicoes_cronicas: 'Hipotireoidismo',
    alergias: '',
    medico_referencia: 'Dra. Sandra Campos',
    id_fidelidade: '0007 8901',
  },
  {
    id: '8',
    nome: 'Lucas Henrique Barbosa',
    cpf: '345.678.901-00',
    telefone: '(48) 91098-7654',
    email: 'lucas.barbosa@email.com',
    convenio: null,
    pontos: 0,
    ultima_compra: null,
    status: 'ativo',
    aceitar_whatsapp: false,
    aceitar_sms: false,
    cep: '88010-400',
    estado: 'SC',
    logradouro: 'Rua Felipe Schmidt',
    numero: '300',
    complemento: 'Bl. B',
    condicoes_cronicas: '',
    alergias: '',
    medico_referencia: '',
    id_fidelidade: '',
  },
]

// TODO: integrar com API — GET /api/v1/cadastros/clientes/metricas
const UF_OPTIONS = [
  'AC',
  'AL',
  'AM',
  'AP',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MG',
  'MS',
  'MT',
  'PA',
  'PB',
  'PE',
  'PI',
  'PR',
  'RJ',
  'RN',
  'RO',
  'RR',
  'RS',
  'SC',
  'SE',
  'SP',
  'TO',
] as const

const CONVENIO_OPTIONS = [
  'Farmácia Popular',
  'Unimed',
  'SulAmérica',
  'Bradesco Saúde',
  'Amil',
] as const

// TODO: integrar com API — GET /api/v1/cadastros/clientes/{id}/historico
const HISTORICO_MOCK = [
  {
    id: 1,
    data: '10/05/2026',
    tipo: 'Receita',
    descricao: 'Losartana 50mg',
    status: 'validado' as const,
  },
  {
    id: 2,
    data: '05/04/2026',
    tipo: 'PBM',
    descricao: 'Farmácia Popular — desc. 45%',
    status: 'autorizado' as const,
  },
  {
    id: 3,
    data: '20/03/2026',
    tipo: 'Receita',
    descricao: 'Sertralina 50mg',
    status: 'validado' as const,
  },
  {
    id: 4,
    data: '10/02/2026',
    tipo: 'PBM',
    descricao: 'Farmácia Popular',
    status: 'autorizado' as const,
  },
]

const HIST_STATUS_CFG = {
  validado: { label: 'Validado', cls: 'text-success-600' },
  autorizado: { label: 'Autorizado', cls: 'text-brand-700' },
} as const

const STATUS_CFG = {
  ativo: { label: 'Ativo', bg: 'bg-brand-75', text: 'text-success-600' },
  inativo: { label: 'Inativo', bg: 'bg-neutral-50', text: 'text-neutral-500' },
} as const

// ── Sub-components ─────────────────────────────────────────────────────────────

function Iniciais({ nome }: { nome: string }) {
  const letters = nome
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-[13px] text-brand-700">
      {letters}
    </span>
  )
}

function Field({
  label,
  id,
  placeholder,
  value,
  onChange,
  labelCls,
  readOnly,
}: {
  label: string
  id: string
  placeholder: string
  value: string
  onChange?: (v: string) => void
  labelCls?: string
  readOnly?: boolean
}) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={id} className={`font-bold text-[12px] ${labelCls ?? 'text-text-secondary'}`}>
        {label}
      </label>
      <div
        className={`flex h-11 items-center rounded-[10px] border border-input-border px-[14px] ${readOnly ? 'bg-brand-25' : 'bg-white'}`}
      >
        <input
          id={id}
          type="text"
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={readOnly ? undefined : (e) => onChange?.(e.target.value)}
          className="w-full bg-transparent text-[13px] text-brand-950 outline-none placeholder:text-brand-muted"
        />
      </div>
    </div>
  )
}

function FieldSelect({
  label,
  id,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string
  id: string
  value: string
  onChange: (v: string) => void
  options: readonly string[]
  placeholder?: string
}) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={id} className="font-bold text-[12px] text-text-secondary">
        {label}
      </label>
      <div className="flex h-11 items-center rounded-[10px] border border-input-border bg-white px-[14px]">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-[13px] text-brand-950 outline-none"
        >
          <option value="">{placeholder ?? 'Selecione'}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function Toggle({
  label,
  checked,
  onToggle,
}: {
  label: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className="flex items-center gap-2"
    >
      <span
        className={`relative flex h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-success-600' : 'bg-brand-100'}`}
      >
        <span
          className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-[23px]' : 'translate-x-[3px]'}`}
        />
      </span>
      <span className="font-bold text-[12px] text-text-secondary">{label}</span>
    </button>
  )
}

// ── Modal: Formulário (novo + editar) ─────────────────────────────────────────

function ModalClienteForm({
  cliente,
  onClose,
  onSave,
}: {
  cliente: Cliente | null
  onClose: () => void
  onSave: (data: ClienteFormData, id?: string) => void
}) {
  const [form, setForm] = useState<ClienteFormData>(
    cliente
      ? {
          nome: cliente.nome,
          cpf: cliente.cpf,
          telefone: cliente.telefone,
          email: cliente.email,
          convenio: cliente.convenio,
          status: cliente.status,
          aceitar_whatsapp: cliente.aceitar_whatsapp,
          aceitar_sms: cliente.aceitar_sms,
          cep: cliente.cep,
          estado: cliente.estado,
          logradouro: cliente.logradouro,
          numero: cliente.numero,
          complemento: cliente.complemento,
          condicoes_cronicas: cliente.condicoes_cronicas,
          alergias: cliente.alergias,
          medico_referencia: cliente.medico_referencia,
          id_fidelidade: cliente.id_fidelidade,
        }
      : FORM_VAZIO
  )

  function set<K extends keyof ClienteFormData>(key: K, value: ClienteFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar modal"
        className="absolute inset-0 cursor-default bg-brand-950/30"
      />
      <div className="relative z-10 flex max-h-[90vh] w-[680px] flex-col overflow-hidden rounded-[28px] bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-brand-100 border-b px-7 py-5">
          <div>
            <p className="font-bold text-[18px] text-brand-950">
              {cliente ? 'Editar cliente' : 'Novo cliente'}
            </p>
            <p className="text-[12px] text-text-secondary">* campos obrigatórios</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-[13px] text-brand-600 hover:bg-brand-100"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-7 py-5">
          {/* Dados pessoais */}
          <div className="flex flex-col gap-3 rounded-[16px] border border-brand-100 bg-white p-4">
            <p className="font-bold text-[14px] text-brand-950">Dados pessoais</p>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Nome completo *"
                id="m-nome"
                placeholder="Nome completo"
                value={form.nome}
                onChange={(v) => set('nome', v)}
              />
              <Field
                label="CPF *"
                id="m-cpf"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={(v) => set('cpf', v)}
              />
              <Field
                label="Telefone *"
                id="m-tel"
                placeholder="(00) 00000-0000"
                value={form.telefone}
                onChange={(v) => set('telefone', v)}
              />
              <Field
                label="E-mail"
                id="m-email"
                placeholder="nome@email.com"
                value={form.email}
                onChange={(v) => set('email', v)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldSelect
                label="Convênio"
                id="m-convenio"
                value={form.convenio ?? ''}
                onChange={(v) => set('convenio', v || null)}
                options={CONVENIO_OPTIONS}
                placeholder="Sem convênio"
              />
              <FieldSelect
                label="Status"
                id="m-status"
                value={form.status}
                onChange={(v) => set('status', v as 'ativo' | 'inativo')}
                options={['ativo', 'inativo']}
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="flex flex-col gap-3 rounded-[16px] border border-brand-100 bg-white p-4">
            <p className="font-bold text-[14px] text-brand-950">Endereço</p>
            <div className="grid grid-cols-3 gap-3">
              <Field
                label="CEP"
                id="m-cep"
                placeholder="00000-000"
                value={form.cep}
                onChange={(v) => set('cep', v)}
              />
              <div className="col-span-2">
                <FieldSelect
                  label="Estado"
                  id="m-estado"
                  value={form.estado}
                  onChange={(v) => set('estado', v)}
                  options={UF_OPTIONS}
                  placeholder="UF"
                />
              </div>
            </div>
            <Field
              label="Logradouro"
              id="m-logradouro"
              placeholder="Rua, Avenida..."
              value={form.logradouro}
              onChange={(v) => set('logradouro', v)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Número"
                id="m-numero"
                placeholder="Número"
                value={form.numero}
                onChange={(v) => set('numero', v)}
              />
              <Field
                label="Complemento"
                id="m-complemento"
                placeholder="Apto, bloco..."
                value={form.complemento}
                onChange={(v) => set('complemento', v)}
              />
            </div>
          </div>

          {/* Saúde (opcional) */}
          <div className="flex flex-col gap-3 rounded-[16px] border border-warning-100 bg-warning-25 p-4">
            <p className="font-bold text-[14px] text-warning-800">Saúde (opcional)</p>
            <Field
              label="Condições crônicas"
              id="m-cronicas"
              placeholder="Ex: hipertensão, diabetes..."
              value={form.condicoes_cronicas}
              onChange={(v) => set('condicoes_cronicas', v)}
              labelCls="text-warning-800"
            />
            <Field
              label="Alergias conhecidas"
              id="m-alergias"
              placeholder="Ex: penicilina, dipirona..."
              value={form.alergias}
              onChange={(v) => set('alergias', v)}
              labelCls="text-warning-800"
            />
            <Field
              label="Médico de referência"
              id="m-medico"
              placeholder="Nome do médico"
              value={form.medico_referencia}
              onChange={(v) => set('medico_referencia', v)}
              labelCls="text-warning-800"
            />
          </div>

          {/* Fidelização */}
          <div className="flex flex-col gap-3 rounded-[16px] border border-brand-100 bg-white p-4">
            <p className="font-bold text-[14px] text-brand-950">Fidelização e comunicação</p>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Nº cartão fidelidade"
                id="m-fidelidade"
                placeholder="0000 0000"
                value={form.id_fidelidade}
                onChange={(v) => set('id_fidelidade', v)}
              />
              {cliente && (
                <Field
                  label="Saldo de pontos"
                  id="m-pontos"
                  placeholder="0 pts"
                  value={`${cliente.pontos} pts`}
                  readOnly
                />
              )}
            </div>
            <div className="flex gap-6">
              <Toggle
                label="Autoriza WhatsApp"
                checked={form.aceitar_whatsapp}
                onToggle={() => set('aceitar_whatsapp', !form.aceitar_whatsapp)}
              />
              <Toggle
                label="Autoriza SMS"
                checked={form.aceitar_sms}
                onToggle={() => set('aceitar_sms', !form.aceitar_sms)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-brand-100 border-t px-7 py-5">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-brand-200 font-bold text-[13px] text-brand-700 hover:bg-brand-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onSave(form, cliente?.id)}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] bg-brand-900 font-bold text-[13px] text-white hover:opacity-90"
          >
            {cliente ? 'Salvar alterações' : 'Criar cliente'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal: Histórico ──────────────────────────────────────────────────────────

function ModalHistoricoCliente({ cliente, onClose }: { cliente: Cliente; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar modal"
        className="absolute inset-0 cursor-default bg-brand-950/30"
      />
      <div className="relative z-10 flex w-[640px] flex-col gap-4 rounded-[28px] bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <p className="font-bold text-[18px] text-brand-950">Histórico do cliente</p>
            <p className="text-[12px] text-text-secondary">
              {cliente.nome} · CPF: {cliente.cpf}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-[13px] text-brand-600 hover:bg-brand-100"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-[80px_70px_1fr_90px] items-center gap-3 rounded-[12px] bg-[#F5F8F6] px-3 py-2.5">
          {['Data', 'Tipo', 'Descrição', 'Status'].map((h) => (
            <span key={h} className="font-bold text-[11px] text-brand-muted">
              {h}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {HISTORICO_MOCK.map((h) => (
            <div
              key={h.id}
              className="grid grid-cols-[80px_70px_1fr_90px] items-center gap-3 rounded-[14px] bg-[#FBFCFB] px-3 py-3"
            >
              <span className="text-[12px] text-text-secondary">{h.data}</span>
              <span className="font-bold text-[12px] text-brand-950">{h.tipo}</span>
              <span className="text-[12px] text-text-secondary">{h.descricao}</span>
              <span className={`font-bold text-[12px] ${HIST_STATUS_CFG[h.status].cls}`}>
                {HIST_STATUS_CFG[h.status].label}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-full items-center justify-center rounded-[14px] border border-brand-200 font-bold text-[13px] text-brand-700 hover:bg-brand-50"
        >
          Fechar
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function CadastroClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>(CLIENTES_MOCK)
  const [busca, setBusca] = useState('')
  const [novoOpen, setNovoOpen] = useState(false)
  const [editando, setEditando] = useState<Cliente | null>(null)
  const [historicoAberto, setHistoricoAberto] = useState<Cliente | null>(null)

  const stats = useMemo(
    () => ({
      total: clientes.length,
      ativos: clientes.filter((c) => c.status === 'ativo').length,
      comConvenio: clientes.filter((c) => c.convenio).length,
      pontos: clientes.reduce((s, c) => s + c.pontos, 0),
      comWhats: clientes.filter((c) => c.aceitar_whatsapp).length,
    }),
    [clientes]
  )

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return clientes
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        c.cpf.includes(q) ||
        c.telefone.includes(q) ||
        c.email.toLowerCase().includes(q)
    )
  }, [clientes, busca])

  function handleSalvar(data: ClienteFormData, id?: string) {
    if (id) {
      // TODO: integrar com API — PUT /api/v1/cadastros/clientes/{id}
      setClientes((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
    } else {
      // TODO: integrar com API — POST /api/v1/cadastros/clientes
      setClientes((prev) => [
        ...prev,
        { ...data, id: crypto.randomUUID(), pontos: 0, ultima_compra: null },
      ])
    }
    setNovoOpen(false)
    setEditando(null)
  }

  const METRICAS = [
    {
      label: 'Total cadastrados',
      value: String(stats.total),
      detail: 'Base total',
      detailCls: 'text-brand-700',
    },
    {
      label: 'Clientes ativos',
      value: String(stats.ativos),
      detail: 'Com cadastro ativo',
      detailCls: 'text-success-600',
    },
    {
      label: 'Com convênio',
      value: String(stats.comConvenio),
      detail: 'Vinculados a programa',
      detailCls: 'text-brand-700',
    },
    {
      label: 'Pontos emitidos',
      value: stats.pontos.toLocaleString('pt-BR'),
      detail: 'Total acumulado',
      detailCls: 'text-brand-700',
    },
    {
      label: 'Opt-in WhatsApp',
      value: `${Math.round((stats.comWhats / stats.total) * 100)}%`,
      detail: 'Autorizaram envio',
      detailCls: 'text-success-600',
    },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between rounded-3xl border border-brand-100 bg-white px-5.5 py-4">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-[22px] text-brand-950 leading-none">Clientes</span>
          <span className="text-[13px] text-text-secondary">
            Cadastro, histórico e comunicação dos seus clientes.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setNovoOpen(true)}
          className="flex h-10 items-center gap-2 rounded-[14px] bg-brand-900 px-4 font-bold text-[13px] text-white hover:opacity-90"
        >
          <span className="font-normal text-[16px] leading-none">+</span>
          Novo cliente
        </button>
      </div>

      {/* ── Métricas ─────────────────────────────────────────────── */}
      <div className="grid shrink-0 grid-cols-5 gap-3.5">
        {METRICAS.map((m) => (
          <div
            key={m.label}
            className="flex flex-col gap-1.5 rounded-[20px] border border-brand-100 bg-white p-4"
          >
            <span className="text-[12px] text-text-secondary">{m.label}</span>
            <span className="font-bold text-[24px] text-brand-950">{m.value}</span>
            <span className={`text-[12px] ${m.detailCls}`}>{m.detail}</span>
          </div>
        ))}
      </div>

      {/* ── Tabela ───────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-brand-100 bg-white">
        {/* barra de busca */}
        <div className="flex shrink-0 items-center gap-3 border-brand-100 border-b px-5 py-3.5">
          <div className="flex flex-1 items-center gap-2 rounded-[12px] border border-input-border bg-white px-3.5 py-2.5">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="5" stroke="#9BB5AB" strokeWidth="1.5" />
              <path
                d="M10.5 10.5L13.5 13.5"
                stroke="#9BB5AB"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, CPF ou telefone..."
              className="flex-1 bg-transparent text-[13px] text-brand-950 outline-none placeholder:text-brand-muted"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca('')}
                className="text-[11px] text-brand-muted hover:text-brand-700"
              >
                ✕
              </button>
            )}
          </div>
          <span className="shrink-0 text-[12px] text-text-secondary">
            {filtrados.length} {filtrados.length === 1 ? 'cliente' : 'clientes'}
          </span>
        </div>

        {/* header da tabela */}
        <div className="grid shrink-0 grid-cols-[minmax(0,2.5fr)_minmax(0,1.2fr)_minmax(0,1fr)_110px_80px_90px_130px] items-center gap-3 bg-[#F5F8F6] px-5 py-2.5">
          {['Cliente', 'Telefone', 'Convênio', 'Pontos', 'Últ. compra', 'Status', 'Ações'].map(
            (h) => (
              <span key={h} className="font-bold text-[11px] text-brand-muted">
                {h}
              </span>
            )
          )}
        </div>

        {/* linhas */}
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
          {filtrados.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-12">
              <p className="text-[13px] text-text-secondary">
                Nenhum cliente encontrado para "{busca}"
              </p>
            </div>
          ) : (
            filtrados.map((c) => {
              const st = STATUS_CFG[c.status]
              return (
                <div
                  key={c.id}
                  className="grid grid-cols-[minmax(0,2.5fr)_minmax(0,1.2fr)_minmax(0,1fr)_110px_80px_90px_130px] items-center gap-3 rounded-[14px] bg-[#FBFCFB] px-4 py-3"
                >
                  {/* Cliente */}
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Iniciais nome={c.nome} />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-bold text-[13px] text-brand-950">
                        {c.nome}
                      </span>
                      <span className="text-[11px] text-text-secondary">{c.cpf}</span>
                    </div>
                  </div>
                  {/* Telefone */}
                  <span className="text-[12px] text-text-secondary">{c.telefone}</span>
                  {/* Convênio */}
                  <div>
                    {c.convenio ? (
                      <span className="rounded-full bg-brand-75 px-2.5 py-1 font-bold text-[11px] text-brand-700">
                        {c.convenio}
                      </span>
                    ) : (
                      <span className="text-[12px] text-brand-muted">—</span>
                    )}
                  </div>
                  {/* Pontos */}
                  <span className="font-bold text-[13px] text-brand-950">
                    {c.pontos > 0 ? c.pontos.toLocaleString('pt-BR') : '—'}
                  </span>
                  {/* Últ. compra */}
                  <span className="text-[12px] text-text-secondary">{c.ultima_compra ?? '—'}</span>
                  {/* Status */}
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 font-bold text-[11px] ${st.bg} ${st.text}`}
                  >
                    ● {st.label}
                  </span>
                  {/* Ações */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditando(c)}
                      className="flex h-8 items-center rounded-[10px] border border-brand-200 px-3 font-bold text-[11px] text-brand-700 hover:bg-brand-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoricoAberto(c)}
                      className="flex h-8 items-center rounded-[10px] border border-brand-100 px-3 font-bold text-[11px] text-brand-muted hover:bg-brand-50"
                    >
                      Histórico
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Modais ────────────────────────────────────────────────── */}
      {novoOpen && (
        <ModalClienteForm cliente={null} onClose={() => setNovoOpen(false)} onSave={handleSalvar} />
      )}
      {editando && (
        <ModalClienteForm
          cliente={editando}
          onClose={() => setEditando(null)}
          onSave={handleSalvar}
        />
      )}
      {historicoAberto && (
        <ModalHistoricoCliente cliente={historicoAberto} onClose={() => setHistoricoAberto(null)} />
      )}
    </div>
  )
}
