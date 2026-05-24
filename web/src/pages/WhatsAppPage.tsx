import { useMemo, useState } from 'react'
import type { CampanhaWhatsApp, NovaCampanha, TemplateWhatsApp } from '../schemas'
import { NovaCampanhaSchema } from '../schemas'

/* ── Types ───────────────────────────────────────────────── */
type Aba = 'hub' | 'atendimentos' | 'campanhas'
type AbaOps = 'orcamento' | 'receita' | 'pedido' | 'historico'
type FiltroStatus = 'todos' | ConvStatus

/* ── Chat mock data ──────────────────────────────────────── */
type ConvStatus = 'aguardando' | 'em_atendimento' | 'resolvido'
type OrcamentoItem = {
  produto_id: string
  nome: string
  laboratorio: string
  apresentacao: string
  preco: number
  qty: number
}
type Conversa = {
  id: string
  nome: string
  telefone: string
  preview: string
  hora: string
  unread: number
  avatarColor: string
  status: ConvStatus
  alertas?: string[]
  orcamento?: OrcamentoItem[]
}
type Bubble = {
  id: string
  tipo: 'recebida' | 'enviada' | 'sistema'
  texto: string
  hora: string
  lido?: boolean
  arquivo?: { nome: string; tamanho: string }
}

const CONVERSAS: Conversa[] = [
  {
    id: 'cv1',
    nome: 'Ana Oliveira',
    telefone: '(11) 96543-2109',
    preview: 'Receita de amoxicilina...',
    hora: '10:42',
    unread: 1,
    avatarColor: '#D4735E',
    status: 'em_atendimento',
    alertas: ['Receita pendente'],
  },
  {
    id: 'cv2',
    nome: 'Carlos Mendes',
    telefone: '(11) 95432-1098',
    preview: 'Aguardando retorno',
    hora: '10:38',
    unread: 0,
    avatarColor: '#2D9D6E',
    status: 'em_atendimento',
  },
  {
    id: 'cv3',
    nome: 'Fernanda Lima',
    telefone: '(11) 94321-0987',
    preview: 'Meu pedido já está pronto?',
    hora: '10:25',
    unread: 2,
    avatarColor: '#D4735E',
    status: 'em_atendimento',
  },
  {
    id: 'cv4',
    nome: 'Maria Silva',
    telefone: '(11) 98765-4321',
    preview: 'Tem dipirona 500mg disponível?',
    hora: '10:15',
    unread: 3,
    avatarColor: '#0E4D3B',
    status: 'aguardando',
  },
  {
    id: 'cv5',
    nome: 'Lucia Ferreira',
    telefone: '(11) 92109-8765',
    preview: 'Disponibilidade de insulina',
    hora: '09:48',
    unread: 0,
    avatarColor: '#E8C97A',
    status: 'aguardando',
  },
  {
    id: 'cv6',
    nome: 'Paulo Souza',
    telefone: '(11) 91098-7654',
    preview: 'Orçamento manipulados',
    hora: '09:22',
    unread: 0,
    avatarColor: '#0E4D3B',
    status: 'aguardando',
  },
  {
    id: 'cv7',
    nome: 'Beatriz Costa',
    telefone: '(11) 90987-6543',
    preview: 'Entrega domicílio',
    hora: '09:10',
    unread: 1,
    avatarColor: '#85C7A8',
    status: 'aguardando',
  },
  {
    id: 'cv8',
    nome: 'João Santos',
    telefone: '(11) 97654-3210',
    preview: 'Obrigado pela informação!',
    hora: 'Ontem',
    unread: 0,
    avatarColor: '#2D9D6E',
    status: 'resolvido',
  },
  {
    id: 'cv9',
    nome: 'Roberto Alves',
    telefone: '(11) 93210-9876',
    preview: 'Programa fidelidade - resgate',
    hora: 'Ontem',
    unread: 0,
    avatarColor: '#0E4D3B',
    status: 'resolvido',
  },
]

const CHAT_MARIA: Bubble[] = [
  { id: 'b1', tipo: 'recebida', texto: 'Boa tarde! Tem dipirona 500mg disponível?', hora: '14:23' },
  {
    id: 'b2',
    tipo: 'enviada',
    texto:
      'Boa tarde, Maria! Sim, temos dipirona 500mg disponível. Temos o genérico e o de referência (Novalgina).',
    hora: '14:25',
    lido: true,
  },
  { id: 'b3', tipo: 'recebida', texto: 'Qual o preço de cada um?', hora: '14:26' },
  {
    id: 'b4',
    tipo: 'enviada',
    texto: 'Genérico: R$ 8,90 · Novalgina: R$ 18,50\nEstoque: 245 un (gen.) · 82 un (ref.)',
    hora: '14:28',
    lido: true,
  },
  {
    id: 'b5',
    tipo: 'recebida',
    texto: 'Vou querer 2 caixas do genérico, por favor! Posso retirar em 30 minutos?',
    hora: '14:30',
  },
  {
    id: 'b6',
    tipo: 'enviada',
    texto:
      'Perfeito! Separei 2 caixas para você. Pode retirar na farmácia a partir das 15h. Deseja que eu reserve no seu CPF para acumular pontos?',
    hora: '14:31',
    lido: true,
  },
]

const CHAT_ANA_ATEND: Bubble[] = [
  {
    id: 'a1',
    tipo: 'recebida',
    texto: 'Boa tarde! Preciso comprar amoxicilina 500mg. Tenho receita digital, como envio?',
    hora: '15:02',
  },
  {
    id: 'a2',
    tipo: 'enviada',
    texto:
      'Boa tarde, Ana! Pode enviar a foto da receita digital aqui mesmo no chat. Vou validar para você.',
    hora: '15:03',
    lido: true,
  },
  {
    id: 'a3',
    tipo: 'recebida',
    texto: 'Segue a receita:',
    hora: '15:05',
    arquivo: { nome: 'receita_digital.pdf', tamanho: '245 KB' },
  },
  { id: 'a4', tipo: 'sistema', texto: '⚠ Receita digital recebida — validação pendente', hora: '' },
  {
    id: 'a5',
    tipo: 'enviada',
    texto: 'Receita recebida! Estou validando agora. Um momento, por favor.',
    hora: '15:06',
    lido: true,
  },
  {
    id: 'a6',
    tipo: 'enviada',
    texto:
      'Receita validada ✓\nPrescritor: Dr. Rafael Souza · CRM/SP 54.321\nData: 10/05/2025 · Validade: 12/06/2025\nProtocolo: RD-2025-08741',
    hora: '15:08',
    lido: true,
  },
  {
    id: 'a7',
    tipo: 'recebida',
    texto: 'Ótimo! Pode separar pra mim, retiro em 20 minutos. 😊',
    hora: '15:10',
  },
]

