import { useMemo, useState } from 'react'
import { Badge } from '../components/ui'
import { type Produto, type ProdutoForm, ProdutoFormSchema, type ProdutoStatus } from '../schemas'

// ——— Constants ———

const CATEGORIAS = [
  'analgésico',
  'anti-inflamatório',
  'antibiótico',
  'cardiovascular',
  'dermatológico',
  'gastrointestinal',
  'neurológico',
  'outro',
  'psiquiátrico',
  'vitamina',
]

const FORMAS = [
  'cápsula',
  'comprimido',
  'creme',
  'gel',
  'injetável',
  'pomada',
  'solução oral',
  'supositório',
  'suspensão',
  'xarope',
]

const PRODUTOS_MOCK: Produto[] = [
  {
    id: '1',
    nome: 'Losartana Potássica 50mg',
    ean: '7891058012046',
    dcb: '05071',
    ncm: '3004.90.99',
    categoria: 'cardiovascular',
    fabricante: 'Medley',
    preco_custo: 420,
    preco_venda: 890,
    margem_minima: 18,
    estoque_minimo: 80,
    controlado: false,
    portaria_344: false,
    requer_receita: true,
    pbm_elegivel: true,
    rms: '1234567',
    forma_farmaceutica: 'comprimido',
    concentracao: '50mg',
    status: 'ativo',
  },
  {
    id: '2',
    nome: 'Dipirona Sódica 500mg',
    ean: '7891058012047',
    dcb: '03099',
    ncm: '3004.90.99',
    categoria: 'analgésico',
    fabricante: 'EMS',
    preco_custo: 120,
    preco_venda: 280,
    margem_minima: 20,
    estoque_minimo: 120,
    controlado: false,
    portaria_344: false,
    requer_receita: false,
    pbm_elegivel: false,
    rms: '1234568',
    forma_farmaceutica: 'comprimido',
    concentracao: '500mg',
    status: 'ativo',
  },
  {
    id: '3',
    nome: 'Morfina Cloridrato 10mg/mL',
    ean: '7891058012048',
    dcb: '06409',
    ncm: '3004.40.10',
    categoria: 'analgésico',
    fabricante: 'Cristália',
    preco_custo: 980,
    preco_venda: 1850,
    margem_minima: 30,
    estoque_minimo: 20,
    controlado: true,
    portaria_344: true,
    requer_receita: true,
    pbm_elegivel: false,
    rms: '2345678',
    forma_farmaceutica: 'injetável',
    concentracao: '10mg/mL',
    status: 'ativo',
  },
  {
    id: '4',
    nome: 'Amoxicilina 500mg',
    ean: '7891058012049',
    dcb: '00469',
    ncm: '3004.10.11',
    categoria: 'antibiótico',
    fabricante: 'Eurofarma',
    preco_custo: 180,
    preco_venda: 390,
    margem_minima: 22,
    estoque_minimo: 60,
    controlado: false,
    portaria_344: false,
    requer_receita: true,
    pbm_elegivel: true,
    rms: '3456789',
    forma_farmaceutica: 'cápsula',
    concentracao: '500mg',
    status: 'ativo',
  },
  {
    id: '5',
    nome: 'Metformina 850mg',
    ean: '7891058012050',
    dcb: '06625',
    ncm: '3004.90.99',
    categoria: 'cardiovascular',
    fabricante: 'Neo Química',
    preco_custo: 90,
    preco_venda: 220,
    margem_minima: 18,
    estoque_minimo: 200,
    controlado: false,
    portaria_344: false,
    requer_receita: true,
    pbm_elegivel: true,
    rms: '4567890',
    forma_farmaceutica: 'comprimido',
    concentracao: '850mg',
    status: 'ativo',
  },
  {
    id: '6',
    nome: 'Sertralina 50mg',
    ean: '7891058012051',
    dcb: '07606',
    ncm: '3004.90.99',
    categoria: 'psiquiátrico',
    fabricante: 'Pfizer',
    preco_custo: 350,
    preco_venda: 720,
    margem_minima: 25,
    estoque_minimo: 40,
    controlado: false,
    portaria_344: false,
    requer_receita: true,
    pbm_elegivel: false,
    rms: '5678901',
    forma_farmaceutica: 'comprimido',
    concentracao: '50mg',
    status: 'ativo',
  },
  {
    id: '7',
    nome: 'Diazepam 5mg',
    ean: '7891058012052',
    dcb: '03114',
    ncm: '3004.90.99',
    categoria: 'psiquiátrico',
    fabricante: 'Medley',
    preco_custo: 150,
    preco_venda: 380,
    margem_minima: 30,
    estoque_minimo: 30,
    controlado: true,
    portaria_344: true,
    requer_receita: true,
    pbm_elegivel: false,
    rms: '6789012',
    forma_farmaceutica: 'comprimido',
    concentracao: '5mg',
    status: 'ativo',
  },
  {
    id: '8',
    nome: 'Vitamina D3 2000 UI',
    ean: '7891058012053',
    dcb: '08052',
    ncm: '3004.50.90',
    categoria: 'vitamina',
    fabricante: 'União Química',
    preco_custo: 220,
    preco_venda: 580,
    margem_minima: 40,
    estoque_minimo: 100,
    controlado: false,
    portaria_344: false,
    requer_receita: false,
    pbm_elegivel: false,
    rms: '7890123',
    forma_farmaceutica: 'comprimido',
    concentracao: '2000 UI',
    status: 'ativo',
  },
  {
    id: '9',
    nome: 'Ibuprofeno 400mg',
    ean: '7891058012054',
    dcb: '04767',
    ncm: '3004.90.99',
    categoria: 'anti-inflamatório',
    fabricante: 'Aché',
    preco_custo: 140,
    preco_venda: 310,
    margem_minima: 20,
    estoque_minimo: 80,
    controlado: false,
    portaria_344: false,
    requer_receita: false,
    pbm_elegivel: false,
    rms: '8901234',
    forma_farmaceutica: 'comprimido',
    concentracao: '400mg',
    status: 'ativo',
  },
  {
    id: '10',
    nome: 'Omeprazol 20mg',
    ean: '7891058012055',
    dcb: '06723',
    ncm: '3004.90.99',
    categoria: 'gastrointestinal',
    fabricante: 'EMS',
    preco_custo: 80,
    preco_venda: 190,
    margem_minima: 18,
    estoque_minimo: 150,
    controlado: false,
    portaria_344: false,
    requer_receita: false,
    pbm_elegivel: true,
    rms: '9012345',
    forma_farmaceutica: 'cápsula',
    concentracao: '20mg',
    status: 'inativo',
  },
  {
    id: '11',
    nome: 'Atenolol 50mg',
    ean: '7891058012056',
    dcb: '00744',
    ncm: '3004.90.99',
    categoria: 'cardiovascular',
    fabricante: 'Medley',
    preco_custo: 95,
    preco_venda: 240,
    margem_minima: 20,
    estoque_minimo: 90,
    controlado: false,
    portaria_344: false,
    requer_receita: true,
    pbm_elegivel: true,
    rms: '0123456',
    forma_farmaceutica: 'comprimido',
    concentracao: '50mg',
    status: 'ativo',
  },
  {
    id: '12',
    nome: 'Clonazepam 2mg',
    ean: '7891058012057',
    dcb: '02359',
    ncm: '3004.90.99',
    categoria: 'neurológico',
    fabricante: 'Roche',
    preco_custo: 210,
    preco_venda: 520,
    margem_minima: 30,
    estoque_minimo: 25,
    controlado: true,
    portaria_344: true,
    requer_receita: true,
    pbm_elegivel: false,
    rms: '1122334',
    forma_farmaceutica: 'comprimido',
    concentracao: '2mg',
    status: 'ativo',
  },
]

