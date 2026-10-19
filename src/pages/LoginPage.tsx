import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Mail, Lock, AlertCircle, Heart } from 'lucide-react'

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo do Colégio Coração de Jesus */}
        <div className="flex justify-center mb-4">
          <img
            src="/logo-ccj.png"
            alt="Colégio Coração de Jesus"
            className="h-16 w-auto object-contain drop-shadow-sm"
          />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Task<span className="text-ccj-red">Flow</span> CCJ
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 font-medium">
          Tecnologia da Informação • Colégio Coração de Jesus
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-card rounded-3xl border border-slate-200/80 dark:border-slate-800">
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
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
                  className="text-xs font-semibold text-ccj-navy dark:text-indigo-400 hover:text-ccj-red dark:hover:text-rose-400 hover:underline"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-semibold bg-ccj-navy hover:bg-ccj-navy-light text-white shadow-md"
              isLoading={loading}
            >
              Entrar no Sistema
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                className="font-bold text-ccj-navy dark:text-indigo-400 hover:text-ccj-red dark:hover:text-rose-400 hover:underline"
              >
                Cadastre-se gratuitamente
              </Link>
            </p>
          </div>
        </div>

        {/* Institutional Credits Footer */}
        <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          <p className="flex items-center justify-center gap-1">
            Desenvolvido por <strong className="text-slate-700 dark:text-slate-300">Benito Lopes</strong>
          </p>
          <p className="text-[11px] mt-0.5">Setor de Tecnologia da Informação • CCJ</p>
        </div>
      </div>
    </div>
  )
}