const CONV_STATUS_CFG: Record<ConvStatus, { label: string; bg: string; text: string }> = {
  aguardando: { label: '● Aguardando', bg: 'bg-warning-50', text: 'text-warning-700' },
  em_atendimento: { label: '● Atendendo', bg: 'bg-brand-75', text: 'text-brand-750' },
  resolvido: { label: '✓ Resolvido', bg: 'bg-neutral-100', text: 'text-neutral-600' },
}

const FILTRO_CFG: { id: FiltroStatus; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'aguardando', label: 'Aguardando' },
  { id: 'em_atendimento', label: 'Atendendo' },
  { id: 'resolvido', label: 'Resolvidos' },
]

const TABS_OPS: { id: AbaOps; label: string }[] = [
  { id: 'orcamento', label: 'Orçamento' },
  { id: 'receita', label: 'Receita' },
  { id: 'pedido', label: 'Pedido' },
  { id: 'historico', label: 'Histórico' },
]

const PRODUTOS_CATALOGO = [
  { id: 'p1', nome: 'Amoxicilina 500mg', laboratorio: 'EMS', apresentacao: '21 cáps', preco: 2490 },
  { id: 'p2', nome: 'Dipirona 500mg', laboratorio: 'Medley', apresentacao: '20 comp', preco: 890 },
  {
    id: 'p3',
    nome: 'Omeprazol 20mg',
    laboratorio: 'Eurofarma',
    apresentacao: '28 cáps',
    preco: 1890,
  },
  {
    id: 'p4',
    nome: 'Atorvastatina 20mg',
    laboratorio: 'Sandoz',
    apresentacao: '30 comp',
    preco: 3250,
  },
  { id: 'p5', nome: 'Metformina 850mg', laboratorio: 'EMS', apresentacao: '30 comp', preco: 1650 },
  { id: 'p6', nome: 'Losartana 50mg', laboratorio: 'Medley', apresentacao: '30 comp', preco: 2100 },
  {
    id: 'p7',
    nome: 'Insulina NPH 100UI/ml',
    laboratorio: 'Novo Nordisk',
    apresentacao: '10ml',
    preco: 3890,
  },
]

/* ── Chat sub-components ─────────────────────────────────── */
function AvatarCircle({ nome, color, size = 40 }: { nome: string; color: string; size?: number }) {
  const ini = nome
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
  const fontSize = size <= 32 ? 11 : size <= 38 ? 13 : 14
  return (
    <div
      style={{ width: size, height: size, backgroundColor: color, fontSize }}
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
    >
      {ini}
    </div>
  )
}

function BubbleMsg({ b }: { b: Bubble }) {
  if (b.tipo === 'sistema')
    return (
      <div className="flex justify-center">
        <span className="rounded-full bg-[#FAEEDA] px-3 py-1 font-semibold text-[#633806] text-[10px]">
          {b.texto}
        </span>
      </div>
    )
  const isEnviada = b.tipo === 'enviada'
  return (
    <div className={['flex', isEnviada ? 'justify-end' : 'justify-start'].join(' ')}>
      <div
        className={[
          'flex max-w-[80%] flex-col gap-1 px-3.5 py-2.5',
          isEnviada
            ? 'rounded-[16px_4px_16px_16px] bg-[#0E4D3B]'
            : 'rounded-[4px_16px_16px_16px] border border-[#E6ECE8] bg-white',
        ].join(' ')}
      >
        {b.arquivo && (
          <div className="flex items-center gap-2 rounded-[10px] border border-[#DCE7E1] bg-[#F2F7F4] px-3 py-2">
            <span className="text-[18px]">📄</span>
            <div>
              <p className="font-semibold text-[11px] text-brand-700">{b.arquivo.nome}</p>
              <p className="text-[9px] text-text-secondary">{b.arquivo.tamanho}</p>
            </div>
          </div>
        )}
        {b.texto && (
          <p
            className={[
              'whitespace-pre-line text-[13px] leading-snug',
              isEnviada ? 'text-white' : 'text-[#173126]',
            ].join(' ')}
          >
            {b.texto}
          </p>
        )}
        {b.hora && (
          <p
            className={[
              'text-right text-[10px]',
              isEnviada ? 'text-[#B8D8CF]' : 'text-[#8A9892]',
            ].join(' ')}
          >
            {b.hora}
            {isEnviada && b.lido ? ' ✓✓' : ''}
          </p>
        )}
      </div>
    </div>
  )
}

