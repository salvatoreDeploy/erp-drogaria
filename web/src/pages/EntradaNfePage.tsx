import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { NfeXmlDadosSchema } from '../schemas/fiscal'

/* ── Types ────────────────────────────────────────────────────────── */

type Step = 1 | 2 | 3

type FormStep1 = {
  chaveAcesso: string
  fornecedor: string
  dataEntrada: string
  cnpj: string
  filial: string
  tipoTotal: string
  condicaoPagto: string
  natureza: string
  gerarContas: boolean
}

type NfeItem = {
  seq: number
  codigo: string
  produto: string
  ncm: string
  ipi: number
  qtdFat: number // quantidade faturada (da NF-e, somente leitura)
  qtdRec: number // quantidade recebida (editável)
  valorUnit: number
  lote: string
  validade: string // formato MM/AAAA
  noCatalog: boolean // produto não encontrado no catálogo
  produto_id?: string // preenchido após vincular ao catálogo
  margemBaixa?: boolean
  conferido?: boolean
}

type ConferenceStatus = 'revisao' | 'bloqueado' | 'sucesso'

/* ── Constants ────────────────────────────────────────────────────── */

const STEPS = [
  { id: 1, label: 'Identificação da nota' },
  { id: 2, label: 'Itens e lotes' },
  { id: 3, label: 'Conferência e entrada' },
] as const

// TODO: integrar com API — GET /api/v1/fiscal/nfe/{chave}
const NFE_INFO = {
  fornecedor: 'Plasma Sul Distribução',
  numeroNota: '125.001 - 3041',
  natureza: 'Compra para revenda',
  cnpj: '12.345.678/0001-99',
  valorTotal: 12466.88,
  baseIcms: 10984.0,
  icmsTotal: 1977.12,
  pisCofins: 624.05,
  frete: 0.0,
  valorFinal: 12480.9,
  protocolo: 'EN-2026-004812',
  dataAutorizacao: '29/04/2025 14:22',
}

// TODO: integrar com API — GET /api/v1/fiscal/nfe/{chave}/itens
const ITENS_INICIAIS: NfeItem[] = [
  {
    seq: 1,
    codigo: '7891058012046',
    produto: 'Dipirona 500mg',
    ncm: '3004.90',
    ipi: 0,
    qtdFat: 100,
    qtdRec: 100,
    valorUnit: 4.2,
    lote: 'L2024A',
    validade: '12/2026',
    noCatalog: false,
    margemBaixa: false,
  },
  {
    seq: 2,
    codigo: '7896523001124',
    produto: 'Omeprazol 20mg',
    ncm: '3004.90',
    ipi: 0,
    qtdFat: 50,
    qtdRec: 50,
    valorUnit: 7.8,
    lote: 'L2024B',
    validade: '06/2026',
    noCatalog: false,
    margemBaixa: false,
  },
  {
    seq: 3,
    codigo: '7893344501820',
    produto: 'Vitamina D3 2.000UI',
    ncm: '3004.90',
    ipi: 0,
    qtdFat: 200,
    qtdRec: 200,
    valorUnit: 18.1,
    lote: 'L2024C',
    validade: '06/2025',
    noCatalog: false,
    margemBaixa: true,
  },
  {
    seq: 4,
    codigo: '7893456789012',
    produto: 'Losartana 50mg',
    ncm: '3004.90',
    ipi: 0,
    qtdFat: 300,
    qtdRec: 300,
    valorUnit: 2.9,
    lote: 'L2024D',
    validade: '03/2027',
    noCatalog: false,
    margemBaixa: false,
  },
  {
    seq: 5,
    codigo: '7891000100103',
    produto: 'CLORIDRATO METFORMINA 850MG',
    ncm: '3004.90',
    ipi: 0,
    qtdFat: 120,
    qtdRec: 120,
    valorUnit: 3.2,
    lote: '',
    validade: '',
    noCatalog: true,
  },
]

// TODO: integrar com API — GET /api/v1/produtos/buscar?q={termo}
const CATALOGO_MOCK = [
  'Metformina 850mg',
  'Metformina 500mg',
  'Amoxicilina 500mg',
  'Azitromicina 500mg',
  'Sertralina 50mg',
  'Atenolol 25mg',
  'Clonazepam 2mg',
  'Ibuprofeno 600mg',
  'Omeprazol 20mg',
  'Enalapril 10mg',
]

const INPUT_CLS =
  'w-full rounded-[12px] border border-input-border bg-input-bg px-3.5 py-2.5 text-[13px] text-brand-950 outline-none placeholder:text-input-placeholder focus:border-brand-700 focus:ring-1 focus:ring-brand-700/20'
const SELECT_CLS =
  'w-full rounded-[12px] border border-input-border bg-input-bg px-3.5 py-2.5 text-[13px] text-brand-950 outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700/20'
const CELL_INPUT_CLS =
  'w-full rounded-[8px] border border-input-border bg-white px-2 py-1.5 text-[12px] text-brand-950 outline-none placeholder:text-input-placeholder focus:border-brand-700 focus:ring-1 focus:ring-brand-700/20'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

type XmlStatus = 'idle' | 'validando' | 'sucesso' | 'erro'

const XML_STATUS_CFG: Record<Exclude<XmlStatus, 'idle'>, { text: string; cls: string }> = {
  validando: { text: 'Validando XML...', cls: 'border-brand-100 bg-white text-text-secondary' },
  sucesso: {
    text: '✓ XML importado',
    cls: 'border-success-100 bg-brand-25 text-success-600',
  },
  erro: { text: '✗ XML inválido', cls: 'border-danger-100 bg-danger-50 text-danger-700' },
}

function itemIsConfirmed(item: NfeItem): boolean {
  return (
    !item.noCatalog && !!item.lote.trim() && !!item.validade.trim() && item.qtdRec === item.qtdFat
  )
}

