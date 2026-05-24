import type { HTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes } from 'react'
import { tv } from 'tailwind-variants'

const containerCls = tv({
  base: [
    'flex flex-col gap-2 rounded-[18px] border border-input-border bg-input-bg px-4 py-4',
    'transition-colors focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-700/20',
  ],
})

const labelCls = tv({ base: 'font-bold text-[12px] text-input-label leading-none' })

const fieldCls = tv({
  base: [
    'bg-transparent text-[14px] text-brand-900 outline-none',
    'placeholder:text-input-placeholder',
    'disabled:cursor-not-allowed disabled:opacity-40',
  ],
})

export interface InputRootProps extends HTMLAttributes<HTMLDivElement> {}
export interface InputLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}
export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {}

function InputRoot({ className, children, ...props }: InputRootProps) {
  return (
    <div {...props} className={containerCls({ className })}>
      {children}
    </div>
  )
}

function InputLabel({ className, children, ...props }: InputLabelProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: consumer provides htmlFor via props to connect label to Input.Field
    <label {...props} className={labelCls({ className })}>
      {children}
    </label>
  )
}

function InputField({ className, ...props }: InputFieldProps) {
  return <input {...props} className={fieldCls({ className })} />
}

export const Input = {
  Root: InputRoot,
  Label: InputLabel,
  Field: InputField,
}
