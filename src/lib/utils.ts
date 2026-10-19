import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateBR(dateString?: string | null): string {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  } catch {
    return ''
  }
}

export function formatDateTimeBR(dateString?: string | null): string {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch {
    return ''
  }
}

export function getPriorityBadge(priority: 'low' | 'medium' | 'high') {
  switch (priority) {
    case 'high':
      return {
        label: 'Alta',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500'
      }
    case 'medium':
      return {
        label: 'Média',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500'
      }
    case 'low':
    default:
      return {
        label: 'Baixa',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500'
      }
  }
}

export function getInitials(name?: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
