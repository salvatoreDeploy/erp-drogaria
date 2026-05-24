import type { HTMLAttributes } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const root = tv({
  base: 'flex flex-col gap-1 rounded-[18px] border border-brand-100 p-3',
  variants: {
    intent: {
      normal: 'bg-white',
      destaque: 'border-l-[3px] border-l-brand-700 bg-brand-25',
      alerta: 'border-l-[3px] border-l-warning-600 bg-warning-25',
      critico: 'border-l-[3px] border-l-danger-500 bg-danger-25',
    },
  },
  defaultVariants: { intent: 'normal' },
})

const labelCls = tv({ base: 'font-medium text-[12px] text-brand-muted leading-none' })
const valueCls = tv({ base: 'font-bold text-[22px] text-brand-950 leading-none' })
const trendCls = tv({ base: 'font-medium text-[11px] text-brand-muted leading-none' })

type MetricCardVariants = VariantProps<typeof root>

export interface MetricCardRootProps extends HTMLAttributes<HTMLDivElement>, MetricCardVariants {}
export interface MetricCardLabelProps extends HTMLAttributes<HTMLSpanElement> {}
export interface MetricCardValueProps extends HTMLAttributes<HTMLSpanElement> {}
export interface MetricCardTrendProps extends HTMLAttributes<HTMLSpanElement> {}

function MetricCardRoot({ intent, className, children, ...props }: MetricCardRootProps) {
  return (
    <div {...props} className={root({ intent, className })}>
      {children}
    </div>
  )
}

function MetricCardLabel({ className, children, ...props }: MetricCardLabelProps) {
  return (
    <span {...props} className={labelCls({ className })}>
      {children}
    </span>
  )
}

function MetricCardValue({ className, children, ...props }: MetricCardValueProps) {
  return (
    <span {...props} className={valueCls({ className })}>
      {children}
    </span>
  )
}

function MetricCardTrend({ className, children, ...props }: MetricCardTrendProps) {
  return (
    <span {...props} className={trendCls({ className })}>
      {children}
    </span>
  )
}

export const MetricCard = {
  Root: MetricCardRoot,
  Label: MetricCardLabel,
  Value: MetricCardValue,
  Trend: MetricCardTrend,
}
