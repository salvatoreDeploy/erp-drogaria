import type { HTMLAttributes } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const badge = tv({
  base: 'inline-flex h-6 items-center justify-center rounded-full px-[10px] font-semibold text-[12px]',
  variants: {
    intent: {
      ativo: 'bg-brand-75 text-brand-750',
      alerta: 'bg-warning-50 text-warning-900',
      critico: 'bg-danger-50 text-danger-900',
      pendente: 'bg-info-50 text-info-900',
      inativo: 'bg-neutral-100 text-neutral-500 opacity-70',
    },
  },
  defaultVariants: {
    intent: 'ativo',
  },
})

type BadgeVariants = VariantProps<typeof badge>

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, BadgeVariants {}

export function Badge({ intent, className, children, ...props }: BadgeProps) {
  return (
    <span {...props} className={badge({ intent, className })}>
      {children}
    </span>
  )
}
