-- Drop the problematic complex RLS policy
DROP POLICY IF EXISTS "users_select_combined" ON public.users;

-- Create a simple policy for users to read their own profile
CREATE POLICY "Users can read their own profile" 
ON public.users 
FOR SELECT 
USING (id = auth.uid());

-- Create a separate policy for supervisors and managers to read team members
CREATE POLICY "Supervisors and managers can read team members" 
ON public.users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() 
    AND u.role IN ('supervisor', 'manager')
    AND u.team_id = users.team_id
  )
);