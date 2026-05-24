import { useState } from 'react'
import type { ExportacaoStatus, FormatoExportacao, TipoRelatorio } from '../schemas'

/* ── Types ────────────────────────────────────────────────────────── */

type CategoriaId = 'vendas' | 'estoque' | 'sngpc' | 'pbm' | 'financeiro'

type RelatorioOpcao = { id: TipoRelatorio; label: string }

type CategoriaConfig = {
  id: CategoriaId
  titulo: string
  icon: string
  desc: string
  qtd: number
  bg: string
  border: string
  iconBg: string
  iconText: string
  ativoBg: string
  ativoBorder: string
  relatorios: RelatorioOpcao[]
}

type PreviewData = { cols: string[]; rows: Record<string, string>[] }

/* ── Constants ────────────────────────────────────────────────────── */

const HOJE = new Date().toISOString().split('T')[0]
const PRIMEIRO_MES = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString()
  .split('T')[0]

const CATEGORIAS: CategoriaConfig[] = [
  {
    id: 'vendas',
    titulo: 'Vendas',
    icon: '↗',
    desc: 'Por período, produto, operador e curva ABC',
    qtd: 4,
    bg: 'bg-white',
    border: 'border-brand-100',
    iconBg: 'bg-brand-75',
    iconText: 'text-brand-700',
    ativoBg: 'bg-brand-25',
    ativoBorder: 'border-brand-700',
    relatorios: [
      { id: 'vendas_periodo', label: 'Vendas por período' },
      { id: 'curva_abc', label: 'Curva ABC de produtos' },
    ],
  },
  {
    id: 'estoque',
    titulo: 'Estoque',
    icon: '▦',
    desc: 'Estoque atual, validade e reposição sugerida',
    qtd: 3,
    bg: 'bg-white',
    border: 'border-brand-100',
    iconBg: 'bg-info-50',
    iconText: 'text-info-700',
    ativoBg: 'bg-info-50',
    ativoBorder: 'border-info-700',
    relatorios: [
      { id: 'estoque_atual', label: 'Estoque atual' },
      { id: 'validade', label: 'Produtos por validade' },
    ],
  },
  {
    id: 'sngpc',
    titulo: 'SNGPC',
    icon: '⚖',
    desc: 'Movimentações conferidas e envios ANVISA',
    qtd: 2,
    bg: 'bg-white',
    border: 'border-brand-100',
    iconBg: 'bg-warning-50',
    iconText: 'text-warning-700',
    ativoBg: 'bg-warning-25',
    ativoBorder: 'border-warning-600',
    relatorios: [{ id: 'sngpc_movimentacoes', label: 'Movimentações conferidas' }],
  },
  {
    id: 'pbm',
    titulo: 'PBM',
    icon: '✚',
    desc: 'Atendimentos por convênio e descontos',
    qtd: 3,
    bg: 'bg-white',
    border: 'border-brand-100',
    iconBg: 'bg-danger-50',
    iconText: 'text-danger-700',
    ativoBg: 'bg-danger-25',
    ativoBorder: 'border-danger-600',
    relatorios: [{ id: 'pbm_atendimentos', label: 'Atendimentos PBM' }],
  },
  {
    id: 'financeiro',
    titulo: 'Financeiro',
    icon: '$',
    desc: 'Contas pagas, a vencer e DRE simplificado',
    qtd: 3,
    bg: 'bg-white',
    border: 'border-brand-100',
    iconBg: 'bg-brand-75',
    iconText: 'text-brand-700',
    ativoBg: 'bg-brand-25',
    ativoBorder: 'border-brand-700',
    relatorios: [{ id: 'contas_pagar', label: 'Contas a pagar' }],
  },
]

