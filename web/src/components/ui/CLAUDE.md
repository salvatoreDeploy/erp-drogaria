# UI Components — Padrões de criação

Componentes genéricos reutilizáveis em múltiplas páginas. Todo novo componente nesta pasta deve seguir os padrões abaixo.

---

## Estrutura de arquivos

```
src/components/ui/
├── alert.tsx        ← ✅ existente — variantes danger/warning/info/success via tv()
├── badge.tsx        ← ✅ existente
├── button.tsx       ← ✅ existente
├── checkbox.tsx     ← ✅ existente
├── filter-tabs.tsx  ← ✅ existente — FilterTabs<T> com count opcional
├── input.tsx        ← ✅ existente (migrado para Composition Pattern — usar Input.Root)
├── metric-card.tsx  ← ✅ existente (migrado para Composition Pattern — usar MetricCard.Root)
├── modal.tsx        ← ✅ existente — Modal.Root/.Header/.Body/.Footer com Context interno
├── select.tsx       ← ✅ existente
├── switch.tsx       ← ✅ existente
├── table.tsx        ← ✅ existente — Table.Header/.Row sem Context
├── index.ts         ← barrel: re-exporta todos os componentes
└── CLAUDE.md
```

Ao criar novo componente: adicionar exportações no `index.ts` (types com `export type`, values normais).

### Status de componentes

| Componente | Status | Padrão |
|---|---|---|
| `Modal` | ✅ Criado | Composition Pattern com Context — `.Root` `.Header` `.Body` `.Footer` |
| `Alert` | ✅ Criado | `tv()` variantes: `danger\|warning\|info\|success` |
| `Table` | ✅ Criado | Composition Pattern sem Context — `.Header` `.Row` |
| `FilterTabs` | ✅ Criado | Genérico `FilterTabs<T extends string>` com badge de contagem |

---

## Regras obrigatórias

### Nunca use `default export`
```tsx
// ERRADO
export default function Button() {}

// CERTO
export function Button() {}
export interface ButtonProps {}
```

### Sempre exporte a interface de props
Permite que consumers referenciem o tipo sem duplicar.

### Use `import type` para tipos puros
O Biome (`useImportType`) enforça automaticamente ao rodar `biome check --write`.

```tsx
import type { HTMLAttributes } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
```

---

## Dependências

| Pacote | Por quê |
|---|---|
| `tailwind-variants` | API principal de variantes (`tv()`) |
| `tailwind-merge` | Peer dep de `tailwind-variants` — nunca remova mesmo sem uso direto |
| `@base-ui/react` | Primitivos headless: Switch, Checkbox, Select |

---

## Dois tipos de componente

### 1. Componentes visuais (sem comportamento)

Usam apenas Tailwind + `tv()`. Exemplos: `Button`, `Badge`, `MetricCard`, `Input`.

```tsx
import type { HTMLAttributes } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const root = tv({
  base: 'rounded-[14px] border px-4 py-2',
  variants: { intent: { default: 'bg-brand-700 text-white', danger: 'bg-danger-500 text-white' } },
  defaultVariants: { intent: 'default' },
})

type RootVariants = VariantProps<typeof root>
export interface MyComponentProps extends HTMLAttributes<HTMLDivElement>, RootVariants {}

export function MyComponent({ intent, className, ...props }: MyComponentProps) {
  return <div {...props} className={root({ intent, className })} />
}
```

### 2. Componentes com comportamento (Base UI)

Usam primitivo do `@base-ui/react` + estilos via `tv()`.
Exemplos: `Switch`, `Checkbox`, `Select`.

**Regra crítica de tipagem:** Base UI permite `className` como função `(state) => string`.
Como `tv()` só aceita `string`, sempre faça `Omit` e redefina:

```tsx
import { Switch as SwitchPrimitive } from '@base-ui/react/switch'

export interface SwitchProps extends Omit<SwitchPrimitive.Root.Props, 'className'> {
  className?: string
}

export function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root className={track({ className })} {...props}>
      <SwitchPrimitive.Thumb className="..." />
    </SwitchPrimitive.Root>
  )
}
```

#### Estados via data-attributes

