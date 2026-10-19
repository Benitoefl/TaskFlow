import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { KanbanSquare, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!email.trim()) {
      setErrorMsg('Por favor, informe seu e-mail cadastrado.')
      return
    }

    setLoading(true)
    const { error } = await resetPassword(email.trim())
    setLoading(false)

    if (error) {
      setErrorMsg(error.message || 'Erro ao solicitar redefinição de senha.')
      return
    }

    setSuccess(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-4">
          <KanbanSquare className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Recuperação de Senha
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Enviaremos um link para você redefinir sua senha com segurança
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-2xl border border-slate-200/80">
          {success ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">E-mail enviado!</h3>
              <p className="text-sm text-slate-600">
                Se este e-mail estiver cadastrado, você receberá um link com as instruções para redefinir sua senha.
              </p>
              <div className="pt-2">
                <Link to="/login">
                  <Button variant="outline" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                    Voltar ao Login
                  </Button>
                </Link>
              </div>
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
                  label="Seu e-mail cadastrado"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="seu@email.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full font-semibold"
                    isLoading={loading}
                  >
                    Enviar Link de Recuperação
                  </Button>
                </div>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para o Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
