import { useMemo, useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Fornecedor {
  id: string
  razao_social: string
  nome_fantasia: string
  cnpj: string
  ie: string
  regime_tributario: string
  tipo: string
  telefone: string
  email_pedidos: string
  nome_representante: string
  telefone_representante: string
  cep: string
  uf: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  prazo_pagamento: string
  desconto_padrao: string
  pedido_minimo: string
  forma_pagamento: string
  frete_padrao: string
  prazo_entrega: string
  status: 'ativo' | 'inativo'
}

type FornecedorFormData = Omit<Fornecedor, 'id'>

// ── Constants ─────────────────────────────────────────────────────────────────

const FORM_VAZIO: FornecedorFormData = {
  razao_social: '',
  nome_fantasia: '',
  cnpj: '',
  ie: '',
  regime_tributario: '',
  tipo: '',
  telefone: '',
  email_pedidos: '',
  nome_representante: '',
  telefone_representante: '',
  cep: '',
  uf: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  prazo_pagamento: '',
  desconto_padrao: '',
  pedido_minimo: '',
  forma_pagamento: '',
  frete_padrao: '',
  prazo_entrega: '',
  status: 'ativo',
}

// TODO: integrar com API — GET /api/v1/cadastros/fornecedores
const FORNECEDORES_MOCK: Fornecedor[] = [
  {
    id: '1',
    razao_social: 'Plasma Sul Distribuição Ltda',
    nome_fantasia: 'Plasma Sul',
    cnpj: '12.345.678/0001-99',
    ie: '123.456.789.000',
    regime_tributario: 'Lucro Presumido',
    tipo: 'Distribuidor',
    telefone: '(11) 3333-4444',
    email_pedidos: 'pedidos@plasmasul.com.br',
    nome_representante: 'Carlos Souza',
    telefone_representante: '(11) 98888-1234',
    cep: '04538-132',
    uf: 'SP',
    logradouro: 'Av. Brigadeiro Faria Lima',
    numero: '3500',
    complemento: '14º andar',
    bairro: 'Itaim Bibi',
    cidade: 'São Paulo',
    prazo_pagamento: '30',
    desconto_padrao: '5%',
    pedido_minimo: 'R$ 2.000,00',
    forma_pagamento: 'Boleto',
    frete_padrao: 'CIF',
    prazo_entrega: '3 dias',
    status: 'ativo',
  },
  {
    id: '2',
    razao_social: 'Medley Indústria Farmacêutica Ltda',
    nome_fantasia: 'Medley',
    cnpj: '23.456.789/0001-88',
    ie: '234.567.890.000',
    regime_tributario: 'Lucro Real',
    tipo: 'Fabricante',
    telefone: '(11) 4444-5555',
    email_pedidos: 'comercial@medley.com.br',
    nome_representante: 'Ana Lima',
    telefone_representante: '(11) 97777-2345',
    cep: '05426-100',
    uf: 'SP',
    logradouro: 'Rua do Caraíbas',
    numero: '640',
    complemento: '',
    bairro: 'Pinheiros',
    cidade: 'São Paulo',
    prazo_pagamento: '60',
    desconto_padrao: '8%',
    pedido_minimo: 'R$ 5.000,00',
    forma_pagamento: '30/60/90 dias',
    frete_padrao: 'CIF',
    prazo_entrega: '5 dias',
    status: 'ativo',
  },
  {
    id: '3',
    razao_social: 'EMS Sigma Pharma Ltda',
    nome_fantasia: 'EMS',
    cnpj: '34.567.890/0001-77',
    ie: '345.678.901.000',
    regime_tributario: 'Lucro Real',
    tipo: 'Fabricante',
    telefone: '(19) 3881-5000',
    email_pedidos: 'vendas@ems.com.br',
    nome_representante: 'Roberto Pinto',
    telefone_representante: '(19) 96666-3456',
    cep: '13331-070',
    uf: 'SP',
    logradouro: 'Rodovia Jornalista Francisco Aguirre Proença',
    numero: '1',
    complemento: 'Km 8',
    bairro: 'Itatiba',
    cidade: 'Hortolândia',
    prazo_pagamento: '30',
    desconto_padrao: '6%',
    pedido_minimo: 'R$ 3.000,00',
    forma_pagamento: 'Boleto',
    frete_padrao: 'CIF',
    prazo_entrega: '4 dias',
    status: 'ativo',
  },
  {
    id: '4',
    razao_social: 'Cristália Produtos Químicos Farm. Ltda',
    nome_fantasia: 'Cristália',
    cnpj: '45.678.901/0001-66',
    ie: '456.789.012.000',
    regime_tributario: 'Lucro Presumido',
    tipo: 'Fabricante',
    telefone: '(11) 3882-9000',
    email_pedidos: 'pedidos@cristalia.com.br',
    nome_representante: 'Fernanda Costa',
    telefone_representante: '(11) 95555-4567',
    cep: '05873-450',
    uf: 'SP',
    logradouro: 'Rua Itapeva',
    numero: '518',
    complemento: '9º andar',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    prazo_pagamento: '45',
    desconto_padrao: '4%',
    pedido_minimo: 'R$ 1.500,00',
    forma_pagamento: '30/60/90 dias',
    frete_padrao: 'FOB',
    prazo_entrega: '7 dias',
    status: 'ativo',
  },
  {
    id: '5',
    razao_social: 'Pfarma Distribuidora S/A',
    nome_fantasia: 'Pfarma',
    cnpj: '56.789.012/0001-55',
    ie: '567.890.123.000',
    regime_tributario: 'Simples Nacional',
    tipo: 'Distribuidor',
    telefone: '(21) 3333-6666',
    email_pedidos: 'compras@pfarma.com.br',
    nome_representante: 'João Alves',
    telefone_representante: '(21) 94444-5678',
    cep: '20031-005',
    uf: 'RJ',
    logradouro: 'Rua do Lavradio',
    numero: '208',
    complemento: '',
    bairro: 'Lapa',
    cidade: 'Rio de Janeiro',
    prazo_pagamento: '30',
    desconto_padrao: '3%',
    pedido_minimo: 'R$ 1.000,00',
    forma_pagamento: 'À vista',
    frete_padrao: 'CIF',
    prazo_entrega: '2 dias',
    status: 'ativo',
  },
  {
    id: '6',
    razao_social: 'Profarma Distribuidora S/A',
    nome_fantasia: 'Profarma',
    cnpj: '67.890.123/0001-44',
    ie: '678.901.234.000',
    regime_tributario: 'Lucro Real',
    tipo: 'Distribuidor',
    telefone: '(21) 4444-7777',
    email_pedidos: 'pedidos@profarma.com.br',
    nome_representante: 'Patrícia Dias',
    telefone_representante: '(21) 93333-6789',
    cep: '20031-170',
    uf: 'RJ',
    logradouro: 'Rua da Assembleia',
    numero: '100',
    complemento: '12º andar',
    bairro: 'Centro',
    cidade: 'Rio de Janeiro',
    prazo_pagamento: '60',
    desconto_padrao: '7%',
    pedido_minimo: 'R$ 4.000,00',
    forma_pagamento: '30/60/90 dias',
    frete_padrao: 'CIF',
    prazo_entrega: '3 dias',
    status: 'inativo',
  },
  {
    id: '7',
    razao_social: 'Multilab Indústria Farmacêutica Ltda',
    nome_fantasia: 'Multilab',
    cnpj: '78.901.234/0001-33',
    ie: '789.012.345.000',
    regime_tributario: 'Lucro Presumido',
    tipo: 'Fabricante',
    telefone: '(11) 5555-8888',
    email_pedidos: 'comercial@multilab.com.br',
    nome_representante: 'Marcos Oliveira',
    telefone_representante: '(11) 92222-7890',
    cep: '09851-050',
    uf: 'SP',
    logradouro: 'Rua José Caballero',
    numero: '660',
    complemento: '',
    bairro: 'Centro',
    cidade: 'São Bernardo do Campo',
    prazo_pagamento: '30',
    desconto_padrao: '5%',
    pedido_minimo: 'R$ 2.500,00',
    forma_pagamento: 'Boleto',
    frete_padrao: 'CIF',
    prazo_entrega: '5 dias',
    status: 'ativo',
  },
]

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

const REGIME_OPTIONS = ['Simples Nacional', 'Lucro Presumido', 'Lucro Real'] as const
const TIPO_OPTIONS = ['Fabricante', 'Distribuidor', 'Representante'] as const
const FORMA_PAGAMENTO_OPTIONS = [
  'À vista',
  'Boleto',
  '30 dias',
  '30/60/90 dias',
  '60/90/120 dias',
] as const
const FRETE_OPTIONS = ['CIF', 'FOB'] as const

// TODO: integrar com API — GET /api/v1/cadastros/fornecedores/{id}/pedidos
const PEDIDOS_MOCK = [
  {
    id: 1,
    data: '08/05/2026',
    nota: 'NF 001.234',
    valor: 'R$ 8.420,00',
    status: 'recebido' as const,
  },
  {
    id: 2,
    data: '22/04/2026',
    nota: 'NF 001.185',
    valor: 'R$ 12.600,00',
    status: 'recebido' as const,
  },
  {
    id: 3,
    data: '10/04/2026',
    nota: 'NF 001.120',
    valor: 'R$ 5.300,00',
    status: 'recebido' as const,
  },
  {
    id: 4,
    data: '01/04/2026',
    nota: 'NF 001.089',
    valor: 'R$ 9.750,00',
    status: 'pendente' as const,
  },
]

const PEDIDO_STATUS_CFG = {
  recebido: { label: 'Recebido', cls: 'text-success-600' },
  pendente: { label: 'Pendente', cls: 'text-warning-700' },
} as const

const STATUS_CFG = {
  ativo: { label: 'Ativo', bg: 'bg-brand-75', text: 'text-success-600' },
  inativo: { label: 'Inativo', bg: 'bg-neutral-50', text: 'text-neutral-500' },
} as const

const TIPO_CFG: Record<string, string> = {
  Fabricante: 'bg-info-50 text-info-700',
  Distribuidor: 'bg-brand-75 text-brand-700',
  Representante: 'bg-warning-50 text-warning-700',
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Iniciais({ nome }: { nome: string }) {
  const letters = nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-[12px] text-brand-700">
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
  readOnly,
}: {
  label: string
  id: string
  placeholder: string
  value: string
  onChange?: (v: string) => void
  readOnly?: boolean
}) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={id} className="font-bold text-[12px] text-text-secondary">
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

// ── Modal: Formulário (novo + editar) ─────────────────────────────────────────

function ModalFornecedorForm({
  fornecedor,
  onClose,
  onSave,
}: {
  fornecedor: Fornecedor | null
  onClose: () => void
  onSave: (data: FornecedorFormData, id?: string) => void
}) {
  const [form, setForm] = useState<FornecedorFormData>(fornecedor ? { ...fornecedor } : FORM_VAZIO)

  function set<K extends keyof FornecedorFormData>(key: K, value: FornecedorFormData[K]) {
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
      <div className="relative z-10 flex max-h-[90vh] w-[720px] flex-col overflow-hidden rounded-[28px] bg-white shadow-xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-brand-100 border-b px-7 py-5">
          <div>
            <p className="font-bold text-[18px] text-brand-950">
              {fornecedor ? 'Editar fornecedor' : 'Novo fornecedor'}
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
          {/* Dados da empresa */}
          <div className="flex flex-col gap-3 rounded-[16px] border border-brand-100 bg-white p-4">
            <p className="font-bold text-[14px] text-brand-950">Dados da empresa</p>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Razão social *"
                id="m-razao"
                placeholder="Razão social"
                value={form.razao_social}
                onChange={(v) => set('razao_social', v)}
              />
              <Field
                label="Nome fantasia"
                id="m-fantasia"
                placeholder="Nome fantasia"
                value={form.nome_fantasia}
                onChange={(v) => set('nome_fantasia', v)}
              />
              <Field
                label="CNPJ *"
                id="m-cnpj"
                placeholder="00.000.000/0000-00"
                value={form.cnpj}
                onChange={(v) => set('cnpj', v)}
              />
              <Field
                label="Inscrição estadual"
                id="m-ie"
                placeholder="Inscrição estadual"
                value={form.ie}
                onChange={(v) => set('ie', v)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldSelect
                label="Regime tributário"
                id="m-regime"
                value={form.regime_tributario}
                onChange={(v) => set('regime_tributario', v)}
                options={REGIME_OPTIONS}
                placeholder="Simples / Lucro Presumido / Real"
              />
              <FieldSelect
                label="Tipo"
                id="m-tipo"
                value={form.tipo}
                onChange={(v) => set('tipo', v)}
                options={TIPO_OPTIONS}
                placeholder="Fabricante / Distribuidor / Representante"
              />
            </div>
          </div>

          {/* Contato */}
          <div className="flex flex-col gap-3 rounded-[16px] border border-brand-100 bg-white p-4">
            <p className="font-bold text-[14px] text-brand-950">Contato</p>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Telefone comercial"
                id="m-tel"
                placeholder="(00) 0000-0000"
                value={form.telefone}
                onChange={(v) => set('telefone', v)}
              />
              <Field
                label="E-mail para pedidos"
                id="m-email"
                placeholder="pedidos@empresa.com"
                value={form.email_pedidos}
                onChange={(v) => set('email_pedidos', v)}
              />
              <Field
                label="Nome do representante"
                id="m-rep"
                placeholder="Nome do representante"
                value={form.nome_representante}
                onChange={(v) => set('nome_representante', v)}
              />
              <Field
                label="Telefone do representante"
                id="m-telrep"
                placeholder="(00) 00000-0000"
                value={form.telefone_representante}
                onChange={(v) => set('telefone_representante', v)}
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
                  label="UF"
                  id="m-uf"
                  value={form.uf}
                  onChange={(v) => set('uf', v)}
                  options={UF_OPTIONS}
                  placeholder="UF"
                />
              </div>
            </div>
            <Field
              label="Logradouro"
              id="m-logr"
              placeholder="Rua, avenida, praça..."
              value={form.logradouro}
              onChange={(v) => set('logradouro', v)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Número"
                id="m-num"
                placeholder="Número"
                value={form.numero}
                onChange={(v) => set('numero', v)}
              />
              <Field
                label="Complemento"
                id="m-comp"
                placeholder="Complemento"
                value={form.complemento}
                onChange={(v) => set('complemento', v)}
              />
              <Field
                label="Bairro"
                id="m-bairro"
                placeholder="Bairro"
                value={form.bairro}
                onChange={(v) => set('bairro', v)}
              />
              <Field
                label="Cidade"
                id="m-cidade"
                placeholder="Cidade"
                value={form.cidade}
                onChange={(v) => set('cidade', v)}
              />
            </div>
          </div>

          {/* Condições comerciais */}
          <div className="flex flex-col gap-3 rounded-[16px] border border-brand-100 bg-white p-4">
            <p className="font-bold text-[14px] text-brand-950">Condições comerciais</p>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Prazo de pagamento"
                id="m-prazo"
                placeholder="30 dias"
                value={form.prazo_pagamento}
                onChange={(v) => set('prazo_pagamento', v)}
              />
              <Field
                label="Desconto padrão"
                id="m-desc"
                placeholder="5%"
                value={form.desconto_padrao}
                onChange={(v) => set('desconto_padrao', v)}
              />
              <Field
                label="Pedido mínimo (R$)"
                id="m-pedmin"
                placeholder="R$ 0,00"
                value={form.pedido_minimo}
                onChange={(v) => set('pedido_minimo', v)}
              />
              <FieldSelect
                label="Forma de pagamento"
                id="m-forma"
                value={form.forma_pagamento}
                onChange={(v) => set('forma_pagamento', v)}
                options={FORMA_PAGAMENTO_OPTIONS}
                placeholder="À vista / boleto / prazo"
              />
              <FieldSelect
                label="Frete padrão"
                id="m-frete"
                value={form.frete_padrao}
                onChange={(v) => set('frete_padrao', v)}
                options={FRETE_OPTIONS}
                placeholder="CIF / FOB"
              />
              <Field
                label="Prazo de entrega"
                id="m-prent"
                placeholder="10 dias"
                value={form.prazo_entrega}
                onChange={(v) => set('prazo_entrega', v)}
              />
            </div>
            <FieldSelect
              label="Status"
              id="m-status"
              value={form.status}
              onChange={(v) => set('status', v as 'ativo' | 'inativo')}
              options={['ativo', 'inativo']}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 gap-3 border-brand-100 border-t px-7 py-5">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-brand-200 font-bold text-[13px] text-brand-700 hover:bg-brand-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onSave(form, fornecedor?.id)}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] bg-brand-900 font-bold text-[13px] text-white hover:opacity-90"
          >
            {fornecedor ? 'Salvar alterações' : 'Criar fornecedor'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal: Histórico de pedidos ────────────────────────────────────────────────

function ModalPedidosFornecedor({
  fornecedor,
  onClose,
}: {
  fornecedor: Fornecedor
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar modal"
        className="absolute inset-0 cursor-default bg-brand-950/30"
      />
      <div className="relative z-10 flex w-[620px] flex-col gap-4 rounded-[28px] bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <p className="font-bold text-[18px] text-brand-950">Últimos pedidos</p>
            <p className="text-[12px] text-text-secondary">
              {fornecedor.nome_fantasia} · CNPJ: {fornecedor.cnpj}
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

        <div className="grid grid-cols-[80px_100px_1fr_90px] items-center gap-3 rounded-[12px] bg-[#F5F8F6] px-3 py-2.5">
          {['Data', 'Nota', 'Valor', 'Status'].map((h) => (
            <span key={h} className="font-bold text-[11px] text-brand-muted">
              {h}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {PEDIDOS_MOCK.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[80px_100px_1fr_90px] items-center gap-3 rounded-[14px] bg-[#FBFCFB] px-3 py-3"
            >
              <span className="text-[12px] text-text-secondary">{p.data}</span>
              <span className="font-bold text-[12px] text-brand-950">{p.nota}</span>
              <span className="text-[12px] text-brand-950">{p.valor}</span>
              <span className={`font-bold text-[12px] ${PEDIDO_STATUS_CFG[p.status].cls}`}>
                {PEDIDO_STATUS_CFG[p.status].label}
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

export function CadastroFornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(FORNECEDORES_MOCK)
  const [busca, setBusca] = useState('')
  const [novoOpen, setNovoOpen] = useState(false)
  const [editando, setEditando] = useState<Fornecedor | null>(null)
  const [pedidosAberto, setPedidosAberto] = useState<Fornecedor | null>(null)

  const stats = useMemo(
    () => ({
      total: fornecedores.length,
      ativos: fornecedores.filter((f) => f.status === 'ativo').length,
      semCnpj: fornecedores.filter((f) => !f.cnpj).length,
      cnpjPendente: 36, // TODO: calcular via API
      pedidosRecentes: 1284, // TODO: buscar via API
      historicoFiscal: 214, // TODO: buscar via API
    }),
    [fornecedores]
  )

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return fornecedores
    return fornecedores.filter(
      (f) =>
        f.razao_social.toLowerCase().includes(q) ||
        f.nome_fantasia.toLowerCase().includes(q) ||
        f.cnpj.includes(q) ||
        f.cidade.toLowerCase().includes(q)
    )
  }, [fornecedores, busca])

  function handleSalvar(data: FornecedorFormData, id?: string) {
    if (id) {
      // TODO: integrar com API — PUT /api/v1/cadastros/fornecedores/{id}
      setFornecedores((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)))
    } else {
      // TODO: integrar com API — POST /api/v1/cadastros/fornecedores
      setFornecedores((prev) => [...prev, { ...data, id: crypto.randomUUID() }])
    }
    setNovoOpen(false)
    setEditando(null)
  }

  const METRICAS = [
    {
      label: 'Fornecedores ativos',
      value: String(stats.ativos),
      detail: 'Base homologada',
      detailCls: 'text-success-600',
      bg: 'bg-white',
    },
    {
      label: 'CNPJ pendente',
      value: String(stats.cnpjPendente),
      detail: 'Revisar documentos',
      detailCls: 'text-warning-700',
      bg: 'bg-white',
    },
    {
      label: 'Prazo de resposta',
      value: '92%',
      detail: 'Respostas no SLA',
      detailCls: 'text-success-600',
      bg: 'bg-white',
    },
    {
      label: 'Pedidos recentes',
      value: stats.pedidosRecentes.toLocaleString('pt-BR'),
      detail: 'Últimos 30 dias',
      detailCls: 'text-brand-700',
      bg: 'bg-white',
    },
    {
      label: 'Histórico fiscal',
      value: String(stats.historicoFiscal),
      detail: 'Certidões e contratos',
      detailCls: 'text-warning-700',
      bg: 'bg-warning-25',
      labelCls: 'font-bold text-warning-800',
    },
  ]

  const ALERTAS = [
    { title: 'CNPJ irregular', desc: '36 cadastros pendentes' },
    { title: 'Sem contrato', desc: 'Fornecedores sem acordo' },
    { title: 'Prazo vencido', desc: 'Pedidos acima do SLA' },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between rounded-3xl border border-brand-100 bg-white px-5.5 py-4">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-[22px] text-brand-950 leading-none">Fornecedores</span>
          <span className="text-[13px] text-text-secondary">
            Dados fiscais, contato e condições comerciais em um único cadastro.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setNovoOpen(true)}
          className="flex h-10 items-center gap-2 rounded-[14px] bg-brand-900 px-4 font-bold text-[13px] text-white hover:opacity-90"
        >
          <span className="font-normal text-[16px] leading-none">+</span>
          Novo fornecedor
        </button>
      </div>

      {/* ── Métricas ─────────────────────────────────────────────── */}
      <div className="grid shrink-0 grid-cols-5 gap-3.5">
        {METRICAS.map((m) => (
          <div
            key={m.label}
            className={`flex flex-col gap-1.5 rounded-[20px] border border-brand-100 p-4 ${m.bg}`}
          >
            <span className={`text-[12px] ${m.labelCls ?? 'text-text-secondary'}`}>{m.label}</span>
            <span className="font-bold text-[24px] text-brand-950">{m.value}</span>
            <span className={`text-[12px] ${m.detailCls}`}>{m.detail}</span>
          </div>
        ))}
      </div>

      {/* ── Alerta fiscal ─────────────────────────────────────────── */}
      <div className="flex shrink-0 flex-col gap-3 rounded-[24px] border border-warning-100 bg-warning-25 p-5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[16px] text-warning-800">Fiscal e contratos</span>
          <span className="font-bold text-[12px] text-warning-700">Cadastro + compras</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {ALERTAS.map((a) => (
            <div key={a.title} className="flex flex-col gap-1 rounded-[14px] bg-white p-3.5">
              <span className="font-bold text-[13px] text-brand-950">{a.title}</span>
              <span className="text-[12px] text-warning-700">{a.desc}</span>
            </div>
          ))}
        </div>
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
              placeholder="Buscar por razão social, CNPJ ou cidade..."
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
            {filtrados.length} {filtrados.length === 1 ? 'fornecedor' : 'fornecedores'}
          </span>
        </div>

        {/* header da tabela */}
        <div className="grid shrink-0 grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)_100px_110px_80px_90px_130px] items-center gap-3 bg-[#F5F8F6] px-5 py-2.5">
          {['Fornecedor', 'Cidade', 'Tipo', 'Forma pagto.', 'Entrega', 'Status', 'Ações'].map(
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
                Nenhum fornecedor encontrado para "{busca}"
              </p>
            </div>
          ) : (
            filtrados.map((f) => {
              const st = STATUS_CFG[f.status]
              const tipoCls = TIPO_CFG[f.tipo] ?? 'bg-brand-75 text-brand-700'
              return (
                <div
                  key={f.id}
                  className="grid grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)_100px_110px_80px_90px_130px] items-center gap-3 rounded-[14px] bg-[#FBFCFB] px-4 py-3"
                >
                  {/* Fornecedor */}
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Iniciais nome={f.razao_social} />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-bold text-[13px] text-brand-950">
                        {f.nome_fantasia || f.razao_social}
                      </span>
                      <span className="text-[11px] text-text-secondary">{f.cnpj}</span>
                    </div>
                  </div>
                  {/* Cidade */}
                  <span className="text-[12px] text-text-secondary">
                    {f.cidade}
                    {f.uf ? ` — ${f.uf}` : ''}
                  </span>
                  {/* Tipo */}
                  <div>
                    {f.tipo ? (
                      <span className={`rounded-full px-2.5 py-1 font-bold text-[11px] ${tipoCls}`}>
                        {f.tipo}
                      </span>
                    ) : (
                      <span className="text-[12px] text-brand-muted">—</span>
                    )}
                  </div>
                  {/* Forma pagto */}
                  <span className="text-[12px] text-text-secondary">
                    {f.forma_pagamento || '—'}
                  </span>
                  {/* Prazo entrega */}
                  <span className="text-[12px] text-brand-950">{f.prazo_entrega || '—'}</span>
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
                      onClick={() => setEditando(f)}
                      className="flex h-8 items-center rounded-[10px] border border-brand-200 px-3 font-bold text-[11px] text-brand-700 hover:bg-brand-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setPedidosAberto(f)}
                      className="flex h-8 items-center rounded-[10px] border border-brand-100 px-3 font-bold text-[11px] text-brand-muted hover:bg-brand-50"
                    >
                      Pedidos
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
        <ModalFornecedorForm
          fornecedor={null}
          onClose={() => setNovoOpen(false)}
          onSave={handleSalvar}
        />
      )}
      {editando && (
        <ModalFornecedorForm
          fornecedor={editando}
          onClose={() => setEditando(null)}
          onSave={handleSalvar}
        />
      )}
      {pedidosAberto && (
        <ModalPedidosFornecedor fornecedor={pedidosAberto} onClose={() => setPedidosAberto(null)} />
      )}
    </div>
  )
}
