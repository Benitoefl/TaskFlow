import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Profile } from '../types/database'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isConfigured: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: AuthError | null; data?: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updateProfile: (updates: { display_name?: string; avatar_url?: string }) => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = async (userId: string, userEmail?: string) => {
    if (!isSupabaseConfigured) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.warn('Erro ao carregar perfil:', error.message)
      }

      if (data) {
        setProfile({
          ...data,
          email: userEmail || data.email,
        })
      } else {
        // Fallback temporário caso a trigger do profile ainda não tenha executado
        setProfile({
          id: userId,
          display_name: userEmail?.split('@')[0] || 'Usuário',
          avatar_url: null,
          email: userEmail,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
    } catch (err) {
      console.error('Falha ao buscar perfil:', err)
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false)
      return
    }

    // Obtém sessão ativa inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email)
      }
      setIsLoading(false)
    })

    // Escuta mudanças de autenticação (login, logout, refresh de token)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email)
      } else {
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: { message: 'Supabase não está configurado. Verifique o arquivo .env.' } as AuthError }
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!isSupabaseConfigured) {
      return { error: { message: 'Supabase não está configurado. Verifique o arquivo .env.' } as AuthError }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })
    return { data, error }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) return
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: { message: 'Supabase não está configurado. Verifique o arquivo .env.' } as AuthError }
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/profile`,
    })
    return { error }
  }

  const updateProfile = async (updates: { display_name?: string; avatar_url?: string }) => {
    if (!user || !isSupabaseConfigured) {
      return { error: new Error('Usuário não autenticado') }
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (!error) {
        setProfile((prev) => (prev ? { ...prev, ...updates } : null))
      }
      return { error }
    } catch (err: any) {
      return { error: err }
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider')
  }
  return context
}