/* ── Mock data ───────────────────────────────────────────── */
const TEMPLATES: TemplateWhatsApp[] = [
  {
    id: '11111111-0000-0000-0000-000000000001',
    nome: 'Boas-vindas',
    categoria: 'automatica',
    mensagem: 'Olá {{nome}}! Bem-vindo à Farmacorp. Como posso ajudá-lo hoje?',
    variaveis: ['nome'],
  },
  {
    id: '11111111-0000-0000-0000-000000000002',
    nome: 'Confirmação de pedido',
    categoria: 'automatica',
    mensagem: 'Seu pedido #{{pedido}} foi confirmado! Previsão de entrega: {{data}}.',
    variaveis: ['pedido', 'data'],
  },
  {
    id: '11111111-0000-0000-0000-000000000003',
    nome: 'Lembrete de medicamento',
    categoria: 'receita',
    mensagem:
      'Olá {{nome}}, sua receita de {{medicamento}} vence em {{dias}} dias. Renove conosco!',
    variaveis: ['nome', 'medicamento', 'dias'],
  },
  {
    id: '11111111-0000-0000-0000-000000000004',
    nome: 'Promoção genéricos',
    categoria: 'promocao',
    mensagem: '{{nome}}, economize até 60% com genéricos! Confira nossas ofertas da semana.',
    variaveis: ['nome'],
  },
  {
    id: '11111111-0000-0000-0000-000000000005',
    nome: 'Pontos fidelidade',
    categoria: 'fidelidade',
    mensagem: 'Você tem {{pontos}} pontos! Resgate agora em produtos selecionados.',
    variaveis: ['pontos'],
  },
  {
    id: '11111111-0000-0000-0000-000000000006',
    nome: 'Aniversário',
    categoria: 'fidelidade',
    mensagem: 'Feliz aniversário, {{nome}}! Ganhe 20% de desconto hoje como presente.',
    variaveis: ['nome'],
  },
]

// TODO: GET /api/v1/whatsapp/fila?minutos=60 — mensagens recentes por cliente

const CAMPANHAS: CampanhaWhatsApp[] = [
  {
    id: 'c1',
    nome: 'Promoção Inverno 2025',
    tipo: 'promocao',
    enviadas: 1240,
    abertura_pct: 82,
    status: 'ativa',
    data: '2025-06-10',
  },
  {
    id: 'c2',
    nome: 'Lembrete de Receita',
    tipo: 'receita',
    enviadas: 856,
    abertura_pct: 91,
    status: 'ativa',
    data: '2025-06-12',
  },
  {
    id: 'c3',
    nome: 'Dia das Mães – Dermocosméticos',
    tipo: 'sazonal',
    enviadas: 2100,
    abertura_pct: 74,
    status: 'agendada',
    data: '2025-06-14',
  },
  {
    id: 'c4',
    nome: 'Programa Fidelidade – Pontos',
    tipo: 'fidelidade',
    enviadas: 432,
    abertura_pct: 68,
    status: 'ativa',
    data: '2025-06-08',
  },
  {
    id: 'c5',
    nome: 'Genéricos – Economia',
    tipo: 'promocao',
    enviadas: 1890,
    abertura_pct: 71,
    status: 'concluida',
    data: '2025-06-01',
  },
  {
    id: 'c6',
    nome: 'Vitaminas – Saúde no Verão',
    tipo: 'sazonal',
    enviadas: 3200,
    abertura_pct: 85,
    status: 'concluida',
    data: '2025-05-28',
  },
]

/* ── Lookup tables ───────────────────────────────────────── */
const CAMP_STATUS_CFG: Record<string, { label: string; bg: string; text: string }> = {
  ativa: { label: '● Ativa', bg: 'bg-brand-75', text: 'text-success-600' },
  agendada: { label: '◷ Agendada', bg: 'bg-warning-50', text: 'text-warning-700' },
  concluida: { label: '✓ Concluída', bg: 'bg-neutral-100', text: 'text-neutral-600' },
  pausada: { label: '‖ Pausada', bg: 'bg-danger-50', text: 'text-danger-700' },
}

const CAT_LABEL: Record<string, string> = {
  promocao: 'Promoção',
  receita: 'Automática',
  fidelidade: 'Fidelidade',
  sazonal: 'Sazonal',
  automatica: 'Automática',
}

