import React from 'react'
import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none'

    const sizeStyles = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-sm px-3.5 py-2 gap-2',
      lg: 'text-base px-4 py-2.5 gap-2.5',
    }

    const variantStyles = {
      primary:
        'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm focus:ring-indigo-500',
      secondary:
        'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 focus:ring-slate-400',
      outline:
        'border border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-700 focus:ring-indigo-500 bg-white',
      ghost:
        'text-slate-600 hover:bg-slate-100 active:bg-slate-200 hover:text-slate-900 focus:ring-slate-400',
      danger:
        'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm focus:ring-rose-500',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