function CelulaBusca({
  nomeNfe,
  onVincular,
}: {
  nomeNfe: string
  onVincular: (nome: string, produtoId: string) => void
}) {
  const [query, setQuery] = useState(nomeNfe === '—' ? '' : nomeNfe)
  const [aberto, setAberto] = useState(false)

  const resultados =
    query.length >= 2
      ? CATALOGO_MOCK.filter((n) => n.toLowerCase().includes(query.toLowerCase()))
      : []

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setAberto(true)
        }}
        onFocus={() => setAberto(true)}
        onBlur={() => setTimeout(() => setAberto(false), 150)}
        placeholder="Buscar no catálogo..."
        className={CELL_INPUT_CLS}
      />
      {aberto && resultados.length > 0 && (
        <div className="absolute top-full right-0 left-0 z-20 mt-1 flex flex-col overflow-hidden rounded-[12px] border border-brand-100 bg-white shadow-lg">
          {resultados.map((nome) => (
            <button
              key={nome}
              type="button"
              onMouseDown={() => {
                onVincular(nome, `prod-${nome.toLowerCase().replace(/\s+/g, '-')}`)
                setQuery(nome)
                setAberto(false)
              }}
              className="px-3 py-2 text-left text-[12px] text-brand-950 transition-colors hover:bg-brand-50"
            >
              {nome}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────── */

export function EntradaNfePage() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormStep1>({
    chaveAcesso: '',
    fornecedor: 'Distribuidora Pharma Sul',
    dataEntrada: '2025-04-29',
    cnpj: '12.345.678/0001-99',
    filial: '001',
    tipoTotal: 'com_imposto',
    condicaoPagto: '30_60_90',
    natureza: 'compra',
    gerarContas: true,
  })
  const [itens, setItens] = useState<NfeItem[]>(ITENS_INICIAIS)
  const [isLoadingRascunho, setIsLoadingRascunho] = useState(false)
  const [rascunhoId, setRascunhoId] = useState<string | null>(null)
  const [rascunhoDisponivel, setRascunhoDisponivel] = useState(false)
  const [xmlStatus, setXmlStatus] = useState<XmlStatus>('idle')
  const [xmlErro, setXmlErro] = useState<string | null>(null)
  const [nfeFinalizada, setNfeFinalizada] = useState(false)
  const [protocoloFinal, setProtocoloFinal] = useState<string | null>(null)
  const xmlInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (localStorage.getItem('nfe_rascunho')) setRascunhoDisponivel(true)
  }, [])

  function setField<K extends keyof FormStep1>(key: K, value: FormStep1[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateItem(seq: number, patch: Partial<NfeItem>) {
    setItens((prev) => prev.map((item) => (item.seq === seq ? { ...item, ...patch } : item)))
  }

  function handleMarcarTodosOk() {
    setItens((prev) => prev.map((i) => (i.noCatalog ? i : { ...i, conferido: true })))
  }

  const handleSalvarRascunho = async () => {
    setIsLoadingRascunho(true)
    try {
      await new Promise((r) => setTimeout(r, 600))
      const id = `NF-${Date.now()}`
      localStorage.setItem('nfe_rascunho', JSON.stringify({ id, form, itens }))
      setRascunhoId(id)
      // TODO: integrar com API — POST /api/v1/fiscal/nfe/rascunho
    } catch (err) {
      console.error('[handleSalvarRascunho]', err)
    } finally {
      setIsLoadingRascunho(false)
    }
  }

  const handleImportarXML = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setXmlStatus('validando')
    setXmlErro(null)
    try {
      const text = await file.text()
      const doc = new DOMParser().parseFromString(text, 'application/xml')

      const parseErr = doc.querySelector('parsererror')
      if (parseErr) throw new Error('Arquivo XML malformado')

      const hasNfe = doc.querySelector('NFe') ?? doc.querySelector('nfeProc')
      if (!hasNfe) throw new Error('Tag <NFe> ou <nfeProc> não encontrada')

      const infNFe = doc.querySelector('infNFe')
      const idAttr = infNFe?.getAttribute('Id') ?? ''
      const chave = idAttr.startsWith('NFe')
        ? idAttr.slice(3)
        : (doc.querySelector('chNFe')?.textContent ?? '')
      const nNF = doc.querySelector('nNF')?.textContent ?? ''
      const xNome = doc.querySelector('emit xNome')?.textContent ?? ''
      const cnpjRaw = (doc.querySelector('emit CNPJ')?.textContent ?? '').replace(/\D/g, '')
      const vNF = Number(
        doc.querySelector('ICMSTot vNF')?.textContent ??
          doc.querySelector('vNF')?.textContent ??
          '0'
      )

      const itensDom = Array.from(doc.querySelectorAll('det'))
      const itensXml = itensDom.map((det) => ({
        ean: det.querySelector('cEAN')?.textContent ?? undefined,
        descricao: det.querySelector('xProd')?.textContent ?? '',
        qtd_fat: Number(det.querySelector('qCom')?.textContent ?? '0'),
        preco_unit: Number(det.querySelector('vUnCom')?.textContent ?? '0'),
      }))

      const chaveNorm = chave.replace(/\D/g, '').padStart(44, '0').slice(0, 44)
      const cnpjNorm = cnpjRaw.padStart(14, '0').slice(0, 14)

      const parsed = NfeXmlDadosSchema.safeParse({
        chave_acesso: chaveNorm,
        numero_nota: nNF || '0',
        fornecedor: xNome || 'Fornecedor importado',
        cnpj_emitente: cnpjNorm,
        valor_total: vNF,
        itens:
          itensXml.length > 0
            ? itensXml
            : [{ descricao: 'Item importado', qtd_fat: 1, preco_unit: 0 }],
      })

      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? 'Estrutura XML inválida')
      }

      const dados = parsed.data

      // Auto-fill Etapa 1
      setField('chaveAcesso', dados.chave_acesso)
      setField('fornecedor', dados.fornecedor)
      const cnpjFmt = dados.cnpj_emitente.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        '$1.$2.$3/$4-$5'
      )
      setField('cnpj', cnpjFmt)

      // Popular Etapa 2
      const novosItens: NfeItem[] = dados.itens.map((item, idx) => {
        const desc = item.descricao.toLowerCase()
        const nocat = !CATALOGO_MOCK.some((c) => c.toLowerCase().slice(0, 5) === desc.slice(0, 5))
        return {
          seq: idx + 1,
          codigo: item.ean ?? '',
          produto: item.descricao,
          ncm: '3004.90',
          ipi: 0,
          qtdFat: item.qtd_fat,
          qtdRec: item.qtd_fat,
          valorUnit: item.preco_unit,
          lote: '',
          validade: '',
          noCatalog: nocat,
          margemBaixa: false,
        }
      })
      setItens(novosItens)
      setXmlStatus('sucesso')
      // TODO: integrar com API — POST /api/v1/fiscal/nfe/importar-xml
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar o arquivo'
      setXmlErro(msg)
      setXmlStatus('erro')
    } finally {
      if (xmlInputRef.current) xmlInputRef.current.value = ''
    }
  }

  function handleFinalizarEntrada(protocolo: string) {
    setNfeFinalizada(true)
    setProtocoloFinal(protocolo)
  }

  function addItem() {
    const nextSeq = Math.max(0, ...itens.map((i) => i.seq)) + 1
    setItens((prev) => [
      ...prev,
      {
        seq: nextSeq,
        codigo: '',
        produto: '',
        ncm: '',
        ipi: 0,
        qtdFat: 0,
        qtdRec: 0,
        valorUnit: 0,
        lote: '',
        validade: '',
        noCatalog: false,
      },
    ])
  }

  function removeItem(seq: number) {
    setItens((prev) => prev.filter((item) => item.seq !== seq))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between rounded-[24px] border border-brand-100 bg-white px-[22px] py-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-bold text-[24px] text-brand-950 leading-none">
            Entrada de nota fiscal
          </h1>
          <p className="text-[13px] text-text-secondary">
            NF-e de compra, devolução e transferência entre filiais.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-brand-200 bg-brand-75 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-success-600" />
            <span className="font-bold text-[12px] text-success-600">Online</span>
          </div>
          {xmlStatus !== 'idle' && (
            <span
              className={`rounded-full border px-3 py-1.5 font-semibold text-[12px] transition-colors ${XML_STATUS_CFG[xmlStatus].cls}`}
            >
              {XML_STATUS_CFG[xmlStatus].text}
            </span>
          )}
          {xmlErro && xmlStatus === 'erro' && (
            <span className="max-w-[220px] truncate text-[11px] text-danger-700" title={xmlErro}>
              {xmlErro}
            </span>
          )}
          <input
            ref={xmlInputRef}
            type="file"
            accept=".xml"
            className="sr-only"
            onChange={handleImportarXML}
            aria-label="Importar arquivo XML NF-e"
          />
          <button
            type="button"
            disabled={nfeFinalizada || xmlStatus === 'validando'}
            onClick={() => xmlInputRef.current?.click()}
            className={[
              'flex h-9 items-center gap-1.5 rounded-[14px] px-4 font-bold text-[12px] text-white transition-colors',
              nfeFinalizada || xmlStatus === 'validando'
                ? 'cursor-not-allowed bg-brand-300'
                : 'bg-brand-900 hover:bg-brand-800',
            ].join(' ')}
          >
            Importar XML
          </button>
        </div>
      </header>

      {/* ── Stepper ────────────────────────────────────────────── */}
      <div className="flex items-center rounded-[24px] border border-brand-100 bg-white px-[22px] py-[18px]">
        {STEPS.map((s, idx) => {
          const active = step === s.id
          const done = step > s.id
          return (
            <div key={s.id} className="flex items-center">
              <button
                type="button"
                disabled={!done || nfeFinalizada}
                onClick={() => done && !nfeFinalizada && setStep(s.id as Step)}
                className="flex items-center gap-2.5 disabled:cursor-default"
              >
                <div
                  className={[
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold text-[11px] transition-colors',
                    active
                      ? 'bg-brand-900 text-white'
                      : done
                        ? 'bg-brand-500 text-white'
                        : 'bg-brand-100 text-brand-muted',
                  ].join(' ')}
                >
                  {done ? '✓' : s.id}
                </div>
                <span
                  className={[
                    'whitespace-nowrap font-semibold text-[13px]',
                    active ? 'text-brand-950' : done ? 'text-brand-700' : 'text-brand-muted',
                  ].join(' ')}
                >
                  {s.label}
                </span>
              </button>
              {idx < STEPS.length - 1 && (
                <div
                  className={`mx-6 h-px w-20 transition-colors ${done ? 'bg-brand-500' : 'bg-brand-100'}`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* ── Step panels ────────────────────────────────────────── */}
      {step === 1 && (
        <StepIdentificacao
          form={form}
          setField={setField}
          onNext={() => setStep(2)}
          rascunhoDisponivel={rascunhoDisponivel}
          isLoadingRascunho={isLoadingRascunho}
          onSalvarRascunho={handleSalvarRascunho}
          onIgnorarRascunho={() => setRascunhoDisponivel(false)}
          nfeFinalizada={nfeFinalizada}
        />
      )}
      {step === 2 && (
        <StepItens
          itens={itens}
          updateItem={updateItem}
          addItem={addItem}
          removeItem={removeItem}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
          isLoadingRascunho={isLoadingRascunho}
          onSalvarRascunho={handleSalvarRascunho}
          nfeFinalizada={nfeFinalizada}
        />
      )}
      {step === 3 && (
        <StepConferencia
          itens={itens}
          onBack={() => setStep(2)}
          onMarcarTodosOk={handleMarcarTodosOk}
          isLoadingRascunho={isLoadingRascunho}
          onSalvarRascunho={handleSalvarRascunho}
          rascunhoId={rascunhoId}
          nfeFinalizada={nfeFinalizada}
          protocoloFinal={protocoloFinal}
          onFinalizarEntrada={handleFinalizarEntrada}
        />
      )}
    </div>
  )
}

/* ── Step 1: Identificação da nota ────────────────────────────────── */

function StepIdentificacao({
  form,
  setField,
  onNext,
  rascunhoDisponivel,
  isLoadingRascunho,
  onSalvarRascunho,
  onIgnorarRascunho,
  nfeFinalizada,
}: {
  form: FormStep1
  setField: <K extends keyof FormStep1>(key: K, value: FormStep1[K]) => void
  onNext: () => void
  rascunhoDisponivel: boolean
  isLoadingRascunho: boolean
  onSalvarRascunho: () => Promise<void>
  onIgnorarRascunho: () => void
  nfeFinalizada: boolean
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-[24px] border border-brand-100 bg-white">
      <div className="flex min-h-0 flex-1 gap-6 overflow-y-auto p-6">
        {/* Form */}
        <div className="flex flex-1 flex-col gap-4">
          {rascunhoDisponivel && (
            <div className="flex items-center justify-between gap-3 rounded-[14px] border border-brand-200 bg-brand-25 px-4 py-3">
              <div>
                <p className="font-bold text-[13px] text-brand-950">Rascunho salvo encontrado</p>
                <p className="text-[11px] text-text-secondary">
                  Deseja retomar a nota fiscal que estava sendo editada?
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onIgnorarRascunho}
                  className="flex h-8 items-center rounded-[10px] border border-brand-100 px-3 font-semibold text-[12px] text-brand-muted hover:bg-brand-50"
                >
                  Ignorar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const raw = localStorage.getItem('nfe_rascunho')
                    if (raw) {
                      onIgnorarRascunho()
                    }
                  }}
                  className="flex h-8 items-center rounded-[10px] bg-brand-900 px-3 font-bold text-[12px] text-white hover:bg-brand-800"
                >
                  Retomar
                </button>
              </div>
            </div>
          )}

          {nfeFinalizada && (
            <div className="flex items-center gap-2 rounded-[12px] border border-brand-100 bg-[#F5F8F6] px-4 py-2.5">
              <span className="font-bold text-[12px] text-brand-700">✓ Nota finalizada</span>
              <span className="text-[12px] text-text-secondary">— modo somente leitura</span>
            </div>
          )}

          <h2 className="font-bold text-[15px] text-brand-950">Dados da nota</h2>

          <FieldGroup label="Chave de acesso NF-e (44 dígitos)">
            <input
              type="text"
              maxLength={44}
              placeholder="00000000000000000000000000000000000000000000"
              value={form.chaveAcesso}
              onChange={(e) => setField('chaveAcesso', e.target.value)}
              disabled={nfeFinalizada}
              className={`${INPUT_CLS} font-mono text-[12px] tracking-wider disabled:opacity-60`}
            />
          </FieldGroup>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="Fornecedor">
              <input
                type="text"
                placeholder="Nome ou CNPJ do fornecedor"
                value={form.fornecedor}
                onChange={(e) => setField('fornecedor', e.target.value)}
                className={INPUT_CLS}
              />
            </FieldGroup>
            <FieldGroup label="Data de entrada">
              <input
                type="date"
                value={form.dataEntrada}
                onChange={(e) => setField('dataEntrada', e.target.value)}
                className={INPUT_CLS}
              />
            </FieldGroup>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="CNPJ do emitente">
              <input
                type="text"
                placeholder="00.000.000/0000-00"
                value={form.cnpj}
                onChange={(e) => setField('cnpj', e.target.value)}
                className={INPUT_CLS}
              />
            </FieldGroup>
            <FieldGroup label="Filial destinatária">
              <select
                value={form.filial}
                onChange={(e) => setField('filial', e.target.value)}
                className={SELECT_CLS}
              >
                <option value="001">001 — Matriz</option>
                <option value="002">002 — Filial Centro</option>
                <option value="003">003 — Filial Norte</option>
              </select>
            </FieldGroup>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="Tipo de total">
              <select
                value={form.tipoTotal}
                onChange={(e) => setField('tipoTotal', e.target.value)}
                className={SELECT_CLS}
              >
                <option value="com_imposto">Com impostos</option>
                <option value="sem_imposto">Sem impostos</option>
              </select>
            </FieldGroup>
            <FieldGroup label="Condição de pagamento">
              <select
                value={form.condicaoPagto}
                onChange={(e) => setField('condicaoPagto', e.target.value)}
                className={SELECT_CLS}
              >
                <option value="avista">À vista</option>
                <option value="30">30 dias</option>
                <option value="30_60_90">30/60/90 dias</option>
                <option value="60_90_120">60/90/120 dias</option>
              </select>
            </FieldGroup>
          </div>

          <FieldGroup label="Natureza da operação">
            <select
              value={form.natureza}
              onChange={(e) => setField('natureza', e.target.value)}
              className={SELECT_CLS}
            >
              <option value="compra">Compra para revenda</option>
              <option value="uso">Compra para uso e consumo</option>
              <option value="devolucao">Devolução de venda</option>
              <option value="transferencia">Transferência entre filiais</option>
            </select>
          </FieldGroup>

          <label
            className={`flex items-center gap-2.5 ${nfeFinalizada ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
          >
            <input
              type="checkbox"
              checked={form.gerarContas}
              onChange={(e) => setField('gerarContas', e.target.checked)}
              disabled={nfeFinalizada}
              className="h-4 w-4 accent-brand-700"
            />
            <span className="text-[13px] text-brand-950">Gerar contas a pagar automaticamente</span>
          </label>
        </div>

        {/* Preview panel */}
        <div className="flex w-[272px] shrink-0 flex-col gap-3">
          <div className="flex flex-col gap-3 rounded-[18px] border border-brand-100 bg-input-bg p-4">
            <p className="font-bold text-[11px] text-brand-muted uppercase tracking-wider">
              Pré-visualização
            </p>
            <PreviewRow label="Fornecedor" value={NFE_INFO.fornecedor} />
            <PreviewRow label="Natureza" value={NFE_INFO.natureza} />
            <PreviewRow label="CNPJ" value={NFE_INFO.cnpj} mono />
            <div className="h-px bg-brand-100" />
            <PreviewRow label="Valor total" value={fmt(NFE_INFO.valorTotal)} bold />
            <PreviewRow label="ICMS" value={fmt(NFE_INFO.icmsTotal)} />
            <PreviewRow
              label="Valor final"
              value={fmt(NFE_INFO.valorFinal)}
              bold
              valueClass="text-success-600"
            />
          </div>
          <div className="flex flex-col gap-3 rounded-[18px] border border-brand-100 bg-input-bg p-4">
            <div className="flex items-center justify-between">
              <p className="font-bold text-[11px] text-brand-muted uppercase tracking-wider">
                SEFAZ
              </p>
              <span className="rounded-full bg-brand-75 px-2.5 py-0.5 font-bold text-[11px] text-brand-700">
                ● Autorizado
              </span>
            </div>
            <PreviewRow label="Protocolo" value={NFE_INFO.protocolo} mono />
            <PreviewRow label="Data autorização" value={NFE_INFO.dataAutorizacao} />
          </div>
        </div>
      </div>

      <StepFooter
        onNext={onNext}
        nextLabel="Próximo"
        isLoadingRascunho={isLoadingRascunho}
        onSalvarRascunho={onSalvarRascunho}
      />
    </div>
  )
}

/* ── Step 2: Itens e lotes ─────────────────────────────────────────── */

function StepItens({
  itens,
  updateItem,
  addItem,
  removeItem,
  onBack,
  onNext,
  isLoadingRascunho,
  onSalvarRascunho,
  nfeFinalizada,
}: {
  itens: NfeItem[]
  updateItem: (seq: number, patch: Partial<NfeItem>) => void
  addItem: () => void
  removeItem: (seq: number) => void
  onBack: () => void
  onNext: () => void
  isLoadingRascunho: boolean
  onSalvarRascunho: () => Promise<void>
  nfeFinalizada: boolean
}) {
  const stats = useMemo(
    () => ({
      noCatalog: itens.filter((i) => i.noCatalog).length,
      semLote: itens.filter((i) => !i.noCatalog && !i.lote.trim()).length,
      divergencias: itens.filter((i) => !i.noCatalog && i.qtdRec !== i.qtdFat).length,
      totalFaturado: itens
        .filter((i) => !i.noCatalog)
        .reduce((s, i) => s + i.valorUnit * i.qtdFat, 0),
      totalRecebido: itens
        .filter((i) => !i.noCatalog)
        .reduce((s, i) => s + i.valorUnit * i.qtdRec, 0),
    }),
    [itens]
  )

  const COL = 'grid-cols-[1fr_72px_80px_96px_120px_108px_88px]'

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-[24px] border border-brand-100 bg-white">
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-6">
        {/* Alert banner — produtos não cadastrados */}
        {stats.noCatalog > 0 && (
          <div className="flex items-center gap-2.5 rounded-full bg-warning-25 px-4 py-2">
            <span className="font-bold text-[13px] text-warning-700">⚠</span>
            <p className="font-semibold text-[12px] text-warning-700">
              {stats.noCatalog} produto{stats.noCatalog > 1 ? 's' : ''} não encontrado
              {stats.noCatalog > 1 ? 's' : ''} no catálogo. Cadastre antes de confirmar.
            </p>
          </div>
        )}

        {/* Divergência de qtd */}
        {stats.divergencias > 0 && (
          <div className="flex items-center gap-2.5 rounded-full bg-warning-50 px-4 py-2">
            <span className="font-bold text-[13px] text-warning-700">≠</span>
            <p className="font-semibold text-[12px] text-warning-800">
              {stats.divergencias} item{stats.divergencias > 1 ? 's' : ''} com quantidade recebida
              diferente do faturado.
            </p>
          </div>
        )}

        {/* Table */}
        <div className="flex flex-col rounded-[18px] border border-brand-100 bg-white">
          {/* Header */}
          <div
            className={`grid ${COL} items-center gap-2 rounded-t-[18px] bg-[#F5F8F6] px-4 py-2.5`}
          >
            {['Produto', 'Qtd fat.', 'Qtd rec.', 'Preço unit.', 'Lote', 'Validade', 'Ação'].map(
              (h) => (
                <span key={h} className="font-semibold text-[11px] text-text-secondary">
                  {h}
                </span>
              )
            )}
          </div>

          {/* Rows */}
          <div className="flex flex-col divide-y divide-brand-100">
            {itens.map((item) => {
              const confirmed = itemIsConfirmed(item)
              const hasDivergencia = !item.noCatalog && item.qtdRec !== item.qtdFat

              return (
                <div
                  key={item.seq}
                  className={[
                    `grid ${COL} items-center gap-2 px-4 py-2.5`,
                    item.noCatalog
                      ? 'bg-warning-25'
                      : hasDivergencia
                        ? 'bg-warning-50'
                        : 'bg-white',
                  ].join(' ')}
                >
                  {/* Produto */}
                  <div className="flex min-w-0 flex-col gap-0.5">
                    {item.noCatalog ? (
                      <>
                        <CelulaBusca
                          nomeNfe={item.produto}
                          onVincular={(nome, produtoId) =>
                            updateItem(item.seq, {
                              produto: nome,
                              noCatalog: false,
                              produto_id: produtoId,
                            })
                          }
                        />
                        <span className="font-mono text-[10px] text-warning-700/70">
                          {item.codigo}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5">
                          {item.produto ? (
                            <span className="truncate font-bold text-[12px] text-brand-950">
                              {item.produto}
                            </span>
                          ) : (
                            <input
                              type="text"
                              placeholder="Nome do produto"
                              value={item.produto}
                              onChange={(e) => updateItem(item.seq, { produto: e.target.value })}
                              className={CELL_INPUT_CLS}
                            />
                          )}
                          {item.produto_id && (
                            <span className="shrink-0 rounded-full bg-brand-75 px-2 py-0.5 font-bold text-[10px] text-success-600">
                              Vinculado
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-text-secondary">
                          {item.codigo || '—'}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Qtd fat. */}
                  <span className="text-[12px] text-text-secondary">{item.qtdFat || '—'}</span>

                  {/* Qtd rec. */}
                  {item.noCatalog ? (
                    <span className="text-[12px] text-warning-700">—</span>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      value={item.qtdRec}
                      onChange={(e) => updateItem(item.seq, { qtdRec: Number(e.target.value) })}
                      className={[
                        CELL_INPUT_CLS,
                        hasDivergencia ? 'border-warning-100 bg-warning-25' : '',
                      ].join(' ')}
                    />
                  )}

                  {/* Preço unit. */}
                  <span className="text-[12px] text-brand-950">
                    {item.valorUnit ? fmt(item.valorUnit) : '—'}
                  </span>

                  {/* Lote */}
                  {item.noCatalog ? (
                    <span className="text-[12px] text-warning-700">—</span>
                  ) : (
                    <input
                      type="text"
                      placeholder="Ex: L2024A"
                      value={item.lote}
                      onChange={(e) => updateItem(item.seq, { lote: e.target.value })}
                      className={[
                        CELL_INPUT_CLS,
                        !item.lote.trim() && item.qtdFat > 0
                          ? 'border-warning-100 bg-warning-25'
                          : '',
                      ].join(' ')}
                    />
                  )}

                  {/* Validade */}
                  {item.noCatalog ? (
                    <span className="text-[12px] text-warning-700">—</span>
                  ) : (
                    <input
                      type="text"
                      placeholder="MM/AAAA"
                      maxLength={7}
                      value={item.validade}
                      onChange={(e) => updateItem(item.seq, { validade: e.target.value })}
                      className={[
                        CELL_INPUT_CLS,
                        !item.validade.trim() && item.qtdFat > 0
                          ? 'border-warning-100 bg-warning-25'
                          : '',
                      ].join(' ')}
                    />
                  )}

                  {/* Ação */}
                  {item.noCatalog ? (
                    <Link
                      to="/cadastros/produtos"
                      className="inline-flex items-center gap-1 rounded-full border border-warning-100 bg-warning-50 px-2.5 py-0.5 font-bold text-[10px] text-warning-700 transition-colors hover:bg-warning-100"
                    >
                      ⚠ Cadastrar
                    </Link>
                  ) : confirmed ? (
                    <span className="font-bold text-[14px] text-brand-700">✓</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeItem(item.seq)}
                      title="Remover item"
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[12px] text-brand-muted transition-colors hover:bg-danger-50 hover:text-danger-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Add row button */}
          {!nfeFinalizada && (
            <div className="px-4 py-3">
              {/* TODO: integrar com API — GET /api/v1/produtos/buscar para autocomplete do produto */}
              <button
                type="button"
                onClick={addItem}
                className="flex h-[38px] items-center gap-1.5 rounded-[10px] border border-brand-100 px-3 font-semibold text-[12px] text-text-secondary transition-colors hover:border-brand-300 hover:text-brand-950"
              >
                + Adicionar linha
              </button>
            </div>
          )}
        </div>

        {/* Totals bar */}
        <div className="flex items-center justify-end gap-8 rounded-[14px] border border-brand-100 bg-[#F5F8F6] px-5 py-3">
          <TotalCell label="Qtd itens" value={`${itens.filter((i) => !i.noCatalog).length}`} />
          <TotalCell label="Total faturado" value={fmt(stats.totalFaturado)} />
          <TotalCell label="Total recebido" value={fmt(stats.totalRecebido)} highlight />
        </div>
      </div>

      <StepFooter
        onBack={onBack}
        onNext={onNext}
        nextLabel="Conferência"
        isLoadingRascunho={isLoadingRascunho}
        onSalvarRascunho={onSalvarRascunho}
      />
    </div>
  )
}

/* ── Step 3: Conferência e entrada ─────────────────────────────────── */

const CHECKLIST_CFG: Record<
  ConferenceStatus,
  Array<{ text: string; variant: 'ok' | 'warning' | 'critical' }>
> = {
  revisao: [
    { text: '✓ Todos os itens da NF foram vinculados a produtos do catálogo', variant: 'ok' },
    { text: '✓ Lotes e validades preenchidos para itens controlados', variant: 'ok' },
    { text: '✓ CFOP e CST conferidos com o regime tributário', variant: 'ok' },
    { text: '⚠ 1 item com margem abaixo da mínima configurada', variant: 'warning' },
  ],
  bloqueado: [
    { text: '✓ Todos os itens da NF foram vinculados a produtos do catálogo', variant: 'ok' },
    { text: '✓ Lotes e validades preenchidos para itens controlados', variant: 'ok' },
    { text: '✓ CFOP e CST conferidos com o regime tributário', variant: 'ok' },
    { text: '✗ Divergência crítica de tributação detectada', variant: 'critical' },
  ],
  sucesso: [
    { text: '✓ Entrada validada sem divergências', variant: 'ok' },
    { text: '✓ Lotes e validades preenchidos para itens controlados', variant: 'ok' },
    { text: '✓ CFOP e CST conferidos com o regime tributário', variant: 'ok' },
    { text: '✓ Sem alertas pendentes', variant: 'ok' },
  ],
}

const CONFERENCE_MSG: Record<ConferenceStatus, string> = {
  revisao: 'Todos os itens serão lançados no estoque após confirmação.',
  bloqueado: 'A confirmação está bloqueada até resolver pendências críticas.',
  sucesso: 'Protocolo #EN-2026-004812 gerado e enviado ao fiscal.',
}

const FOOTER_NOTE: Record<ConferenceStatus, { text: string; cls: string }> = {
  revisao: {
    text: 'Após confirmação, o estoque e o financeiro serão atualizados automaticamente.',
    cls: 'text-text-secondary',
  },
  bloqueado: {
    text: 'Existem pendências fiscais críticas. Corrija para liberar a entrada.',
    cls: 'font-semibold text-danger-700',
  },
  sucesso: {
    text: 'Entrada realizada com sucesso. Estoque e financeiro atualizados.',
    cls: 'font-semibold text-brand-700',
  },
}

type FiscalValues = { icmsTotal: number; pisCofins: number; valorFinal: number }

function StepConferencia({
  itens,
  onBack,
  onMarcarTodosOk,
  isLoadingRascunho,
  onSalvarRascunho,
  rascunhoId,
  nfeFinalizada,
  protocoloFinal,
  onFinalizarEntrada,
}: {
  itens: NfeItem[]
  onBack: () => void
  onMarcarTodosOk: () => void
  isLoadingRascunho: boolean
  onSalvarRascunho: () => Promise<void>
  rascunhoId: string | null
  nfeFinalizada: boolean
  protocoloFinal: string | null
  onFinalizarEntrada: (protocolo: string) => void
}) {
  const [status, setStatus] = useState<ConferenceStatus>('revisao')
  const [marcarTodosOpen, setMarcarTodosOpen] = useState(false)
  const [arredondamentoOpen, setArredondamentoOpen] = useState(false)
  const [finalizarOpen, setFinalizarOpen] = useState(false)
  const [isLoadingFinalizar, setIsLoadingFinalizar] = useState(false)
  const [fiscalValues, setFiscalValues] = useState<FiscalValues>({
    icmsTotal: NFE_INFO.icmsTotal,
    pisCofins: NFE_INFO.pisCofins,
    valorFinal: NFE_INFO.valorFinal,
  })

  const canConfirm = status !== 'bloqueado'
  const isSuccess = status === 'sucesso'
  const noCatalogCount = itens.filter((i) => i.noCatalog).length
  const confirmaveisCount = itens.filter((i) => !i.noCatalog && !i.conferido).length

  const handleFinalizarConfirmado = async () => {
    setIsLoadingFinalizar(true)
    try {
      await new Promise((r) => setTimeout(r, 1200))
      const protocolo = `EN-${Date.now()}`
      onFinalizarEntrada(protocolo)
      setStatus('sucesso')
      setFinalizarOpen(false)
      // TODO: integrar com API — POST /api/v1/fiscal/nfe/confirmar
    } catch (err) {
      console.error('[handleFinalizarConfirmado]', err)
    } finally {
      setIsLoadingFinalizar(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-[24px] border border-brand-100 bg-white">
      <div className="flex min-h-0 flex-1 gap-6 overflow-y-auto p-6">
        {/* Left column */}
        <div className="flex flex-1 flex-col gap-4">
          {/* Resumo da nota */}
          <div className="flex flex-col gap-3 rounded-[18px] border border-brand-100 bg-white p-4">
            <h2 className="font-bold text-[14px] text-brand-950">
              Resumo da nota para conferência
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-text-secondary">Fornecedor</span>
                <span className="font-semibold text-[12px] text-brand-950">
                  {NFE_INFO.fornecedor}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-text-secondary">Ordem Nr.</span>
                <span className="font-semibold text-[12px] text-brand-950">
                  {NFE_INFO.numeroNota}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-text-secondary">Total da nota</span>
                <span className="font-bold text-[13px] text-brand-950">
                  {fmt(NFE_INFO.valorTotal)}
                </span>
              </div>
            </div>

            <div className="h-px bg-brand-100" />

            <div className="flex flex-col gap-2">
              {CHECKLIST_CFG[status].map((item) => (
                <CheckLine key={item.text} text={item.text} variant={item.variant} />
              ))}
            </div>

            {status !== 'sucesso' && (
              <div className="flex flex-col gap-2 rounded-[12px] border border-warning-100 bg-warning-25 p-3">
                <p className="font-bold text-[12px] text-warning-950">
                  Pendências que exigem atenção antes da entrada
                </p>
                <p className="font-semibold text-[12px] text-warning-700">
                  • 1 item com margem abaixo da política (mín. 18%)
                </p>
                <p className="font-semibold text-[12px] text-warning-700">
                  • Divergência de NCM em 1 SKU (sugerido: 3004.90.99)
                </p>
                <p className="font-semibold text-[12px] text-warning-700">
                  • Validar alíquota interna de ICMS para UF destino
                </p>
              </div>
            )}
          </div>

          {/* Itens da NF-e */}
          <div className="flex flex-col gap-3 rounded-[18px] border border-brand-100 bg-white p-4">
            <h2 className="font-bold text-[14px] text-brand-950">Itens da NF-e</h2>

            <div className="flex flex-col gap-1.5">
              <div className="grid grid-cols-[minmax(0,1fr)_48px_90px_90px_110px] gap-2 rounded-[10px] bg-[#F5F8F6] px-3 py-2">
                {['Produto', 'Qtd', 'Preço unit.', 'Total', 'Status'].map((h) => (
                  <span key={h} className="font-semibold text-[11px] text-text-secondary">
                    {h}
                  </span>
                ))}
              </div>
              {itens.map((item) => (
                <div
                  key={item.seq}
                  className="grid grid-cols-[minmax(0,1fr)_48px_90px_90px_110px] items-center gap-2 rounded-[10px] bg-[#FBFCFB] px-3 py-2.5"
                >
                  <span className="truncate font-semibold text-[12px] text-brand-950">
                    {item.produto}
                  </span>
                  <span className="text-[12px] text-text-secondary">{item.qtdFat}</span>
                  <span className="text-[12px] text-brand-950">{fmt(item.valorUnit)}</span>
                  <span className="font-semibold text-[12px] text-brand-950">
                    {fmt(item.valorUnit * item.qtdFat)}
                  </span>
                  <span
                    className={`font-semibold text-[12px] ${item.margemBaixa ? 'text-warning-700' : 'text-brand-700'}`}
                  >
                    {item.margemBaixa ? '⚠ Margem baixa' : '✓ OK'}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMarcarTodosOpen(true)}
                className="flex h-[34px] items-center gap-1.5 rounded-[10px] border border-success-600 px-3 font-bold text-[12px] text-success-600 transition-colors hover:bg-brand-25"
              >
                Marcar todos como OK
                {noCatalogCount > 0 && (
                  <span className="rounded-full bg-warning-50 px-1.5 py-0.5 font-bold text-[10px] text-warning-700">
                    {noCatalogCount} pendente{noCatalogCount > 1 ? 's' : ''}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setArredondamentoOpen(true)}
                className="flex h-[34px] items-center rounded-[10px] border border-brand-100 bg-white px-3 font-semibold text-[12px] text-brand-muted transition-colors hover:bg-brand-50"
              >
                Aplicar arredondamento fiscal
              </button>
            </div>

            <div className="flex flex-col gap-1 rounded-[12px] border border-danger-100 bg-danger-50 p-2.5">
              <p className="font-bold text-[12px] text-danger-700">
                Lote crítico: Vitamina D3 2.000UI
              </p>
              <p className="text-[11px] text-danger-muted">
                Validade informada 06/2025 está abaixo do mínimo configurado (8 meses).
              </p>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex w-[330px] shrink-0 flex-col gap-4">
          {/* Totais fiscais */}
          <div className="flex flex-col gap-3 rounded-[18px] border border-brand-100 bg-white p-4">
            <h2 className="font-bold text-[14px] text-brand-950">Totais fiscais</h2>
            <div className="flex flex-col gap-1.5">
              <p className="text-[12px] text-brand-950">
                Base ICMS: <span className="font-semibold">{fmt(NFE_INFO.baseIcms)}</span>
              </p>
              <p className="text-[12px] text-brand-950">
                ICMS total: <span className="font-semibold">{fmt(fiscalValues.icmsTotal)}</span>
              </p>
              <p className="text-[12px] text-brand-950">
                PIS/COFINS: <span className="font-semibold">{fmt(fiscalValues.pisCofins)}</span>
              </p>
              <p className="text-[12px] text-brand-950">
                Frete: <span className="font-semibold">{fmt(NFE_INFO.frete)}</span>
              </p>
            </div>
            <div className="h-px bg-brand-100" />
            <div className="flex items-baseline justify-between">
              <span className="font-bold text-[13px] text-brand-950">Valor final</span>
              <span className="font-bold text-[16px] text-brand-700">
                {fmt(fiscalValues.valorFinal)}
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-[12px] border border-input-border bg-input-bg p-2.5">
              <p className="font-bold text-[11px] text-brand-950">Conciliação automática</p>
              <p className="text-[11px] text-text-secondary">
                Plano de contas: Estoque de Mercadorias (1.1.3.01)
              </p>
              <p className="text-[11px] text-text-secondary">
                Centro de custo: Compras Loja Matriz
              </p>
            </div>
          </div>

          {/* Conferência final */}
          {nfeFinalizada && protocoloFinal ? (
            <div className="flex flex-col items-center gap-4 rounded-[18px] border border-brand-100 bg-brand-25 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-700">
                <span className="font-bold text-[20px] text-white leading-none">✓</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="font-bold text-[15px] text-brand-950">Entrada finalizada</p>
                <p className="font-mono text-[12px] text-text-secondary">{protocoloFinal}</p>
                <p className="text-[11px] text-text-secondary">
                  Estoque e financeiro atualizados automaticamente.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2">
                <Link
                  to="/financeiro"
                  className="flex h-10 items-center justify-center rounded-[12px] bg-brand-900 font-bold text-[13px] text-white hover:bg-brand-800"
                >
                  Ver contas a pagar →
                </Link>
                <button
                  type="button"
                  className="flex h-10 items-center justify-center rounded-[12px] border border-brand-200 font-semibold text-[13px] text-brand-700 hover:bg-brand-50"
                >
                  Gerar etiquetas
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 rounded-[18px] border border-brand-100 bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[14px] text-brand-950">Conferência final</h2>
                <div className="flex gap-1">
                  {(['revisao', 'bloqueado', 'sucesso'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
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
              </div>

              <p className="text-[12px] text-text-secondary">{CONFERENCE_MSG[status]}</p>

              <button
                type="button"
                disabled={!canConfirm || isSuccess}
                onClick={() => canConfirm && !isSuccess && setFinalizarOpen(true)}
                className={[
                  'flex h-11 items-center justify-center rounded-[10px] font-bold text-[13px] text-white transition-colors',
                  canConfirm
                    ? isSuccess
                      ? 'cursor-default bg-brand-800'
                      : 'bg-brand-900 hover:bg-brand-800'
                    : 'cursor-not-allowed bg-brand-300',
                ].join(' ')}
              >
                {isSuccess ? '✓ Entrada confirmada' : 'Finalizar entrada'}
              </button>

              <button
                type="button"
                onClick={onBack}
                className="flex h-10 items-center justify-center rounded-[10px] border border-brand-100 font-semibold text-[13px] text-brand-muted transition-colors hover:bg-brand-50"
              >
                Corrigir itens
              </button>

              <div className="flex flex-col gap-1 rounded-[12px] border border-input-border bg-input-bg p-2.5">
                <p className="font-bold text-[11px] text-brand-950">Rastro de auditoria</p>
                <p className="text-[11px] text-text-secondary">10:42 • XML importado por Ana</p>
                <p className="text-[11px] text-text-secondary">
                  10:47 • Itens vinculados automaticamente
                </p>
                <p className="text-[11px] text-text-secondary">
                  10:53 • Revisão fiscal concluída por João
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-brand-100 border-t px-6 py-4">
        <div className="flex flex-col gap-0.5">
          <span className={`text-[12px] ${FOOTER_NOTE[status].cls}`}>
            {FOOTER_NOTE[status].text}
          </span>
          {rascunhoId && (
            <span className="text-[11px] text-text-secondary">Rascunho salvo: {rascunhoId}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isLoadingRascunho}
            onClick={onSalvarRascunho}
            className={[
              'flex h-10 items-center rounded-[10px] border border-brand-100 px-4 font-semibold text-[13px] transition-colors',
              isLoadingRascunho
                ? 'cursor-not-allowed text-brand-muted opacity-60'
                : 'text-brand-muted hover:bg-brand-50',
            ].join(' ')}
          >
            {isLoadingRascunho ? 'Salvando...' : 'Salvar rascunho'}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 items-center rounded-[10px] border border-brand-100 px-4 font-semibold text-[13px] text-brand-muted transition-colors hover:bg-brand-50"
          >
            Voltar
          </button>
          <button
            type="button"
            disabled={!canConfirm || nfeFinalizada}
            onClick={() => canConfirm && !nfeFinalizada && setFinalizarOpen(true)}
            className={[
              'flex h-10 items-center rounded-[10px] px-4 font-bold text-[13px] text-white transition-colors',
              canConfirm && !nfeFinalizada
                ? 'bg-brand-900 hover:bg-brand-800'
                : 'cursor-not-allowed bg-brand-300',
            ].join(' ')}
          >
            {nfeFinalizada ? '✓ Finalizado' : 'Finalizar entrada'}
          </button>
        </div>
      </div>

      {marcarTodosOpen && (
        <ModalMarcarTodosOk
          confirmaveisCount={confirmaveisCount}
          noCatalogCount={noCatalogCount}
          onClose={() => setMarcarTodosOpen(false)}
          onConfirm={() => {
            onMarcarTodosOk()
            setMarcarTodosOpen(false)
          }}
        />
      )}

      {arredondamentoOpen && (
        <ModalArredondamentoFiscal
          original={{
            icmsTotal: NFE_INFO.icmsTotal,
            pisCofins: NFE_INFO.pisCofins,
            valorFinal: NFE_INFO.valorFinal,
          }}
          onClose={() => setArredondamentoOpen(false)}
          onAplicar={(rounded) => {
            setFiscalValues(rounded)
            setArredondamentoOpen(false)
          }}
        />
      )}

      {finalizarOpen && (
        <ModalFinalizarEntrada
          itens={itens}
          fiscalValues={fiscalValues}
          isLoading={isLoadingFinalizar}
          onClose={() => setFinalizarOpen(false)}
          onConfirmar={handleFinalizarConfirmado}
        />
      )}
    </div>
  )
}

/* ── Shared sub-components ────────────────────────────────────────── */

function StepFooter({
  onBack,
  onNext,
  nextLabel,
  isLoadingRascunho = false,
  onSalvarRascunho,
}: {
  onBack?: () => void
  onNext: () => void
  nextLabel: string
  isLoadingRascunho?: boolean
  onSalvarRascunho?: () => Promise<void>
}) {
  return (
    <div className="flex items-center justify-between border-brand-100 border-t px-6 py-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="font-bold text-[13px] text-brand-muted hover:text-brand-950"
        >
          ← Voltar
        </button>
      ) : (
        <button
          type="button"
          className="font-bold text-[13px] text-brand-muted hover:text-brand-950"
        >
          Cancelar
        </button>
      )}
      <div className="flex items-center gap-2">
        {onSalvarRascunho && (
          <button
            type="button"
            disabled={isLoadingRascunho}
            onClick={onSalvarRascunho}
            className={[
              'flex h-9 items-center rounded-[14px] border border-brand-100 bg-white px-4 font-bold text-[12px] transition-colors',
              isLoadingRascunho
                ? 'cursor-not-allowed text-brand-muted opacity-60'
                : 'text-brand-950 hover:bg-brand-50',
            ].join(' ')}
          >
            {isLoadingRascunho ? 'Salvando...' : 'Salvar rascunho'}
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          className="flex h-9 items-center gap-1.5 rounded-[14px] bg-brand-900 px-4 font-bold text-[12px] text-white transition-colors hover:bg-brand-800"
        >
          {nextLabel} →
        </button>
      </div>
    </div>
  )
}

function FieldGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-semibold text-[12px] text-input-label">{label}</span>
      {children}
    </div>
  )
}

function PreviewRow({
  label,
  value,
  mono,
  bold,
  valueClass,
}: {
  label: string
  value: string
  mono?: boolean
  bold?: boolean
  valueClass?: string
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="shrink-0 text-[12px] text-text-secondary">{label}</span>
      <span
        className={[
          'text-right text-[12px]',
          mono ? 'font-mono' : '',
          bold ? 'font-bold' : '',
          valueClass ?? 'text-brand-950',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {value}
      </span>
    </div>
  )
}

function CheckLine({ text, variant }: { text: string; variant: 'ok' | 'warning' | 'critical' }) {
  const cls = {
    ok: 'font-medium text-brand-700',
    warning: 'font-semibold text-warning-700',
    critical: 'font-bold text-danger-700',
  }[variant]
  return <p className={`text-[12px] ${cls}`}>{text}</p>
}

function TotalCell({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="text-[11px] text-text-secondary">{label}</span>
      <span
        className={`font-bold text-[13px] ${highlight ? 'text-success-600' : 'text-brand-950'}`}
      >
        {value}
      </span>
    </div>
  )
}

/* ── Modal: Marcar todos como OK ───────────────────────────────────── */

function ModalMarcarTodosOk({
  confirmaveisCount,
  noCatalogCount,
  onClose,
  onConfirm,
}: {
  confirmaveisCount: number
  noCatalogCount: number
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar modal"
      />
      <div className="relative z-10 flex w-[460px] flex-col gap-5 rounded-[28px] bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-1">
          <p className="font-bold text-[18px] text-brand-950">Marcar itens como OK</p>
          <p className="text-[13px] text-text-secondary">
            Confirme o reconhecimento dos itens conferidos.
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-[16px] border border-brand-100 bg-input-bg p-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-brand-950">Itens a serem marcados como OK</span>
            <span className="font-bold text-[14px] text-brand-700">{confirmaveisCount}</span>
          </div>
          {noCatalogCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-warning-700">
                ⚠ Sem catálogo (permanecem pendentes)
              </span>
              <span className="font-bold text-[14px] text-warning-700">{noCatalogCount}</span>
            </div>
          )}
        </div>

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
            onClick={onConfirm}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] bg-brand-900 font-bold text-[13px] text-white hover:bg-brand-800"
          >
            Confirmar ({confirmaveisCount} iten{confirmaveisCount !== 1 ? 's' : ''})
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Modal: Arredondamento Fiscal ──────────────────────────────────── */

const FISCAL_BRUTO = {
  icmsTotal: NFE_INFO.icmsTotal,
  pisCofins: NFE_INFO.pisCofins,
  valorFinal: NFE_INFO.valorFinal,
}

function round2(v: number) {
  return Math.round(v * 100) / 100
}

function ModalArredondamentoFiscal({
  original,
  onClose,
  onAplicar,
}: {
  original: FiscalValues
  onClose: () => void
  onAplicar: (rounded: FiscalValues) => void
}) {
  const rounded: FiscalValues = {
    icmsTotal: round2(FISCAL_BRUTO.icmsTotal),
    pisCofins: round2(FISCAL_BRUTO.pisCofins),
    valorFinal: round2(FISCAL_BRUTO.valorFinal),
  }

  const diffTotal =
    round2(original.icmsTotal - rounded.icmsTotal) +
    round2(original.pisCofins - rounded.pisCofins) +
    round2(original.valorFinal - rounded.valorFinal)

  const rows: Array<{ label: string; before: number; after: number }> = [
    { label: 'ICMS total', before: original.icmsTotal, after: rounded.icmsTotal },
    { label: 'PIS/COFINS', before: original.pisCofins, after: rounded.pisCofins },
    { label: 'Valor final', before: original.valorFinal, after: rounded.valorFinal },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar modal"
      />
      <div className="relative z-10 flex w-[520px] flex-col gap-5 rounded-[28px] bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-1">
          <p className="font-bold text-[18px] text-brand-950">Arredondamento fiscal</p>
          <p className="text-[13px] text-text-secondary">
            Valores ajustados a 2 casas decimais conforme SEFAZ.
          </p>
        </div>

        <div className="flex flex-col overflow-hidden rounded-[16px] border border-brand-100">
          <div className="grid grid-cols-[1fr_110px_110px] gap-2 bg-[#F5F8F6] px-4 py-2.5">
            {['Campo', 'Antes', 'Depois'].map((h) => (
              <span key={h} className="font-semibold text-[11px] text-text-secondary">
                {h}
              </span>
            ))}
          </div>
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[1fr_110px_110px] items-center gap-2 border-brand-100 border-t bg-[#FBFCFB] px-4 py-2.5"
            >
              <span className="text-[12px] text-brand-950">{row.label}</span>
              <span className="font-mono text-[12px] text-text-secondary">{fmt(row.before)}</span>
              <span className="font-mono font-semibold text-[12px] text-brand-950">
                {fmt(row.after)}
              </span>
            </div>
          ))}
          <div className="grid grid-cols-[1fr_110px_110px] items-center gap-2 border-brand-200 border-t bg-white px-4 py-2.5">
            <span className="font-bold text-[12px] text-brand-950">Diferença total</span>
            <span />
            <span
              className={`font-bold font-mono text-[12px] ${Math.abs(diffTotal) < 0.005 ? 'text-success-600' : 'text-warning-700'}`}
            >
              {diffTotal === 0 ? '—' : fmt(Math.abs(diffTotal))}
            </span>
          </div>
        </div>

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
            onClick={() => onAplicar(rounded)}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] bg-brand-900 font-bold text-[13px] text-white hover:bg-brand-800"
          >
            Aplicar arredondamento
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Modal: Finalizar Entrada ──────────────────────────────────────── */

function ModalFinalizarEntrada({
  itens,
  fiscalValues,
  isLoading,
  onClose,
  onConfirmar,
}: {
  itens: NfeItem[]
  fiscalValues: FiscalValues
  isLoading: boolean
  onClose: () => void
  onConfirmar: () => Promise<void>
}) {
  const qtdItens = itens.filter((i) => !i.noCatalog).length
  const vencimento = new Date()
  vencimento.setDate(vencimento.getDate() + 30)
  const vencStr = vencimento.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar modal"
      />
      <div className="relative z-10 flex w-[480px] flex-col gap-5 rounded-[28px] bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-1">
          <p className="font-bold text-[18px] text-brand-950">Confirmar entrada de nota</p>
          <p className="text-[13px] text-text-secondary">
            Revise os dados antes de confirmar. Esta ação não pode ser desfeita.
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-[16px] border border-brand-100 bg-input-bg p-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-text-secondary">Fornecedor</span>
            <span className="font-semibold text-[13px] text-brand-950">{NFE_INFO.fornecedor}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-text-secondary">Número da nota</span>
            <span className="font-mono font-semibold text-[12px] text-brand-950">
              {NFE_INFO.numeroNota}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-text-secondary">Qtd itens</span>
            <span className="font-semibold text-[13px] text-brand-950">{qtdItens} SKUs</span>
          </div>
          <div className="h-px bg-brand-100" />
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-text-secondary">Valor final</span>
            <span className="font-bold text-[14px] text-brand-950">
              {fmt(fiscalValues.valorFinal)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-text-secondary">Vencimento 1ª parcela</span>
            <span className="font-semibold text-[12px] text-brand-950">{vencStr}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 rounded-[12px] border border-warning-100 bg-warning-25 p-3">
          <p className="font-semibold text-[12px] text-warning-700">
            ⚠ Ao confirmar, o estoque será atualizado e as contas a pagar lançadas no financeiro.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-brand-200 font-bold text-[13px] text-brand-700 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={isLoading}
            className={[
              'flex h-10 flex-1 items-center justify-center rounded-[14px] font-bold text-[13px] text-white transition-colors',
              isLoading ? 'cursor-not-allowed bg-brand-400' : 'bg-brand-900 hover:bg-brand-800',
            ].join(' ')}
          >
            {isLoading ? 'Confirmando...' : 'Confirmar entrada'}
          </button>
        </div>
      </div>
    </div>
  )
}
