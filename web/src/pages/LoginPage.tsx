import { useState } from 'react'
import { Button, Checkbox, Input } from '../components/ui'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: autenticação
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#F4F8F6] via-[#E9F3F0] to-[#EDF1F8] p-6">
      <div
        className="flex w-full max-w-280 overflow-hidden rounded-[36px] shadow-[0_24px_60px_0_#14341E26]"
        style={{ minHeight: 720 }}
      >
        {/* ── Painel esquerdo ──────────────────────────────── */}
        <aside className="flex w-110 shrink-0 flex-col gap-6 bg-linear-to-b from-brand-900 to-brand-700 p-[40px_36px_36px]">
          {/* Logo + nome */}
          <div className="flex items-center gap-3">
            <div className="flex size-13 shrink-0 items-center justify-center rounded-2xl bg-[#E8F7EF]">
              <CrossIcon />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-[22px] text-white leading-none">Farmacorp ERP</span>
              <span className="text-[#CBE7DD] text-[13px] leading-none">
                Gestão integrada para farmácias
              </span>
            </div>
          </div>

          {/* Hero */}
          <div className="flex flex-col gap-3">
            <h1 className="font-bold text-[34px] text-white leading-[1.15]">
              Controle estoque, vendas e prescrições em um só lugar.
            </h1>
            <p className="text-[#D6EEE7] text-[15px] leading-normal">
              Acompanhe lotes, validade, caixa e atendimento com uma rotina mais rápida e segura
              para sua equipe.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-3">
            <StatCard value="R$ 48.2k" label="Vendas hoje" />
            <StatCard value="1.240" label="Itens em estoque" />
          </div>

          {/* Trend decoration */}
          <div className="mt-auto flex flex-col gap-2 rounded-[18px] bg-[#0C4A3B] p-4">
            <div className="relative flex h-8 items-center gap-1 overflow-hidden">
              <Pill width={32} color="#4ADE80" />
              <Pill width={48} color="#34D399" />
              <Pill width={24} color="#6EE7B7" />
              <Pill width={56} color="#A7F3D0" />
              <Pill width={36} color="#4ADE80" />
            </div>
            <span className="text-[#BFE3D8] text-[12px] leading-[1.4]">
              Tendência de vendas — últimos 7 dias
            </span>
          </div>
        </aside>

        {/* ── Painel direito ────────────────────────────────── */}
        <main className="flex flex-1 flex-col justify-center gap-5.5 bg-white px-14 py-13">
          {/* Cabeçalho */}
          <div className="flex flex-col gap-2">
            <h2 className="font-bold text-[#163126] text-[30px] leading-none">Entrar no sistema</h2>
            <p className="text-[#5C736A] text-[14px] leading-[1.45]">
              Acesse sua conta para gerenciar sua farmácia com segurança.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input.Root>
              <Input.Label htmlFor="login-email">E-mail</Input.Label>
              <Input.Field
                id="login-email"
                type="email"
                placeholder="conta@farmacia.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Input.Root>

            <Input.Root>
              <Input.Label htmlFor="login-senha">Senha</Input.Label>
              <Input.Field
                id="login-senha"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Input.Root>

            {/* Lembrar + Esqueci */}
            <div className="flex items-center justify-between">
              {/* biome-ignore lint/a11y/noLabelWithoutControl: Base UI Checkbox renders a <button role="checkbox">, label wrapping is valid */}
              <label className="flex cursor-pointer items-center gap-2 text-[#5C736A] text-[13px]">
                <Checkbox checked={remember} onCheckedChange={setRemember} />
                Lembrar meu acesso
              </label>
              <button
                type="button"
                className="cursor-pointer font-bold text-[13px] text-brand-700 hover:underline"
              >
                Esqueci a senha
              </button>
            </div>

            <Button type="submit" className="mt-2 h-14 w-full rounded-[18px] text-[15px]">
              Acessar ERP
            </Button>
          </form>

          {/* Rodapé */}
          <p className="text-[#7A8F86] text-[12px] leading-[1.4]">
            Ao acessar, você concorda com os termos de uso e política de privacidade da Farmacorp.
          </p>
        </main>
      </div>
    </div>
  )
}

/* ── sub-componentes internos ──────────────────────────────────────── */

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-[18px] bg-[#174A3F] p-3.5">
      <span className="font-bold text-[24px] text-white leading-none">{value}</span>
      <span className="text-[#BFE3D8] text-[12px] leading-none">{label}</span>
    </div>
  )
}

function Pill({ width, color }: { width: number; color: string }) {
  return <div className="h-5 rounded-full opacity-80" style={{ width, backgroundColor: color }} />
}

function CrossIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <rect x="11" y="0" width="8" height="30" rx="4" fill="#0B5A46" />
      <rect x="0" y="11" width="30" height="8" rx="4" fill="#0B5A46" />
    </svg>
  )
}
