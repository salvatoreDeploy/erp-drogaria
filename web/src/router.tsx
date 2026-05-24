import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout'
import { AberturaCaixaPage } from './pages/AberturaCaixaPage'
import { AdministracaoPage } from './pages/AdministracaoPage'
import { AjusteEstoquePage } from './pages/AjusteEstoquePage'
import { CadastroClientesPage } from './pages/CadastroClientesPage'
import { CadastroFornecedoresPage } from './pages/CadastroFornecedoresPage'
import { CadastroProdutosPage } from './pages/CadastroProdutosPage'
import { ComponentsPage } from './pages/ComponentsPage'
import { DashboardPage } from './pages/DashboardPage'
import { EntradaNfePage } from './pages/EntradaNfePage'
import { EstoquePage } from './pages/EstoquePage'
import { FechamentoCaixaPage } from './pages/FechamentoCaixaPage'
import { FidelizacaoPage } from './pages/FidelizacaoPage'
import { FinalizarVendaPage } from './pages/FinalizarVendaPage'
import { FinanceiroPage } from './pages/FinanceiroPage'
import { FiscalPage } from './pages/FiscalPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PbmPage } from './pages/PbmPage'
import { PdvPage } from './pages/PdvPage'
import { PrecificadorPage } from './pages/PrecificadorPage'
import { ReceitaPage } from './pages/ReceitaPage'
import { RelatoriosPage } from './pages/RelatoriosPage'
import { SngpcPage } from './pages/SngpcPage'
import { WhatsAppPage } from './pages/WhatsAppPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/pdv', element: <PdvPage /> },
      { path: '/estoque', element: <EstoquePage /> },
      { path: '/estoque/ajuste', element: <AjusteEstoquePage /> },
      { path: '/pdv/abertura-caixa', element: <AberturaCaixaPage /> },
      { path: '/pdv/fechamento-caixa', element: <FechamentoCaixaPage /> },
      { path: '/pdv/finalizar', element: <FinalizarVendaPage /> },
      { path: '/fiscal', element: <FiscalPage /> },
      { path: '/fiscal/entrada-nfe', element: <EntradaNfePage /> },
      { path: '/pbm', element: <PbmPage /> },
      { path: '/receita', element: <ReceitaPage /> },
      { path: '/cadastros/produtos', element: <CadastroProdutosPage /> },
      { path: '/cadastros/clientes', element: <CadastroClientesPage /> },
      { path: '/cadastros/fornecedores', element: <CadastroFornecedoresPage /> },
      { path: '/sngpc', element: <SngpcPage /> },
      { path: '/financeiro', element: <FinanceiroPage /> },
      { path: '/relatorios', element: <RelatoriosPage /> },
      { path: '/whatsapp', element: <WhatsAppPage /> },
      { path: '/fidelizacao', element: <FidelizacaoPage /> },
      { path: '/precificador', element: <PrecificadorPage /> },
      { path: '/administracao', element: <AdministracaoPage /> },
      { path: '/components', element: <ComponentsPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
