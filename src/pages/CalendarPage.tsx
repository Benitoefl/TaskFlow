import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Task } from '../types/database'
import { getPriorityBadge } from '../lib/utils'
import { Avatar } from '../components/ui/Avatar'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRight,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface CalendarTask extends Task {
  boardName: string
  boardColor: string
  boardId: string
  listName: string
  assigneeName?: string | null
  assigneeAvatar?: string | null
}

interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
}

type ViewMode = 'day' | 'week' | 'month' | 'year'

// ─── Constants ───────────────────────────────────────────────────────────────

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const monthNamesShort = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const daysOfWeekFull = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isSameDay = (a: Date, b: Date) =>
  a.getDate() === b.getDate() &&
  a.getMonth() === b.getMonth() &&
  a.getFullYear() === b.getFullYear()

const getWeekStart = (date: Date) => {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

const formatDateStr = (d: number, m: number, y: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

const formatFullDate = (date: Date) =>
  date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

// ─── TaskPill ─────────────────────────────────────────────────────────────────

interface TaskPillProps {
  task: CalendarTask
  compact?: boolean
  expanded?: boolean
}

const TaskPill: React.FC<TaskPillProps> = ({ task, compact = false, expanded = false }) => {
  const priorityInfo = getPriorityBadge(task.priority)

  if (expanded) {
    // Card style for Day view
    return (
      <Link
        to={`/board/${task.boardId}`}
        title={`${task.title} — ${task.boardName} / ${task.listName}`}
        className="group flex items-start gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-700
          bg-white dark:bg-slate-800/80 hover:shadow-md dark:hover:bg-slate-700
          transition-all text-left w-full"
      >
        {/* Left color bar */}
        <span
          className="w-1 self-stretch rounded-full shrink-0"
          style={{ backgroundColor: task.boardColor }}
        />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate mb-1">
            {task.title}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <ArrowRight className="w-3 h-3" />
              {task.boardName}
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span>{task.listName}</span>
            {task.due_date && (
              <>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(task.due_date).toLocaleDateString('pt-BR')}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${priorityInfo.bg}`}>
            {priorityInfo.label}
          </span>
          {(task.assigneeName || task.assigneeAvatar) && (
            <Avatar
              src={task.assigneeAvatar}
              name={task.assigneeName}
              size="sm"
              className="ring-2 ring-white dark:ring-slate-700"
            />
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/board/${task.boardId}`}
      title={`${task.title} — ${task.boardName} / ${task.listName}`}
      className="group flex items-center gap-1.5 p-1.5 rounded-lg border border-slate-200/90 dark:border-slate-700
        bg-slate-50 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-700
        transition-all text-left shadow-sm w-full overflow-hidden"
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: task.boardColor }}
      />
      <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 truncate flex-1 min-w-0">
        {task.title}
      </p>
      {(task.assigneeName || task.assigneeAvatar) && (
        <Avatar
          src={task.assigneeAvatar}
          name={task.assigneeName}
          size="xs"
          className="shrink-0 ring-1 ring-white dark:ring-slate-700"
        />
      )}
      {!compact && (
        <span className={`text-[9px] font-bold px-1 rounded shrink-0 ${priorityInfo.bg}`}>
          {priorityInfo.label}
        </span>
      )}
    </Link>
  )
}

// ─── Day View ─────────────────────────────────────────────────────────────────

interface DayViewProps {
  currentDate: Date
  tasks: CalendarTask[]
}

const DayView: React.FC<DayViewProps> = ({ currentDate, tasks }) => {
  const today = new Date()
  const isToday = isSameDay(currentDate, today)

  const dateStr = formatDateStr(
    currentDate.getDate(),
    currentDate.getMonth(),
    currentDate.getFullYear()
  )
  const dayTasks = tasks.filter((t) => t.due_date?.startsWith(dateStr))

  const dayIndex = currentDate.getDay()

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
      {/* Day header */}
      <div className={`px-8 py-6 border-b border-slate-200 dark:border-slate-800 ${
        isToday ? 'bg-indigo-50/60 dark:bg-ccj-navy/20' : 'bg-slate-50/70 dark:bg-slate-950/40'
      }`}>
        <div className="flex items-center gap-4">
          {/* Day number bubble */}
          <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-sm ${
            isToday
              ? 'bg-ccj-red text-white'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
          }`}>
            <span className="text-2xl font-extrabold leading-none">{currentDate.getDate()}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
              {monthNamesShort[currentDate.getMonth()]}
            </span>
          </div>

          <div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white capitalize">
              {daysOfWeekFull[dayIndex]}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
              {isToday && (
                <span className="ml-2 text-xs font-bold bg-ccj-red/10 dark:bg-rose-900/30 text-ccj-red dark:text-rose-400 px-2 py-0.5 rounded-full">
                  Hoje
                </span>
              )}
            </p>
          </div>

          <div className="ml-auto text-right">
            <p className="text-3xl font-extrabold text-slate-800 dark:text-white">{dayTasks.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {dayTasks.length === 1 ? 'tarefa' : 'tarefas'}
            </p>
          </div>
        </div>
      </div>

      {/* Tasks list */}
      <div className="p-6 space-y-3">
        {dayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <CalendarIcon className="w-6 h-6 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Nenhuma tarefa com prazo neste dia
            </p>
          </div>
        ) : (
          dayTasks.map((t) => <TaskPill key={t.id} task={t} expanded />)
        )}
      </div>
    </div>
  )
}

// ─── Week View ────────────────────────────────────────────────────────────────

interface WeekViewProps {
  currentDate: Date
  tasks: CalendarTask[]
}

const WeekView: React.FC<WeekViewProps> = ({ currentDate, tasks }) => {
  const today = new Date()
  const weekStart = getWeekStart(currentDate)

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const getTasksForDate = (date: Date) => {
    const dateStr = formatDateStr(date.getDate(), date.getMonth(), date.getFullYear())
    return tasks.filter((t) => t.due_date?.startsWith(dateStr))
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
        {weekDays.map((date, idx) => {
          const isToday = isSameDay(date, today)
          return (
            <div
              key={idx}
              className={`py-3 px-2 text-center border-r last:border-r-0 border-slate-100 dark:border-slate-800 ${
                idx === 0 || idx === 6 ? 'bg-rose-50/50 dark:bg-rose-950/10' : ''
              }`}
            >
              <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${
                idx === 0 || idx === 6
                  ? 'text-ccj-red dark:text-rose-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                {daysOfWeek[idx]}
              </p>
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                isToday
                  ? 'bg-ccj-red text-white shadow-sm'
                  : 'text-slate-800 dark:text-slate-100'
              }`}>
                {date.getDate()}
              </span>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                {monthNamesShort[date.getMonth()]}
              </p>
            </div>
          )
        })}
      </div>

      {/* Body */}
      <div className="grid grid-cols-7 divide-x divide-slate-100 dark:divide-slate-800/80 min-h-[400px]">
        {weekDays.map((date, idx) => {
          const dayTasks = getTasksForDate(date)
          const isToday = isSameDay(date, today)

          return (
            <div
              key={idx}
              className={`p-2 flex flex-col gap-1 transition-colors ${
                isToday ? 'bg-indigo-50/40 dark:bg-ccj-navy/20' : ''
              } ${idx === 0 || idx === 6 ? 'bg-rose-50/20 dark:bg-rose-950/5' : ''}`}
            >
              {dayTasks.length === 0 ? (
                <p className="text-[10px] text-slate-300 dark:text-slate-700 text-center mt-4 select-none">
                  —
                </p>
              ) : (
                dayTasks.map((t) => <TaskPill key={t.id} task={t} />)
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Month View ───────────────────────────────────────────────────────────────

interface MonthViewProps {
  currentDate: Date
  tasks: CalendarTask[]
}

const MonthView: React.FC<MonthViewProps> = ({ currentDate, tasks }) => {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const today = new Date()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const calendarDays: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = []

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({ day: d, month, year, isCurrentMonth: true })
  }

  const remaining = 42 - calendarDays.length
  for (let d = 1; d <= remaining; d++) {
    calendarDays.push({
      day: d,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    })
  }

  const getTasksForDay = (d: number, m: number, y: number) => {
    const dateStr = formatDateStr(d, m, y)
    return tasks.filter((t) => t.due_date?.startsWith(dateStr))
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-center py-3">
        {daysOfWeek.map((day, idx) => (
          <div
            key={day}
            className={`text-xs font-bold uppercase tracking-wider ${
              idx === 0 || idx === 6
                ? 'text-ccj-red dark:text-rose-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/80">
        {calendarDays.map((cell, index) => {
          const dayTasks = getTasksForDay(cell.day, cell.month, cell.year)
          const isTodayCell = isSameDay(new Date(cell.year, cell.month, cell.day), today)

          return (
            <div
              key={index}
              className={`min-h-[110px] sm:min-h-[130px] p-2 flex flex-col transition-colors ${
                cell.isCurrentMonth
                  ? 'bg-white dark:bg-slate-900'
                  : 'bg-slate-50/50 dark:bg-slate-950/30 opacity-40'
              } ${isTodayCell ? '!bg-indigo-50/40 dark:!bg-ccj-navy/20' : ''}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                  isTodayCell
                    ? 'bg-ccj-red text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {cell.day}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {dayTasks.length}
                  </span>
                )}
              </div>
              <div className="space-y-1 flex-1 overflow-y-auto max-h-[90px]">
                {dayTasks.map((t) => (
                  <TaskPill key={t.id} task={t} compact />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Year View ────────────────────────────────────────────────────────────────

interface YearViewProps {
  currentDate: Date
  tasks: CalendarTask[]
  onSelectMonth: (month: number) => void
}

const YearView: React.FC<YearViewProps> = ({ currentDate, tasks, onSelectMonth }) => {
  const year = currentDate.getFullYear()
  const today = new Date()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }, (_, monthIdx) => {
        const firstDay = new Date(year, monthIdx, 1).getDay()
        const daysInMonth = new Date(year, monthIdx + 1, 0).getDate()
        const isCurrentMonth = today.getMonth() === monthIdx && today.getFullYear() === year

        const taskDays = new Set<number>()
        tasks.forEach((t) => {
          if (!t.due_date) return
          const d = new Date(t.due_date)
          if (d.getMonth() === monthIdx && d.getFullYear() === year) {
            taskDays.add(d.getDate())
          }
        })

        return (
          <button
            key={monthIdx}
            onClick={() => onSelectMonth(monthIdx)}
            className={`group bg-white dark:bg-slate-900 rounded-2xl border p-4 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 ${
              isCurrentMonth
                ? 'border-ccj-navy dark:border-indigo-500 shadow-md'
                : 'border-slate-200 dark:border-slate-800 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-bold ${
                isCurrentMonth
                  ? 'text-ccj-navy dark:text-indigo-400'
                  : 'text-slate-700 dark:text-slate-200'
              }`}>
                {monthNames[monthIdx]}
              </span>
              {taskDays.size > 0 && (
                <span className="text-[10px] font-bold bg-ccj-red/10 dark:bg-rose-900/30 text-ccj-red dark:text-rose-400 px-1.5 py-0.5 rounded-full">
                  {taskDays.size}d
                </span>
              )}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[8px] text-slate-400 dark:text-slate-600 font-semibold">
                  {d}
                </div>
              ))}
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const isToday =
                  today.getDate() === day &&
                  today.getMonth() === monthIdx &&
                  today.getFullYear() === year
                const hasTask = taskDays.has(day)

                return (
                  <div
                    key={day}
                    className={`relative w-full aspect-square flex items-center justify-center rounded-sm text-[9px] font-medium ${
                      isToday
                        ? 'bg-ccj-red text-white rounded-full'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {day}
                    {hasTask && !isToday && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-ccj-navy dark:bg-indigo-400" />
                    )}
                  </div>
                )
              })}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const CalendarPage: React.FC = () => {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month') // ← Mês como padrão
  const [tasks, setTasks] = useState<CalendarTask[]>([])
  const [loading, setLoading] = useState(true)

  // ── Data Fetching ──────────────────────────────────────────────────────────

  const fetchCalendarTasks = async () => {
    if (!isSupabaseConfigured || !user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const { data: userBoards, error: boardsError } = await supabase
        .from('board_members')
        .select(`board_id, boards:boards!board_id (id, name, color)`)
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

      if (boardIds.length === 0) { setTasks([]); setLoading(false); return }

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

      if (listIds.length === 0) { setTasks([]); setLoading(false); return }

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .not('due_date', 'is', null)
        .in('list_id', listIds)

      if (tasksError) throw tasksError

      // Fetch assignee profiles separately (avoids PostgREST schema cache error)
      const assigneeIds = [
        ...new Set((tasksData || []).map((t: any) => t.assignee_id).filter(Boolean)),
      ]

      const profilesMap: Record<string, Profile> = {}

      if (assigneeIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', assigneeIds)

        ;(profilesData || []).forEach((p: Profile) => {
          profilesMap[p.id] = p
        })
      }

      const mappedTasks: CalendarTask[] = (tasksData || []).map((t: any) => {
        const listInfo = listsMap[t.list_id]
        const boardId = listInfo ? listInfo.boardId : ''
        const boardInfo = boardsMap[boardId] || { name: 'Quadro', color: '#1b2d56' }
        const profile = t.assignee_id ? profilesMap[t.assignee_id] : null

        return {
          ...t,
          boardId,
          boardName: boardInfo.name,
          boardColor: boardInfo.color,
          listName: listInfo ? listInfo.name : 'Lista',
          assigneeName: profile?.display_name ?? null,
          assigneeAvatar: profile?.avatar_url ?? null,
        }
      })

      setTasks(mappedTasks)
    } catch (err) {
      console.error('Erro ao carregar calendário:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCalendarTasks() }, [user])

  // ── Navigation ─────────────────────────────────────────────────────────────

  const navigate = (direction: -1 | 1) => {
    if (viewMode === 'day') {
      setCurrentDate((d) => { const n = new Date(d); n.setDate(d.getDate() + direction); return n })
    } else if (viewMode === 'week') {
      setCurrentDate((d) => { const n = new Date(d); n.setDate(d.getDate() + direction * 7); return n })
    } else if (viewMode === 'month') {
      setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + direction, 1))
    } else {
      setCurrentDate((d) => new Date(d.getFullYear() + direction, d.getMonth(), 1))
    }
  }

  const goToToday = () => setCurrentDate(new Date())

  // ── Header label ───────────────────────────────────────────────────────────

  const getHeaderLabel = () => {
    const y = currentDate.getFullYear()
    const m = currentDate.getMonth()

    if (viewMode === 'year') return `${y}`
    if (viewMode === 'month') return `${monthNames[m]} ${y}`
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('pt-BR', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
      })
    }
    // week
    const ws = getWeekStart(currentDate)
    const we = new Date(ws); we.setDate(ws.getDate() + 6)
    const sameMonth = ws.getMonth() === we.getMonth()
    if (sameMonth) {
      return `${ws.getDate()}–${we.getDate()} de ${monthNames[ws.getMonth()]} ${ws.getFullYear()}`
    }
    return `${ws.getDate()} ${monthNamesShort[ws.getMonth()]} – ${we.getDate()} ${monthNamesShort[we.getMonth()]} ${we.getFullYear()}`
  }

  // ── Year: click month → switch to month view ───────────────────────────────
  const handleSelectMonth = (monthIdx: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIdx, 1))
    setViewMode('month')
  }

  // ── Period task count (status bar) ─────────────────────────────────────────
  const periodTaskCount = (() => {
    const y = currentDate.getFullYear()
    const m = currentDate.getMonth()

    if (viewMode === 'year') {
      return tasks.filter((t) => t.due_date && new Date(t.due_date).getFullYear() === y).length
    }
    if (viewMode === 'month') {
      return tasks.filter((t) => {
        const d = t.due_date ? new Date(t.due_date) : null
        return d && d.getFullYear() === y && d.getMonth() === m
      }).length
    }
    if (viewMode === 'day') {
      const dateStr = formatDateStr(currentDate.getDate(), m, y)
      return tasks.filter((t) => t.due_date?.startsWith(dateStr)).length
    }
    // week
    const ws = getWeekStart(currentDate)
    const we = new Date(ws); we.setDate(ws.getDate() + 7)
    return tasks.filter((t) => {
      if (!t.due_date) return false
      const d = new Date(t.due_date)
      return d >= ws && d < we
    }).length
  })()

  // ── View mode buttons (ordered: Dia → Semana → Mês → Ano) ─────────────────
  const viewModes: { key: ViewMode; label: string }[] = [
    { key: 'day',   label: 'Dia' },
    { key: 'week',  label: 'Semana' },
    { key: 'month', label: 'Mês' },
    { key: 'year',  label: 'Ano' },
  ]

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        {/* Title */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-ccj-navy/10 dark:bg-ccj-navy/40">
              <CalendarIcon className="w-5 h-5 text-ccj-red" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Calendário de Prazos
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {loading
              ? 'Carregando tarefas…'
              : `${periodTaskCount} ${periodTaskCount === 1 ? 'tarefa' : 'tarefas'} no período`}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">

          {/* View mode toggle — Dia | Semana | Mês | Ano */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 shadow-sm">
            {viewModes.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === key
                    ? 'bg-ccj-navy dark:bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Today */}
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            Hoje
          </button>

          {/* Prev / Label / Next */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 shadow-sm">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Período anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 px-3 min-w-[150px] text-center">
              {getHeaderLabel()}
            </span>
            <button
              onClick={() => navigate(1)}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Próximo período"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-ccj-navy/30 dark:border-indigo-500/30 border-t-ccj-navy dark:border-t-indigo-400 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {viewMode === 'day'   && <DayView   currentDate={currentDate} tasks={tasks} />}
          {viewMode === 'week'  && <WeekView  currentDate={currentDate} tasks={tasks} />}
          {viewMode === 'month' && <MonthView currentDate={currentDate} tasks={tasks} />}
          {viewMode === 'year'  && (
            <YearView
              currentDate={currentDate}
              tasks={tasks}
              onSelectMonth={handleSelectMonth}
            />
          )}

          {/* Empty state */}
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <CalendarIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">
                Nenhum prazo encontrado
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                Adicione datas de entrega nas suas tarefas para que elas apareçam aqui no calendário.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
