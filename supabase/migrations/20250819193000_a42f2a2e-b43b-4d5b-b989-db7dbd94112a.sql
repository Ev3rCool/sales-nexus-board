-- Enable RLS on teams table
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create helper function to get user's team ID
CREATE OR REPLACE FUNCTION public.get_user_team_id(user_id UUID)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT team_id FROM public.users WHERE id = user_id;
$$;

-- Create helper function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$;

-- Teams RLS policies
-- Policy 1: Users can view their own team
CREATE POLICY "Users can view their own team" 
ON public.teams 
FOR SELECT 
TO authenticated 
USING (id = public.get_user_team_id(auth.uid()));

-- Policy 2: Supervisors can view teams they supervise
CREATE POLICY "Supervisors can view teams they supervise" 
ON public.teams 
FOR SELECT 
TO authenticated 
USING (supervisor_id = auth.uid());

-- Policy 3: Managers can view all teams
CREATE POLICY "Managers can view all teams" 
ON public.teams 
FOR SELECT 
TO authenticated 
USING (public.get_user_role(auth.uid()) = 'manager');

-- Policy 4: Managers can manage all teams
CREATE POLICY "Managers can manage all teams" 
ON public.teams 
FOR ALL 
TO authenticated 
USING (public.get_user_role(auth.uid()) = 'manager')
WITH CHECK (public.get_user_role(auth.uid()) = 'manager');

-- Fix search_path security for existing functions
ALTER FUNCTION public.get_avatar_url(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_team_id(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_role(uuid) SET search_path = public;