import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { BoardPage } from './pages/BoardPage'
import { ProfilePage } from './pages/ProfilePage'
import { MyTasksPage } from './pages/MyTasksPage'
import { CalendarPage } from './pages/CalendarPage'
import { CreateBoardModal } from './components/dashboard/CreateBoardModal'
import { supabase, isSupabaseConfigured } from './lib/supabase'
import { Board } from './types/database'

const AuthenticatedLayoutWrapper: React.FC = () => {
  const { user, profile, signOut } = useAuth()
  const [boards, setBoards] = useState<Board[]>([])
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false)

  const fetchSidebarBoards = async () => {
    if (!isSupabaseConfigured || !user) return
    try {
      const { data } = await supabase
        .from('boards')
        .select('*')
        .order('updated_at', { ascending: false })
      if (data) setBoards(data)
    } catch {
      // Ignora erro silencioso na sidebar
    }
  }

  useEffect(() => {
    fetchSidebarBoards()

    // Atualiza sidebar em tempo real caso um quadro seja criado/renomeado
    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('sidebar-boards-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'boards' },
          () => {
            fetchSidebarBoards()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  const handleCreateBoardFromSidebar = async (
    name: string,
    description?: string,
    color?: string
  ) => {
    const { data: newBoardId, error } = await supabase.rpc('create_board_with_defaults', {
      p_name: name,
      p_description: description || null,
      p_color: color || '#1b2d56',
    })
    if (error) throw error
    await fetchSidebarBoards()
    if (newBoardId) {
      window.location.href = `/board/${newBoardId}`
    }
    return newBoardId
  }

  return (
    <>
      <AppLayout
        boards={boards}
        userProfile={profile}
        onOpenCreateBoard={() => setIsCreateBoardOpen(true)}
        onSignOut={signOut}
      />
      <CreateBoardModal
        isOpen={isCreateBoardOpen}
        onClose={() => setIsCreateBoardOpen(false)}
        onCreateBoard={handleCreateBoardFromSidebar}
      />
    </>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AuthenticatedLayoutWrapper />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/my-tasks" element={<MyTasksPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/board/:id" element={<BoardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
