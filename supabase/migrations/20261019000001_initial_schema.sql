-- ==============================================================================
-- TaskFlow — Migration Inicial do Banco de Dados PostgreSQL & RLS (Supabase)
-- Custo: R$ 0 (Totalmente compatível com Supabase Free Tier)
-- ==============================================================================

-- 1. TABELA PROFILES (VINCULADA AO AUTH.USERS)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger para criar perfil automaticamente no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. TABELA BOARDS (QUADROS)
CREATE TABLE IF NOT EXISTS public.boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1' NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);


-- 3. TABELA BOARD_MEMBERS (MEMBROS DO QUADRO)
CREATE TABLE IF NOT EXISTS public.board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_board_user UNIQUE (board_id, user_id)
);


-- 4. TABELA LISTS (COLUNAS KANBAN)
CREATE TABLE IF NOT EXISTS public.lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);


-- 5. TABELA TASKS (CARTÕES DE TAREFAS)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);


-- 6. TABELA LABELS (ETIQUETAS DO QUADRO)
CREATE TABLE IF NOT EXISTS public.labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);


-- 7. TABELA TASK_LABELS (RELAÇÃO N:N)
CREATE TABLE IF NOT EXISTS public.task_labels (
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.labels(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, label_id)
);


-- ÍNDICES DE PERFORMANCE (Requisito 10)
CREATE INDEX IF NOT EXISTS idx_boards_owner ON public.boards(owner_id);
CREATE INDEX IF NOT EXISTS idx_board_members_board ON public.board_members(board_id);
CREATE INDEX IF NOT EXISTS idx_board_members_user ON public.board_members(user_id);
CREATE INDEX IF NOT EXISTS idx_lists_board ON public.lists(board_id);
CREATE INDEX IF NOT EXISTS idx_lists_position ON public.lists(board_id, position);
CREATE INDEX IF NOT EXISTS idx_tasks_list ON public.tasks(list_id);
CREATE INDEX IF NOT EXISTS idx_tasks_position ON public.tasks(list_id, position);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_labels_board ON public.labels(board_id);


-- ==============================================================================
-- FUNÇÕES AUXILIARES DE SEGURANÇA (SECURITY DEFINER sem recursão RLS)
-- ==============================================================================

-- Verifica se usuário é membro ou owner do quadro
CREATE OR REPLACE FUNCTION public.is_board_member(p_board_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.board_members
    WHERE board_id = p_board_id AND user_id = p_user_id
  );
$$;

-- Verifica se usuário é o owner do quadro
CREATE OR REPLACE FUNCTION public.is_board_owner(p_board_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.boards
    WHERE id = p_board_id AND owner_id = p_user_id
  );
$$;

-- Obtém o board_id de uma lista
CREATE OR REPLACE FUNCTION public.get_list_board_id(p_list_id UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT board_id FROM public.lists WHERE id = p_list_id;
$$;


-- ==============================================================================
-- POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_labels ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES
CREATE POLICY "Qualquer usuário autenticado pode ver perfis"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuário pode atualizar apenas seu próprio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- 2. BOARDS
CREATE POLICY "Membros podem visualizar seus quadros"
  ON public.boards FOR SELECT
  TO authenticated
  USING (public.is_board_member(id, auth.uid()));

CREATE POLICY "Usuários autenticados podem criar quadros"
  ON public.boards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Apenas membros podem atualizar dados do quadro"
  ON public.boards FOR UPDATE
  TO authenticated
  USING (public.is_board_member(id, auth.uid()))
  WITH CHECK (public.is_board_member(id, auth.uid()));

CREATE POLICY "Apenas o proprietário pode excluir o quadro"
  ON public.boards FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);


-- 3. BOARD_MEMBERS
CREATE POLICY "Membros podem ver outros membros do mesmo quadro"
  ON public.board_members FOR SELECT
  TO authenticated
  USING (public.is_board_member(board_id, auth.uid()));

CREATE POLICY "Proprietário pode adicionar membros"
  ON public.board_members FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_board_owner(board_id, auth.uid()) 
    OR 
    (auth.uid() = user_id AND role = 'owner') -- Para auto-registro do criador
  );

CREATE POLICY "Proprietário pode remover membros (exceto a si mesmo)"
  ON public.board_members FOR DELETE
  TO authenticated
  USING (
    public.is_board_owner(board_id, auth.uid()) 
    OR 
    (auth.uid() = user_id AND role != 'owner') -- Membro pode sair do quadro
  );


-- 4. LISTS
CREATE POLICY "Membros do quadro podem ver as listas"
  ON public.lists FOR SELECT
  TO authenticated
  USING (public.is_board_member(board_id, auth.uid()));

CREATE POLICY "Membros do quadro podem criar listas"
  ON public.lists FOR INSERT
  TO authenticated
  WITH CHECK (public.is_board_member(board_id, auth.uid()));

CREATE POLICY "Membros do quadro podem atualizar listas"
  ON public.lists FOR UPDATE
  TO authenticated
  USING (public.is_board_member(board_id, auth.uid()))
  WITH CHECK (public.is_board_member(board_id, auth.uid()));

CREATE POLICY "Membros do quadro podem excluir listas"
  ON public.lists FOR DELETE
  TO authenticated
  USING (public.is_board_member(board_id, auth.uid()));


-- 5. TASKS
CREATE POLICY "Membros do quadro podem ver as tarefas"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (public.is_board_member(public.get_list_board_id(list_id), auth.uid()));

