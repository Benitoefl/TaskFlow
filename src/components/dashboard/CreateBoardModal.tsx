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
  { name: 'Azul CCJ', hex: '#1b2d56' },
  { name: 'Vermelho CCJ', hex: '#d9232a' },
  { name: 'Ouro CCJ', hex: '#e8891d' },
  { name: 'Esmeralda', hex: '#10b981' },
  { name: 'Violeta', hex: '#8b5cf6' },
  { name: 'Céu Azul', hex: '#0ea5e9' },
  { name: 'Grafite', hex: '#475569' },
]

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
  isOpen,
  onClose,
  onCreateBoard,
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#1b2d56')
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
      await onCreateBoard(name.trim(), description.trim() || undefined, color)
      setName('')
      setDescription('')
      setColor('#1b2d56')
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
      description="Organize tarefas por setor, projeto ou evento do Colégio Coração de Jesus."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Nome do Quadro"
          type="text"
          placeholder="Ex: Suporte TI, Matrículas, Eventos..."
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<Layout className="w-4 h-4" />}
          error={errorMsg}
        />

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Descrição (Opcional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Qual é o objetivo principal deste quadro?"
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-ccj-navy dark:focus:border-indigo-500 focus:outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Color Picker */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            <span>Cor de Identificação</span>
          </label>
          <div className="flex items-center gap-2.5">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColor(c.hex)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none shadow-sm ring-offset-2 ring-slate-400"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              >
                {color === c.hex && <Check className="w-4 h-4 text-white stroke-[3]" />}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            className="bg-ccj-navy hover:bg-ccj-navy-light text-white font-bold"
          >
            Criar Quadro
          </Button>
        </div>
      </form>
    </Modal>
  )
}
