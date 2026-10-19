import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Avatar } from '../components/ui/Avatar'
import { User, Mail, Calendar, CheckCircle2, AlertCircle, Save } from 'lucide-react'
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configurações do Perfil</h1>
        <p className="text-sm text-slate-500 mt-1">
          Gerencie suas informações pessoais e visibilidade no TaskFlow
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        {/* Header banner */}
        <div className="h-28 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 px-6 sm:px-8 flex items-end">
          <div className="translate-y-8 flex items-end gap-4">
            <Avatar
              name={displayName || profile?.display_name || 'Usuário'}
              src={avatarUrl || profile?.avatar_url}
              size="lg"
              className="w-20 h-20 text-xl border-4 border-white shadow-md"
            />
          </div>
        </div>

        <div className="pt-12 px-6 sm:px-8 pb-8">
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
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
              placeholder="Ex: Ana Clara"
              leftIcon={<User className="w-4 h-4" />}
              helperText="Como outros membros do quadro verão você."
            />

            <Input
              label="E-mail da Conta"
              type="email"
              disabled
              value={user?.email || profile?.email || ''}
              leftIcon={<Mail className="w-4 h-4" />}
              helperText="Gerenciado pelo Supabase Auth."
              className="bg-slate-50 text-slate-500 cursor-not-allowed"
            />

            <Input
              label="URL do Avatar (Opcional)"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://exemplo.com/avatar.jpg"
              helperText="Deixe em branco para usar as iniciais automáticas com fundo colorido."
            />

            <div className="pt-2 flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Membro desde: {formatDateBR(profile?.created_at || user?.created_at)}
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
