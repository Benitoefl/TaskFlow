export type UserRole = 'owner' | 'member'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  email?: string | null
  created_at: string
  updated_at: string
}

export interface Board {
  id: string
  name: string
  description: string | null
  color: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface BoardMember {
  id: string
  board_id: string
  user_id: string
  role: UserRole
  created_at: string
  profile?: Profile
}

export interface BoardList {
  id: string
  board_id: string
  name: string
  position: number
  created_at: string
  updated_at: string
}

export interface Label {
  id: string
  board_id: string
  name: string
  color: string
  created_at?: string
}

export interface Task {
  id: string
  list_id: string
  title: string
  description: string | null
  assignee_id: string | null
  due_date: string | null
  priority: TaskPriority
  position: number
  created_at: string
  updated_at: string
  assignee?: Profile | null
  labels?: Label[]
}

export interface BoardDetails extends Board {
  members: BoardMember[]
  lists: (BoardList & { tasks: Task[] })[]
  labels: Label[]
}
