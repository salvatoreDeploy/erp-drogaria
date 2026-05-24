import { Link } from 'react-router-dom'
import { Button } from '../components/ui'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-50 p-6">
      <span className="font-bold text-[64px] text-brand-100 leading-none">404</span>
      <h1 className="font-bold text-[22px] text-brand-900">Página não encontrada</h1>
      <p className="text-[14px] text-brand-muted">O endereço que você acessou não existe.</p>
      <Link to="/login">
        <Button>Voltar para o login</Button>
      </Link>
    </div>
  )
}