```tsx
const track = tv({
  base: [
    'bg-brand-100 data-[checked]:bg-brand-700',          // Switch on/off
    'data-[unchecked]:border data-[checked]:bg-brand-700', // Checkbox
    'data-[highlighted]:bg-brand-50',                    // Select item hover
    'data-[starting-style]:opacity-0',                   // Select popup animation
  ],
})
```

#### Componentes Select (partes separadas, sem Object.assign)

`SelectRoot<T>` usa generic — `Object.assign` quebraria a inferência. Exportar partes nomeadas:

```tsx
export function SelectRoot<T>(props: SelectRootProps<T>) { ... }
export function SelectTrigger({ placeholder, className, ...props }: SelectTriggerProps) { ... }
export function SelectList({ children }: SelectListProps) { ... }
export function SelectItem({ children, className, ...props }: SelectItemProps) { ... }
```

> **Nota:** `onValueChange` do Base UI passa `string | null`. Trate no consumer:
> `onValueChange={(v) => setValue(v ?? '')}`

#### Acessibilidade com `<label>` + Base UI

Base UI renderiza `<button>` para Switch e Checkbox. Envolver em `<label>` é válido, mas o Biome reclama:

```tsx
{/* biome-ignore lint/a11y/noLabelWithoutControl: Base UI Switch renders <button role="switch"> */}
<label className="flex items-center gap-2">
  <Switch checked={on} onCheckedChange={setOn} />
  Ativar modo escuro
</label>
```

---

## Composition Pattern (estilo Radix UI)

Componentes com sub-partes semânticas usam o **Composition Pattern**: cada parte é uma função independente, exportadas juntas em um objeto namespace — igual a `Dialog.Root`, `Dialog.Trigger`, `Dialog.Content` do Radix UI. Não usar `Object.assign` — o namespace explícito é mais legível e preserva generics.

### Estrutura básica (sem Context)

Para partes **sem estado compartilhado** — cada parte recebe apenas suas próprias props:

```tsx
// src/components/ui/metric-card.tsx
function Root({ intent, className, children, ...props }: MetricCardRootProps) { ... }
function Label({ className, children, ...props }: MetricCardLabelProps) { ... }
function Value({ className, children, ...props }: MetricCardValueProps) { ... }
function Trend({ className, children, ...props }: MetricCardTrendProps) { ... }

// Namespace exportado — nunca Object.assign
export const MetricCard = { Root, Label, Value, Trend }
```

```tsx
// Uso:
<MetricCard.Root intent="destaque">
  <MetricCard.Label>Vendas do dia</MetricCard.Label>
  <MetricCard.Value>R$ 48,7 mil</MetricCard.Value>
  <MetricCard.Trend className="text-success-600">+12% vs ontem</MetricCard.Trend>
</MetricCard.Root>
```

### Estrutura com Context interno (estado compartilhado)

Para partes que precisam de dado do Root (ex: `onClose` do Modal), criar um Context **não exportado**:

```tsx
// src/components/ui/modal.tsx
type ModalCtx = { onClose: () => void }
const ModalContext = createContext<ModalCtx | null>(null)

function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('Modal.* deve estar dentro de Modal.Root')
  return ctx
}

function Root({ onClose, width = 'w-[520px]', children }: ModalRootProps) {
  return (
    <ModalContext.Provider value={{ onClose }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <button type="button" onClick={onClose}
          className="absolute inset-0 cursor-default bg-brand-950/30"
          aria-label="Fechar modal" />
        <div className={`relative z-10 flex max-h-[90vh] flex-col overflow-hidden rounded-[28px] bg-white shadow-xl ${width}`}>
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  )
}

function Header({ title, subtitle }: ModalHeaderProps) {
  const { onClose } = useModal()   // ← consome o Context
  return ( ... )
}

export const Modal = { Root, Header, Body, Footer }
// ModalContext e useModal NÃO são exportados — detalhe de implementação
```

### Componentes com generic (Select)

Componentes com generic **não devem** ser agrupados em namespace — generics são perdidos. Exportar as partes com nomes descritivos:

```tsx
// CORRETO: partes nomeadas individualmente
export function SelectRoot<T>(props: SelectRootProps<T>) { ... }
export function SelectTrigger(props: SelectTriggerProps) { ... }
export function SelectList(props: SelectListProps) { ... }
export function SelectItem(props: SelectItemProps) { ... }
```

### Regras

| Regra | Detalhe |
|---|---|
| Namespace, não `Object.assign` | `export const Modal = { Root, Header, Body, Footer }` |
| **Root é sempre `.Root`** | Nunca usar `<NomeComponente>` direto como root — sempre `<NomeComponente.Root>` |
| Context interno nunca exportado | É detalhe de implementação — o consumer não precisa saber |
| Partes sem estado → sem Context | `Table.Header`, `Table.Row`, `Alert` recebem apenas props |
| Generics → exportar partes avulsas | `SelectRoot<T>` não entra em namespace |
| Sub-parte usada fora do Root → erro | `useModal()` lança se não houver Provider |

```tsx
// ERRADO — root usado diretamente (padrão Object.assign antigo)
<MetricCard intent="destaque">...</MetricCard>

// CERTO — root explícito via .Root
<MetricCard.Root intent="destaque">...</MetricCard.Root>
```

---

## Checklist para criar um novo componente

Execute esta sequência ao criar qualquer componente em `src/components/ui/`:

**1. Criar o arquivo**
```
src/components/ui/nome-componente.tsx
```

**2. Estrutura mínima do arquivo**
```tsx
import type { HTMLAttributes, ReactNode } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

// ── Estilos (tv()) ────────────────────────────────────────────
const rootCls = tv({ base: '...', variants: { ... } })
const partCls = tv({ base: '...' })

// ── Interfaces (exportadas) ───────────────────────────────────
export interface NomeComponenteRootProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof rootCls> {}
export interface NomeComponentePartProps extends HTMLAttributes<HTMLSpanElement> {}

// ── Funções (sem export — apenas o namespace é exportado) ─────
function Root({ className, children, ...props }: NomeComponenteRootProps) {
  return <div {...props} className={rootCls({ className })}>{children}</div>
}

function Part({ className, children, ...props }: NomeComponentePartProps) {
  return <span {...props} className={partCls({ className })}>{children}</span>
}

// ── Namespace exportado ───────────────────────────────────────
export const NomeComponente = { Root, Part }
```

**3. Adicionar re-exportações no `index.ts`**
```ts
export { NomeComponente } from './nome-componente'
export type { NomeComponenteRootProps, NomeComponentePartProps } from './nome-componente'
```

**4. Atualizar a lista de arquivos no início deste CLAUDE.md**
Marcar `⬜ criar` → `✅ existente`.

**5. Rodar o quality gate**
```bash
npx biome check --write ./src && npx tsc -b && npx vite build
```

---

## Variantes com tailwind-variants

Use `tv()` como única fonte de `className`. Nunca chame `twMerge()` diretamente:

```tsx
// ERRADO
className={twMerge(button({ variant }), className)}

// CERTO
className={button({ variant, className })}
```

Use `compoundVariants` para estilos que dependem de combinação de variantes:

```tsx
compoundVariants: [
  { variant: 'primary', intent: 'default', class: 'bg-brand-700 hover:bg-brand-800' },
  { variant: 'primary', intent: 'error',   class: 'bg-danger-500 hover:bg-danger-600' },
]
```

---

## Componentes locais de página (não promovidos ao design system)

Alguns padrões aparecem apenas em um módulo e ficam inline no arquivo da página, sem export.

### Chat: sub-componentes locais de WhatsAppPage.tsx

Usados exclusivamente no módulo WhatsApp. **Não promover** para `ui/` — são específicos de chat.

