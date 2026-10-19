import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { KanbanSquare, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react'

export const RegisterPage: React.FC = () => {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successNotice, setSuccessNotice] = useState(false)
  const [loading, setLoading] = useState(false)

  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!displayName.trim()) {
      setErrorMsg('Por favor, informe seu nome.')
      return
    }

    if (!email.trim() || !password) {
      setErrorMsg('Preencha todos os campos obrigatórios.')
      return
    }

    if (password.length < 6) {
      setErrorMsg('A senha deve ter no mínimo 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.')
      return
    }

    setLoading(true)
    const { data, error } = await signUp(email.trim(), password, displayName.trim())
    setLoading(false)

    if (error) {
      if (error.message.includes('already registered')) {
        setErrorMsg('Este e-mail já está cadastrado. Faça login ou recupere sua senha.')
      } else {
        setErrorMsg(error.message || 'Erro ao realizar cadastro.')
      }
      return
    }

    // Se a confirmação de e-mail estiver ativa no Supabase
    if (data?.user && !data.session) {
      setSuccessNotice(true)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-4">
          <KanbanSquare className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Crie sua conta no TaskFlow
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Comece a organizar suas tarefas e colaborar em tempo real
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-2xl border border-slate-200/80">
          {successNotice ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Conta criada com sucesso!</h3>
              <p className="text-sm text-slate-600">
                Se a confirmação de e-mail estiver ativada no seu Supabase, verifique sua caixa de entrada para ativar a conta.
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Ir para o Login
              </Button>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                  label="Seu Nome Completo"
                  type="text"
                  required
                  placeholder="Ex: Ana Silva"
                  leftIcon={<User className="w-4 h-4" />}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />

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

                <Input
                  label="Senha (mínimo 6 caracteres)"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <Input
                  label="Confirme a Senha"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full font-semibold"
                    isLoading={loading}
                  >
                    Criar Conta Gratuita
                  </Button>
                </div>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-xs sm:text-sm text-slate-600">
                  Já possui uma conta?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
                  >
                    Fazer login
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
