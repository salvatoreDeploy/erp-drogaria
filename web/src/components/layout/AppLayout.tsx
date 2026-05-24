import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export interface AppLayoutProps {
  children?: ReactNode
}

export function AppLayout() {
  return (
    <div className="flex h-screen gap-5 overflow-hidden bg-linear-to-tl from-[#EEF4F2] to-[#F7FAF8] p-7">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col pt-2">
        <Outlet />
      </div>
    </div>
  )
}