const STATUS_CFG: Record<ProdutoStatus, { label: string }> = {
  ativo: { label: '● Ativo' },
  inativo: { label: '○ Inativo' },
}

const PREVIEW_CSV = [
  {
    nome: 'Captopril 25mg',
    ean: '7891000111111',
    categoria: 'cardiovascular',
    preco_venda: 'R$ 5,80',
  },
  {
    nome: 'Paracetamol 750mg',
    ean: '7891000222222',
    categoria: 'analgésico',
    preco_venda: 'R$ 6,20',
  },
  {
    nome: 'Fluoxetina 20mg',
    ean: '7891000333333',
    categoria: 'psiquiátrico',
    preco_venda: 'R$ 15,90',
  },
  {
    nome: 'Enalapril 10mg',
    ean: '7891000444444',
    categoria: 'cardiovascular',
    preco_venda: 'R$ 8,40',
  },
  {
    nome: 'Sinvastatina 40mg',
    ean: '7891000555555',
    categoria: 'cardiovascular',
    preco_venda: 'R$ 12,50',
  },
]

// ——— Helpers ———

function fmtCurrency(centavos: number): string {
  return `R$ ${(centavos / 100).toFixed(2).replace('.', ',')}`
}

const PRODUTO_VAZIO: ProdutoForm = {
  nome: '',
  ean: '',
  dcb: '',
  ncm: '',
  categoria: 'cardiovascular',
  fabricante: '',
  preco_custo: 0,
  preco_venda: 0,
  margem_minima: 18,
  estoque_minimo: 0,
  controlado: false,
  portaria_344: false,
  requer_receita: false,
  pbm_elegivel: false,
  rms: '',
  forma_farmaceutica: 'comprimido',
  concentracao: '',
  status: 'ativo',
}