/* ── Modais ──────────────────────────────────────────────── */
function ModalNovaCampanha({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<Partial<NovaCampanha>>({ segmento: 'todos' })
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  function handleCriar() {
    const result = NovaCampanhaSchema.safeParse(form)
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors as Record<string, string[]>)
      return
    }
    // TODO: POST /api/v1/whatsapp/campanha
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar modal"
      />
      <div className="relative z-10 flex w-[520px] flex-col gap-5 rounded-[28px] bg-white p-6 shadow-xl">
        <div>
          <h3 className="font-bold text-[18px] text-brand-950">Nova campanha</h3>
          <p className="text-[13px] text-text-secondary">
            Configure segmentação, template e agendamento
          </p>
        </div>

        <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
          <label htmlFor="camp-nome" className="font-bold text-[12px] text-input-label">
            Nome da campanha
          </label>
          <input
            id="camp-nome"
            type="text"
            placeholder="Ex: Promoção Inverno 2025"
            value={form.nome ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder"
          />
          {errors.nome && <p className="text-[11px] text-danger-700">{errors.nome[0]}</p>}
        </div>

        <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
          <label htmlFor="camp-template" className="font-bold text-[12px] text-input-label">
            Template
          </label>
          <select
            id="camp-template"
            value={form.template_id ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, template_id: e.target.value }))}
            className="bg-transparent text-[14px] text-brand-950 outline-none"
          >
            <option value="">Selecione um template</option>
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
          {errors.template_id && (
            <p className="text-[11px] text-danger-700">{errors.template_id[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
          <label htmlFor="camp-segmento" className="font-bold text-[12px] text-input-label">
            Segmentação
          </label>
          <select
            id="camp-segmento"
            value={form.segmento ?? 'todos'}
            onChange={(e) =>
              setForm((f) => ({ ...f, segmento: e.target.value as NovaCampanha['segmento'] }))
            }
            className="bg-transparent text-[14px] text-brand-950 outline-none"
          >
            <option value="todos">Todos os clientes</option>
            <option value="convenio">Clientes com convênio</option>
            <option value="aniversario">Aniversariantes do mês</option>
            <option value="receita_vencendo">Receita vencendo em 7 dias</option>
          </select>
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
            onClick={handleCriar}
            className="flex h-10 flex-1 items-center justify-center rounded-[14px] bg-brand-900 font-bold text-[13px] text-white"
          >
            Criar campanha
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Abas ────────────────────────────────────────────────── */
function AbaHub() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Métricas */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: '128 mensagens hoje', sub: 'Fila recebendo e triando contatos em tempo real.' },
          { label: '4 filas ativas', sub: 'Distribuição automática para farmácia, SAC e suporte.' },
        ].map((m) => (
          <div
            key={m.label}
            className="flex flex-col gap-2 rounded-[22px] border border-brand-100 bg-white p-[18px]"
          >
            <p className="font-bold text-[14px] text-brand-950">{m.label}</p>
            <p className="text-[13px] text-text-secondary leading-snug">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="flex min-h-0 flex-1 gap-4">
        {/* QR Code */}
        <div
          className="flex flex-col gap-3 rounded-[24px] border border-brand-100 bg-white p-[22px]"
          style={{ width: 420 }}
        >
          <p className="font-bold text-[18px] text-brand-950">Conectar novo aparelho</p>
          <div className="flex flex-1 gap-4">
            <div className="flex h-[170px] w-[170px] shrink-0 items-center justify-center rounded-[22px] border border-brand-100 bg-[#F4F8F4] font-bold text-[11px] text-brand-600">
              QR CODE
            </div>
            <div className="flex flex-1 flex-col gap-3 py-1">
              {[
                '1. Abra o WhatsApp no seu aparelho',
                '2. Vá em Configurações → WhatsApp Business → Aparelhos vinculados',
                '3. Toque em "Vincular um aparelho" e escaneie o QR ao lado',
              ].map((s) => (
                <p key={s} className="text-[12px] text-text-secondary leading-snug">
                  {s}
                </p>
              ))}
              <div className="mt-auto flex gap-2">
                <button
                  type="button"
                  className="flex h-8 items-center rounded-[10px] border border-brand-200 bg-white px-3 font-medium text-[12px] text-brand-700 hover:bg-brand-50"
                >
                  Recarregar QR
                </button>
                <button
                  type="button"
                  className="flex h-8 items-center rounded-[10px] bg-brand-900 px-3 font-medium text-[12px] text-white"
                >
                  Abrir Web
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Direita: automação + log */}
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="rounded-[24px] border border-brand-100 bg-white p-[22px]">
            <p className="mb-3 font-bold text-[18px] text-brand-950">Automação de atendimento</p>
            <div className="flex flex-col gap-2">
              {[
                '• Mensagens fora do horário viram ticket automático',
                '• Palavras-chave: pedido, entrega, retorno',
                '• Prioridade alta para prescrições e dúvidas urgentes',
              ].map((s) => (
                <p key={s} className="text-[13px] text-text-secondary">
                  {s}
                </p>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-[24px] border border-brand-100 bg-white p-[22px]">
            <p className="font-bold text-[18px] text-brand-950">Últimas interações</p>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
              {[
                { hora: '10:42', desc: 'Cliente: busca de dipirona infantil' },
                { hora: '10:41', desc: 'Atendente: enviou catálogo de genéricos' },
                { hora: '10:38', desc: 'Bot: transferiu caso para farmácia central' },
              ].map((l) => (
                <p key={l.hora} className="text-[13px] text-text-secondary">
                  <span className="font-medium text-brand-950">{l.hora}</span>
                  {'  '}
                  {l.desc}
                </p>
              ))}
            </div>
            <div className="rounded-[16px] bg-[#F4F8F4] px-4 py-3">
              <p className="font-semibold text-[12px] text-brand-700">
                SLA médio: 3m14s • 94% resolvidos no 1º contato
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── AbaAtendimentos helpers ─────────────────────────────── */

function ClienteHeader({ conv }: { conv: Conversa }) {
  return (
    <div className="flex flex-col items-center gap-2.5 border-[#DCE7E1] border-b px-5 py-4">
      <AvatarCircle nome={conv.nome} color={conv.avatarColor} size={48} />
      <div className="flex flex-col items-center gap-0.5">
        <p className="font-bold text-[#163B32] text-[15px]">{conv.nome}</p>
        <p className="text-[#8A9892] text-[12px]">{conv.telefone}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        <span className="rounded-full bg-[#E1F5EE] px-2.5 py-0.5 font-medium text-[#085041] text-[10px]">
          Cliente ativo
        </span>
        <span className="rounded-full bg-[#E1F5EE] px-2.5 py-0.5 font-medium text-[#085041] text-[10px]">
          Fidelidade Ouro
        </span>
      </div>
    </div>
  )
}

function ContentOrcamento({
  orcamento,
  onAddItem,
  onSendChat,
  onConvertPedido,
}: {
  orcamento: OrcamentoItem[]
  onAddItem: (item: OrcamentoItem) => void
  onSendChat: () => void
  onConvertPedido: () => void
}) {
  const [busca, setBusca] = useState('')

  const filtrados = useMemo(
    () =>
      busca.length >= 2
        ? PRODUTOS_CATALOGO.filter(
            (p) =>
              p.nome.toLowerCase().includes(busca.toLowerCase()) ||
              p.laboratorio.toLowerCase().includes(busca.toLowerCase())
          )
        : [],
    [busca]
  )

  const fmtPreco = (v: number) =>
    `R$ ${(v / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  const total = orcamento.reduce((sum, i) => sum + i.preco * i.qty, 0)

  return (
    <>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
        <p className="font-bold text-[#173126] text-[13px]">Buscar produto</p>
        <div className="relative">
          <input
            type="text"
            placeholder="Nome ou laboratório (mín. 2 chars)..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="h-9 w-full rounded-[12px] border border-[#DCE7E1] bg-[#F7FAF8] px-3 text-[#173126] text-[12px] outline-none placeholder:text-[#8A9892] focus:border-[#0E4D3B]"
          />
          {filtrados.length > 0 && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-[12px] border border-[#DCE7E1] bg-white shadow-lg">
              {filtrados.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={() => {
                    onAddItem({
                      produto_id: p.id,
                      nome: p.nome,
                      laboratorio: p.laboratorio,
                      apresentacao: p.apresentacao,
                      preco: p.preco,
                      qty: 1,
                    })
                    setBusca('')
                  }}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-[#F7FAF8]"
                >
                  <div>
                    <p className="font-medium text-[#173126] text-[12px]">{p.nome}</p>
                    <p className="text-[#8A9892] text-[10px]">
                      {p.laboratorio} · {p.apresentacao}
                    </p>
                  </div>
                  <p className="font-semibold text-[#173126] text-[12px]">{fmtPreco(p.preco)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {orcamento.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-center text-[#8A9892] text-[12px]">
              Busque um produto acima para montar o orçamento
            </p>
          </div>
        ) : (
          <>
            <p className="font-bold text-[#173126] text-[12px]">Itens do orçamento</p>
            {orcamento.map((item) => (
              <div
                key={item.produto_id}
                className="flex items-center justify-between rounded-[14px] border border-[#E6ECE8] bg-[#F7FAF8] px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-[#173126] text-[12px]">{item.nome}</p>
                  <p className="text-[#8A9892] text-[10px]">
                    {item.laboratorio} · {item.apresentacao}
                  </p>
                </div>
                <p className="font-bold text-[#173126] text-[13px]">
                  {fmtPreco(item.preco * item.qty)}
                </p>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-[14px] border border-[#E6ECE8] bg-[#E1F5EE] px-4 py-3">
              <p className="font-bold text-[#085041] text-[12px]">Total</p>
              <p className="font-bold text-[#085041] text-[14px]">{fmtPreco(total)}</p>
            </div>
          </>
        )}
      </div>

      {orcamento.length > 0 && (
        <div className="flex flex-col gap-2 border-[#DCE7E1] border-t p-4">
          <button
            type="button"
            onClick={onSendChat}
            className="flex h-9 w-full items-center justify-center rounded-[12px] bg-[#0E4D3B] font-bold text-[12px] text-white hover:bg-[#0a3a2c]"
          >
            Enviar orçamento no chat
          </button>
          <button
            type="button"
            onClick={onConvertPedido}
            className="flex h-9 w-full items-center justify-center rounded-[12px] border border-[#DCE7E1] font-medium text-[#173126] text-[12px] hover:bg-[#F7FAF8]"
          >
            Converter em pedido →
          </button>
        </div>
      )}
    </>
  )
}

function ContentReceita({ conv }: { conv: Conversa }) {
  const temReceita = conv.id === 'cv1'

  if (!temReceita) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 py-4">
        <p className="text-center text-[#8A9892] text-[12px]">
          Nenhuma receita digital vinculada a esta conversa
        </p>
        <button
          type="button"
          className="flex h-8 items-center rounded-[10px] border border-[#DCE7E1] bg-white px-3 font-medium text-[#173126] text-[11px] hover:bg-[#F7FAF8]"
        >
          Validar receita recebida no chat
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
      <div className="flex items-center justify-between">
        <p className="font-bold text-[#173126] text-[13px]">Receita Digital</p>
        <span className="rounded-full bg-[#FAEEDA] px-2.5 py-0.5 font-semibold text-[#633806] text-[10px]">
          ⚠ Pendente
        </span>
      </div>
      {[
        { label: 'Prescritor', value: 'Dr. Rafael Souza' },
        { label: 'CRM', value: 'CRM/SP 54.321' },
        { label: 'Data prescrição', value: '10/05/2025' },
        { label: 'Validade', value: '12/06/2025' },
        { label: 'Protocolo', value: 'RD-2025-08741' },
        { label: 'Medicamento', value: 'Amoxicilina 500mg · 21 cáps' },
      ].map((f) => (
        <div
          key={f.label}
          className="flex flex-col gap-0.5 rounded-[14px] border border-[#E6ECE8] bg-[#F7FAF8] px-4 py-3"
        >
          <p className="font-bold text-[#8A9892] text-[10px] uppercase">{f.label}</p>
          <p className="font-medium text-[#173126] text-[13px]">{f.value}</p>
        </div>
      ))}
      <button
        type="button"
        // TODO: POST /api/v1/whatsapp/conversas/{id}/receita/validar
        className="mt-2 flex h-9 w-full items-center justify-center rounded-[12px] bg-[#0E4D3B] font-bold text-[12px] text-white hover:bg-[#0a3a2c]"
      >
        Confirmar e validar receita
      </button>
    </div>
  )
}

function ContentPedido({
  orcamento,
  onSeparar,
}: {
  orcamento: OrcamentoItem[]
  onSeparar: () => void
}) {
  const fmtPreco = (v: number) =>
    `R$ ${(v / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  const itens =
    orcamento.length > 0
      ? orcamento
      : [
          {
            produto_id: 'p1',
            nome: 'Amoxicilina 500mg',
            laboratorio: 'EMS',
            apresentacao: '21 cáps',
            preco: 2490,
            qty: 1,
          },
        ]
  const total = itens.reduce((sum, i) => sum + i.preco * i.qty, 0)

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
      <p className="font-bold text-[#173126] text-[13px]">Resumo do pedido</p>
      {itens.map((item) => (
        <div
          key={item.produto_id}
          className="flex items-center justify-between rounded-[14px] border border-[#E6ECE8] bg-[#F7FAF8] px-4 py-3"
        >
          <div>
            <p className="font-semibold text-[#173126] text-[13px]">{item.nome}</p>
            <p className="text-[#8A9892] text-[11px]">
              {item.apresentacao} · {item.laboratorio}
            </p>
          </div>
          <p className="font-bold text-[#173126] text-[14px]">{fmtPreco(item.preco * item.qty)}</p>
        </div>
      ))}
      <div className="flex items-center justify-between rounded-[14px] border border-[#E6ECE8] bg-[#E1F5EE] px-4 py-3">
        <p className="font-bold text-[#085041] text-[13px]">Total</p>
        <p className="font-bold text-[#085041] text-[16px]">{fmtPreco(total)}</p>
      </div>
      <p className="text-center text-[#8A9892] text-[11px]">
        +{Math.floor(total / 500)} pontos fidelidade
      </p>
      <button
        type="button"
        onClick={onSeparar}
        // TODO: POST /api/v1/whatsapp/conversas/{id}/pedido/separar
        className="mt-auto flex h-10 w-full items-center justify-center rounded-[12px] bg-[#0E4D3B] font-bold text-[13px] text-white hover:bg-[#0a3a2c]"
      >
        Separar pedido e notificar cliente
      </button>
    </div>
  )
}

function ContentHistorico() {
  const historico = [
    { data: '08/05/2025', tipo: 'Compra', desc: 'Amoxicilina 500mg · 21 cáps', valor: 'R$ 24,90' },
    { data: '22/04/2025', tipo: 'Receita', desc: 'RD-2025-07312 · Dr. Ana Lima', valor: '—' },
    { data: '10/04/2025', tipo: 'Compra', desc: 'Omeprazol 20mg + Buscopan', valor: 'R$ 42,80' },
    {
      data: '01/03/2025',
      tipo: 'PBM',
      desc: 'Metformina 850mg · Farmácia Popular',
      valor: 'R$ 0,00',
    },
  ]
  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-5 py-4">
      <p className="font-bold text-[#173126] text-[13px]">Histórico do cliente</p>
      {/* TODO: GET /api/v1/whatsapp/conversas/{id}/historico */}
      {historico.map((h) => (
        <div
          key={`${h.data}-${h.tipo}`}
          className="flex items-start gap-3 rounded-[14px] border border-[#E6ECE8] bg-[#F7FAF8] px-4 py-3"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-75 px-2 py-0.5 font-medium text-[9px] text-brand-750">
                {h.tipo}
              </span>
              <p className="text-[#8A9892] text-[10px]">{h.data}</p>
            </div>
            <p className="mt-1 text-[#173126] text-[12px]">{h.desc}</p>
          </div>
          <p className="font-semibold text-[#173126] text-[12px]">{h.valor}</p>
        </div>
      ))}
    </div>
  )
}

function AbaAtendimentos() {
  const [convSelecionada, setConvSelecionada] = useState<Conversa>(CONVERSAS[0])
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<FiltroStatus>('todos')
  const [mensagem, setMensagem] = useState('')
  const [abaOps, setAbaOps] = useState<AbaOps>('orcamento')
  const [orcamento, setOrcamento] = useState<OrcamentoItem[]>([])

  const filtradas = useMemo(
    () =>
      CONVERSAS.filter((c) => {
        const matchBusca =
          c.nome.toLowerCase().includes(busca.toLowerCase()) || c.telefone.includes(busca)
        const matchFiltro = filtro === 'todos' || c.status === filtro
        return matchBusca && matchFiltro
      }),
    [busca, filtro]
  )

  const bubbles =
    convSelecionada.id === 'cv1' ? CHAT_ANA_ATEND : convSelecionada.id === 'cv4' ? CHAT_MARIA : []

  const counters = useMemo(
    () => ({
      aguardando: CONVERSAS.filter((c) => c.status === 'aguardando').length,
      em_atendimento: CONVERSAS.filter((c) => c.status === 'em_atendimento').length,
    }),
    []
  )

  function handleAddOrcamentoItem(item: OrcamentoItem) {
    setOrcamento((prev) => {
      const idx = prev.findIndex((i) => i.produto_id === item.produto_id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], qty: updated[idx].qty + 1 }
        return updated
      }
      return [...prev, item]
    })
  }

  function handleSendOrcamento() {
    // TODO: POST /api/v1/whatsapp/conversas/{id}/orcamento/enviar
  }

  function handleSepararPedido() {
    // TODO: POST /api/v1/whatsapp/conversas/{id}/pedido/separar
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden rounded-[20px] border border-[#DCE7E1]">
      {/* Painel esquerdo: lista unificada */}
      <div className="flex w-[280px] shrink-0 flex-col border-[#DCE7E1] border-r bg-white">
        <div className="border-[#DCE7E1] border-b px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-bold text-[#163B32] text-[15px]">Atendimentos</p>
            {counters.aguardando > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D97706] px-1 font-bold text-[9px] text-white">
                {counters.aguardando}
              </span>
            )}
          </div>
          <input
            type="text"
            placeholder="Buscar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="h-8 w-full rounded-[10px] border border-[#DCE7E1] bg-[#F7FAF8] px-3 text-[#173126] text-[12px] outline-none placeholder:text-[#8A9892] focus:border-[#0E4D3B]"
          />
        </div>

        <div className="flex flex-wrap gap-1 border-[#DCE7E1] border-b px-3 py-2">
          {FILTRO_CFG.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              className={[
                'flex h-6 items-center rounded-full px-2.5 font-medium text-[10px] transition-colors',
                filtro === f.id
                  ? 'bg-[#0E4D3B] text-white'
                  : 'border border-[#DCE7E1] bg-[#F2F7F4] text-[#8A9892]',
              ].join(' ')}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto">
          {filtradas.map((c) => {
            const isActive = c.id === convSelecionada.id
            const scfg = CONV_STATUS_CFG[c.status]
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setConvSelecionada(c)}
                className={[
                  'flex w-full items-start gap-3 border-[#F0F4F2] border-b px-4 py-3 text-left transition-colors',
                  isActive ? 'bg-[#E8F5EF]' : 'hover:bg-[#F7FAF8]',
                ].join(' ')}
              >
                <div className="relative shrink-0">
                  <AvatarCircle nome={c.nome} color={c.avatarColor} size={36} />
                  {c.alertas && c.alertas.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#D97706] ring-2 ring-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="truncate font-semibold text-[#173126] text-[12px]">{c.nome}</p>
                    <p className="shrink-0 text-[#8A9892] text-[10px]">{c.hora}</p>
                  </div>
                  <p className="mt-0.5 truncate text-[#8A9892] text-[11px]">{c.preview}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span
                      className={`rounded-full px-1.5 py-0.5 font-medium text-[9px] ${scfg.bg} ${scfg.text}`}
                    >
                      {scfg.label}
                    </span>
                    {c.unread > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0E4D3B] px-1 font-bold text-[9px] text-white">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="border-[#DCE7E1] border-t bg-[#F7FAF8] px-4 py-2.5">
          <p className="text-[#8A9892] text-[10px]">
            {counters.em_atendimento} atendendo · {counters.aguardando} aguardando
          </p>
        </div>
      </div>

      {/* Painel central: chat */}
      <div className="flex min-h-0 flex-1 flex-col bg-[#F7FAF8]">
        <div className="flex items-center gap-3 border-[#DCE7E1] border-b bg-white px-5 py-3.5">
          <AvatarCircle nome={convSelecionada.nome} color={convSelecionada.avatarColor} size={40} />
          <div className="flex-1">
            <p className="font-semibold text-[#173126] text-[14px]">{convSelecionada.nome}</p>
            <p className="text-[#8A9892] text-[11px]">{convSelecionada.telefone}</p>
          </div>
          <div className="flex items-center gap-2">
            {convSelecionada.alertas?.map((a) => (
              <span
                key={a}
                className="rounded-full bg-[#FAEEDA] px-2.5 py-1 font-semibold text-[#633806] text-[10px]"
              >
                ⚠ {a}
              </span>
            ))}
            {convSelecionada.status === 'aguardando' ? (
              <button
                type="button"
                // TODO: POST /api/v1/whatsapp/conversas/{id}/iniciar
                className="flex h-8 items-center rounded-[10px] bg-[#0E4D3B] px-3 font-medium text-[11px] text-white hover:bg-[#0a3a2c]"
              >
                Iniciar atendimento
              </button>
            ) : convSelecionada.status === 'em_atendimento' ? (
              <>
                <button
                  type="button"
                  className="flex h-8 items-center rounded-[10px] border border-[#DCE7E1] bg-white px-3 font-medium text-[#173126] text-[11px] hover:bg-[#F7FAF8]"
                >
                  Transferir
                </button>
                <button
                  type="button"
                  // TODO: POST /api/v1/whatsapp/conversas/{id}/encerrar
                  className="flex h-8 items-center rounded-[10px] border border-[#DCE7E1] bg-white px-3 font-medium text-[11px] text-danger-600 hover:bg-danger-50"
                >
                  Encerrar
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
          {bubbles.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-[#8A9892] text-[13px]">Nenhuma mensagem ainda</p>
            </div>
          ) : (
            bubbles.map((b) => <BubbleMsg key={b.id} b={b} />)
          )}
        </div>

        <div className="flex items-center gap-2 border-[#DCE7E1] border-t bg-white px-4 py-3">
          <button
            type="button"
            aria-label="Anexar arquivo"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-[#DCE7E1] bg-[#F7FAF8] text-[#7A8883] hover:bg-[#EEF4EF]"
          >
            📎
          </button>
          <input
            type="text"
            placeholder="Digite uma mensagem..."
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            className="h-10 flex-1 rounded-[14px] border border-[#DCE7E1] bg-[#F7FAF8] px-4 text-[#173126] text-[13px] outline-none placeholder:text-[#8A9892] focus:border-[#0E4D3B]"
          />
          <button
            type="button"
            aria-label="Enviar mensagem"
            // TODO: POST /api/v1/whatsapp/conversas/{id}/send
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#0E4D3B] text-[18px] hover:bg-[#0a3a2c]"
          >
            ➤
          </button>
        </div>
      </div>

      {/* Painel direito: cliente fixo + tabs de ação */}
      <div className="flex w-[360px] shrink-0 flex-col border-[#DCE7E1] border-l bg-white">
        <ClienteHeader conv={convSelecionada} />

        <div className="flex flex-wrap gap-1 border-[#DCE7E1] border-b px-4 py-3">
          {TABS_OPS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setAbaOps(t.id)}
              className={[
                'flex h-7 items-center gap-1 rounded-full px-3 font-medium text-[11px] transition-colors',
                abaOps === t.id
                  ? 'bg-[#0E4D3B] text-white'
                  : 'border border-[#DCE7E1] bg-[#F2F7F4] text-[#8A9892] hover:bg-[#E8F5EF]',
              ].join(' ')}
            >
              {t.label}
              {t.id === 'receita' && convSelecionada.alertas?.length ? (
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D97706]" />
              ) : null}
            </button>
          ))}
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          {abaOps === 'orcamento' && (
            <ContentOrcamento
              orcamento={orcamento}
              onAddItem={handleAddOrcamentoItem}
              onSendChat={handleSendOrcamento}
              onConvertPedido={() => setAbaOps('pedido')}
            />
          )}
          {abaOps === 'receita' && <ContentReceita conv={convSelecionada} />}
          {abaOps === 'pedido' && (
            <ContentPedido orcamento={orcamento} onSeparar={handleSepararPedido} />
          )}
          {abaOps === 'historico' && <ContentHistorico />}
        </div>
      </div>
    </div>
  )
}

function AbaCampanhas() {
  const [campanhaOpen, setCampanhaOpen] = useState(false)

  return (
    <div className="flex min-h-0 flex-1 gap-4">
      {/* Coluna principal */}
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {/* Métricas */}
        <div className="grid shrink-0 grid-cols-4 gap-4">
          {[
            { label: 'Campanhas ativas', value: '12', sub: '3 agendadas para hoje' },
            {
              label: 'Mensagens enviadas',
              value: '4.856',
              sub: '+22% vs semana anterior',
              subColor: 'text-success-600',
            },
            { label: 'Taxa de abertura', value: '78%', sub: 'Meta: 70%' },
            { label: 'Conversão em vendas', value: 'R$ 8.420', sub: '156 pedidos via chat' },
          ].map((m) => (
            <div
              key={m.label}
              className="flex flex-col gap-1 rounded-[22px] border border-brand-100 bg-white p-[18px]"
            >
              <span className="text-[12px] text-text-secondary">{m.label}</span>
              <span className="font-bold text-[24px] text-brand-950">{m.value}</span>
              <span className={`text-[11px] ${m.subColor ?? 'text-text-secondary'}`}>{m.sub}</span>
            </div>
          ))}
        </div>

        {/* Tabela campanhas */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-[24px] border border-brand-100 bg-white p-[22px]">
          <div className="flex items-center justify-between">
            <p className="font-bold text-[16px] text-brand-950">Campanhas recentes</p>
            <button
              type="button"
              onClick={() => setCampanhaOpen(true)}
              className="flex h-8 items-center gap-1.5 rounded-[12px] bg-brand-900 px-3 font-bold text-[12px] text-white"
            >
              + Nova campanha
            </button>
          </div>

          {/* Header col */}
          <div className="grid grid-cols-[minmax(0,2fr)_90px_80px_70px_90px_60px] rounded-[8px] bg-[#F7FAF8] px-3 py-2">
            {['Campanha', 'Tipo', 'Enviadas', 'Abertura', 'Status', 'Ação'].map((h) => (
              <span key={h} className="font-semibold text-[11px] text-text-secondary">
                {h}
              </span>
            ))}
          </div>

          <div className="flex flex-1 flex-col gap-0 overflow-y-auto">
            {CAMPANHAS.map((c, i) => {
              const st = CAMP_STATUS_CFG[c.status]
              return (
                <div
                  key={c.id}
                  className={[
                    'grid grid-cols-[minmax(0,2fr)_90px_80px_70px_90px_60px] items-center border-[#F0F4F2] border-b px-3 py-3',
                    i % 2 === 1 ? 'bg-[#FAFCFB]' : '',
                  ].join(' ')}
                >
                  <span className="truncate pr-2 font-medium text-[12px] text-brand-950">
                    {c.nome}
                  </span>
                  <span className="text-[12px] text-text-secondary">{CAT_LABEL[c.tipo]}</span>
                  <span className="font-medium text-[12px] text-brand-950">
                    {c.enviadas.toLocaleString('pt-BR')}
                  </span>
                  <span
                    className={`font-semibold text-[12px] ${c.abertura_pct >= 75 ? 'text-success-600' : 'text-text-secondary'}`}
                  >
                    {c.abertura_pct}%
                  </span>
                  <span
                    className={`flex h-6 w-fit items-center rounded-full px-2.5 font-medium text-[10px] ${st.bg} ${st.text}`}
                  >
                    {st.label}
                  </span>
                  <button
                    type="button"
                    className="font-semibold text-[12px] text-brand-700 hover:text-brand-900"
                  >
                    Editar
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Painel direito */}
      <div className="flex w-[340px] shrink-0 flex-col gap-4">
        {/* Ações rápidas */}
        <div className="flex flex-col gap-3 rounded-[24px] border border-brand-100 bg-white p-[22px]">
          <p className="font-bold text-[16px] text-brand-950">Ações rápidas</p>
          {[
            { icon: '📢', title: 'Enviar promoção', sub: 'Para todos os clientes ativos' },
            { icon: '💊', title: 'Lembrete de receita', sub: 'Receitas vencendo em 7 dias' },
            { icon: '⭐', title: 'Pontos fidelidade', sub: 'Clientes com pontos a expirar' },
          ].map((a) => (
            <button
              key={a.title}
              type="button"
              className="flex items-center gap-3 rounded-[14px] border border-brand-100 bg-[#F2F7F4] p-3.5 text-left hover:bg-brand-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-75 text-[18px]">
                {a.icon}
              </div>
              <div>
                <p className="font-semibold text-[13px] text-brand-950">{a.title}</p>
                <p className="text-[11px] text-text-secondary">{a.sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Templates de mensagem */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-[24px] border border-brand-100 bg-white p-[22px]">
          <p className="font-bold text-[16px] text-brand-950">Templates de mensagem</p>
          {TEMPLATES.slice(0, 4).map((t) => (
            <div key={t.id} className="rounded-[12px] border border-[#E6ECE8] bg-[#F7FAF8] p-3.5">
              <p className="font-semibold text-[13px] text-brand-950">{t.nome}</p>
              <p className="mt-1 text-[11px] text-text-secondary leading-snug">{t.mensagem}</p>
            </div>
          ))}
        </div>
      </div>

      {campanhaOpen && <ModalNovaCampanha onClose={() => setCampanhaOpen(false)} />}
    </div>
  )
}

/* ── Página principal ────────────────────────────────────── */
export function WhatsAppPage() {
  const [aba, setAba] = useState<Aba>('hub')
  const [conectado] = useState(true)

  const ABA_CFG: { id: Aba; label: string }[] = [
    { id: 'hub', label: 'Integração' },
    { id: 'atendimentos', label: 'Atendimentos' },
    { id: 'campanhas', label: 'Campanhas' },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between rounded-3xl border border-brand-100 bg-white px-5.5 py-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-bold text-[22px] text-brand-950">WhatsApp / CRM</h1>
          <p className="text-[13px] text-text-secondary">
            Centralize atendimentos, QR code e automações em um único painel.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={[
              'flex items-center gap-2 rounded-full border px-3 py-1.5',
              conectado ? 'border-brand-200 bg-brand-75' : 'border-warning-100 bg-warning-50',
            ].join(' ')}
          >
            <span
              className={[
                'h-2 w-2 rounded-full',
                conectado ? 'bg-success-600' : 'bg-warning-600',
              ].join(' ')}
            />
            <span
              className={[
                'font-bold text-[12px]',
                conectado ? 'text-success-600' : 'text-warning-700',
              ].join(' ')}
            >
              {conectado ? 'QR conectado' : 'Desconectado'}
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-[14px] border border-brand-100 bg-[#F5F8F6] p-1">
            {ABA_CFG.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAba(a.id)}
                className={[
                  'flex h-8 items-center rounded-[10px] px-3 font-bold text-[12px] transition-colors',
                  aba === a.id ? 'bg-brand-900 text-white' : 'text-brand-700 hover:bg-brand-50',
                ].join(' ')}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {aba === 'hub' && <AbaHub />}
      {aba === 'atendimentos' && <AbaAtendimentos />}
      {aba === 'campanhas' && <AbaCampanhas />}
    </div>
  )
}
