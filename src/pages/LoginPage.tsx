import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { KanbanSquare, Mail, Lock, AlertCircle } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!email.trim() || !password) {
      setErrorMsg('Por favor, informe seu e-mail e senha.')
      return
    }

    setLoading(true)
    const { error } = await signIn(email.trim(), password)
    setLoading(false)

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setErrorMsg('E-mail ou senha incorretos. Verifique suas credenciais.')
      } else if (error.message.includes('Email not confirmed')) {
        setErrorMsg('Por favor, confirme seu e-mail antes de entrar (ou desative a confirmação de e-mail no painel do Supabase).')
      } else {
        setErrorMsg(error.message || 'Erro ao realizar login. Tente novamente.')
      }
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-4">
          <KanbanSquare className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Acesse o TaskFlow
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Gerenciamento visual e colaborativo de tarefas
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-2xl border border-slate-200/80">
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="E-mail"
              type="email"
              autoComplete="email"
              required
              placeholder="seu@email.com"
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div>
              <Input
                label="Senha"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex justify-end mt-1.5">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-semibold"
              isLoading={loading}
            >
              Entrar
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
              >
                Cadastre-se gratuitamente
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
