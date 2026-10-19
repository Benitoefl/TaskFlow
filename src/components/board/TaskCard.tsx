import React from 'react'
import { Task, BoardMember } from '../../types/database'
import { getPriorityBadge, formatDateBR } from '../../lib/utils'
import { Avatar } from '../ui/Avatar'
import { Calendar, AlignLeft, GripVertical } from 'lucide-react'

export interface TaskCardProps {
  task: Task
  members: BoardMember[]
  onClick: () => void
  onDragStart: (e: React.DragEvent, taskId: string, sourceListId: string) => void
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  members,
  onClick,
  onDragStart,
}) => {
  const priorityInfo = getPriorityBadge(task.priority)
  const assigneeMember = members.find((m) => m.user_id === task.assignee_id)
  const assigneeProfile = task.assignee || assigneeMember?.profile

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ taskId: task.id, listId: task.list_id }))
    e.dataTransfer.effectAllowed = 'move'
    onDragStart(e, task.id, task.list_id)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="group relative bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 shadow-card hover:shadow-card-hover border border-slate-200/80 dark:border-slate-700/80 cursor-pointer transition-all duration-150 select-none hover:border-ccj-navy dark:hover:border-indigo-400"
    >
      {/* Priority Pill & Drag handle */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${priorityInfo.bg}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dot}`} />
          {priorityInfo.label}
        </span>

        <GripVertical className="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" />
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
        {task.title}
      </h4>

      {/* Description Snippet indicator */}
      {task.description && (
        <div className="mt-1 flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs">
          <AlignLeft className="w-3.5 h-3.5" />
          <span className="line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">{task.description}</span>
        </div>
      )}

      {/* Card Footer: Due Date & Assignee */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          {task.due_date ? (
            <span
              className={`flex items-center gap-1 text-[11px] font-medium ${
                new Date(task.due_date) < new Date() ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {formatDateBR(task.due_date)}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Sem prazo</span>
          )}
        </div>

        {assigneeProfile ? (
          <Avatar
            name={assigneeProfile.display_name}
            src={assigneeProfile.avatar_url}
            size="xs"
            className="ring-1 ring-slate-200 dark:ring-slate-700"
          />
        ) : (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">Não atribuído</span>
        )}
      </div>
    </div>
  )
}
