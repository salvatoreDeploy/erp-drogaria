---
name: pencil-sync
description: Lê o frame da tela no arquivo Pencil (.pen) e extrai tokens de design para implementar ou ajustar uma página com fidelidade ao design. Use antes de criar ou refatorar qualquer página.
arguments: [tela]
argument-hint: "<nome-da-tela-no-Pencil (ex: Financeiro, Estoque, PDV)>"
allowed-tools: Read, Edit, mcp__pencil__get_editor_state, mcp__pencil__batch_get, mcp__pencil__get_screenshot
---

Extraia os tokens de design da tela `$tela` no arquivo Pencil e aplique no `.tsx` correspondente.

## Passo a passo

### 1. Identificar o frame

```
mcp__pencil__get_editor_state
```

Procure pelo frame com nome `$tela` (ou nome aproximado) na lista de frames. Anote o **frame ID** e os **IDs dos nós filhos** relevantes (colunas, cards, tabelas, métricas).

### 2. Extrair tokens dos nós

```
mcp__pencil__batch_get [ids dos nós relevantes]
```

Para cada nó, extraia:

| Propriedade Pencil | Aplicação Tailwind |
|---|---|
| `fill: #RRGGBB` | `bg-[#RRGGBB]` ou token brand se tiver equivalente |
| `cornerRadius: N` | `rounded-[Npx]` |
| `fontSize: N` | `text-[Npx]` |
| `fontWeight: bold` | `font-bold` |
| `width: N` | `w-[Npx]` ou `w-N` se múltiplo de 4 |
| `height: N` | `h-[Npx]` ou `h-N` se múltiplo de 4 |
| `padding: N` | `p-N` (converter px → unidades Tailwind: px/4) |
| `gap: N` | `gap-N` |
| `borderColor: #RRGGBB` | `border-[#RRGGBB]` ou token brand |

**Mapeamentos de tokens conhecidos:**
- `#163126` → `text-brand-950`
- `#0F7A4D` → `text-success-600`
- `#5C736A` → `text-text-secondary`
- `#F5F8F6` → `bg-[#F5F8F6]` (header de tabela — uso direto permitido)
- `#FBFCFB` → `bg-[#FBFCFB]` (row par — uso direto permitido)

### 3. Validar visualmente

```
mcp__pencil__get_screenshot [frame ID]
```

Compare o screenshot com a implementação atual. Anote:
- Diferenças de cor ou radius
- Elementos ausentes no código
- Proporções de colunas incorretas

### 4. Aplicar no `.tsx`

Edite `src/pages/[NomePage].tsx` substituindo:
- Classes hardcoded incorretas pelas extraídas do Pencil
- `rounded-3xl` por `rounded-[Npx]` quando o design especifica radius diferente
- Larguras de coluna por `w-[Npx]` exatos do design

**Regra de precedência:** quando o Pencil diverge de um padrão do `CLAUDE.md`, o **design Pencil tem precedência** para a tela em questão.

### 5. Verificar

```
npx biome check --write ./src && npx tsc -b
```

## Notas

- O arquivo de design está em `/C:/Users/Desktop/Documents/erp-drograria.pen`
- Cores brand do design system estão em `src/index.css` (`@theme`)
- Hex arbitrários permitidos apenas para tabelas (`#F5F8F6` e `#FBFCFB`) — demais cores devem usar token
- Se o Pencil MCP não estiver disponível, siga os padrões do `CLAUDE.md` sem alterações
