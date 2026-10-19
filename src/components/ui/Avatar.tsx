import React from 'react'
import { cn, getInitials } from '../../lib/utils'

export interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className }) => {
  const [imageError, setImageError] = React.useState(false)

  const sizeStyles = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm font-semibold',
  }

  // Gera uma cor de fundo pastel consistente a partir do nome
  const getBackgroundColor = (str?: string | null) => {
    if (!str) return 'bg-indigo-100 text-indigo-700'
    const colors = [
      'bg-indigo-100 text-indigo-700',
      'bg-violet-100 text-violet-700',
      'bg-emerald-100 text-emerald-700',
      'bg-amber-100 text-amber-700',
      'bg-rose-100 text-rose-700',
      'bg-cyan-100 text-cyan-700',
      'bg-blue-100 text-blue-700',
    ]
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        onError={() => setImageError(true)}
        className={cn(
          'rounded-full object-cover shrink-0 ring-2 ring-white select-none',
          sizeStyles[size],
          className
        )}
      />
    )
  }

  return (
    <div
      title={name || 'Usuário'}
      className={cn(
        'rounded-full flex items-center justify-center font-medium shrink-0 ring-2 ring-white select-none',
        sizeStyles[size],
        getBackgroundColor(name),
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
