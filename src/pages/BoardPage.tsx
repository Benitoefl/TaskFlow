import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBoard } from '../hooks/useBoard'
import { ListColumn } from '../components/board/ListColumn'
import { TaskDetailModal } from '../components/board/TaskDetailModal'
import { ShareModal } from '../components/board/ShareModal'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { Task } from '../types/database'
import {
  Plus,
  Share2,
  Trash2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'

export const BoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    board,
    lists,
    members,
    currentUserRole,
    isLoading,
    error,
    isRealtimeConnected,
    createList,
    updateListName,
    deleteList,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    addMemberByEmail,
    removeMember,
    deleteBoard,
  } = useBoard(id)

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isAddingList, setIsAddingList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [draggedTaskInfo, setDraggedTaskInfo] = useState<{
    taskId: string
    sourceListId: string
  } | null>(null)

  const isOwner = currentUserRole === 'owner'

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newListName.trim()) return
    await createList(newListName.trim())
    setNewListName('')
    setIsAddingList(false)
  }

  const handleDragStart = (
    _e: React.DragEvent,
    taskId: string,
    sourceListId: string
  ) => {
    setDraggedTaskInfo({ taskId, sourceListId })
  }

  const handleTaskDrop = async (taskId: string, targetListId: string) => {
    if (!draggedTaskInfo) return
    const { sourceListId } = draggedTaskInfo

    const targetList = lists.find((l) => l.id === targetListId)
    const newPosition = targetList ? targetList.tasks.length : 0

    await moveTask(taskId, sourceListId, targetListId, newPosition)
    setDraggedTaskInfo(null)
  }

  const handleDeleteBoard = async () => {
    if (
      confirm(
        `ATENÇÃO: Deseja realmente excluir o quadro "${board?.name}"? Todas as listas e tarefas serão apagadas definitivamente.`
      )
    ) {
      await deleteBoard()
      navigate('/dashboard')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 h-full flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex gap-4 flex-1 overflow-hidden">
          <Skeleton className="w-80 h-full rounded-2xl" />
          <Skeleton className="w-80 h-full rounded-2xl" />
          <Skeleton className="w-80 h-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !board) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-center space-y-4 shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Acesso Negado ou Quadro Inexistente</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {error || 'Você não tem permissão para acessar este quadro ou ele foi excluído.'}
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="w-full bg-ccj-navy hover:bg-ccj-navy-light text-white font-bold"
          >
            Voltar para o Painel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Board Secondary Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="w-4 h-4 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: board.color || '#1b2d56' }}
          />
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate">
              {board.name}
            </h2>
            {board.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                {board.description}
              </p>
            )}
          </div>
        </div>

        {/* Members & Action buttons */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          {/* Member Avatars Stack */}
          <div className="flex items-center -space-x-1.5 overflow-hidden">
            {members.slice(0, 4).map((m) => (
              <Avatar
                key={m.id}
                name={m.profile?.display_name}
                src={m.profile?.avatar_url}
                size="sm"
                className="ring-2 ring-white dark:ring-slate-900"
              />
            ))}
            {members.length > 4 && (
              <span className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                +{members.length - 4}
              </span>
            )}
          </div>

          {/* Share Button */}
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Share2 className="w-3.5 h-3.5 text-ccj-red" />}
            onClick={() => setIsShareOpen(true)}
            className="text-xs font-semibold dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
          >
            Compartilhar ({members.length})
          </Button>

          {/* Delete Board Button (Only for Owner) */}
          {isOwner && (
            <button
              onClick={handleDeleteBoard}
              title="Excluir quadro permanentemente"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board Horizontal Scroll Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 sm:p-6 flex items-start gap-4">
        {lists.map((list) => (
          <ListColumn
            key={list.id}
            list={list}
            members={members}
            onUpdateTitle={updateListName}
            onDeleteList={deleteList}
            onCreateTask={async (listId, data) => {
              await createTask(listId, data)
            }}
            onSelectTask={(task) => setSelectedTask(task)}
            onTaskDrop={handleTaskDrop}
            onDragStart={handleDragStart}
          />
        ))}

        {/* Add List Column CTA / Form */}
        <div className="w-72 shrink-0">
          {isAddingList ? (
            <form
              onSubmit={handleCreateList}
              className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-card space-y-2.5"
            >
              <input
                type="text"
                autoFocus
                placeholder="Nome da lista (ex: Revisão)..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsAddingList(false)
                }}
                className="w-full text-sm font-semibold p-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-ccj-navy dark:focus:border-indigo-500"
              />
              <div className="flex items-center gap-2">
                <Button type="submit" size="sm" variant="primary" className="text-xs bg-ccj-navy hover:bg-ccj-navy-light text-white">
                  Adicionar Lista
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsAddingList(false)}
                  className="text-xs text-slate-500 dark:text-slate-400"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingList(true)}
              className="w-full py-3 px-4 bg-slate-200/60 dark:bg-slate-900/60 hover:bg-slate-200/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-ccj-red dark:hover:text-rose-400 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar outra lista</span>
            </button>
          )}
        </div>
      </div>

      {/* Task Details Modal */}
      <TaskDetailModal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        lists={lists}
        members={members}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
        onMoveTask={moveTask}
      />

      {/* Share / Member Management Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        members={members}
        currentUserRole={currentUserRole}
        onAddMember={addMemberByEmail}
        onRemoveMember={removeMember}
      />
    </div>
  )
}
