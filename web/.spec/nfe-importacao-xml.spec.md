---
modulo: nfe-importacao-xml
rota: /fiscal/entrada-nfe
pagina: EntradaNfePage
status: ⬜ Pendente
schema: src/schemas/nfe.ts
layout: extensao-wizard-3-etapas
referencia: EntradaNfePage.tsx
change-refs: [CHANGE-NF-001, CHANGE-NF-002, CHANGE-NF-003, CHANGE-NF-004, CHANGE-NF-005]
---

# NF-e — Importação de XML e Extensões do Wizard

## Propósito
Extensões à `EntradaNfePage` que cobrem: (1) importação de XML NF-e v4.00 para pré-preenchimento automático da Etapa 1; (2) rascunho com retomada; (3) marcação em lote de itens como OK; (4) arredondamento fiscal; (5) finalização da entrada com efeitos colaterais (estoque + conta a pagar). Nenhuma nova rota — tudo ocorre no wizard existente.

## Arquitetura de extensão

O wizard existente tem 3 etapas. As extensões se encaixam assim:

```
Etapa 1 (Identificação)
  ├── [NOVO] Botão "Importar XML" → pré-preenche campos
  ├── [NOVO] Banner "Rascunho disponível" ao entrar na rota
  └── [NOVO] Botão "Salvar Rascunho" no header

Etapa 2 (Itens e Lotes)
  ├── [EXISTENTE] CelulaBusca para produtos sem catálogo
  ├── [NOVO] Botão "Marcar todos como OK" no header da tabela
  └── (itens ainda editáveis)

Etapa 3 (Conferência)
  ├── [EXISTENTE] Demo switcher, checklist, botão confirmar
  ├── [NOVO] Botão "Aplicar Arredondamento Fiscal"
  └── [NOVO] Handler completo de "Finalizar Entrada"
```

## Schema
`src/schemas/nfe.ts` — adicionar:

```ts
// Dados extraídos do XML NF-e v4.00
export const NfeXmlDadosSchema = z.object({
  chave_acesso:   z.string().length(44),
  numero_nota:    z.string(),
  serie:          z.string(),
  data_emissao:   z.string(),
  fornecedor:     z.string(),
  cnpj_emitente:  z.string().length(14),
  valor_produtos: z.number(),
  valor_frete:    z.number(),
  valor_ipi:      z.number(),
  valor_pis:      z.number(),
  valor_cofins:   z.number(),
  valor_icms:     z.number(),
  valor_total:    z.number(),
  itens: z.array(z.object({
    seq:       z.number(),
    descricao: z.string(),
    ean:       z.string().optional(),
    ncm:       z.string(),
    cfop:      z.string(),
    unidade:   z.string(),
    qtd_fat:   z.number(),
    preco_unit:z.number(),
    ipi_pct:   z.number(),
    pis_pct:   z.number(),
    cofins_pct:z.number(),
    icms_pct:  z.number(),
  })),
})

// Rascunho
export const NfeRascunhoSchema = z.object({
  id:          z.string().uuid(),
  criado_em:   z.string(),
  etapa_atual: z.number().int().min(1).max(3),
  form1:       z.record(z.unknown()),  // dados da Etapa 1
  itens:       z.array(z.unknown()),   // itens da Etapa 2
})

export type NfeXmlDados = z.infer<typeof NfeXmlDadosSchema>
export type NfeRascunho = z.infer<typeof NfeRascunhoSchema>
```

## Mock Data

### XML simulado (resultado do parse)

