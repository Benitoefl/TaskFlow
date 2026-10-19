import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Layout, Check, Palette } from 'lucide-react'

export interface CreateBoardModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateBoard: (name: string, description?: string, color?: string) => Promise<string | undefined>
}

const COLOR_PALETTE = [
  { name: 'Índigo', hex: '#6366f1' },
  { name: 'Violeta', hex: '#8b5cf6' },
  { name: 'Esmeralda', hex: '#10b981' },
  { name: 'Céu Azul', hex: '#0ea5e9' },
  { name: 'Âmbar', hex: '#f59e0b' },
  { name: 'Rosa Coral', hex: '#f43f5e' },
  { name: 'Grafite', hex: '#475569' },
]

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
  isOpen,
  onClose,
  onCreateBoard,
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setErrorMsg('Por favor, informe o nome do quadro.')
      return
    }

    setLoading(true)
    setErrorMsg('')
    try {
      const newBoardId = await onCreateBoard(name.trim(), description.trim() || undefined, color)
      setName('')
      setDescription('')
      setColor('#6366f1')
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao criar quadro.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Criar Novo Quadro"
      description="Organize suas tarefas e convide membros para colaborar."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Nome do Quadro"
          type="text"
          placeholder="Ex: Lançamento do Produto, Sprint 1..."
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<Layout className="w-4 h-4" />}
          error={errorMsg}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Descrição (Opcional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Qual é o objetivo principal deste quadro?"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-100 placeholder:text-slate-400"
          />
        </div>

        {/* Color Picker */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            <span>Cor de Identificação</span>
          </label>
          <div className="flex items-center gap-2.5">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColor(c.hex)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none shadow-sm"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              >
                {color === c.hex && <Check className="w-4 h-4 text-white stroke-[3]" />}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={loading}>
            Criar Quadro
          </Button>
        </div>
      </form>
    </Modal>
  )
}
