import React from 'react'
import { cn } from '../../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || generatedId

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border rounded-xl transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 text-slate-800 dark:text-slate-100',
              leftIcon ? 'pl-9' : 'pl-3',
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 text-rose-900 dark:text-rose-200'
                : 'border-slate-300 dark:border-slate-700 focus:border-ccj-navy dark:focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-950',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
