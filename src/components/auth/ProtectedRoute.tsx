import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { SetupNotice } from '../common/SetupNotice'
import { Loader2 } from 'lucide-react'

export const ProtectedRoute: React.FC = () => {
  const { user, isLoading, isConfigured } = useAuth()

  if (!isConfigured) {
    return <SetupNotice />
  }

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Carregando TaskFlow...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
