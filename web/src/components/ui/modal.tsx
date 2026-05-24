import type { HTMLAttributes, ReactNode } from 'react'
import { createContext, useContext } from 'react'

type ModalCtx = { onClose: () => void }
const ModalContext = createContext<ModalCtx | null>(null)

function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('Modal.* deve estar dentro de Modal.Root')
  return ctx
}

export interface ModalRootProps {
  onClose: () => void
  width?: string
  children: ReactNode
}

export interface ModalHeaderProps {
  title: string
  subtitle?: string
}

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {}

export interface ModalFooterProps {
  children: ReactNode
}

function Root({ onClose, width = 'w-[520px]', children }: ModalRootProps) {
  return (
    <ModalContext.Provider value={{ onClose }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute inset-0 cursor-default bg-brand-950/30"
          aria-label="Fechar modal"
        />
        <div
          className={`relative z-10 flex max-h-[90vh] flex-col overflow-hidden rounded-[28px] bg-white shadow-xl ${width}`}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  )
}

function Header({ title, subtitle }: ModalHeaderProps) {
  const { onClose } = useModal()
  return (
    <div className="flex shrink-0 items-center justify-between border-brand-100 border-b px-7 py-5">
      <div className="flex flex-col gap-0.5">
        <p className="font-bold text-[18px] text-brand-950">{title}</p>
        {subtitle && <p className="text-[12px] text-text-secondary">{subtitle}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-[13px] text-brand-600 hover:bg-brand-100"
        aria-label="Fechar modal"
      >
        ✕
      </button>
    </div>
  )
}

function Body({ children, className, ...props }: ModalBodyProps) {
  return (
    <div
      {...props}
      className={`flex-1 overflow-y-auto px-7 py-5${className ? ` ${className}` : ''}`}
    >
      {children}
    </div>
  )
}

function Footer({ children }: ModalFooterProps) {
  return <div className="flex shrink-0 gap-3 border-brand-100 border-t px-7 py-5">{children}</div>
}

export const Modal = { Root, Header, Body, Footer }
