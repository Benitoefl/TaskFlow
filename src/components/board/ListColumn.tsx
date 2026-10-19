import React, { useState } from 'react'
import { BoardList, Task, BoardMember } from '../../types/database'
import { TaskCard } from './TaskCard'
import { Button } from '../ui/Button'
import { Plus, MoreVertical, Trash2, Check, X } from 'lucide-react'

export interface ListColumnProps {
  list: BoardList & { tasks: Task[] }
  members: BoardMember[]
  onUpdateTitle: (listId: string, title: string) => Promise<void>
  onDeleteList: (listId: string) => Promise<void>
  onCreateTask: (listId: string, taskData: { title: string }) => Promise<void>
  onSelectTask: (task: Task) => void
  onTaskDrop: (taskId: string, targetListId: string) => void
  onDragStart: (e: React.DragEvent, taskId: string, sourceListId: string) => void
}

export const ListColumn: React.FC<ListColumnProps> = ({
  list,
  members,
  onUpdateTitle,
  onDeleteList,
  onCreateTask,
  onSelectTask,
  onTaskDrop,
  onDragStart,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(list.name)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSaveTitle = async () => {
    if (titleValue.trim() && titleValue.trim() !== list.name) {
      await onUpdateTitle(list.id, titleValue.trim())
    } else {
      setTitleValue(list.name)
    }
    setIsEditingTitle(false)
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    setIsSubmitting(true)
    try {
      await onCreateTask(list.id, { title: newTaskTitle.trim() })
      setNewTaskTitle('')
      setIsAddingTask(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (!isDragOver) setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'))
      if (data && data.taskId) {
        onTaskDrop(data.taskId, list.id)
      }
    } catch {
      // Fallback
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-72 sm:w-80 shrink-0 bg-slate-100/90 dark:bg-slate-900/90 rounded-3xl p-3 flex flex-col max-h-full border transition-colors ${
        isDragOver
          ? 'border-ccj-navy dark:border-indigo-400 bg-indigo-50/40 dark:bg-slate-800/80 ring-2 ring-indigo-200 dark:ring-indigo-900 ring-dashed'
          : 'border-slate-200/80 dark:border-slate-800 shadow-subtle'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1.5 py-1 mb-2.5">
        {isEditingTitle ? (
          <div className="flex items-center gap-1.5 w-full">
            <input
              type="text"
              autoFocus
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle()
                if (e.key === 'Escape') {
                  setTitleValue(list.name)
                  setIsEditingTitle(false)
                }
              }}
              className="w-full text-sm font-semibold px-2 py-1 bg-white dark:bg-slate-800 border border-ccj-navy dark:border-indigo-400 text-slate-900 dark:text-white rounded-lg focus:outline-none"
            />
            <button
              onClick={handleSaveTitle}
              className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded"
              title="Salvar"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setTitleValue(list.name)
                setIsEditingTitle(false)
              }}
              className="p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
              title="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingTitle(true)}
            className="flex items-center gap-2 cursor-pointer group py-1 px-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors flex-1 min-w-0"
          >
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{list.name}</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {list.tasks.length}
            </span>
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Opções da lista"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-modal border border-slate-200 dark:border-slate-700 py-1 z-30 text-xs">
              <button
                onClick={() => {
                  setShowMenu(false)
                  setIsEditingTitle(true)
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium"
              >
                Renomear Lista
              </button>
              <button
                onClick={() => {
                  setShowMenu(false)
                  if (confirm(`Tem certeza que deseja excluir a lista "${list.name}" e todas as suas tarefas?`)) {
                    onDeleteList(list.id)
                  }
                }}
                className="w-full px-3 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir Lista
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards List container with scroll */}
      <div className="flex-1 overflow-y-auto space-y-2.5 px-0.5 min-h-[50px]">
        {list.tasks.length === 0 && !isAddingTask && (
          <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-4 text-center text-xs text-slate-400 dark:text-slate-600 select-none">
            Nenhuma tarefa nesta lista
          </div>
        )}

        {list.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            members={members}
            onClick={() => onSelectTask(task)}
            onDragStart={onDragStart}
          />
        ))}

        {/* Inline Add Task Form */}
        {isAddingTask && (
          <form onSubmit={handleCreateTask} className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
            <textarea
              autoFocus
              placeholder="Digite o título desta tarefa..."
              rows={2}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleCreateTask(e)
                }
                if (e.key === 'Escape') setIsAddingTask(false)
              }}
              className="w-full text-xs sm:text-sm p-1.5 bg-transparent border-none resize-none focus:outline-none placeholder:text-slate-400 text-slate-900 dark:text-white"
            />
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700">
              <Button
                type="submit"
                size="sm"
                variant="primary"
                isLoading={isSubmitting}
                className="text-xs bg-ccj-navy hover:bg-ccj-navy-light text-white"
              >
                Adicionar Cartão
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setIsAddingTask(false)}
                className="text-xs text-slate-500 dark:text-slate-400"
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Column Footer: Quick Add Card Button */}
      {!isAddingTask && (
        <div className="pt-2 mt-1">
          <button
            onClick={() => setIsAddingTask(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-ccj-red dark:hover:text-rose-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Cartão
          </button>
        </div>
      )}
    </div>
  )
}
