
-- Drop the existing problematic RLS policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Disable RLS temporarily to fix the recursion issue
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive RLS policies
CREATE POLICY "Allow users to view their own profile" 
ON public.users 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Allow users to insert their own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (id = auth.uid());

CREATE POLICY "Allow users to update their own profile" 
ON public.users 
FOR UPDATE 
USING (id = auth.uid());
