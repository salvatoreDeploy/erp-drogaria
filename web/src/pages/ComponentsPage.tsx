import { useState } from 'react'
import {
  Badge,
  Button,
  Checkbox,
  Input,
  MetricCard,
  SelectItem,
  SelectList,
  SelectRoot,
  SelectTrigger,
  Switch,
} from '../components/ui'

export function ComponentsPage() {
  return (
    <div className="min-h-screen bg-brand-50 p-10">
      <h1 className="mb-10 font-bold text-2xl text-brand-900">UI Components</h1>

      {/* ── Button ── */}
      <Section title="Button — variant: primary / intent">
        <Row label="default">
          <Button intent="default">Salvar</Button>
        </Row>
        <Row label="success">
          <Button intent="success">✓ Salvo</Button>
        </Row>
        <Row label="warning">
          <Button intent="warning">! Atenção</Button>
        </Row>
        <Row label="error">
          <Button intent="error">Erro ao salvar</Button>
        </Row>
      </Section>

      <Section title="Button — variant: secondary">
        <Row label="secondary">
          <Button variant="secondary">Emitir NF-e</Button>
        </Row>
      </Section>

      <Section title="Button — estados">
        <Row label="loading">
          <Button loading>Salvando...</Button>
        </Row>
        <Row label="disabled">
          <Button disabled>Salvar</Button>
        </Row>
        <Row label="disabled + error">
          <Button intent="error" disabled>
            Erro ao salvar
          </Button>
        </Row>
      </Section>

      {/* ── Badge ── */}
      <Section title="Badge — intent">
        <Row label="ativo">
          <Badge intent="ativo">Ativo</Badge>
        </Row>
        <Row label="alerta">
          <Badge intent="alerta">Alerta</Badge>
        </Row>
        <Row label="critico">
          <Badge intent="critico">Crítico</Badge>
        </Row>
        <Row label="pendente">
          <Badge intent="pendente">Pendente</Badge>
        </Row>
        <Row label="inativo">
          <Badge intent="inativo">Inativo</Badge>
        </Row>
      </Section>

      {/* ── MetricCard ── */}
      <Section title="MetricCard — intent">
        <Row label="normal">
          <MetricCard.Root intent="normal" className="w-50">
            <MetricCard.Label>Vendas hoje</MetricCard.Label>
            <MetricCard.Value>R$ 12.450</MetricCard.Value>
            <MetricCard.Trend>+8% vs ontem</MetricCard.Trend>
          </MetricCard.Root>
        </Row>
        <Row label="destaque">
          <MetricCard.Root intent="destaque" className="w-50">
            <MetricCard.Label>Vendas hoje</MetricCard.Label>
            <MetricCard.Value>R$ 12.450</MetricCard.Value>
            <MetricCard.Trend>+8% vs ontem</MetricCard.Trend>
          </MetricCard.Root>
        </Row>
        <Row label="alerta">
          <MetricCard.Root intent="alerta" className="w-50">
            <MetricCard.Label>Vendas hoje</MetricCard.Label>
            <MetricCard.Value>R$ 12.450</MetricCard.Value>
            <MetricCard.Trend>+8% vs ontem</MetricCard.Trend>
          </MetricCard.Root>
        </Row>
        <Row label="critico">
          <MetricCard.Root intent="critico" className="w-50">
            <MetricCard.Label>Vendas hoje</MetricCard.Label>
            <MetricCard.Value>R$ 12.450</MetricCard.Value>
            <MetricCard.Trend>+8% vs ontem</MetricCard.Trend>
          </MetricCard.Root>
        </Row>
      </Section>

      {/* ── Switch ── */}
      <Section title="Switch">
        <SwitchDemo />
      </Section>

      {/* ── Checkbox ── */}
      <Section title="Checkbox">
        <CheckboxDemo />
      </Section>

      {/* ── Select ── */}
      <Section title="Select">
        <SelectDemo />
      </Section>

      {/* ── Input ── */}
      <Section title="Input — composição">
        <Row label="padrão">
          <Input.Root className="w-72">
            <Input.Label htmlFor="demo-email">E-mail</Input.Label>
            <Input.Field id="demo-email" type="email" placeholder="operador@farmacia.com" />
          </Input.Root>
        </Row>
        <Row label="disabled">
          <Input.Root className="w-72">
            <Input.Label htmlFor="demo-dis">Operador</Input.Label>
            <Input.Field id="demo-dis" value="João Silva" disabled readOnly />
          </Input.Root>
        </Row>
      </Section>
    </div>
  )
}

function SwitchDemo() {
  const [on, setOn] = useState(false)
  return (
    <>
      <Row label={on ? 'checked' : 'unchecked'}>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Base UI Switch renders a <button role="switch">, label wrapping is valid */}
        <label className="flex cursor-pointer items-center gap-3 text-[13px] text-brand-900">
          <Switch checked={on} onCheckedChange={setOn} />
          SNGPC ativo
        </label>
      </Row>
      <Row label="disabled checked">
        <Switch checked disabled />
      </Row>
      <Row label="disabled unchecked">
        <Switch disabled />
      </Row>
    </>
  )
}

function CheckboxDemo() {
  const [checked, setChecked] = useState(false)
  return (
    <>
      <Row label={checked ? 'checked' : 'unchecked'}>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Base UI Checkbox renders a <button role="checkbox">, label wrapping is valid */}
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-brand-900">
          <Checkbox checked={checked} onCheckedChange={setChecked} />
          Selecionar item
        </label>
      </Row>
      <Row label="disabled checked">
        <Checkbox checked disabled />
      </Row>
      <Row label="disabled unchecked">
        <Checkbox disabled />
      </Row>
    </>
  )
}

function SelectDemo() {
  const [value, setValue] = useState('')
  return (
    <Row label={value || 'sem seleção'}>
      <SelectRoot value={value} onValueChange={(v) => setValue(v ?? '')}>
        <SelectTrigger placeholder="Selecione o status" className="w-48" />
        <SelectList>
          <SelectItem value="ativo">Ativo</SelectItem>
          <SelectItem value="inativo">Inativo</SelectItem>
          <SelectItem value="pendente">Pendente</SelectItem>
          <SelectItem value="critico">Crítico</SelectItem>
        </SelectList>
      </SelectRoot>
    </Row>
  )
}

/* ─── helpers de layout ──────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 border-brand-100 border-b pb-2 font-semibold text-brand-400 text-xs uppercase tracking-widest">
        {title}
      </h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-6">
      <span className="w-40 shrink-0 text-right text-brand-300 text-xs">{label}</span>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  )
}
