import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Avatar } from '../ui/Avatar'
import { BoardMember, UserRole } from '../../types/database'
import { UserPlus, Crown, User, Trash2, Mail, AlertCircle, CheckCircle2 } from 'lucide-react'

export interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  members: BoardMember[]
  currentUserRole: UserRole | null
  onAddMember: (email: string, role?: UserRole) => Promise<any>
  onRemoveMember: (userId: string) => Promise<void>
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  members,
  currentUserRole,
  onAddMember,
  onRemoveMember,
}) => {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('member')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const isOwner = currentUserRole === 'owner'

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!email.trim()) {
      setErrorMsg('Informe o e-mail do usuário.')
      return
    }

    setLoading(true)
    try {
      await onAddMember(email.trim(), role)
      setSuccessMsg(`Usuário adicionado com sucesso ao quadro!`)
      setEmail('')
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao adicionar membro.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (userId: string, name: string) => {
    if (confirm(`Remover "${name}" deste quadro?`)) {
      try {
        await onRemoveMember(userId)
      } catch (err: any) {
        alert(err.message || 'Erro ao remover membro.')
      }
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compartilhar Quadro"
      description="Convide colegas para colaborar em tempo real neste quadro."
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Invite Form (Visible to Owner) */}
        {isOwner ? (
          <form onSubmit={handleAddMember} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Adicionar por E-mail
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="colega@email.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="member">Membro</option>
                <option value="owner">Proprietário</option>
              </select>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                leftIcon={<UserPlus className="w-4 h-4" />}
                className="text-xs shrink-0"
              >
                Convidar
              </Button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}
          </form>
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            Apenas o <strong>proprietário</strong> do quadro pode adicionar ou remover membros.
          </div>
        )}

        {/* Members List */}
        <div>
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
            Membros Participantes ({members.length})
          </h4>

          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {members.map((m) => {
              const displayName = m.profile?.display_name || 'Usuário'
              const isMemberOwner = m.role === 'owner'

              return (
                <div key={m.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      name={displayName}
                      src={m.profile?.avatar_url}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {displayName}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        {isMemberOwner ? (
                          <>
                            <Crown className="w-3 h-3 text-amber-500" />
                            Proprietário
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 text-slate-400" />
                            Membro
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Remove button (Only owner can remove other members) */}
                  {isOwner && !isMemberOwner && (
                    <button
                      type="button"
                      onClick={() => handleRemove(m.user_id, displayName)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remover do quadro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
