import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Menu,
  LogOut,
  User,
  Radio,
  Share2,
  ChevronDown
} from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { Profile } from '../../types/database'

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
    <header className="h-16 bg-white border-b border-slate-200 shrink-0 px-4 md:px-6 flex items-center justify-between z-10">
      {/* Left section: mobile hamburger + title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebarMobile}
          className="md:hidden text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Abrir menu lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        {boardTitle ? (
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-slate-400 hidden sm:inline text-sm">Quadro:</span>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 truncate">
              {boardTitle}
            </h1>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-800">TaskFlow</h1>
          </div>
        )}
      </div>

      {/* Right section: realtime indicator, share button, user profile */}
      <div className="flex items-center gap-3">
        {/* Realtime status badge */}
        <div
          title={isRealtimeConnected ? 'Conectado em tempo real ao Supabase' : 'Reconectando ao Realtime...'}
          className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/80"
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
            leftIcon={<Share2 className="w-3.5 h-3.5 text-indigo-600" />}
            onClick={onOpenShareModal}
            className="text-xs font-semibold"
          >
            Compartilhar
          </Button>
        )}

        {/* User Profile Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="Menu do usuário"
          >
            <Avatar
              name={userProfile?.display_name || userProfile?.email || 'Usuário'}
              src={userProfile?.avatar_url}
              size="sm"
            />
            <span className="hidden md:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
              {userProfile?.display_name || userProfile?.email?.split('@')[0] || 'Minha Conta'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-modal border border-slate-200 py-1.5 z-50 text-sm">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs text-slate-400 font-medium">Conectado como</p>
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {userProfile?.display_name || 'Usuário'}
                </p>
                <p className="text-xs text-slate-500 truncate">{userProfile?.email}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Configurações do Perfil</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    setDropdownOpen(false)
                    await onSignOut()
                    navigate('/login')
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left"
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