```tsx
// Círculo colorido com iniciais — cor e tamanho por prop
function AvatarCircle({ nome, color, size = 40 }: { nome: string; color: string; size?: number })

// Bubble de mensagem — tipos: 'recebida' | 'enviada' | 'sistema'
// recebida: rounded-[4px_16px_16px_16px] bg-white border-[#E6ECE8]
// enviada:  rounded-[16px_4px_16px_16px] bg-[#0E4D3B]
// sistema:  pill centralizado bg-[#FAEEDA] text-[#633806]
function BubbleMsg({ b }: { b: Bubble })

// Painel central de chat — reutilizado internamente entre abas
// header + scroll de bubbles + inputbar. Props: conversa selecionada + bubbles + slot headerExtra
function ChatPanelShared({ conversa, bubbles, headerExtra }: ChatPanelProps)

// Cabeçalho fixo do painel direito — sempre visível acima das tabs de ação
// Avatar 48px + nome + telefone + badges + dados inline (CPF, convênio, pontos)
function ClienteHeader({ conv }: { conv: Conversa })
```

#### Padrão de painel direito contextual progressivo (AbaAtendimentos)

O painel direito (360px) nunca troca de largura — apenas seu **conteúdo interno** muda conforme a aba selecionada. O `ClienteHeader` fica fixo no topo (fora das abas) para que o atendente nunca perca a referência de quem está atendendo.

```tsx
// Estrutura do painel direito unificado
<div className="flex w-[360px] shrink-0 flex-col border-l border-[#DCE7E1] bg-white rounded-r-[20px]">
  {/* Fixo — sempre visível */}
  <ClienteHeader conv={convSelecionada} />

  {/* Tabs de ação — sempre disponíveis, sem bloqueio por estado */}
  <div className="flex gap-1 border-b border-[#DCE7E1] px-5 py-[14px]">
    {TABS_OPS.map((t) => (
      <button key={t.id} type="button" onClick={() => setAbaOps(t.id)}
        className={abaOps === t.id
          ? 'rounded-full bg-[#0E4D3B] text-white px-[14px] py-[7px] text-[11px] font-semibold'
          : 'rounded-full bg-[#F2F7F4] text-[#8A9892] px-[14px] py-[7px] text-[11px] font-medium border border-[#DCE7E1]'
        }>
        {t.label}
        {/* Badge ● quando há alerta nessa aba */}
        {t.id === 'receita' && convSelecionada.alertas?.length ? (
          <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-[#D97706]" />
        ) : null}
      </button>
    ))}
  </div>

  {/* Conteúdo scrollável da aba ativa */}
  <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
    {abaOps === 'orcamento' && <AbaOrcamento conv={convSelecionada} />}
    {abaOps === 'receita'   && <AbaReceita   conv={convSelecionada} />}
    {abaOps === 'pedido'    && <AbaPedido    conv={convSelecionada} onSeparar={handleSepararPedido} />}
    {abaOps === 'historico' && <AbaHistorico conv={convSelecionada} />}
  </div>

  {/* CTAs fixos no rodapé — variam por aba */}
  {abaOps === 'orcamento' && <FooterOrcamento conv={convSelecionada} />}
  {abaOps === 'pedido'    && <FooterPedido    conv={convSelecionada} onSeparar={handleSepararPedido} />}
</div>
```

**Por que as 4 abas são sempre visíveis (não bloqueadas por estado):**  
O atendente percorre orçamento → receita → pedido na ordem que a conversa exige, não em uma sequência obrigatória. Bloquear abas criaria fricção sem ganho de segurança — a lógica de negócio (ex: pedido requer receita válida) é validada no CTA "Separar pedido", não na navegação.

Tokens de cor do módulo WhatsApp Chat (hex arbitrários permitidos neste módulo):
`#DCE7E1` `#F7FAF8` `#E8F5EF` `#0E4D3B` `#173126` `#8A9892` `#7A8883` `#FAEEDA` `#633806` `#E1F5EE` `#085041` `#B8D8CF` `#E6ECE8` `#F2F7F4` `#F0F4F2` `#D97706` `#163B32`

---

## Tokens de cor (src/index.css)

Nunca use `bg-[#hex]` para cores do design system — adicione o token primeiro.
Exceção: `bg-[#FBFCFB]` (row de tabela) e `bg-[#F5F8F6]` (header de tabela) — micro-tons sem token.
Exceção adicional: tokens de cor do módulo WhatsApp Chat (listados na seção acima) — extraídos do Pencil design e aprovados para uso direto neste módulo.

### Paleta completa atual

