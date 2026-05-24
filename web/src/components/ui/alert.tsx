import type { HTMLAttributes } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const alertCls = tv({
  base: 'flex items-start gap-3 rounded-[16px] border px-4 py-3 text-[12px] leading-relaxed',
  variants: {
    intent: {
      danger: 'border-danger-100 bg-danger-50 text-danger-700',
      warning: 'border-warning-100 bg-warning-50 text-warning-800',
      info: 'border-info-100 bg-info-50 text-info-700',
      success: 'border-brand-100 bg-brand-25 text-success-600',
    },
  },
  defaultVariants: { intent: 'info' },
})

type AlertVariants = VariantProps<typeof alertCls>

export interface AlertProps extends HTMLAttributes<HTMLDivElement>, AlertVariants {}

export function Alert({ intent, className, children, ...props }: AlertProps) {
  return (
    <div {...props} className={alertCls({ intent, className })}>
      {children}
    </div>
  )
}