```ts
// Dados que seriam extraídos do XML NF-e após parse
const XML_MOCK_RESULTADO: NfeXmlDados = {
  chave_acesso:   '35260512345678000195550010001250013041234567',
  numero_nota:    '125001',
  serie:          '1',
  data_emissao:   '2026-05-20',
  fornecedor:     'Plasma Sul Distribuição Ltda',
  cnpj_emitente:  '12345678000199',
  valor_produtos: 12466.88,
  valor_frete:    50.00,
  valor_ipi:      0.00,
  valor_pis:      81.20,
  valor_cofins:   374.01,
  valor_icms:     1246.69,
  valor_total:    12516.88,
  itens: [
    { seq: 1, descricao: 'DIPIRONA SODICA 500MG 20CP', ean: '7896004714251', ncm: '30049099', cfop: '6102', unidade: 'CX',  qtd_fat: 100, preco_unit: 12.47, ipi_pct: 0, pis_pct: 0.65, cofins_pct: 3.00, icms_pct: 10 },
    { seq: 2, descricao: 'OMEPRAZOL 20MG 14CP',        ean: '7896422501282', ncm: '30049099', cfop: '6102', unidade: 'CX',  qtd_fat: 50,  preco_unit: 18.90, ipi_pct: 0, pis_pct: 0.65, cofins_pct: 3.00, icms_pct: 10 },
    { seq: 3, descricao: 'VITAMINA D3 2000UI 30CP',    ean: '7898924501100', ncm: '30049099', cfop: '6102', unidade: 'FR',  qtd_fat: 200, preco_unit: 22.50, ipi_pct: 0, pis_pct: 0.65, cofins_pct: 3.00, icms_pct: 12 },
    { seq: 4, descricao: '7894561200987',               ean: '7894561200987', ncm: '30049099', cfop: '6102', unidade: 'UN',  qtd_fat: 30,  preco_unit: 45.00, ipi_pct: 0, pis_pct: 0.65, cofins_pct: 3.00, icms_pct: 12 },
    { seq: 5, descricao: 'LOSARTANA 50MG 30CP',        ean: '7896714502015', ncm: '30049099', cfop: '6102', unidade: 'CX',  qtd_fat: 80,  preco_unit: 15.33, ipi_pct: 0, pis_pct: 0.65, cofins_pct: 3.00, icms_pct: 10 },
  ],
}

// Rascunho mock (para testar retomada)
const RASCUNHO_MOCK: NfeRascunho = {
  id: 'draft-nfe-001',
  criado_em: '2026-05-19T16:45:00',
  etapa_atual: 2,
  form1: { chaveAcesso: '35260512345678000195550010001250013041234567', fornecedor: 'Plasma Sul Distribuição Ltda', gerarContas: true },
  itens: [],
}
```

### Arredondamento fiscal mock

```ts
// Diferenças de centavos que o arredondamento resolve
const ARREDONDAMENTO_MOCK = [
  { campo: 'ICMS Total',    original: 1246.689, ajustado: 1246.69, diferenca: 0.001 },
  { campo: 'PIS Total',     original: 81.197,   ajustado: 81.20,   diferenca: 0.003 },
  { campo: 'COFINS Total',  original: 374.006,  ajustado: 374.01,  diferenca: 0.004 },
]
```

## Config Tables

```ts
// Status da importação XML
type XmlImportStatus = 'idle' | 'validando' | 'sucesso' | 'erro'

const XML_STATUS_CFG: Record<XmlImportStatus, { text: string; cls: string }> = {
  idle:      { text: 'Nenhum arquivo selecionado',   cls: 'text-text-secondary' },
  validando: { text: 'Validando schema NF-e v4.00…', cls: 'text-brand-700'      },
  sucesso:   { text: '✓ XML válido — dados extraídos', cls: 'text-success-600'  },
  erro:      { text: '✗ XML inválido ou não NF-e',   cls: 'text-danger-700'     },
}

// Status da NF (após finalização)
type NfeStatus = 'rascunho' | 'conferencia' | 'finalizada' | 'cancelada'

const NFE_STATUS_CFG: Record<NfeStatus, { label: string; bg: string; text: string }> = {
  rascunho:    { label: '● Rascunho',    bg: 'bg-neutral-50',  text: 'text-neutral-500'  },
  conferencia: { label: '● Conferência', bg: 'bg-brand-75',    text: 'text-brand-750'    },
  finalizada:  { label: '✓ Finalizada',  bg: 'bg-brand-25',    text: 'text-success-600'  },
  cancelada:   { label: '✗ Cancelada',   bg: 'bg-danger-50',   text: 'text-danger-700'   },
}
```

## Estado (adições ao estado existente)

```ts
// Adições ao useState existente da EntradaNfePage:
const [xmlStatus, setXmlStatus]       = useState<XmlImportStatus>('idle')
const [xmlDados, setXmlDados]         = useState<NfeXmlDados | null>(null)
const [rascunhoPendente, setRascunho] = useState<NfeRascunho | null>(null)
const [salvandoRascunho, setSalvando] = useState(false)
const [arredondOpen, setArredondOpen] = useState(false)
const [finalizando, setFinalizando]   = useState(false)
const [nfeStatus, setNfeStatus]       = useState<NfeStatus>('conferencia')
```

## Feature 1 — Importar XML (Etapa 1)