// TODO: GET /api/v1/relatorios/preview?tipo=&data_inicio=&data_fim=
const PREVIEW: Record<TipoRelatorio, PreviewData> = {
  vendas_periodo: {
    cols: ['Data', 'N.º Venda', 'Operador', 'Cliente', 'Itens', 'Forma Pagto', 'Total'],
    rows: [
      {
        Data: '19/05/2026',
        'N.º Venda': '#00847',
        Operador: 'João Silva',
        Cliente: 'Maria Silva',
        Itens: '4',
        'Forma Pagto': 'PIX',
        Total: 'R$ 142,60',
      },
      {
        Data: '19/05/2026',
        'N.º Venda': '#00846',
        Operador: 'Ana Pereira',
        Cliente: 'Carlos Mendes',
        Itens: '2',
        'Forma Pagto': 'Débito',
        Total: 'R$ 58,40',
      },
      {
        Data: '18/05/2026',
        'N.º Venda': '#00845',
        Operador: 'João Silva',
        Cliente: '—',
        Itens: '6',
        'Forma Pagto': 'PIX',
        Total: 'R$ 210,00',
      },
      {
        Data: '18/05/2026',
        'N.º Venda': '#00844',
        Operador: 'Ana Pereira',
        Cliente: 'Sandra Lima',
        Itens: '1',
        'Forma Pagto': 'PBM',
        Total: 'R$ 12,40',
      },
      {
        Data: '17/05/2026',
        'N.º Venda': '#00843',
        Operador: 'João Silva',
        Cliente: 'Paulo Santos',
        Itens: '3',
        'Forma Pagto': 'Crédito',
        Total: 'R$ 89,90',
      },
    ],
  },
  curva_abc: {
    cols: ['Produto', 'Qtd Vendida', 'Faturamento', '% Acum.', 'Classe'],
    rows: [
      {
        Produto: 'Dipirona 500mg',
        'Qtd Vendida': '1.240',
        Faturamento: 'R$ 3.472,00',
        '% Acum.': '18,4%',
        Classe: 'A',
      },
      {
        Produto: 'Losartana 50mg',
        'Qtd Vendida': '980',
        Faturamento: 'R$ 2.744,00',
        '% Acum.': '33,0%',
        Classe: 'A',
      },
      {
        Produto: 'Omeprazol 20mg',
        'Qtd Vendida': '756',
        Faturamento: 'R$ 1.890,00',
        '% Acum.': '43,0%',
        Classe: 'A',
      },
      {
        Produto: 'Vitamina D3',
        'Qtd Vendida': '520',
        Faturamento: 'R$ 1.456,00',
        '% Acum.': '50,7%',
        Classe: 'B',
      },
      {
        Produto: 'Amoxicilina 500mg',
        'Qtd Vendida': '340',
        Faturamento: 'R$ 952,00',
        '% Acum.': '55,7%',
        Classe: 'B',
      },
    ],
  },
  estoque_atual: {
    cols: ['Produto', 'Lote', 'Estoque', 'Mínimo', 'Validade', 'Status'],
    rows: [
      {
        Produto: 'Losartana 50mg',
        Lote: 'L-1044',
        Estoque: '124',
        Mínimo: '80',
        Validade: '62 dias',
        Status: 'Saudável',
      },
      {
        Produto: 'Dipirona 500mg',
        Lote: 'D-2291',
        Estoque: '18',
        Mínimo: '40',
        Validade: '18 dias',
        Status: 'Alerta',
      },
      {
        Produto: 'Morfina 10mg',
        Lote: 'C-8920',
        Estoque: '7',
        Mínimo: '12',
        Validade: '9 dias',
        Status: 'Crítico',
      },
      {
        Produto: 'Seringa 10ml',
        Lote: 'P-7812',
        Estoque: '21',
        Mínimo: '60',
        Validade: 'N/A',
        Status: 'Comprar',
      },
      {
        Produto: 'Amoxicilina 500mg',
        Lote: 'A-5561',
        Estoque: '53',
        Mínimo: '30',
        Validade: '34 dias',
        Status: 'Saudável',
      },
    ],
  },
  validade: {
    cols: ['Produto', 'Lote', 'Validade', 'Dias Restantes', 'Estoque', 'Ação'],
    rows: [
      {
        Produto: 'Morfina 10mg',
        Lote: 'C-8920',
        Validade: '28/05/2026',
        'Dias Restantes': '9',
        Estoque: '7',
        Ação: 'Urgente',
      },
      {
        Produto: 'Dipirona 500mg',
        Lote: 'D-2291',
        Validade: '06/06/2026',
        'Dias Restantes': '18',
        Estoque: '18',
        Ação: 'Atenção',
      },
      {
        Produto: 'Amoxicilina 500mg',
        Lote: 'A-5561',
        Validade: '22/06/2026',
        'Dias Restantes': '34',
        Estoque: '53',
        Ação: 'Monitorar',
      },
      {
        Produto: 'Losartana 50mg',
        Lote: 'L-1044',
        Validade: '20/07/2026',
        'Dias Restantes': '62',
        Estoque: '124',
        Ação: 'OK',
      },
      {
        Produto: 'Omeprazol 20mg',
        Lote: 'O-3312',
        Validade: '15/08/2026',
        'Dias Restantes': '88',
        Estoque: '45',
        Ação: 'OK',
      },
    ],
  },
  sngpc_movimentacoes: {
    cols: ['Data', 'Produto', 'Tipo', 'Qtd', 'Paciente', 'Status', 'Protocolo'],
    rows: [
      {
        Data: '19/05/2026',
        Produto: 'Morfina 10mg',
        Tipo: 'Saída',
        Qtd: '1',
        Paciente: 'Maria Silva',
        Status: 'Conferido',
        Protocolo: 'ANVISA-2026-001',
      },
      {
        Data: '18/05/2026',
        Produto: 'Ritalina 10mg',
        Tipo: 'Saída',
        Qtd: '2',
        Paciente: 'João Pereira',
        Status: 'Conferido',
        Protocolo: 'ANVISA-2026-001',
      },
      {
        Data: '17/05/2026',
        Produto: 'Morfina 10mg',
        Tipo: 'Entrada',
        Qtd: '7',
        Paciente: '—',
        Status: 'Conferido',
        Protocolo: 'ANVISA-2026-001',
      },
      {
        Data: '16/05/2026',
        Produto: 'Alprazolam',
        Tipo: 'Saída',
        Qtd: '1',
        Paciente: 'Ana Rodrigues',
        Status: 'Enviado',
        Protocolo: 'ANVISA-2026-002',
      },
      {
        Data: '15/05/2026',
        Produto: 'Codeína 30mg',
        Tipo: 'Saída',
        Qtd: '1',
        Paciente: 'Carlos Mendes',
        Status: 'Enviado',
        Protocolo: 'ANVISA-2026-002',
      },
    ],
  },
  pbm_atendimentos: {
    cols: ['Data', 'Paciente', 'CPF', 'Convênio', 'Meds', 'Desconto', 'Status'],
    rows: [
      {
        Data: '19/05/2026',
        Paciente: 'Maria Silva',
        CPF: '123.456.789-00',
        Convênio: 'Farmácia Popular',
        Meds: '2',
        Desconto: 'R$ 24,50',
        Status: 'Aprovado',
      },
      {
        Data: '19/05/2026',
        Paciente: 'João Pereira',
        CPF: '234.567.890-11',
        Convênio: 'Unimed',
        Meds: '1',
        Desconto: 'R$ 8,40',
        Status: 'Aprovado',
      },
      {
        Data: '18/05/2026',
        Paciente: 'Ana Rodrigues',
        CPF: '345.678.901-22',
        Convênio: 'Farmácia Popular',
        Meds: '3',
        Desconto: 'R$ 45,00',
        Status: 'Aprovado',
      },
      {
        Data: '17/05/2026',
        Paciente: 'Paulo Santos',
        CPF: '678.901.234-55',
        Convênio: 'Bradesco',
        Meds: '1',
        Desconto: 'R$ 12,00',
        Status: 'Pendente',
      },
      {
        Data: '16/05/2026',
        Paciente: 'Sandra Lima',
        CPF: '789.012.345-66',
        Convênio: 'Unimed',
        Meds: '2',
        Desconto: 'R$ 0,00',
        Status: 'Rejeitado',
      },
    ],
  },
  contas_pagar: {
    cols: ['Fornecedor', 'Ref. NF-e', 'Valor', 'Vencimento', 'Status', 'Pago em'],
    rows: [
      {
        Fornecedor: 'Plasma Sul',
        'Ref. NF-e': 'NF-e 002184',
        Valor: 'R$ 12.480,90',
        Vencimento: '25/05/2026',
        Status: 'Aberta',
        'Pago em': '—',
      },
      {
        Fornecedor: 'Medley',
        'Ref. NF-e': 'NF-e 002150',
        Valor: 'R$ 4.250,00',
        Vencimento: '20/05/2026',
        Status: 'Atrasada',
        'Pago em': '—',
      },
      {
        Fornecedor: 'EMS S/A',
        'Ref. NF-e': 'NF-e 001980',
        Valor: 'R$ 2.100,00',
        Vencimento: '30/04/2026',
        Status: 'Paga',
        'Pago em': '30/04/26',
      },
      {
        Fornecedor: 'Cristália',
        'Ref. NF-e': 'NF-e 001812',
        Valor: 'R$ 8.900,00',
        Vencimento: '15/04/2026',
        Status: 'Paga',
        'Pago em': '14/04/26',
      },
      {
        Fornecedor: 'Profarma',
        'Ref. NF-e': 'NF-e 001790',
        Valor: 'R$ 3.650,00',
        Vencimento: '10/04/2026',
        Status: 'Paga',
        'Pago em': '09/04/26',
      },
    ],
  },
}

