# Farmacorp ERP

Sistema de gestão integrada para farmácias — PDV, caixa, estoque, fiscal e benefícios em uma única interface.

## Funcionalidades

| Módulo | Descrição |
|---|---|
| **Dashboard** | KPIs em tempo real: vendas, alertas de validade, PBM e status do caixa |
| **PDV rápido** | Venda com múltiplas formas de pagamento, integração com PBM e Farmácia Popular, atalhos de teclado (F2/F6/F9) |
| **Abertura de caixa** | Registro de fundo de troco, seleção de operador e caixa, visualização de status dos caixas ativos |
| **Fechamento de caixa** | Conferência por forma de pagamento, registro de sangrias e suprimentos, cálculo automático de diferença |
| **NF-e / Fiscal** | *(em desenvolvimento)* Emissão, contingência e conferência |
| **SNGPC** | *(em desenvolvimento)* Controle de psicotrópicos e envio à ANVISA |
| **PBM / Popular** | *(em desenvolvimento)* Validação de benefício e desconto automático |
| **WhatsApp** | *(em desenvolvimento)* Confirmação de pedidos e retenção de clientes |
| **Estoque** | *(em desenvolvimento)* Lotes, validade e reposição automática |

## Stack

| Camada | Tecnologia |
|---|---|
| UI | React 19 |
| Build | Vite 8 |
| Linguagem | TypeScript 6 (strict) |
| Estilo | Tailwind CSS v4 |
| Variantes | tailwind-variants (`tv()`) |
| Componentes headless | Base UI (`@base-ui/react`) |
| Roteamento | React Router v7 |
| Linting/Formatação | Biome |

## Arquitetura

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx     # Shell autenticado: sidebar + <Outlet />
│   │   └── Sidebar.tsx       # Navegação lateral com NavLink ativo
│   └── ui/                   # Design system reutilizável
│       ├── badge.tsx          # Badge de status (ativo/alerta/crítico/pendente/inativo)
│       ├── button.tsx         # Botão com variantes primary/secondary e intents
│       ├── checkbox.tsx       # Checkbox headless (Base UI)
│       ├── input.tsx          # Input composto: Input + Input.Label + Input.Field
│       ├── metric-card.tsx    # Card de KPI composto: MetricCard + .Label + .Value + .Trend
│       ├── select.tsx         # Select composto headless (Base UI)
│       ├── switch.tsx         # Switch headless (Base UI)
│       └── index.ts           # Barrel de exportações
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── PdvPage.tsx
│   ├── AberturaCaixaPage.tsx
│   ├── FechamentoCaixaPage.tsx
│   └── ComponentsPage.tsx    # Catálogo visual do design system (/components)
├── router.tsx                 # createBrowserRouter — todas as rotas
├── App.tsx
├── main.tsx
└── index.css                  # @theme Tailwind v4 com tokens de cor do design system
```

### Decisões de arquitetura

**Roteamento em dois níveis**
Rotas autenticadas são filhas de `AppLayout` (layout route com `<Outlet />`). `/login` é rota irmã fora do layout — sem sidebar.

**Estado via URL**
O estado do caixa (`aberto/fechado`) é comunicado via query param (`/pdv?caixaAberto=true`) entre páginas, sem necessidade de contexto global ou localStorage.

**Design system com composição**
Componentes com partes nomeadas (label, value, trend) usam o padrão `Object.assign` para expor sub-componentes via namespace: `<MetricCard.Label>`, `<Input.Field>` etc. Variantes são definidas exclusivamente via `tv()` da `tailwind-variants`.

**Headless UI com Base UI**
Switch, Checkbox e Select usam `@base-ui/react` como primitivo — comportamento acessível out-of-the-box, estilo 100% Tailwind via `data-attributes`.

## Como rodar

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Verificar qualidade de código
npm run check
```

## Convenções de código

- **Sem default exports** — todos os componentes e funções usam named exports
- **Interfaces de props sempre exportadas** — permite referência de tipo sem duplicar
- **Sem twMerge direto** — merge de classes via `tv({ ..., className })` do tailwind-variants
- **Sem valores hex arbitrários** para cores do design system — usar tokens de `src/index.css`
- **Biome** enforça ordenação de classes, import types e regras de acessibilidade automaticamente
