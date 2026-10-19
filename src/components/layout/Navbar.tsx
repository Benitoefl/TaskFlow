import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Menu,
  LogOut,
  User,
  Radio,
  Share2,
  ChevronDown,
  Sun,
  Moon,
  Calendar,
  CheckSquare
} from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { Profile } from '../../types/database'
import { useTheme } from '../../contexts/ThemeContext'

export interface NavbarProps {
  onToggleSidebarMobile: () => void
  userProfile?: Profile | null
  boardTitle?: string
  isRealtimeConnected?: boolean
  onOpenShareModal?: () => void
  onSignOut: () => Promise<void>
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebarMobile,
  userProfile,
  boardTitle,
  isRealtimeConnected = true,
  onOpenShareModal,
  onSignOut,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 px-4 md:px-6 flex items-center justify-between z-10 transition-colors duration-200">
      {/* Left section: mobile hamburger + title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebarMobile}
          className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Abrir menu lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        {boardTitle ? (
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-slate-400 dark:text-slate-500 hidden sm:inline text-sm">Quadro:</span>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              {boardTitle}
            </h1>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-extrabold text-ccj-navy dark:text-white tracking-tight">
              Task<span className="text-ccj-red">Flow</span>
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ccj-navy/10 text-ccj-navy dark:bg-white/10 dark:text-slate-300 hidden sm:inline-block">
              Colégio Coração de Jesus
            </span>
          </div>
        )}
      </div>

      {/* Right section: theme toggle, realtime indicator, share button, user profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Alternar tema claro/escuro"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Realtime status badge */}
        <div
          title={isRealtimeConnected ? 'Conectado em tempo real ao Supabase' : 'Reconectando ao Realtime...'}
          className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200/80 dark:border-slate-700/80"
        >
          <Radio
            className={`w-3.5 h-3.5 ${
              isRealtimeConnected ? 'text-emerald-500 animate-pulse' : 'text-amber-500'
            }`}
          />
          <span className="font-medium text-[11px]">
            {isRealtimeConnected ? 'Tempo Real' : 'Reconectando'}
          </span>
        </div>

        {/* Share Button (when in board) */}
        {onOpenShareModal && (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Share2 className="w-3.5 h-3.5 text-ccj-red" />}
            onClick={onOpenShareModal}
            className="text-xs font-semibold dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
          >
            Compartilhar
          </Button>
        )}

        {/* User Profile Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            aria-label="Menu do usuário"
          >
            <Avatar
              name={userProfile?.display_name || userProfile?.email || 'Usuário'}
              src={userProfile?.avatar_url}
              size="sm"
            />
            <span className="hidden md:block text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
              {userProfile?.display_name || userProfile?.email?.split('@')[0] || 'Minha Conta'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-modal border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-sm">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-400 font-medium">Conectado como</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                  {userProfile?.display_name || 'Usuário'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userProfile?.email}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/my-tasks"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <CheckSquare className="w-4 h-4 text-slate-400" />
                  <span>Minhas Tarefas</span>
                </Link>

                <Link
                  to="/calendar"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Calendário</span>
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Configurações do Perfil</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    setDropdownOpen(false)
                    await onSignOut()
                    navigate('/login')
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left font-medium"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sair da conta</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