/* ── Page ─────────────────────────────────────────────────────────── */

export function RelatoriosPage() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaId | null>(null)
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoRelatorio | null>(null)
  const [dataInicio, setDataInicio] = useState(PRIMEIRO_MES)
  const [dataFim, setDataFim] = useState(HOJE)
  const [exportando, setExportando] = useState(false)
  const [ultimaExportacao, setUltimaExportacao] = useState<ExportacaoStatus | null>(null)

  const catConfig = CATEGORIAS.find((c) => c.id === categoriaAtiva) ?? null
  const canExportar = !!tipoSelecionado && !!dataInicio && !!dataFim && !exportando
  const previewData = tipoSelecionado ? PREVIEW[tipoSelecionado] : null

  function handleSelecionarCategoria(id: CategoriaId) {
    if (categoriaAtiva === id) {
      setCategoriaAtiva(null)
      setTipoSelecionado(null)
      setUltimaExportacao(null)
    } else {
      setCategoriaAtiva(id)
      setTipoSelecionado(null)
      setUltimaExportacao(null)
    }
  }

  function handleExportar(formato: FormatoExportacao) {
    if (!canExportar) return
    setExportando(true)
    setUltimaExportacao(null)
    // TODO: POST /api/v1/relatorios/gerar { tipo, data_inicio, data_fim, formato, filtros }
    setTimeout(() => {
      setExportando(false)
      setUltimaExportacao({
        arquivo_url: `/relatorios/${tipoSelecionado}_${dataInicio}_${dataFim}.${formato}`,
        gerado_em: new Date().toISOString(),
        registros: previewData?.rows.length ?? 5,
        formato,
      })
    }, 900)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="flex items-center justify-between rounded-3xl border border-brand-100 bg-white px-6 py-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-[24px] text-brand-950 leading-none">Relatórios</h1>
          <p className="text-[13px] text-text-secondary">
            Exporte dados de vendas, estoque, SNGPC, PBM e financeiro
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-7 items-center rounded-full bg-brand-75 px-3 font-semibold text-[12px] text-brand-750">
            {CATEGORIAS.reduce((s, c) => s + c.qtd, 0)} relatórios disponíveis
          </span>
        </div>
      </header>

      {/* ── Grid de categorias ──────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3.5">
        {CATEGORIAS.map((cat) => (
          <CategoriaCard
            key={cat.id}
            config={cat}
            isAtivo={categoriaAtiva === cat.id}
            onClick={() => handleSelecionarCategoria(cat.id)}
          />
        ))}
      </div>

      {/* ── Painel de filtros (quando categoria ativa) ────── */}
      {catConfig && (
        <div className="rounded-3xl border border-brand-100 bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="font-bold text-[16px] text-brand-950">{catConfig.titulo}</h2>
              <p className="text-[12px] text-text-secondary">
                Selecione o tipo de relatório e o período
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleSelecionarCategoria(catConfig.id)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-[13px] text-brand-600 hover:bg-brand-100"
              aria-label="Fechar painel"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-6">
            {/* Coluna esquerda — tipo e período */}
            <div className="flex flex-1 flex-col gap-4">
              {/* Tipo de relatório */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="tipo-relatorio" className="font-bold text-[12px] text-input-label">
                  Tipo de relatório
                </label>
                <select
                  id="tipo-relatorio"
                  value={tipoSelecionado ?? ''}
                  onChange={(e) => {
                    setTipoSelecionado((e.target.value as TipoRelatorio) || null)
                    setUltimaExportacao(null)
                  }}
                  className="h-10 rounded-[12px] border border-input-border bg-input-bg px-3 text-[13px] text-brand-950 outline-none focus:border-brand-700"
                >
                  <option value="">Selecione o relatório</option>
                  {catConfig.relatorios.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Período */}
              <div className="flex gap-3">
                <div className="flex flex-1 flex-col gap-1.5">
                  <label htmlFor="data-inicio" className="font-bold text-[12px] text-input-label">
                    Data inicial
                  </label>
                  <input
                    id="data-inicio"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => {
                      setDataInicio(e.target.value)
                      setUltimaExportacao(null)
                    }}
                    className="h-10 rounded-[12px] border border-input-border bg-input-bg px-3 text-[13px] text-brand-950 outline-none focus:border-brand-700"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <label htmlFor="data-fim" className="font-bold text-[12px] text-input-label">
                    Data final
                  </label>
                  <input
                    id="data-fim"
                    type="date"
                    value={dataFim}
                    onChange={(e) => {
                      setDataFim(e.target.value)
                      setUltimaExportacao(null)
                    }}
                    className="h-10 rounded-[12px] border border-input-border bg-input-bg px-3 text-[13px] text-brand-950 outline-none focus:border-brand-700"
                  />
                </div>
              </div>

              {!tipoSelecionado && (
                <p className="text-[12px] text-brand-muted">
                  ↑ Selecione o tipo de relatório para habilitar a exportação
                </p>
              )}
            </div>

            {/* Coluna direita — botões de exportação */}
            <div className="flex w-64 shrink-0 flex-col gap-3 rounded-[20px] border border-brand-100 bg-[#F5F8F6] p-5">
              <p className="font-bold text-[12px] text-brand-950">Exportar relatório</p>
              <p className="text-[11px] text-text-secondary leading-[1.5]">
                Gera o arquivo com os dados do período selecionado. Primeiros 10 registros
                disponíveis na prévia abaixo.
              </p>
              <button
                type="button"
                disabled={!canExportar}
                onClick={() => handleExportar('pdf')}
                className={[
                  'flex h-10 items-center justify-center gap-2 rounded-[12px] font-bold text-[13px] transition-colors',
                  canExportar
                    ? 'bg-danger-600 text-white hover:bg-danger-700'
                    : 'cursor-not-allowed bg-neutral-100 text-neutral-400',
                ].join(' ')}
              >
                {exportando ? 'Gerando...' : '↓ Exportar PDF'}
              </button>
              <button
                type="button"
                disabled={!canExportar}
                onClick={() => handleExportar('excel')}
                className={[
                  'flex h-10 items-center justify-center gap-2 rounded-[12px] font-bold text-[13px] transition-colors',
                  canExportar
                    ? 'bg-brand-700 text-white hover:bg-brand-800'
                    : 'cursor-not-allowed bg-neutral-100 text-neutral-400',
                ].join(' ')}
              >
                {exportando ? 'Gerando...' : '↓ Exportar Excel'}
              </button>
              {!tipoSelecionado && (
                <p className="text-center text-[11px] text-brand-muted">
                  Selecione o tipo e período
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Prévia da tabela ────────────────────────────────── */}
      {previewData && (
        <div className="rounded-3xl border border-brand-100 bg-white">
          {/* Header da seção */}
          <div className="flex items-center justify-between border-brand-100 border-b px-6 py-4">
            <div className="flex flex-col gap-0.5">
              <h3 className="font-bold text-[14px] text-brand-950">
                Prévia — {catConfig?.relatorios.find((r) => r.id === tipoSelecionado)?.label}
              </h3>
              <p className="text-[12px] text-text-secondary">
                {previewData.rows.length} registros de exemplo
              </p>
            </div>
            <span className="flex h-6 items-center rounded-full bg-brand-75 px-2.5 font-semibold text-[11px] text-brand-750">
              Dados mock
            </span>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto px-4 pt-3 pb-4">
            {/* Header */}
            <div
              className="mb-1.5 grid gap-2 rounded-[12px] bg-[#F5F8F6] px-3 py-2.5"
              style={{ gridTemplateColumns: `repeat(${previewData.cols.length}, minmax(0, 1fr))` }}
            >
              {previewData.cols.map((col) => (
                <span key={col} className="font-bold text-[11px] text-text-secondary">
                  {col}
                </span>
              ))}
            </div>
            {/* Rows */}
            <div className="flex flex-col gap-1">
              {previewData.rows.map((row, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: static preview rows, stable order
                  key={i}
                  className="grid gap-2 rounded-[12px] bg-[#FBFCFB] px-3 py-2.5"
                  style={{
                    gridTemplateColumns: `repeat(${previewData.cols.length}, minmax(0, 1fr))`,
                  }}
                >
                  {previewData.cols.map((col) => (
                    <span key={col} className="text-[12px] text-brand-950">
                      {row[col] ?? '—'}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Card de exportação bem-sucedida ─────────────────── */}
      {ultimaExportacao && (
        <div className="flex items-start gap-4 rounded-3xl border border-brand-100 bg-brand-25 p-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-75">
            <span className="font-bold text-[16px] text-success-600">✓</span>
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <p className="font-bold text-[14px] text-brand-950">Relatório gerado com sucesso</p>
            <p className="text-[12px] text-text-secondary">
              {ultimaExportacao.registros} registros · {ultimaExportacao.formato.toUpperCase()} ·{' '}
              {new Date(ultimaExportacao.gerado_em).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="font-mono text-[11px] text-brand-muted">{ultimaExportacao.arquivo_url}</p>
          </div>
          <a
            href={ultimaExportacao.arquivo_url}
            onClick={(e) => e.preventDefault()}
            className="flex h-9 items-center rounded-[12px] bg-brand-900 px-4 font-bold text-[12px] text-white hover:bg-brand-800"
          >
            ↓ Baixar arquivo
          </a>
        </div>
      )}
    </div>
  )
}

/* ── Sub-componentes ──────────────────────────────────────────────── */

function CategoriaCard({
  config,
  isAtivo,
  onClick,
}: {
  config: CategoriaConfig
  isAtivo: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex flex-col gap-3 rounded-3xl border p-5 text-left transition-all',
        isAtivo
          ? `${config.ativoBg} ${config.ativoBorder} ring-1 ring-offset-1 ${config.ativoBorder.replace('border-', 'ring-')}`
          : `${config.bg} ${config.border} hover:border-brand-300 hover:bg-brand-25`,
      ].join(' ')}
    >
      {/* Ícone */}
      <div
        className={`flex size-9 items-center justify-center rounded-[10px] font-bold text-[16px] ${config.iconBg} ${config.iconText}`}
      >
        {config.icon}
      </div>

      {/* Texto */}
      <div className="flex flex-col gap-1">
        <p className="font-bold text-[14px] text-brand-950">{config.titulo}</p>
        <p className="text-[11px] text-text-secondary leading-[1.4]">{config.desc}</p>
      </div>

      {/* Badge */}
      <span className="self-start rounded-full bg-brand-75 px-2 py-0.5 font-semibold text-[10px] text-brand-750">
        {config.qtd} relatórios
      </span>
    </button>
  )
}