```tsx
// Botão no header da Etapa 1, ao lado do título
<label htmlFor="xml-upload"
  className="flex h-8 cursor-pointer items-center gap-1.5 rounded-xl border border-brand-200
             bg-white px-3 font-medium text-[12px] text-brand-700 hover:bg-brand-50">
  ↑ Importar XML
</label>
<input id="xml-upload" type="file" accept=".xml" className="sr-only"
  onChange={handleImportarXml} />

// Handler
async function handleImportarXml(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0]
  if (!file) return
  setXmlStatus('validando')
  try {
    // Parse client-side com DOMParser
    const text = await file.text()
    const doc  = new DOMParser().parseFromString(text, 'application/xml')

    // Validação mínima: tag raiz <nfeProc> ou <NFe>
    const isNfe = doc.querySelector('NFe, nfeProc') !== null
    if (!isNfe) throw new Error('Arquivo não é uma NF-e válida')

    // Extração dos campos principais (simplificada)
    const dados = extrairDadosXml(doc)  // retorna NfeXmlDados
    const parsed = NfeXmlDadosSchema.safeParse(dados)
    if (!parsed.success) throw new Error('Schema NF-e inválido')

    setXmlDados(parsed.data)
    setXmlStatus('sucesso')
    preencherForm1(parsed.data)  // popula campos da Etapa 1
    preencherItens(parsed.data.itens)  // popula tabela da Etapa 2

    // TODO: integrar com API — POST /api/v1/fiscal/nfe/importar-xml
  } catch {
    setXmlStatus('erro')
  }
}
```

## Feature 2 — Rascunho (todas as etapas)

```tsx
// Verificação ao montar a página
useEffect(() => {
  // TODO: integrar com API — GET /api/v1/fiscal/nfe/rascunho-ativo
  const rascunho = RASCUNHO_MOCK  // mock
  if (rascunho) setRascunhoPendente(rascunho)
}, [])

// Banner de retomada (aparece antes do wizard)
{rascunhoPendente && (
  <div className="flex items-center gap-3 rounded-[18px] bg-warning-25 border border-warning-100 px-4 py-3">
    <span className="text-[13px] text-warning-800">
      Rascunho de {new Date(rascunhoPendente.criado_em).toLocaleDateString('pt-BR')} encontrado
      (Etapa {rascunhoPendente.etapa_atual}/3).
    </span>
    <button type="button" onClick={() => retomarRascunho(rascunhoPendente)}
      className="rounded-lg bg-warning-600 px-3 py-1.5 font-bold text-[12px] text-white">
      Retomar
    </button>
    <button type="button" onClick={() => setRascunhoPendente(null)}
      className="font-medium text-[12px] text-warning-700 hover:underline">
      Ignorar
    </button>
  </div>
)}

// Botão "Salvar Rascunho" no header de qualquer etapa
const handleSalvarRascunho = async () => {
  setSalvando(true)
  try {
    // TODO: integrar com API — POST /api/v1/fiscal/nfe/rascunho
    await new Promise((r) => setTimeout(r, 600)) // mock
    // toast de sucesso
  } finally {
    setSalvando(false)
  }
}
```

## Feature 3 — Marcar todos como OK (Etapa 2)

```tsx
// Header da tabela de itens
{itens.some((i) => !i.noCatalog) && (
  <button type="button" onClick={() => setMarcarTodosOpen(true)}
    className="...">
    Marcar todos como OK ({itens.filter((i) => !i.noCatalog).length})
  </button>
)}

// Modal de confirmação
function ModalMarcarTodosOk({ onClose, onConfirmar }: ...) {
  const elegiveis = itens.filter((i) => !i.noCatalog)
  return (
    <Modal.Root onClose={onClose} width="w-[480px]">
      <Modal.Header title="Marcar todos como OK"
        subtitle={`${elegiveis.length} itens serão marcados como conferidos`} />
      <Modal.Body>
        <Alert variant="info">
          Itens sem catálogo ({itens.filter((i) => i.noCatalog).length}) precisam ser
          vinculados manualmente e não serão incluídos.
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" onClick={onClose} ...>Cancelar</button>
        <button type="button" onClick={onConfirmar} ...>Confirmar</button>
      </Modal.Footer>
    </Modal.Root>
  )
}

function handleMarcarTodosOk() {
  setItens((prev) => prev.map((i) => i.noCatalog ? i : { ...i, conferido: true }))
  setMarcarTodosOpen(false)
  // TODO: integrar com API — PATCH /api/v1/fiscal/nfe/{id}/itens/conferir-todos
}
```

## Feature 4 — Arredondamento Fiscal (Etapa 3)

