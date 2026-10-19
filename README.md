# 🏫 TaskFlow CCJ — Gestão Colaborativa de Tarefas

> **TaskFlow CCJ** é uma aplicação web moderna inspirada na dinâmica visual e funcional do Trello/Kanban, desenvolvida para o **Colégio Coração de Jesus**.
> 
> **Idealização & Desenvolvimento**: **Benito Lopes** (Setor de Tecnologia da Informação — TI).
> **Custo Operacional**: **R$ 0 permanente** através de recursos gratuitos de alta disponibilidade (Supabase, Vercel, GitHub).

---

## 📋 Sumário
1. [Visão Geral & Recursos](#-visão-geral--recursos)
2. [Identidade Visual Institucional & Autoria](#-identidade-visual-institucional--autoria)
3. [Arquitetura & Tecnologias](#-arquitetura--tecnologias)
4. [Custo R$ 0 & Limites dos Planos Gratuitos](#-custo-r-0--limites-dos-planos-gratuitos)
5. [Instruções de Configuração no Supabase](#-instruções-de-configuração-no-supabase)
6. [Execução Local](#-execução-local)
7. [Publicação Gratuita na Vercel & GitHub](#-publicação-gratuita-na-vercel--github)
8. [Checklist de Segurança & RLS](#-checklist-de-segurança--rls)
9. [Checklist de Testes Colaborativos](#-checklist-de-testes-colaborativos)

---

## 🌟 Visão Geral & Recursos

- **Identidade do Colégio Coração de Jesus**: Logotipo oficial, cores institucionais (Azul Marinho e Vermelho Carmesim) e créditos da TI.
- **Modo Escuro / Claro (Dark & Light Mode)**: Alternador instantâneo com persistência de preferências visuais.
- **Aba "Minhas Tarefas"**: Painel consolidado que lista todas as tarefas atribuídas ao usuário logado em todos os quadros com filtros inteligentes (Em Aberto, Concluídas, Atrasadas).
- **Calendário Mensal de Prazos**: Visão de calendário interativa onde tarefas com data de entrega são automaticamente mapeadas nos dias correspondentes.
- **Quadros Kanban Interativos**: Crie, renomeie, personalize cores e organize múltiplos quadros por setor ou projeto.
- **Listas & Cartões com Drag and Drop**: Movimentação fluida de cartões entre colunas com persistência imediata na nuvem.
- **Colaboração em Tempo Real**: Atualizações automáticas de tarefas e listas via Supabase Realtime sem recarregar a página.
- **Compartilhamento Seguro**: Convide colegas por e-mail com papéis distintos (*Owner* e *Member*).
- **Atribuição & Prazos**: Defina prioridades (Baixa, Média, Alta), data de entrega e atribua responsáveis restritos aos membros do quadro.
- **100% em Português Brasileiro**: Datas, horários e termos localizados para `pt-BR`.


---

## 🛠 Arquitetura & Tecnologias

```
taskflow/
├── public/                 # Favicon e assets públicos
├── src/
│   ├── components/
│   │   ├── auth/           # ProtectedRoute, formulários
│   │   ├── board/          # ListColumn, TaskCard, TaskDetailModal, ShareModal
│   │   ├── common/         # SetupNotice (auxiliar de configuração)
│   │   ├── dashboard/      # CreateBoardModal
│   │   ├── layout/         # AppLayout, Navbar, Sidebar
│   │   └── ui/             # Button, Input, Modal, Avatar, Badge, Skeleton
│   ├── contexts/
│   │   └── AuthContext.tsx # Gestão de sessão, perfis e listeners Supabase Auth
│   ├── hooks/
│   │   └── useBoard.ts     # Hook do quadro com Supabase Realtime e CRUD otimista
│   ├── lib/
│   │   ├── supabase.ts     # Cliente Supabase singleton com checagem segura
│   │   └── utils.ts        # Formatadores pt-BR, cores e helper de classes
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── BoardPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   └── ProfilePage.tsx
│   ├── types/
│   │   └── database.ts     # Tipagem TypeScript espelhando tabelas PostgreSQL
│   ├── App.tsx             # Roteador React Router DOM v6
│   ├── main.tsx
│   └── index.css           # Tailwind base e scrollbars estilizadas
├── supabase/
│   ├── migrations/         # Migrations SQL versionadas
│   └── schema.sql          # Script consolidado para o SQL Editor do Supabase
├── .env.example            # Modelo de variáveis de ambiente
├── vercel.json             # Rewrites para SPA na Vercel
├── tailwind.config.js
└── package.json
```

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, React Router DOM.
- **Backend / BaaS**: Supabase (PostgreSQL 15+, Supabase Auth, Row Level Security, Realtime).
- **Hospedagem**: Vercel Hobby (Gratuito).

---

## 💰 Custo R$ 0 & Limites dos Planos Gratuitos

O TaskFlow foi projetado para operar com **custo zero permanente**, consumindo apenas frações dos limites dos planos gratuitos oficiais:

| Serviço | Plano Gratuito | Limites do Plano | Consumo Estimado pelo TaskFlow |
| :--- | :--- | :--- | :--- |
| **Supabase** | Free Tier | 500 MB de banco de dados, 50.000 usuários ativos mensais (MAU), 200 conexões Realtime simultâneas, 5 GB de tráfego de saída (egress). | Uma tarefa/quadro consome menos de 1 KB em JSON. 500 MB comportam centenas de milhares de tarefas. |
| **Vercel** | Hobby | 100 GB de largura de banda/mês, builds ilimitados para repositórios pessoais. | O bundle otimizado tem apenas ~170 KB comprimido via Gzip/Brotli. |
| **GitHub** | Free | Repositórios públicos ou privados ilimitados, 2.000 minutos/mês de Actions. | Versionamento e automação de deploy sem custos. |

> **Nota de Manutenção Gratuita**: No plano Supabase Free, projetos inativos por mais de 7 dias entram em pausa automática. Para reativá-los basta 1 clique no dashboard do Supabase ou uma requisição esporádica.

---

## ⚙️ Instruções de Configuração no Supabase

### Passo 1: Criar o Projeto Gratuito
1. Acesse [supabase.com](https://supabase.com) e faça login (com sua conta GitHub).
2. Clique em **"New Project"**, escolha a organização e preencha:
   - **Name**: `TaskFlow` (ou outro de sua preferência)
   - **Database Password**: Escolha uma senha segura e guarde-a.
   - **Region**: Selecione uma região próxima (ex: *South America (São Paulo)* ou *East US*).
   - **Pricing Plan**: Selecione o plano **Free ($0/month)**.
3. Aguarde cerca de 1 a 2 minutos até que a base de dados seja provisionada.

### Passo 2: Executar o Script do Banco de Dados
1. No menu lateral esquerdo do painel do Supabase, clique em **SQL Editor** (ícone `>_`).
2. Clique em **"New query"**.
3. Abra o arquivo [`supabase/schema.sql`](file:///c:/Users/DELL/Desktop/App%20de%20Tasks/supabase/schema.sql) deste projeto, copie todo o conteúdo e cole no editor do Supabase.
4. Clique no botão **"Run"** (ou aperte `Ctrl + Enter`).
5. Você verá a mensagem *"Success. No rows returned"*. Todas as tabelas, índices, triggers, funções RPC e políticas RLS foram criadas com sucesso!

### Passo 3: Copiar as Credenciais de API
1. No menu lateral esquerdo, vá em **Project Settings** (ícone de engrenagem) &rarr; **API**.
2. Localize:
   - **Project URL** (ex: `https://xyzcompany.supabase.co`)
   - **Project API Keys** &rarr; chave **`anon` `public`** (ex: `eyJhbGciOi...`).
   *(IMPORTANTE: NUNCA use a chave `service_role` no frontend)*.

### Passo 4: Configurar o Arquivo `.env` Local
Na pasta raiz do projeto, copie o arquivo `.env.example` para `.env` (ou edite o arquivo `.env` já criado) e insira as suas chaves:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica-aqui
```

---

## 💻 Execução Local

1. Abra o terminal na pasta do projeto:
```powershell
npm install
```

2. Inicie o servidor de desenvolvimento:
```powershell
npm run dev
```

3. Abra o navegador no endereço exibido (geralmente `http://localhost:5173`).

---

## 🌐 Publicação Gratuita na Vercel & GitHub

### 1. Criar Repositório no GitHub
```bash
git init
git add .
git commit -m "feat: TaskFlow MVP completo"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/taskflow.git
git push -u origin main
```

### 2. Conectar na Vercel
1. Acesse [vercel.com](https://vercel.com) e entre com sua conta GitHub.
2. Clique em **"Add New..."** &rarr; **"Project"**.
3. Importe o repositório `taskflow` que você acabou de subir.
4. Em **Environment Variables**, adicione as mesmas duas variáveis do seu `.env`:
   - `VITE_SUPABASE_URL` = `https://seu-projeto.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sua-chave-anon-publica`
5. Clique em **"Deploy"**.
6. Em menos de 1 minuto, a Vercel gerará sua URL pública gratuita (ex: `https://taskflow-seuusuario.vercel.app`).

> O arquivo `vercel.json` incluso no projeto já garante que as rotas internas como `/board/:id` e `/profile` funcionem perfeitamente em recarregamentos de página (SPA rewrites).

---

## 🛡️ Checklist de Segurança & RLS

- [x] **RLS Ativo**: Todas as tabelas (`profiles`, `boards`, `board_members`, `lists`, `tasks`, `labels`, `task_labels`) possuem Row Level Security habilitado.
- [x] **Prevenção de Recursão Infinita**: Checagens de permissão de membros utilizam funções `SECURITY DEFINER` (`is_board_member`, `is_board_owner`) com `SET search_path = public`, evitando loops recursivos na tabela `board_members`.
- [x] **Isolamento de Dados**: Usuários não autenticados não têm acesso a dados privados. Usuários autenticados só visualizam quadros dos quais são membros.
- [x] **Proteção de Destruição**: Apenas o usuário com papel `owner` pode excluir o quadro ou gerenciar membros. Membros comuns (`member`) podem criar e editar cartões, mas não excluir o quadro.
- [x] **Segredo de Chaves**: Nenhuma chave `service_role` foi exposta no código frontend. O frontend utiliza exclusivamente a chave pública `anon`.
- [x] **Prevenção de Vazamento de E-mails**: A adição de membros é mediada pela função RPC `add_member_by_email` executada no PostgreSQL, impedindo varredura de e-mails via queries diretas.

---

## 🧪 Checklist de Testes Colaborativos

Utilize duas janelas do navegador (ou uma normal e uma anônima) para testar os cenários com duas contas reais distintas (Usuário A e Usuário B):

- [ ] **Cenário 1 — Criação de conta e convite**:
  1. Usuário A se cadastra em `/register` e faz login.
  2. Usuário A cria um quadro "Sprint Alpha".
  3. Usuário B se cadastra com outro e-mail.
  4. Usuário A clica no botão "Compartilhar", digita o e-mail do Usuário B e clica em "Convidar".
  5. Usuário B é adicionado instantaneamente à lista de membros.

- [ ] **Cenário 2 — Criação e Edição em Tempo Real**:
  1. Usuário A cria a tarefa "Implementar Tela de Login" na coluna "A Fazer".
  2. Usuário B visualiza a nova tarefa aparecer na sua tela imediatamente sem recarregar.
  3. Usuário B clica no cartão e altera a prioridade para "Alta".
  4. Usuário A vê a etiqueta da tarefa mudar para "Alta" em tempo real.

- [ ] **Cenário 3 — Movimentação de Cartão (Drag & Drop)**:
  1. Usuário B arrasta o cartão de "A Fazer" para "Em Andamento".
  2. A posição é salva no PostgreSQL.
  3. Usuário A vê o cartão se mover para a coluna "Em Andamento".

- [ ] **Cenário 4 — Acesso Negado a Não-Membros**:
  1. Usuário C (uma terceira conta que não foi convidada para o quadro) tenta acessar a URL direta `http://localhost:5173/board/[id-do-quadro]`.
  2. O banco de dados Supabase via RLS bloqueia o retorno das linhas e o aplicativo exibe a tela de "Acesso Negado ou Quadro Inexistente".

- [ ] **Cenário 5 — Restrição de Ações Administrativas**:
  1. Usuário B (que é `member` e não `owner`) abre o modal de compartilhamento.
  2. Usuário B vê apenas a lista de participantes e uma notificação de que somente o proprietário pode convidar ou remover membros.
  3. Usuário B não tem o botão de excluir o quadro.

- [ ] **Cenário 6 — Persistência Multi-dispositivo**:
  1. Usuário A fecha o navegador, limpa a aba ou abre em outro dispositivo.
  2. Ao logar novamente, todos os quadros, listas, cartões e posições permanecem exatamente no mesmo estado.

- [ ] **Cenário 7 — Resiliência de Conexão**:
  1. Simule uma desconexão temporária (desative a rede no DevTools &rarr; Network &rarr; Offline).
  2. O indicador no topo informa o estado da conexão.
  3. Ao restabelecer a rede, os dados do quadro sincronizam sem duplicação de cartões.
