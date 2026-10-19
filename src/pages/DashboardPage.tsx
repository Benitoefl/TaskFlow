import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Board } from '../types/database'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { CreateBoardModal } from '../components/dashboard/CreateBoardModal'
import {
  Plus,
  KanbanSquare,
  Clock,
  ArrowRight,
  Sparkles,
  Layout,
  Calendar,
  CheckSquare
} from 'lucide-react'
import { formatDateBR } from '../lib/utils'

export const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth()
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const navigate = useNavigate()

  const loadBoards = async () => {
    if (!isSupabaseConfigured || !user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setBoards(data || [])
    } catch (err) {
      console.error('Erro ao carregar quadros:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBoards()
  }, [user])

  const handleCreateBoard = async (name: string, description?: string, color?: string) => {
    const { data: newBoardId, error } = await supabase.rpc('create_board_with_defaults', {
      p_name: name,
      p_description: description || null,
      p_color: color || '#1b2d56',
    })

    if (error) throw error

    await loadBoards()
    if (newBoardId) {
      navigate(`/board/${newBoardId}`)
    }
    return newBoardId
  }

  const userFirstName = (profile?.display_name || user?.email?.split('@')[0] || 'Usuário').split(' ')[0]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner CCJ Institutional */}
      <div className="bg-gradient-to-r from-ccj-navy via-ccj-navy-light to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Colégio Coração de Jesus • Gestão de Tarefas TI</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Olá, {userFirstName}! 👋
          </h1>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            Bem-vindo ao TaskFlow. Organize seus quadros de atividades, acompanhe prazos no calendário e colabore em tempo real com a equipe.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Link to="/my-tasks">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 transition-colors text-xs font-semibold text-white">
                <CheckSquare className="w-3.5 h-3.5" />
                Minhas Tarefas
              </span>
            </Link>
            <Link to="/calendar">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 transition-colors text-xs font-semibold text-white">
                <Calendar className="w-3.5 h-3.5" />
                Ver Calendário
              </span>
            </Link>
          </div>
        </div>

        <div className="z-10 shrink-0 flex flex-col sm:flex-row items-center gap-3">
          <Button
            size="lg"
            variant="primary"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<Plus className="w-5 h-5 text-white" />}
            className="w-full sm:w-auto bg-ccj-red hover:bg-ccj-red-light active:bg-ccj-red-dark text-white font-bold shadow-lg shadow-rose-950/40"
          >
            Novo Quadro
          </Button>
        </div>

        {/* Decorative heart watermark */}
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <img src="/logo-ccj.png" alt="CCJ" className="w-64 h-64 object-contain filter invert" />
        </div>
      </div>

      {/* Boards Section */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-ccj-navy dark:text-indigo-400" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Quadros do Colégio
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {boards.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : boards.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-subtle">
            <div className="w-14 h-14 bg-ccj-navy/10 dark:bg-ccj-navy/30 text-ccj-navy dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <KanbanSquare className="w-7 h-7 text-ccj-red" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Você ainda não tem quadros
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Crie seu primeiro quadro para começar a adicionar listas, cartões e convidar colegas do colégio.
            </p>
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={() => setIsCreateOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
                className="bg-ccj-navy hover:bg-ccj-navy-light text-white font-bold"
              >
                Criar Meu Primeiro Quadro
              </Button>
            </div>
          </div>
        ) : (
          /* Board Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {boards.map((board) => (
              <Link
                key={board.id}
                to={`/board/${board.id}`}
                className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-card hover:shadow-card-hover hover:border-ccj-red dark:hover:border-rose-500 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: board.color || '#1b2d56' }}
                    />
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDateBR(board.updated_at)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-ccj-red dark:group-hover:text-rose-400 transition-colors line-clamp-1">
                    {board.name}
                  </h3>

                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px]">
                    {board.description || 'Sem descrição definida.'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-ccj-navy dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Abrir quadro</span>
                  <ArrowRight className="w-4 h-4 text-ccj-red" />
                </div>
              </Link>
            ))}

            {/* Quick Add Card */}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-ccj-red hover:bg-rose-50/20 dark:hover:bg-slate-800/40 p-5 flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-ccj-red dark:hover:text-rose-400 transition-all min-h-[160px]"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-rose-100 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold">Criar outro quadro</span>
            </button>
          </div>
        )}
      </div>

      <CreateBoardModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateBoard={handleCreateBoard}
      />
    </div>
  )
}