```tsx
function ModalArredondamentoFiscal({ onClose, onAplicar }: ...) {
  return (
    <Modal.Root onClose={onClose} width="w-[520px]">
      <Modal.Header title="Arredondamento Fiscal"
        subtitle="Ajuste de casas decimais conforme regras SEFAZ" />
      <Modal.Body>
        {/* Tabela comparativa */}
        <div className="rounded-[14px] border border-brand-100 overflow-hidden">
          <div className="grid grid-cols-4 gap-2 bg-[#F5F8F6] px-4 py-2.5">
            <span className="font-bold text-[11px]">Campo</span>
            <span className="font-bold text-[11px]">Original</span>
            <span className="font-bold text-[11px]">Ajustado</span>
            <span className="font-bold text-[11px]">Diferença</span>
          </div>
          {ARREDONDAMENTO_MOCK.map((row) => (
            <div key={row.campo} className="grid grid-cols-4 gap-2 bg-[#FBFCFB] border-t border-brand-100 px-4 py-2">
              <span className="text-[12px]">{row.campo}</span>
              <span className="text-[12px] text-text-secondary">{row.original.toFixed(3)}</span>
              <span className="text-[12px] text-brand-950 font-medium">{row.ajustado.toFixed(2)}</span>
              <span className="text-[11px] text-brand-600">+{row.diferenca.toFixed(3)}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-text-secondary mt-2">
          Diferença total: R$ {ARREDONDAMENTO_MOCK.reduce((s, r) => s + r.diferenca, 0).toFixed(3)}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" onClick={onClose} ...>Cancelar</button>
        <button type="button" onClick={onAplicar} ...>Aplicar arredondamento</button>
      </Modal.Footer>
    </Modal.Root>
  )
}
```

## Feature 5 — Finalizar Entrada (Etapa 3)

```tsx
const handleFinalizarEntrada = async () => {
  if (nfeStatus === 'finalizada') return
  setFinalizando(true)
  try {
    // TODO: integrar com API — POST /api/v1/fiscal/nfe/entrada-confirmar
    // Efeitos colaterais no backend:
    //   → Atualiza estoque (cria lotes)
    //   → Gera ContaPagar se gerarContas === true
    await new Promise((r) => setTimeout(r, 1200)) // mock
    setNfeStatus('finalizada')
    setConferenceStatus('sucesso')
    // TODO: integrar com API — POST /api/v1/financeiro/contas-pagar (automático)
  } catch (err) {
    console.error('[handleFinalizarEntrada]', err)
  } finally {
    setFinalizando(false)
  }
}
```

### Card de sucesso após finalização

```tsx
// Substituir checklist pelo card de sucesso quando nfeStatus === 'finalizada'
{nfeStatus === 'finalizada' && (
  <div className="flex flex-col gap-3 rounded-[20px] bg-brand-25 border border-brand-100 p-5">
    <div className="flex items-center gap-2">
      <span className="rounded-full bg-brand-75 px-3 py-1 font-bold text-[12px] text-success-600">
        ✓ Entrada finalizada
      </span>
    </div>
    <p className="font-bold text-[16px] text-brand-950">Protocolo {NFE_INFO.protocolo}</p>
    <p className="text-[13px] text-text-secondary">
      Estoque atualizado · Conta a pagar gerada para {NFE_INFO.fornecedor}
    </p>
    <div className="flex gap-2 mt-1">
      <button type="button" className="... text-brand-700">
        Ver conta a pagar →
      </button>
      <button type="button" className="... text-brand-700">
        Gerar etiquetas (opcional) →
      </button>
    </div>
  </div>
)}
```

## API Endpoints

```ts
// TODO: integrar com API — POST /api/v1/fiscal/nfe/importar-xml { xml_base64 | arquivo }
// TODO: integrar com API — POST /api/v1/fiscal/nfe/rascunho { etapa, form1, itens }
// TODO: integrar com API — PUT  /api/v1/fiscal/nfe/rascunho/{id}
// TODO: integrar com API — GET  /api/v1/fiscal/nfe/rascunho-ativo
// TODO: integrar com API — PATCH /api/v1/fiscal/nfe/{id}/itens/conferir-todos
// TODO: integrar com API — POST /api/v1/fiscal/nfe/{id}/arredondamento-fiscal
// TODO: integrar com API — POST /api/v1/fiscal/nfe/entrada-confirmar { chave, itens, gerar_contas }
```

## Verificação

- [ ] Botão "Importar XML" abre file picker filtrado para `.xml`
- [ ] XML inválido (não-NF-e) exibe `xmlStatus: erro` com mensagem clara
- [ ] XML válido preenche todos os campos da Etapa 1 e a tabela da Etapa 2
- [ ] Item do XML sem EAN catalogado recebe `noCatalog: true` → `CelulaBusca` ativada
- [ ] Banner de rascunho aparece ao entrar na rota quando há rascunho ativo
- [ ] "Retomar rascunho" vai para a etapa salva com dados recuperados
- [ ] "Marcar todos como OK" só inclui itens com `noCatalog: false`
- [ ] Modal de arredondamento exibe tabela antes/depois com diferenças em destaque
- [ ] "Finalizar Entrada" desabilitado no estado `bloqueado` (status conferência)
- [ ] Card de sucesso exibe protocolo e link para conta a pagar após finalização
- [ ] NF finalizada → wizard em somente leitura (sem edição de campos)