// ——— Sub-components ———

function FlagToggle({
  id,
  label,
  checked,
  onChange,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5">
      <div className="relative shrink-0">
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={[
            'h-5 w-9 rounded-full transition-colors',
            checked ? 'bg-brand-700' : 'bg-brand-200',
          ].join(' ')}
        />
        <div
          className={[
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-4.5' : 'translate-x-0.5',
          ].join(' ')}
        />
      </div>
      <span className="text-[13px] text-brand-950">{label}</span>
    </label>
  )
}

// ——— ModalProduto ———

function ModalProduto({
  produto,
  onClose,
  onSave,
}: {
  produto: Produto | null
  onClose: () => void
  onSave: (p: Produto) => void
}) {
  const isEdit = produto !== null
  const [form, setForm] = useState<ProdutoForm>(produto ? { ...produto } : { ...PRODUTO_VAZIO })
  const [errors, setErrors] = useState<Partial<Record<string, string[]>>>({})

  function setField<K extends keyof ProdutoForm>(k: K, v: ProdutoForm[K]) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  const dcbError = form.controlado && (form.dcb?.trim() ?? '') === ''

  function handleSave() {
    const result = ProdutoFormSchema.safeParse(form)
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors)
      return
    }
    setErrors({})
    // TODO: integrar com API — POST/PUT /api/v1/cadastros/produtos
    onSave({ ...result.data, id: produto?.id ?? crypto.randomUUID() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar modal"
      />
      <div className="relative z-10 flex max-h-[90vh] w-[700px] flex-col overflow-hidden rounded-[28px] bg-white shadow-xl">
        {/* Modal header */}
        <div className="flex items-center justify-between border-brand-100 border-b px-7 py-5">
          <div>
            <h2 className="font-bold text-[18px] text-brand-950">
              {isEdit ? 'Editar produto' : 'Novo produto'}
            </h2>
            <p className="text-[12px] text-text-secondary">
              Campos marcados com * são obrigatórios
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-[13px] text-brand-600 hover:bg-brand-100"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-7 py-5">
          {/* Grupo Identificação */}
          <div className="flex flex-col gap-2.5">
            <p className="font-bold text-[11px] text-brand-muted uppercase tracking-wide">
              Identificação
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <div
                className={[
                  'col-span-2 flex flex-col gap-1.5 rounded-[18px] border p-4 transition-colors',
                  errors.nome
                    ? 'border-danger-200 bg-danger-25'
                    : 'border-input-border bg-input-bg',
                ].join(' ')}
              >
                <label htmlFor="p-nome" className="font-bold text-[12px] text-input-label">
                  Nome do produto *
                </label>
                <input
                  id="p-nome"
                  type="text"
                  value={form.nome}
                  onChange={(e) => setField('nome', e.target.value)}
                  placeholder="Ex: Losartana Potássica 50mg"
                  className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
                />
                {errors.nome?.[0] && (
                  <p className="text-[11px] text-danger-600">{errors.nome[0]}</p>
                )}
              </div>
              <div
                className={[
                  'flex flex-col gap-1.5 rounded-[18px] border p-4 transition-colors',
                  errors.ean ? 'border-danger-200 bg-danger-25' : 'border-input-border bg-input-bg',
                ].join(' ')}
              >
                <label htmlFor="p-ean" className="font-bold text-[12px] text-input-label">
                  EAN / Código de barras *
                </label>
                <input
                  id="p-ean"
                  type="text"
                  value={form.ean}
                  onChange={(e) => setField('ean', e.target.value)}
                  placeholder="7891058012046"
                  className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
                />
                {errors.ean?.[0] && <p className="text-[11px] text-danger-600">{errors.ean[0]}</p>}
              </div>
              <div
                className={[
                  'flex flex-col gap-1.5 rounded-[18px] border p-4 transition-colors',
                  dcbError ? 'border-danger-200 bg-danger-25' : 'border-input-border bg-input-bg',
                ].join(' ')}
              >
                <label htmlFor="p-dcb" className="font-bold text-[12px] text-input-label">
                  DCB{form.controlado && <span className="ml-0.5 text-danger-600"> *</span>}
                </label>
                <input
                  id="p-dcb"
                  type="text"
                  value={form.dcb ?? ''}
                  onChange={(e) => setField('dcb', e.target.value)}
                  placeholder="Código ANVISA"
                  className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
                />
                {dcbError && (
                  <p className="text-[11px] text-danger-600">Obrigatório para produto controlado</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
                <label htmlFor="p-ncm" className="font-bold text-[12px] text-input-label">
                  NCM
                </label>
                <input
                  id="p-ncm"
                  type="text"
                  value={form.ncm ?? ''}
                  onChange={(e) => setField('ncm', e.target.value)}
                  placeholder="3004.90.99"
                  className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
                />
              </div>
              <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
                <label htmlFor="p-categoria" className="font-bold text-[12px] text-input-label">
                  Categoria
                </label>
                <select
                  id="p-categoria"
                  value={form.categoria}
                  onChange={(e) => setField('categoria', e.target.value)}
                  className="bg-transparent text-[14px] text-brand-950 outline-none"
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
                <label htmlFor="p-rms" className="font-bold text-[12px] text-input-label">
                  RMS / Registro MS
                </label>
                <input
                  id="p-rms"
                  type="text"
                  value={form.rms ?? ''}
                  onChange={(e) => setField('rms', e.target.value)}
                  placeholder="1234567"
                  className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
                />
              </div>
            </div>
          </div>

          {/* Grupo Comercial */}
          <div className="flex flex-col gap-2.5">
            <p className="font-bold text-[11px] text-brand-muted uppercase tracking-wide">
              Comercial
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="col-span-2 flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
                <label htmlFor="p-fabricante" className="font-bold text-[12px] text-input-label">
                  Fabricante
                </label>
                <input
                  id="p-fabricante"
                  type="text"
                  value={form.fabricante}
                  onChange={(e) => setField('fabricante', e.target.value)}
                  placeholder="Ex: Medley, EMS, Pfizer..."
                  className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
                />
              </div>
              <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
                <label htmlFor="p-custo" className="font-bold text-[12px] text-input-label">
                  Preço de custo (R$)
                </label>
                <input
                  id="p-custo"
                  type="number"
                  min="0"
                  step="0.01"
                  value={(form.preco_custo / 100).toFixed(2)}
                  onChange={(e) =>
                    setField(
                      'preco_custo',
                      Math.round(Number.parseFloat(e.target.value || '0') * 100)
                    )
                  }
                  className="bg-transparent text-[14px] text-brand-950 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
                <label htmlFor="p-venda" className="font-bold text-[12px] text-input-label">
                  Preço de venda (R$)
                </label>
                <input
                  id="p-venda"
                  type="number"
                  min="0"
                  step="0.01"
                  value={(form.preco_venda / 100).toFixed(2)}
                  onChange={(e) =>
                    setField(
                      'preco_venda',
                      Math.round(Number.parseFloat(e.target.value || '0') * 100)
                    )
                  }
                  className="bg-transparent text-[14px] text-brand-950 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
                <label htmlFor="p-margem" className="font-bold text-[12px] text-input-label">
                  Margem mínima (%)
                </label>
                <input
                  id="p-margem"
                  type="number"
                  min="0"
                  max="100"
                  value={form.margem_minima}
                  onChange={(e) =>
                    setField('margem_minima', Number.parseInt(e.target.value || '0', 10))
                  }
                  className="bg-transparent text-[14px] text-brand-950 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Grupo Estoque e apresentação */}
          <div className="flex flex-col gap-2.5">
            <p className="font-bold text-[11px] text-brand-muted uppercase tracking-wide">
              Estoque e apresentação
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
                <label htmlFor="p-estmin" className="font-bold text-[12px] text-input-label">
                  Estoque mínimo (un.)
                </label>
                <input
                  id="p-estmin"
                  type="number"
                  min="0"
                  value={form.estoque_minimo}
                  onChange={(e) =>
                    setField('estoque_minimo', Number.parseInt(e.target.value || '0', 10))
                  }
                  className="bg-transparent text-[14px] text-brand-950 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
                <label htmlFor="p-forma" className="font-bold text-[12px] text-input-label">
                  Forma farmacêutica
                </label>
                <select
                  id="p-forma"
                  value={form.forma_farmaceutica}
                  onChange={(e) => setField('forma_farmaceutica', e.target.value)}
                  className="bg-transparent text-[14px] text-brand-950 outline-none"
                >
                  {FORMAS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
                <label htmlFor="p-conc" className="font-bold text-[12px] text-input-label">
                  Concentração
                </label>
                <input
                  id="p-conc"
                  type="text"
                  value={form.concentracao}
                  onChange={(e) => setField('concentracao', e.target.value)}
                  placeholder="Ex: 50mg, 500mg/mL"
                  className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
                />
              </div>
            </div>
          </div>

          {/* Grupo Classificação (flags) */}
          <div className="flex flex-col gap-2.5">
            <p className="font-bold text-[11px] text-brand-muted uppercase tracking-wide">
              Classificação
            </p>
            <div className="grid grid-cols-2 gap-4 rounded-[18px] border border-input-border bg-input-bg px-5 py-4">
              <FlagToggle
                id="p-controlado"
                label="Medicamento controlado"
                checked={form.controlado}
                onChange={(v) => setField('controlado', v)}
              />
              <FlagToggle
                id="p-portaria"
                label="Portaria 344 (psicotrópico)"
                checked={form.portaria_344}
                onChange={(v) => setField('portaria_344', v)}
              />
              <FlagToggle
                id="p-receita"
                label="Requer receita"
                checked={form.requer_receita}
                onChange={(v) => setField('requer_receita', v)}
              />
              <FlagToggle
                id="p-pbm"
                label="Elegível PBM"
                checked={form.pbm_elegivel}
                onChange={(v) => setField('pbm_elegivel', v)}
              />
            </div>
          </div>
        </div>

        {/* Modal footer */}
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
            onClick={handleSave}
            disabled={dcbError}
            className={[
              'flex h-10 flex-1 items-center justify-center rounded-[14px] font-bold text-[13px] text-white transition-colors',
              !dcbError ? 'bg-brand-900 hover:bg-brand-800' : 'cursor-not-allowed bg-brand-300',
            ].join(' ')}
          >
            {isEdit ? 'Salvar alterações' : 'Criar produto'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ——— ModalImportCSV ———

type ImportStep = 'upload' | 'confirm'

function ModalImportCSV({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<ImportStep>('upload')
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  function handleFile(file: File) {
    setFileName(file.name)
    // TODO: integrar com API — POST /api/v1/cadastros/produtos/importar-csv
    setStep('confirm')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar modal"
      />
      <div className="relative z-10 flex w-[560px] flex-col gap-5 rounded-[28px] bg-white p-7 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-bold text-[18px] text-brand-950">Importar via CSV</h2>
            <p className="text-[12px] text-text-secondary">
              {step === 'upload'
                ? 'Etapa 1 de 2 — Upload do arquivo'
                : 'Etapa 2 de 2 — Confirmar importação'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-[13px] text-brand-600 hover:bg-brand-100"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>

        {step === 'upload' && (
          <>
            <label
              htmlFor="csv-input"
              className={[
                'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed py-10 transition-colors',
                dragging
                  ? 'border-brand-500 bg-brand-25'
                  : 'border-brand-200 bg-brand-50 hover:border-brand-400',
              ].join(' ')}
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                const f = e.dataTransfer.files[0]
                if (f) handleFile(f)
              }}
            >
              <span className="text-[36px]" aria-hidden="true">
                📂
              </span>
              <div className="text-center">
                <p className="font-bold text-[14px] text-brand-800">Arraste o arquivo CSV aqui</p>
                <p className="text-[12px] text-text-secondary">ou clique para selecionar</p>
              </div>
              <input
                id="csv-input"
                type="file"
                accept=".csv"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleFile(f)
                }}
              />
            </label>

            <div className="flex items-center gap-3 rounded-[16px] border border-info-100 bg-info-50 px-4 py-3">
              <span className="shrink-0 text-[14px]" aria-hidden="true">
                ℹ
              </span>
              <p className="text-[12px] text-info-700">
                Use o modelo CSV para garantir o formato correto.{' '}
                {/* TODO: GET /api/v1/cadastros/produtos/template-csv */}
                <button type="button" className="font-bold underline">
                  Baixar modelo
                </button>
              </p>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <div className="flex items-center gap-3 rounded-[16px] border border-brand-100 bg-brand-25 px-4 py-3">
              <span className="shrink-0 text-[18px]" aria-hidden="true">
                📄
              </span>
              <div>
                <p className="font-bold text-[13px] text-brand-900">{fileName}</p>
                <p className="text-[12px] text-text-secondary">
                  150 registros encontrados · 3 erros
                </p>
              </div>
            </div>

            {/* Preview table */}
            <div className="flex flex-col gap-1.5">
              <p className="font-bold text-[11px] text-brand-muted uppercase tracking-wide">
                Prévia — 5 primeiros registros
              </p>
              <div className="grid grid-cols-[2fr_1fr_1fr_84px] gap-x-2 rounded-[12px] bg-[#F5F8F6] px-3 py-2.5">
                {['Nome', 'EAN', 'Categoria', 'Preço'].map((h) => (
                  <span key={h} className="font-bold text-[11px] text-brand-muted">
                    {h}
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-0.5">
                {PREVIEW_CSV.map((r) => (
                  <div
                    key={r.ean}
                    className="grid grid-cols-[2fr_1fr_1fr_84px] gap-x-2 rounded-[14px] bg-[#FBFCFB] px-3 py-2"
                  >
                    <span className="truncate text-[12px] text-brand-950">{r.nome}</span>
                    <span className="truncate font-mono text-[11px] text-brand-600">{r.ean}</span>
                    <span className="truncate text-[12px] text-text-secondary">{r.categoria}</span>
                    <span className="text-[12px] text-brand-800">{r.preco_venda}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Errors */}
            <div className="flex flex-col gap-1.5 rounded-[16px] border border-danger-100 bg-danger-50 p-4">
              <p className="font-bold text-[12px] text-danger-700">
                3 erros — esses registros não serão importados
              </p>
              <p className="text-[11px] text-danger-600">Linha 23 · ean — EAN já cadastrado</p>
              <p className="text-[11px] text-danger-600">Linha 51 · preco_venda — Valor inválido</p>
              <p className="text-[11px] text-danger-600">
                Linha 88 · dcb — Obrigatório para produto controlado
              </p>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="flex gap-3">
          {step === 'confirm' ? (
            <>
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-brand-200 font-bold text-[13px] text-brand-700 hover:bg-brand-50"
              >
                ← Voltar
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 flex-1 items-center justify-center rounded-[14px] bg-brand-900 font-bold text-[13px] text-white hover:bg-brand-800"
              >
                Confirmar importação (147)
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-brand-200 font-bold text-[13px] text-brand-700 hover:bg-brand-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ——— Page ———

export function CadastroProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>(PRODUTOS_MOCK)
  const [search, setSearch] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('')
  const [filterControlado, setFilterControlado] = useState(false)
  const [modalProduto, setModalProduto] = useState(false)
  const [modalImport, setModalImport] = useState(false)
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null)

  const filtered = useMemo(() => {
    let items = produtos
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (p) =>
          p.nome.toLowerCase().includes(q) ||
          p.ean.includes(q) ||
          p.fabricante.toLowerCase().includes(q)
      )
    }
    if (filterCategoria) items = items.filter((p) => p.categoria === filterCategoria)
    if (filterControlado) items = items.filter((p) => p.controlado)
    return items
  }, [produtos, search, filterCategoria, filterControlado])

  const stats = useMemo(
    () => ({
      total: produtos.length,
      ativos: produtos.filter((p) => p.status === 'ativo').length,
      controlados: produtos.filter((p) => p.controlado).length,
    }),
    [produtos]
  )

  function handleSave(p: Produto) {
    setProdutos((prev) => {
      const exists = prev.some((x) => x.id === p.id)
      return exists ? prev.map((x) => (x.id === p.id ? p : x)) : [...prev, p]
    })
    setModalProduto(false)
    setEditingProduto(null)
  }

  function handleEdit(p: Produto) {
    setEditingProduto(p)
    setModalProduto(true)
  }

  function handleToggleStatus(id: string) {
    // TODO: integrar com API — DELETE /api/v1/cadastros/produtos/{id} (soft delete)
    setProdutos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: p.status === 'ativo' ? 'inativo' : 'ativo' } : p
      )
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Header */}
      <header className="rounded-3xl border border-brand-100 bg-white px-5.5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-[20px] text-brand-950">Cadastro de Produtos</h1>
            <p className="text-[13px] text-text-secondary">
              Gerencie o catálogo de produtos da farmácia
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col items-end gap-0.5 rounded-[16px] border border-brand-100 bg-white px-4 py-2.5">
              <span className="font-bold text-[20px] text-brand-950">{stats.total}</span>
              <span className="text-[11px] text-text-secondary">Total</span>
            </div>
            <div className="flex flex-col items-end gap-0.5 rounded-[16px] border border-brand-100 bg-brand-25 px-4 py-2.5">
              <span className="font-bold text-[20px] text-brand-900">{stats.ativos}</span>
              <span className="text-[11px] text-success-600">Ativos</span>
            </div>
            <div className="flex flex-col items-end gap-0.5 rounded-[16px] border border-warning-100 bg-warning-50 px-4 py-2.5">
              <span className="font-bold text-[20px] text-warning-800">{stats.controlados}</span>
              <span className="text-[11px] text-warning-700">Controlados</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main card */}
      <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-brand-100 bg-white">
        {/* Action bar */}
        <div className="flex items-center gap-3 border-brand-100 border-b px-5 py-3.5">
          <div className="flex h-9 flex-1 items-center gap-2 rounded-[12px] border border-brand-100 bg-brand-50 px-3">
            <span className="text-[13px] text-brand-muted" aria-hidden="true">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, EAN ou fabricante..."
              className="flex-1 bg-transparent text-[13px] text-brand-950 outline-none placeholder:text-brand-muted"
              aria-label="Buscar produtos"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-[11px] text-brand-muted hover:text-brand-700"
                aria-label="Limpar busca"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
            className="h-9 rounded-[12px] border border-brand-100 bg-white px-3 text-[13px] text-brand-950 outline-none"
            aria-label="Filtrar por categoria"
          >
            <option value="">Todas categorias</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setFilterControlado((v) => !v)}
            className={[
              'flex h-9 items-center gap-1.5 rounded-[12px] border px-3 font-medium text-[13px] transition-colors',
              filterControlado
                ? 'border-warning-200 bg-warning-50 text-warning-700'
                : 'border-brand-100 bg-white text-brand-muted hover:bg-brand-50',
            ].join(' ')}
          >
            ⚠ Controlados
          </button>

          <div className="h-6 w-px bg-brand-100" aria-hidden="true" />

          <button
            type="button"
            onClick={() => setModalImport(true)}
            className="flex h-9 items-center gap-1.5 rounded-[12px] border border-brand-100 bg-white px-3.5 font-medium text-[13px] text-brand-700 hover:bg-brand-50"
          >
            Importar CSV
          </button>
          {/* TODO: integrar com API — GET /api/v1/cadastros/produtos/exportar-csv */}
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 rounded-[12px] border border-brand-100 bg-white px-3.5 font-medium text-[13px] text-brand-700 hover:bg-brand-50"
          >
            Exportar
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingProduto(null)
              setModalProduto(true)
            }}
            className="flex h-9 items-center gap-1.5 rounded-[12px] bg-brand-900 px-4 font-bold text-[13px] text-white hover:bg-brand-800"
          >
            + Novo produto
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-3 mt-3 grid grid-cols-[minmax(0,2fr)_130px_130px_96px_80px_90px_90px_106px] gap-2 rounded-[12px] bg-[#F5F8F6] px-3 py-2.5">
            {[
              'Nome',
              'EAN',
              'Categoria',
              'Preço venda',
              'Est. mín.',
              'Controlado',
              'Status',
              'Ações',
            ].map((h) => (
              <span key={h} className="font-bold text-[11px] text-brand-muted">
                {h}
              </span>
            ))}
          </div>

          <div className="mx-3 mt-1 mb-3 flex flex-col gap-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <span className="text-[32px]" aria-hidden="true">
                  🔍
                </span>
                <p className="font-bold text-[14px] text-brand-800">Nenhum produto encontrado</p>
                <p className="text-[12px] text-text-secondary">
                  Tente ajustar os filtros ou criar um novo produto
                </p>
              </div>
            ) : (
              filtered.map((p) => {
                const stCfg = STATUS_CFG[p.status]
                return (
                  <div
                    key={p.id}
                    className="grid grid-cols-[minmax(0,2fr)_130px_130px_96px_80px_90px_90px_106px] items-center gap-2 rounded-[14px] bg-[#FBFCFB] px-3 py-2.5"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate font-medium text-[13px] text-brand-950">
                        {p.nome}
                      </span>
                      <span className="truncate text-[11px] text-text-secondary">
                        {p.fabricante} · {p.forma_farmaceutica}
                      </span>
                    </div>
                    <span className="truncate font-mono text-[12px] text-brand-600">{p.ean}</span>
                    <span className="truncate text-[12px] text-text-secondary">{p.categoria}</span>
                    <span className="font-bold text-[13px] text-brand-950">
                      {fmtCurrency(p.preco_venda)}
                    </span>
                    <span className="text-[12px] text-brand-800">{p.estoque_minimo} un.</span>
                    <span>
                      {p.controlado ? (
                        <Badge intent="alerta">⚠ Sim</Badge>
                      ) : (
                        <span className="text-[12px] text-brand-muted">—</span>
                      )}
                    </span>
                    <Badge intent={p.status}>{stCfg.label}</Badge>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(p)}
                        className="flex h-7 items-center rounded-[8px] border border-brand-200 px-2.5 font-medium text-[11px] text-brand-700 hover:bg-brand-50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(p.id)}
                        className={[
                          'flex h-7 w-7 items-center justify-center rounded-[8px] border font-medium text-[11px] transition-colors',
                          p.status === 'ativo'
                            ? 'border-danger-100 text-danger-600 hover:bg-danger-50'
                            : 'border-brand-200 text-brand-600 hover:bg-brand-50',
                        ].join(' ')}
                        aria-label={p.status === 'ativo' ? 'Inativar produto' : 'Ativar produto'}
                      >
                        {p.status === 'ativo' ? '○' : '●'}
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {filtered.length > 0 && (
            <div className="flex justify-end px-6 pb-3">
              <p className="text-[12px] text-brand-muted">
                {filtered.length} de {produtos.length} produtos
              </p>
            </div>
          )}
        </div>
      </div>

      {modalProduto && (
        <ModalProduto
          produto={editingProduto}
          onClose={() => {
            setModalProduto(false)
            setEditingProduto(null)
          }}
          onSave={handleSave}
        />
      )}
      {modalImport && <ModalImportCSV onClose={() => setModalImport(false)} />}
    </div>
  )
}
