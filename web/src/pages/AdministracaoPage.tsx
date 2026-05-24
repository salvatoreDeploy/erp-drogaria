import { useState } from 'react'
import { NovoUsuarioSchema, type UsuarioAdmin } from '../schemas/administracao'

// --- MOCK ---

const USUARIOS: UsuarioAdmin[] = [
  {
    id: '1',
    nome: 'Juliana Martins',
    email: 'juliana@farmacorp.com',
    perfil: 'admin',
    ativo: true,
    ultimo_acesso: '19/05 08:42',
    caixas_permitidos: ['cx1', 'cx2'],
    modulos_permitidos: ['*'],
  },
  {
    id: '2',
    nome: 'Rodrigo Alves',
    email: 'rodrigo@farmacorp.com',
    perfil: 'farmaceutico',
    ativo: true,
    ultimo_acesso: '19/05 10:15',
    caixas_permitidos: [],
    modulos_permitidos: ['sngpc', 'receita', 'pdv'],
  },
  {
    id: '3',
    nome: 'Carla Souza',
    email: 'carla@farmacorp.com',
    perfil: 'operador_caixa',
    ativo: true,
    ultimo_acesso: '19/05 09:30',
    caixas_permitidos: ['cx1'],
    modulos_permitidos: ['pdv', 'pbm'],
  },
  {
    id: '4',
    nome: 'Marcos Ferreira',
    email: 'marcos@farmacorp.com',
    perfil: 'operador_caixa',
    ativo: true,
    ultimo_acesso: '18/05 17:20',
    caixas_permitidos: ['cx2'],
    modulos_permitidos: ['pdv', 'pbm'],
  },
  {
    id: '5',
    nome: 'Ana Paula Ribeiro',
    email: 'ana@farmacorp.com',
    perfil: 'farmaceutico',
    ativo: false,
    ultimo_acesso: '10/05 14:00',
    caixas_permitidos: [],
    modulos_permitidos: ['sngpc', 'receita'],
  },
]

const AUDIT_ENTRIES = [
  'Perfil fiscal atualizado — Rodrigo Alves · 19/05 10:12',
  'Integração SNGPC em retentativa — Sistema · 19/05 09:48',
  'Série fiscal ajustada (001 → 002) — Juliana Martins · 18/05 16:30',
  'Convite enviado para marcos@farmacorp.com — Juliana Martins · 18/05 14:10',
  'Permissão de módulo SNGPC concedida a Rodrigo — Juliana Martins · 17/05 11:45',
]

const PERFIL_CFG: Record<UsuarioAdmin['perfil'], { label: string; bg: string; text: string }> = {
  admin: { label: 'Admin', bg: 'bg-[#E1F5EE]', text: 'text-[#085041]' },
  farmaceutico: { label: 'Farmacêutico', bg: 'bg-[#E8EEF2]', text: 'text-[#3A4F5E]' },
  operador_caixa: { label: 'Caixa', bg: 'bg-[#F0EDE8]', text: 'text-[#7A5212]' },
}

// --- MODAL USUARIOS ---

