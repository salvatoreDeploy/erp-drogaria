import { Button, MetricCard } from '../components/ui'

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-bold text-[28px] text-brand-950 leading-none">
            Boa tarde, equipe da farmácia
          </h1>
          <p className="text-[14px] text-text-secondary">
            Resumo de vendas, estoque, fiscal e benefícios em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary">Emitir NF-e</Button>
          <Button className="rounded-[14px] bg-brand-900 hover:bg-brand-800">Abrir PDV</Button>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3.5">
        <MetricCard.Root>
          <MetricCard.Label>Vendas do dia</MetricCard.Label>
          <MetricCard.Value>R$ 48,7 mil</MetricCard.Value>
          <MetricCard.Trend className="text-success-600">+12% vs ontem</MetricCard.Trend>
        </MetricCard.Root>
        <MetricCard.Root>
          <MetricCard.Label>Itens em alerta</MetricCard.Label>
          <MetricCard.Value>23 lotes</MetricCard.Value>
          <MetricCard.Trend className="text-[#B45309]">Validade abaixo de 90 dias</MetricCard.Trend>
        </MetricCard.Root>
        <MetricCard.Root>
          <MetricCard.Label>PBM aprovado</MetricCard.Label>
          <MetricCard.Value>86%</MetricCard.Value>
          <MetricCard.Trend className="text-success-600">
            Integração com convênios ativos
          </MetricCard.Trend>
        </MetricCard.Root>
        <MetricCard.Root>
          <MetricCard.Label>Caixa aberto</MetricCard.Label>
          <MetricCard.Value>14 atendimentos</MetricCard.Value>
          <MetricCard.Trend className="text-brand-700">
            Frente de caixa pronta para PDV
          </MetricCard.Trend>
        </MetricCard.Root>
      </div>

      {/* Alertas críticos */}
      <section className="flex flex-col gap-3.5 rounded-3xl border border-[#F3E2C5] bg-[#FFF8EE] p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[#7A4E00] text-[18px]">Alertas críticos</h2>
          <span className="font-bold text-[#A66500] text-[12px]">SNGPC + validade</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <AlertCard title="Amoxicilina 500mg" description="12 unidades vencem em 18 dias" />
          <AlertCard title="Controle A1" description="Movimentação pendente de envio ANVISA" />
          <AlertCard
            title="Reposição automática"
            description="15 itens sugeridos para compra hoje"
          />
        </div>
      </section>

      {/* Painel inferior */}
      <div className="flex flex-1 gap-3.5">
        {/* Estoque e validade */}
        <section className="flex flex-1 flex-col gap-3.5 rounded-3xl border border-brand-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[18px] text-brand-950">Estoque e validade</h2>
            <button
              type="button"
              className="font-bold text-[12px] text-success-600 hover:underline"
            >
              Ver tudo
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="grid grid-cols-4 gap-2.5 rounded-xl bg-[#F5F8F6] px-3 py-2.5">
              {['Produto', 'Lote', 'Validade', 'Status'].map((h) => (
                <span key={h} className="font-bold text-[12px] text-text-secondary">
                  {h}
                </span>
              ))}
            </div>
            <InventoryRow
              produto="Dipirona 500mg"
              lote="L-2291"
              validade="18 dias"
              status="Alerta"
              color="#B45309"
            />
            <InventoryRow
              produto="Losartana 50mg"
              lote="L-1044"
              validade="62 dias"
              status="OK"
              color="#0F7A4D"
            />
            <InventoryRow
              produto="Seringa 10ml"
              lote="P-7812"
              validade="Reposição"
              status="Baixo"
              color="#0B5A46"
            />
          </div>
        </section>

        {/* Atalhos do ERP */}
        <section className="flex w-90 shrink-0 flex-col gap-3.5 rounded-3xl border border-brand-100 bg-white p-5">
          <h2 className="font-bold text-[18px] text-brand-950">Atalhos do ERP</h2>
          <div className="flex flex-col gap-2.5">
            <ShortcutCard
              title="PDV rápido"
              description="Venda com múltiplas formas de pagamento."
            />
            <ShortcutCard
              title="NF-e e fiscal"
              description="Emissão, contingência e conferência rápida."
            />
            <ShortcutCard
              title="WhatsApp integrado"
              description="Confirmação de pedidos e retenção de clientes."
            />
            <ShortcutCard
              title="PBM + Popular"
              description="Validação de benefício e descontos automáticos."
            />
            <ShortcutCard
              title="Precificador"
              description="Margem, preço sugerido e promoção por categoria."
            />
            <ShortcutCard
              title="Fidelização"
              description="Pontos, campanhas e recorrência de compra."
            />
          </div>
        </section>
      </div>
    </div>
  )
}

/* ── sub-componentes internos ───────────────────────────────────────── */

function AlertCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[18px] bg-white p-3.5">
      <span className="font-bold text-[14px] text-brand-950">{title}</span>
      <span className="text-[#7A4E00] text-[12px] leading-[1.35]">{description}</span>
    </div>
  )
}

function InventoryRow({
  produto,
  lote,
  validade,
  status,
  color,
}: {
  produto: string
  lote: string
  validade: string
  status: string
  color: string
}) {
  return (
    <div className="grid grid-cols-4 gap-2.5 rounded-[14px] bg-[#FBFCFB] p-3">
      <span className="font-bold text-[13px] text-brand-950">{produto}</span>
      <span className="text-[13px] text-text-secondary">{lote}</span>
      <span className="text-[13px]" style={{ color }}>
        {validade}
      </span>
      <span className="font-bold text-[13px]" style={{ color }}>
        {status}
      </span>
    </div>
  )
}

function ShortcutCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[18px] bg-input-bg p-3.5">
      <span className="font-bold text-[14px] text-brand-950">{title}</span>
      <span className="text-[12px] text-text-secondary leading-[1.35]">{description}</span>
    </div>
  )
}
