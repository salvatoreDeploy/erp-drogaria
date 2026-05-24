import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { tv } from 'tailwind-variants'

const root = tv({
  base: [
    'flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-[4px] border transition-colors',
    'border-brand-100 bg-white',
    'data-[checked]:border-brand-700 data-[checked]:bg-brand-700',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-40',
  ],
})

export interface CheckboxProps extends Omit<CheckboxPrimitive.Root.Props, 'className'> {
  className?: string
}

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root className={root({ className })} {...props}>
      <CheckboxPrimitive.Indicator className="flex text-white data-[unchecked]:hidden">
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
      <path d="M9.16 1.12a.75.75 0 0 1 .22 1.04L5.14 8.66a.75.75 0 0 1-1.14.19L1.25 6.31a.75.75 0 1 1 1.01-1.11l2.1 1.91 3.76-5.77a.75.75 0 0 1 1.04-.22Z" />
    </svg>
  )
}