function ModalUsuarios({ onClose }: { onClose: () => void }) {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>(USUARIOS)
  const [novoOpen, setNovoOpen] = useState(false)
  const [formNovo, setFormNovo] = useState({
    nome: '',
    email: '',
    perfil: 'operador_caixa',
    senha: '',
    confirmar_senha: '',
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  function handleToggleAtivo(id: string) {
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, ativo: !u.ativo } : u)))
  }

  function handleSalvarNovo() {
    const result = NovoUsuarioSchema.safeParse({
      ...formNovo,
      ativo: true,
      caixas_permitidos: [],
      modulos_permitidos: [],
    })
    if (!result.success) {
      const fe = result.error.flatten().fieldErrors
      setErrors(Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v ?? []])))
      return
    }
    const novo: UsuarioAdmin = {
      id: crypto.randomUUID(),
      nome: formNovo.nome,
      email: formNovo.email,
      perfil: formNovo.perfil as UsuarioAdmin['perfil'],
      ativo: true,
      caixas_permitidos: [],
      modulos_permitidos: [],
    }
    setUsuarios((prev) => [novo, ...prev])
    setNovoOpen(false)
    setFormNovo({ nome: '', email: '', perfil: 'operador_caixa', senha: '', confirmar_senha: '' })
    setErrors({})
    // TODO: integrar com API — POST /api/v1/administracao/usuarios
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-950/30"
        aria-label="Fechar"
      />
      <div className="relative z-10 flex max-h-[85vh] w-[720px] flex-col overflow-hidden rounded-[28px] bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-[#E6ECE8] border-b px-7 py-5">
          <div>
            <p className="font-bold text-[#12352B] text-[18px]">Gestão de usuários</p>
            <p className="text-[#5A6B66] text-[12px]">RBAC, convite, reset de senha e status</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setNovoOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-[12px] bg-[#0E4D3B] px-3.5 font-bold text-[12px] text-white hover:bg-[#0a3d2f]"
            >
              + Novo usuário
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-[13px] text-brand-600 hover:bg-brand-100"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Formulário novo usuário */}
        {novoOpen && (
          <div className="border-[#E6ECE8] border-b bg-[#F8FBF9] px-7 py-5">
            <p className="mb-4 font-bold text-[#12352B] text-[14px]">Novo usuário</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5 rounded-[14px] border border-input-border bg-white p-3.5">
                <label htmlFor="u-nome" className="font-bold text-[11px] text-input-label">
                  Nome completo
                </label>
                <input
                  id="u-nome"
                  type="text"
                  value={formNovo.nome}
                  onChange={(e) => setFormNovo((f) => ({ ...f, nome: e.target.value }))}
                  className="bg-transparent text-[13px] text-brand-950 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5 rounded-[14px] border border-input-border bg-white p-3.5">
                <label htmlFor="u-email" className="font-bold text-[11px] text-input-label">
                  E-mail
                </label>
                <input
                  id="u-email"
                  type="email"
                  value={formNovo.email}
                  onChange={(e) => setFormNovo((f) => ({ ...f, email: e.target.value }))}
                  className="bg-transparent text-[13px] text-brand-950 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5 rounded-[14px] border border-input-border bg-white p-3.5">
                <label htmlFor="u-senha" className="font-bold text-[11px] text-input-label">
                  Senha
                </label>
                <input
                  id="u-senha"
                  type="password"
                  value={formNovo.senha}
                  onChange={(e) => setFormNovo((f) => ({ ...f, senha: e.target.value }))}
                  className="bg-transparent text-[13px] text-brand-950 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5 rounded-[14px] border border-input-border bg-white p-3.5">
                <label htmlFor="u-conf" className="font-bold text-[11px] text-input-label">
                  Confirmar senha
                </label>
                <input
                  id="u-conf"
                  type="password"
                  value={formNovo.confirmar_senha}
                  onChange={(e) => setFormNovo((f) => ({ ...f, confirmar_senha: e.target.value }))}
                  className="bg-transparent text-[13px] text-brand-950 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5 rounded-[14px] border border-input-border bg-white p-3.5">
                <label htmlFor="u-perfil" className="font-bold text-[11px] text-input-label">
                  Perfil
                </label>
                <select
                  id="u-perfil"
                  value={formNovo.perfil}
                  onChange={(e) => setFormNovo((f) => ({ ...f, perfil: e.target.value }))}
                  className="bg-transparent text-[13px] text-brand-950 outline-none"
                >
                  <option value="operador_caixa">Operador de caixa</option>
                  <option value="farmaceutico">Farmacêutico</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            {Object.entries(errors).map(
              ([k, msgs]) =>
                msgs[0] && (
                  <p key={k} className="mt-1 text-[11px] text-danger-600">
                    {msgs[0]}
                  </p>
                )
            )}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setNovoOpen(false)
                  setErrors({})
                }}
                className="flex h-8 flex-1 items-center justify-center rounded-[12px] border border-[#D7E4DD] font-bold text-[#566A63] text-[12px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSalvarNovo}
                className="flex h-8 flex-1 items-center justify-center rounded-[12px] bg-[#0E4D3B] font-bold text-[12px] text-white"
              >
                Criar usuário
              </button>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="flex-1 overflow-y-auto px-7 py-5">
          <div className="mb-2 grid grid-cols-[1fr_160px_96px_80px] rounded-[12px] bg-[#F5F8F6] px-3 py-2">
            {['Usuário', 'E-mail', 'Perfil', 'Status'].map((h) => (
              <span key={h} className="font-bold text-[#566A63] text-[11px]">
                {h}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            {usuarios.map((u) => {
              const cfg = PERFIL_CFG[u.perfil]
              return (
                <div
                  key={u.id}
                  className="grid grid-cols-[1fr_160px_96px_80px] items-center rounded-[14px] bg-[#FBFCFB] px-3 py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-[#12352B] text-[13px]">{u.nome}</span>
                    {u.ultimo_acesso && (
                      <span className="text-[#8A9892] text-[10px]">
                        último acesso: {u.ultimo_acesso}
                      </span>
                    )}
                  </div>
                  <span className="truncate text-[#5A6B66] text-[12px]">{u.email}</span>
                  <span
                    className={`w-fit rounded-full px-2.5 py-0.5 font-bold text-[10px] ${cfg.bg} ${cfg.text}`}
                  >
                    {cfg.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleAtivo(u.id)}
                    className={`w-fit rounded-full px-2.5 py-0.5 font-bold text-[10px] transition-colors ${u.ativo ? 'bg-[#E1F5EE] text-[#085041]' : 'bg-[#F0F4F2] text-[#566A63]'}`}
                  >
                    {u.ativo ? '● Ativo' : '○ Inativo'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
        {/* TODO: integrar com API — GET /api/v1/administracao/usuarios */}
      </div>
    </div>
  )
}

// --- TILE COMPONENT ---

function ModuleTile({
  titulo,
  desc,
  onClick,
}: {
  titulo: string
  desc: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-1 rounded-[14px] border border-[#E6ECE8] bg-[#F8FBF9] p-3 text-left transition-colors hover:border-[#C3DDD1] hover:bg-[#EEF7F2]"
    >
      <span className="font-bold text-[#12352B] text-[14px]">{titulo}</span>
      <span className="text-[#5A6B66] text-[12px]">{desc}</span>
    </button>
  )
}

// --- PAGE ---

type AbaAdmin = 'operacional' | 'plataforma'

export function AdministracaoPage() {
  const [aba, setAba] = useState<AbaAdmin>('operacional')
  const [modalUsuariosOpen, setModalUsuariosOpen] = useState(false)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between rounded-[24px] border border-[#DCE7E1] bg-white px-6 py-5">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-[#12352B] text-[30px]">
            {aba === 'operacional' ? 'Administração do ERP' : 'Administração da Plataforma'}
          </h1>
          <p className="text-[#5A6B66] text-[14px]">
            {aba === 'operacional'
              ? 'Configurações operacionais da farmácia, usuários, permissões e integrações em um único ponto seguro.'
              : 'Configurações de desenvolvimento, ambientes, flags, jobs e observabilidade da plataforma.'}
          </p>
        </div>
        {/* Tab switcher */}
        <div className="flex items-center gap-1 rounded-[14px] border border-[#D9E5DE] bg-[#F4F8F4] p-1">
          {(
            [
              ['operacional', 'Operacional'],
              ['plataforma', 'Plataforma'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setAba(id)}
              className={[
                'rounded-[10px] px-4 py-1.5 font-bold text-[13px] transition-colors',
                aba === id
                  ? 'bg-white text-[#12352B] shadow-sm'
                  : 'text-[#566A63] hover:text-[#12352B]',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {aba === 'operacional' ? (
          <>
            <div className="flex flex-col gap-1 rounded-[16px] border border-[#D9E5DE] bg-white p-[14px]">
              <span className="font-bold text-[#12352B] text-[16px]">Tenants e filiais</span>
              <span className="text-[#5A6B66] text-[12px]">2 empresas / 5 unidades ativas</span>
            </div>
            <div className="flex flex-col gap-1 rounded-[16px] border border-[#D9E5DE] bg-white p-[14px]">
              <span className="font-bold text-[#12352B] text-[16px]">Perfis RBAC</span>
              <span className="text-[#5A6B66] text-[12px]">4 perfis / 18 abilities</span>
            </div>
            <div className="flex flex-col gap-1 rounded-[16px] border border-[#F4D29C] bg-[#FFF7E8] p-[14px]">
              <span className="font-bold text-[#7A5212] text-[16px]">Pendências críticas</span>
              <span className="text-[#7A5212] text-[12px]">
                3 ações exigem revisão / autorização
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1 rounded-[16px] border border-[#D9E5DE] bg-white p-[14px]">
              <span className="font-bold text-[#12352B] text-[16px]">Ambientes</span>
              <span className="text-[#5A6B66] text-[12px]">dev, staging e produção</span>
            </div>
            <div className="flex flex-col gap-1 rounded-[16px] border border-[#D9E5DE] bg-white p-[14px]">
              <span className="font-bold text-[#12352B] text-[16px]">Feature flags</span>
              <span className="text-[#5A6B66] text-[12px]">12 flags / 4 ativas</span>
            </div>
            <div className="flex flex-col gap-1 rounded-[16px] border border-[#F4D29C] bg-[#FFF7E8] p-[14px]">
              <span className="font-bold text-[#7A5212] text-[16px]">Saúde da plataforma</span>
              <span className="text-[#7A5212] text-[12px]">2 jobs com retentativa / 1 alerta</span>
            </div>
          </>
        )}
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 gap-4">
        {/* Left — fill */}
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex min-h-0 flex-1 flex-col gap-4 rounded-[18px] border border-[#D9E5DE] bg-white p-[18px]">
            <p className="font-bold text-[#12352B] text-[18px]">
              {aba === 'operacional' ? 'Configurações operacionais' : 'Controles de plataforma'}
            </p>

            {aba === 'operacional' ? (
              <div className="flex flex-col gap-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <ModuleTile
                    titulo="Usuários / Perfis"
                    desc="RBAC, convite, reset e status"
                    onClick={() => setModalUsuariosOpen(true)}
                  />
                  <ModuleTile titulo="Integrações" desc="SEFAZ, PBM e SNGPC" />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <ModuleTile titulo="Fiscal / Parâmetros" desc="Série, CFOP, impostos e rotina" />
                  <ModuleTile titulo="Auditoria / Logs" desc="Histórico, ações e rastreio" />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <ModuleTile titulo="SNGPC / filas" desc="Pendente, retentativa e status" />
                  <ModuleTile titulo="Padrões globais" desc="Defaults, feature flags e limites" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <ModuleTile titulo="Ambientes" desc="Chaves, URLs, variáveis e health" />
                  <ModuleTile
                    titulo="Feature flags"
                    desc="Release progressivo e controle de acesso"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <ModuleTile titulo="Jobs e filas" desc="Retentativas, DLQ e status" />
                  <ModuleTile titulo="Webhooks" desc="Eventos externos e integrações" />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <ModuleTile titulo="Policies CASL" desc="Contrato de abilities da plataforma" />
                  <ModuleTile titulo="Versionamento" desc="Configuração, rollback e publicação" />
                </div>
              </div>
            )}

            {/* Dica de acesso rápido */}
            <div className="mt-auto flex items-center justify-between rounded-[14px] bg-[#F4F8F4] px-4 py-3">
              <span className="text-[#5A6B66] text-[12px]">
                {aba === 'operacional'
                  ? '💡 Clique em "Usuários / Perfis" para gerenciar operadores'
                  : '💡 Alterações na plataforma exigem auditoria completa e rollback planejado'}
              </span>
            </div>
          </div>
        </div>

        {/* Right — 360px */}
        <div className="flex w-[360px] shrink-0 flex-col gap-4">
          {/* Audit / Observability */}
          <div className="flex flex-col gap-3 rounded-[18px] border border-[#D9E5DE] bg-white p-[18px]">
            <p className="font-bold text-[#12352B] text-[18px]">
              {aba === 'operacional' ? 'Últimas alterações' : 'Observabilidade'}
            </p>
            {aba === 'operacional' ? (
              <div className="flex flex-col gap-2">
                {AUDIT_ENTRIES.map((entry) => (
                  <div key={entry} className="flex gap-2 rounded-[12px] bg-[#F8FBF9] px-3 py-2.5">
                    <span className="mt-0.5 shrink-0 text-[#0E4D3B] text-[10px]">•</span>
                    <span className="text-[#5A6B66] text-[12px] leading-snug">{entry}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-[#5A6B66] text-[13px] leading-snug">
                  Logs, tracing, métricas, health checks e fila de eventos com status claro.
                </p>
                {[
                  { label: 'API Gateway', status: 'online', latency: '48ms' },
                  { label: 'Bull queues', status: 'warning', latency: '—' },
                  { label: 'PostgreSQL', status: 'online', latency: '12ms' },
                  { label: 'SEFAZ bridge', status: 'online', latency: '210ms' },
                  { label: 'SNGPC bridge', status: 'warning', latency: '—' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between rounded-[12px] bg-[#F8FBF9] px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${s.status === 'online' ? 'bg-[#0E4D3B]' : 'bg-[#D97706]'}`}
                      />
                      <span className="text-[#12352B] text-[12px]">{s.label}</span>
                    </div>
                    <span className="text-[#8A9892] text-[11px]">{s.latency}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Critical alert */}
          <div className="flex flex-col gap-3 rounded-[18px] border border-[#E8B1A7] bg-[#FFF2EF] p-[18px]">
            <p className="font-bold text-[#9B3D2E] text-[16px]">
              {aba === 'operacional' ? 'Ação crítica pendente' : 'Acesso restrito'}
            </p>
            <p className="text-[#9B3D2E] text-[13px] leading-snug">
              {aba === 'operacional'
                ? 'Alterar permissões globais e parâmetros fiscais exige confirmação, motivo e auditoria completa.'
                : 'Somente super-admin e suporte interno devem editar parâmetros de plataforma.'}
            </p>
            <p className="font-bold text-[#9B3D2E] text-[12px]">
              {aba === 'operacional'
                ? 'Próximo passo: revisar RBAC antes de publicar alterações.'
                : 'Toda alteração deve ter auditoria e rollback.'}
            </p>
          </div>
        </div>
      </div>

      {modalUsuariosOpen && <ModalUsuarios onClose={() => setModalUsuariosOpen(false)} />}
    </div>
  )
}
