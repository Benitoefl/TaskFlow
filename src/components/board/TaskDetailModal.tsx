import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Avatar } from '../ui/Avatar'
import { Task, BoardList, BoardMember } from '../../types/database'
import { formatDateTimeBR } from '../../lib/utils'
import {
  Calendar,
  User,
  Flag,
  Columns,
  Trash2,
  Clock,
  Check,
  AlignLeft,
  X
} from 'lucide-react'

export interface TaskDetailModalProps {
  task: Task | null
  lists: BoardList[]
  members: BoardMember[]
  isOpen: boolean
  onClose: () => void
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  onDeleteTask: (taskId: string) => Promise<void>
  onMoveTask: (taskId: string, sourceListId: string, destListId: string, newPos: number) => Promise<void>
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  lists,
  members,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
}) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate] = useState('')
  const [assigneeId, setAssigneeId] = useState<string | null>(null)
  const [currentListId, setCurrentListId] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setPriority(task.priority || 'medium')
      setDueDate(task.due_date ? task.due_date.substring(0, 10) : '')
      setAssigneeId(task.assignee_id || null)
      setCurrentListId(task.list_id || '')
      setHasChanges(false)
    }
  }, [task])

  if (!task) return null

  const handleFieldChange = () => {
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!title.trim()) return
    setIsSaving(true)
    try {
      // Se a lista mudou
      if (currentListId !== task.list_id) {
        await onMoveTask(task.id, task.list_id, currentListId, 0)
      }

      await onUpdateTask(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        assignee_id: assigneeId || null,
      })
      setHasChanges(false)
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir esta tarefa permanentemente?')) {
      await onDeleteTask(task.id)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-6">
        {/* Header with Title and Delete Button */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
              Detalhes do Cartão
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                handleFieldChange()
              }}
              placeholder="Título da tarefa..."
              className="w-full text-lg sm:text-xl font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none py-1 transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={handleDelete}
            title="Excluir tarefa"
            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Grid Properties (List, Priority, Due Date, Assignee) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/70 text-xs sm:text-sm">
          {/* Column / List selector */}
          <div>
            <label className="flex items-center gap-1.5 font-semibold text-slate-600 mb-1.5">
              <Columns className="w-4 h-4 text-slate-400" />
              <span>Lista</span>
            </label>
            <select
              value={currentListId}
              onChange={(e) => {
                setCurrentListId(e.target.value)
                handleFieldChange()
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-indigo-500"
            >
              {lists.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority selector */}
          <div>
            <label className="flex items-center gap-1.5 font-semibold text-slate-600 mb-1.5">
              <Flag className="w-4 h-4 text-slate-400" />
              <span>Prioridade</span>
            </label>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value as any)
                handleFieldChange()
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-indigo-500"
            >
              <option value="low">🟢 Baixa</option>
              <option value="medium">🟡 Média</option>
              <option value="high">🔴 Alta</option>
            </select>
          </div>

          {/* Assignee selector (Restricted to board members) */}
          <div>
            <label className="flex items-center gap-1.5 font-semibold text-slate-600 mb-1.5">
              <User className="w-4 h-4 text-slate-400" />
              <span>Responsável</span>
            </label>
            <select
              value={assigneeId || ''}
              onChange={(e) => {
                setAssigneeId(e.target.value || null)
                handleFieldChange()
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Nenhum responsável</option>
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.profile?.display_name || 'Membro do quadro'}
                </option>
              ))}
            </select>
          </div>

          {/* Due date picker */}
          <div>
            <label className="flex items-center gap-1.5 font-semibold text-slate-600 mb-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Data de Entrega</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value)
                handleFieldChange()
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Description Section */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            <AlignLeft className="w-4 h-4 text-slate-400" />
            <span>Descrição da Tarefa</span>
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              handleFieldChange()
            }}
            placeholder="Adicione mais detalhes ou instruções sobre esta tarefa..."
            className="w-full p-3 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors placeholder:text-slate-400"
          />
        </div>

        {/* Timestamps */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Criado: {formatDateTimeBR(task.created_at)}
          </span>
          <span>Atualizado: {formatDateTimeBR(task.updated_at)}</span>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} size="sm">
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Salvar Alterações
          </Button>
        </div>
      </div>
    </Modal>
  )
}
