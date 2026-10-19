import React from 'react'
import { AlertCircle, Key, ExternalLink, Copy, Check } from 'lucide-react'
import { Button } from '../ui/Button'

export const SetupNotice: React.FC = () => {
  const [copied, setCopied] = React.useState(false)

  const copyEnvExample = () => {
    const text = `VITE_SUPABASE_URL=https://seu-projeto.supabase.co\nVITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-card border border-slate-200 p-6 sm:p-8">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Configuração do Supabase Necessária
        </h2>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Para que o <strong>TaskFlow</strong> funcione com autenticação, banco de dados PostgreSQL e sincronização em tempo real 100% gratuitos, você precisa conectar seu projeto Supabase.
        </p>

        <div className="mt-6 space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-sm space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <Key className="w-4 h-4 text-indigo-600" />
              <span>Passo a passo rápido (Custo R$ 0):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 pl-1">
              <li>
                Acesse o painel do Supabase em{' '}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 font-medium inline-flex items-center gap-0.5 hover:underline"
                >
                  supabase.com <ExternalLink className="w-3 h-3" />
                </a>{' '}
                e crie um novo projeto gratuito.
              </li>
              <li>Vá em <strong>Project Settings</strong> &rarr; <strong>API</strong>.</li>
              <li>Copie a <strong>Project URL</strong> e a <strong>anon public API key</strong>.</li>
              <li>
                Abra o arquivo <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono">.env</code> na raiz do projeto e insira as credenciais:
              </li>
            </ol>
          </div>

          <div className="relative bg-slate-900 rounded-xl p-4 text-slate-200 text-xs font-mono">
            <p className="text-emerald-400"># Arquivo .env</p>
            <p>VITE_SUPABASE_URL=https://[seu-projeto].supabase.co</p>
            <p>VITE_SUPABASE_ANON_KEY=eyJhbGciOi...</p>
            <button
              onClick={copyEnvExample}
              className="absolute top-3 right-3 p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Copiar modelo"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => window.location.reload()}
            variant="primary"
            className="w-full sm:w-auto"
          >
            Já configurei, recarregar página
          </Button>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto"
          >
            <Button variant="outline" className="w-full" rightIcon={<ExternalLink className="w-4 h-4" />}>
              Abrir Supabase Dashboard
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
