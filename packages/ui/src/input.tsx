import * as React from 'react'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`
          flex h-10 w-full rounded-sm border border-slate-grey/50 bg-white px-3 py-2 text-sm text-command-navy ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-grey focus:outline-none focus:ring-2 focus:ring-forest-green focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
          ${className || ''}
        `}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
