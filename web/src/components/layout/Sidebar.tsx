import { NavLink } from 'react-router-dom'

const navGroups = [
  {
    label: 'OPERAÇÃO',
    items: [
      { label: 'PDV', to: '/pdv' },
      { label: 'Estoque', to: '/estoque' },
      { label: 'NF-e / Fiscal', to: '/fiscal' },
      { label: 'PBM / Popular', to: '/pbm' },
      { label: 'Receita Digital', to: '/receita' },
    ],
  },
  {
    label: 'CLIENTES E MARKETING',
    items: [
      { label: 'WhatsApp / CRM', to: '/whatsapp' },
      { label: 'Fidelização', to: '/fidelizacao' },
      { label: 'Precificador', to: '/precificador' },
    ],
  },
  {
    label: 'GESTÃO',
    items: [
      { label: 'SNGPC', to: '/sngpc' },
      { label: 'Financeiro', to: '/financeiro' },
      { label: 'Relatórios', to: '/relatorios' },
      { label: 'Administração', to: '/administracao' },
    ],
  },
  {
    label: 'CADASTROS',
    items: [
      { label: 'Produtos', to: '/cadastros/produtos' },
      { label: 'Clientes', to: '/cadastros/clientes' },
      { label: 'Fornecedores', to: '/cadastros/fornecedores' },
    ],
  },
]

export function Sidebar() {
  return (
    <aside className="flex w-[260px] shrink-0 flex-col gap-6 self-stretch rounded-[28px] bg-brand-900 p-[28px_22px_22px]">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[#E7F6EF]">
          <CrossIcon />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-[18px] text-white leading-none">Farmacorp ERP</span>
          <span className="text-[#B8D8CF] text-[12px] leading-none">Painel operacional</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <div className="flex h-7 items-center">
              <span className="font-semibold text-[10px] text-brand-muted tracking-wider">
                {group.label}
              </span>
            </div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive
                    ? 'flex h-9 items-center border-success-600 border-l-2 bg-brand-75 pl-[14px] font-medium text-[13px] text-brand-750'
                    : 'flex h-9 items-center px-4 font-medium text-[#6F827A] text-[13px] hover:text-white/80'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Info card */}
      <div className="flex flex-col gap-2.5 rounded-[20px] bg-[#174A3F] p-4">
        <span className="font-bold text-[13px] text-white">SNGPC ativo</span>
        <span className="text-[#C7E5DB] text-[12px] leading-[1.4]">
          Controle de medicamentos controlados e rastreio de validade.
        </span>
      </div>
    </aside>
  )
}

function CrossIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="9" y="0" width="8" height="26" rx="3" fill="#0F3D32" />
      <rect x="0" y="9" width="26" height="8" rx="3" fill="#0F3D32" />
    </svg>
  )
}
