---
modulo: administracao
rota: /administracao
pagina: AdministracaoPage
status: ⬜ Pendente
schema: src/schemas/auth.ts (já criado)
layout: wizard-4-abas
referencia: PbmPage.tsx (wizard com etapas) + CadastroFornecedoresPage.tsx (modal CRUD)
---

# Administração — Spec

## Propósito
Gestão de usuários, permissões, configurações da farmácia e logs de auditoria. Exclusivo para perfil `admin`.

## Layout — Wizard com 4 abas

```
┌──────────────────────────────────────────────┐
│ Header: título + tabs [Usuários|Permissões|  │
│         Farmácia|Certificado|Logs]           │
├──────────────────────────────────────────────┤
│                                              │
│  Conteúdo da aba ativa                       │
│                                              │
└──────────────────────────────────────────────┘
```

## Abas

### Aba 1 — Usuários
Lista de operadores (tabela padrão Cadastros) + `ModalOperadorForm` (CRUD):
- nome, email, perfil (select: admin/farmaceutico/operador_caixa), ativo

### Aba 2 — Permissões
Matriz de permissões por perfil:
- Linhas: módulos (PDV, Estoque, Fiscal, SNGPC, Cadastros...)
- Colunas: perfis (operador_caixa, farmaceutico, admin)
- Células: toggle de acesso

### Aba 3 — Farmácia
Formulário: nome fantasia, CNPJ, endereço, telefone, e-mail, logo (upload)

### Aba 4 — Certificado Digital
Status do certificado A1 (validade + CNPJ) + upload de novo .pfx

### Aba 5 — Logs de Auditoria
Tabela read-only: data | usuário | módulo | ação | descrição

## Schema

```ts
// src/schemas/auth.ts (já criado) — Operador, PerfilOperador, Sessao
// Adicionar se necessário:
export const AuditoriaLogSchema = z.object({
  id: z.string().uuid(),
  operador_nome: z.string(),
  modulo: z.string(),
  acao: z.string(),
  descricao: z.string(),
  hora: z.string().datetime(),
})
```

## API Endpoints

```ts
// TODO: GET/POST/PUT/DELETE /api/v1/administracao/operadores
// TODO: GET /api/v1/administracao/permissoes
// TODO: PUT /api/v1/administracao/permissoes
// TODO: GET/PUT /api/v1/administracao/farmacia
// TODO: POST /api/v1/administracao/certificado
// TODO: GET /api/v1/administracao/auditoria?page=
```
