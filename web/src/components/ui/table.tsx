import type { HTMLAttributes, ReactNode } from 'react'
import { tv } from 'tailwind-variants'

const headerCls = tv({
  base: 'grid items-center gap-3 rounded-[12px] bg-[#F5F8F6] px-3 py-2.5',
})

const rowCls = tv({
  base: 'grid items-center gap-3 rounded-[14px] bg-[#FBFCFB] px-3 py-2.5',
})

export interface TableHeaderProps {
  cols: string[]
  gridCols: string
  className?: string
}

export interface TableRowProps extends HTMLAttributes<HTMLDivElement> {
  gridCols: string
  children: ReactNode
}

function Header({ cols, gridCols, className }: TableHeaderProps) {
  return (
    <div className={headerCls({ className: [gridCols, className].filter(Boolean).join(' ') })}>
      {cols.map((col) => (
        <span key={col} className="font-bold text-[11px] text-brand-muted">
          {col}
        </span>
      ))}
    </div>
  )
}

function Row({ gridCols, className, children, ...props }: TableRowProps) {
  return (
    <div
      {...props}
      className={rowCls({ className: [gridCols, className].filter(Boolean).join(' ') })}
    >
      {children}
    </div>
  )
}

export const Table = { Header, Row }
