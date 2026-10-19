import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Board, BoardList, BoardMember, Task, UserRole, Profile } from '../types/database'
import { RealtimeChannel } from '@supabase/supabase-js'

export function useBoard(boardId?: string) {
  const [board, setBoard] = useState<Board | null>(null)
  const [lists, setLists] = useState<(BoardList & { tasks: Task[] })[]>([])
  const [members, setMembers] = useState<BoardMember[]>([])
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(true)

  const channelRef = useRef<RealtimeChannel | null>(null)

  // Carrega todos os dados do quadro de forma consistente
  const loadBoardData = useCallback(async () => {
    if (!boardId || !isSupabaseConfigured) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // 1. Busca dados do quadro
      const { data: boardData, error: boardError } = await supabase
        .from('boards')
        .select('*')
        .eq('id', boardId)
        .single()

      if (boardError || !boardData) {
        throw new Error('Quadro não encontrado ou você não tem permissão para acessá-lo.')
      }

      setBoard(boardData)

      // 2. Busca membros da tabela board_members
      const { data: membersData, error: membersError } = await supabase
        .from('board_members')
        .select('id, board_id, user_id, role, created_at')
        .eq('board_id', boardId)

      if (membersError) {
        console.warn('Erro ao carregar membros:', membersError)
      }

      // 3. Busca perfis dos membros para evitar dependência de joins cruzados no schema cache
      const userIds = (membersData || []).map((m: any) => m.user_id)
      const profilesMap: Record<string, Profile> = {}

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, created_at, updated_at')
          .in('id', userIds)

        if (profilesData) {
          profilesData.forEach((p: Profile) => {
            profilesMap[p.id] = p
          })
        }
      }

      const formattedMembers: BoardMember[] = (membersData || []).map((m: any) => ({
        id: m.id,
        board_id: m.board_id,
        user_id: m.user_id,
        role: m.role as UserRole,
        created_at: m.created_at,
        profile: profilesMap[m.user_id] || {
          id: m.user_id,
          display_name: 'Membro',
          avatar_url: null,
          created_at: m.created_at,
          updated_at: m.created_at,
        },
      }))
      setMembers(formattedMembers)

      // Determina o papel do usuário logado
      const { data: authData } = await supabase.auth.getUser()
      const currentUserId = authData?.user?.id
      const myMembership = formattedMembers.find((m) => m.user_id === currentUserId)
      setCurrentUserRole(myMembership ? myMembership.role : null)

      // 4. Busca listas ordenadas por posição
      const { data: listsData, error: listsError } = await supabase
        .from('lists')
        .select('*')
        .eq('board_id', boardId)
        .order('position', { ascending: true })

      if (listsError) throw listsError

      // 5. Busca tarefas de todas as listas deste quadro
      const listIds = (listsData || []).map((l) => l.id)
      let tasksData: any[] = []

      if (listIds.length > 0) {
        const { data: fetchedTasks, error: tasksError } = await supabase
          .from('tasks')
          .select('id, list_id, title, description, assignee_id, due_date, priority, position, created_at, updated_at')
          .in('list_id', listIds)
          .order('position', { ascending: true })

        if (tasksError) throw tasksError
        tasksData = fetchedTasks || []
      }

      // Agrupa tarefas dentro das respectivas listas mapeando o perfil do responsável
      const structuredLists = (listsData || []).map((list) => ({
        ...list,
        tasks: tasksData
          .filter((t) => t.list_id === list.id)
          .map((t) => ({
            ...t,
            assignee: t.assignee_id ? profilesMap[t.assignee_id] || null : null,
          })),
      }))

      setLists(structuredLists)
    } catch (err: any) {
      console.error('Falha ao carregar quadro:', err)
      setError(err.message || 'Erro ao carregar os dados do quadro.')
    } finally {
      setIsLoading(false)
    }
  }, [boardId])

  useEffect(() => {
    loadBoardData()
  }, [loadBoardData])

  // Assinatura em Tempo Real (Supabase Realtime)
  useEffect(() => {
    if (!boardId || !isSupabaseConfigured) return

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    const channel = supabase
      .channel(`board-realtime-${boardId}`)
      // Escuta mudanças nas tarefas
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTask = payload.new as Task
            setLists((prev) =>
              prev.map((list) => {
                if (list.id === newTask.list_id) {
                  const exists = list.tasks.some((t) => t.id === newTask.id)
                  if (!exists) {
                    return { ...list, tasks: [...list.tasks, newTask] }
                  }
                }
                return list
              })
            )
          } else if (payload.eventType === 'UPDATE') {
            const updatedTask = payload.new as Task
            setLists((prev) =>
              prev.map((list) => {
                if (list.id === updatedTask.list_id) {
                  const exists = list.tasks.some((t) => t.id === updatedTask.id)
                  if (exists) {
                    return {
                      ...list,
                      tasks: list.tasks.map((t) =>
                        t.id === updatedTask.id ? { ...t, ...updatedTask } : t
                      ),
                    }
                  } else {
                    return { ...list, tasks: [...list.tasks, updatedTask] }
                  }
                } else {
                  return {
                    ...list,
                    tasks: list.tasks.filter((t) => t.id !== updatedTask.id),
                  }
                }
              })
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id
            setLists((prev) =>
              prev.map((list) => ({
                ...list,
                tasks: list.tasks.filter((t) => t.id !== deletedId),
              }))
            )
          }
        }
      )
      // Escuta mudanças nas listas
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lists',
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newList = { ...(payload.new as BoardList), tasks: [] }
            setLists((prev) => {
              if (prev.some((l) => l.id === newList.id)) return prev
              return [...prev, newList]
            })
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as BoardList
            setLists((prev) =>
              prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l))
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id
            setLists((prev) => prev.filter((l) => l.id !== deletedId))
          }
        }
      )
      // Escuta membros adicionados/removidos
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'board_members',
          filter: `board_id=eq.${boardId}`,
        },
        () => {
          loadBoardData()
        }
      )
      // Escuta atualizações do quadro
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'boards',
          filter: `id=eq.${boardId}`,
        },
        (payload) => {
          setBoard(payload.new as Board)
        }
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED')
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [boardId, loadBoardData])

  // Ações de Listas
  const createList = async (name: string) => {
    if (!boardId || !name.trim()) return
    const position = lists.length

    try {
      const { data, error } = await supabase
        .from('lists')
        .insert({
          board_id: boardId,
          name: name.trim(),
          position,
        })
        .select()
        .single()

      if (error) throw error

      setLists((prev) => [...prev, { ...data, tasks: [] }])
    } catch (err: any) {
      console.error('Erro ao criar lista:', err)
      throw err
    }
  }

  const updateListName = async (listId: string, name: string) => {
    if (!name.trim()) return
    try {
      setLists((prev) =>
        prev.map((l) => (l.id === listId ? { ...l, name: name.trim() } : l))
      )

      const { error } = await supabase
        .from('lists')
        .update({ name: name.trim() })
        .eq('id', listId)

      if (error) throw error
    } catch (err: any) {
      console.error('Erro ao renomear lista:', err)
      loadBoardData()
    }
  }

  const deleteList = async (listId: string) => {
    try {
      setLists((prev) => prev.filter((l) => l.id !== listId))
      const { error } = await supabase.from('lists').delete().eq('id', listId)
      if (error) throw error
    } catch (err: any) {
      console.error('Erro ao excluir lista:', err)
      loadBoardData()
    }
  }

  // Ações de Tarefas
  const createTask = async (
    listId: string,
    taskData: {
      title: string
      description?: string
      priority?: 'low' | 'medium' | 'high'
      due_date?: string | null
      assignee_id?: string | null
    }
  ) => {
    if (!taskData.title.trim()) return

    const targetList = lists.find((l) => l.id === listId)
    const position = targetList ? targetList.tasks.length : 0

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          list_id: listId,
          title: taskData.title.trim(),
          description: taskData.description?.trim() || null,
          priority: taskData.priority || 'medium',
          due_date: taskData.due_date || null,
          assignee_id: taskData.assignee_id || null,
          position,
        })
        .select('id, list_id, title, description, assignee_id, due_date, priority, position, created_at, updated_at')
        .single()

      if (error) throw error

      const assigneeMember = members.find((m) => m.user_id === data.assignee_id)

      const formattedTask: Task = {
        ...data,
        assignee: assigneeMember ? assigneeMember.profile : null,
      }

      setLists((prev) =>
        prev.map((l) =>
          l.id === listId ? { ...l, tasks: [...l.tasks, formattedTask] } : l
        )
      )

      return formattedTask
    } catch (err: any) {
      console.error('Erro ao criar tarefa:', err)
      throw err
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      setLists((prev) =>
        prev.map((list) => ({
          ...list,
          tasks: list.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
        }))
      )

      const updatePayload: any = { ...updates, updated_at: new Date().toISOString() }
      delete updatePayload.assignee
      delete updatePayload.labels

      const { error } = await supabase
        .from('tasks')
        .update(updatePayload)
        .eq('id', taskId)

      if (error) throw error
    } catch (err: any) {
      console.error('Erro ao atualizar tarefa:', err)
      loadBoardData()
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      setLists((prev) =>
        prev.map((list) => ({
          ...list,
          tasks: list.tasks.filter((t) => t.id !== taskId),
        }))
      )

      const { error } = await supabase.from('tasks').delete().eq('id', taskId)
      if (error) throw error
    } catch (err: any) {
      console.error('Erro ao excluir tarefa:', err)
      loadBoardData()
    }
  }

  const moveTask = async (
    taskId: string,
    sourceListId: string,
    targetListId: string,
    newPosition: number
  ) => {
    setLists((prev) => {
      const sourceList = prev.find((l) => l.id === sourceListId)
      if (!sourceList) return prev

      const taskToMove = sourceList.tasks.find((t) => t.id === taskId)
      if (!taskToMove) return prev

      const updatedTask = { ...taskToMove, list_id: targetListId, position: newPosition }

      return prev.map((l) => {
        if (l.id === sourceListId && sourceListId === targetListId) {
          const remainingTasks = l.tasks.filter((t) => t.id !== taskId)
          remainingTasks.splice(newPosition, 0, updatedTask)
          return { ...l, tasks: remainingTasks }
        }

        if (l.id === sourceListId) {
          return { ...l, tasks: l.tasks.filter((t) => t.id !== taskId) }
        }

        if (l.id === targetListId) {
          const targetTasks = [...l.tasks]
          targetTasks.splice(newPosition, 0, updatedTask)
          return { ...l, tasks: targetTasks }
        }

        return l
      })
    })

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          list_id: targetListId,
          position: newPosition,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)

      if (error) throw error
    } catch (err: any) {
      console.error('Erro ao persistir movimentação da tarefa:', err)
      loadBoardData()
    }
  }

  // Ações de Compartilhamento
  const addMemberByEmail = async (email: string, role: UserRole = 'member') => {
    if (!boardId || !email.trim()) return
    try {
      const { data, error } = await supabase.rpc('add_member_by_email', {
        p_board_id: boardId,
        p_email: email.trim(),
        p_role: role,
      })

      if (error) throw error

      await loadBoardData()
      return data
    } catch (err: any) {
      console.error('Erro ao adicionar membro:', err)
      throw err
    }
  }

  const removeMember = async (userId: string) => {
    if (!boardId) return
    try {
      const { error } = await supabase
        .from('board_members')
        .delete()
        .eq('board_id', boardId)
        .eq('user_id', userId)

      if (error) throw error

      setMembers((prev) => prev.filter((m) => m.user_id !== userId))
    } catch (err: any) {
      console.error('Erro ao remover membro:', err)
      throw err
    }
  }

  const deleteBoard = async () => {
    if (!boardId) return
    try {
      const { error } = await supabase.from('boards').delete().eq('id', boardId)
      if (error) throw error
    } catch (err: any) {
      console.error('Erro ao excluir quadro:', err)
      throw err
    }
  }

  return {
    board,
    lists,
    members,
    currentUserRole,
    isLoading,
    error,
    isRealtimeConnected,
    loadBoardData,
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
  }
}
