import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Board } from '../types/database'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { Skeleton } from '../components/ui/Skeleton'
import { CreateBoardModal } from '../components/dashboard/CreateBoardModal'
import {
  Plus,
  KanbanSquare,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
  Layout
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
      // Busca quadros dos quais o usuário é membro através da relação segura
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
      p_color: color || '#6366f1',
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
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>TaskFlow Cloud Gratuito</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Olá, {userFirstName}! 👋
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Bem-vindo ao seu espaço de trabalho. Crie quadros Kanban, organize suas tarefas e colabore em tempo real com sua equipe sem custos.
          </p>
        </div>

        <div className="z-10 shrink-0">
          <Button
            size="lg"
            variant="primary"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<Plus className="w-5 h-5" />}
            className="shadow-md shadow-indigo-200"
          >
            Novo Quadro
          </Button>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-50/50 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Boards Section */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Seus Quadros</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
              {boards.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : boards.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <KanbanSquare className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Você ainda não tem quadros</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              Crie seu primeiro quadro para começar a adicionar listas, cartões e convidar sua equipe.
            </p>
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={() => setIsCreateOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
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
                className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: board.color || '#6366f1' }}
                    />
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDateBR(board.updated_at)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {board.name}
                  </h3>

                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                    {board.description || 'Sem descrição definida.'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Abrir quadro</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}

            {/* Quick Add Card */}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 p-5 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-indigo-600 transition-all min-h-[160px]"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center">
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