| Grupo | Tokens disponíveis |
|---|---|
| `brand` | 25 · 50 · 75 · 100 · 200 · 300 · 400 · 500 · 600 · 700 · 750 · 800 · 900 · 950 · muted |
| `warning` | 25 · 50 · 100 · 600 · 700 · 800 · 900 · 950 |
| `danger` | 25 · 50 · 100 · 500 · 600 · 700 · 800 · muted · 900 |
| `info` | 50 · 100 · 700 · 900 · 950 |
| `neutral` | 50 · 100 · 500 |
| `success` | 600 — indicadores positivos, status OK, tendências |
| `text` | `secondary` — texto de apoio em subtítulos e descrições |
| `input` | `bg` · `border` · `label` · `placeholder` — campos de formulário |

### Semântica de uso

| Contexto | Tokens |
|---|---|
| Fundo card de alerta | `bg-warning-50` `border-warning-100` |
| Texto de alerta | `text-warning-800` (label) · `text-warning-950` (valor) |
| Fundo card crítico | `bg-danger-50` `border-danger-100` |
| Texto crítico | `text-danger-700` (label/badge) · `text-danger-800` (valor) |
| Fundo card info | `bg-info-50` `border-info-100` |
| Texto info | `text-info-700` (label) · `text-info-950` (valor) |
| Status OK / saudável | `text-success-600` |
| Badge ativo | `bg-brand-75 text-brand-750` |
| Badge neutro | `bg-neutral-50 text-neutral-500` |
| Link em fundo escuro | `text-brand-200` |
| Texto de apoio geral | `text-text-secondary` |
| Texto muito suave | `text-brand-muted` |
| Input / campo | `bg-input-bg border-input-border` `focus:border-brand-700` |

---

## Classes Tailwind

O Biome (`useSortedClasses`) ordena automaticamente. Não ordene manualmente — rode `biome check --write`.

---

## Padrões de layout (para referência ao criar páginas)

### Cards de seção
```tsx
<div className="rounded-3xl border border-brand-100 bg-white p-5">
```
Usar `rounded-[24px]` explícito (não `rounded-3xl`) para consistência com o design.

### Tabelas internas
```tsx
{/* cabeçalho */}
<div className="grid grid-cols-[1fr_90px_100px] items-center gap-3 rounded-xl bg-[#F5F8F6] px-3 py-2.5">
  {['Produto', 'Qtd', 'Status'].map((h) => (
    <span key={h} className="font-semibold text-[12px] text-text-secondary">{h}</span>
  ))}
</div>
{/* linha de dado */}
<div className="grid grid-cols-[1fr_90px_100px] items-center gap-3 rounded-[14px] bg-[#FBFCFB] px-3 py-3">
  <span className="font-semibold text-[13px] text-brand-950">Dipirona 500mg</span>
</div>
```

### Status badge inline
```tsx
<span className="inline-flex h-6 items-center rounded-full px-2.5 font-semibold text-[11px] bg-brand-75 text-brand-750">
  ● OK
</span>
```

### Painel informativo interno (bg-input-bg)

Caixas de informação secundária dentro de cards (audit trail, conciliação, lote crítico):
```tsx
<div className="flex flex-col gap-1 rounded-xl border border-input-border bg-input-bg p-2.5">
  <p className="font-bold text-[11px] text-brand-950">Título</p>
  <p className="text-[11px] text-text-secondary">Linha de detalhe</p>
</div>
```

Variante de alerta crítico: `border-danger-100 bg-danger-50`, texto `text-danger-700` / `text-danger-muted`.
Variante de aviso: `border-warning-100 bg-warning-25`, texto `text-warning-950` / `text-warning-700`.

### Campos de formulário inline dentro de cards

Campo auto-contido (sem `<form>` externo) para formulários em páginas como FiscalPage:

```tsx
{/* Texto / número */}
<div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
  <label htmlFor="f-id" className="font-bold text-[12px] text-input-label">Rótulo</label>
  <input id="f-id" type="text"
    className="bg-transparent text-[14px] text-brand-950 outline-none placeholder:text-input-placeholder" />
</div>

{/* Select */}
<div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
  <label htmlFor="s-id" className="font-bold text-[12px] text-input-label">Operação</label>
  <select id="s-id" className="bg-transparent text-[14px] text-brand-950 outline-none">
    <option value="a">Opção A</option>
  </select>
</div>

{/* Somente-leitura: usar <p> em vez de <label> para evitar lint noLabelWithoutControl */}
<div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
  <p className="font-bold text-[12px] text-input-label">Série / modelo</p>
  <span className="text-[14px] text-brand-950">1 / 55</span>
</div>
```

