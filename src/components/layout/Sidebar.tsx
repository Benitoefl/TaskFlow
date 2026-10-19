import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  KanbanSquare,
  LayoutDashboard,
  User,
  Plus,
  ChevronRight,
  X,
  Sparkles
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Board } from '../../types/database'

export interface SidebarProps {
  boards?: Board[]
  isOpenMobile: boolean
  onCloseMobile: () => void
  onOpenCreateBoard?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  boards = [],
  isOpenMobile,
  onCloseMobile,
  onOpenCreateBoard,
}) => {
  const location = useLocation()

  const navLinks = [
    {
      name: 'Painel de Quadros',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: location.pathname === '/dashboard',
    },
    {
      name: 'Meu Perfil',
      href: '/profile',
      icon: User,
      active: location.pathname === '/profile',
    },
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            <KanbanSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1">
              Task<span className="text-indigo-600">Flow</span>
            </span>
            <span className="block text-[10px] text-slate-400 font-medium -mt-1 tracking-wider uppercase">
              Colaborativo
            </span>
          </div>
        </Link>
        <button
          onClick={onCloseMobile}
          className="md:hidden text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          aria-label="Fechar navegação"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Navegação
          </p>
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    item.active
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0',
                      item.active ? 'text-indigo-600' : 'text-slate-400'
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Boards List Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Seus Quadros
            </p>
            {onOpenCreateBoard && (
              <button
                type="button"
                onClick={onOpenCreateBoard}
                title="Criar novo quadro"
                className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-1">
            {boards.length === 0 ? (
              <div className="px-3 py-3 text-xs text-slate-400 bg-slate-50/60 rounded-lg text-center">
                Nenhum quadro ainda
              </div>
            ) : (
              boards.map((board) => {
                const isActive = location.pathname === `/board/${board.id}`
                return (
                  <Link
                    key={board.id}
                    to={`/board/${board.id}`}
                    onClick={onCloseMobile}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: board.color || '#6366f1' }}
                      />
                      <span className="truncate">{board.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Free Plan Badge Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200/70 text-xs text-slate-600 shadow-subtle">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="min-w-0">
            <span className="font-semibold text-slate-800 block truncate">100% Gratuito</span>
            <span className="text-[11px] text-slate-500 truncate block">Supabase Free & Cloud</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 max-w-full flex z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
