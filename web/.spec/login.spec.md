---
modulo: login
rota: /login
pagina: LoginPage
status: ✅ Implementado (2026-05-10)
schema: src/schemas/auth.ts (tipos gerais)
layout: dois-paineis
referencia: —
---

# Login — Spec

## Propósito
Tela de autenticação — ponto de entrada do ERP. **Fora do AppLayout** (sem sidebar). Acesso público.

## Layout — Dois painéis lado a lado

```
┌──────────────────────────┬──────────────────────────┐
│  Painel esquerdo         │  Painel direito           │
│  w-110, bg-brand-900/700 │  flex-1, bg-white         │
│  gradiente brand         │                           │
│  ─────────────────────── │  "Entrar no sistema"      │
│  Logo + nome ERP         │  E-mail                   │
│  Hero text (34px)        │  Senha                    │
│  Subtítulo (15px)        │  Lembrar + Esqueci senha  │
│  2× StatCard             │  [Acessar ERP] button     │
│  Trend decoration        │  Termo de uso             │
└──────────────────────────┴──────────────────────────┘
```

Container: `max-w-280`, altura mínima 720px, `rounded-[36px]`, `shadow-[0_24px_60px_0_#14341E26]`.
Fundo da tela: `bg-linear-to-br from-[#F4F8F6] via-[#E9F3F0] to-[#EDF1F8]`.

## Schema
Nenhum schema dedicado ao login. Tipos gerais de sessão em `src/schemas/auth.ts` (`Operador`, `Sessao`, `PerfilOperador`).

## Sub-componentes Internos

```tsx
function StatCard({ value, label })  — card bg-[#174A3F], valor bold text-[24px] + label text-[12px]
function Pill({ width, color })       — barra decorativa de tendência de vendas
function CrossIcon()                  — ícone SVG de cruz (logotipo farmácia)
```

## Estado

```ts
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [remember, setRemember] = useState(false)
```

## Componentes UI Utilizados
`<Input.Root>`, `<Input.Label>`, `<Input.Field>`, `<Button>`, `<Checkbox>`

## Fluxo Principal

1. Usuário preenche e-mail + senha
2. `handleSubmit(e)` → `e.preventDefault()` → TODO: POST /api/v1/auth/login
3. Redirecionar para `/dashboard` ao autenticar

## API Endpoints

```ts
// TODO: POST /api/v1/auth/login  { email, senha } → { token, operador, perfil }
// TODO: POST /api/v1/auth/refresh — renovação de token
// TODO: POST /api/v1/auth/logout
```

## Arquivos Existentes

| Arquivo | Status |
|---|---|
| `src/pages/LoginPage.tsx` | ✅ Criado |
| `src/router.tsx` | ✅ Rota `/login` fora do AppLayout |

## Verificação

- [ ] Campos têm `id` + `htmlFor` correspondente (Biome `noLabelWithoutControl`)
- [ ] `type="email"` e `type="password"` nos campos corretos
- [ ] `<Button type="submit">` dentro de `<form onSubmit>`
- [ ] Fundo gradient correto sem token Tailwind (valores hex diretos permitidos)
- [ ] Painel esquerdo usa gradiente brand-900 → brand-700
