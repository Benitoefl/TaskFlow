import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Avatar } from '../components/ui/Avatar'
import { User, Mail, Calendar, CheckCircle2, AlertCircle, Save, Code2 } from 'lucide-react'
import { formatDateBR } from '../lib/utils'

export const ProfilePage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!displayName.trim()) {
      setMessage({ type: 'error', text: 'O nome de exibição não pode ficar vazio.' })
      return
    }

    setLoading(true)
    const { error } = await updateProfile({
      display_name: displayName.trim(),
      avatar_url: avatarUrl.trim() || undefined,
    })
    setLoading(false)

    if (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao atualizar perfil.' })
    } else {
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Configurações do Perfil
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Gerencie suas informações no TaskFlow do Colégio Coração de Jesus
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-subtle overflow-hidden">
        {/* Header banner CCJ gradient */}
        <div className="h-28 bg-gradient-to-r from-ccj-navy via-ccj-navy-light to-slate-900 px-6 sm:px-8 flex items-end">
          <div className="translate-y-8 flex items-end gap-4">
            <Avatar
              name={displayName || profile?.display_name || 'Usuário'}
              src={avatarUrl || profile?.avatar_url}
              size="lg"
              className="w-20 h-20 text-xl border-4 border-white dark:border-slate-900 shadow-md"
            />
          </div>
        </div>

        <div className="pt-12 px-6 sm:px-8 pb-8">
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
                message.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6 max-w-xl">
            <Input
              label="Nome de Exibição"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ex: Benito Lopes"
              leftIcon={<User className="w-4 h-4" />}
              helperText="Como os outros membros do colégio verão você nos cartões."
            />

            <Input
              label="E-mail da Conta"
              type="email"
              disabled
              value={user?.email || profile?.email || ''}
              leftIcon={<Mail className="w-4 h-4" />}
              helperText="Gerenciado com segurança pelo Supabase Auth."
              className="bg-slate-50 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
            />

            <Input
              label="URL do Avatar (Opcional)"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://exemplo.com/avatar.jpg"
              helperText="Deixe em branco para usar suas iniciais com fundo colorido."
            />

            <div className="pt-2 flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Membro desde: {formatDateBR(profile?.created_at || user?.created_at)}
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                leftIcon={<Save className="w-4 h-4" />}
                className="bg-ccj-navy hover:bg-ccj-navy-light text-white font-bold"
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Institutional Author Box */}
      <div className="bg-slate-100/70 dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/logo-ccj.png"
            alt="Colégio Coração de Jesus"
            className="h-10 w-auto object-contain shrink-0"
          />
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-ccj-red" />
              Projeto idealizado e desenvolvido por Benito Lopes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Setor de Tecnologia da Informação (TI) • Colégio Coração de Jesus
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
