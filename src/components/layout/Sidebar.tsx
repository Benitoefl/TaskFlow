import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  User,
  Plus,
  ChevronRight,
  X,
  Code2,
  Heart
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
      name: 'Minhas Tarefas',
      href: '/my-tasks',
      icon: CheckSquare,
      active: location.pathname === '/my-tasks',
    },
    {
      name: 'Calendário',
      href: '/calendar',
      icon: Calendar,
      active: location.pathname === '/calendar',
    },
    {
      name: 'Meu Perfil',
      href: '/profile',
      icon: User,
      active: location.pathname === '/profile',
    },
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64 select-none transition-colors duration-200">
      {/* Brand Header with CCJ Logo */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
        <Link to="/dashboard" className="flex items-center gap-3 group min-w-0">
          <img
            src="/logo-ccj.png"
            alt="Colégio Coração de Jesus"
            className="h-10 w-auto object-contain group-hover:scale-105 transition-transform shrink-0"
          />
          <div className="min-w-0">
            <span className="font-extrabold text-base text-ccj-navy dark:text-white tracking-tight flex items-center gap-1 truncate">
              Task<span className="text-ccj-red">Flow</span>
            </span>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase truncate">
              TI • Coração de Jesus
            </span>
          </div>
        </Link>
        <button
          onClick={onCloseMobile}
          className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          aria-label="Fechar navegação"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
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
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                    item.active
                      ? 'bg-ccj-navy text-white font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0',
                      item.active ? 'text-white' : 'text-slate-400 dark:text-slate-500'
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
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Quadros do Colégio
            </p>
            {onOpenCreateBoard && (
              <button
                type="button"
                onClick={onOpenCreateBoard}
                title="Criar novo quadro"
                className="text-slate-400 hover:text-ccj-red hover:bg-rose-50 dark:hover:bg-slate-800 p-1 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-1">
            {boards.length === 0 ? (
              <div className="px-3 py-3 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
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
                      'flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors group',
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: board.color || '#1b2d56' }}
                      />
                      <span className="truncate">{board.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Author & Institutional Credits Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
        <div className="px-3 py-2.5 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs shadow-subtle space-y-1">
          <div className="flex items-center gap-1.5 text-ccj-navy dark:text-indigo-400 font-bold">
            <Code2 className="w-3.5 h-3.5 text-ccj-red shrink-0" />
            <span className="truncate">TI • Benito Lopes</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 leading-tight">
            Colégio Coração de Jesus
            <Heart className="w-2.5 h-2.5 text-ccj-red fill-ccj-red shrink-0 inline" />
          </p>
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
