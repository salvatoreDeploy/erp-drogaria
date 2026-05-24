import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import { tv } from 'tailwind-variants'

const track = tv({
  base: [
    'relative flex h-6 w-11 cursor-pointer rounded-full p-[2px] transition-colors',
    'bg-brand-100 data-[checked]:bg-brand-700',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-40',
  ],
})

const thumb = tv({
  base: [
    'block aspect-square h-full rounded-full bg-white shadow-sm',
    'transition-transform duration-150 data-[checked]:translate-x-5',
  ],
})

export interface SwitchProps extends Omit<SwitchPrimitive.Root.Props, 'className'> {
  className?: string
}

export function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root className={track({ className })} {...props}>
      <SwitchPrimitive.Thumb className={thumb()} />
    </SwitchPrimitive.Root>
  )
}
