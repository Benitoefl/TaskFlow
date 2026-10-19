import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Task } from '../types/database'
import { getPriorityBadge } from '../lib/utils'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react'

interface CalendarTask extends Task {
  boardName: string
  boardColor: string
  boardId: string
  listName: string
}

export const CalendarPage: React.FC = () => {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<CalendarTask[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCalendarTasks = async () => {
    if (!isSupabaseConfigured || !user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // 1. Busca todos os quadros acessíveis ao usuário
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

      // 3. Busca tarefas que tenham due_date preenchida
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .not('due_date', 'is', null)
        .in('list_id', listIds)

      if (tasksError) throw tasksError

      const mappedTasks: CalendarTask[] = (tasksData || []).map((t) => {
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
      console.error('Erro ao carregar calendário:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCalendarTasks()
  }, [user])

  // Helpers de Calendário
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Gera a matriz de dias do mês atual
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const calendarDays = []

  // Dias do mês anterior para preencher a primeira semana
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    })
  }

  // Dias do mês atual
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({
      day: d,
      month,
      year,
      isCurrentMonth: true,
    })
  }

  // Dias do próximo mês para completar a grade de 35 ou 42 dias
  const remainingDays = 42 - calendarDays.length
  for (let d = 1; d <= remainingDays; d++) {
    calendarDays.push({
      day: d,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    })
  }

  const isToday = (d: number, m: number, y: number) => {
    const today = new Date()
    return today.getDate() === d && today.getMonth() === m && today.getFullYear() === y
  }

  const getTasksForDay = (d: number, m: number, y: number) => {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return tasks.filter((t) => {
      if (!t.due_date) return false
      return t.due_date.startsWith(dateStr)
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Calendar Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-ccj-navy/10 dark:bg-ccj-navy/40 text-ccj-navy dark:text-indigo-400">
              <CalendarIcon className="w-5 h-5 text-ccj-red" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Calendário de Prazos
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Acompanhe as entregas e compromissos de todas as tarefas em tempo real
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-subtle"
          >
            Hoje
          </button>
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 shadow-subtle">
            <button
              onClick={prevMonth}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 px-3 min-w-[140px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-center py-3">
          {daysOfWeek.map((day, idx) => (
            <div
              key={day}
              className={`text-xs font-bold uppercase tracking-wider ${
                idx === 0 || idx === 6 ? 'text-ccj-red dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 6 Weeks Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/80">
          {calendarDays.map((cell, index) => {
            const dayTasks = getTasksForDay(cell.day, cell.month, cell.year)
            const today = isToday(cell.day, cell.month, cell.year)

            return (
              <div
                key={index}
                className={`min-h-[110px] sm:min-h-[130px] p-2 flex flex-col justify-between transition-colors ${
                  cell.isCurrentMonth
                    ? 'bg-white dark:bg-slate-900'
                    : 'bg-slate-50/50 dark:bg-slate-950/30 opacity-40'
                } ${today ? 'bg-indigo-50/20 dark:bg-ccj-navy/20' : ''}`}
              >
                {/* Day number & indicator */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      today
                        ? 'bg-ccj-red text-white shadow-sm'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {cell.day}
                  </span>

                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {dayTasks.length} {dayTasks.length === 1 ? 'tarefa' : 'tarefas'}
                    </span>
                  )}
                </div>

                {/* Tasks inside this day */}
                <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[85px]">
                  {dayTasks.map((t) => {
                    const priorityInfo = getPriorityBadge(t.priority)

                    return (
                      <Link
                        key={t.id}
                        to={`/board/${t.boardId}`}
                        title={`${t.title} (${t.boardName} - ${t.listName})`}
                        className="group block p-1.5 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-700 transition-all text-left shadow-subtle"
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: t.boardColor }}
                          />
                          <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 truncate flex-1">
                            {t.title}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[9px] text-slate-400">
                          <span className="truncate max-w-[80px]">{t.boardName}</span>
                          <span className={`font-semibold ${priorityInfo.bg} px-1 rounded`}>
                            {priorityInfo.label}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