CREATE POLICY "Membros do quadro podem criar tarefas"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (public.is_board_member(public.get_list_board_id(list_id), auth.uid()));

CREATE POLICY "Membros do quadro podem atualizar tarefas"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (public.is_board_member(public.get_list_board_id(list_id), auth.uid()))
  WITH CHECK (public.is_board_member(public.get_list_board_id(list_id), auth.uid()));

CREATE POLICY "Membros do quadro podem excluir tarefas"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (public.is_board_member(public.get_list_board_id(list_id), auth.uid()));


-- 6. LABELS
CREATE POLICY "Membros do quadro podem ver etiquetas"
  ON public.labels FOR SELECT
  TO authenticated
  USING (public.is_board_member(board_id, auth.uid()));

CREATE POLICY "Membros do quadro podem gerenciar etiquetas"
  ON public.labels FOR ALL
  TO authenticated
  USING (public.is_board_member(board_id, auth.uid()))
  WITH CHECK (public.is_board_member(board_id, auth.uid()));


-- 7. TASK_LABELS
CREATE POLICY "Membros do quadro podem ver e alterar relações de etiquetas"
  ON public.task_labels FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_labels.task_id
      AND public.is_board_member(public.get_list_board_id(t.list_id), auth.uid())
    )
  );


-- ==============================================================================
-- FUNÇÕES RPC SEGURAS PARA COMPARTILHAMENTO & SETUP (Requisito 6.5)
-- ==============================================================================

-- 1. Criação atômica de quadro com listas padrão e auto-admissão como 'owner'
CREATE OR REPLACE FUNCTION public.create_board_with_defaults(
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_color TEXT DEFAULT '#6366f1'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_board_id UUID;
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Insere o quadro
  INSERT INTO public.boards (name, description, color, owner_id)
  VALUES (p_name, p_description, p_color, v_user_id)
  RETURNING id INTO v_board_id;

  -- Adiciona o criador como membro com papel 'owner'
  INSERT INTO public.board_members (board_id, user_id, role)
  VALUES (v_board_id, v_user_id, 'owner');

  -- Cria listas padrão recomendadas
  INSERT INTO public.lists (board_id, name, position)
  VALUES 
    (v_board_id, 'A Fazer', 0),
    (v_board_id, 'Em Andamento', 1),
    (v_board_id, 'Concluído', 2);

  -- Cria etiquetas padrão úteis
  INSERT INTO public.labels (board_id, name, color)
  VALUES
    (v_board_id, 'Urgente', '#ef4444'),
    (v_board_id, 'Design', '#8b5cf6'),
    (v_board_id, 'Backend', '#3b82f6'),
    (v_board_id, 'Bug', '#f97316');

  RETURN v_board_id;
END;
$$;


-- 2. Adicionar membro por e-mail com verificação segura (sem vazar dados públicos)
CREATE OR REPLACE FUNCTION public.add_member_by_email(
  p_board_id UUID,
  p_email TEXT,
  p_role TEXT DEFAULT 'member'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_target_user_id UUID;
  v_target_name TEXT;
  v_target_avatar TEXT;
  v_new_member_id UUID;
BEGIN
  -- 1. Verifica se quem está chamando é o proprietário do quadro
  IF NOT public.is_board_owner(p_board_id, v_caller_id) THEN
    RAISE EXCEPTION 'Apenas o proprietário do quadro pode convidar membros.';
  END IF;

  -- 2. Busca o usuário correspondente ao e-mail informado
  SELECT id INTO v_target_user_id
  FROM auth.users
  WHERE LOWER(email) = LOWER(TRIM(p_email));

  IF v_target_user_id IS NULL THEN
    RAISE EXCEPTION 'Nenhuma conta encontrada com o e-mail informado. Peça para a pessoa se cadastrar no TaskFlow primeiro.';
  END IF;

  -- 3. Verifica se já é membro
  IF EXISTS (SELECT 1 FROM public.board_members WHERE board_id = p_board_id AND user_id = v_target_user_id) THEN
    RAISE EXCEPTION 'Este usuário já participa deste quadro.';
  END IF;

  -- 4. Adiciona o membro
  INSERT INTO public.board_members (board_id, user_id, role)
  VALUES (p_board_id, v_target_user_id, p_role)
  RETURNING id INTO v_new_member_id;

  -- 5. Busca os dados de exibição do perfil
  SELECT display_name, avatar_url
  INTO v_target_name, v_target_avatar
  FROM public.profiles
  WHERE id = v_target_user_id;

  RETURN jsonb_build_object(
    'id', v_new_member_id,
    'board_id', p_board_id,
    'user_id', v_target_user_id,
    'role', p_role,
    'email', p_email,
    'display_name', COALESCE(v_target_name, split_part(p_email, '@', 1)),
    'avatar_url', v_target_avatar
  );
END;
$$;


-- ==============================================================================
-- ATIVAÇÃO DO SUPABASE REALTIME (Requisito 6.6)
-- ==============================================================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.boards;
  EXCEPTION WHEN duplicate_object THEN END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.board_members;
  EXCEPTION WHEN duplicate_object THEN END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.lists;
  EXCEPTION WHEN duplicate_object THEN END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  EXCEPTION WHEN duplicate_object THEN END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.labels;
  EXCEPTION WHEN duplicate_object THEN END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.task_labels;
  EXCEPTION WHEN duplicate_object THEN END;
END $$;

-- 4. CONCESSÃO DE PRIVILÉGIOS (GRANTS PARA AS ROLES DO SUPABASE)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated;

