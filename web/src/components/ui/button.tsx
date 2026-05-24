import type { ButtonHTMLAttributes } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const button = tv({
  base: [
    'inline-flex items-center justify-center gap-2',
    'font-medium text-[13px] text-white',
    'cursor-pointer transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-40',
  ],
  variants: {
    variant: {
      primary: 'h-11 rounded-[4px] px-4',
      secondary:
        'rounded-[14px] border border-brand-100 bg-white px-4 py-3 font-bold text-brand-900 focus-visible:ring-brand-900',
    },
    intent: {
      default: '',
      success: '',
      warning: '',
      error: '',
    },
  },
  compoundVariants: [
    {
      variant: 'primary',
      intent: 'default',
      class: 'bg-brand-700 hover:bg-brand-800',
    },
    {
      variant: 'primary',
      intent: 'success',
      class: 'bg-brand-500 hover:bg-brand-600',
    },
    {
      variant: 'primary',
      intent: 'warning',
      class: 'bg-warning-600 hover:bg-warning-700',
    },
    {
      variant: 'primary',
      intent: 'error',
      class: 'bg-danger-500 hover:bg-danger-600',
    },
  ],
  defaultVariants: {
    variant: 'primary',
    intent: 'default',
  },
})

type ButtonVariants = VariantProps<typeof button>

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariants {
  loading?: boolean
}

export function Button({
  variant,
  intent,
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={button({ variant, intent, className })}
    >
      {loading && <ButtonSpinner />}
      {children}
    </button>
  )
}

function ButtonSpinner() {
  return (
    <span
      aria-hidden="true"
      className="block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
    />
  )
}
