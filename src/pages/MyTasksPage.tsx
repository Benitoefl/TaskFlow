import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Task, TaskPriority } from '../types/database'
import { getPriorityBadge, formatDateBR } from '../lib/utils'
import { Skeleton } from '../components/ui/Skeleton'
import {
  CheckSquare,
  Search,
  Calendar,
  ArrowRight,
  Clock,
  AlertCircle,
  Filter,
  CheckCircle2,
  Circle,
  Kanban
} from 'lucide-react'

interface MyTaskItem extends Task {
  boardName: string
  boardColor: string
  boardId: string
  listName: string
}

export const MyTasksPage: React.FC = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<MyTaskItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all')

  const fetchMyTasks = async () => {
    if (!isSupabaseConfigured || !user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // 1. Busca todos os quadros em que o usuário participa
      const { data: userBoards, error: boardsError } = await supabase
        .from('board_members')
        .select(`
          board_id,
          boards:boards!board_id (id, name, color)
        `)
        .eq('user_id', user.id)

      if (boardsError) throw boardsError

      const boardsMap: Record<string, { name: string; color: string }> = {}
      const boardIds: string[] = []

      ;(userBoards || []).forEach((item: any) => {
        const b = Array.isArray(item.boards) ? item.boards[0] : item.boards
        if (b) {
          boardsMap[b.id] = { name: b.name, color: b.color || '#1b2d56' }
          boardIds.push(b.id)
        }
      })

      if (boardIds.length === 0) {
        setTasks([])
        setLoading(false)
        return
      }

      // 2. Busca todas as listas desses quadros
      const { data: listsData, error: listsError } = await supabase
        .from('lists')
        .select('id, board_id, name')
        .in('board_id', boardIds)

      if (listsError) throw listsError

      const listsMap: Record<string, { name: string; boardId: string }> = {}
      const listIds: string[] = []

      ;(listsData || []).forEach((l) => {
        listsMap[l.id] = { name: l.name, boardId: l.board_id }
        listIds.push(l.id)
      })

      if (listIds.length === 0) {
        setTasks([])
        setLoading(false)
        return
      }

      // 3. Busca todas as tarefas atribuídas ao usuário nessas listas
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('assignee_id', user.id)
        .in('list_id', listIds)
        .order('created_at', { ascending: false })

      if (tasksError) throw tasksError

      const mappedTasks: MyTaskItem[] = (tasksData || []).map((t) => {
        const listInfo = listsMap[t.list_id]
        const boardId = listInfo ? listInfo.boardId : ''
        const boardInfo = boardsMap[boardId] || { name: 'Quadro', color: '#1b2d56' }

        return {
          ...t,
          boardId,
          boardName: boardInfo.name,
          boardColor: boardInfo.color,
          listName: listInfo ? listInfo.name : 'Lista',
        }
      })

      setTasks(mappedTasks)
    } catch (err) {
      console.error('Erro ao carregar minhas tarefas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyTasks()
  }, [user])

  const isCompleted = (task: MyTaskItem) => {
    return task.listName.toLowerCase().includes('conclu')
  }

  const isOverdue = (task: MyTaskItem) => {
    if (!task.due_date) return false
    if (isCompleted(task)) return false
    const due = new Date(task.due_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return due < today
  }

  const filteredTasks = tasks.filter((task) => {
    // Busca por texto
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchesTitle = task.title.toLowerCase().includes(q)
      const matchesBoard = task.boardName.toLowerCase().includes(q)
      const matchesDesc = (task.description || '').toLowerCase().includes(q)
      if (!matchesTitle && !matchesBoard && !matchesDesc) return false
    }

    // Filtros de status
    if (activeFilter === 'pending') return !isCompleted(task)
    if (activeFilter === 'completed') return isCompleted(task)
    if (activeFilter === 'overdue') return isOverdue(task)
    return true
  })

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => !isCompleted(t)).length,
    completed: tasks.filter((t) => isCompleted(t)).length,
    overdue: tasks.filter((t) => isOverdue(t)).length,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-ccj-navy/10 dark:bg-ccj-navy/40 text-ccj-navy dark:text-indigo-400">
              <CheckSquare className="w-5 h-5 text-ccj-red" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Minhas Tarefas
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Todas as atividades atribuídas a você nos quadros do Colégio Coração de Jesus
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar tarefas ou quadros..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-ccj-navy dark:focus:ring-indigo-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 shadow-subtle"
          />
        </div>
      </div>

      {/* Metric Cards & Filter Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => setActiveFilter('all')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeFilter === 'all'
              ? 'bg-ccj-navy text-white border-ccj-navy shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-semibold uppercase tracking-wider block opacity-80">
            Total
          </span>
          <span className="text-2xl font-bold mt-1 block">{stats.total}</span>
        </button>

        <button
          onClick={() => setActiveFilter('pending')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeFilter === 'pending'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-semibold uppercase tracking-wider block opacity-80">
            Em Aberto
          </span>
          <span className="text-2xl font-bold mt-1 block text-amber-500 active:text-white">
            {stats.pending}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('overdue')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeFilter === 'overdue'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-semibold uppercase tracking-wider block opacity-80">
            Atrasadas
          </span>
          <span className="text-2xl font-bold mt-1 block text-rose-500 active:text-white">
            {stats.overdue}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('completed')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeFilter === 'completed'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-semibold uppercase tracking-wider block opacity-80">
            Concluídas
          </span>
          <span className="text-2xl font-bold mt-1 block text-emerald-500 active:text-white">
            {stats.completed}
          </span>
        </button>
      </div>

      {/* Task List Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <CheckSquare className="w-6 h-6 text-ccj-navy dark:text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Nenhuma tarefa encontrada
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {searchQuery
                ? 'Nenhum resultado corresponde à sua pesquisa.'
                : 'Quando alguém atribuir uma tarefa a você nos quadros, ela aparecerá automaticamente nesta lista.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredTasks.map((task) => {
              const priorityInfo = getPriorityBadge(task.priority)
              const overdue = isOverdue(task)
              const completed = isCompleted(task)

              return (
                <div
                  key={task.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Left: Checkmark & Title & Board badge */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="mt-0.5 text-slate-400 shrink-0">
                      {completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                      )}
                    </span>

                    <div className="min-w-0">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {task.title}
                      </h4>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        {/* Board Indicator */}
                        <span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: task.boardColor }}
                          />
                          <span className="truncate max-w-[120px]">{task.boardName}</span>
                        </span>

                        <span className="text-slate-300 dark:text-slate-700">•</span>

                        {/* List column tag */}
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                          {task.listName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Priority, Due Date & Direct Link */}
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    {/* Priority badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${priorityInfo.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dot}`} />
                      {priorityInfo.label}
                    </span>

                    {/* Due Date */}
                    {task.due_date ? (
                      <span
                        className={`flex items-center gap-1 text-xs font-medium ${
                          overdue
                            ? 'text-rose-600 dark:text-rose-400 font-semibold'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                        title={overdue ? 'Tarefa Atrasada!' : 'Prazo de entrega'}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDateBR(task.due_date)}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-600 italic">
                        Sem prazo
                      </span>
                    )}

                    {/* Link to Board */}
                    <Link
                      to={`/board/${task.boardId}`}
                      className="p-1.5 text-slate-400 hover:text-ccj-navy dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Ver no Quadro Kanban"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
