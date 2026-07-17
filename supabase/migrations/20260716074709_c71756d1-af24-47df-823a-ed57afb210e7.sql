
CREATE TYPE public.app_role AS ENUM ('employee','reviewer','manager','administrator');
CREATE TYPE public.decision_status AS ENUM ('draft','under_review','approved','rejected','archived');

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teams TO authenticated;
GRANT ALL ON public.teams TO service_role;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_teams_updated BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  job_title TEXT,
  bio TEXT,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role); $$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role='administrator'); $$;

CREATE OR REPLACE FUNCTION public.can_manage_decisions(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role IN ('manager','administrator')); $$;

CREATE TABLE public.decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  status public.decision_status NOT NULL DEFAULT 'draft',
  evaluation_criteria TEXT,
  risks TEXT,
  final_decision TEXT,
  outcome TEXT,
  version INT NOT NULL DEFAULT 1,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decisions TO authenticated;
GRANT ALL ON public.decisions TO service_role;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_decisions_updated BEFORE UPDATE ON public.decisions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_decisions_created_by ON public.decisions(created_by);
CREATE INDEX idx_decisions_status ON public.decisions(status);

CREATE TABLE public.alternatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  pros TEXT,
  cons TEXT,
  estimated_cost NUMERIC,
  feasibility TEXT,
  risk_level TEXT,
  is_selected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alternatives TO authenticated;
GRANT ALL ON public.alternatives TO service_role;
ALTER TABLE public.alternatives ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_alternatives_updated BEFORE UPDATE ON public.alternatives FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_comments_updated BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attachments TO authenticated;
GRANT ALL ON public.attachments TO service_role;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.decision_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  version INT NOT NULL,
  snapshot JSONB NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  change_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.decision_versions TO authenticated;
GRANT ALL ON public.decision_versions TO service_role;
ALTER TABLE public.decision_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles readable" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "admins update any profile" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "teams readable" ON public.teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage teams" ON public.teams FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "decisions readable" ON public.decisions FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated create decisions" ON public.decisions FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "owner or manager updates" ON public.decisions FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.can_manage_decisions(auth.uid()))
  WITH CHECK (created_by = auth.uid() OR public.can_manage_decisions(auth.uid()));
CREATE POLICY "owner or admin deletes" ON public.decisions FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "alternatives readable" ON public.alternatives FOR SELECT TO authenticated USING (true);
CREATE POLICY "alternatives write" ON public.alternatives FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.decisions d WHERE d.id = decision_id AND (d.created_by = auth.uid() OR public.can_manage_decisions(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.decisions d WHERE d.id = decision_id AND (d.created_by = auth.uid() OR public.can_manage_decisions(auth.uid()))));

CREATE POLICY "comments readable" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "add comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "edit own comments" ON public.comments FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "delete own comments" ON public.comments FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "attachments readable" ON public.attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "attachments upload" ON public.attachments FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid() AND EXISTS (SELECT 1 FROM public.decisions d WHERE d.id = decision_id AND (d.created_by = auth.uid() OR public.can_manage_decisions(auth.uid()))));
CREATE POLICY "attachments delete" ON public.attachments FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "versions readable" ON public.decision_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "versions insert" ON public.decision_versions FOR INSERT TO authenticated
  WITH CHECK (changed_by = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'employee');
  IF (SELECT count(*) FROM public.user_roles WHERE role='administrator') = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'administrator');
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.snapshot_decision_version()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (OLD.title, OLD.problem_statement, OLD.category, OLD.status, OLD.evaluation_criteria, OLD.risks, OLD.final_decision, OLD.outcome)
     IS DISTINCT FROM (NEW.title, NEW.problem_statement, NEW.category, NEW.status, NEW.evaluation_criteria, NEW.risks, NEW.final_decision, NEW.outcome) THEN
    INSERT INTO public.decision_versions (decision_id, version, snapshot, changed_by)
    VALUES (OLD.id, OLD.version, to_jsonb(OLD), COALESCE(auth.uid(), OLD.created_by));
    NEW.version = OLD.version + 1;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_decisions_version BEFORE UPDATE ON public.decisions
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_decision_version();

CREATE POLICY "auth read decision docs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'decision-docs');
CREATE POLICY "auth upload decision docs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'decision-docs' AND owner = auth.uid());
CREATE POLICY "auth delete own decision docs" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'decision-docs' AND owner = auth.uid());