### Resumo de totais com destaque no valor final

```tsx
{/* linhas de fiscal */}
<div className="flex flex-col gap-1.5">
  <p className="text-[12px] text-brand-950">
    Base ICMS: <span className="font-semibold">R$ 10.984,00</span>
  </p>
  ...
</div>
<div className="h-px bg-brand-100" />
{/* valor final em destaque */}
<div className="flex items-baseline justify-between">
  <span className="font-bold text-[13px] text-brand-950">Valor final</span>
  <span className="font-bold text-[16px] text-brand-700">R$ 12.480,90</span>
</div>
```

---

## Sub-componentes internos

Ícones, spinners e helpers de uma página ficam no arquivo da página (não exportados).
Somente promover a `src/components/ui/` se for usado em 2+ páginas.

```tsx
// Não exportado — detalhe de implementação da página
function DiffCell({ diff }: { diff: number }) { ... }
function StatusBadge({ status }: { status: MyStatus }) { ... }
```

### ReadonlyField (padrão para campos somente-leitura)

Usado em wizards (PbmPage, EntradaNfePage) para exibir dados confirmados sem controle interativo. Usa `<p>` (nunca `<label>`) para evitar o erro Biome `noLabelWithoutControl`:

```tsx
function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[18px] border border-input-border bg-input-bg p-4">
      <p className="font-bold text-[12px] text-input-label">{label}</p>
      <span className="text-[14px] text-brand-950">{value}</span>
    </div>
  )
}
```

Promover a `src/components/ui/` se aparecer em 3+ páginas.

### Modal interno à página (a11y Biome)

> **Prefira o componente `<Modal>` de `src/components/ui/modal.tsx`** quando disponível. O padrão inline abaixo é o fallback para modais já existentes antes da criação do componente.

Overlay com `<button type="button">` (não `<div onClick>`) para satisfazer a regra `a11y/useKeyWithClickEvents` do Biome. O card do modal fica em `relative z-10` dentro do `fixed inset-0`:

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center">
  <button type="button" onClick={onClose}
    className="absolute inset-0 cursor-default bg-brand-950/30"
    aria-label="Fechar modal" />
  <div className="relative z-10 flex w-[480px] flex-col gap-4 rounded-[28px] bg-white p-6 shadow-xl">
    {/* conteúdo */}
  </div>
</div>
```

---

## Specs dos novos componentes (a implementar)

### `modal.tsx` — Composition Pattern com Context interno

Partes: `Modal.Root`, `Modal.Header`, `Modal.Body`, `Modal.Footer`
Context interno compartilha `onClose` para que `Modal.Header` renderize o botão ✕ sem prop drilling.

```tsx
// Interfaces exportadas
export interface ModalRootProps {
  onClose: () => void
  width?: string      // default 'w-[520px]' — usar 'w-[700px]' para CRUD com muitos campos
  children: ReactNode
}
export interface ModalHeaderProps {
  title: string
  subtitle?: string   // ex: '* campos obrigatórios'
}
export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}
export interface ModalFooterProps {
  children: ReactNode
}

// export const Modal = { Root, Header, Body, Footer }
```

**Estilos:**
- Card: `max-h-[90vh] flex-col overflow-hidden rounded-[28px] shadow-xl`
- Header: `border-b border-brand-100 px-7 py-5`
- Body: `flex-1 overflow-y-auto px-7 py-5`
- Footer: `border-t border-brand-100 px-7 py-5 flex gap-3`

```tsx
// Uso — estilo Radix UI:
{modalOpen && (
  <Modal.Root onClose={() => setModalOpen(false)} width="w-[700px]">
    <Modal.Header title="Novo produto" subtitle="* campos obrigatórios" />
    <Modal.Body className="flex flex-col gap-5">
      {/* campos do formulário */}
    </Modal.Body>
    <Modal.Footer>
      <button type="button" onClick={() => setModalOpen(false)}
        className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-brand-200 font-bold text-[13px] text-brand-700">
        Cancelar
      </button>
      <button type="button" onClick={handleSave}
        className="flex h-10 flex-1 items-center justify-center rounded-[14px] bg-brand-900 font-bold text-[13px] text-white">
        Confirmar
      </button>
    </Modal.Footer>
  </Modal.Root>
)}
```

---

### `alert.tsx` — Variantes via `tv()`

```tsx
import { tv, type VariantProps } from 'tailwind-variants'

