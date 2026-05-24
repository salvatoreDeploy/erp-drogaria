import { Select as SelectPrimitive } from '@base-ui/react/select'
import type { ReactNode } from 'react'
import { tv } from 'tailwind-variants'

/* ─── estilos ─────────────────────────────────────────────────────── */

const trigger = tv({
  base: [
    'inline-flex h-10 min-w-40 cursor-default items-center justify-between gap-3 rounded-[6px]',
    'select-none border border-brand-100 bg-white px-3 text-[13px] text-brand-900',
    'transition-colors hover:bg-brand-50 data-[popup-open]:bg-brand-50',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-40',
    'not-[[data-filled]]:text-brand-muted',
  ],
})

const popup = tv({
  base: [
    'z-50 min-w-[var(--anchor-width)] rounded-[8px] border border-brand-100 bg-white py-1 shadow-lg',
    'origin-[var(--transform-origin)] transition-[transform,scale,opacity]',
    'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
    'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
  ],
})

const selectItem = tv({
  base: [
    'grid cursor-default grid-cols-[16px_1fr] items-center gap-2 px-3 py-2',
    'select-none text-[13px] text-brand-900 outline-none',
    'data-[highlighted]:bg-brand-50 data-[highlighted]:text-brand-900',
    'data-[disabled]:opacity-40',
  ],
})

/* ─── SelectRoot ──────────────────────────────────────────────────── */

export type SelectRootProps<T> = SelectPrimitive.Root.Props<T>

export function SelectRoot<T>(props: SelectRootProps<T>) {
  return <SelectPrimitive.Root {...props} />
}

/* ─── SelectTrigger ───────────────────────────────────────────────── */

export interface SelectTriggerProps extends Omit<SelectPrimitive.Trigger.Props, 'className'> {
  className?: string
  placeholder?: string
}

export function SelectTrigger({ placeholder, className, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger className={trigger({ className })} {...props}>
      <SelectPrimitive.Value placeholder={placeholder ?? 'Selecione...'} />
      <SelectPrimitive.Icon className="flex shrink-0 text-brand-muted">
        <ChevronDownIcon />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

/* ─── SelectList ──────────────────────────────────────────────────── */

export interface SelectListProps {
  children: ReactNode
}

export function SelectList({ children }: SelectListProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner className="outline-none" sideOffset={4}>
        <SelectPrimitive.Popup className={popup()}>
          <SelectPrimitive.List className="max-h-60 overflow-auto p-1">
            {children}
          </SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

/* ─── SelectItem ──────────────────────────────────────────────────── */

export interface SelectItemProps extends Omit<SelectPrimitive.Item.Props, 'className'> {
  className?: string
  children: ReactNode
}

export function SelectItem({ children, className, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item className={selectItem({ className })} {...props}>
      <SelectPrimitive.ItemIndicator className="col-start-1 flex items-center text-brand-700">
        <CheckIcon />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText className="col-start-2">{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

/* ─── ícones internos ─────────────────────────────────────────────── */

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      <path d="M6 8.414 1.293 3.707l1.414-1.414L6 5.586l3.293-3.293 1.414 1.414z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
      <path d="M9.16 1.12a.75.75 0 0 1 .22 1.04L5.14 8.66a.75.75 0 0 1-1.14.19L1.25 6.31a.75.75 0 1 1 1.01-1.11l2.1 1.91 3.76-5.77a.75.75 0 0 1 1.04-.22Z" />
    </svg>
  )
}