const alertVariants = tv({
  base: 'flex items-start gap-3 rounded-[16px] border px-4 py-3',
  variants: {
    intent: {
      danger:  'border-danger-100 bg-danger-50',
      warning: 'border-warning-100 bg-warning-50',
      info:    'border-info-100 bg-info-50',
      success: 'border-brand-100 bg-brand-25',
    },
  },
  defaultVariants: { intent: 'info' },
})

const textVariants = tv({
  variants: {
    intent: {
      danger:  'text-danger-700',
      warning: 'text-warning-800',
      info:    'text-info-700',
      success: 'text-success-600',
    },
  },
  defaultVariants: { intent: 'info' },
})

export interface AlertProps extends VariantProps<typeof alertVariants> {
  children: ReactNode
  className?: string
}

// Uso:
<Alert intent="danger">NF-e só pode ser cancelada em até 24h após autorização SEFAZ.</Alert>
<Alert intent="warning">SEFAZ offline — notas em modo de contingência.</Alert>
<Alert intent="info">Desconto PBM de R$ 12,40 aplicado ao item.</Alert>
<Alert intent="success">Protocolo #EN-2026-004812 gerado com sucesso.</Alert>
```

---

### `table.tsx` — Composition Pattern sem Context

Partes independentes: `Table.Header` e `Table.Row`. Sem Context — cada parte recebe apenas suas próprias props (sem estado compartilhado entre header e row).

```tsx
// Table.Header — linha de cabeçalho com labels
export interface TableHeaderProps {
  cols: string[]    // ex: ['Nome', 'EAN', 'Status', 'Ações']
  gridCols: string  // ex: 'grid-cols-[minmax(0,2fr)_130px_90px_100px]'
  className?: string
}

// Table.Row — linha de dado
export interface TableRowProps {
  gridCols: string
  className?: string  // override de bg para status: 'bg-warning-25', 'bg-danger-25'
  children: ReactNode
}

// export const Table = { Header, Row }
```

**Header:** `bg-[#F5F8F6] rounded-[12px] px-3 py-2.5` — labels: `font-bold text-[11px] text-brand-muted`
**Row:** `bg-[#FBFCFB] rounded-[14px] px-3 py-2.5`

```tsx
// Uso:
<Table.Header
  gridCols="grid-cols-[minmax(0,2fr)_130px_90px_100px]"
  cols={['Nome', 'EAN', 'Status', 'Ações']}
/>
{items.map((item) => (
  <Table.Row key={item.id} gridCols="grid-cols-[minmax(0,2fr)_130px_90px_100px]">
    <span>{item.nome}</span>
    <span>{item.ean}</span>
  </Table.Row>
))}

---

### `filter-tabs.tsx` — Toggle de filtros

```tsx
export interface FilterTab<T extends string> {
  id: T
  label: string
  count?: number   // badge de contagem opcional
}

export interface FilterTabsProps<T extends string> {
  tabs: FilterTab<T>[]
  active: T
  onChange: (id: T) => void
}

// Estilo ativo:   'border-brand-700 bg-brand-75 text-brand-750'
// Estilo inativo: 'border-brand-100 bg-white text-brand-muted hover:bg-brand-50'

// Uso:
<FilterTabs
  tabs={[
    { id: 'todos', label: 'Todos', count: 124 },
    { id: 'critico', label: 'Crítico', count: 11 },
    { id: 'alerta', label: 'Alerta', count: 23 },
  ]}
  active={filter}
  onChange={setFilter}
/>
```
